import type {
  AqiBandLevel,
  AqiEvaluation,
  AqiScale,
  HabitAction,
  HouseholdProfile,
  ImpactSummary,
  LocalityAirData,
  SafetyRuleResult,
} from '../types/vayu';

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

// US EPA 2024 Revised PM2.5 Breakpoints (24-hr avg ug/m3)
const EPA_PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0, cHigh: 9.0, iLow: 0, iHigh: 50 },
  { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
  { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
  { cLow: 225.5, cHigh: 325.4, iLow: 301, iHigh: 400 },
  { cLow: 325.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
];

// India CPCB NAQI PM2.5 Breakpoints (24-hr avg ug/m3)
const NAQI_PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
  { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
  { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
  { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
  { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
  { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
];

function interpolateAqi(concentration: number, table: Breakpoint[]): number {
  const c = Math.max(0, concentration);
  for (const bp of table) {
    if (c <= bp.cHigh) {
      const clamped = Math.max(bp.cLow, c);
      const ratio = (clamped - bp.cLow) / Math.max(0.1, bp.cHigh - bp.cLow);
      return Math.round(bp.iLow + ratio * (bp.iHigh - bp.iLow));
    }
  }
  return 500;
}

export function computePm25Aqi(pm25: number, scale: AqiScale): number {
  return scale === 'EPA'
    ? interpolateAqi(pm25, EPA_PM25_BREAKPOINTS)
    : interpolateAqi(pm25, NAQI_PM25_BREAKPOINTS);
}

/**
 * Evaluates a PM2.5 reading under either India NAQI or US EPA AQI,
 * returning color-blind-safe semantic tokens, category labels, and plain-language translation.
 */
export function evaluateAqi(pm25: number, scale: AqiScale): AqiEvaluation {
  const aqi = computePm25Aqi(pm25, scale);

  if (scale === 'NAQI') {
    if (aqi <= 50) {
      return {
        scale,
        aqi,
        category: 'Good',
        categoryHi: 'अच्छा',
        shortCode: 'L1 · OK',
        band: 'good',
        ringColor: '#88D46B',
        badgeBg: '#88D46B',
        badgeText: '#0E160C',
        meaningPlain: 'Clean air. Safe for outdoor play, brisk walks, and cross-ventilation.',
        meaningPlainHi: 'स्वच्छ हवा। बच्चों के बाहर खेलने, टहलने और खिड़कियाँ खोलने के लिए सुरक्षित।',
      };
    }
    if (aqi <= 100) {
      return {
        scale,
        aqi,
        category: 'Satisfactory',
        categoryHi: 'संतोषजनक',
        shortCode: 'L2 · LOW',
        band: 'satisfactory',
        ringColor: '#A9DC62',
        badgeBg: '#A9DC62',
        badgeText: '#131A0E',
        meaningPlain: 'Minor breathing discomfort possible only for very sensitive asthma patients.',
        meaningPlainHi: 'अधिकांश लोगों के लिए ठीक; गंभीर अस्थमा मरीजों को हल्की असुविधा हो सकती है।',
      };
    }
    if (aqi <= 200) {
      return {
        scale,
        aqi,
        category: 'Moderate',
        categoryHi: 'मध्यम',
        shortCode: 'L3 · MOD',
        band: 'moderate',
        ringColor: '#E5B84B',
        badgeBg: '#E5B84B',
        badgeText: '#1D1708',
        meaningPlain: 'Limit prolonged vigorous outdoor exertion for children, seniors, and people with asthma.',
        meaningPlainHi: 'बच्चों, बुजुर्गों और अस्थमा रोगियों के लिए लंबे समय तक बाहर भारी व्यायाम सीमित करें।',
      };
    }
    if (aqi <= 300) {
      return {
        scale,
        aqi,
        category: 'Poor',
        categoryHi: 'खराब',
        shortCode: 'L4 · POOR',
        band: 'poor',
        ringColor: '#E8833A',
        badgeBg: '#E8833A',
        badgeText: '#1F0F04',
        meaningPlain: 'Breathing discomfort on prolonged exposure. Wear a well-fitted N95/KF94 mask outdoors.',
        meaningPlainHi: 'लंबे समय तक बाहर रहने पर सांस में तकलीफ। बाहर निकलते समय N95 मास्क पहनें।',
      };
    }
    if (aqi <= 400) {
      return {
        scale,
        aqi,
        category: 'Very Poor',
        categoryHi: 'बहुत खराब',
        shortCode: 'L5 · HIGH',
        band: 'very-poor',
        ringColor: '#D94B4B',
        badgeBg: '#6C317A',
        badgeText: '#FFFFFF',
        meaningPlain: 'Respiratory illness risk on prolonged exposure. Move exercise indoors and seal drafts.',
        meaningPlainHi: 'गंभीर श्वसन जोखिम। व्यायाम घर के अंदर करें और खिड़की-दरवाजों की दरारें बंद रखें।',
      };
    }
    return {
      scale,
      aqi,
      category: 'Severe',
      categoryHi: 'गंभीर',
      shortCode: 'L6 · SEV',
      band: 'severe',
      ringColor: '#B548C9',
      badgeBg: '#6C317A',
      badgeText: '#FFFFFF',
      meaningPlain: 'Emergency smog conditions affecting healthy people too. Stay indoors, wear N95 if commuting.',
      meaningPlainHi: 'आपातकालीन स्मॉग स्थिति। स्वस्थ लोगों को भी खतरा। घर के अंदर रहें; बाहर जाने पर N95 अनिवार्य।',
    };
  }

  // US EPA AQI scale
  if (aqi <= 50) {
    return {
      scale,
      aqi,
      category: 'Good',
      categoryHi: 'अच्छा',
      shortCode: 'L1 · OK',
      band: 'good',
      ringColor: '#88D46B',
      badgeBg: '#88D46B',
      badgeText: '#0E160C',
      meaningPlain: 'Air quality is satisfactory with little or no risk.',
      meaningPlainHi: 'हवा की गुणवत्ता संतोषजनक है और स्वास्थ्य जोखिम नगण्य है।',
    };
  }
  if (aqi <= 100) {
    return {
      scale,
      aqi,
      category: 'Moderate',
      categoryHi: 'मध्यम',
      shortCode: 'L2 · MOD',
      band: 'moderate',
      ringColor: '#E5B84B',
      badgeBg: '#E5B84B',
      badgeText: '#1D1708',
      meaningPlain: 'Acceptable air, though unusually sensitive people should monitor symptoms.',
      meaningPlainHi: 'सामान्य रूप से ठीक, लेकिन अति-संवेदनशील लोगों को सावधानी रखनी चाहिए।',
    };
  }
  if (aqi <= 150) {
    return {
      scale,
      aqi,
      category: 'USG*',
      categoryHi: 'संवेदनशील हेतु अस्वस्थ',
      shortCode: 'L3 · USG',
      band: 'poor',
      ringColor: '#E8833A',
      badgeBg: '#E8833A',
      badgeText: '#1F0F04',
      meaningPlain: 'Unhealthy for Sensitive Groups (children, seniors, asthma/heart conditions). Cut outdoor exertion.',
      meaningPlainHi: 'बच्चों, बुजुर्गों और अस्थमा रोगियों के लिए अस्वस्थ। बाहरी गतिविधि कम करें।',
    };
  }
  if (aqi <= 200) {
    return {
      scale,
      aqi,
      category: 'Unhealthy',
      categoryHi: 'अस्वस्थ',
      shortCode: 'L4 · UNH',
      band: 'very-poor',
      ringColor: '#D94B4B',
      badgeBg: '#D94B4B',
      badgeText: '#FFFFFF',
      meaningPlain: 'Everyone may experience effects. Shift walks indoors and wear N95 outside.',
      meaningPlainHi: 'सभी पर स्वास्थ्य असर संभव। टहलना घर के अंदर करें और बाहर N95 मास्क पहनें।',
    };
  }
  if (aqi <= 300) {
    return {
      scale,
      aqi,
      category: 'Very Unhealthy',
      categoryHi: 'अत्यंत अस्वस्थ',
      shortCode: 'L5 · VUN',
      band: 'severe',
      ringColor: '#A84AC4',
      badgeBg: '#6C317A',
      badgeText: '#FFFFFF',
      meaningPlain: 'Health alert: everyone faces higher risk. Avoid outdoor exercise; run HEPA/DIY filtration.',
      meaningPlainHi: 'स्वास्थ्य चेतावनी: सभी के लिए उच्च जोखिम। बाहर व्यायाम न करें और इनडोर फिल्ट्रेशन चलाएँ।',
    };
  }
  return {
    scale,
    aqi,
    category: 'Hazardous',
    categoryHi: 'खतरनाक',
    shortCode: 'L6 · HAZ',
    band: 'severe',
    ringColor: '#9C2B62',
    badgeBg: '#6C317A',
    badgeText: '#FFFFFF',
    meaningPlain: 'Emergency health warning. Minimize outdoor exposure, seal doors, and check vulnerable members.',
    meaningPlainHi: 'आपातकालीन चेतावनी। बाहर न निकलें, दरवाजों की सील जांचें और बुजुर्गों/बच्चों पर ध्यान दें।',
  };
}

export function evaluateCo2Status(co2Ppm: number): {
  label: string;
  color: string;
  pct: number;
} {
  if (co2Ppm <= 650) return { label: 'Normal', color: '#88D46B', pct: 32 };
  if (co2Ppm <= 1000) return { label: 'Average', color: '#E5B84B', pct: 62 };
  return { label: 'High', color: '#D94B4B', pct: 88 };
}

const RED_FLAG_PATTERNS: RegExp[] = [
  /wheez(e|ing)/i,
  /short(ness)? of breath|can'?t breathe|breathless|difficulty breathing|सांस फूल/i,
  /chest (pain|tightness)|सीने में दर्द/i,
  /blue lips|cyanosis|faint(ing|ed)|dizz(y|iness)/i,
  /inhaler (not working|isn'?t helping)|rescue inhaler/i,
  /asthma attack|अस्थमा का दौरा/i,
];

export function detectClinicalRedFlags(text: string): boolean {
  return RED_FLAG_PATTERNS.some((rx) => rx.test(text));
}

/**
 * Deterministic Safety-Threshold Engine.
 * All health-threshold rules (masking, school outdoor bans, ventilation cutoffs, clinical escalation)
 * are computed deterministically rather than left to free-form LLM generation.
 */
export function evaluateSafetyRules(
  locality: LocalityAirData,
  profile: HouseholdProfile,
  userQuery = ''
): SafetyRuleResult {
  const pm25 = locality.outdoorPm25;
  const hasSensitive =
    profile.sensitivities.childrenUnder12 ||
    profile.sensitivities.elderlyOver65 ||
    profile.sensitivities.asthmaOrCopd ||
    profile.sensitivities.pregnant;

  const clinicalRedFlagTriggered = detectClinicalRedFlags(userQuery);
  const emergencyModeRecommended = pm25 >= 150 || (hasSensitive && pm25 >= 120);
  const rules: string[] = [];

  let maskGuidance = 'No mask required for routine outdoor travel.';
  let maskGuidanceHi = 'सामान्य बाहरी यात्रा के लिए मास्क आवश्यक नहीं है।';
  if (pm25 >= 120 || (hasSensitive && pm25 >= 65)) {
    maskGuidance =
      'Mandatory well-fitted N95 / KN95 / KF94 respirator outdoors (cloth & surgical masks block <30% of PM2.5).';
    maskGuidanceHi =
      'बाहर निकलते समय फिटेड N95 / KF94 मास्क अनिवार्य (कपड़े या सर्जिकल मास्क PM2.5 नहीं रोकते)।';
    rules.push('RULE-MASK-N95: Outdoor PM2.5 exceeds N95 threshold for household risk profile.');
  } else if (pm25 >= 55) {
    maskGuidance =
      'N95 recommended for commutes >20 mins, two-wheeler riders, and sensitive household members.';
    maskGuidanceHi = '20 मिनट से अधिक सफर, दोपहिया चालकों और संवेदनशील सदस्यों के लिए N95 मास्क।';
    rules.push('RULE-MASK-COMMUTE: Elevated PM2.5 during outdoor transit.');
  }

  const outdoorExerciseAllowed = pm25 < (hasSensitive ? 55 : 90);
  if (!outdoorExerciseAllowed) {
    rules.push('RULE-EXERCISE-INDOOR: Morning/evening outdoor jogging suspended due to PM2.5 inversion.');
  }

  let schoolRecessAdvice = 'Normal outdoor play and sports permitted.';
  if (pm25 >= 150) {
    schoolRecessAdvice =
      'Cancel all outdoor assembly, sports, and recess. Move PE indoors and keep classroom doors closed.';
    rules.push('RULE-SCHOOL-SEVERE: PM2.5 >= 150 ug/m3 triggers indoor-only school protocol.');
  } else if (pm25 >= 90) {
    schoolRecessAdvice =
      'Shorten outdoor recess to <15 min between 1:00–3:30 PM only; exempt students with asthma.';
    rules.push('RULE-SCHOOL-RESTRICT: PM2.5 >= 90 ug/m3 limits outdoor recess duration.');
  }

  let ventilationRule =
    'Open opposite windows for 20–30 minutes to flush indoor CO2 and cooking fumes.';
  if (pm25 >= 120) {
    ventilationRule = `Keep windows sealed during morning/night inversion. Brief 10–15 min cross-ventilation ONLY during ${locality.safeVentilationWindow} when boundary layer rises.`;
    rules.push('RULE-VENT-SEAL: Severe outdoor PM2.5; restrict ventilation to afternoon mixing window.');
  } else if (pm25 >= 60) {
    ventilationRule = `Ventilate selectively during ${locality.safeVentilationWindow}; run kitchen exhaust during cooking.`;
    rules.push('RULE-VENT-WINDOW: Timed afternoon ventilation.');
  }

  const redFlagMessage = clinicalRedFlagTriggered
    ? 'MEDICAL ESCALATION: Symptoms like wheezing, breathlessness, chest tightness, or an ineffective rescue inhaler require prompt medical attention. Vayu Pulse is not a diagnostic tool — contact a doctor or emergency helpline (India: 108 / 112) immediately.'
    : null;

  if (clinicalRedFlagTriggered) {
    rules.unshift('RULE-CLINICAL-ESCALATION: Acute respiratory symptom detected; immediate care guidance enforced.');
  }

  return {
    emergencyModeRecommended,
    clinicalRedFlagTriggered,
    redFlagMessage,
    maskGuidance,
    maskGuidanceHi,
    outdoorExerciseAllowed,
    schoolRecessAdvice,
    ventilationRule,
    deterministicRulesApplied: rules,
  };
}

/**
 * Quantified Impact Explainer Calculator.
 * Computes estimated PM2.5 exposure reduction (ug/m3 and %), CO2e avoided, and community scaling.
 */
export function calculateHabitImpact(
  outdoorPm25: number,
  completedIds: string[],
  allActions: HabitAction[],
  communityHouseholds = 120
): ImpactSummary {
  const completed = allActions.filter((a) => completedIds.includes(a.id));

  // Combine exposure reductions multiplicatively (diminishing returns capped at 78% realistic max)
  let remainingExposureFactor = 1;
  let dailyCo2AvoidedKg = 0;
  let dailyPmAvoidedGrams = 0;

  for (const action of completed) {
    remainingExposureFactor *= 1 - action.exposureReductionPct / 100;
    dailyCo2AvoidedKg += action.co2AvoidedKgPerDay;
    dailyPmAvoidedGrams += action.pmAvoidedGramsPerDay;
  }

  const combinedPct = Math.min(78, Math.round((1 - remainingExposureFactor) * 100));
  const totalExposureReductionUgM3 = Math.round((outdoorPm25 * combinedPct) / 100);
  const roundedDailyCo2 = Number(dailyCo2AvoidedKg.toFixed(2));
  const monthlyCo2AvoidedKg = Number((roundedDailyCo2 * 30).toFixed(1));
  const communityProjectedCo2KgMonth = Math.round(monthlyCo2AvoidedKg * communityHouseholds);

  return {
    totalExposureReductionUgM3,
    totalExposureReductionPct: combinedPct,
    dailyCo2AvoidedKg: roundedDailyCo2,
    monthlyCo2AvoidedKg,
    dailyPmAvoidedGrams: Number(dailyPmAvoidedGrams.toFixed(1)),
    communityProjectedCo2KgMonth,
    completedCount: completed.length,
  };
}

export function getBandLabelColorBlindSafe(band: AqiBandLevel): string {
  switch (band) {
    case 'good':
      return 'Good (L1)';
    case 'satisfactory':
      return 'Satisfactory (L2)';
    case 'moderate':
      return 'Moderate (L3)';
    case 'poor':
      return 'Poor / USG (L4)';
    case 'very-poor':
      return 'Very Poor (L5)';
    case 'severe':
      return 'Severe / Hazardous (L6)';
  }
}
