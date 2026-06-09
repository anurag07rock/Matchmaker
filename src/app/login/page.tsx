'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Lock, Sparkles, Phone, Mail, Check, ArrowRight, ShieldCheck } from 'lucide-react';

// ─── Testing / Development credentials ────────────────────────────────────
// Remove or gate behind process.env.NODE_ENV === 'development' in production.
const TEST_PHONE = '666666';
const TEST_OTP   = '777777';
// ──────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  
  // Login Method Toggle
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Email Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone Login States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  
  // Shared States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Track mouse coordinates for dynamic background glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

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

  const handleAuthSuccess = (data: any) => {
    const user = data.user;
    const updatedSettings = {
      promptTone: 'detailed and analytical',
      maxDistance: 50,
      ageRangeLeniency: 2,
      apiKey: '••••••••••••••••••••••••••••••••',
      name: user.name,
      title: user.title,
      notifications: { email: true, push: false, alerts: true },
      theme: user.theme || 'light',
      email: user.email,
      phone: user.phone
    };
    localStorage.setItem('matchmaker_settings', JSON.stringify(updatedSettings));
    document.cookie = "auth_session=true; path=/; max-age=86400; SameSite=Lax";
    router.push('/dashboard');
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Security password mismatch. Please verify and try again.');
          setIsLoading(false);
          return;
        }
        handleAuthSuccess(data);
      })
      .catch((err) => {
        console.error('Login error:', err);
        setError('Failed to connect to authentication server. Please ensure the server is active.');
        setIsLoading(false);
      });
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    fetch(`${API_URL}/auth/phone-login/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to send OTP.');
          setIsLoading(false);
          return;
        }
        setPhoneStep('otp');
        if (data.mockOtpForDemo) {
          // In testing mode: autofill the OTP and surface it in the UI
          setOtp(data.mockOtpForDemo);
          setSuccessMsg(`- OTP auto-filled: ${data.mockOtpForDemo}`);
        } else {
          setSuccessMsg('Security code sent to your phone.');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('OTP error:', err);
        setError('Failed to connect to authentication server.');
        setIsLoading(false);
      });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    fetch(`${API_URL}/auth/phone-login/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Invalid OTP.');
          setIsLoading(false);
          return;
        }
        handleAuthSuccess(data);
      })
      .catch((err) => {
        console.error('OTP verify error:', err);
        setError('Failed to connect to authentication server.');
        setIsLoading(false);
      });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 overflow-y-auto py-12 px-4 theme-light">
      {/* Subtle Background System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Logo Header */}
        <div className="text-center flex flex-col items-center">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-lg mb-4 group hover:border-rose-400/60 hover:shadow-rose-100 transition-all duration-300">
            <Heart className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform duration-300 fill-rose-500/20" />
            <Sparkles className="w-3.5 h-3.5 text-rose-400 absolute top-2 right-2 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">
            The Date Crew
          </h1>
          <p className="text-sm text-zinc-500 mt-2 font-medium">
            Matchmaker Portal & CRM Control
          </p>
        </div>

        {/* Form Panel */}
        <div className="bg-zinc-900 rounded-2xl p-8 shadow-lg relative border border-zinc-700">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />
          
          <h2 className="text-xl font-semibold text-zinc-100 mb-6">
            Authorized Personnel Login
          </h2>

          {/* Login Method Toggle */}
          <div className="flex bg-zinc-800/50 p-1 rounded-xl mb-6">
            <button
              onClick={() => { setLoginMethod('email'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                loginMethod === 'email' 
                  ? 'bg-zinc-700 text-zinc-100 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Email Login
            </button>
            <button
              onClick={() => { setLoginMethod('phone'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                loginMethod === 'phone' 
                  ? 'bg-zinc-700 text-zinc-100 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Phone Login
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 mb-5 animate-fadeIn">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 mb-5 animate-fadeIn">
              {successMsg}
            </div>
          )}

          {/* EMAIL LOGIN FORM */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                  <span>Email Address</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 transition-all duration-200 text-sm"
                    placeholder="name@thedatecrew.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Password
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
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 transition-all duration-200 text-sm"
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
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      Enter Dashboard
                      <ArrowRight className="w-4 h-4 ml-1 opacity-80 group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PHONE LOGIN FORM */}
          {loginMethod === 'phone' && (
            <>
              {phoneStep === 'input' ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                      <span>Phone Number</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 transition-all duration-200 text-sm"
                        placeholder="+1 555-0100"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full py-3 bg-gradient-to-r from-zinc-700 to-zinc-600 text-white rounded-xl text-sm font-semibold hover:from-zinc-600 hover:to-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/50 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden shadow-lg group"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending Code...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          Send Security Code
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                      <span>Enter 6-Digit OTP</span>
                      <button 
                        type="button"
                        onClick={() => { setPhoneStep('input'); setOtp(''); setSuccessMsg(''); setError(''); }}
                        className="text-[10px] text-rose-400 hover:text-rose-300"
                      >
                        Change Number
                      </button>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 transition-all duration-200 text-center tracking-[0.5em] text-lg font-mono"
                        placeholder="••••••"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || otp.length < 6}
                      className="relative w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-sm font-semibold hover:from-rose-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden shadow-lg shadow-rose-950/20 group"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          Verify & Login
                          <Check className="w-4 h-4 ml-1 opacity-80" />
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
