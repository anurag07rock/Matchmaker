'use client';

import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Save, 
  ShieldAlert, 
  User, 
  Bell, 
  Palette, 
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

type SettingsTab = 'profile' | 'engine' | 'notifications' | 'theme';

export default function SettingsPage() {
  const { settings, updateSettings } = useAppContext();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Profile Form state
  const [name, setName] = useState(settings.name);
  const [title, setTitle] = useState(settings.title);
  const [apiKey, setApiKey] = useState(settings.apiKey);

  // Engine Form state
  const [promptTone, setPromptTone] = useState(settings.promptTone);
  const [maxDistance, setMaxDistance] = useState(settings.maxDistance);
  const [ageRangeLeniency, setAgeRangeLeniency] = useState(settings.ageRangeLeniency);

  // Notifications Form state
  const [emailNotif, setEmailNotif] = useState(settings.notifications.email);
  const [pushNotif, setPushNotif] = useState(settings.notifications.push);
  const [alertsNotif, setAlertsNotif] = useState(settings.notifications.alerts);

  // Theme Form state
  const [selectedTheme, setSelectedTheme] = useState(settings.theme);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to AppContext
    updateSettings({
      name,
      title,
      apiKey,
      promptTone,
      maxDistance,
      ageRangeLeniency,
      notifications: {
        email: emailNotif,
        push: pushNotif,
        alerts: alertsNotif
      },
      theme: selectedTheme
    });

    // Show feedback toast
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 3000);
  };

  const themesList = [
    { id: 'dark' as const, name: 'Glassmorphic Dark (Default)', colors: 'bg-gradient-to-r from-rose-500 to-violet-600', description: 'Curated harmonic neon blurs with clean dark contrast.' },
    { id: 'midnight' as const, name: 'Midnight Violet', colors: 'bg-gradient-to-r from-indigo-500 to-violet-600', description: 'Deep purple palette designed for low-light office work.' },
    { id: 'rose' as const, name: 'Blushing Rose', colors: 'bg-gradient-to-r from-rose-500 to-amber-500', description: 'Warm crimson hues embodying classic relationship portals.' },
    { id: 'emerald' as const, name: 'Emerald Slate', colors: 'bg-gradient-to-r from-emerald-500 to-teal-600', description: 'Sleek executive green layout highlighting match stability.' }
  ];

  return (
    <div className="space-y-6 relative">
      
      {/* Dynamic Toast Feedback */}
      {showSavedToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 p-4 bg-zinc-900 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold shadow-2xl animate-slideIn select-none">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>System configuration saved successfully!</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          System Settings
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Adjust artificial intelligence parameters, matching tolerances, and credential configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Side: Tabs Selection list */}
        <div className="glass-panel p-3 rounded-2xl border-zinc-800/60 shadow-sm flex flex-col gap-1 select-none">
          {(
            [
              { id: 'profile', label: 'Matchmaker Profile', icon: User },
              { id: 'engine', label: 'Matching Engine', icon: Sliders },
              { id: 'notifications', label: 'Notification Settings', icon: Bell },
              { id: 'theme', label: 'Appearance & Themes', icon: Palette }
            ] as { id: SettingsTab; label: string; icon: any }[]
          ).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-rose-500/10 text-rose-400 border-l-2 border-rose-500 pl-3' 
                    : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-40 transition-transform ${isActive ? 'rotate-95' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Right Side: Form Panel */}
        <div className="md:col-span-3">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Tab 1: Profile */}
            {activeTab === 'profile' && (
              <div className="glass-panel rounded-2xl p-6 border-zinc-800/60 space-y-5 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm border-b border-zinc-900 pb-3">
                  <User className="w-4.5 h-4.5" />
                  Matchmaker Profile Info
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Matchmaker Operator Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Professional Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-zinc-900 pt-4">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-500" />
                    OpenAI API Key Validation
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2.5 bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Required for compiling real-time counselor briefings. If blank, falls back to mock relationship analytics.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Matching Engine Parameters */}
            {activeTab === 'engine' && (
              <div className="glass-panel rounded-2xl p-6 border-zinc-800/60 space-y-5 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2 text-violet-400 font-bold text-sm border-b border-zinc-900 pb-3">
                  <Sliders className="w-4.5 h-4.5" />
                  Matching Engine Parameters
                </div>

                <div className="space-y-4.5">
                  {/* Distance Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-zinc-300">Maximum Search Distance Threshold</span>
                      <span className="text-violet-400">{maxDistance} miles</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(Number(e.target.value))}
                      className="w-full accent-rose-500 bg-zinc-900 border border-zinc-850 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Leniency Slider */}
                  <div className="space-y-2 border-t border-zinc-900 pt-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-zinc-300">Age Bracket Tolerance Leniency</span>
                      <span className="text-violet-400">± {ageRangeLeniency} years</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={ageRangeLeniency}
                      onChange={(e) => setAgeRangeLeniency(Number(e.target.value))}
                      className="w-full accent-rose-500 bg-zinc-900 border border-zinc-850 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Report Tone Selection */}
                  <div className="space-y-1.5 border-t border-zinc-900 pt-4">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                      Counselor Report Personality Tone
                    </label>
                    <select
                      value={promptTone}
                      onChange={(e) => setPromptTone(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-350 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs cursor-pointer"
                    >
                      <option value="detailed and analytical">Detailed & Analytical (Professional briefs)</option>
                      <option value="playful and narrative">Playful & Warm (Client-facing descriptions)</option>
                      <option value="critical and risk-focused">Critical Risk-focused (Exposes dealbreakers)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Notifications settings */}
            {activeTab === 'notifications' && (
              <div className="glass-panel rounded-2xl p-6 border-zinc-800/60 space-y-5 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm border-b border-zinc-900 pb-3">
                  <Bell className="w-4.5 h-4.5" />
                  Notifications & Coordinator Alerts
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3.5 bg-zinc-900/30 border border-zinc-850 rounded-xl cursor-pointer hover:border-zinc-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={emailNotif}
                      onChange={(e) => setEmailNotif(e.target.checked)}
                      className="rounded accent-rose-500 bg-zinc-950 border-zinc-800 w-4 h-4 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-zinc-200">Email Recommendations Notification</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Send match recommendation copy directly to client emails automatically.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 bg-zinc-900/30 border border-zinc-850 rounded-xl cursor-pointer hover:border-zinc-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={pushNotif}
                      onChange={(e) => setPushNotif(e.target.checked)}
                      className="rounded accent-rose-500 bg-zinc-950 border-zinc-800 w-4 h-4 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-zinc-200">Browser Push Alerts</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Receive immediate notifications when clients respond or decline matches.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 bg-zinc-900/30 border border-zinc-850 rounded-xl cursor-pointer hover:border-zinc-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={alertsNotif}
                      onChange={(e) => setAlertsNotif(e.target.checked)}
                      className="rounded accent-rose-500 bg-zinc-950 border-zinc-800 w-4 h-4 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-zinc-200">Matchmaker Operational Warnings</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Flag dealbreakers or location discrepancy alerts on suggested match files.</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 4: Theme Settings */}
            {activeTab === 'theme' && (
              <div className="glass-panel rounded-2xl p-6 border-zinc-800/60 space-y-5 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm border-b border-zinc-900 pb-3">
                  <Palette className="w-4.5 h-4.5" />
                  Appearance & Design Presets
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {themesList.map(t => {
                    const isSelected = selectedTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTheme(t.id)}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between space-y-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-rose-500/50 bg-rose-500/5 shadow-md shadow-rose-950/10'
                            : 'border-zinc-850 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${isSelected ? 'text-rose-400' : 'text-zinc-300'}`}>{t.name}</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-bold ${isSelected ? 'border-rose-500 text-rose-500' : 'border-zinc-800 text-transparent'}`}>✓</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-normal">{t.description}</p>
                        <div className="flex gap-1">
                          <div className={`h-2.5 w-10 rounded-full ${t.colors}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form Actions Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-semibold max-w-xs leading-4">
                <ShieldAlert className="w-4 h-4 text-zinc-650 shrink-0" />
                Modifications impact all matchmaker accounts connected to the system.
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Configurations
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
