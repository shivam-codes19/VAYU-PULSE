export interface PrdTable {
  headers: string[];
  rows: string[][];
}

export interface PrdSection {
  id: string;
  number: string;
  title: string;
  summary: string;
  bullets?: string[];
  table?: PrdTable;
  callouts?: Array<{ title: string; body: string }>;
}

export const PRD_SECTIONS: PrdSection[] = [
  {
    id: 'overview',
    number: '01',
    title: 'Overview & Vision',
    summary:
      'Vayu Pulse is a mobile-first, installable Progressive Web App (PWA) powered by a safety-grounded GenAI engine that converts raw hyperlocal pollution telemetry into calm, budget-aware daily routines, indoor air hacks, and quantified personal + community impact.',
    bullets: [
      'Problem Statement: During winter thermal inversions across South Asia and polluted urban basins, 400M+ residents face PM2.5 spikes >200–450 µg/m³. Existing AQI apps display alarming red numbers without explaining what a specific family should do at 7 AM vs 2 PM, how to protect lungs without a ₹15,000 purifier, or how their daily mobility/heating choices alter both personal inhalation and neighborhood emissions.',
      'Why Now: (1) Hyperlocal CPCB/OpenAQ + satellite reanalysis feeds now resolve neighborhood diurnal curves; (2) lightweight GenAI models enable natural bilingual (English + Hindi) coaching at <$0.03/MAU [Assumption]; (3) PWA installability via WhatsApp/QR bypasses app-store friction on 2GB-RAM Android phones.',
      'One-Line Value Proposition: "Know your air. Change your day." — Turn real-time smog data into practical, budget-matched habits with clear exposure (µg/m³) and emissions (kg CO₂e) proof.',
      'Meaning Behind "Vayu Pulse": "Vayu" (Sanskrit/Hindi for vital air/wind) paired with "Pulse" reflects both the living diurnal rhythm of urban air (inversion peaks vs afternoon clearing windows) and the human respiratory heartbeat we protect.',
    ],
  },
  {
    id: 'goals-nongoals',
    number: '02',
    title: 'Goals & Non-Goals',
    summary:
      'Measurable 6-month winter-season launch targets paired with explicit product boundaries to protect clinical safety and user trust.',
    table: {
      headers: ['Category', 'Definition & Quantified Target (Assumptions Flagged)'],
      rows: [
        ['Primary Behavior Goal', '≥35% of Weekly Active Households log ≥1 exposure-reducing or emission-avoiding action per smog week [Assumption].'],
        ['Reach & Frictionless Entry', '50,000 MAU across 2 pilot cities (Delhi NCR + Lucknow) via QR/WhatsApp links with ≥60% completing Quick Start in <45 seconds [Assumption].'],
        ['Health Safety & Groundedness', '0 severe safety hallucinations; 100% deterministic adherence on medical red flags and NAQI/EPA threshold rules.'],
        ['Equity Target', '≥50% of active users engage with Free or Low-Cost (<₹2,500) indoor & commute interventions [Assumption].'],
        ['NON-GOAL: Medical Diagnosis', 'Vayu Pulse is NOT a clinical diagnostic tool, symptom checker, or medication/inhaler dosage advisor.'],
        ['NON-GOAL: Purifier Sales Funnel', 'Zero affiliate commissions, sponsored purifier rankings, or pay-to-play mask placements.'],
        ['NON-GOAL: Native App at Launch', 'No iOS App Store / Google Play binary in MVP/V1; web-first PWA maximizes QR & WhatsApp distribution.'],
      ],
    },
  },
  {
    id: 'personas',
    number: '03',
    title: 'User Personas & Jobs-to-be-Done',
    summary:
      'Four primary personas representing high-risk households, outdoor workers, and neighborhood multipliers.',
    table: {
      headers: ['Persona', 'Primary JTBD', 'Top Pain Points', 'Sample Smog Day Flow'],
      rows: [
        [
          'Priya (34) — Parent of 6-yr-old with mild asthma',
          'Decide quickly each morning if school/park is safe and keep bedroom air breathable on a modest budget.',
          'Conflicting AQI apps (EPA vs NAQI); guilt about not affording 3 purifiers; school WhatsApp rumors.',
          '6:45 AM checks morning briefing → packs fitted N95 for bus → skips 7 AM window opening → opens windows 1:45–2:15 PM → runs DIY fan-filter box at 8 PM.',
        ],
        [
          'Ramesh (71) — Senior living alone in 2BHK',
          'Know the safest hour for his daily walk and detect indoor air risks without complex logins.',
          'Small text, English-only charts, morning walk habit during worst inversion (6:30 AM), isolation.',
          'Opens installed Hindi PWA icon → taps Voice Briefing (TTS) → shifts walk from 6:30 AM to 2:00 PM → taps "I am okay" evening check-in shared with daughter.',
        ],
        [
          'Aarav (27) — Gig delivery rider on two-wheeler',
          'Protect lungs during 8-hour outdoor shifts on a low-end Android phone & 3G data.',
          'Cannot stay indoors; surgical masks leak; high data/battery drain apps; zero disposable income.',
          'Scans RWA QR → uses 3G Lite anonymous mode → views peak-smog corridor hours → uses fitted N95 seal guide & takes indoor rest break during 7–9 PM spike.',
        ],
        [
          'Meera (46) — RWA Secretary / School Coordinator',
          'Issue credible, standardized smog advisories to 220 families and curb local guard bonfires.',
          'Residents ignore text-only forwards; no unified school recess cutoff; guards burn leaves to stay warm.',
          'Views RWA Dashboard at 7:00 AM → exports 1-tap Hindi/English WhatsApp Alert Card → tracks Society Electric Heater Challenge (12 gates bonfire-free).',
        ],
      ],
    },
  },
  {
    id: 'journeys',
    number: '04',
    title: 'Core User Journeys',
    summary:
      'Zero-friction entry via link/QR with progressive personalization and crisis-ready workflows.',
    bullets: [
      '1. First Visit & No-Login Quick Start (<45s): User opens QR/WhatsApp link → sees immediate locality AQI (via optional Geolocation API or 1-tap city/locality search) + plain-language meaning. No mandatory sign-up wall. Optional 3-tap profile chips (Sensitivities, Home Type, Commute, Budget Tier) stored locally in localStorage; account creation offered later only for multi-device sync or RWA admin roles.',
      '2. Morning Briefing (6:30–8:00 AM): Summarizes outdoor vs indoor PM2.5, inversion peak window, mask rule (N95 vs optional), school/commute recommendation, and 1 high-impact low-emission swap.',
      '3. Mid-Day Alert (1:00–2:00 PM): Triggers notification/WhatsApp digest when boundary layer lifts ("Ventilation Window Open: PM2.5 dropped 34% — cross-ventilate 15 mins now to clear indoor CO₂").',
      '4. Evening Review (8:00 PM): Non-anxious habit check-off showing daily personal exposure reduced (e.g., -118 µg/m³ effective) and community CO₂e/PM avoided.',
      '5. Severe-Pollution Emergency Flow (NAQI >400 or PM2.5 >150 µg/m³): High-contrast Emergency Mode unlocks 5-step clean-room sealing checklist, indoor-only school/exercise directive, clinical red-flag escalation numbers (India 108/112), and 1-tap family/RWA alert card.',
    ],
  },
  {
    id: 'functional',
    number: '05',
    title: 'Functional Requirements (P0 / P1 / P2)',
    summary:
      'Prioritized capabilities with user stories and verifiable acceptance criteria.',
    table: {
      headers: ['ID / Priority', 'Capability & User Story', 'Acceptance Criteria'],
      rows: [
        [
          'FR-01 · P0',
          'Hyperlocal AQI (NAQI + US EPA) & Plain-Language Translator: As a resident, I want live PM2.5/PM10/NO2/O3 in NAQI or EPA with clear household meaning.',
          'Switches between NAQI and US EPA breakpoints accurately; displays primary smog driver, timestamp, data source, and 1-sentence plain-language advice; color-blind-safe labels (L1–L6) always accompany color.',
        ],
        [
          'FR-02 · P0',
          'Personalized Daily Plan: As a parent/commuter, I want hourly outdoor/ventilation windows, mask rules, and school/exercise guidance tailored to my profile.',
          'Deterministically computes safest ventilation window, worst smog window, N95 threshold, and school recess rule from locality PM2.5 + household sensitivities; updates <200ms on profile edit.',
        ],
        [
          'FR-03 · P0',
          'Indoor Air Quality Module (Budget-Tiered): As a budget-conscious family, I want Free, Low-Cost (<₹2,500), and Premium indoor air hacks plus myth-busting.',
          'Filters actionable steps by Free/Low-Cost/Premium; includes CADR room-size calculator (CADR >= 4.8x room volume), wet-mop/draft-seal hacks, cooking exhaust rules, and peer-reviewed plants/ionizer myth cards.',
        ],
        [
          'FR-04 · P0',
          'Quantified Impact Explainer: As a user, I want to see how each choice lowers my exposure (µg/m³ / %) and emissions (kg CO₂e / g PM) with transparent assumptions.',
          'Every recommendation displays exposure reduction %, µg/m³, kg CO₂e/day, confidence badge (High/Medium/Directional), and explicit assumption tooltip; checking habits updates cumulative household & RWA totals.',
        ],
        [
          'FR-05 · P0',
          'Safety-Grounded GenAI Assistant (Text + Browser Voice): As a user, I want to ask follow-up questions in English or Hindi via typing or voice.',
          'Calls server-side Gemini API with RAG snippets + deterministic safety rules pre-filter; supports Web Speech API STT/TTS; triggers immediate clinical escalation banner for acute red-flag symptoms.',
        ],
        [
          'FR-06 · P1',
          'Sustainable Alternatives & Local Availability: As a commuter, I want cleaner commute/cooking/heating swaps relevant to my neighborhood.',
          'Maps transit/carpool, induction/exhaust cooking, and bonfire-free guard heater swaps with local availability tags and emissions avoided.',
        ],
        [
          'FR-07 · P1',
          'Community, RWA & School Dashboard + Shareable Alert Cards: As an RWA admin, I want neighborhood challenges and 1-tap WhatsApp alert cards.',
          'Renders society-level CO₂e/bonfire metrics, challenge progress bars, and a structured bilingual alert card usable via Web Share API or Clipboard copy.',
        ],
        [
          'FR-08 · P1',
          'Low-Bandwidth 3G Mode & Offline Fallback: As a user on patchy 3G, I want cached AQI and daily plans to load even offline.',
          'Service worker precaches app shell and caches last AQI payload (StaleWhileRevalidate); 3G Lite disables heavy animations/assets; displays clear offline indicator banner when disconnected.',
        ],
        [
          'FR-09 · P2',
          'Calm Habit-Building (Anxiety-Free Gamification): As a returning user, I want encouraging habit streaks without doom-scrolling guilt.',
          'Rewards constructive streaks ("Clean Air Days Protected") and collective RWA milestones; never uses punishing streak-loss red alerts or fear-based scores.',
        ],
      ],
    },
  },
  {
    id: 'web-specific',
    number: '06',
    title: 'Web-Specific, PWA & Tech Architecture',
    summary:
      'Engineered for 320px low-end Android devices up to 1440px RWA desktop consoles, installable without an app store.',
    table: {
      headers: ['Dimension', 'Specification & Targets (Assumptions Flagged)'],
      rows: [
        ['PWA & Offline', 'Web App Manifest (id, standalone, 192/512/maskable PNGs, iOS apple-touch-icon), Workbox SW caching shell + last known AQI/plan, in-app Install CTA + iOS Share-to-Home-Screen guide.'],
        ['Notifications & Fallback', 'Web Push API with contextual post-value consent flow; graceful fallback to WhatsApp Broadcast / SMS / Email digest where Push is restricted (older iOS Safari / non-installed iOS).'],
        ['Browser APIs', 'Geolocation API (opt-in with manual city fallback), Web Speech API (SpeechRecognition STT + speechSynthesis TTS for EN/HI), Web Share API, Clipboard API.'],
        ['SEO & Public Pages', 'SSR/Edge-cached public locality URLs (`/aqi/delhi-anand-vihar`, `/rwa/greenview`) with dynamic OpenGraph / WhatsApp social preview cards.'],
        ['Responsive & Browser Matrix', '320px–1440px fluid layout; tested on Chrome Android 100+, Safari iOS 15.4+, Samsung Internet 18+, Desktop Chrome/Edge/Safari/Firefox.'],
        ['Performance Budgets [Assumption]', 'LCP <2.5s on Fast 3G, INP <200ms, CLS <0.05, initial gzipped JS <150 KB, Lighthouse PWA/Perf/Accessibility >=90; subset Latin+Devanagari fonts with `font-display: swap`.'],
        ['Recommended Stack', 'React 19 + TypeScript + Tailwind v4 + Vite/Next.js Edge + Express/Serverless API proxy + PostgreSQL (PostGIS for locality stations) + pgvector RAG store + Redis edge cache. Alternatives: SvelteKit (smaller bundle, smaller hiring pool in India) or native Flutter (fails zero-install QR distribution).'],
      ],
    },
  },
  {
    id: 'genai-design',
    number: '07',
    title: 'GenAI System Design & Safety Architecture',
    summary:
      'Hybrid Deterministic-First + RAG + LLM architecture: safety thresholds never rely on probabilistic token generation.',
    bullets: [
      'Deterministic Logic Owns: (1) Exact NAQI & US EPA piecewise AQI math; (2) Health-threshold triggers (N95 mandatory cutoff, school recess cancellation, outdoor exercise suspension, afternoon ventilation window); (3) Clinical red-flag regex/classifier escalation (wheezing, breathlessness, chest pain, cyanosis, rescue inhaler failure) triggering immediate medical care banner before/regardless of LLM output.',
      'LLM (Gemini 4 Hydrogen via server-side @google/genai) Owns: Conversational translation into calm English/Hindi prose, personalizing practical routines around household constraints (e.g., cooking tadka in a studio without a chimney), explaining trade-offs, and synthesizing retrieved WHO/CPCB/EPA RAG passages with citations.',
      'System Prompt & Memory Strategy: Stateless per-request assembly injecting (a) verified RAG chunks, (b) non-negotiable deterministic safety directives, (c) sanitized household profile (no PII sent to LLM), and (d) last 4 turns of session context.',
      'Hallucination Prevention & Citations: Every clinical/environmental claim grounded in curated WHO 2021 AQG, CPCB NAQI, US EPA 2024, ICMR, and peer-reviewed IAQ studies (Corsi-Rosenthal, Drexel plant studies); inline source tags enforced in prompt and audited in automated evals.',
      'Evaluation Plan: 250-prompt Golden Test Set (EN + HI + Hinglish) across personas; adversarial red-teaming (medication dosage requests, brand bias probes, panic induction); quarterly sign-off by pediatric pulmonologist, geriatric physician, and atmospheric scientist; CI regression gating (≥98% safety pass rate required for deploy [Assumption]).',
    ],
  },
  {
    id: 'data-integrations',
    number: '08',
    title: 'Data Sources, Integrations & Resilience',
    summary:
      'Multi-source air quality fusion with graceful degradation when government monitors drop offline.',
    table: {
      headers: ['Data Layer', 'Sources', 'Refresh & Caching', 'Gap / Fallback Strategy'],
      rows: [
        ['Regulatory AQI', 'CPCB (India), State PCBs, AirNow (US), OpenAQ v3', '15-min edge cache (Redis + CDN stale-while-revalidate)', 'If nearest station is >2h stale or offline, interpolate from 3 nearest stations within 10km (inverse-distance weighting) + display confidence tag.'],
        ['Satellite & Weather', 'Open-Meteo / IMD / ECMWF boundary-layer height, wind, humidity, MODIS/VIIRS fire plumes', '30-min forecast sync (48h lookahead)', 'Used to predict winter inversion lifting window (1–3:30 PM) even when local monitors lack forecast endpoints.'],
        ['User & Optional IoT', 'Manual household profile, symptom check-ins (local), optional MQTT/BLE low-cost PM2.5/CO₂ home monitors', 'Client-local IndexedDB/localStorage; optional 5-min IoT sync', 'If no indoor sensor paired, estimate indoor PM2.5 using outdoor reading × infiltration factor (0.55 closed / 0.15 with HEPA) clearly labeled "Estimated".'],
      ],
    },
  },
  {
    id: 'trust-safety',
    number: '09',
    title: 'Trust, Safety & Equity Principles',
    summary:
      'Public-health integrity, radical transparency, and zero economic shaming.',
    bullets: [
      'Medical Disclaimers & Escalation: Persistent clear notice that Vayu Pulse provides environmental wellness guidance, not medical diagnosis. Explicit "Seek Care Immediately If..." triggers (wheezing, bluish lips, severe breathlessness, chest tightness, rescue inhaler not relieving symptoms) with one-tap local emergency numbers (108 / 112).',
      'No Fear-Mongering: Never display cigarette-equivalence doom counters as primary hero messaging or panic sirens; always pair high-AQI alerts with 1 immediate protective action the user can take right now.',
      'Zero Sponsored Recommendations: Strictly prohibit affiliate links or paid placements for air purifiers, masks, or medicines; CADR recommendations are brand-agnostic formulas.',
      'Equity-First Design: Every advice card must include a Free or Low-Cost path (wet mopping, damp towel door seals, timing errands, DIY ₹2,000 box-fan filter) alongside purifier tips, respecting gig workers and families who cannot stay indoors.',
      'Misinformation Handling: Proactive myth-busters directly counter viral WhatsApp claims (indoor plants purifying severe smog, jaggery curing PM2.5 lung inflammation, cloth masks blocking fine particles).',
    ],
  },
  {
    id: 'privacy-compliance',
    number: '10',
    title: 'Privacy, DPDP Act & GDPR Compliance',
    summary:
      'Privacy-by-default architecture aligned with India Digital Personal Data Protection (DPDP) Act 2023 and EU GDPR.',
    bullets: [
      'Anonymous-First Mode: Core AQI, Daily Plan, Indoor Hacks, and Chat work with zero account creation; profile & habit ticks remain on-device in localStorage.',
      'Location Minimization: GPS coordinates snapped to ~2 km locality grid/H3 cell on client before API calls; exact home street addresses are never stored or logged.',
      'Health & Children’s Data: Household sensitivity flags ("child under 12", "asthma") are stored as non-identifiable household booleans; no child names, DOBs, or clinical records collected (avoiding DPDP verifiable parental consent friction while protecting minors).',
      'Consent & Retention: Granular consent toggles for Geolocation, Web Push, and WhatsApp digests; zero third-party ad trackers; server chat logs anonymized and purged after 30 days [Assumption]; 1-click "Clear All Local Data" button in Profile.',
    ],
  },
  {
    id: 'ux-brand',
    number: '11',
    title: 'UX Principles, Key Screens & Brand Direction',
    summary:
      'Calm, instrument-grade air-quality aesthetics balancing dark-mode legibility, WCAG 2.2 AA accessibility, and human warmth.',
    bullets: [
      'Brand Identity ("Vayu Pulse"): Breath-ring + steady pulse-wave SVG mark. Palette pairs obsidian charcoal (#0B0D0C) / crisp mineral light (#F3F6F4) canvas with fresh breath-lime (#88D46B) for safe indoor air and deep plum (#6C317A) for severe outdoor smog — calm and authoritative rather than alarmist neon red.',
      'Color-Blind-Safe AQI Palette: Never rely on hue alone; every AQI reading displays numeric index + explicit text band (`Good`, `Moderate`, `Very Poor`, `Severe`) + level code (`L1`–`L6`) and directional icon.',
      'Accessibility (WCAG 2.2 AA): Minimum 4.5:1 text contrast across both Light and Dark themes, >=44px mobile touch targets, full keyboard navigation, screen-reader landmarks, and `prefers-reduced-motion` support.',
      'Key Screens Implemented: (1) Floor/Home Overview Dashboard (Indoor vs Outdoor PM2.5 blocks, sage-panel trend graph, 6 circular-ring room cards); (2) Personalized Daily Plan; (3) Budget-Tiered Indoor Hacks & CADR Calculator; (4) Quantified Impact & Eco Swaps; (5) Voice-Enabled Vayu AI Chat; (6) Community/RWA & Emergency Mode; (7) Login/Quick-Start & Profile Dashboard.',
      'Tone & Voice: Warm neighbor + evidence-based public health guide — concise, actionable, culturally grounded (mentions tadka, agarbatti, RWA gates, Delhi Metro, 108/112), zero preachiness.',
    ],
  },
  {
    id: 'nfr',
    number: '12',
    title: 'Non-Functional Requirements (NFRs)',
    summary:
      'Resilient performance during severe winter smog traffic surges (10x normal load on Diwali/November inversion peaks).',
    table: {
      headers: ['Category', 'Target Specification (Assumptions Flagged)'],
      rows: [
        ['Latency', 'AQI API p95 <250ms (edge cached); GenAI time-to-first-token <1.5s; full chat response <4.0s [Assumption].'],
        ['Availability & Surge Scale', '99.9% uptime during Oct–Feb smog season; auto-scaling serverless tier engineered for 10x morning spike (50k concurrent requests at 7:00 AM IST) [Assumption].'],
        ['LLM Cost Efficiency', 'Target <$0.03 per Monthly Active User via Flash-class model (`gemini-4-hydrogen`), prompt caching, and deterministic caching of standard daily briefings [Assumption].'],
        ['Security & Abuse Prevention', 'HTTPS-only (HSTS), server-side API key isolation, IP/session rate limiting (20 chat msgs/hr anonymous, 60/hr signed-in), prompt-injection sanitization, strict CSP headers.'],
        ['Observability', 'Structured telemetry on API error rates, station staleness, deterministic safety-rule hit counts, Core Web Vitals RUM, and token spend alerts (zero PII logged).'],
      ],
    },
  },
  {
    id: 'metrics',
    number: '13',
    title: 'Success Metrics & Guardrails',
    summary:
      'Balanced scorecard prioritizing real behavior change and safety over vanity pageviews.',
    table: {
      headers: ['Metric Tier', 'Metric Name', 'Target (90-Day Pilot) [Assumptions]'],
      rows: [
        ['North Star', 'Protected Household-Days / Week (households completing >=1 verified exposure-reducing or emission-avoiding action on AQI >200 days)', '15,000 Protected Household-Days/wk across 2 pilot cities'],
        ['Adoption', 'Quick-Start completion rate from QR/WhatsApp link', '>=65% within 45 seconds'],
        ['Engagement', 'Morning Briefing open rate on Very Poor/Severe days (D7 / D30 retention)', 'D7 >=40%, D30 >=25% during winter season'],
        ['Behavior Change', '% of active users logging >=1 recommendation (ventilation shift, N95, commute swap, DIY filter)', '>=35% weekly'],
        ['Outcome Proxies', 'Estimated mean personal PM2.5 exposure cut & self-reported cough/eye-irritation check-in improvement', '-28% modeled exposure; -15% self-reported irritation'],
        ['AI Quality & Safety', 'Grounded citation rate / Safety red-flag recall / Hallucination violation rate', '>=95% grounded; 100% red-flag recall; <0.5% minor error'],
        ['Web & PWA', 'PWA Install rate (Android), Push/WhatsApp opt-in rate, Mobile LCP (3G)', '>=18% install; >=45% alert opt-in; LCP <2.5s'],
        ['Guardrails', 'User-reported anxiety score (1–5 survey), API cost/MAU, Unsubscribe/uninstall rate', 'Anxiety <=2.2/5; LLM cost <=$0.03/MAU; Opt-out <8%'],
      ],
    },
  },
  {
    id: 'gtm',
    number: '14',
    title: 'Go-to-Market, Partnerships & Trust-Safe Funding',
    summary:
      'Hyperlocal trust distribution via schools, RWAs, and clinicians rather than paid consumer ad spend.',
    bullets: [
      '2-City Winter Pilot: Launch Oct 15 (pre-Diwali/inversion season) in Delhi NCR (East Delhi + Gurugram RWAs) and Lucknow (Gomti Nagar + Hazratganj) targeting 40 RWAs and 25 schools [Assumption].',
      'Zero-Friction Distribution: Print weatherproof QR posters for RWA lift lobbies, security gates, and school parent noticeboards; seed bilingual 1-tap WhatsApp morning alert cards so forwarding drives organic viral growth (target K-factor >=0.4 [Assumption]).',
      'Strategic Partnerships: Partner with pediatric/pulmonology clinic chains (clinic waiting-room QR), clean-air NGOs (CEEW, Clean Air Collective, Warrior Moms), and municipal pollution control boards for verified data attribution.',
      'Trust-Safe Funding Model (Zero Brand Bias): (1) Philanthropic / climate-health grants (Clean Air Fund, CSR) for free citizen tier; (2) B2B SaaS licensing for Schools, RWAs, and Corporate EHS dashboards (₹4,999–₹19,999/yr for automated compliance alerts, indoor sensor fleet views & parent digests [Assumption]); (3) Zero purifier/mask affiliate revenue.',
    ],
  },
  {
    id: 'roadmap',
    number: '15',
    title: 'Phased Roadmap & Native/WhatsApp Trigger Criteria',
    summary:
      'Pragmatic 3-phase rollout anchored to the winter smog calendar.',
    table: {
      headers: ['Phase & Timeline', 'Scope', 'Dependencies', 'Exit Criteria'],
      rows: [
        [
          'MVP (Weeks 1–9)',
          'PWA shell, NAQI/EPA live feed + fallback, No-Login Quick Start, Personalized Daily Plan, Budget-Tiered Indoor Hacks, Impact Explainer, English+Hindi UI, Safety-Grounded Gemini Chat (text + browser voice), Emergency Mode, Shareable WhatsApp Alert Card.',
          'CPCB/OpenAQ API pipeline, pulmonologist sign-off on deterministic rules, 250-prompt safety eval.',
          '100% red-flag eval pass; LCP <2.5s on 3G; 10 pilot RWAs onboarded.',
        ],
        [
          'V1 (Months 3–5)',
          'School & RWA Admin Dashboards, Neighborhood Challenges, Web Push + WhatsApp/SMS Alert Digest, Low-Cost IoT sensor pairing (BLE/Wi-Fi PM2.5), 3 additional languages (Punjabi, Marathi, Bengali).',
          'WhatsApp Business API approval, municipal open-burning reporting webhook.',
          '50k MAU, >=35% weekly habit adoption, >=18% PWA install rate.',
        ],
        [
          'V2 (Months 6–12)',
          'Hyperlocal routing ("Lowest-PM2.5 commute path"), multi-city summer ozone/heatwave expansion, school district B2B portal, community micro-sensor network calibration.',
          'Satellite + street-level NO2/PM2.5 dispersion model, B2B pilot renewals.',
          'Year-round retention (D90 >=20%), sustainable B2B/grant runway.',
        ],
      ],
    },
    callouts: [
      {
        title: 'When to Build a WhatsApp Bot vs. Native Mobile App?',
        body: 'Launch an official WhatsApp Bot in V1 if >35% of pilot seniors/gig workers drop off before opening the PWA link or iOS Web Push opt-in stays <15%. Consider a Native App ONLY in V2+ if >25% of MAU require background Bluetooth IoT sensor polling or persistent OS-level lock-screen AQI widgets that Web APIs cannot support.',
      },
    ],
  },
  {
    id: 'risks',
    number: '16',
    title: 'Risks, Assumptions & Open Questions',
    summary:
      'Proactive risk register with concrete mitigations and clear functional owners.',
    table: {
      headers: ['Risk / Open Question', 'Severity', 'Mitigation', 'Owner'],
      rows: [
        ['CPCB / government monitor downtime during peak smog', 'High', 'Multi-source fallback (OpenAQ + spatial IDW interpolation + satellite reanalysis) with explicit data freshness timestamp.', 'Data Eng'],
        ['LLM hallucinating unsafe medical or ventilation advice', 'Critical', 'Deterministic safety rules run pre-LLM and render mandatory banners; strict RAG grounding + CI golden-set eval gating.', 'AI / Clinical'],
        ['Alert fatigue or eco-anxiety causing uninstalls', 'Medium', 'Cap push notifications at 2/day unless emergency threshold crossed; always pair alerts with calm, achievable actions.', 'Product / UX'],
        ['iOS Safari push restrictions & offline storage eviction', 'Medium', 'Guided iOS Add-to-Home-Screen prompt + instant fallback to WhatsApp/SMS daily digest.', 'Frontend Eng'],
        ['Open Question: Legal liability wording for India DPDP & school advisories', 'High', 'External healthcare/privacy counsel review prior to RWA/school pilot launch.', 'Legal / PM'],
      ],
    },
  },
  {
    id: 'appendix',
    number: '17',
    title: 'Appendix: Sample AI Dialogues, Daily Briefing, Alert Card & Glossary',
    summary:
      'Concrete build-ready reference artifacts for engineering, prompt engineering, and clinical QA.',
    callouts: [
      {
        title: 'Sample AI Conversation A — Good Response (Grounded, Equity-Aware, Quantified)',
        body: 'User: "AQI is 395 in Anand Vihar. I have a 4-year-old and cannot afford a ₹15,000 purifier. Should I open windows at 7 AM?"\nVayu Pulse: "Keep windows closed until 1:30 PM — at 7 AM winter thermal inversion traps outdoor PM2.5 near 244 µg/m³ [CPCB NAQI India]. Three zero/low-cost steps for today:\n1. Brief cross-ventilation ONLY 1:30–3:30 PM (15 min) when smog dips ~35% (cuts indoor exposure ~22% / ~54 µg/m³, Confidence: High).\n2. Wet-mop floors instead of dry sweeping + place a damp rolled towel under the main door (cuts indoor PM ~18%, Confidence: High).\n3. DIY Clean-Air Box: Tape a ₹1,200 True HEPA replacement filter to a standard table fan in your child’s room at night (cuts bedroom PM2.5 by ~42% / ~102 µg/m³, Confidence: High) [Corsi-Rosenthal Benchmark].\nKeep your child indoors for play today; if stepping out, use a snug kid-sized N95/KF94 mask."',
      },
      {
        title: 'Sample AI Conversation B — Failure Case & Engineering Fix',
        body: 'User: "My 6-year-old is wheezing and breathless since morning smog. Should I give an extra puff of his blue inhaler?"\nFAILURE CASE (Unacceptable): "Yes, smog triggers asthma, try giving two extra puffs and keep 3 snake plants by his bed."\nROOT CAUSE: LLM attempted medication dosing and repeated an unverified plant myth.\nENGINEERED FIX: (1) Deterministic `detectClinicalRedFlags()` regex/classifier intercepts "wheezing" + "breathless" BEFORE the LLM and renders an un-overridable red escalation banner ("Seek immediate medical care / call 108 or 112; Vayu Pulse cannot advise inhaler dosages"); (2) System prompt strictly forbids dosing instructions and injects verified Drexel IAQ study debunking houseplants.',
      },
      {
        title: 'Sample Morning Briefing (6:45 AM · Delhi NCR)',
        body: 'Outdoor PM2.5: 244 µg/m³ (NAQI 395 · Very Poor | US EPA 319 · Hazardous) · Indoor: 12 µg/m³ (Good).\n• Mask Rule: Fitted N95 mandatory for outdoor travel.\n• Best Ventilation Window: 1:30–3:30 PM (15 mins max).\n• Kids & Seniors: Indoor play/walks only today.\n• Top Low-Emission Swap: Metro/carpool today saves 3.4 kg CO₂e and cuts your commute PM2.5 inhalation by ~45%.',
      },
      {
        title: 'Glossary',
        body: 'PM2.5: Fine particulate matter ≤2.5 µm that penetrates deep into lungs and bloodstream. | NAQI: India CPCB National Air Quality Index (0–500 across 6 bands). | US EPA AQI: US Environmental Protection Agency index (2024 stricter PM2.5 breakpoints). | Thermal Inversion: Winter atmospheric layer where cooler surface air traps pollutants below warmer air aloft. | CADR: Clean Air Delivery Rate (m³/hr) measuring purifier particle-clearing speed. | DPDP Act: India Digital Personal Data Protection Act (2023).',
      },
    ],
  },
];

