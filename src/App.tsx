import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bell,
  CalendarClock,
  Download,
  Home,
  MapPin,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  User,
  WifiOff,
  X,
} from 'lucide-react';
import { HABIT_ACTIONS, LOCALITIES } from './data/localities';
import type { HouseholdProfile, NavSection } from './types/vayu';
import { calculateHabitImpact, evaluateSafetyRules } from './utils/aqiEngine';
import { useOnlineStatus, usePWAInstall } from './hooks/usePWAInstall';
import { OverviewDashboard } from './components/OverviewDashboard';
import { DailyPlanView } from './components/DailyPlanView';
import { IndoorHacksView } from './components/IndoorHacksView';
import { ImpactEcoView } from './components/ImpactEcoView';
import { VayuChatView } from './components/VayuChatView';
import { CommunityRwaView, EmergencyModeView } from './components/CommunityEmergencyView';
import { AuthQuickStartModal, ProfileDashboardView } from './components/ProfileAuthView';
import { PrdBlueprintView } from './components/PrdBlueprintView';
import { BreathingModal } from './components/BreathingModal';

const PROFILE_STORAGE_KEY = 'vayu_pulse_profile_v1';
const HABITS_STORAGE_KEY = 'vayu_pulse_habits_v1';
const THEME_STORAGE_KEY = 'vayu_pulse_theme_v2';

const DEFAULT_PROFILE: HouseholdProfile = {
  account: {
    signedIn: false,
    anonymousMode: true,
    name: 'GOLDY',
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

const DEFAULT_HABITS = ['shift-ventilation', 'wet-mop-seal', 'skip-incense-coils', 'corsirosenthal-diy', 'metro-carpool-swap'];

function loadSavedProfile(): HouseholdProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<HouseholdProfile>;
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      account: { ...DEFAULT_PROFILE.account, ...(parsed.account ?? {}) },
      sensitivities: { ...DEFAULT_PROFILE.sensitivities, ...(parsed.sensitivities ?? {}) },
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function loadSavedHabits(): string[] {
  try {
    const raw = localStorage.getItem(HABITS_STORAGE_KEY);
    if (!raw) return DEFAULT_HABITS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_HABITS;
  } catch {
    return DEFAULT_HABITS;
  }
}

function VayuBotanicalMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="18" cy="18" r="14" stroke="#B9E45A" strokeWidth="2.6" />
      <path
        d="M11.5 20.5c1.8-4.2 4.2-6.3 6.5-6.3s4.7 2.1 6.5 6.3"
        stroke="#B9E45A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getTimeGreeting(isHi: boolean): string {
  const hr = new Date().getHours();
  if (isHi) {
    if (hr < 12) return 'सुप्रभात';
    if (hr < 17) return 'नमस्कार';
    return 'शुभ संध्या';
  }
  if (hr < 12) return 'Good morning';
  if (hr < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());
  } catch {
    return 'Sunday, 22 November';
  }
}

