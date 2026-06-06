'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, 
  Compass, 
  Sparkles, 
  Plus, 
  Search,
  FilterX,
  X,
  Check,
  AlertTriangle,
  Info,
  Brain,
  Trash2,
  CheckCircle2,
  Mail,
  Send,
  MessageSquare,
  Clock,
  ArrowRight,
  HeartHandshake,
  Copy
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { MatchStatus, Match } from '@/types/match';
import { Customer } from '@/types/customer';
import { calculateCompatibility } from '@/services/matching/matcher';

type FilterType = 'all' | 'high_potential' | 'sent' | 'pending' | 'accepted' | 'rejected';

export default function MatchesPage() {
  const { 
    customers, 
    matches, 
    proposeMatch, 
    updateMatchStatus, 
    deleteMatch,
    sendMatchRecommendation 
  } = useAppContext();

  // Search and Filter states
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Modals state
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showAIBriefModal, setShowAIBriefModal] = useState(false);
  const [selectedMatchForBrief, setSelectedMatchForBrief] = useState<Match | null>(null);

  // AI Brief fetch state
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Propose form state
  const [clientAId, setClientAId] = useState('');
  const [clientBId, setClientBId] = useState('');
  const [proposalNotes, setProposalNotes] = useState('');

  // Send Match Modal state
  const [activeRecommendMatch, setActiveRecommendMatch] = useState<Match | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingRecommendation, setIsSendingRecommendation] = useState(false);

  // Filter lists
  const filteredMatches = useMemo(() => {
    let result = [...matches];

    // Filter by type
    if (activeFilter === 'high_potential') {
      result = result.filter(m => m.aiReport && m.aiReport.score >= 80);
    } else if (activeFilter === 'sent') {
      result = result.filter(m => m.status === 'approved');
    } else if (activeFilter === 'pending') {
      result = result.filter(m => m.status === 'proposed');
    } else if (activeFilter === 'accepted') {
      result = result.filter(m => m.status === 'successful');
    } else if (activeFilter === 'rejected') {
      result = result.filter(m => m.status === 'rejected');
    }

    // Search by client name
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(m => {
        const client = customers.find(c => c.id === m.customerId);
        const candidate = customers.find(c => c.id === m.proposedMatchId);
        return (
          (client && `${client.firstName} ${client.lastName}`.toLowerCase().includes(q)) ||
          (candidate && `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(q))
        );
      });
    }

    return result;
  }, [matches, activeFilter, search, customers]);

  // Client A List (active customers only)
  const clientAList = useMemo(() => {
    return customers.filter(c => c.status === 'active');
  }, [customers]);

  // Client B List (opposite gender, compatible options, active)
  const clientBList = useMemo(() => {
    if (!clientAId) return [];
    const clientA = customers.find(c => c.id === clientAId);
    if (!clientA) return [];

    return customers.filter(c => {
      if (c.id === clientAId) return false;
      if (c.status !== 'active') return false;
      
      // Basic gender compatibility check
      const genderMatch = clientA.matchPreferences.genders.includes(c.gender) && 
                          c.matchPreferences.genders.includes(clientA.gender);
      return genderMatch;
    });
  }, [clientAId, customers]);

  // Real-time compatibility preview for Propose Form
  const liveCompatibilityScore = useMemo(() => {
    if (!clientAId || !clientBId) return null;
    const clientA = customers.find(c => c.id === clientAId);
    const clientB = customers.find(c => c.id === clientBId);
    if (!clientA || !clientB) return null;
    return calculateCompatibility(clientA, clientB);
  }, [clientAId, clientBId, customers]);

  // Handle Propose submit
  const handleProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientAId || !clientBId) return;

    proposeMatch(clientAId, clientBId, proposalNotes || 'Independently proposed match pairing.');
    
    // Reset
    setShowProposeModal(false);
    setClientAId('');
    setClientBId('');
    setProposalNotes('');
  };

  // Trigger AI analysis modal
  const handleOpenAIBrief = async (match: Match) => {
    setSelectedMatchForBrief(match);
    setShowAIBriefModal(true);
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setCopied(false);

    try {
      const clientData = customers.find(c => c.id === match.customerId);
      const candidateData = customers.find(c => c.id === match.proposedMatchId);
      
      const response = await fetch('/api/generate-match-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientId: match.customerId, 
          candidateId: match.proposedMatchId,
          clientData,
          candidateData
        })
      });

      if (!response.ok) {
        throw new Error('AI Engine failed to generate. Falling back to mockup...');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : String(err));
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Open recommendation email composer
  const handleOpenRecommendModal = (match: Match) => {
    const client = customers.find(c => c.id === match.customerId);
    const candidate = customers.find(c => c.id === match.proposedMatchId);
    if (!client || !candidate) return;

    setActiveRecommendMatch(match);
    setEmailSubject(`Date Crew Recommendation: Meet ${candidate.firstName}`);
    
    const bodyText = `Hi ${client.firstName},

I have found an exciting match recommendation for you: ${candidate.firstName}, who is a ${candidate.age}-year-old ${candidate.occupation || 'professional'} based in ${candidate.city}.

Our algorithmic evaluation calculated a high ${match.aiReport?.score || 80}% compatibility fit. Here is a brief highlight from our match assessment:
"${match.matchmakerNotes || 'Highly compatible lifestyle alignment.'}"

You both share hobbies in ${candidate.hobbies.slice(0, 2).join(' & ')}, and have similar expectations on values and future family goals.

I've attached a copy of their bio-brief. Let me know if you would like me to introduce you two!

Warmly,
Maggie Crew
Senior Matchmaker, The Date Crew`;

    setEmailBody(bodyText);
  };

  const handleSendRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecommendMatch) return;

    setIsSendingRecommendation(true);
    setTimeout(() => {
      sendMatchRecommendation(activeRecommendMatch.id, emailSubject, emailBody);
      setIsSendingRecommendation(false);
      setActiveRecommendMatch(null);
    }, 1000);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
            Matchmaking board
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Track client pairings, examine AI compatibility metrics, and manage the approval lifecycle.
          </p>
        </div>
        <button
          onClick={() => setShowProposeModal(true)}
          className="self-start sm:self-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all shadow-md shadow-rose-950/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Propose New Match
        </button>
      </div>

      {/* Control panel & filters */}
      <div className="glass-panel rounded-2xl p-5 border-zinc-800/80 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          
          {/* Filters buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {(
              [
                { id: 'all', label: 'All proposed' },
                { id: 'high_potential', label: 'High Potential' },
                { id: 'sent', label: 'Sent' },
                { id: 'pending', label: 'Pending' },
                { id: 'accepted', label: 'Accepted' },
                { id: 'rejected', label: 'Rejected' }
              ] as { id: FilterType; label: string }[]
            ).map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-zinc-900/30 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name..."
              className="w-full pl-9 pr-4 py-1.5 bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 text-xs transition-all"
            />
          </div>

        </div>
      </div>

      {/* Matches Display list */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => {
            const client = customers.find(c => c.id === match.customerId);
            const candidate = customers.find(c => c.id === match.proposedMatchId);

            if (!client || !candidate) return null;

            return (
              <div
                key={match.id}
                className="glass-panel rounded-2xl p-5 border-zinc-800/60 hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-md group animate-fadeIn"
              >
                <div className="space-y-4">
                  
                  {/* Status & Score */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                      match.status === 'successful'
                        ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400'
                        : match.status === 'approved'
                        ? 'bg-blue-950/30 border-blue-500/20 text-blue-400'
                        : match.status === 'rejected'
                        ? 'bg-red-950/30 border-red-500/20 text-red-400'
                        : 'bg-amber-950/30 border-amber-500/20 text-amber-400'
                    }`}>
                      {match.status === 'approved' ? 'sent' : match.status}
                    </span>
                    
                    {match.aiReport && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded-lg border border-rose-500/15">
                        <Sparkles className="w-3 h-3 text-rose-400" />
                        {match.aiReport.score}% Fit
                      </div>
                    )}
                  </div>

                  {/* Connected Profile Cards */}
                  <div className="flex items-center justify-between px-1">
                    
                    {/* Client A */}
                    <Link 
                      href={`/dashboard/customers/${client.id}`}
                      className="flex flex-col items-center text-center space-y-1.5 group max-w-[85px] shrink-0"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-800 group-hover:border-rose-500/50 transition-colors bg-zinc-800 relative shadow-sm">
                        <Image src={client.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} alt={client.firstName} width={48} height={48} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-300 truncate w-full group-hover:text-rose-400 transition-colors">
                        {client.firstName}
                      </span>
                    </Link>

                    {/* Bridge graphic */}
                    <div className="flex-1 flex flex-col items-center justify-center relative">
                      <div className="h-px w-10 bg-gradient-to-r from-rose-500/30 via-violet-500/30 to-rose-500/30" />
                      <Compass className="w-4 h-4 text-violet-400 absolute animate-spin-slow opacity-60" style={{ animationDuration: '16s' }} />
                    </div>

                    {/* Client B */}
                    <Link 
                      href={`/dashboard/customers/${candidate.id}`}
                      className="flex flex-col items-center text-center space-y-1.5 group max-w-[85px] shrink-0"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-800 group-hover:border-rose-500/50 transition-colors bg-zinc-800 relative shadow-sm">
                        <Image src={candidate.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} alt={candidate.firstName} width={48} height={48} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-300 truncate w-full group-hover:text-rose-400 transition-colors">
                        {candidate.firstName}
                      </span>
                    </Link>

                  </div>

                  {/* Comments Panel */}
                  <div className="text-xs bg-zinc-900/35 border border-zinc-900 rounded-xl p-3 text-zinc-400 space-y-1.5">
                    <p className="font-bold text-[9px] uppercase tracking-wider text-rose-400/90 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                      Coordinator Note:
                    </p>
                    <p className="italic leading-normal">
                      &ldquo;{match.matchmakerNotes || 'No notes added'}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenAIBrief(match)}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-805 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                      title="AI Brief Explanation"
                    >
                      <Brain className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this proposed pairing?')) {
                          deleteMatch(match.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-805 hover:border-red-900/40 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                      title="Delete Match"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* State Change Buttons */}
                  <div className="flex items-center gap-1.5">
                    {match.status === 'proposed' && (
                      <>
                        <button
                          onClick={() => updateMatchStatus(match.id, 'rejected')}
                          className="px-2 py-1 bg-zinc-950 border border-zinc-800 hover:bg-red-950/20 hover:text-red-400 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleOpenRecommendModal(match)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          Send Match
                        </button>
                      </>
                    )}
                    {match.status === 'approved' && (
                      <>
                        <button
                          onClick={() => updateMatchStatus(match.id, 'rejected')}
                          className="px-2 py-1 bg-zinc-950 border border-zinc-800 hover:bg-red-950/20 hover:text-red-400 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => updateMatchStatus(match.id, 'successful')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-md transition-all cursor-pointer"
                        >
                          Accept Match
                        </button>
                      </>
                    )}
                    {match.status === 'successful' && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Connected
                      </span>
                    )}
                    {match.status === 'rejected' && (
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        Closed
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center border-zinc-800/60 flex flex-col items-center justify-center space-y-4 shadow-sm animate-fadeIn">
          <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
            <FilterX className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-300">No match pairings found</h3>
            <p className="text-sm text-zinc-500 max-w-sm mt-1">
              No matching recommendations fit the selected filter criteria. Create a new pairing or adjust filters.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveFilter('all');
              setSearch('');
            }}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Propose Match Modal Form */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowProposeModal(false)}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md transition-opacity duration-300" 
          />

          <form 
            onSubmit={handleProposeSubmit}
            className="glass-panel w-full max-w-xl rounded-2xl border-zinc-800/80 shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh] animate-scaleIn"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-900 bg-zinc-950/45 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20 animate-pulse" />
                <span className="font-bold text-zinc-100 text-sm tracking-tight">Propose New Client Match</span>
              </div>
              <button
                type="button"
                onClick={() => setShowProposeModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Fields Scroll */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Select Client A */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Select Client A</label>
                <select 
                  required
                  value={clientAId} 
                  onChange={(e) => {
                    setClientAId(e.target.value);
                    setClientBId('');
                  }}
                  className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-805 rounded-xl text-zinc-200 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="">-- Select Primary Client --</option>
                  {clientAList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.gender}, Age {c.age}, {c.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Client B (Candidates) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Select Match Candidate (Client B)</label>
                <select 
                  required
                  disabled={!clientAId}
                  value={clientBId} 
                  onChange={(e) => setClientBId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-805 rounded-xl text-zinc-200 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">-- Select Compatible Candidate --</option>
                  {clientBList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.gender}, Age {c.age}, {c.city})
                    </option>
                  ))}
                </select>
                {!clientAId && (
                  <p className="text-[10px] text-zinc-600">Please select Client A first to view compatible matches.</p>
                )}
              </div>

              {/* Real-time Score Preview */}
              {liveCompatibilityScore && (
                <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-2 animate-fadeIn text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-400">Algorithmic Compatibility Fit:</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      liveCompatibilityScore.score >= 80 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {liveCompatibilityScore.score}% Score
                    </span>
                  </div>
                  {liveCompatibilityScore.pros.length > 0 && (
                    <div className="text-[10px] text-zinc-500">
                      <span className="font-bold text-zinc-400">Strengths:</span> {liveCompatibilityScore.pros.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Matchmaker Comments */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Matchmaker Proposal Notes</label>
                <textarea
                  required
                  rows={3}
                  value={proposalNotes}
                  onChange={(e) => setProposalNotes(e.target.value)}
                  placeholder="Explain why this pairing represents strong synergy (career, religion, hobbies alignment)..."
                  className="w-full px-3 py-2 bg-zinc-900/60 border border-zinc-805 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs resize-none"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-zinc-900 bg-zinc-950/30 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-medium">
                Proposed matches are reviewed on the board.
              </span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-all"
                >
                  Propose Match
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* AI Explanation / Briefing Modal */}
      {showAIBriefModal && selectedMatchForBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowAIBriefModal(false)}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md" 
          />

          <div className="glass-panel w-full max-w-2xl rounded-2xl border-zinc-800/80 shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh] animate-scaleIn">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-900 bg-zinc-950/45 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-rose-400" />
                <span className="font-bold text-zinc-100 text-sm tracking-tight">AI Compatibility Briefing</span>
              </div>
              <button
                onClick={() => setShowAIBriefModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Profile links connection banner */}
              <div className="flex items-center justify-center gap-6 pb-4 border-b border-zinc-900/40">
                {(() => {
                  const client = customers.find(c => c.id === selectedMatchForBrief.customerId);
                  const candidate = customers.find(c => c.id === selectedMatchForBrief.proposedMatchId);
                  
                  if (!client || !candidate) return null;

                  return (
                    <>
                      <div className="flex flex-col items-center text-center space-y-1">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-rose-500/20 shadow-md bg-zinc-800 relative">
                          <Image src={client.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={client.firstName} width={56} height={56} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-zinc-300">{client.firstName}</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="h-px w-20 bg-gradient-to-r from-rose-500/30 to-violet-500/30 relative flex items-center justify-center">
                          <HeartHandshake className="w-4 h-4 text-rose-500 absolute -top-2 animate-pulse" />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-bold mt-2 font-mono">
                          {selectedMatchForBrief.aiReport?.score || 80}% match
                        </span>
                      </div>

                      <div className="flex flex-col items-center text-center space-y-1">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-rose-500/20 shadow-md bg-zinc-800 relative">
                          <Image src={candidate.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={candidate.firstName} width={56} height={56} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-zinc-300">{candidate.firstName}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Loading State */}
              {analysisLoading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-rose-500/10 border-t-rose-500 border-r-rose-500 animate-spin absolute" />
                    <Brain className="w-7 h-7 text-rose-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-300">Evaluating Profile Alignment</h4>
                    <p className="text-xs text-rose-400 font-semibold mt-1 font-mono">
                      Querying AI matching engines...
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {analysisError && (
                <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-red-400 text-xs font-bold">
                    <AlertTriangle className="w-4.5 h-4.5" />
                    {analysisError}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenAIBrief(selectedMatchForBrief)}
                    className="px-4 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-900/40 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Retry Analysis
                  </button>
                </div>
              )}

              {/* Success Content */}
              {analysisResult && (
                <div className="space-y-6 animate-fadeIn text-xs">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400/90 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Compatibility Summary
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium p-4 bg-zinc-900/35 border border-zinc-800 rounded-xl">
                      {analysisResult.summary}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5" />
                      Relationship Potential Analysis
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium p-4 bg-zinc-900/35 border border-zinc-800 rounded-xl">
                      {analysisResult.potentialAnalysis}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        Personalized Introduction Pitch
                      </h4>
                      
                      <button
                        onClick={() => handleCopyText(analysisResult.introduction)}
                        className={`flex items-center gap-1 text-[10px] font-semibold transition-colors px-2 py-1 rounded-lg border cursor-pointer ${
                          copied 
                            ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20' 
                            : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 border-zinc-800'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Draft
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <pre className="text-xs text-zinc-400 leading-relaxed font-mono p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-[200px]">
                        {analysisResult.introduction}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-zinc-900 bg-zinc-950/30 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-medium">
                {analysisResult?.note || 'AI results generated locally securely.'}
              </span>
              <button
                type="button"
                onClick={() => setShowAIBriefModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Brief
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Recommendation Modal */}
      {activeRecommendMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setActiveRecommendMatch(null)}
            className="fixed inset-0 bg-zinc-950/85 backdrop-blur-md" 
          />

          <form 
            onSubmit={handleSendRecommendation}
            className="glass-panel w-full max-w-xl rounded-2xl border-zinc-800/80 shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh] animate-scaleIn"
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-900 bg-zinc-950/45 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-rose-400" />
                <span className="font-bold text-zinc-100 text-sm tracking-tight">Compose Match Recommendation</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveRecommendMatch(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields Scroll */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email Subject Line</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 text-xs transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email Message Body</label>
                <textarea
                  required
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500/50 text-xs font-mono leading-relaxed transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-zinc-900 bg-zinc-950/30 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-medium leading-relaxed max-w-xs">
                Sending logs this match as sent (approved).
              </span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRecommendMatch(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingRecommendation}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isSendingRecommendation ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Recommendation
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
