import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { HABIT_ACTIONS, LOCALITIES } from '../data/localities';
import { evaluateAqi, evaluateSafetyRules } from '../utils/aqiEngine';
import type { HouseholdProfile } from '../types/vayu';
import {
  extractErrorMessage,
  formatFriendlyGeminiError,
  generateChatReplyWithFailover,
} from './geminiChat';

// Verified RAG knowledge base excerpts (WHO 2021, CPCB NAQI, US EPA, Drexel/Corsi-Rosenthal)
const VERIFIED_KNOWLEDGE_SNIPPETS = [
  '[WHO 2021 AQG] Recommended 24-hr PM2.5 guideline is 15 ug/m3 (annual 5 ug/m3). Short-term spikes >150 ug/m3 elevate acute pediatric asthma, geriatric cardiovascular, and COPD risks.',
  '[CPCB NAQI India] NAQI PM2.5 bands: Good (0-30 ug/m3), Satisfactory (31-60), Moderate (61-90), Poor (91-120), Very Poor (121-250), Severe (>250).',
  '[US EPA 2024 AQI] Revised PM2.5 Good cutoff is 9.0 ug/m3; Unhealthy for Sensitive Groups starts at 35.5 ug/m3; Hazardous starts above 225.5 ug/m3.',
  '[Winter Inversion Physics] In North Indian cities (Nov-Jan), nocturnal surface cooling creates a shallow planetary boundary layer trapping PM2.5 from 9 PM to 9:30 AM. Solar heating lifts mixing height between 1:00 PM and 3:30 PM, creating the safest brief cross-ventilation window.',
  '[Filtration & Equity] True HEPA H13 mechanical filtration (CADR >= 4.8x room volume) or DIY box-fan + MERV-13/HEPA filter boxes (~Rs 1,800-2,500) cut indoor PM2.5 by 40-65%. Avoid electronic ionizers (ozone risk). Houseplants purify 100x-1,000x too slowly to protect against urban smog.',
  '[Masks] Only well-fitted N95, KN95, or KF94 respirators reduce PM2.5 inhalation >=94%. Loose surgical or cloth masks leak 60-80% of fine particles.',
  '[Indoor Combustion] Mosquito coils, agarbatti/dhoop, unvented high-heat frying, and solid biomass/trash bonfires cause severe indoor and hyperlocal PM2.5 spikes.',
];

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function handleHealth(_req: express.Request, res: express.Response): void {
  res.json({ status: 'ok', service: 'vayu-pulse' });
}

export function handleAqi(req: express.Request, res: express.Response): void {
  const cityId = typeof req.query.city === 'string' ? req.query.city : LOCALITIES[0].id;
  const locality = LOCALITIES.find((l) => l.id === cityId) ?? LOCALITIES[0];
  res.json({
    locality,
    allLocalities: LOCALITIES.map(
      ({ id, city, locality: loc, localityHi, outdoorPm25, indoorPm25 }) => ({
        id,
        city,
        locality: loc,
        localityHi,
        outdoorPm25,
        indoorPm25,
      })
    ),
  });
}

