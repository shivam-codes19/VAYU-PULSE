import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, ShieldAlert } from 'lucide-react';
import type {
  HabitAction,
  HouseholdProfile,
  ImpactSummary,
  LocalityAirData,
  NavSection,
  RoomReading,
  SafetyRuleResult,
} from '../types/vayu';
import { evaluateAqi, evaluateCo2Status } from '../utils/aqiEngine';

interface OverviewDashboardProps {
  locality: LocalityAirData;
  profile: HouseholdProfile;
  safety: SafetyRuleResult;
  impact: ImpactSummary;
  habits: HabitAction[];
  completedHabitIds: string[];
  searchQuery: string;
  onNavigate: (section: NavSection) => void;
}

function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  locality,
  profile,
  safety,
  impact,
  habits,
  completedHabitIds,
  searchQuery,
  onNavigate,
}) => {
  const [timeframe, setTimeframe] = useState<'hourly' | 'monthly'>('hourly');
  const [selectedIndex, setSelectedIndex] = useState<number>(8);
  const [showAllRooms, setShowAllRooms] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomReading | null>(null);

  const isHi = profile.language === 'hi';
  const indoorEval = useMemo(
    () => evaluateAqi(locality.indoorPm25, profile.scale),
    [locality.indoorPm25, profile.scale]
  );
  const outdoorEval = useMemo(
    () => evaluateAqi(locality.outdoorPm25, profile.scale),
    [locality.outdoorPm25, profile.scale]
  );

  // Balance ring score based on daily habits + indoor protection
  const goalsTotal = habits.length;
  const goalsDone = completedHabitIds.length;
  const goalsLeft = Math.max(0, goalsTotal - goalsDone);
  const balancePct = Math.min(
    98,
    Math.max(24, Math.round(32 + (goalsDone / Math.max(1, goalsTotal)) * 64))
  );

  // Hero ring geometry
  const heroSize = 154;
  const heroStroke = 13;
  const heroRadius = (heroSize - heroStroke) / 2;
  const heroCirc = 2 * Math.PI * heroRadius;
  // High freshness arc when indoor PM2.5 is low
  const indoorFreshRatio = Math.max(0.18, Math.min(0.92, 1 - locality.indoorPm25 / 120));
  const heroDashOffset = heroCirc * (1 - indoorFreshRatio);

  // Balance ring geometry
  const balSize = 86;
  const balStroke = 9;
  const balRadius = (balSize - balStroke) / 2;
  const balCirc = 2 * Math.PI * balRadius;
  const balDashOffset = balCirc * (1 - balancePct / 100);

  // Smooth minimalist dual-line SVG chart geometry (matching final_ui reference)
  const series = timeframe === 'hourly' ? locality.hourlyTrend : locality.monthlyTrend;
  const activeIdx = Math.min(selectedIndex, Math.max(0, series.length - 1));
  const activePoint = series[activeIdx] ?? {
    label: '15',
    indoorPm25: locality.indoorPm25,
    outdoorPm25: locality.outdoorPm25,
  };

  const chartW = 580;
  const chartH = 180;
  const padX = 16;
  const padTop = 28;
  const padBottom = 22;
  const plotW = chartW - padX * 2;
  const plotH = chartH - padTop - padBottom;
  const maxVal = Math.max(
    180,
    ...series.map((p) => Math.max(p.outdoorPm25, p.indoorPm25))
  ) * 1.1;

  const toX = (i: number) =>
    padX + (series.length > 1 ? (i / (series.length - 1)) * plotW : plotW / 2);
  const toY = (val: number) =>
    padTop + plotH - (Math.min(maxVal, Math.max(0, val)) / maxVal) * plotH;

  const indoorCoords = series.map((pt, i) => ({ x: toX(i), y: toY(pt.indoorPm25) }));
  const outdoorCoords = series.map((pt, i) => ({ x: toX(i), y: toY(pt.outdoorPm25) }));
  const indoorPath = buildSmoothPath(indoorCoords);
  const outdoorPath = buildSmoothPath(outdoorCoords);
  const activeCoord = indoorCoords[activeIdx] ?? { x: chartW * 0.68, y: chartH * 0.7 };

  // Filter rooms by top search input
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const filteredRooms = useMemo(() => {
    if (!trimmedSearch) return locality.rooms;
    return locality.rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(trimmedSearch) ||
        r.nameHi.toLowerCase().includes(trimmedSearch) ||
        r.ventilationTip.toLowerCase().includes(trimmedSearch)
    );
  }, [locality.rooms, trimmedSearch]);

  const visibleRooms =
    showAllRooms || trimmedSearch ? filteredRooms : filteredRooms.slice(0, 3);

  const heroHeadline =
    locality.outdoorPm25 - locality.indoorPm25 >= 40
      ? isHi
        ? 'आपके घर की हवा बाहर की सड़क से कहीं शांत है।'
        : 'Your air is calmer than the street outside.'
      : isHi
      ? 'आज बाहर और अंदर दोनों की हवा संतुलित है।'
      : 'Indoor and outdoor air are calm today.';

  return (
    <div className="space-y-5">
      {/* Row 1: Dark Forest Hero Card (8 cols) + Soft Mint Balance Card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Hero Dark Pine Sanctuary Card */}
        <section className="lg:col-span-8 rounded-[26px] bg-[#112018] text-white p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Large Chartreuse PM2.5 Ring */}
          <div
            className="relative inline-flex items-center justify-center shrink-0"
            style={{ width: heroSize, height: heroSize }}
          >
            <svg width={heroSize} height={heroSize} className="-rotate-90" aria-hidden="true">
              <circle
                cx={heroSize / 2}
                cy={heroSize / 2}
                r={heroRadius}
                fill="none"
                stroke="#263B2F"
                strokeWidth={heroStroke}
              />
              <circle
                cx={heroSize / 2}
                cy={heroSize / 2}
                r={heroRadius}
                fill="none"
                stroke="#B9E45A"
                strokeWidth={heroStroke}
                strokeLinecap="round"
                strokeDasharray={heroCirc}
                strokeDashoffset={heroDashOffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[46px] font-bold font-mono tabular-nums leading-none text-[#B9E45A]">
                {locality.indoorPm25}
              </span>
              <span className="mt-1 text-[11px] font-medium text-[#B3C3B8]">
                µg/m³ PM2.5
              </span>
            </div>
          </div>

          {/* Calm Hero Copy & Inline Status Chips */}
          <div className="flex-1 min-w-0 space-y-3.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
              <span className="inline-flex items-center rounded-full bg-[#B9E45A] px-3 py-1 text-xs font-semibold text-[#101D15]">
                {isHi ? indoorEval.categoryHi : 'Fresh indoors'}
              </span>
              {safety.emergencyModeRecommended && (
                <button
                  type="button"
                  onClick={() => onNavigate('emergency')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#C9B2EE]/20 border border-[#C9B2EE]/40 px-3 py-1 text-[11px] font-semibold text-[#DFD0FA] hover:bg-[#C9B2EE]/30 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {isHi ? 'स्मॉग प्रोटोकॉल' : 'Smog Protocol'}
                </button>
              )}
            </div>

            <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-[1.18] text-white">
              {heroHeadline}
            </h2>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-mono tabular-nums">
              <span className="rounded-full bg-[#1E3327] px-3 py-1 text-[#C5F073] font-semibold">
                Indoor {locality.indoorPm25}
              </span>
              <span className="rounded-full bg-[#CEB7F2] px-3 py-1 text-[#21113B] font-semibold">
                Outdoor {locality.outdoorPm25}
              </span>
              <span className="rounded-full bg-[#1E3327] px-3 py-1 text-[#DCE8DF] font-medium">
                {profile.scale} {outdoorEval.aqi} · {isHi ? outdoorEval.categoryHi : outdoorEval.category}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-[#A9B9AE] leading-relaxed">
              {isHi
                ? `सलाह: खिड़कियाँ केवल ${locality.safeVentilationWindow} के बीच खोलें। ${safety.maskGuidanceHi}`
                : `Tip: keep windows closed until ${locality.safeVentilationWindow}. ${safety.maskGuidance}`}
            </p>
          </div>
        </section>

        {/* Soft Mint Today's Balance Card */}
        <section className="lg:col-span-4 rounded-[26px] bg-[#DDF0D2] dark:bg-[#192B20] text-[#122017] dark:text-[#ECF5EE] p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold tracking-tight">
              {isHi ? 'आज का संतुलन' : "Today's balance"}
            </h2>
            <span className="text-xs text-[#4C6151] dark:text-[#9CB2A2]">
              Air + habits
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="relative inline-flex items-center justify-center shrink-0"
              style={{ width: balSize, height: balSize }}
            >
              <svg width={balSize} height={balSize} className="-rotate-90" aria-hidden="true">
                <circle
                  cx={balSize / 2}
                  cy={balSize / 2}
                  r={balRadius}
                  fill="none"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth={balStroke}
                  className="dark:stroke-[#263C2E]"
                />
                <circle
                  cx={balSize / 2}
                  cy={balSize / 2}
                  r={balRadius}
                  fill="none"
                  stroke="#357249"
                  strokeWidth={balStroke}
                  strokeLinecap="round"
                  strokeDasharray={balCirc}
                  strokeDashoffset={balDashOffset}
                  className="dark:stroke-[#B9E45A]"
                />
              </svg>
              <span className="absolute text-lg font-bold font-mono tabular-nums">
                {balancePct}%
              </span>
            </div>

            <div>
              <div className="text-sm font-bold">
                {isHi ? 'आप सही दिशा में हैं' : "You're on track"}
              </div>
              <p className="text-xs text-[#4A5F4F] dark:text-[#A4B9AA] mt-0.5">
                {goalsLeft === 0
                  ? 'All daily air habits completed.'
                  : `${goalsLeft} routine goal${goalsLeft === 1 ? '' : 's'} left today.`}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('daily-plan')}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#1E5631] dark:text-[#B9E45A] hover:underline cursor-pointer"
              >
                {isHi ? 'दैनिक योजना खोलें' : 'Open daily plan'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-[#4C6151] dark:text-[#9BB0A1]">
            “Progress, not perfection.”
          </p>
        </section>
      </div>

      {/* Row 2: 4 Pastel Stat Cards (Mint, Sky, Peach, Lavender) — Exact Reference Palette */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigate('impact')}
          className="text-left rounded-[22px] bg-[#DDF0D2] dark:bg-[#1B2C21] p-4 sm:p-5 space-y-3 hover:brightness-[0.98] transition cursor-pointer"
        >
          <div className="text-xs font-medium text-[#465A4B] dark:text-[#A1B6A7]">
            {isHi ? 'PM2.5 सुरक्षा' : 'Exposure cut'}
          </div>
          <div className="text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-[#121F17] dark:text-[#F0F7F2] leading-none">
            -{impact.totalExposureReductionUgM3} <span className="text-sm font-semibold">µg/m³</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#18291F] dark:bg-[#B9E45A]"
              style={{ width: `${Math.min(100, Math.max(15, impact.totalExposureReductionPct))}%` }}
            />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('impact')}
          className="text-left rounded-[22px] bg-[#D5E9FA] dark:bg-[#1A2936] p-4 sm:p-5 space-y-3 hover:brightness-[0.98] transition cursor-pointer"
        >
          <div className="text-xs font-medium text-[#3D5569] dark:text-[#9BB6CC]">
            {isHi ? 'CO₂e बचत' : 'CO₂e avoided'}
          </div>
          <div className="text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-[#121F17] dark:text-[#F0F7F2] leading-none">
            {impact.dailyCo2AvoidedKg} <span className="text-sm font-semibold">kg/day</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#18291F] dark:bg-[#8AC6F6]"
              style={{ width: `${Math.min(100, Math.max(20, impact.dailyCo2AvoidedKg * 18))}%` }}
            />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('indoor-hacks')}
          className="text-left rounded-[22px] bg-[#FBDDCB] dark:bg-[#31231B] p-4 sm:p-5 space-y-3 hover:brightness-[0.98] transition cursor-pointer"
        >
          <div className="text-xs font-medium text-[#6B4E3C] dark:text-[#D5B5A2]">
            {isHi ? 'ऊर्जा उपयोग' : 'Energy today'}
          </div>
          <div className="text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-[#121F17] dark:text-[#F0F7F2] leading-none">
            {Math.round(locality.powerKwh)} <span className="text-sm font-semibold">kWh</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-[#18291F] dark:bg-[#F3B08A]" style={{ width: '58%' }} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('daily-plan')}
          className="text-left rounded-[22px] bg-[#E5D9FB] dark:bg-[#261E36] p-4 sm:p-5 space-y-3 hover:brightness-[0.98] transition cursor-pointer"
        >
          <div className="text-xs font-medium text-[#4D3D6E] dark:text-[#C1B1E6]">
            {isHi ? 'सुरक्षित विंडो' : 'Air window'}
          </div>
          <div className="text-lg sm:text-[20px] font-bold font-mono tabular-nums text-[#121F17] dark:text-[#F0F7F2] leading-tight">
            {locality.safeVentilationWindow.replace(' – ', '–')}
          </div>
          <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-[#18291F] dark:bg-[#C6AEFA]" style={{ width: '76%' }} />
          </div>
        </button>
      </div>

      {/* Row 3: Crisp White Trend Chart (7 cols) + Crisp White Rooms Card (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Clean White Indoor vs Outdoor PM2.5 Dual-Line Card */}
        <section className="lg:col-span-7 rounded-[26px] bg-white dark:bg-[#142019] border border-[#DFE6DA] dark:border-[#22342A] p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#121F17] dark:text-[#EFF5F0]">
              {isHi ? 'इनडोर बनाम बाहरी PM2.5' : 'Indoor vs outdoor PM2.5'}
            </h2>

            <div className="flex items-center gap-4 text-xs text-[#546358] dark:text-[#9BB0A1]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#112018] dark:bg-[#B9E45A]" />
                Indoor
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7A56C4]" />
                Outdoor
              </span>
              <div className="inline-flex rounded-full bg-[#EFF3EA] dark:bg-[#1D2E24] p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setTimeframe('hourly');
                    setSelectedIndex(5);
                  }}
                  className={`px-2.5 py-0.5 rounded-full font-medium cursor-pointer ${
                    timeframe === 'hourly'
                      ? 'bg-[#112018] text-white dark:bg-[#B9E45A] dark:text-[#101D15]'
                      : 'text-[#5A6A5F] dark:text-[#9FB2A5]'
                  }`}
                >
                  24h
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimeframe('monthly');
                    setSelectedIndex(8);
                  }}
                  className={`px-2.5 py-0.5 rounded-full font-medium cursor-pointer ${
                    timeframe === 'monthly'
                      ? 'bg-[#112018] text-white dark:bg-[#B9E45A] dark:text-[#101D15]'
                      : 'text-[#5A6A5F] dark:text-[#9FB2A5]'
                  }`}
                >
                  30d
                </button>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full min-w-[420px] h-auto select-none"
              role="img"
              aria-label="Indoor versus outdoor PM2.5 trend"
            >
              {/* Soft minimalist horizontal guides */}
              {[0.25, 0.55, 0.85].map((f) => (
                <line
                  key={f}
                  x1={padX}
                  y1={padTop + plotH * f}
                  x2={chartW - padX}
                  y2={padTop + plotH * f}
                  stroke="currentColor"
                  className="text-[#E7ECE2] dark:text-[#23342A]"
                  strokeDasharray="4 5"
                />
              ))}

              {/* Outdoor violet curve */}
              <path
                d={outdoorPath}
                fill="none"
                stroke="#7A56C4"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Indoor deep forest curve */}
              <path
                d={indoorPath}
                fill="none"
                stroke="currentColor"
                className="text-[#112018] dark:text-[#B9E45A]"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Interactive hover/click points */}
              {indoorCoords.map((pt, i) => (
                <circle
                  key={`pt-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={14}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setSelectedIndex(i)}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}

              {/* Selected node with chartreuse fill & floating dark pill tooltip */}
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r={5.5}
                fill="#B9E45A"
                stroke="#112018"
                strokeWidth="2.5"
              />
              <g
                transform={`translate(${Math.min(
                  chartW - 104,
                  Math.max(8, activeCoord.x - 48)
                )}, ${Math.max(4, activeCoord.y - 38)})`}
              >
                <rect width="96" height="26" rx="13" fill="#112018" />
                <text
                  x="48"
                  y="16.5"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#F4F8F2"
                  className="font-mono"
                >
                  {activePoint.indoorPm25} µg/m³
                </text>
              </g>
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EDF1E8] dark:border-[#203127] text-xs text-[#5A6A5F] dark:text-[#9AB0A1]">
            <span>
              {locality.locality}, {locality.city} · {locality.source}
            </span>
            <span className="font-mono tabular-nums">
              PM10 {locality.pm10} · NO₂ {locality.no2} · O₃ {locality.o3}
            </span>
          </div>
        </section>

        {/* Clean White Rooms Card (3 of 6 default, expandable to all 6) */}
        <section
          aria-label="Room and Zone Air Quality"
          className="lg:col-span-5 rounded-[26px] bg-white dark:bg-[#142019] border border-[#DFE6DA] dark:border-[#22342A] p-6 flex flex-col justify-between gap-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#121F17] dark:text-[#EFF5F0]">
              {isHi ? 'कमरे' : 'Rooms'}
            </h2>
            <button
              type="button"
              onClick={() => setShowAllRooms((s) => !s)}
              className="text-xs font-medium text-[#5A6A5F] dark:text-[#9BB0A1] hover:text-[#121F17] dark:hover:text-white cursor-pointer"
            >
              {showAllRooms
                ? `Showing all ${filteredRooms.length}`
                : `${Math.min(3, filteredRooms.length)} of ${locality.rooms.length}`}
            </button>
          </div>

          {visibleRooms.length === 0 ? (
            <div className="rounded-[18px] bg-[#F5F7F2] dark:bg-[#1B2A21] p-5 text-xs text-[#5A6A5F] dark:text-[#9BB0A1] text-center">
              No rooms match “{searchQuery}”.
            </div>
          ) : (
            <div className="space-y-2.5 flex-1">
              {visibleRooms.map((room) => {
                const pmEval = evaluateAqi(room.indoorPm25, profile.scale);
                const co2Eval = evaluateCo2Status(room.co2Ppm);
                const isCo2Alert = co2Eval.label === 'High';
                const isSelected = selectedRoom?.id === room.id;

                let dotColor = '#46A758';
                let badgeClasses =
                  'bg-[#DDF2D2] text-[#1D5428] dark:bg-[#1F3A26] dark:text-[#A9EA8B]';
                let statusText = isHi ? pmEval.categoryHi : pmEval.category;

                if (isCo2Alert || pmEval.band === 'very-poor' || pmEval.band === 'severe') {
                  dotColor = '#D94336';
                  badgeClasses =
                    'bg-[#FAD9D5] text-[#8E2219] dark:bg-[#3B1E1C] dark:text-[#F6A69E]';
                  statusText = isCo2Alert ? 'High' : statusText;
                } else if (pmEval.band === 'moderate' || pmEval.band === 'poor') {
                  dotColor = '#E69A1F';
                  badgeClasses =
                    'bg-[#FCECC5] text-[#7A4F07] dark:bg-[#3A2E17] dark:text-[#F7CE76]';
                }

                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoom(isSelected ? null : room)}
                    className={`w-full text-left rounded-[18px] px-4 py-3.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF3E4] dark:bg-[#223629]'
                        : 'bg-[#F5F7F2] dark:bg-[#1A2820] hover:bg-[#EDF2E7] dark:hover:bg-[#203127]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: dotColor }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#121F17] dark:text-[#F0F5F1] truncate">
                            {isHi ? room.nameHi : room.name}
                          </div>
                          <div className="text-xs text-[#617066] dark:text-[#98AC9E] truncate">
                            {isCo2Alert
                              ? `CO₂ ${room.co2Ppm} ppm · open a window`
                              : `PM2.5 ${room.indoorPm25} · ${isHi ? pmEval.categoryHi : pmEval.category}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${badgeClasses}`}
                        >
                          {statusText}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-[#77877C] transition-transform ${
                            isSelected ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-2.5 pt-2.5 border-t border-[#DCE5D6] dark:border-[#2C4134] text-xs text-[#314237] dark:text-[#C5D6CA]">
                        {room.ventilationTip}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {locality.rooms.length > 3 && !trimmedSearch && (
            <button
              type="button"
              onClick={() => setShowAllRooms((s) => !s)}
              className="text-xs font-semibold text-[#2B623D] dark:text-[#B9E45A] hover:underline self-start cursor-pointer"
            >
              {showAllRooms ? 'Show top 3 rooms' : `View all ${locality.rooms.length} rooms`}
            </button>
          )}
        </section>
      </div>
    </div>
  );
};
