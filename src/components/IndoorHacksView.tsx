import React, { useState } from 'react';
import { Calculator, Check, Flame, Info, ShieldOff, Wind } from 'lucide-react';
import { INDOOR_MYTH_BUSTERS } from '../data/localities';
import type { BudgetTier, HabitAction, HouseholdProfile } from '../types/vayu';

interface IndoorHacksViewProps {
  profile: HouseholdProfile;
  habits: HabitAction[];
  completedHabitIds: string[];
  onToggleHabit: (id: string) => void;
}

export const IndoorHacksView: React.FC<IndoorHacksViewProps> = ({
  profile,
  habits,
  completedHabitIds,
  onToggleHabit,
}) => {
  const isHi = profile.language === 'hi';
  const [tierFilter, setTierFilter] = useState<'all' | BudgetTier>('all');
  const [roomAreaSqFt, setRoomAreaSqFt] = useState<number>(200);
  const [ceilingFt, setCeilingFt] = useState<number>(10);

  // CADR calculation (AHAM 4.8 air changes per hour for severe smog)
  const roomVolumeM3 = (roomAreaSqFt * ceilingFt) * 0.0283168;
  const recommendedCadrM3Hr = Math.round(roomVolumeM3 * 4.8);
  const filterLifeMonths = recommendedCadrM3Hr > 320 ? '6–8 months (high smog)' : '8–10 months (moderate usage)';

  const indoorHabits = habits.filter((h) => h.category === 'indoor' || h.category === 'routine');
  const visibleHabits =
    tierFilter === 'all' ? indoorHabits : indoorHabits.filter((h) => h.budgetTier === tierFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111613] dark:text-[#F4F7F5]">
            {isHi ? 'इनडोर एयर हैक्स और प्यूरीफायर गाइड' : 'Indoor Air Quality & Budget-Tiered Hacks'}
          </h1>
          <p className="mt-1 text-sm text-[#58635B] dark:text-[#96A299]">
            {isHi
              ? 'मुफ़्त, कम-खर्च (DIY) और प्रीमियम समाधान — बिना किसी ब्रांड प्रचार के।'
              : 'Brand-agnostic ventilation, cooking, DIY filtration, and CADR sizing — built for every budget.'}
          </p>
        </div>

        {/* Budget Tier Filter */}
        <div className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#272C28] p-1">
          {(['all', 'free', 'low-cost', 'premium'] as const).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setTierFilter(tier)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                tierFilter === tier
                  ? 'bg-[#8AD66D] text-[#0E160C]'
                  : 'text-[#4D5850] dark:text-[#A4B0A7] hover:text-[#111613] dark:hover:text-white'
              }`}
            >
              {tier === 'all'
                ? 'All Tiers'
                : tier === 'free'
                ? 'Free (₹0)'
                : tier === 'low-cost'
                ? 'Low-Cost (<₹2.5k)'
                : 'Premium (HEPA)'}
            </button>
          ))}
        </div>
      </div>

      {/* Budget-Filtered Indoor Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleHabits.map((item) => {
          const active = completedHabitIds.includes(item.id);
          return (
            <article
              key={item.id}
              className="rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs text-[#647067] dark:text-[#8E9B92]">
                  <span className="font-mono uppercase tracking-wider">{item.budgetTier}</span>
                  <span className="font-mono tabular-nums text-[#206B1C] dark:text-[#88D46B] font-semibold">
                    -{item.exposureReductionPct}% PM2.5 · {item.confidence}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-[#111613] dark:text-[#F1F5F2]">
                  {isHi ? item.titleHi : item.title}
                </h2>
                <p className="text-sm text-[#434F47] dark:text-[#B8C4BB] leading-relaxed">
                  {isHi ? item.summaryHi : item.summary}
                </p>
                <p className="text-xs text-[#647067] dark:text-[#88948B]">
                  Assumption: {item.assumption}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E6ECE8] dark:border-[#242925]">
                <span className="text-xs text-[#5A675E] dark:text-[#96A299]">
                  {item.localAvailability}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleHabit(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                    active
                      ? 'bg-[#8AD66D] text-[#0E160C]'
                      : 'border border-[#CCD6CF] dark:border-[#363D38] text-[#1A231C] dark:text-[#E6EDE8] hover:bg-[#EFF4F0] dark:hover:bg-[#232824]'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5" />}
                  {active ? 'Adopted' : 'Add to Routine'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Interactive HEPA CADR Room Calculator + Cooking Practices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <section className="lg:col-span-7 rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#8AD66D] flex items-center justify-center text-[#0E160C]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#111613] dark:text-[#F1F5F2]">
                Brand-Agnostic HEPA CADR & Filter Sizing Calculator
              </h2>
              <p className="text-xs text-[#5E6A61] dark:text-[#8E9B92]">
                Size any True HEPA H13 purifier or DIY box-fan filter for 4.8 air changes/hour during winter smog.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#37423B] dark:text-[#C5D1C8]">
                Room Floor Area (sq ft): <strong className="font-mono">{roomAreaSqFt} sq ft</strong>
              </span>
              <input
                type="range"
                min={80}
                max={600}
                step={20}
                value={roomAreaSqFt}
                onChange={(e) => setRoomAreaSqFt(Number(e.target.value))}
                className="w-full accent-[#88D46B]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#37423B] dark:text-[#C5D1C8]">
                Ceiling Height (ft): <strong className="font-mono">{ceilingFt} ft</strong>
              </span>
              <input
                type="range"
                min={8}
                max={14}
                step={1}
                value={ceilingFt}
                onChange={(e) => setCeilingFt(Number(e.target.value))}
                className="w-full accent-[#88D46B]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="rounded-2xl bg-[#EEF4F0] dark:bg-[#121413] p-3.5">
              <div className="text-[11px] text-[#5E6A61] dark:text-[#8B978E]">Minimum CADR</div>
              <div className="text-xl font-bold font-mono tabular-nums text-[#1E5E1A] dark:text-[#88D46B] mt-0.5">
                {recommendedCadrM3Hr} m³/hr
              </div>
            </div>
            <div className="rounded-2xl bg-[#EEF4F0] dark:bg-[#121413] p-3.5">
              <div className="text-[11px] text-[#5E6A61] dark:text-[#8B978E]">Est. Filter Life</div>
              <div className="text-sm font-semibold text-[#111613] dark:text-[#F1F5F2] mt-1">
                {filterLifeMonths}
              </div>
            </div>
            <div className="rounded-2xl bg-[#EEF4F0] dark:bg-[#121413] p-3.5">
              <div className="text-[11px] text-[#5E6A61] dark:text-[#8B978E]">Safety Spec</div>
              <div className="text-sm font-semibold text-[#111613] dark:text-[#F1F5F2] mt-1">
                True HEPA H13 · No Ionizer
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#111613] dark:text-[#F1F5F2]">
            <Flame className="w-4 h-4 text-[#E8833A]" />
            <span>Cleaner Cooking & Winter Heating Checklist</span>
          </div>
          <ul className="space-y-2.5 text-sm text-[#39453D] dark:text-[#C0CCC3]">
            <li className="flex gap-2">
              <Wind className="w-4 h-4 text-[#88D46B] shrink-0 mt-0.5" />
              <span>Run kitchen chimney/exhaust 5 min before and 10 min after high-heat tadka or frying.</span>
            </li>
            <li className="flex gap-2">
              <Wind className="w-4 h-4 text-[#88D46B] shrink-0 mt-0.5" />
              <span>Use oil-filled radiator or ceramic space heater instead of unvented coal/wood angithi indoors (CO poisoning risk).</span>
            </li>
            <li className="flex gap-2">
              <Wind className="w-4 h-4 text-[#88D46B] shrink-0 mt-0.5" />
              <span>Vacuum purifier mesh pre-filter every 14 days to extend HEPA filter life by ~30%.</span>
            </li>
          </ul>
        </section>
      </div>

      {/* Plants vs. Myths Science Section */}
      <section className="rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldOff className="w-4 h-4 text-[#B548C9]" />
          <h2 className="text-base font-semibold text-[#111613] dark:text-[#F1F5F2]">
            Indoor Air Myths vs. Peer-Reviewed Science
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INDOOR_MYTH_BUSTERS.map((item) => (
            <div
              key={item.myth}
              className="rounded-2xl bg-[#F4F7F5] dark:bg-[#131514] border border-[#E2E9E4] dark:border-[#232824] p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#7A2D6E] dark:text-[#D58AE2]">
                  {item.verdict}
                </span>
                <Info className="w-3.5 h-3.5 text-[#7B877E]" />
              </div>
              <h3 className="text-sm font-semibold text-[#111613] dark:text-[#F1F5F2]">
                “{item.myth}”
              </h3>
              <p className="text-xs text-[#4A564E] dark:text-[#AAB7AE] leading-relaxed">
                {item.reality}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
