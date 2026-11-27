import React, { useState } from 'react';
import {
  AlertOctagon,
  Building2,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  GraduationCap,
  HeartHandshake,
  PhoneCall,
  Share2,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { RWA_COMMUNITY_DATA } from '../data/localities';
import type {
  HouseholdProfile,
  LocalityAirData,
  SafetyRuleResult,
} from '../types/vayu';
import { evaluateAqi } from '../utils/aqiEngine';

interface CommunityRwaViewProps {
  locality: LocalityAirData;
  profile: HouseholdProfile;
  safety: SafetyRuleResult;
}

export const CommunityRwaView: React.FC<CommunityRwaViewProps> = ({
  locality,
  profile,
  safety,
}) => {
  const isHi = profile.language === 'hi';
  const [joinedIds, setJoinedIds] = useState<string[]>(['ch-guard-heaters']);
  const [copied, setCopied] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  const aqiEval = evaluateAqi(locality.outdoorPm25, profile.scale);

  const alertCardText = [
    `VAYU PULSE ALERT · ${locality.locality}, ${locality.city} (${locality.updatedAt})`,
    `Outdoor PM2.5: ${locality.outdoorPm25} ug/m3 (${profile.scale} ${aqiEval.aqi} - ${aqiEval.category})`,
    `Safest Ventilation Window: ${locality.safeVentilationWindow}`,
    `Mask Rule: ${safety.maskGuidance}`,
    `School / Kids: ${safety.schoolRecessAdvice}`,
    `Community Tip: Report open leaf/waste burning; use RWA electric heaters at gates.`,
    `Zero-install PWA: Know your air. Change your day.`,
  ].join('\n');

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(alertCardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareNote('Clipboard access blocked in this browser — select and copy text from the card.');
    }
  };

  const handleWebShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Vayu Pulse Alert — ${locality.locality}`,
          text: alertCardText,
        });
        setShareNote('Alert card shared successfully.');
        return;
      } catch {
        // User cancelled or share unavailable; fall back to copy
      }
    }
    await handleCopyCard();
    setShareNote('Copied WhatsApp-ready alert card to clipboard.');
  };

  const toggleChallenge = (id: string) => {
    setJoinedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#111613] dark:text-[#F4F7F5]">
          {isHi ? 'समुदाय, RWA और स्कूल डैशबोर्ड' : 'Community, RWA & School Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-[#58635B] dark:text-[#96A299]">
          {RWA_COMMUNITY_DATA.societyName} · Coordinate low-emission habits and share bilingual WhatsApp alert cards.
        </p>
      </div>

      {/* RWA Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[20px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-4">
          <div className="text-xs text-[#5E6A61] dark:text-[#8E9B92]">Active Households</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#111613] dark:text-[#F4F7F5]">
            {RWA_COMMUNITY_DATA.activeHouseholds}
            <span className="text-sm font-normal text-[#647067]"> / {RWA_COMMUNITY_DATA.totalHouseholds}</span>
          </div>
        </div>
        <div className="rounded-[20px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-4">
          <div className="text-xs text-[#5E6A61] dark:text-[#8E9B92]">Weekly CO₂e Avoided</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#206B1C] dark:text-[#88D46B]">
            {RWA_COMMUNITY_DATA.weeklyCo2AvoidedKg} kg
          </div>
        </div>
        <div className="rounded-[20px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-4">
          <div className="text-xs text-[#5E6A61] dark:text-[#8E9B92]">Night Bonfires Prevented</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#111613] dark:text-[#F4F7F5]">
            {RWA_COMMUNITY_DATA.bonfiresPrevented}
          </div>
        </div>
        <div className="rounded-[20px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-4">
          <div className="text-xs text-[#5E6A61] dark:text-[#8E9B92]">Aligned Schools</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-[#111613] dark:text-[#F4F7F5]">
            {RWA_COMMUNITY_DATA.schoolsAligned}
          </div>
        </div>
      </div>

      {/* Shareable WhatsApp / RWA Alert Card + School Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 rounded-[24px] bg-[#161917] text-[#F4F7F5] border border-[#2C332E] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#8AD66D]" />
              <h2 className="text-base font-semibold">Shareable WhatsApp & RWA Notice Card</h2>
            </div>
            <span className="text-xs font-mono text-[#8AD66D]">Zero-Install Link Ready</span>
          </div>

          <div className="rounded-[18px] bg-[#0E100F] border border-[#262C28] p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#8AD66D]">VAYU PULSE · {locality.locality.toUpperCase()}</span>
              <span className="font-mono text-[#9AA79E]">{locality.updatedAt}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 py-1">
              <div className="rounded-xl bg-[#6C317A] px-3 py-2">
                <div className="text-[10px] text-white/80">OUTDOOR PM2.5</div>
                <div className="text-lg font-bold font-mono tabular-nums">
                  {locality.outdoorPm25} µg/m³ ({profile.scale} {aqiEval.aqi})
                </div>
              </div>
              <div className="rounded-xl bg-[#8AD66D] text-[#0E160C] px-3 py-2">
                <div className="text-[10px] font-medium opacity-80">VENTILATION WINDOW</div>
                <div className="text-sm font-bold font-mono mt-1">{locality.safeVentilationWindow}</div>
              </div>
            </div>
            <p className="text-[#DCE3DE] leading-relaxed">
              <strong>Mask:</strong> {safety.maskGuidance}
            </p>
            <p className="text-[#DCE3DE] leading-relaxed">
              <strong>School & Kids:</strong> {safety.schoolRecessAdvice}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleWebShare}
              className="inline-flex items-center gap-2 rounded-full bg-[#8AD66D] px-4 py-2 text-xs font-semibold text-[#0E160C] hover:bg-[#7CC85F] transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share via WhatsApp / Device
            </button>
            <button
              type="button"
              onClick={handleCopyCard}
              className="inline-flex items-center gap-2 rounded-full border border-[#39413B] px-4 py-2 text-xs font-medium text-[#E5ECE7] hover:bg-[#232825] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#8AD66D]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Alert Text' : 'Copy Text'}
            </button>
          </div>
          {shareNote && <p className="text-xs text-[#8AD66D]">{shareNote}</p>}
        </section>

        {/* School Admin Decision Board */}
        <section className="lg:col-span-5 rounded-[24px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 space-y-3.5">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#206B1C] dark:text-[#88D46B]" />
            <h2 className="text-base font-semibold text-[#111613] dark:text-[#F1F5F2]">
              School Principal & RWA Action Triggers
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-2xl bg-[#F4F7F5] dark:bg-[#121413] p-3.5">
              <div className="font-semibold text-[#111613] dark:text-[#F1F5F2]">
                Outdoor Assembly & Sports
              </div>
              <p className="mt-1 text-[#4B574F] dark:text-[#AAB7AE]">{safety.schoolRecessAdvice}</p>
            </div>
            <div className="rounded-2xl bg-[#F4F7F5] dark:bg-[#121413] p-3.5">
              <div className="font-semibold text-[#111613] dark:text-[#F1F5F2]">
                Security Guard Winter Welfare
              </div>
              <p className="mt-1 text-[#4B574F] dark:text-[#AAB7AE]">
                Deploy electric blower/oil heaters at all society gates to replace wood/leaf bonfires that spike PM2.5 by +120 µg/m³.
              </p>
            </div>
            <div className="rounded-2xl bg-[#F4F7F5] dark:bg-[#121413] p-3.5">
              <div className="font-semibold text-[#111613] dark:text-[#F1F5F2]">
                QR Noticeboard Distribution
              </div>
              <p className="mt-1 text-[#4B574F] dark:text-[#AAB7AE]">
                Print lift-lobby QR code linking directly to <span className="font-mono">/aqi/{locality.id}</span> — zero app-store install required for residents or domestic staff.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Neighborhood Challenges */}
      <section className="rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#206B1C] dark:text-[#88D46B]" />
          <h2 className="text-base font-semibold text-[#111613] dark:text-[#F1F5F2]">
            Active Neighborhood Clean-Air Challenges
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RWA_COMMUNITY_DATA.challenges.map((ch) => {
            const joined = joinedIds.includes(ch.id);
            const count = ch.participants + (joined && ch.id !== 'ch-guard-heaters' ? 1 : 0);
            const pct = Math.min(100, Math.round((count / ch.target) * 100));
            return (
              <div
                key={ch.id}
                className="rounded-2xl bg-[#F4F7F5] dark:bg-[#131514] border border-[#E2E9E4] dark:border-[#242925] p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-[#206B1C] dark:text-[#88D46B]">{ch.status}</div>
                  <h3 className="text-sm font-semibold text-[#111613] dark:text-[#F1F5F2]">{ch.title}</h3>
                  <p className="text-xs text-[#4F5B53] dark:text-[#A4B0A7]">{ch.impactText}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono tabular-nums text-[#58635B] dark:text-[#96A299]">
                    <span>{count} / {ch.target} homes</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#DCE4DE] dark:bg-[#262B27] overflow-hidden">
                    <div className="h-full rounded-full bg-[#8AD66D]" style={{ width: `${pct}%` }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleChallenge(ch.id)}
                    className={`w-full rounded-full py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      joined
                        ? 'bg-[#8AD66D] text-[#0E160C]'
                        : 'border border-[#CCD6CF] dark:border-[#363D38] text-[#151C17] dark:text-[#E5ECE7] hover:bg-[#E8EFEA] dark:hover:bg-[#232824]'
                    }`}
                  >
                    {joined ? 'Joined Challenge' : 'Join Neighborhood Pledge'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

interface EmergencyModeViewProps {
  locality: LocalityAirData;
  profile: HouseholdProfile;
  safety: SafetyRuleResult;
}

const EMERGENCY_STEPS = [
  {
    id: 'em-1',
    title: 'Designate 1 "Clean-Air Sanctuary Room" for sleep & children/elders',
    detail: 'Close doors/windows, place a rolled damp towel at the bottom door seam, and move HEPA or DIY box-fan filter here.',
  },
  {
    id: 'em-2',
    title: 'Cancel all outdoor morning/evening walks, school sports & balcony stays',
    detail: 'During Severe inversion (PM2.5 >150 µg/m³), heavy breathing outdoors multiplies particulate dose by 4–6x.',
  },
  {
    id: 'em-3',
    title: 'Enforce fitted N95 / KF94 respirators for unavoidable outdoor commutes',
    detail: 'Pinch nose clip firmly; check zero air leak around glasses/cheeks. Do not rely on cloth or surgical masks.',
  },
  {
    id: 'em-4',
    title: 'Zero indoor combustion — stop agarbatti, dhoop, candles, coils & smoky frying',
    detail: 'Use exhaust fan during cooking and damp-mop surfaces instead of dry brooming.',
  },
  {
    id: 'em-5',
    title: 'Check rescue inhalers, hydration & vulnerable family members every 4 hours',
    detail: 'Keep prescribed asthma/COPD action plans accessible; escalate immediately if red-flag symptoms appear.',
  },
];

export const EmergencyModeView: React.FC<EmergencyModeViewProps> = ({
  locality,
  profile,
  safety,
}) => {
  const isHi = profile.language === 'hi';
  const [checked, setChecked] = useState<string[]>(['em-2', 'em-3']);
  const [checkinSent, setCheckinSent] = useState(false);

  const toggleStep = (id: string) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6">
      {/* Calm, High-Contrast Severe Smog Header */}
      <section className="rounded-[24px] bg-[#6C317A] text-white p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/90">
            <ShieldAlert className="w-4 h-4" />
            <span>Severe Pollution Emergency Flow · {locality.locality}</span>
          </div>
          <span className="font-mono text-sm font-bold tabular-nums">
            Outdoor PM2.5: {locality.outdoorPm25} µg/m³
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isHi ? 'गंभीर स्मॉग सुरक्षा प्रोटोकॉल' : 'Severe Smog Protection Protocol'}
        </h1>
        <p className="text-sm text-white/90 max-w-3xl leading-relaxed">
          Calm, step-by-step shelter guidance for severe winter inversion episodes. Focus on one clean indoor room, zero indoor smoke, and fitted N95 protection if stepping outside.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 5-Step Checklist */}
        <section className="lg:col-span-7 rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#111613] dark:text-[#F1F5F2]">
              5-Step Household Shelter Checklist
            </h2>
            <span className="text-xs font-mono tabular-nums text-[#206B1C] dark:text-[#88D46B]">
              {checked.length} / {EMERGENCY_STEPS.length} ready
            </span>
          </div>

          <div className="divide-y divide-[#E7EDE9] dark:divide-[#252926]">
            {EMERGENCY_STEPS.map((step) => {
              const done = checked.includes(step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  className="w-full py-3.5 flex items-start gap-3 text-left cursor-pointer"
                >
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-[#206B1C] dark:text-[#88D46B] shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#9AA79E] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className={`text-sm font-medium ${done ? 'line-through text-[#6E7B72]' : 'text-[#111613] dark:text-[#F1F5F2]'}`}>
                      {step.title}
                    </div>
                    <p className="text-xs text-[#5A675E] dark:text-[#96A299] mt-0.5 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Medical Escalation & Family Check-in */}
        <div className="lg:col-span-5 space-y-4">
          <section className="rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#8E2430] dark:text-[#F38B96]">
              <AlertOctagon className="w-4 h-4" />
              <span>Seek Medical Care Immediately If...</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#37423B] dark:text-[#C4D0C7] list-disc pl-4 leading-relaxed">
              <li>Persistent wheezing, labored breathing, or ribs pulling in (children).</li>
              <li>Chest tightness, chest pain, unusual dizziness, or confusion (seniors).</li>
              <li>Bluish lips/fingertips or rescue inhaler failing to relieve shortness of breath.</li>
            </ul>
            <div className="pt-2 flex flex-wrap gap-2">
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#6C317A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7F3B8F] transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Ambulance (108)
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#CFD8D1] dark:border-[#373E39] px-4 py-2 text-xs font-semibold text-[#111613] dark:text-[#F1F5F2]"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                National Emergency (112)
              </a>
            </div>
            <p className="text-[11px] text-[#647067] dark:text-[#8A968D]">
              Vayu Pulse is an environmental guidance tool, not a medical diagnostic or prescribing service.
            </p>
          </section>

          <section className="rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111613] dark:text-[#F1F5F2]">
              <HeartHandshake className="w-4 h-4 text-[#88D46B]" />
              <span>Senior & Family Safe Check-In</span>
            </div>
            <p className="text-xs text-[#58635B] dark:text-[#96A299]">
              Send a quick status update to family or RWA volunteers confirming you are indoors and safe during severe smog.
            </p>
            <button
              type="button"
              onClick={() => setCheckinSent(true)}
              className="w-full rounded-full bg-[#8AD66D] py-2.5 text-xs font-semibold text-[#0E160C] hover:bg-[#7CC85F] transition-colors cursor-pointer"
            >
              {checkinSent ? 'Safe Check-In Logged & Ready to Share' : 'Log “Indoors & Safe” Check-In'}
            </button>
            {safety.deterministicRulesApplied.length > 0 && (
              <p className="text-[11px] font-mono text-[#647067] dark:text-[#8A968D]">
                Active Rule IDs: {safety.deterministicRulesApplied.length} threshold checks enforced
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