export async function handleChat(req: express.Request, res: express.Response): Promise<void> {
  try {
    const rawBody =
      typeof req.body === 'string'
        ? (() => {
            try {
              return JSON.parse(req.body);
            } catch {
              return {};
            }
          })()
        : (req.body ?? {});

    const { message, cityId, profile, history } = rawBody as {
      message?: string;
      cityId?: string;
      profile?: HouseholdProfile;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!message || !message.trim()) {
      res
        .status(400)
        .json({ error: 'Please enter a question about your air quality or daily routine.' });
      return;
    }

    const locality = LOCALITIES.find((l) => l.id === cityId) ?? LOCALITIES[0];
    const safeProfile: HouseholdProfile = profile ?? {
      account: {
        signedIn: false,
        anonymousMode: true,
        name: 'Guest',
        contact: '',
        roleLabel: 'Quick Start',
      },
      persona: 'parent',
      cityId: locality.id,
      sensitivities: {
        childrenUnder12: true,
        elderlyOver65: false,
        asthmaOrCopd: false,
        pregnant: false,
        outdoorWorker: false,
      },
      homeType: 'apartment',
      commuteMode: 'metro-bus',
      budgetTier: 'low-cost',
      hasPurifier: false,
      scale: 'NAQI',
      language: 'en',
      lowBandwidth: false,
      pushAlertsEnabled: false,
      whatsappDigestEnabled: false,
    };

    // Deterministic Safety Rules Engine runs BEFORE the LLM
    const safety = evaluateSafetyRules(locality, safeProfile, message);
    const aqiEval = evaluateAqi(locality.outdoorPm25, safeProfile.scale);

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Gemini API key is not configured on the server. Set GEMINI_API_KEY in your environment variables to enable live Vayu AI chat.',
        safety,
      });
      return;
    }

    const langInstruction =
      safeProfile.language === 'hi'
        ? 'Respond primarily in simple, warm, clear Hindi (Devanagari) with common terms like N95, PM2.5, AQI kept readable.'
        : 'Respond in clear, calm, practical English (8th-grade readability, zero panic/fear-mongering).';

    const systemInstruction = [
      'You are Vayu Pulse, an evidence-grounded consumer air quality & low-emission daily routine assistant.',
      'STRICT GUARDRAILS:',
      '1. NEVER diagnose medical conditions, prescribe medication dosages, or contradict the deterministic safety thresholds below.',
      '2. NEVER recommend sponsored brands or shame users who cannot afford purifiers; always tailor advice to their stated budget tier.',
      '3. For every practical recommendation you suggest, briefly include an estimated impact (exposure reduction in ug/m3 or %, or kg CO2e avoided) AND state confidence (High/Medium/Directional).',
      '4. Cite at least 1 source from the Verified Knowledge Context in brackets, e.g., [WHO 2021 AQG] or [CPCB NAQI India].',
      '5. Keep answers concise (120-200 words), structured with short bullets, calm and empowering.',
      langInstruction,
      '',
      'LIVE LOCALITY CONTEXT:',
      `Location: ${locality.locality}, ${locality.city} (${locality.source})`,
      `Outdoor PM2.5: ${locality.outdoorPm25} ug/m3 (${safeProfile.scale} AQI ${aqiEval.aqi} - ${aqiEval.category})`,
      `Indoor PM2.5: ${locality.indoorPm25} ug/m3 | PM10: ${locality.pm10} | NO2: ${locality.no2} | Inversion Risk: ${locality.inversionRisk}`,
      `Safest Ventilation Window: ${locality.safeVentilationWindow} | Worst Smog Window: ${locality.worstSmogWindow}`,
      '',
      'HOUSEHOLD PROFILE:',
      `Persona: ${safeProfile.persona} | Budget: ${safeProfile.budgetTier} | Home: ${safeProfile.homeType} | Commute: ${safeProfile.commuteMode} | Has Purifier: ${safeProfile.hasPurifier}`,
      `Sensitivities: ${JSON.stringify(safeProfile.sensitivities)}`,
      '',
      'DETERMINISTIC SAFETY RULES (NON-NEGOTIABLE — DO NOT CONTRADICT):',
      `Mask rule: ${safety.maskGuidance}`,
      `Ventilation rule: ${safety.ventilationRule}`,
      `Outdoor exercise allowed: ${safety.outdoorExerciseAllowed}`,
      `School advice: ${safety.schoolRecessAdvice}`,
      safety.redFlagMessage
        ? `CRITICAL MEDICAL ESCALATION: ${safety.redFlagMessage}`
        : 'No acute clinical red flag detected in prompt.',
      '',
      'VERIFIED KNOWLEDGE CONTEXT:',
      ...VERIFIED_KNOWLEDGE_SNIPPETS,
      '',
      'AVAILABLE HABIT BENCHMARKS:',
      ...HABIT_ACTIONS.slice(0, 5).map(
        (h) =>
          `- ${h.title} (${h.budgetTier}): ~${h.exposureReductionPct}% exposure cut, ${h.co2AvoidedKgPerDay} kg CO2e/day [${h.confidence}]`
      ),
    ].join('\n');

    const recentContext = (history ?? [])
      .slice(-4)
      .map((m) => `${m.role === 'user' ? 'User' : 'Vayu Pulse'}: ${m.content}`)
      .join('\n');

    const fullPrompt = recentContext
      ? `Recent conversation:\n${recentContext}\n\nCurrent user question: ${message}`
      : message;

    const { text } = await generateChatReplyWithFailover(ai, {
      prompt: fullPrompt,
      systemInstruction,
    });

    const citations = ['CPCB NAQI / US EPA 2024', 'WHO 2021 AQG'];
    if (/hepa|diy|fan|plant/i.test(text)) citations.push('Corsi-Rosenthal / Drexel IAQ Study');
    if (/metro|carpool|burn|co2/i.test(text)) {
      citations.push('IPCC / CEEW Urban Emissions Factors');
    }

    res.json({
      reply: text,
      citations,
      safety,
      confidence: safety.clinicalRedFlagTriggered
        ? 'Clinical Escalation Rule'
        : 'High (Rules + Verified RAG)',
    });
  } catch (err: unknown) {
    const rawError = extractErrorMessage(err);
    console.error('[Vayu Pulse /api/chat error]', rawError);
    const friendly = formatFriendlyGeminiError(err);
    res.status(friendly.status).json({
      error: friendly.message,
    });
  }
}

export function createApiApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', handleHealth);
  app.get('/api/aqi', handleAqi);
  app.post('/api/chat', handleChat);

  return app;
}
