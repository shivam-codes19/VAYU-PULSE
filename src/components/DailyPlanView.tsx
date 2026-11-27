import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  ShieldCheck,
  Sun,
  Sunset,
  Sunrise,
  Wind,
} from 'lucide-react';
import type {
  HabitAction,
  HouseholdProfile,
  ImpactSummary,
  LocalityAirData,
  SafetyRuleResult,
} from '../types/vayu';

interface DailyPlanViewProps {
  locality: LocalityAirData;
  profile: HouseholdProfile;
  safety: SafetyRuleResult;
  habits: HabitAction[];
  completedHabitIds: string[];
  impact: ImpactSummary;
  onToggleHabit: (id: string) => void;
}

export const DailyPlanView: React.FC<DailyPlanViewProps> = ({
  locality,
  profile,
  safety,
  habits,
  completedHabitIds,
  impact,
  onToggleHabit,
}) => {
  const isHi = profile.language === 'hi';

  const scheduleBlocks = [
    {
      id: 'morning',
      icon: Sunrise,
      time: '6:00 AM – 9:30 AM',
      title: isHi ? 'सुबह की ब्रीफिंग (पीक स्मॉग)' : 'Morning Briefing (Peak Inversion)',
      status: locality.outdoorPm25 >= 120 ? 'Stay Indoors / N95 Required' : 'Light Caution',
      guidance: isHi
        ? `${safety.maskGuidanceHi} सुबह की सैर को दोपहर ${locality.safeVentilationWindow} तक टालें।`
        : `${safety.maskGuidance} Shift brisk morning walks indoors or reschedule to ${locality.safeVentilationWindow}.`,
    },
    {
      id: 'midday',
      icon: Sun,
      time: locality.safeVentilationWindow,
      title: isHi ? 'दोपहर वेंटिलेशन विंडो' : 'Mid-Day Ventilation & Errand Window',
      status: 'Best Outdoor Window',
      guidance: isHi
        ? 'सूरज की गर्मी से स्मॉग परत ऊपर उठती है। कमरे की CO2 निकालने के लिए 10–15 मिनट क्रॉस-वेंटिलेशन करें।'
        : 'Solar heating lifts the winter inversion layer, dropping PM2.5 by ~30–40%. Ideal 15-min cross-ventilation and essential errands window.',
    },
    {
      id: 'school',
      icon: GraduationCap,
      time: 'School & Children Hours',
      title: isHi ? 'स्कूल और बच्चों के खेलने की सलाह' : 'School & Children Outdoor Play Advisory',
      status: profile.sensitivities.childrenUnder12 ? 'Priority for Your Home' : 'Community Advisory',
      guidance: safety.schoolRecessAdvice,
    },
    {
      id: 'evening',
      icon: Sunset,
      time: '7:30 PM – 11:00 PM',
      title: isHi ? 'शाम का रिव्यू और स्लीप ज़ोन' : 'Evening Review & Clean Sleep Zone',
      status: 'Seal & Filter',
      guidance:
        profile.hasPurifier
          ? 'Close bedroom doors by 7:30 PM and run True HEPA purifier on medium for 30 min, then Sleep Mode overnight.'
          : 'Close balcony/main door gaps with a rolled damp towel, avoid mosquito coils/incense, and run a DIY box-fan filter if available.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111613] dark:text-[#F4F7F5]">
            {isHi ? 'आपकी व्यक्तिगत दैनिक वायु योजना' : 'Personalized Daily Air Plan'}
          </h1>
          <p className="mt-1 text-sm text-[#58635B] dark:text-[#96A299]">
            {isHi
              ? 'आपके परिवार की सेहत, बजट और स्थानीय मौसम के आधार पर नियम-आधारित समय-सारणी।'
              : `Rule-verified schedule for ${locality.locality} · Budget tier: ${profile.budgetTier} · Commute: ${profile.commuteMode}`}
          </p>
        </div>

        <div className="rounded-[18px] bg-[#8AD66D] text-[#0E160C] px-4 py-2.5 flex items-center gap-4">
          <div>
            <div className="text-[11px] font-medium opacity-80">
              {isHi ? 'आज की सुरक्षा' : 'Today Exposure Cut'}
            </div>
            <div className="text-lg font-bold font-mono tabular-nums">
              -{impact.totalExposureReductionUgM3} µg/m³ ({impact.totalExposureReductionPct}%)
            </div>
          </div>
          <div className="h-8 w-px bg-[#0E160C]/20" />
          <div>
            <div className="text-[11px] font-medium opacity-80">
              {isHi ? 'बचाया CO₂e' : 'Avoided CO₂e'}
            </div>
            <div className="text-lg font-bold font-mono tabular-nums">
              {impact.dailyCo2AvoidedKg} kg
            </div>
          </div>
        </div>
      </div>

      {/* Deterministic Thresholds Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-[20px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-4">
          <div className="flex items-center gap-2 text-xs text-[#647067] dark:text-[#8E9B92]">
            <ShieldCheck className="w-4 h-4 text-[#206B1C] dark:text-[#88D46B]" />
            <span>{isHi ? 'मास्क नियम' : 'Mask Guidance (Deterministic)'}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-[#111613] dark:text-[#F1F5F2] leading-snug">
            {isHi ? safety.maskGuidanceHi : safety.maskGuidance}
          </p>
        </div>

        <div className="rounded-[20px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-4">
          <div className="flex items-center gap-2 text-xs text-[#647067] dark:text-[#8E9B92]">
            <Wind className="w-4 h-4 text-[#206B1C] dark:text-[#88D46B]" />
            <span>{isHi ? 'व्यायाम स्थिति' : 'Outdoor Exercise Rule'}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-[#111613] dark:text-[#F1F5F2] leading-snug">
            {safety.outdoorExerciseAllowed
              ? 'Light-to-moderate outdoor exercise permitted outside traffic corridors.'
              : 'Outdoor running/cycling suspended due to inversion PM2.5; shift to indoor mobility or yoga.'}
          </p>
        </div>

        <div className="rounded-[20px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-4">
          <div className="flex items-center gap-2 text-xs text-[#647067] dark:text-[#8E9B92]">
            <Clock className="w-4 h-4 text-[#206B1C] dark:text-[#88D46B]" />
            <span>{isHi ? 'सबसे सुरक्षित समय' : 'Safest Window Today'}</span>
          </div>
          <p className="mt-2 text-sm font-semibold font-mono tabular-nums text-[#111613] dark:text-[#F1F5F2]">
            {locality.safeVentilationWindow}
          </p>
          <p className="mt-0.5 text-xs text-[#5E6A61] dark:text-[#8E9B92]">
            Avoid outdoor exertion during {locality.worstSmogWindow}
          </p>
        </div>
      </div>

      {/* Timeline Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scheduleBlocks.map((block) => {
          const Icon = block.icon;
          return (
            <article
              key={block.id}
              className="rounded-[20px] bg-white dark:bg-[#161817] border border-[#DFE6E1] dark:border-[#252926] p-5 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#EFF4F0] dark:bg-[#1F2420] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#206B1C] dark:text-[#88D46B]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#111613] dark:text-[#F1F5F2]">
                      {block.title}
                    </h2>
                    <p className="text-xs font-mono text-[#5E6A61] dark:text-[#8D9A91]">{block.time}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#206B1C] dark:text-[#88D46B]">
                  {block.status}
                </span>
              </div>
              <p className="text-sm text-[#354039] dark:text-[#C1CDC4] leading-relaxed">
                {block.guidance}
              </p>
            </article>
          );
        })}
      </div>

      {/* Interactive Habit Check-Off List (Calm Gamification) */}
      <section className="rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#111613] dark:text-[#F1F5F2]">
              {isHi ? 'आज के उच्च-प्रभाव कदम (चेक करें)' : 'Today’s Actionable Routine Checklist'}
            </h2>
            <p className="text-xs text-[#5E6A61] dark:text-[#8E9B92]">
              {isHi
                ? 'हर कदम आपकी अनुमानित PM2.5 सुरक्षा और CO₂e बचत को तुरंत अपडेट करता है।'
                : 'Check off habits as you go — zero-guilt progress synced to your Impact Dashboard.'}
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-[#206B1C] dark:text-[#88D46B] font-semibold">
            {completedHabitIds.length} / {habits.length} completed
          </span>
        </div>

        <div className="divide-y divide-[#E7EDE9] dark:divide-[#252926]">
          {habits.map((habit) => {
            const done = completedHabitIds.includes(habit.id);
            return (
              <div
                key={habit.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <button
                  type="button"
                  onClick={() => onToggleHabit(habit.id)}
                  className="flex items-start gap-3 text-left flex-1 cursor-pointer group"
                >
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-[#206B1C] dark:text-[#88D46B] shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#9AA79E] dark:text-[#58635B] group-hover:text-[#88D46B] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div
                      className={`text-sm font-medium ${
                        done
                          ? 'line-through text-[#6A766D] dark:text-[#7E8B82]'
                          : 'text-[#111613] dark:text-[#F1F5F2]'
                      }`}
                    >
                      {isHi ? habit.titleHi : habit.title}
                    </div>
                    <p className="text-xs text-[#5E6A61] dark:text-[#929F96] mt-0.5">
                      {habit.timeWindow} · {habit.budgetTier} tier · Confidence: {habit.confidence}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-4 pl-8 sm:pl-0 text-xs font-mono tabular-nums shrink-0">
                  <span className="text-[#206B1C] dark:text-[#88D46B] font-semibold">
                    -{habit.exposureReductionPct}% PM2.5
                  </span>
                  <span className="text-[#58635B] dark:text-[#A4B0A7]">
                    -{habit.co2AvoidedKgPerDay} kg CO₂e
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
