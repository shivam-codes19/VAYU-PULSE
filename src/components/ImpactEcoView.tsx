import React, { useState } from 'react';
import { CheckCircle2, Circle, Leaf, ShieldCheck, Users } from 'lucide-react';
import type {
  HabitAction,
  HouseholdProfile,
  ImpactSummary,
  LocalityAirData,
} from '../types/vayu';
import { calculateHabitImpact } from '../utils/aqiEngine';

interface ImpactEcoViewProps {
  locality: LocalityAirData;
  profile: HouseholdProfile;
  habits: HabitAction[];
  completedHabitIds: string[];
  impact: ImpactSummary;
  onToggleHabit: (id: string) => void;
}

export const ImpactEcoView: React.FC<ImpactEcoViewProps> = ({
  locality,
  profile,
  habits,
  completedHabitIds,
  onToggleHabit,
}) => {
  const isHi = profile.language === 'hi';
  const [rwaHouseholds, setRwaHouseholds] = useState<number>(120);

  const scaledImpact = calculateHabitImpact(
    locality.outdoorPm25,
    completedHabitIds,
    habits,
    rwaHouseholds
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#111613] dark:text-[#F4F7F5]">
          {isHi ? 'प्रभाव व्याख्याकार और टिकाऊ विकल्प' : 'Impact Explainer & Sustainable Alternatives'}
        </h1>
        <p className="mt-1 text-sm text-[#58635B] dark:text-[#96A299]">
          {isHi
            ? 'हर सुझाव के लिए स्पष्ट PM2.5 सुरक्षा (µg/m³), CO₂e बचत, विश्वसनीयता स्तर और वैज्ञानिक आधार।'
            : 'Transparent exposure reduction (µg/m³), avoided emissions (kg CO₂e / g PM2.5), confidence tiers, and stated assumptions.'}
        </p>
      </div>

      {/* Quantified Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[20px] bg-[#8AD66D] text-[#0E160C] p-4">
          <div className="text-xs font-medium opacity-80">Personal PM2.5 Cut</div>
          <div className="mt-1 text-3xl font-bold font-mono tabular-nums">
            -{scaledImpact.totalExposureReductionUgM3} <span className="text-sm font-medium">µg/m³</span>
          </div>
          <div className="mt-1 text-xs font-mono tabular-nums opacity-85">
            -{scaledImpact.totalExposureReductionPct}% vs baseline outdoor {locality.outdoorPm25} µg/m³
          </div>
        </div>

        <div className="rounded-[20px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-4">
          <div className="text-xs text-[#5E6A61] dark:text-[#8E9B92]">Household Emissions Avoided</div>
          <div className="mt-1 text-3xl font-bold font-mono tabular-nums text-[#111613] dark:text-[#F4F7F5]">
            {scaledImpact.dailyCo2AvoidedKg} <span className="text-sm font-normal">kg CO₂e/d</span>
          </div>
          <div className="mt-1 text-xs font-mono tabular-nums text-[#206B1C] dark:text-[#88D46B]">
            {scaledImpact.monthlyCo2AvoidedKg} kg CO₂e / month
          </div>
        </div>

        <div className="rounded-[20px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-4">
          <div className="text-xs text-[#5E6A61] dark:text-[#8E9B92]">Direct PM2.5 Prevented</div>
          <div className="mt-1 text-3xl font-bold font-mono tabular-nums text-[#111613] dark:text-[#F4F7F5]">
            {scaledImpact.dailyPmAvoidedGrams} <span className="text-sm font-normal">g/day</span>
          </div>
          <div className="mt-1 text-xs text-[#5E6A61] dark:text-[#8E9B92]">
            From cleaner mobility, cooking & zero burning
          </div>
        </div>

        <div className="rounded-[20px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-4">
          <div className="flex items-center justify-between text-xs text-[#5E6A61] dark:text-[#8E9B92]">
            <span>Community Scale ({rwaHouseholds} homes)</span>
            <Users className="w-3.5 h-3.5 text-[#88D46B]" />
          </div>
          <div className="mt-1 text-3xl font-bold font-mono tabular-nums text-[#206B1C] dark:text-[#88D46B]">
            {scaledImpact.communityProjectedCo2KgMonth.toLocaleString()}
            <span className="text-sm font-normal text-[#5E6A61] dark:text-[#96A299]"> kg</span>
          </div>
          <div className="mt-1 text-xs text-[#5E6A61] dark:text-[#8E9B92]">
            Monthly neighborhood CO₂e avoided
          </div>
        </div>
      </div>

      {/* Community Multiplier Slider */}
      <section className="rounded-[20px] bg-[#D9E3DB] dark:bg-[#B4C1B6] text-[#111713] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="text-sm font-semibold">Model Your RWA / School Cluster Collective Impact</div>
          <p className="text-xs text-[#2B372E]">
            See what happens when neighboring families adopt the same {scaledImpact.completedCount} low-emission habits you selected.
          </p>
        </div>
        <label className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono font-semibold whitespace-nowrap">{rwaHouseholds} homes</span>
          <input
            type="range"
            min={10}
            max={500}
            step={10}
            value={rwaHouseholds}
            onChange={(e) => setRwaHouseholds(Number(e.target.value))}
            className="w-40 accent-[#111613]"
          />
        </label>
      </section>

      {/* Transparent Per-Recommendation Impact Table */}
      <section className="rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] overflow-hidden">
        <div className="p-5 border-b border-[#E5ECE7] dark:border-[#262A27] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#206B1C] dark:text-[#88D46B]" />
            <h2 className="text-base font-semibold text-[#111613] dark:text-[#F1F5F2]">
              Action-by-Action Impact & Scientific Assumptions
            </h2>
          </div>
          <span className="text-xs text-[#5E6A61] dark:text-[#8E9B92]">
            Toggle any action to recalculate live impact
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-[#E5ECE7] dark:border-[#262A27] text-xs text-[#5E6A61] dark:text-[#8E9B92]">
                <th className="py-3 px-5 font-medium">Recommendation & Local Availability</th>
                <th className="py-3 px-4 font-medium">Exposure Cut</th>
                <th className="py-3 px-4 font-medium">Emissions Avoided</th>
                <th className="py-3 px-4 font-medium">Confidence & Assumption</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF0EC] dark:divide-[#232724] text-sm">
              {habits.map((h) => {
                const active = completedHabitIds.includes(h.id);
                const estUgCut = Math.round((locality.outdoorPm25 * h.exposureReductionPct) / 100);
                return (
                  <tr
                    key={h.id}
                    className={`transition-colors ${
                      active ? 'bg-[#F2F8F2] dark:bg-[#1D241E]' : 'hover:bg-[#F7FAF8] dark:hover:bg-[#1D201E]'
                    }`}
                  >
                    <td className="py-3.5 px-5 align-top">
                      <button
                        type="button"
                        onClick={() => onToggleHabit(h.id)}
                        className="flex items-start gap-2.5 text-left cursor-pointer"
                      >
                        {active ? (
                          <CheckCircle2 className="w-4 h-4 text-[#206B1C] dark:text-[#88D46B] shrink-0 mt-1" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#9AA79E] shrink-0 mt-1" />
                        )}
                        <div>
                          <div className="font-medium text-[#111613] dark:text-[#F1F5F2]">
                            {isHi ? h.titleHi : h.title}
                          </div>
                          <div className="text-xs text-[#5E6A61] dark:text-[#8E9B92] mt-0.5">
                            {h.localAvailability} · {h.budgetTier}
                          </div>
                        </div>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 align-top font-mono tabular-nums whitespace-nowrap">
                      <div className="text-[#206B1C] dark:text-[#88D46B] font-semibold">
                        -{h.exposureReductionPct}%
                      </div>
                      <div className="text-xs text-[#5E6A61] dark:text-[#8E9B92]">~{estUgCut} µg/m³</div>
                    </td>
                    <td className="py-3.5 px-4 align-top font-mono tabular-nums whitespace-nowrap">
                      <div className="text-[#111613] dark:text-[#F1F5F2]">{h.co2AvoidedKgPerDay} kg CO₂e/d</div>
                      <div className="text-xs text-[#5E6A61] dark:text-[#8E9B92]">{h.pmAvoidedGramsPerDay} g PM/d</div>
                    </td>
                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#111613] dark:text-[#E5ECE7]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#88D46B]" />
                        {h.confidence}
                      </div>
                      <p className="text-xs text-[#5E6A61] dark:text-[#8E9B92] mt-0.5 leading-relaxed">
                        {h.assumption}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
