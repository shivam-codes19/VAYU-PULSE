import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHabitImpact,
  computePm25Aqi,
  detectClinicalRedFlags,
  evaluateAqi,
  evaluateSafetyRules,
} from './aqiEngine';
import type { HabitAction, HouseholdProfile, LocalityAirData } from '../types/vayu';

const mockLocality: LocalityAirData = {
  id: 'delhi-anand-vihar',
  city: 'Delhi NCR',
  locality: 'Anand Vihar',
  localityHi: 'आनंद विहार',
  regionBreadcrumb: 'Delhi NCR',
  lat: 28.6469,
  lng: 77.316,
  source: 'CPCB + OpenAQ',
  updatedAt: '11:00 AM',
  outdoorPm25: 244,
  indoorPm25: 12,
  pm10: 368,
  no2: 74,
  o3: 41,
  tempC: 16,
  humidityPct: 72,
  windKmh: 5,
  inversionRisk: 'High',
  primaryDriver: 'Winter thermal inversion + vehicular + regional biomass plume',
  primaryDriverHi: 'शीतकालीन इन्वर्जन + वाहन धुआँ',
  powerKwh: 151.27,
  hourlyTrend: [],
  monthlyTrend: [],
  rooms: [],
  safeVentilationWindow: '1:30 PM – 3:30 PM',
  worstSmogWindow: '6:00 AM – 9:30 AM & 8:00 PM – 11:30 PM',
  schoolAdvisory: 'Indoor assembly & PE only',
};

const sensitiveProfile: HouseholdProfile = {
  account: {
    signedIn: false,
    anonymousMode: true,
    name: 'Guest',
    contact: '',
    roleLabel: 'Quick Start',
  },
  persona: 'parent',
  cityId: 'delhi-anand-vihar',
  sensitivities: {
    childrenUnder12: true,
    elderlyOver65: false,
    asthmaOrCopd: true,
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

test('NAQI and US EPA breakpoints evaluate severe winter smog accurately', () => {
  const naqi = evaluateAqi(244, 'NAQI');
  assert.ok(naqi.aqi >= 380 && naqi.aqi <= 400, `Expected NAQI near 395, got ${naqi.aqi}`);
  assert.equal(naqi.category, 'Very Poor');

  const epa = evaluateAqi(244, 'EPA');
  assert.ok(epa.aqi >= 310 && epa.aqi <= 330, `Expected EPA AQI ~319, got ${epa.aqi}`);
  assert.equal(epa.category, 'Hazardous');

  const cleanIndoorNaqi = evaluateAqi(12, 'NAQI');
  assert.equal(cleanIndoorNaqi.category, 'Good');
  assert.ok(cleanIndoorNaqi.aqi <= 25);

  const cleanIndoorEpa = computePm25Aqi(12, 'EPA');
  assert.ok(cleanIndoorEpa >= 52 && cleanIndoorEpa <= 60);
});

test('deterministic safety rules trigger emergency mode and clinical red flags reliably', () => {
  assert.equal(detectClinicalRedFlags('My child is wheezing and breathless right now'), true);
  assert.equal(detectClinicalRedFlags('When should I open my bedroom windows today?'), false);

  const severeRules = evaluateSafetyRules(
    mockLocality,
    sensitiveProfile,
    'My 6 year old has chest tightness and wheezing'
  );
  assert.equal(severeRules.emergencyModeRecommended, true);
  assert.equal(severeRules.clinicalRedFlagTriggered, true);
  assert.ok(severeRules.redFlagMessage?.includes('108'));
  assert.equal(severeRules.outdoorExerciseAllowed, false);
  assert.ok(severeRules.maskGuidance.includes('N95'));
  assert.ok(severeRules.deterministicRulesApplied.length >= 4);
});

test('impact explainer calculates multiplicative exposure reduction and community CO2e', () => {
  const actions: HabitAction[] = [
    {
      id: 'a1',
      category: 'indoor',
      title: 'Wet mop + seal window drafts',
      titleHi: 'गीला पोछा',
      timeWindow: '8:00 AM',
      budgetTier: 'free',
      summary: 'Reduces re-suspended dust and infiltration.',
      summaryHi: 'धूल कम करता है।',
      exposureReductionPct: 25,
      co2AvoidedKgPerDay: 0.4,
      pmAvoidedGramsPerDay: 1.2,
      confidence: 'High',
      assumption: 'Assumes standard 2BHK with 1.5 ACH draft leakage.',
      localAvailability: 'Zero-cost household supplies',
    },
    {
      id: 'a2',
      category: 'commute',
      title: 'Switch commute to Delhi Metro',
      titleHi: 'मेट्रो उपयोग',
      timeWindow: '9:00 AM',
      budgetTier: 'low-cost',
      summary: 'Avoids open-road PM2.5 and tailpipe CO2.',
      summaryHi: 'वाहन धुआँ बचाता है।',
      exposureReductionPct: 40,
      co2AvoidedKgPerDay: 3.6,
      pmAvoidedGramsPerDay: 2.8,
      confidence: 'High',
      assumption: '18 km round-trip replacing solo petrol car.',
      localAvailability: 'Metro Blue/Pink Line within 1.2 km',
    },
  ];

  const impact = calculateHabitImpact(244, ['a1', 'a2'], actions, 100);
  // 1 - (0.75 * 0.60) = 0.55 => 55%
  assert.equal(impact.totalExposureReductionPct, 55);
  assert.equal(impact.totalExposureReductionUgM3, Math.round(244 * 0.55));
  assert.equal(impact.dailyCo2AvoidedKg, 4);
  assert.equal(impact.monthlyCo2AvoidedKg, 120);
  assert.equal(impact.communityProjectedCo2KgMonth, 12000);
});
