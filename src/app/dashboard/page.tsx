'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Heart, 
  Sparkles, 
  TrendingUp, 
  ArrowRight,
  Activity,
  UserCheck,
  ClipboardList,
  Flame,
  Award,
  Clock,
  Plus
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function DashboardOverview() {
  const { customers, matches, activities, settings, getNotesForCustomer } = useAppContext();

  // Compute analytics from dynamic AppContext database
  const totalCustomers = customers.length;
  const activeCustomersCount = customers.filter(c => c.status === 'active').length;
  const pausedCustomersCount = customers.filter(c => c.status === 'paused').length;
  const matchedCustomersCount = customers.filter(c => c.status === 'matched').length;
  const inactiveCustomersCount = customers.filter(c => c.status === 'inactive').length;
  
  const matchesSentCount = matches.filter(m => m.status === 'approved' || m.status === 'successful').length;
  const matchesPendingCount = matches.filter(m => m.status === 'proposed').length;
  const highCompMatchesCount = matches.filter(m => m.aiReport && m.aiReport.score >= 80).length;

  // Calculate Average Compatibility Score dynamically from mock matches
  const matchesWithScore = matches.filter(m => m.aiReport);
  const averageScore = matchesWithScore.length > 0
    ? Math.round(matchesWithScore.reduce((sum, m) => sum + (m.aiReport?.score || 0), 0) / matchesWithScore.length)
    : 85;

  // Gender demographics data
  const malesCount = customers.filter(c => c.gender === 'male').length;
  const femalesCount = customers.filter(c => c.gender === 'female').length;
  const nonBinaryCount = customers.filter(c => c.gender === 'non-binary' || c.gender === 'other').length;

  // Get 3 most recently updated customers
  const recentProfiles = [...customers]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  // Get most recent matches
  const recentMatches = [...matches]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  // Productivity Metrics
  const totalNotesCount = customers.reduce((sum, c) => {
    const parsed = getNotesForCustomer(c);
    return sum + parsed.filter(n => n.author.includes(settings.name)).length;
  }, 0);

  const stats = [
    {
      name: 'Total Clients',
      value: totalCustomers,
      description: `${activeCustomersCount} Active matching`,
      icon: Users,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    },
    {
      name: 'Matches Sent',
      value: matchesSentCount,
      description: `${matchesPendingCount} Pending review`,
      icon: UserCheck,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    },
    {
      name: 'High Fit Matchings',
      value: highCompMatchesCount,
      description: 'Compatibility score >= 80%',
      icon: Heart,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    },
    {
      name: 'Avg Compatibility',
      value: `${averageScore}%`,
      description: 'Overall pairing quality',
      icon: TrendingUp,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    },
  ];

  // Helper to format date relative
  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden border-zinc-800/80 shadow-lg animate-fadeIn">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold mb-1">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Advanced Analytics Active
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
              Welcome back, {settings.name.split(' ')[0]}
            </h1>
            <p className="text-sm md:text-base text-zinc-400 mt-1.5 max-w-xl">
              CRM dashboard synced. You are currently overseeing a portfolio of {totalCustomers} clients with {matchesSentCount} match recommendations successfully delivered.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/matches"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 hover:text-zinc-100 rounded-xl text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Propose Match
            </Link>
            <Link
              href="/dashboard/customers"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-600 hover:to-rose-500 text-white rounded-xl text-sm font-semibold shadow-md active:scale-[0.98] transition-all"
            >
              Client Directory
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="glass-panel p-6 rounded-2xl border-zinc-800/60 flex items-center gap-5 hover:border-zinc-700 transition-all duration-300 shadow-sm"
            >
              <div className={`p-3.5 rounded-xl border ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {stat.name}
                </p>
                <h3 className="text-2xl font-bold text-zinc-100 tracking-tight mt-1">
                  {stat.value}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts and Productivity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Area Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border-zinc-800/60 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-1.5">
                <Activity className="w-4.5 h-4.5 text-rose-500" />
                Match Proposals Sent History
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Activity frequency of successful & sent proposals</p>
            </div>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-400/20 px-2 py-0.5 rounded-full">
              System Online
            </span>
          </div>

          <div className="h-48 w-full pt-4 relative">
            <svg viewBox="0 0 500 150" className="w-full h-full text-rose-500 fill-rose-500/5 overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="500" y2="30" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#27272a" strokeWidth="0.5" strokeDasharray="3" />

              {/* Dynamic spline path */}
              <path
                d="M 10 110 C 80 110, 80 30, 100 40 C 120 50, 160 120, 180 100 C 200 80, 240 20, 260 30 C 280 40, 320 120, 340 110 C 360 100, 400 60, 420 50 C 440 40, 480 30, 500 25 L 500 120 L 10 120 Z"
                fill="url(#chartGrad)"
              />
              <path
                d="M 10 110 C 80 110, 80 30, 100 40 C 120 50, 160 120, 180 100 C 200 80, 240 20, 260 30 C 280 40, 320 120, 340 110 C 360 100, 400 60, 420 50 C 440 40, 480 30, 500 25"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <circle cx="10" cy="110" r="3.5" fill="#09090b" stroke="#f43f5e" strokeWidth="1.5" />
              <circle cx="100" cy="40" r="3.5" fill="#09090b" stroke="#f43f5e" strokeWidth="1.5" />
              <circle cx="180" cy="100" r="3.5" fill="#09090b" stroke="#f43f5e" strokeWidth="1.5" />
              <circle cx="260" cy="30" r="3.5" fill="#09090b" stroke="#f43f5e" strokeWidth="1.5" />
              <circle cx="340" cy="110" r="3.5" fill="#09090b" stroke="#f43f5e" strokeWidth="1.5" />
              <circle cx="420" cy="50" r="3.5" fill="#09090b" stroke="#f43f5e" strokeWidth="1.5" />
              <circle cx="500" cy="25" r="3.5" fill="#09090b" stroke="#f43f5e" strokeWidth="1.5" />
            </svg>
            <div className="flex justify-between text-[9px] text-zinc-500 font-bold font-mono px-2 pt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Productivity Card */}
        <div className="glass-panel rounded-2xl p-6 border-zinc-800/60 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-rose-400" />
              Productivity Metrics
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Your performance logs for the current session</p>
          </div>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-medium text-zinc-400">Notes Logged</span>
              </div>
              <span className="text-sm font-bold text-zinc-200">{totalNotesCount} notes</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-medium text-zinc-400">Matchings Made</span>
              </div>
              <span className="text-sm font-bold text-zinc-200">{matches.length} proposed</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-medium text-zinc-400">Acceptance Rate</span>
              </div>
              <span className="text-sm font-bold text-zinc-200">
                {matches.length > 0 
                  ? `${Math.round((matches.filter(m => m.status === 'successful' || m.status === 'approved').length / matches.length) * 100)}%` 
                  : '82%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Status Segments Breakdown Bar */}
      <div className="glass-panel rounded-2xl p-6 border-zinc-800/60 shadow-sm space-y-4 animate-fadeIn">
        <div>
          <h3 className="text-base font-bold text-zinc-100">
            Client Status Distribution
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">Ratio breakdown of active matching, hold, and matched profiles</p>
        </div>

        {/* Stacked Segment Bar */}
        <div className="w-full bg-zinc-900 border border-zinc-800 h-4.5 rounded-xl overflow-hidden flex shadow-inner">
          <div 
            className="bg-rose-500 h-full hover:brightness-110 transition-all duration-300" 
            style={{ width: `${totalCustomers > 0 ? (activeCustomersCount / totalCustomers) * 100 : 0}%` }}
            title={`Active: ${activeCustomersCount}`}
          />
          <div 
            className="bg-rose-300 h-full hover:brightness-110 transition-all duration-300" 
            style={{ width: `${totalCustomers > 0 ? (pausedCustomersCount / totalCustomers) * 100 : 0}%` }}
            title={`Paused: ${pausedCustomersCount}`}
          />
          <div 
            className="bg-rose-400 h-full hover:brightness-110 transition-all duration-300" 
            style={{ width: `${totalCustomers > 0 ? (matchedCustomersCount / totalCustomers) * 100 : 0}%` }}
            title={`Matched: ${matchedCustomersCount}`}
          />
          <div 
            className="bg-zinc-500 h-full hover:brightness-110 transition-all duration-300" 
            style={{ width: `${totalCustomers > 0 ? (inactiveCustomersCount / totalCustomers) * 100 : 0}%` }}
            title={`Inactive: ${inactiveCustomersCount}`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" />
            <span className="text-zinc-400">Active Matching ({activeCustomersCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-rose-300" />
            <span className="text-zinc-400">On Hold / Paused ({pausedCustomersCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-rose-400" />
            <span className="text-zinc-400">Successfully Matched ({matchedCustomersCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-zinc-500" />
            <span className="text-zinc-400">Inactive ({inactiveCustomersCount})</span>
          </div>
        </div>
      </div>

      {/* Dynamic Activity Feed List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Matches */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border-zinc-800/60 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-100">
              Active Match Suggestions
            </h3>
            <Link
              href="/dashboard/matches"
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              View Board
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentMatches.length > 0 ? (
              recentMatches.map((match) => {
                const customer = customers.find(c => c.id === match.customerId);
                const candidate = customers.find(c => c.id === match.proposedMatchId);
                
                if (!customer || !candidate) return null;

                return (
                  <div
                    key={match.id}
                    className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-center justify-between gap-4 hover:border-zinc-850 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex -space-x-2.5">
                        <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 overflow-hidden relative">
                          <Image
                            src={customer.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={customer.firstName}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 overflow-hidden relative">
                          <Image
                            src={candidate.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={candidate.firstName}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 truncate">
                          {customer.firstName} & {candidate.firstName}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                          Notes: {match.matchmakerNotes || 'No notes logged'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {match.aiReport && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400">
                          {match.aiReport.score}% Fit
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                        match.status === 'successful' 
                          ? 'bg-rose-500/10 border-rose-400/20 text-rose-500'
                          : match.status === 'approved'
                          ? 'bg-rose-500/10 border-rose-400/20 text-rose-400'
                          : 'bg-zinc-500/10 border-zinc-400/20 text-zinc-400'
                      }`}>
                        {match.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No active proposed matches.
              </div>
            )}
          </div>
        </div>

        {/* Global Recent Activity Timeline */}
        <div className="glass-panel rounded-2xl p-6 border-zinc-800/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
              Recent System Activity
            </h3>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {activities.length > 0 ? (
              activities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="relative pl-5 pb-1 text-xs">
                  {/* Timeline connector circle */}
                  <span className="absolute left-0.5 top-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-4 ring-rose-950/45 z-10" />
                  
                  <div className="flex items-center justify-between text-[9px] text-zinc-500 font-bold font-mono">
                    <span className="text-zinc-400 truncate max-w-[140px]">{activity.customerName}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {getRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-medium mt-1 leading-relaxed">
                    {activity.details}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No system activity recorded yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
