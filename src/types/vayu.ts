export type AqiScale = 'NAQI' | 'EPA';
export type Language = 'en' | 'hi';
export type BudgetTier = 'free' | 'low-cost' | 'premium';
export type HomeType = 'apartment' | 'independent' | 'high-rise' | 'ground-floor';
export type CommuteMode = 'metro-bus' | 'two-wheeler' | 'car' | 'walk-cycle' | 'work-from-home';
export type PersonaPreset = 'parent' | 'elderly' | 'commuter' | 'rwa-admin';

export type NavSection =
  | 'dashboard'
  | 'daily-plan'
  | 'indoor-hacks'
  | 'impact'
  | 'ai-chat'
  | 'community'
  | 'emergency'
  | 'profile'
  | 'prd';

export interface UserAccount {
  signedIn: boolean;
  anonymousMode: boolean;
  name: string;
  contact: string; // email or phone (optional in quick-start)
  roleLabel: string;
}

export interface HouseholdProfile {
  account: UserAccount;
  persona: PersonaPreset;
  cityId: string;
  sensitivities: {
    childrenUnder12: boolean;
    elderlyOver65: boolean;
    asthmaOrCopd: boolean;
    pregnant: boolean;
    outdoorWorker: boolean;
  };
  homeType: HomeType;
  commuteMode: CommuteMode;
  budgetTier: BudgetTier;
  hasPurifier: boolean;
  scale: AqiScale;
  language: Language;
  lowBandwidth: boolean;
  pushAlertsEnabled: boolean;
  whatsappDigestEnabled: boolean;
}

export interface RoomReading {
  id: string;
  name: string;
  nameHi: string;
  devicesCount: number;
  indoorPm25: number;
  co2Ppm: number;
  ventilationTip: string;
}

export interface TrendPoint {
  label: string;
  indoorPm25: number;
  outdoorPm25: number;
}

export interface LocalityAirData {
  id: string;
  city: string;
  locality: string;
  localityHi: string;
  regionBreadcrumb: string;
  lat: number;
  lng: number;
  source: string;
  updatedAt: string;
  outdoorPm25: number;
  indoorPm25: number;
  pm10: number;
  no2: number;
  o3: number;
  tempC: number;
  humidityPct: number;
  windKmh: number;
  inversionRisk: 'High' | 'Moderate' | 'Low';
  primaryDriver: string;
  primaryDriverHi: string;
  powerKwh: number;
  hourlyTrend: TrendPoint[];
  monthlyTrend: TrendPoint[];
  rooms: RoomReading[];
  safeVentilationWindow: string;
  worstSmogWindow: string;
  schoolAdvisory: string;
}

export type AqiBandLevel =
  | 'good'
  | 'satisfactory'
  | 'moderate'
  | 'poor'
  | 'very-poor'
  | 'severe';

export interface AqiEvaluation {
  scale: AqiScale;
  aqi: number;
  category: string;
  categoryHi: string;
  shortCode: string; // color-blind-safe symbol/code
  band: AqiBandLevel;
  ringColor: string;
  badgeBg: string;
  badgeText: string;
  meaningPlain: string;
  meaningPlainHi: string;
}

export interface SafetyRuleResult {
  emergencyModeRecommended: boolean;
  clinicalRedFlagTriggered: boolean;
  redFlagMessage: string | null;
  maskGuidance: string;
  maskGuidanceHi: string;
  outdoorExerciseAllowed: boolean;
  schoolRecessAdvice: string;
  ventilationRule: string;
  deterministicRulesApplied: string[];
}

export interface HabitAction {
  id: string;
  category: 'routine' | 'indoor' | 'commute' | 'community';
  title: string;
  titleHi: string;
  timeWindow: string;
  budgetTier: BudgetTier;
  summary: string;
  summaryHi: string;
  exposureReductionPct: number; // % reduction in personal PM2.5 exposure
  co2AvoidedKgPerDay: number;
  pmAvoidedGramsPerDay: number;
  confidence: 'High' | 'Medium' | 'Directional';
  assumption: string;
  localAvailability: string;
}

export interface ImpactSummary {
  totalExposureReductionUgM3: number;
  totalExposureReductionPct: number;
  dailyCo2AvoidedKg: number;
  monthlyCo2AvoidedKg: number;
  dailyPmAvoidedGrams: number;
  communityProjectedCo2KgMonth: number;
  completedCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: string[];
  safetyNotice?: string | null;
  deterministicSummary?: string[];
  confidence?: string;
  isError?: boolean;
}