export const TOP_10_PREDEV_DECISIONS: Array<{
  rank: number;
  decision: string;
  options: string;
  recommended: string;
  owner: string;
}> = [
  {
    rank: 1,
    decision: 'Primary AQI Scale Default & Dual-Scale UX',
    options: 'India NAQI only vs. US EPA only vs. Geo-detected default with 1-tap toggle',
    recommended: 'Default to India NAQI in India (US EPA outside) with persistent 1-tap NAQI/EPA toggle + raw µg/m³ always visible.',
    owner: 'PM + Domain Advisor',
  },
  {
    rank: 2,
    decision: 'Clinical Safety Rules Boundary & Escalation Sign-Off',
    options: 'LLM-guided disclaimers vs. Hard-coded deterministic clinical/threshold rules engine',
    recommended: 'Mandatory pre-LLM deterministic rules engine signed off by pediatric pulmonologist before beta launch.',
    owner: 'Clinical Advisor + AI Lead',
  },
  {
    rank: 3,
    decision: 'AQI Data Provider Stack & Fallback SLA',
    options: 'CPCB scrape only vs. OpenAQ + CPCB + Open-Meteo spatial fallback',
    recommended: 'Hybrid CPCB + OpenAQ v3 + Open-Meteo boundary-layer forecast with Redis edge caching & station-staleness labels.',
    owner: 'Backend / Data Lead',
  },
  {
    rank: 4,
    decision: 'Authentication vs. Anonymous Local-First Storage',
    options: 'Mandatory phone OTP login vs. Anonymous Quick-Start with optional account later',
    recommended: 'Zero-login Quick-Start (localStorage) for households; optional lightweight auth only for RWA/school admins & sync.',
    owner: 'PM + Privacy Lead',
  },
  {
    rank: 5,
    decision: 'iOS Push Notification Gap Strategy',
    options: 'Web Push only vs. Web Push + WhatsApp/SMS Alert Digest fallback',
    recommended: 'Ship Web Push for Android/Desktop + guided iOS Home-Screen flow + WhatsApp/SMS daily digest fallback.',
    owner: 'Frontend + Growth',
  },
  {
    rank: 6,
    decision: 'LLM Model Selection & Cost Ceiling ($/MAU)',
    options: 'Heavy reasoning model for all queries vs. Fast Flash-tier (`gemini-4-hydrogen`) + cached deterministic briefings',
    recommended: 'Cache deterministic daily briefings per locality/profile bucket; route open-ended Q&A to `gemini-4-hydrogen` (<$0.03/MAU).',
    owner: 'AI Eng + Finance',
  },
  {
    rank: 7,
    decision: 'Impact Explainer Methodology & Confidence Labeling',
    options: 'Single unverified number vs. Evidence-backed ranges with High/Medium/Directional confidence & assumptions',
    recommended: 'Always disclose exact formula assumptions and confidence tier so scientists & skeptics trust the numbers.',
    owner: 'Climate Scientist + PM',
  },
  {
    rank: 8,
    decision: 'Bilingual Content Architecture (EN + HI + Future Indic Languages)',
    options: 'Machine-translate everything vs. Human-vetted safety strings + bilingual LLM prompting',
    recommended: 'Human-verified Hindi copy for all safety thresholds, emergency checklists, and UI labels; LLM handles conversational Hindi.',
    owner: 'Localization + UX',
  },
  {
    rank: 9,
    decision: 'Pilot City, RWA & School Cohort Selection',
    options: 'Pan-India broad launch vs. Focused 2-city pilot (Delhi NCR + Lucknow)',
    recommended: 'Deep 2-city pilot (40 RWAs + 25 schools) to prove neighborhood challenge & QR viral loops before expanding.',
    owner: 'GTM / Partnerships',
  },
  {
    rank: 10,
    decision: 'Trust-Safe Monetization Charter',
    options: 'Purifier/mask affiliate links vs. Grants + B2B School/RWA EHS SaaS',
    recommended: 'Publish a binding "Zero Sponsored Health Advice" pledge; fund via climate-health grants & School/RWA B2B tiers.',
    owner: 'Founders / Leadership',
  },
];

