'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Lock, Sparkles, Phone, Mail, User, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface MatchmakerAccount {
  email: string;
  phone: string;
  password: string;
  name: string;
  title: string;
  theme: 'light' | 'dark';
}

const PRESET_ACCOUNTS: MatchmakerAccount[] = [
  {
    email: 'maggie@thedatecrew.com',
    phone: '+1 555-0199',
    password: 'password123',
    name: 'Maggie Crew',
    title: 'Senior Matchmaker',
    theme: 'light'
  },
  {
    email: 'william@thedatecrew.com',
    phone: '+1 555-0188',
    password: 'password456',
    name: 'William Sterling',
    title: 'Lead Matchmaker',
    theme: 'dark'
  },
  {
    email: 'chloe@thedatecrew.com',
    phone: '+1 555-0177',
    password: 'password789',
    name: 'Chloe Valance',
    title: 'Associate Matchmaker',
    theme: 'light'
  },
  {
    email: 'alex@thedatecrew.com',
    phone: '+1 555-0166',
    password: 'password321',
    name: 'Alex Thorne',
    title: 'Matchmaking Agent',
    theme: 'dark'
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('maggie@thedatecrew.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Registration flow states
  const [showRegister, setShowRegister] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newTheme, setNewTheme] = useState<'light' | 'dark'>('light');
  
  const [showPresetPanel, setShowPresetPanel] = useState(true);
  const [customAccounts, setCustomAccounts] = useState<MatchmakerAccount[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // Load custom accounts from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('matchmaker_custom_accounts');
      if (saved) {
        try {
          setCustomAccounts(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  // Track mouse coordinates for dynamic background glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!hasMoved) setHasMoved(true);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hasMoved]);

  const cleanPhone = (p: string) => p.replace(/\D/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const query = emailOrPhone.trim().toLowerCase();
      const queryPhone = cleanPhone(emailOrPhone);

      // 1. Search in preset list
      const matchedPreset = PRESET_ACCOUNTS.find(
        (acc) =>
          acc.email.toLowerCase() === query ||
          (queryPhone && cleanPhone(acc.phone) === queryPhone)
      );

      // 2. Search in custom registered list
      const matchedCustom = customAccounts.find(
        (acc) =>
          acc.email.toLowerCase() === query ||
          (queryPhone && cleanPhone(acc.phone) === queryPhone)
      );

      const account = matchedPreset || matchedCustom;

      if (account) {
        // Account exists, verify password
        if (account.password === password) {
          // Save active settings to AppContext localStorage
          const updatedSettings = {
            promptTone: 'detailed and analytical',
            maxDistance: 50,
            ageRangeLeniency: 2,
            apiKey: '••••••••••••••••••••••••••••••••',
            name: account.name,
            title: account.title,
            notifications: { email: true, push: false, alerts: true },
            theme: account.theme,
            email: account.email,
            phone: account.phone
          };
          localStorage.setItem('matchmaker_settings', JSON.stringify(updatedSettings));
          document.cookie = "auth_session=true; path=/; max-age=86400; SameSite=Lax";
          router.push('/dashboard');
        } else {
          setError('Security password mismatch. Please verify and try again.');
          setIsLoading(false);
        }
      } else {
        // Account does not exist, trigger Registration mode
        setShowRegister(true);
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Please provide your full name to set up your profile.');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const query = emailOrPhone.trim();
      const isEmail = query.includes('@');
      
      const newAccount: MatchmakerAccount = {
        email: isEmail ? query.toLowerCase() : `${newName.toLowerCase().replace(/\s+/g, '')}@thedatecrew.com`,
        phone: isEmail ? '+1 555-0100' : query,
        password: password,
        name: newName,
        title: newTitle || 'Matchmaking Agent',
        theme: newTheme
      };

      // Save to custom accounts
      const updatedCustom = [...customAccounts, newAccount];
      setCustomAccounts(updatedCustom);
      localStorage.setItem('matchmaker_custom_accounts', JSON.stringify(updatedCustom));

      // Save active settings to AppContext localStorage
      const updatedSettings = {
        promptTone: 'detailed and analytical',
        maxDistance: 50,
        ageRangeLeniency: 2,
        apiKey: '••••••••••••••••••••••••••••••••',
        name: newAccount.name,
        title: newAccount.title,
        notifications: { email: true, push: false, alerts: true },
        theme: newAccount.theme,
        email: newAccount.email,
        phone: newAccount.phone
      };
      localStorage.setItem('matchmaker_settings', JSON.stringify(updatedSettings));
      
      document.cookie = "auth_session=true; path=/; max-age=86400; SameSite=Lax";
      router.push('/dashboard');
    }, 1200);
  };

  const autofill = (acc: MatchmakerAccount) => {
    setEmailOrPhone(acc.email);
    setPassword(acc.password);
    setError('');
    setShowRegister(false);
  };

  const loginThemeClass = showRegister ? `theme-${newTheme}` : `theme-light`;

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 overflow-y-auto py-12 px-4 ${loginThemeClass}`}>
      {/* Subtle Background System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
        {/* Very faint grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>


      {/* Main Container */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Logo Header */}
        <div className="text-center flex flex-col items-center">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-zinc-200 shadow-lg mb-4 group hover:border-rose-400/60 hover:shadow-rose-100 transition-all duration-300">
            <Heart className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform duration-300 fill-rose-500/20" />
            <Sparkles className="w-3.5 h-3.5 text-rose-400 absolute top-2 right-2 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-800">
            The Date Crew
          </h1>
          <p className="text-sm text-zinc-500 mt-2 font-medium">
            Matchmaker Portal & CRM Control
          </p>
        </div>

        {/* Form Panel */}
        <div className="bg-white rounded-2xl p-8 shadow-lg relative border border-zinc-200">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />
          
          <h2 className="text-xl font-semibold text-zinc-800 mb-6">
            {showRegister ? 'Create Matchmaker Account' : 'Authorized Personnel Login'}
          </h2>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 mb-5 animate-fadeIn">
              {error}
            </div>
          )}

          {!showRegister ? (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                  <span>Email or Phone Number</span>
                  <span className="text-[10px] text-zinc-400">Preset / Custom</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                    {emailOrPhone.includes('@') ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                  </span>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400/60 transition-all duration-200 text-sm"
                    placeholder="name@thedatecrew.com or +1 555-..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Security Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400/60 transition-all duration-200 text-sm"
                    placeholder="Enter security password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-sm font-semibold hover:from-rose-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden shadow-lg shadow-rose-950/20 group"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating credentials...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      Enter Dashboard
                      <Sparkles className="w-4 h-4 ml-1 opacity-80 group-hover:scale-110 transition-transform duration-200" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div className="p-3 bg-rose-950/15 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                It looks like this email/phone is not in the system yet. Please fill in your name and role below to register your Matchmaker profile.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Username/Identity</label>
                  <div className="text-xs text-zinc-300 font-mono mt-1 truncate bg-zinc-900/80 p-2 border border-zinc-850 rounded-lg select-none">
                    {emailOrPhone}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Security Password</label>
                  <div className="text-xs text-zinc-300 font-mono mt-1 truncate bg-zinc-900/80 p-2 border border-zinc-850 rounded-lg select-none">
                    ••••••••
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 transition-all duration-200 text-sm"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Role / Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 transition-all duration-200 text-sm"
                  placeholder="e.g. Associate Matchmaker"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Dashboard Theme Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['light', 'dark'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewTheme(t)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all capitalize select-none ${
                        newTheme === t
                          ? 'bg-rose-500/10 border-rose-500 text-rose-450'
                          : 'bg-zinc-900/40 border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {t === 'light' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Register & Login
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Accordion List of Available Accounts for quick reference */}
        <div className="glass-panel rounded-2xl border-zinc-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowPresetPanel(!showPresetPanel)}
            className="w-full px-6 py-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-700 transition-colors select-none focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              Quick-Fill Demo Matchmakers
            </span>
            {showPresetPanel ? (
              <ChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          {showPresetPanel && (
            <div className="px-6 pb-4 border-t border-zinc-100 divide-y divide-zinc-100">
              {PRESET_ACCOUNTS.map((acc) => (
                <div
                  key={acc.email}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-zinc-700">{acc.name}</p>
                    <p className="text-[10px] text-zinc-500">{acc.title}</p>
                    <div className="flex gap-3 text-[10px] text-zinc-400 font-mono mt-0.5">
                      <span>{acc.email}</span>
                      <span>•</span>
                      <span>{acc.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => autofill(acc)}
                    className="px-2.5 py-1 bg-white border border-zinc-200 hover:bg-rose-50 hover:border-rose-300 text-zinc-600 hover:text-rose-600 rounded-lg font-semibold tracking-wide transition-all scale-95 active:scale-90 select-none focus:outline-none"
                  >
                    Quick Fill
                  </button>
                </div>
              ))}

              {customAccounts.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Registered Customs</p>
                  {customAccounts.map((acc) => (
                    <div
                      key={acc.email}
                      className="py-2 flex items-center justify-between gap-3 text-xs border-t border-zinc-900/50"
                    >
                      <div>
                        <p className="font-bold text-rose-400/80">{acc.name} <span className="text-[9px] text-zinc-500 font-normal border border-zinc-800 px-1 rounded ml-1">Custom</span></p>
                        <div className="flex gap-3 text-[10px] text-zinc-500 font-mono">
                          <span>{acc.email}</span>
                          <span>•</span>
                          <span>{acc.phone}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => autofill(acc)}
                        className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 hover:text-zinc-100 rounded-lg font-semibold transition-all scale-95 select-none focus:outline-none"
                      >
                        Fill
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
