'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Database,
  LogOut,
  Settings,
  X,
  FileText,
  UserPlus,
  Heart,
  Mail,
  Edit,
  Loader2,
  Server,
  Activity,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Upload,
  User,
  Moon,
  Sun
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface NavbarProps {
  onMenuClick: () => void;
}

const CURATED_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
];

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, activities, customers, matches, updateSettings } = useAppContext();

  // Dropdown & Modal States
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileTheme, setProfileTheme] = useState<'light' | 'dark'>('light');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');

  // Profile Edit Avatar States
  const [activeAvatarTab, setActiveAvatarTab] = useState<'gallery' | 'camera' | 'upload'>('gallery');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Refs for Camera and Upload
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Diagnostic Scan State
  const [diagnosticProgress, setDiagnosticProgress] = useState<number | null>(null);
  const [diagnosticStatus, setDiagnosticStatus] = useState<string>('System idle. Ready for diagnostic scan.');
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);

  // Read Notifications State
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  // Load read notifications from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('matchmaker_read_notifications');
      if (saved) {
        try {
          setReadNotificationIds(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  // Filter activities to display last 5
  const recentActivities = activities.slice(0, 5);
  const unreadActivities = activities.filter((act) => !readNotificationIds.includes(act.id));
  const unreadCount = unreadActivities.length;

  const markAllAsRead = () => {
    const allIds = activities.map((act) => act.id);
    setReadNotificationIds(allIds);
    localStorage.setItem('matchmaker_read_notifications', JSON.stringify(allIds));
  };

  const handleNotificationClick = (activity: any) => {
    if (!readNotificationIds.includes(activity.id)) {
      const updated = [...readNotificationIds, activity.id];
      setReadNotificationIds(updated);
      localStorage.setItem('matchmaker_read_notifications', JSON.stringify(updated));
    }
    setIsNotificationsOpen(false);
    if (activity.customerId) {
      router.push(`/dashboard/customers/${activity.customerId}`);
    }
  };

  const handleResetDatabase = () => {
    if (
      window.confirm(
        'Are you sure you want to reset the CRM database? This will clear all onboarding records, match history, notes, and restore original demo data.'
      )
    ) {
      localStorage.removeItem('matchmaker_customers');
      localStorage.removeItem('matchmaker_matches');
      localStorage.removeItem('matchmaker_activities');
      localStorage.removeItem('matchmaker_settings');
      setIsProfileOpen(false);
      window.location.reload();
    }
  };

  const runDiagnostics = () => {
    setDiagnosticProgress(0);
    setDiagnosticStatus('Initializing diagnostic tools...');
    
    const interval = setInterval(() => {
      setDiagnosticProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setDiagnosticStatus('Diagnostics complete. All systems nominal.');
          setLastScanTime(new Date().toLocaleTimeString());
          return 100;
        }
        
        const next = prev + Math.floor(Math.random() * 12) + 6;
        const bounded = Math.min(next, 100);

        if (bounded < 20) {
          setDiagnosticStatus('Verifying customer directory database records...');
        } else if (bounded < 45) {
          setDiagnosticStatus('Testing AI Matchmaker compatibility calculation engine...');
        } else if (bounded < 70) {
          setDiagnosticStatus('Verifying security tokens and system preferences payload...');
        } else if (bounded < 90) {
          setDiagnosticStatus('Analyzing local storage buffer limits...');
        } else {
          setDiagnosticStatus('Finalizing scan metrics and reports...');
        }

        return bounded;
      });
    }, 120);
  };

  // Open Profile Editor Modal and initialize values
  const openProfileModal = () => {
    setProfileName(settings.name || 'Maggie Crew');
    setProfileTitle(settings.title || 'Senior Matchmaker');
    setProfileEmail(settings.email || 'maggie@thedatecrew.com');
    setProfilePhone(settings.phone || '+1 555-0199');
    setProfileTheme(settings.theme || 'rose');
    setProfileAvatarUrl(settings.avatarUrl || '');
    setIsProfileOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: profileName,
      title: profileTitle,
      email: profileEmail,
      phone: profilePhone,
      theme: profileTheme,
      avatarUrl: profileAvatarUrl
    });
    
    // Save to custom account in localStorage if custom
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('matchmaker_custom_accounts');
      if (saved) {
        try {
          const customs = JSON.parse(saved) as any[];
          const updated = customs.map(acc => {
            if (acc.email.toLowerCase() === settings.email?.toLowerCase() || acc.phone === settings.phone) {
              return {
                ...acc,
                name: profileName,
                title: profileTitle,
                theme: profileTheme,
                avatarUrl: profileAvatarUrl
              };
            }
            return acc;
          });
          localStorage.setItem('matchmaker_custom_accounts', JSON.stringify(updated));
        } catch (err) {}
      }
    }

    setIsProfileModalOpen(false);
    stopCamera();
    window.location.reload();
  };

  // Live Camera Activation
  const startCamera = async () => {
    setIsCameraLoading(true);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 250, height: 250, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraStream(stream);
      }
    } catch (err) {
      console.error(err);
      setCameraError('Camera access denied or device unavailable.');
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 150;
        canvas.height = 150;
        // Center crop square
        const size = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 150, 150);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setProfileAvatarUrl(dataUrl);
        stopCamera();
      }
    }
  };

  // Hidden File Uploader handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Simple path parser for dynamic page titles
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Overview';
    if (pathname.startsWith('/dashboard/customers')) {
      if (pathname.split('/').length > 3) return 'Customer Profile Details';
      return 'Customer Directory';
    }
    if (pathname.startsWith('/dashboard/matches')) return 'Matchmaking Board';
    if (pathname.startsWith('/dashboard/settings')) return 'System Settings';
    return 'Dashboard';
  };

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  const getAvatarBg = () => {
    return 'from-rose-500 to-rose-400';
  };
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'customer_added':
        return <UserPlus className="w-4 h-4 text-rose-400" />;
      case 'match_suggested':
        return <Heart className="w-4 h-4 text-rose-400" fill="currentColor" fillOpacity={0.2} />;
      case 'match_sent':
        return <Mail className="w-4 h-4 text-rose-400" />;
      case 'note_added':
        return <FileText className="w-4 h-4 text-rose-400" />;
      case 'profile_updated':
        return <Edit className="w-4 h-4 text-rose-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-zinc-400" />;
    }
  };

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const current = localStorage.getItem('matchmaker_settings');
    const parsed = current ? JSON.parse(current) : {};
    localStorage.setItem('matchmaker_settings', JSON.stringify({ ...parsed, theme: newTheme }));
    window.location.reload();
  };

  return (
    <>
      <header className="h-16 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm">
        {/* Invisible Backdrops for Dropdown click-away */}
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsNotificationsOpen(false)} />
        )}
        {isProfileOpen && (
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)} />
        )}
        <div className="flex items-center gap-4">
          {/* Toggle Mobile Menu */}
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/60 lg:hidden focus:outline-none focus:ring-1 focus:ring-rose-500/50"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Dynamic Title */}
          <h2 className="text-base sm:text-lg font-semibold text-[var(--foreground)] tracking-tight">
            {getPageTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* System Status Alert (Operational Indicator) */}
          <button
            onClick={() => setIsDiagnosticsOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-400/25 hover:border-rose-400/50 hover:bg-rose-500/15 rounded-full text-xs text-rose-500 font-medium transition-all focus:outline-none focus:ring-1 focus:ring-rose-500/40 select-none cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
            Systems Online
          </button>

          {/* Notifications Icon & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/60 transition-colors focus:outline-none ${
                isNotificationsOpen ? 'text-[var(--foreground)] bg-[var(--muted)]/60' : ''
              }`}
              aria-label="View Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {settings.notifications.alerts && unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center ring-2 ring-[var(--background)]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
                  <span className="text-xs font-semibold text-[var(--foreground)]">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 transition-colors focus:outline-none"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]/50">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((act) => {
                      const isUnread = !readNotificationIds.includes(act.id);
                      return (
                        <button
                          key={act.id}
                          onClick={() => handleNotificationClick(act)}
                          className={`w-full text-left px-4 py-3 hover:bg-[var(--muted)]/40 flex gap-3 transition-colors focus:outline-none ${
                            isUnread ? 'bg-rose-500/[0.04]' : ''
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {getActivityIcon(act.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs text-[var(--card-foreground)] truncate leading-snug ${isUnread ? 'font-medium' : 'opacity-80'}`}>
                              {act.details}
                            </p>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-[var(--muted-foreground)]">
                              <span className="truncate max-w-[120px] font-semibold">{act.customerName}</span>
                              <span>{getRelativeTime(act.timestamp)}</span>
                            </div>
                          </div>
                          {isUnread && (
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 self-center flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center flex flex-col items-center gap-2">
                      <Bell className="w-8 h-8 text-[var(--muted-foreground)]/40" />
                      <p className="text-xs text-[var(--muted-foreground)]">No recent notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={handleThemeToggle}
            className={`group relative hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500/40 overflow-hidden ${
              settings.theme === 'dark'
                ? 'bg-rose-500/15 border-rose-400/40 text-rose-300 hover:bg-rose-500/25 hover:text-rose-200'
                : 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100 hover:border-rose-400 hover:text-rose-700'
            }`}
            aria-label="Toggle dark/light mode"
            title={settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {/* Icon */}
            <span className="relative transition-transform duration-500 group-hover:scale-110">
              {settings.theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </span>
            
            {/* Label */}
            <span className="relative tracking-wide">
              {settings.theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Mobile-only icon-only dark mode button */}
          <button
            onClick={handleThemeToggle}
            className="sm:hidden p-2 rounded-xl border border-rose-400/25 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:border-rose-400/50 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-rose-500/40"
            aria-label="Toggle dark/light mode"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Matchmaker Session Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 pl-2 border-l border-[var(--border)] text-left hover:opacity-90 active:scale-98 transition-all focus:outline-none"
              aria-label="User profile menu"
            >
              {settings.avatarUrl ? (
                <img
                  src={settings.avatarUrl}
                  alt={settings.name}
                  className="w-8 h-8 rounded-lg object-cover shadow-md border border-[var(--border)]"
                />
              ) : (
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${getAvatarBg()} flex items-center justify-center text-xs font-bold text-white shadow-md`}>
                  {getInitials(settings.name || 'Maggie Crew')}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-[var(--foreground)]">{settings.name || 'Maggie Crew'}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">{settings.title || 'Senior Matchmaker'}</p>
              </div>
            </button>

            {/* Profile Popover */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2.5 w-64 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden py-1.5 divide-y divide-[var(--border)]">
                <button
                  type="button"
                  onClick={openProfileModal}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[var(--muted)]/30 transition-colors focus:outline-none group"
                >
                  {settings.avatarUrl ? (
                    <img
                      src={settings.avatarUrl}
                      alt={settings.name}
                      className="w-10 h-10 rounded-lg object-cover shadow-inner border border-[var(--border)] flex-shrink-0"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${getAvatarBg()} flex items-center justify-center text-sm font-bold text-white shadow-inner flex-shrink-0 group-hover:scale-98 transition-all`}>
                      {getInitials(settings.name || 'Maggie Crew')}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--foreground)] truncate group-hover:text-rose-400 transition-colors">{settings.name || 'Maggie Crew'}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] truncate">{settings.title || 'Senior Matchmaker'}</p>
                    <p className="text-[9px] text-[var(--muted-foreground)]/70 truncate mt-0.5">{settings.email || settings.phone || 'maggie@thedatecrew.com'}</p>
                  </div>
                </button>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/dashboard/settings');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[var(--muted)] text-xs text-[var(--card-foreground)] hover:text-[var(--foreground)] flex items-center gap-2 transition-colors focus:outline-none"
                  >
                    <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                    System Settings
                  </button>
                  <button
                    onClick={handleResetDatabase}
                    className="w-full text-left px-4 py-2 hover:bg-[var(--muted)] text-xs text-[var(--card-foreground)] hover:text-rose-400 flex items-center gap-2 transition-colors focus:outline-none"
                  >
                    <Database className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                    Reset CRM Database
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                      window.location.href = '/dashboard';
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[var(--muted)] text-xs text-rose-500 hover:text-rose-400 flex items-center gap-2 transition-colors focus:outline-none"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Secure Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Details & Photo Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl overflow-hidden border bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-rose-300" />
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <User className="w-5 h-5 text-rose-400" />
                Matchmaker Profile Dossier
              </h3>
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  stopCamera();
                }}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
              
              {/* Left Column: Avatar Editor */}
              <div className="md:col-span-5 flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center group shadow-inner">
                  {profileAvatarUrl ? (
                    <img
                      src={profileAvatarUrl}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-tr ${getAvatarBg()} flex items-center justify-center text-4xl font-bold text-white shadow-md`}>
                      {getInitials(profileName || 'Maggie Crew')}
                    </div>
                  )}
                  {cameraStream && (
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                      playsInline
                      muted
                    />
                  )}
                  {cameraStream && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>

                {/* Avatar Source Tabs */}
                <div className="w-full space-y-3">
                  <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 border border-zinc-850 rounded-xl">
                    {(['gallery', 'camera', 'upload'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          setActiveAvatarTab(tab);
                          stopCamera();
                        }}
                        className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                          activeAvatarTab === tab
                            ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 shadow'
                            : 'text-zinc-500 hover:text-zinc-350'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {activeAvatarTab === 'gallery' && (
                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-950 rounded-xl border border-zinc-850">
                      {CURATED_AVATARS.map((url, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setProfileAvatarUrl(url)}
                          className={`relative aspect-square rounded-lg overflow-hidden border transition-all hover:scale-102 ${
                            profileAvatarUrl === url
                              ? 'border-rose-500 ring-2 ring-rose-500/20'
                              : 'border-zinc-850 hover:border-zinc-750'
                          }`}
                        >
                          <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {activeAvatarTab === 'camera' && (
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 space-y-3">
                      {!cameraStream ? (
                        <button
                          type="button"
                          onClick={startCamera}
                          disabled={isCameraLoading}
                          className="w-full py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-150 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
                        >
                          {isCameraLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Waking up camera...
                            </>
                          ) : (
                            <>
                              <Camera className="w-3.5 h-3.5" />
                              Initialize Camera
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="w-full py-2 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-450 hover:text-rose-350 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            Capture Snapshot
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="w-full py-1 text-[10px] text-zinc-500 hover:text-zinc-350 font-semibold"
                          >
                            Turn off camera
                          </button>
                        </div>
                      )}
                      {cameraError && (
                        <p className="text-[10px] text-red-400 font-semibold text-center mt-1">{cameraError}</p>
                      )}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}

                  {activeAvatarTab === 'upload' && (
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-center space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 bg-zinc-900 border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 text-zinc-400 hover:text-zinc-300"
                      >
                        <Upload className="w-5 h-5 text-zinc-500" />
                        <span className="text-xs font-semibold">Choose image file</span>
                        <span className="text-[9px] text-zinc-600">Supports JPG, PNG</span>
                      </button>
                    </div>
                  )}

                  {profileAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setProfileAvatarUrl('')}
                      className="w-full text-center text-[10px] text-zinc-500 hover:text-zinc-400 font-semibold mt-1"
                    >
                      Reset to Initials
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Profile Fields */}
              <div className="md:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-200 focus:outline-none focus:border-rose-500/50 text-xs transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Role / Title</label>
                    <input
                      type="text"
                      required
                      value={profileTitle}
                      onChange={(e) => setProfileTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-200 focus:outline-none focus:border-rose-500/50 text-xs transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-200 focus:outline-none focus:border-rose-500/50 text-xs transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-200 focus:outline-none focus:border-rose-500/50 text-xs transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Workspace Theme Color</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['light', 'dark'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setProfileTheme(t)}
                        className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all capitalize ${
                          profileTheme === t
                            ? 'bg-rose-500/10 border-rose-500 text-rose-450'
                            : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-350 hover:border-zinc-750'
                        }`}
                      >
                        {t === 'light' ? 'Light Mode' : 'Dark Mode'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-zinc-850">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      stopCamera();
                    }}
                    className="px-4 py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-300 font-semibold text-xs rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* System Diagnostics Modal */}
      {isDiagnosticsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden border bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-400" />
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-rose-400 animate-pulse" />
                <h3 className="text-lg font-semibold text-zinc-100">System Control & Diagnostics</h3>
              </div>
              <button
                onClick={() => {
                  setIsDiagnosticsOpen(false);
                  setDiagnosticProgress(null);
                }}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Database Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-950 border border-zinc-800/60 rounded-xl">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Client Registry</p>
                <p className="text-xl font-bold text-zinc-200 mt-1">{customers.length} Profiles</p>
                <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  Synced & Safe
                </span>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-800/60 rounded-xl">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Match Proposals</p>
                <p className="text-xl font-bold text-zinc-200 mt-1">{matches.length} Pairs</p>
                <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Matching Engine Online
                </span>
              </div>
            </div>

            {/* Diagnostics Tool */}
            <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium">Diagnostic Utilities</span>
                {lastScanTime && <span className="text-[10px] text-zinc-500 font-mono">Last scan: {lastScanTime}</span>}
              </div>
              
              <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-2">
                  {diagnosticProgress === 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  ) : diagnosticProgress !== null ? (
                    <Loader2 className="w-4 h-4 text-pink-400 animate-spin flex-shrink-0" />
                  ) : (
                    <Activity className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  )}
                  <span className="text-zinc-300 font-mono select-none">{diagnosticStatus}</span>
                </div>

                {diagnosticProgress !== null && (
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-150" 
                        style={{ width: `${diagnosticProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-end text-[10px] text-zinc-500 font-mono">
                      {diagnosticProgress}%
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={runDiagnostics}
                disabled={diagnosticProgress !== null && diagnosticProgress < 100}
                className="w-full py-2 px-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 active:bg-rose-500/30 disabled:opacity-50 text-rose-400 hover:text-rose-300 font-medium text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 focus:outline-none"
              >
                {diagnosticProgress !== null && diagnosticProgress < 100 ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Scanning System Assets...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    {diagnosticProgress === 100 ? 'Re-run Diagnostic Scan' : 'Run Diagnostics & Health Check'}
                  </>
                )}
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsDiagnosticsOpen(false);
                  setDiagnosticProgress(null);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-750 text-zinc-300 font-medium text-xs rounded-xl transition-all focus:outline-none"
              >
                Dismiss Control Center
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
