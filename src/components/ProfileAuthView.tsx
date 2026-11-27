import React, { useState } from 'react';
import {
  Bell,
  Check,
  Download,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  Shield,
  Smartphone,
  Trash2,
  User,
  Wifi,
  X,
} from 'lucide-react';
import { LOCALITIES, PERSONA_PRESETS } from '../data/localities';
import type {
  BudgetTier,
  CommuteMode,
  HomeType,
  HouseholdProfile,
  PersonaPreset,
} from '../types/vayu';

interface AuthQuickStartModalProps {
  open: boolean;
  profile: HouseholdProfile;
  onClose: () => void;
  onUpdateProfile: (next: HouseholdProfile) => void;
}

export const AuthQuickStartModal: React.FC<AuthQuickStartModalProps> = ({
  open,
  profile,
  onClose,
  onUpdateProfile,
}) => {
  const [tab, setTab] = useState<'quickstart' | 'signin'>('quickstart');
  const [nameInput, setNameInput] = useState(profile.account.signedIn ? profile.account.name : '');
  const [contactInput, setContactInput] = useState(profile.account.contact || '');
  const [formError, setFormError] = useState<string | null>(null);

  if (!open) return null;

  const applyPersonaQuickStart = (presetKey: PersonaPreset) => {
    const preset = PERSONA_PRESETS[presetKey];
    onUpdateProfile({
      ...profile,
      persona: presetKey,
      sensitivities: { ...preset.sensitivities },
      budgetTier: preset.budgetTier,
      commuteMode: preset.commuteMode,
      account: {
        ...profile.account,
        anonymousMode: true,
        name: profile.account.signedIn ? profile.account.name : preset.defaultName.split(' ')[0],
        roleLabel: preset.label,
      },
    });
    onClose();
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    const cleanContact = contactInput.trim();
    if (cleanName.length < 2) {
      setFormError('Please enter your name (at least 2 characters) to save your household profile.');
      return;
    }
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContact);
    const isValidPhone = /^\+?[0-9\s-]{8,15}$/.test(cleanContact);
    if (!isValidEmail && !isValidPhone) {
      setFormError('Enter a valid email address or 10-digit mobile number (or use No-Login Quick Start).');
      return;
    }

    setFormError(null);
    onUpdateProfile({
      ...profile,
      account: {
        signedIn: true,
        anonymousMode: false,
        name: cleanName,
        contact: cleanContact,
        roleLabel: PERSONA_PRESETS[profile.persona].label,
      },
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vayu-auth-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg rounded-[26px] bg-white dark:bg-[#141715] border border-[#DCE4DE] dark:border-[#2A302C] p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="vayu-auth-title" className="text-xl font-semibold text-[#111613] dark:text-[#F4F7F5]">
              Welcome to Vayu Pulse
            </h2>
            <p className="text-xs text-[#5A675E] dark:text-[#96A299] mt-1">
              Start instantly with zero login, or sign in to sync alerts & RWA access.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close login and quick-start dialog"
            className="min-h-[40px] min-w-[40px] rounded-full bg-[#EFF4F0] dark:bg-[#212522] flex items-center justify-center text-[#1D2520] dark:text-[#DCE3DE] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#EEF3EF] dark:bg-[#1D211E] p-1">
          <button
            type="button"
            onClick={() => {
              setTab('quickstart');
              setFormError(null);
            }}
            className={`py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'quickstart'
                ? 'bg-[#8AD66D] text-[#0E160C]'
                : 'text-[#4D5951] dark:text-[#9AA79E]'
            }`}
          >
            No-Login Quick Start
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setFormError(null);
            }}
            className={`py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              tab === 'signin'
                ? 'bg-[#8AD66D] text-[#0E160C]'
                : 'text-[#4D5951] dark:text-[#9AA79E]'
            }`}
          >
            Sign In / Save Account
          </button>
        </div>

        {tab === 'quickstart' ? (
          <div className="space-y-3">
            <p className="text-xs text-[#535F57] dark:text-[#A4B0A7]">
              Pick the household profile closest to yours — data stays privately on your device (DPDP Act compliant):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(PERSONA_PRESETS) as PersonaPreset[]).map((key) => {
                const preset = PERSONA_PRESETS[key];
                const active = profile.persona === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPersonaQuickStart(key)}
                    className={`rounded-2xl border p-3.5 text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-[#5CA844] dark:border-[#8AD66D] bg-[#EEF6EE] dark:bg-[#1D261E]'
                        : 'border-[#DCE4DE] dark:border-[#282D29] bg-[#F7FAF8] dark:bg-[#1A1D1B] hover:border-[#8AD66D]'
                    }`}
                  >
                    <div className="text-sm font-semibold text-[#111613] dark:text-[#F1F5F2]">
                      {preset.label}
                    </div>
                    <div className="text-xs text-[#5A675E] dark:text-[#96A299] mt-1">
                      {preset.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignInSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="auth-name" className="block text-xs font-medium text-[#37423B] dark:text-[#C5D1C8] mb-1">
                Full Name or Household Name
              </label>
              <input
                id="auth-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g., Priya Sharma"
                className="w-full min-h-[44px] rounded-xl bg-[#F3F6F4] dark:bg-[#0E100F] border border-[#D4DDD7] dark:border-[#2C332E] px-3.5 text-sm text-[#111613] dark:text-[#F4F7F5] focus:outline-none focus:border-[#88D46B]"
              />
            </div>

            <div>
              <label htmlFor="auth-contact" className="block text-xs font-medium text-[#37423B] dark:text-[#C5D1C8] mb-1">
                Email or WhatsApp Phone Number
              </label>
              <input
                id="auth-contact"
                type="text"
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                placeholder="e.g., priya@example.com or +91 9876543210"
                className="w-full min-h-[44px] rounded-xl bg-[#F3F6F4] dark:bg-[#0E100F] border border-[#D4DDD7] dark:border-[#2C332E] px-3.5 text-sm text-[#111613] dark:text-[#F4F7F5] focus:outline-none focus:border-[#88D46B]"
              />
            </div>

            {formError && (
              <p role="alert" className="text-xs font-medium text-[#B91C1C] dark:text-[#F87171]">
                {formError}
              </p>
            )}

            <button
              type="submit"
              className="w-full min-h-[44px] rounded-full bg-[#8AD66D] text-[#0E160C] text-sm font-semibold hover:bg-[#7CC85F] transition-colors cursor-pointer"
            >
              Sign In & Personalize Dashboard
            </button>
            <p className="text-[11px] text-[#647067] dark:text-[#8A968D] text-center">
              Zero spam · Exact home address is never stored · Delete anytime.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

interface ProfileDashboardViewProps {
  profile: HouseholdProfile;
  onUpdateProfile: (next: HouseholdProfile) => void;
  onOpenAuthModal: () => void;
  onResetAllData: () => void;
  onRequestGeolocation: () => void;
  geoStatus: string | null;
  pwaInstall: {
    isInstallable: boolean;
    isInstalled: boolean;
    isIOS: boolean;
    install: () => Promise<boolean>;
  };
}

export const ProfileDashboardView: React.FC<ProfileDashboardViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenAuthModal,
  onResetAllData,
  onRequestGeolocation,
  geoStatus,
  pwaInstall,
}) => {
  const [pushFeedback, setPushFeedback] = useState<string | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const toggleSensitivity = (key: keyof HouseholdProfile['sensitivities']) => {
    onUpdateProfile({
      ...profile,
      sensitivities: {
        ...profile.sensitivities,
        [key]: !profile.sensitivities[key],
      },
    });
  };

  const handlePushToggle = async () => {
    if (profile.pushAlertsEnabled) {
      onUpdateProfile({ ...profile, pushAlertsEnabled: false });
      setPushFeedback('Browser push alerts paused.');
      return;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      onUpdateProfile({ ...profile, whatsappDigestEnabled: true });
      setPushFeedback(
        'Web Push is unsupported on this browser — automatically enabled WhatsApp/SMS Digest fallback.'
      );
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        onUpdateProfile({ ...profile, pushAlertsEnabled: true });
        setPushFeedback('Morning Smog & Ventilation Window push alerts enabled.');
      } else {
        onUpdateProfile({ ...profile, whatsappDigestEnabled: true });
        setPushFeedback(
          'Browser notifications declined — switched smoothly to WhatsApp/SMS Alert Digest fallback.'
        );
      }
    } catch {
      onUpdateProfile({ ...profile, whatsappDigestEnabled: true });
      setPushFeedback('Switched to WhatsApp/SMS Alert Digest fallback.');
    }
  };

  const handleSignOut = () => {
    onUpdateProfile({
      ...profile,
      account: {
        signedIn: false,
        anonymousMode: true,
        name: 'Guest',
        contact: '',
        roleLabel: 'Quick Start',
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111613] dark:text-[#F4F7F5]">
            Profile, Household & Privacy Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#58635B] dark:text-[#96A299]">
            Tailor Vayu Pulse to your household sensitivities, commute, budget tier, and DPDP privacy preferences.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {profile.account.signedIn ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-[#CFD8D1] dark:border-[#373E39] px-4 py-2 text-xs font-medium text-[#151C17] dark:text-[#E5ECE7] hover:bg-[#EEF3EF] dark:hover:bg-[#232724] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 rounded-full bg-[#8AD66D] px-4 py-2 text-xs font-semibold text-[#0E160C] hover:bg-[#7CC85F] cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In / Switch Persona
            </button>
          )}
        </div>
      </div>

      {/* Account Identity & Quick Persona Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-5 rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#8AD66D] text-[#0E160C] flex items-center justify-center font-bold text-lg font-display">
              {(profile.account.name || 'V').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-base font-semibold text-[#111613] dark:text-[#F1F5F2]">
                {profile.account.name}
              </div>
              <div className="text-xs text-[#5E6A61] dark:text-[#8E9B92]">
                {profile.account.signedIn
                  ? `${profile.account.contact} · Signed In`
                  : 'Anonymous Local-First Quick Start (No Login Required)'}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E6ECE8] dark:border-[#252926]">
            <div className="text-xs font-medium text-[#4A564E] dark:text-[#A4B0A7]">
              Household Persona Preset
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PERSONA_PRESETS) as PersonaPreset[]).map((key) => {
                const p = PERSONA_PRESETS[key];
                const active = profile.persona === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      onUpdateProfile({
                        ...profile,
                        persona: key,
                        sensitivities: { ...p.sensitivities },
                        budgetTier: p.budgetTier,
                        commuteMode: p.commuteMode,
                      })
                    }
                    className={`rounded-xl px-3 py-2 text-xs font-medium text-left border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#8AD66D] text-[#0E160C] border-[#8AD66D]'
                        : 'bg-[#F4F7F5] dark:bg-[#131514] border-[#DCE4DE] dark:border-[#282D29] text-[#28332B] dark:text-[#D1DDD4]'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Geolocation */}
          <div className="space-y-2 pt-2 border-t border-[#E6ECE8] dark:border-[#252926]">
            <label htmlFor="profile-city-select" className="block text-xs font-medium text-[#4A564E] dark:text-[#A4B0A7]">
              Locality / City (2 km privacy-snapped grid)
            </label>
            <div className="flex gap-2">
              <select
                id="profile-city-select"
                value={profile.cityId}
                onChange={(e) => onUpdateProfile({ ...profile, cityId: e.target.value })}
                className="flex-1 min-h-[42px] rounded-xl bg-[#F3F6F4] dark:bg-[#111312] border border-[#D4DDD7] dark:border-[#2C332E] px-3 text-xs font-medium text-[#111613] dark:text-[#F4F7F5]"
              >
                {LOCALITIES.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.locality}, {loc.city} ({loc.outdoorPm25} µg/m³)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onRequestGeolocation}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#CFD8D1] dark:border-[#343B36] px-3 text-xs font-medium text-[#151C17] dark:text-[#E5ECE7] hover:bg-[#EEF3EF] dark:hover:bg-[#232724] cursor-pointer shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 text-[#88D46B]" />
                Locate
              </button>
            </div>
            {geoStatus && <p className="text-[11px] text-[#206B1C] dark:text-[#88D46B]">{geoStatus}</p>}
          </div>
        </section>

        {/* Household Sensitivities & Home/Commute Config */}
        <section className="lg:col-span-7 rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111613] dark:text-[#F1F5F2]">
              <User className="w-4 h-4 text-[#88D46B]" />
              <span>Household Health Sensitivities (Non-Identifiable Flags)</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ['childrenUnder12', 'Children (<12 yrs)'],
                  ['elderlyOver65', 'Seniors (65+ yrs)'],
                  ['asthmaOrCopd', 'Asthma / Respiratory'],
                  ['pregnant', 'Pregnancy'],
                  ['outdoorWorker', 'Outdoor / Gig Worker'],
                ] as const
              ).map(([key, label]) => {
                const on = profile.sensitivities[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSensitivity(key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium border transition-colors cursor-pointer ${
                      on
                        ? 'bg-[#8AD66D] text-[#0E160C] border-[#8AD66D]'
                        : 'bg-[#F4F7F5] dark:bg-[#131514] border-[#D8E1DB] dark:border-[#2A302C] text-[#354039] dark:text-[#C5D1C8]'
                    }`}
                  >
                    {on && <Check className="w-3.5 h-3.5" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-[#E6ECE8] dark:border-[#252926]">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[#58635B] dark:text-[#96A299]">Home Type</span>
              <select
                value={profile.homeType}
                onChange={(e) => onUpdateProfile({ ...profile, homeType: e.target.value as HomeType })}
                className="w-full min-h-[40px] rounded-xl bg-[#F3F6F4] dark:bg-[#111312] border border-[#D4DDD7] dark:border-[#2C332E] px-2.5 text-xs text-[#111613] dark:text-[#F4F7F5]"
              >
                <option value="apartment">Apartment / Flat</option>
                <option value="independent">Independent House</option>
                <option value="high-rise">High-Rise (10+ Floor)</option>
                <option value="ground-floor">Ground Floor / Roadside</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-[#58635B] dark:text-[#96A299]">Primary Commute</span>
              <select
                value={profile.commuteMode}
                onChange={(e) => onUpdateProfile({ ...profile, commuteMode: e.target.value as CommuteMode })}
                className="w-full min-h-[40px] rounded-xl bg-[#F3F6F4] dark:bg-[#111312] border border-[#D4DDD7] dark:border-[#2C332E] px-2.5 text-xs text-[#111613] dark:text-[#F4F7F5]"
              >
                <option value="metro-bus">Metro / Public Bus</option>
                <option value="two-wheeler">Two-Wheeler / Bike</option>
                <option value="car">Car / Carpool</option>
                <option value="walk-cycle">Walk / Cycle</option>
                <option value="work-from-home">Work From Home</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-[#58635B] dark:text-[#96A299]">Budget Tier</span>
              <select
                value={profile.budgetTier}
                onChange={(e) => onUpdateProfile({ ...profile, budgetTier: e.target.value as BudgetTier })}
                className="w-full min-h-[40px] rounded-xl bg-[#F3F6F4] dark:bg-[#111312] border border-[#D4DDD7] dark:border-[#2C332E] px-2.5 text-xs text-[#111613] dark:text-[#F4F7F5]"
              >
                <option value="free">Free / Zero-Cost Hacks</option>
                <option value="low-cost">Low-Cost (&lt;₹2,500 DIY)</option>
                <option value="premium">Premium (True HEPA)</option>
              </select>
            </label>
          </div>

          {/* Alerts, Low-Bandwidth & PWA Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E6ECE8] dark:border-[#252926]">
            <button
              type="button"
              onClick={handlePushToggle}
              className="flex items-center justify-between rounded-2xl bg-[#F4F7F5] dark:bg-[#131514] border border-[#DCE4DE] dark:border-[#282D29] p-3.5 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#88D46B]" />
                <div>
                  <div className="text-xs font-semibold text-[#111613] dark:text-[#F1F5F2]">
                    Web Push Smog Alerts
                  </div>
                  <div className="text-[11px] text-[#5E6A61] dark:text-[#8E9B92]">
                    {profile.pushAlertsEnabled ? 'Active (max 2/day)' : 'Opt-in with WhatsApp fallback'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-[#206B1C] dark:text-[#88D46B]">
                {profile.pushAlertsEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateProfile({ ...profile, lowBandwidth: !profile.lowBandwidth })}
              className="flex items-center justify-between rounded-2xl bg-[#F4F7F5] dark:bg-[#131514] border border-[#DCE4DE] dark:border-[#282D29] p-3.5 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-[#88D46B]" />
                <div>
                  <div className="text-xs font-semibold text-[#111613] dark:text-[#F1F5F2]">
                    3G Low-Bandwidth Mode
                  </div>
                  <div className="text-[11px] text-[#5E6A61] dark:text-[#8E9B92]">
                    Zero motion & ultra-light offline cache
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-[#206B1C] dark:text-[#88D46B]">
                {profile.lowBandwidth ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
          {pushFeedback && <p className="text-xs text-[#206B1C] dark:text-[#88D46B]">{pushFeedback}</p>}
        </section>
      </div>

      {/* PWA Installability & DPDP Privacy Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#111613] dark:text-[#F1F5F2]">
            <Smartphone className="w-4 h-4 text-[#88D46B]" />
            <span>Install Vayu Pulse PWA (No App Store Needed)</span>
          </div>
          <p className="text-xs text-[#58635B] dark:text-[#96A299] leading-relaxed">
            Install directly to your home screen for offline access to your last known AQI, daily plan, and emergency checklist.
          </p>
          {pwaInstall.isInstalled ? (
            <div className="text-xs font-semibold text-[#206B1C] dark:text-[#88D46B]">
              Running as installed standalone PWA.
            </div>
          ) : pwaInstall.isInstallable ? (
            <button
              type="button"
              onClick={() => pwaInstall.install()}
              className="inline-flex items-center gap-2 rounded-full bg-[#8AD66D] px-4 py-2 text-xs font-semibold text-[#0E160C] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Install Vayu Pulse App
            </button>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setShowIOSGuide((s) => !s)}
                className="inline-flex items-center gap-2 rounded-full border border-[#CFD8D1] dark:border-[#363D38] px-4 py-2 text-xs font-medium text-[#151C17] dark:text-[#E5ECE7] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                {pwaInstall.isIOS ? 'How to Install on iPhone / Safari' : 'How to Install on Android / Desktop'}
              </button>
              {showIOSGuide && (
                <p className="mt-2.5 text-xs text-[#4B574F] dark:text-[#AAB7AE] leading-relaxed">
                  On iOS Safari: tap <strong>Share</strong> → <strong>Add to Home Screen</strong>. On Android Chrome / Desktop: open browser menu → <strong>Install Vayu Pulse</strong>.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="rounded-[22px] bg-white dark:bg-[#191B1A] border border-[#DFE6E1] dark:border-[#262A27] p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#111613] dark:text-[#F1F5F2]">
            <Lock className="w-4 h-4 text-[#88D46B]" />
            <span>DPDP Act & GDPR Data Control</span>
          </div>
          <p className="text-xs text-[#58635B] dark:text-[#96A299] leading-relaxed">
            Your preferences and habit ticks stay in local browser storage. No child names, street addresses, or third-party ad cookies are collected.
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onResetAllData}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5B4B4] dark:border-[#5C2B31] px-4 py-2 text-xs font-medium text-[#991B1B] dark:text-[#F8A5A5] hover:bg-[#FDF2F2] dark:hover:bg-[#2B171A] cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Local Profile & Reset
            </button>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#647067] dark:text-[#8A968D]">
              <Shield className="w-3.5 h-3.5" />
              Zero Ad Trackers
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};