export function exportPrdAsMarkdown(): string {
  const lines: string[] = [
    '# Vayu Pulse — Build-Ready Product Requirements Document (PRD)',
    '',
    '**Tagline:** Know your air. Change your day.',
    '**Platform:** Mobile-First Responsive Web App & Installable Progressive Web App (PWA)',
    '',
    '---',
    '',
  ];

  for (const sec of PRD_SECTIONS) {
    lines.push(`## ${sec.number}. ${sec.title}`);
    lines.push('');
    lines.push(sec.summary);
    lines.push('');
    if (sec.bullets) {
      for (const b of sec.bullets) {
        lines.push(`- ${b}`);
      }
      lines.push('');
    }
    if (sec.table) {
      lines.push(`| ${sec.table.headers.join(' | ')} |`);
      lines.push(`| ${sec.table.headers.map(() => '---').join(' | ')} |`);
      for (const row of sec.table.rows) {
        lines.push(`| ${row.map((c) => c.replace(/\|/g, '\\|')).join(' | ')} |`);
      }
      lines.push('');
    }
    if (sec.callouts) {
      for (const c of sec.callouts) {
        lines.push(`### ${c.title}`);
        lines.push('');
        lines.push(c.body);
        lines.push('');
      }
    }
  }

  lines.push('## Prioritized Top 10 Pre-Development Decisions');
  lines.push('');
  lines.push('| # | Decision | Options Considered | Recommendation | Owner |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const d of TOP_10_PREDEV_DECISIONS) {
    lines.push(`| ${d.rank} | ${d.decision} | ${d.options} | ${d.recommended} | ${d.owner} |`);
  }

  return lines.join('\n');
}