export default function App() {
  // Default to the serene light sage-stone theme from the attached final_ui design
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved ? saved === 'dark' : false;
    } catch {
      return false;
    }
  });
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [profile, setProfile] = useState<HouseholdProfile>(loadSavedProfile);
  const [completedHabitIds, setCompletedHabitIds] = useState<string[]>(loadSavedHabits);
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [showIosInstallToast, setShowIosInstallToast] = useState(false);

  const isOnline = useOnlineStatus();
  const pwaInstall = usePWAInstall();

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [darkMode]);

  useEffect(() => {
    document.body.classList.toggle('low-bandwidth', profile.lowBandwidth);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(completedHabitIds));
    } catch {
      // ignore
    }
  }, [completedHabitIds]);

  const locality = useMemo(
    () => LOCALITIES.find((l) => l.id === profile.cityId) ?? LOCALITIES[0],
    [profile.cityId]
  );

  const safety = useMemo(() => evaluateSafetyRules(locality, profile), [locality, profile]);

  const impact = useMemo(
    () => calculateHabitImpact(locality.outdoorPm25, completedHabitIds, HABIT_ACTIONS),
    [locality.outdoorPm25, completedHabitIds]
  );

  const toggleHabit = (id: string) => {
    setCompletedHabitIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleGeolocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('Browser geolocation unavailable; pick a locality from the dropdown.');
      return;
    }
    setGeoStatus('Locating nearest station...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let nearest = LOCALITIES[0];
        let bestDist = Infinity;
        for (const loc of LOCALITIES) {
          const d = Math.hypot(loc.lat - latitude, loc.lng - longitude);
          if (d < bestDist) {
            bestDist = d;
            nearest = loc;
          }
        }
        setProfile((prev) => ({ ...prev, cityId: nearest.id }));
        setGeoStatus(`Snapped to ${nearest.locality}, ${nearest.city}`);
      },
      () => {
        setGeoStatus('Location permission declined — choose manually.');
      },
      { timeout: 6000 }
    );
  };

  const handleResetAllData = () => {
    setProfile(DEFAULT_PROFILE);
    setCompletedHabitIds(DEFAULT_HABITS);
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      localStorage.removeItem(HABITS_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const navigateTo = (sec: NavSection) => {
    setActiveSection(sec);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: profile.lowBandwidth ? 'auto' : 'smooth' });
  };

  const isHi = profile.language === 'hi';

  const primarySidebarLinks: Array<{ id: NavSection; label: string }> = [
    { id: 'dashboard', label: isHi ? 'होम' : 'Home' },
    { id: 'daily-plan', label: isHi ? 'वायु योजना' : 'Air Quality' },
    { id: 'indoor-hacks', label: isHi ? 'कमरे और हैक्स' : 'Rooms & Hacks' },
    { id: 'impact', label: isHi ? 'प्रभाव और ऊर्जा' : 'Impact & Eco' },
    { id: 'ai-chat', label: isHi ? 'Vayu AI चैट' : 'Vayu AI' },
    { id: 'community', label: isHi ? 'समुदाय और RWA' : 'Community' },
    { id: 'emergency', label: isHi ? 'आपातकालीन' : 'Emergency' },
    { id: 'prd', label: isHi ? 'PRD स्पेक्स' : 'PRD Spec' },
  ];

  const renderFloatingSidebar = () => (
    <div className="flex flex-col h-full justify-between gap-6">
      <div className="space-y-6">
        {/* Brand Lockup */}
        <button
          type="button"
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2.5 px-2 text-left cursor-pointer"
        >
          <VayuBotanicalMark />
          <span className="font-display text-xl font-bold tracking-tight text-white whitespace-nowrap">
            vayu pulse
          </span>
        </button>

        {/* Clean Calm Sidebar Links matching final_ui */}
        <nav aria-label="Primary navigation" className="space-y-1.5">
          {primarySidebarLinks.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`w-full text-left rounded-[14px] px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#B9E45A] text-[#101D15] font-semibold'
                    : 'text-[#C8D6CC] hover:bg-[#1B2F24] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Breathing Reset Card + Settings Link (Exact Reference Match) */}
      <div className="space-y-4">
        <div className="rounded-[20px] bg-[#1A2D22] border border-[#243B2E] p-4 space-y-3">
          <div className="text-[11px] font-medium text-[#9DB0A2]">
            {isHi ? 'ब्रीदिंग रूम' : 'Breathing room'}
          </div>
          <div className="text-[15px] font-bold leading-snug text-white">
            {isHi ? '2 मिनट रीसेट, खिड़कियाँ बंद' : '2 min reset, windows closed'}
          </div>
          <button
            type="button"
            onClick={() => setBreathingOpen(true)}
            className="w-full rounded-[12px] bg-[#B9E45A] hover:bg-[#C6EC72] py-2.5 text-xs font-bold text-[#101D15] transition-colors cursor-pointer"
          >
            {isHi ? 'साँस अभ्यास शुरू करें' : 'Start breathing'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('profile')}
          className={`w-full text-left rounded-[12px] px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
            activeSection === 'profile'
              ? 'bg-[#B9E45A] text-[#101D15] font-semibold'
              : 'text-[#C8D6CC] hover:bg-[#1B2F24] hover:text-white'
          }`}
        >
          {isHi ? 'सेटिंग्स और प्रोफ़ाइल' : 'Settings'}
        </button>
      </div>
    </div>
  );

  const dateLine = getFormattedDate();
  const greetingText = `${getTimeGreeting(isHi)}, ${profile.account.name}`;

  return (
    <div className="min-h-screen bg-[#E9EFE2] dark:bg-[#0B130E] text-[#121F17] dark:text-[#EFF5F0] transition-colors">
      {/* Outer Padded App Canvas (lets the Dark Forest Sidebar float cleanly like final_ui) */}
      <div className="mx-auto max-w-[1440px] flex min-h-screen p-0 lg:p-4 lg:gap-6">
        {/* Desktop Floating Dark Forest Sidebar */}
        <aside className="hidden lg:block w-[228px] shrink-0 rounded-[28px] bg-[#112018] text-white p-5 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto shadow-lg shadow-[#112018]/10">
          {renderFloatingSidebar()}
        </aside>

        {/* Right Main Content Column */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top Editorial Greeting & Search Header */}
          <header className="px-4 sm:px-6 lg:px-2 pt-4 pb-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden min-h-[42px] min-w-[42px] rounded-full bg-[#112018] text-[#B9E45A] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <p className="text-xs font-medium text-[#5E6E63] dark:text-[#93A89A]">
                  {dateLine}
                </p>
                <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight leading-tight text-[#121F17] dark:text-[#F2F7F3] truncate">
                  {greetingText}
                </h1>
              </div>
            </div>

            {/* Right Search Pill + Circular Controls */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[230px]">
                <Search className="w-4 h-4 text-[#738378] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <label htmlFor="top-search-input" className="sr-only">
                  Search rooms or goals
                </label>
                <input
                  id="top-search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeSection !== 'dashboard' && e.target.value.trim()) {
                      setActiveSection('dashboard');
                    }
                  }}
                  placeholder={isHi ? 'कमरे, लक्ष्य खोजें...' : 'Search rooms, goals...'}
                  className="w-full h-10 rounded-full bg-white dark:bg-[#15221B] border border-[#DCE4D7] dark:border-[#24372C] pl-9 pr-4 text-xs text-[#121F17] dark:text-[#F0F5F1] placeholder:text-[#78887D] focus:outline-none focus:border-[#7BB54B]"
                />
              </div>

              <button
                type="button"
                onClick={() => navigateTo('emergency')}
                aria-label="Open smog alerts and emergency protocol"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#15221B] border border-[#DCE4D7] dark:border-[#24372C] flex items-center justify-center text-[#1B2B21] dark:text-[#DCE7DF] hover:border-[#7BB54B] transition-colors shrink-0 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setDarkMode((d) => !d)}
                aria-label="Toggle Light and Dark theme"
                className="w-10 h-10 rounded-full bg-white dark:bg-[#15221B] border border-[#DCE4D7] dark:border-[#24372C] flex items-center justify-center text-[#1B2B21] dark:text-[#B9E45A] hover:border-[#7BB54B] transition-colors shrink-0 cursor-pointer"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                aria-label={`Account and quick start for ${profile.account.name}`}
                className="w-10 h-10 rounded-full bg-[#112018] dark:bg-[#B9E45A] text-[#B9E45A] dark:text-[#101D15] text-xs font-bold flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
              >
                {(profile.account.name || 'S').slice(0, 1).toUpperCase()}
              </button>
            </div>
          </header>

          {/* Subtle Inline Locality / Scale / Language Bar */}
          <div className="px-4 sm:px-6 lg:px-2 pb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-[#15221B] border border-[#DAE2D5] dark:border-[#24372C] px-3 py-1">
                <MapPin className="w-3.5 h-3.5 text-[#357249] dark:text-[#B9E45A] shrink-0" />
                <label htmlFor="workspace-locality-select" className="sr-only">
                  Select locality
                </label>
                <select
                  id="workspace-locality-select"
                  value={profile.cityId}
                  onChange={(e) => setProfile((p) => ({ ...p, cityId: e.target.value }))}
                  className="bg-transparent text-xs font-medium text-[#16251B] dark:text-[#EDF4EE] focus:outline-none cursor-pointer"
                >
                  {LOCALITIES.map((loc) => (
                    <option key={loc.id} value={loc.id} className="bg-white dark:bg-[#142019]">
                      {loc.locality}, {loc.city}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleGeolocation}
                className="rounded-full bg-white/80 dark:bg-[#15221B] border border-[#DAE2D5] dark:border-[#24372C] px-3 py-1 text-xs font-medium text-[#374A3E] dark:text-[#C5D5CA] hover:border-[#7BB54B] transition-colors cursor-pointer"
              >
                Use GPS
              </button>
              {geoStatus && (
                <span className="text-[11px] text-[#2F6A40] dark:text-[#B9E45A] hidden xl:inline">
                  {geoStatus}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full bg-white/80 dark:bg-[#15221B] border border-[#DAE2D5] dark:border-[#24372C] p-0.5 text-[11px]">
                {(['NAQI', 'EPA'] as const).map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, scale: sc }))}
                    className={`px-2.5 py-0.5 rounded-full font-mono font-semibold transition-colors cursor-pointer ${
                      profile.scale === sc
                        ? 'bg-[#112018] text-[#B9E45A] dark:bg-[#B9E45A] dark:text-[#101D15]'
                        : 'text-[#55665B] dark:text-[#98AC9E]'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>

              <div className="inline-flex rounded-full bg-white/80 dark:bg-[#15221B] border border-[#DAE2D5] dark:border-[#24372C] p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, language: 'en' }))}
                  className={`px-2.5 py-0.5 rounded-full font-semibold transition-colors cursor-pointer ${
                    profile.language === 'en'
                      ? 'bg-[#112018] text-[#B9E45A] dark:bg-[#B9E45A] dark:text-[#101D15]'
                      : 'text-[#55665B] dark:text-[#98AC9E]'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, language: 'hi' }))}
                  className={`px-2.5 py-0.5 rounded-full font-semibold transition-colors cursor-pointer ${
                    profile.language === 'hi'
                      ? 'bg-[#112018] text-[#B9E45A] dark:bg-[#B9E45A] dark:text-[#101D15]'
                      : 'text-[#55665B] dark:text-[#98AC9E]'
                  }`}
                >
                  हिंदी
                </button>
              </div>

              <button
                type="button"
                onClick={() => setProfile((p) => ({ ...p, lowBandwidth: !p.lowBandwidth }))}
                className={`rounded-full px-3 py-1 text-[11px] font-medium border transition-colors cursor-pointer ${
                  profile.lowBandwidth
                    ? 'bg-[#112018] text-[#B9E45A] border-[#112018]'
                    : 'bg-white/80 dark:bg-[#15221B] border-[#DAE2D5] dark:border-[#24372C] text-[#4B5D51] dark:text-[#A4B7AA]'
                }`}
              >
                3G Lite {profile.lowBandwidth ? 'On' : 'Off'}
              </button>

              {!pwaInstall.isInstalled && (pwaInstall.isInstallable || pwaInstall.isIOS) && (
                <button
                  type="button"
                  onClick={() => {
                    if (pwaInstall.isInstallable) {
                      pwaInstall.install();
                    } else {
                      setShowIosInstallToast(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#112018] dark:bg-[#B9E45A] text-[#B9E45A] dark:text-[#101D15] px-3 py-1 text-[11px] font-semibold cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  Install App
                </button>
              )}
            </div>
          </div>

          {/* Main Workspace Viewport */}
          <main className="flex-1 px-4 sm:px-6 lg:px-2 pb-24 lg:pb-6 w-full">
            {activeSection === 'dashboard' && (
              <OverviewDashboard
                locality={locality}
                profile={profile}
                safety={safety}
                impact={impact}
                habits={HABIT_ACTIONS}
                completedHabitIds={completedHabitIds}
                searchQuery={searchQuery}
                onNavigate={navigateTo}
              />
            )}
            {activeSection === 'daily-plan' && (
              <DailyPlanView
                locality={locality}
                profile={profile}
                safety={safety}
                habits={HABIT_ACTIONS}
                completedHabitIds={completedHabitIds}
                impact={impact}
                onToggleHabit={toggleHabit}
              />
            )}
            {activeSection === 'indoor-hacks' && (
              <IndoorHacksView
                profile={profile}
                habits={HABIT_ACTIONS}
                completedHabitIds={completedHabitIds}
                onToggleHabit={toggleHabit}
              />
            )}
            {activeSection === 'impact' && (
              <ImpactEcoView
                locality={locality}
                profile={profile}
                habits={HABIT_ACTIONS}
                completedHabitIds={completedHabitIds}
                impact={impact}
                onToggleHabit={toggleHabit}
              />
            )}
            {activeSection === 'ai-chat' && (
              <VayuChatView locality={locality} profile={profile} safety={safety} />
            )}
            {activeSection === 'community' && (
              <CommunityRwaView locality={locality} profile={profile} safety={safety} />
            )}
            {activeSection === 'emergency' && (
              <EmergencyModeView locality={locality} profile={profile} safety={safety} />
            )}
            {activeSection === 'profile' && (
              <ProfileDashboardView
                profile={profile}
                onUpdateProfile={setProfile}
                onOpenAuthModal={() => setAuthModalOpen(true)}
                onResetAllData={handleResetAllData}
                onRequestGeolocation={handleGeolocation}
                geoStatus={geoStatus}
                pwaInstall={pwaInstall}
              />
            )}
            {activeSection === 'prd' && <PrdBlueprintView />}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile quick navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-[56px] border-t border-[#D8E1D2] dark:border-[#1E3026] bg-white/95 dark:bg-[#112018]/95 backdrop-blur-md grid grid-cols-5 items-center px-1"
      >
        {(
          [
            { id: 'dashboard', label: 'Home', icon: Activity },
            { id: 'daily-plan', label: 'Air Plan', icon: CalendarClock },
            { id: 'ai-chat', label: 'AI Chat', icon: Sparkles },
            { id: 'indoor-hacks', label: 'Rooms', icon: Home },
            { id: 'profile', label: 'Settings', icon: User },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateTo(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                active
                  ? 'text-[#1E5631] dark:text-[#B9E45A]'
                  : 'text-[#617066] dark:text-[#98AC9E]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-semibold leading-none">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Floating Dark Forest Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#0B130E]/65 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-[264px] max-w-[85vw] h-full bg-[#112018] text-white p-5 overflow-y-auto shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="absolute top-4 right-4 min-h-[40px] min-w-[40px] rounded-full bg-[#1C3025] text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            {renderFloatingSidebar()}
          </aside>
        </div>
      )}

      {/* Interactive 2-Min Indoor Breathing Reset Modal */}
      <BreathingModal
        open={breathingOpen}
        indoorPm25={locality.indoorPm25}
        onClose={() => setBreathingOpen(false)}
      />

      {/* Login / No-Login Quick Start Modal */}
      <AuthQuickStartModal
        open={authModalOpen}
        profile={profile}
        onClose={() => setAuthModalOpen(false)}
        onUpdateProfile={setProfile}
      />

      {/* iOS Install Guide Dialog */}
      {showIosInstallToast && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-sm rounded-[24px] bg-white dark:bg-[#142019] border border-[#DCE4D7] dark:border-[#24372C] p-5 space-y-3">
            <h3 className="text-base font-semibold text-[#121F17] dark:text-[#EFF5F0]">
              Install Vayu Pulse on iPhone / iPad
            </h3>
            <p className="text-xs text-[#4F5F54] dark:text-[#A4B7AA] leading-relaxed">
              1. Tap the <strong>Share</strong> icon in Safari&apos;s toolbar.<br />
              2. Scroll down and select <strong>Add to Home Screen</strong>.<br />
              3. Launch Vayu Pulse anytime — even offline on 3G.
            </p>
            <button
              type="button"
              onClick={() => setShowIosInstallToast(false)}
              className="w-full rounded-full bg-[#112018] dark:bg-[#B9E45A] py-2 text-xs font-semibold text-[#B9E45A] dark:text-[#101D15] cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Offline Mode Indicator */}
      {!isOnline && (
        <div
          role="status"
          className="fixed bottom-16 lg:bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#112018] text-[#B9E45A] px-4 py-2 text-xs font-medium shadow-lg"
        >
          <WifiOff className="w-3.5 h-3.5" />
          Offline Mode — Showing last cached AQI & Daily Plan
        </div>
      )}
    </div>
  );
}
