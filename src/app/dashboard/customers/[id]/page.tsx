'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  Users, 
  Heart, 
  Smile, 
  BadgeInfo, 
  Clock, 
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  MapPin,
  Brain,
  X,
  Copy,
  Check,
  AlertTriangle,
  Mail,
  Send,
  History,
  FileText,
  BookmarkCheck,
  RotateCcw
} from 'lucide-react';
import { Customer, CustomerStatus } from '@/types/customer';
import ProfileHeader from '@/components/customers/profile-header';
import InfoSection, { InfoItem } from '@/components/customers/info-section';
import NotesPanel from '@/components/customers/notes-panel';
import { useAppContext, RichNote } from '@/context/AppContext';
import { rankMatches, calculateCompatibility } from '@/services/matching/matcher';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface HistoryItem {
  id: string;
  candidateId: string;
  candidateName: string;
  avatarUrl?: string;
  score: number;
  sentAt: string;
  status: 'sent' | 'responded' | 'declined';
}

interface ToastMessage {
  id: string;
  message: string;
}

const loadingMessages = [
  'Parsing profiles and biodata records...',
  'Evaluating lifestyle habits & location limits...',
  'Generating compatibility summary matrices...',
  'Writing personalized introduction letter draft...'
];

export default function CustomerDetailPage({ params }: PageProps) {
  const { id } = use(params);
  
  const { 
    customers, 
    matches, 
    activities, 
    updateCustomerStatus, 
    addNote, 
    editNote, 
    deleteNote,
    proposeMatch,
    sendMatchRecommendation,
    getNotesForCustomer 
  } = useAppContext();

  // Find dynamic client
  const client = customers.find((c) => c.id === id);

  // Custom Toast Notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // AI Analysis states
  const [activeAnalysisCandidate, setActiveAnalysisCandidate] = useState<Customer | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string;
    potentialAnalysis: string;
    introduction: string;
    score: number;
    note?: string;
  } | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Recommendation Modal states
  const [activeRecommendCandidate, setActiveRecommendCandidate] = useState<Customer | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingRecommendation, setIsSendingRecommendation] = useState(false);

  // Timed messages for AI loading status
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (analysisLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [analysisLoading]);

  // Handle missing client
  if (!client) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border-zinc-800/60 max-w-lg mx-auto mt-12 space-y-4 shadow-2xl animate-fadeIn">
        <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
          <BadgeInfo className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-200 font-sans">Client Profile Not Found</h2>
          <p className="text-sm text-zinc-500 mt-1">
            The profile identifier you requested ({id}) does not exist in the CRM records.
          </p>
        </div>
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-xl text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
      </div>
    );
  }

  // Helper to add toast notifications
  const addToast = (message: string) => {
    const toastId = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { id: toastId, message }]);
    
    // Auto remove after 3.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 3500);
  };

  // 1. Basic Information Items
  const basicItems: InfoItem[] = [
    { label: 'Date of Birth (DOB)', value: client.dob },
    { label: 'Age', value: `${client.age} years old` },
    { label: 'Height', value: client.height },
    { label: 'Religion', value: client.religion || 'Non-religious' },
    { label: 'Caste / Community', value: client.caste || 'N/A' },
    { label: 'Mother Tongue', value: client.motherTongue },
    { label: 'Languages Spoken', value: client.languages.join(', ') },
    { label: 'Horoscope / Rashi', value: client.horoscope || 'N/A' },
    { label: 'Verification Status', value: client.verificationStatus || 'Pending' },
    { label: 'Self Introduction / Bio', value: client.bio, isFullWidth: true },
  ];

  // 2. Career & Education Items
  const careerItems: InfoItem[] = [
    { label: 'Occupation', value: client.occupation || 'N/A' },
    { label: 'Designation / Title', value: client.designation },
    { label: 'Company / Employer', value: client.company },
    { label: 'University / College', value: client.college },
    { label: 'Degree Completed', value: client.degree },
    { label: 'Annual Income Range', value: client.income },
  ];

  // 3. Family Information Items
  const familyItems: InfoItem[] = [
    { label: 'Family System Structure', value: client.familyType, isFullWidth: true },
    { label: 'Sibling Details', value: client.siblings, isFullWidth: true },
    { label: 'Has Children', value: client.hasChildren ? 'Yes (Living with client)' : 'No' },
  ];

  // 4. Lifestyle & Habits Items
  const lifestyleItems: InfoItem[] = [
    { label: 'Dietary Preference', value: client.diet },
    { label: 'Smoking Habits', value: client.smoking },
    { label: 'Drinking Habits', value: client.drinking },
    { label: 'Open to Relocation', value: typeof client.openToRelocate === 'boolean' ? (client.openToRelocate ? 'Yes' : 'No') : String(client.openToRelocate) },
    { label: 'Open to Pets', value: typeof client.openToPets === 'boolean' ? (client.openToPets ? 'Yes' : 'No') : String(client.openToPets) },
    { label: 'Hobbies', value: client.hobbies.join(', '), isFullWidth: true },
    { label: 'Key Lifestyle Interests', value: client.interests.join(', '), isFullWidth: true },
  ];

  // 5. Partner Preferences Items
  const preferenceItems: InfoItem[] = [
    { label: 'Preferred Genders', value: client.matchPreferences.genders.join(', ') },
    { label: 'Target Age Bracket', value: `${client.matchPreferences.ageRange.min} to ${client.matchPreferences.ageRange.max} years` },
    { label: 'Preferred Locations', value: client.matchPreferences.locations.join(', '), isFullWidth: true },
    { label: 'Non-Negotiables / Dealbreakers', value: client.matchPreferences.dealbreakers && client.matchPreferences.dealbreakers.length > 0 ? client.matchPreferences.dealbreakers.join(', ') : 'None specified', isFullWidth: true },
  ];

  const handleStatusChange = (newStatus: CustomerStatus) => {
    updateCustomerStatus(client.id, newStatus);
    addToast(`Client status successfully updated to "${newStatus}"`);
  };

  // Fetch AI Match analysis from route
  const handleAnalyzeCompatibility = async (candidate: Customer) => {
    setActiveAnalysisCandidate(candidate);
    setLoadingStep(0);
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setCopied(false);

    try {
      const response = await fetch('/api/generate-match-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientId: client.id, 
          candidateId: candidate.id,
          clientData: client,
          candidateData: candidate
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI request failed. Falling back...');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : String(err));
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleCopyIntroduction = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Introduction email template copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Open the send match recommendation modal and generate email template
  const handleOpenRecommendModal = (candidate: Customer, compatibilityScore: number) => {
    // Propose match first in system if not already proposed
    let matchObj = matches.find(m => 
      (m.customerId === client.id && m.proposedMatchId === candidate.id) ||
      (m.customerId === candidate.id && m.proposedMatchId === client.id)
    );

    if (!matchObj) {
      matchObj = proposeMatch(client.id, candidate.id, `Match suggested during profile review.`) || undefined;
    }

    setActiveRecommendCandidate(candidate);
    setEmailSubject(`Date Crew Recommendation: Meet ${candidate.firstName}`);
    
    const compatibility = calculateCompatibility(client, candidate);
    const summary = compatibility.reasons[0] || 'Strong professional and personal alignments.';
    
    const bodyText = `Hi ${client.firstName},

I have found an exciting match recommendation for you: ${candidate.firstName}, who is a ${candidate.age}-year-old ${candidate.occupation || 'professional'} based in ${candidate.city}.

Our algorithmic evaluation calculated a high ${compatibilityScore}% compatibility fit. Here is a brief highlight from our match assessment:
"${summary}"

You both share hobbies in ${candidate.hobbies.slice(0, 2).join(' & ')}, and have similar expectations on values and future family goals.

I've attached a copy of their bio-brief. Let me know if you would like me to introduce you two!

Warmly,
Maggie Crew
Senior Matchmaker, The Date Crew`;

    setEmailBody(bodyText);
  };

  // Send recommendation email
  const handleSendRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecommendCandidate) return;

    setIsSendingRecommendation(true);

    setTimeout(() => {
      // Find the match id
      const matchObj = matches.find(m => 
        (m.customerId === client.id && m.proposedMatchId === activeRecommendCandidate.id) ||
        (m.customerId === activeRecommendCandidate.id && m.proposedMatchId === client.id)
      );

      if (matchObj) {
        sendMatchRecommendation(matchObj.id, emailSubject, emailBody);
      }
      
      addToast(`Match recommendation email sent to ${client.firstName}!`);
      setIsSendingRecommendation(false);
      setActiveRecommendCandidate(null);
    }, 1000);
  };

  // Compute matches using matching engine (Top 10 matches)
  const rankedMatches = rankMatches(client, customers).slice(0, 10);

  // Compute recommendation history dynamically
  const clientRecommendations = matches.filter(m => m.customerId === client.id || m.proposedMatchId === client.id);
  const recommendationHistory: HistoryItem[] = clientRecommendations.map(m => {
    const isCustomer = m.customerId === client.id;
    const partner = isCustomer ? customers.find(c => c.id === m.proposedMatchId) : customers.find(c => c.id === m.customerId);
    return {
      id: m.id,
      candidateId: partner?.id || '',
      candidateName: partner ? `${partner.firstName} ${partner.lastName}` : 'Unknown Client',
      avatarUrl: partner?.avatarUrl,
      score: m.aiReport?.score || 80,
      sentAt: new Date(m.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: m.status === 'successful' ? 'responded' : m.status === 'approved' ? 'sent' : 'declined'
    };
  });

  // Specific customer timeline activities
  const customerActivities = activities.filter(act => 
    act.customerId === client.id || act.details.includes(client.firstName)
  );

  // Parse notes via helper
  const parsedNotes = getNotesForCustomer(client);

  // Get Relative Time for activities
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

  // Journey stage helper
  const getJourneyStage = () => {
    if (client.status === 'matched') return { step: 4, label: 'Successfully Matched' };
    if (recommendationHistory.some(h => h.status === 'responded')) return { step: 3, label: 'Pairing Feedback' };
    if (recommendationHistory.length > 0) return { step: 2, label: 'Recommendations Sent' };
    return { step: 1, label: 'Active Matching' };
  };

  const journey = getJourneyStage();

  return (
    <div className="space-y-8 relative">
      
      {/* Toast Notification Container Overlay */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="p-4 bg-zinc-900 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2.5 pointer-events-auto animate-slideIn"
          >
            <CheckCircle2 className="w-4 h-4 text-rose-500" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Dynamic Header actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 transition-colors font-medium group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Directory
        </Link>

        {/* Dynamic Timeline Notification indicator */}
        <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
          <Clock className="w-3.5 h-3.5" />
          Profile last updated: {new Date(client.updatedAt).toLocaleDateString('en-US')}
        </div>
      </div>

      {/* Main Profile Header */}
      <ProfileHeader 
        customer={client} 
        currentStatus={client.status} 
        onStatusChange={handleStatusChange} 
      />

      {/* Journey Stage Timeline Indicator Component */}
      <div className="glass-panel rounded-2xl p-6 border-zinc-800/60 shadow-sm space-y-4 animate-fadeIn">
        <div className="flex items-center gap-2 font-bold text-sm text-zinc-200 border-b border-zinc-900 pb-3">
          <BookmarkCheck className="w-4.5 h-4.5 text-rose-400" />
          Client Journey Stage Progress: <span className="text-rose-400 font-semibold">{journey.label}</span>
        </div>
        
        {/* Horizontal Steps Layout */}
        <div className="grid grid-cols-4 gap-4 text-center pt-2 select-none">
          <div className="flex flex-col items-center space-y-1">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${journey.step >= 1 ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'border-zinc-800 text-zinc-600'}`}>
              {journey.step >= 1 ? '✓' : '1'}
            </span>
            <span className="text-[10px] font-semibold text-zinc-400">Onboarded</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${journey.step >= 1 ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'border-zinc-800 text-zinc-600'}`}>
              {journey.step >= 1 ? '✓' : '2'}
            </span>
            <span className="text-[10px] font-semibold text-zinc-400">Seeking Matches</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${journey.step >= 2 ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'border-zinc-800 text-zinc-600'}`}>
              {journey.step >= 2 ? '✓' : '3'}
            </span>
            <span className="text-[10px] font-semibold text-zinc-400">Proposals Sent</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${journey.step >= 4 ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'border-zinc-800 text-zinc-600'}`}>
              {journey.step >= 4 ? '✓' : '4'}
            </span>
            <span className="text-[10px] font-semibold text-zinc-400">Matched</span>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Detailed Biodata Blocks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <InfoSection 
            title="Basic Information" 
            icon={User} 
            iconColor="text-rose-400" 
            items={basicItems} 
          />

          {/* Career & Education */}
          <InfoSection 
            title="Professional & Academic Details" 
            icon={Briefcase} 
            iconColor="text-pink-400" 
            items={careerItems} 
          />

          {/* Grid of Family & Lifestyle details side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoSection 
              title="Family Details" 
              icon={Users} 
              iconColor="text-rose-400" 
              items={familyItems} 
            />

            <InfoSection 
              title="Lifestyle & Habits" 
              icon={Smile} 
              iconColor="text-rose-400"
              items={lifestyleItems} 
            />
          </div>

          {/* Partner Match Preferences */}
          <InfoSection 
            title="Desired Partner Criteria" 
            icon={Heart} 
            iconColor="text-rose-500" 
            items={preferenceItems} 
          />
        </div>

        {/* Right Side: Notes Panels & Recommendation History */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20">
          
          {/* CRUD Notes System */}
          <NotesPanel 
            notes={parsedNotes} 
            onAddNote={(text) => addNote(client.id, text)}
            onEditNote={(noteId, text) => editNote(client.id, noteId, text)}
            onDeleteNote={(noteId) => deleteNote(client.id, noteId)}
          />

          {/* Recommendation History Card */}
          <div className="glass-panel rounded-2xl p-6 border-zinc-800/60 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-200 border-b border-zinc-900 pb-3">
              <History className="w-4.5 h-4.5 text-rose-400" />
              Recommendation History
            </div>

            {recommendationHistory.length > 0 ? (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {recommendationHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-800 bg-zinc-800 relative">
                        <Image src={item.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} alt={item.candidateName} width={32} height={32} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-300 truncate">
                          {item.candidateName}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Sent: {item.sentAt}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[9px] font-bold text-rose-400">
                        {item.score}% Fit
                      </span>
                      <span className={`text-[8px] font-bold tracking-wider uppercase ${item.status === 'responded' ? 'text-rose-400' : item.status === 'sent' ? 'text-pink-400' : 'text-zinc-500'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-zinc-500 text-xs flex flex-col items-center">
                <FileText className="w-6 h-6 text-zinc-500 mb-2" />
                <p className="font-semibold">No recommendations sent yet</p>
              </div>
            )}
          </div>

          {/* Client Activity Timeline */}
          <div className="glass-panel rounded-2xl p-6 border-zinc-800/60 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-200 border-b border-zinc-900 pb-3">
              <Clock className="w-4.5 h-4.5 text-rose-400" />
              Client History Timeline
            </div>
            
            <div className="space-y-4.5 max-h-[250px] overflow-y-auto pr-1">
              {customerActivities.length > 0 ? (
                customerActivities.map((act) => (
                  <div key={act.id} className="relative pl-4 pb-1 text-xs">
                    <span className="absolute left-0.5 top-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-4 ring-rose-950/40 z-10" />
                    <div className="flex items-center justify-between text-[9px] text-zinc-500 font-bold font-mono">
                      <span className="uppercase">{act.type.replace('_', ' ')}</span>
                      <span>{getRelativeTime(act.timestamp)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-300 font-semibold mt-1 leading-relaxed">
                      {act.details}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-zinc-500 text-xs">
                  No activity timelines logged.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Suggested Matches Section */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 border-zinc-800/60 shadow-lg relative space-y-6">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-rose-500/[0.02] to-transparent pointer-events-none" />
        
        {/* Section Title */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <HeartHandshake className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                Top 10 Matching Recommendations
              </h2>
              <p className="text-xs text-zinc-400">
                Algorithmic compatibility ranked suggestions derived from client criteria and preference parameters.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 rounded-full">
            <Sparkles className="w-3 h-3 text-rose-400" />
            Engine Active
          </div>
        </div>

        {/* Matches Grid List */}
        {rankedMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {rankedMatches.map(({ candidate, compatibility }, index) => {
              const isHigh = compatibility.score >= 80;
              const isMedium = compatibility.score >= 60 && compatibility.score < 80;
              const scoreBadgeColor = isHigh
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                : isMedium
                ? 'text-pink-400 bg-pink-500/10 border-pink-500/20'
                : 'text-pink-300 bg-pink-500/[0.07] border-pink-500/15';

              return (
                <div
                  key={candidate.id}
                  className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/80 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm group"
                >
                  <div className="space-y-4">
                    {/* Top Row: Info & Score */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden relative shrink-0 shadow-md">
                          <Image
                            src={candidate.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={`${candidate.firstName} ${candidate.lastName}`}
                            width={44}
                            height={44}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500">#{(index || 0) + 1} Match</span>
                            <span className="text-zinc-500">•</span>
                            <span className="text-[10px] text-zinc-500 font-bold font-mono uppercase">{candidate.id}</span>
                          </div>
                          <p className="text-sm font-bold text-zinc-200 truncate mt-0.5 group-hover:text-rose-400 transition-colors">
                            {candidate.firstName} {candidate.lastName}
                          </p>
                        </div>
                      </div>

                      <div className={`w-11 h-11 rounded-full border flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-inner ${scoreBadgeColor}`}>
                        <span>{compatibility.score}</span>
                        <span className="text-[7px] uppercase tracking-wider -mt-0.5 opacity-80">Fit</span>
                      </div>
                    </div>

                    {/* Candidate Quick Stats */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span className="capitalize">{candidate.gender} • {candidate.age} yrs</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3.5 h-3.5" />
                        {candidate.city}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[120px]">{candidate.occupation || 'Professional'}</span>
                    </div>

                    {/* Compatibility Pros and Cons Bullet lists */}
                    <div className="space-y-2.5 pt-1 border-t border-zinc-900">
                      {compatibility.pros.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-rose-400">Match Strengths:</span>
                          <ul className="text-xs text-zinc-400 space-y-1 pl-1">
                            {compatibility.pros.slice(0, 2).map((pro, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-rose-500/80 shrink-0 mt-0.5" />
                                <span className="leading-tight">{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {compatibility.cons.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-pink-500">Potential Friction:</span>
                          <ul className="text-xs text-zinc-400 space-y-1 pl-1">
                            {compatibility.cons.slice(0, 1).map((con, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-1.5">
                                <XCircle className="w-3.5 h-3.5 text-pink-500/70 shrink-0 mt-0.5" />
                                <span className="leading-tight text-zinc-400/90">{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleAnalyzeCompatibility(candidate)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-zinc-800 hover:border-zinc-700 rounded-lg transition-all cursor-pointer"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      AI Matchmaker Brief
                    </button>

                    <button
                      onClick={() => handleOpenRecommendModal(candidate, compatibility.score)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all shadow-md active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Match
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500 space-y-2">
            <BadgeInfo className="w-8 h-8 mx-auto text-zinc-500" />
            <p className="text-xs font-semibold">No compatible matches found</p>
            <p className="text-[10px] text-zinc-650 max-w-xs mx-auto leading-4">
              Try adjusting the customer&apos;s partner preferences to expand the search results.
            </p>
          </div>
        )}
      </div>

      {/* AI Matchmaker Briefing Modal */}
      {activeAnalysisCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setActiveAnalysisCandidate(null)}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md transition-opacity duration-300" 
          />

          <div className="glass-panel w-full max-w-2xl rounded-2xl border-zinc-800/80 shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh] animate-scaleIn">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-900 bg-zinc-950/45 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-rose-400" />
                <span className="font-bold text-zinc-100 text-sm tracking-tight">AI Compatibility Briefing</span>
              </div>
              <button
                onClick={() => setActiveAnalysisCandidate(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Dynamic Profiles Connection */}
              <div className="flex items-center justify-center gap-6 pb-4 border-b border-zinc-900/40">
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-rose-500/20 shadow-md bg-zinc-800 relative">
                    <Image src={client.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={client.firstName} width={56} height={56} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-zinc-300">{client.firstName}</span>
                  <span className="text-[9px] text-zinc-500 capitalize">{client.occupation}</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="h-px w-20 bg-gradient-to-r from-rose-500/30 to-pink-500/30 relative flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4 text-rose-500 absolute -top-2 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold mt-2 font-mono">
                    {analysisResult ? `${analysisResult.score}% match` : 'calculating...'}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-rose-500/20 shadow-md bg-zinc-800 relative">
                    <Image src={activeAnalysisCandidate.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={activeAnalysisCandidate.firstName} width={56} height={56} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-zinc-300">{activeAnalysisCandidate.firstName}</span>
                  <span className="text-[9px] text-zinc-500 capitalize">{activeAnalysisCandidate.occupation}</span>
                </div>
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
                    <p className="text-xs text-rose-400 font-semibold mt-1 font-mono transition-all duration-300">
                      {loadingMessages[loadingStep]}
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {analysisError && (
                <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl text-center space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-center gap-2 text-red-400 text-xs font-bold">
                    <AlertTriangle className="w-4.5 h-4.5" />
                    {analysisError}
                  </div>
                  <button
                    onClick={() => handleAnalyzeCompatibility(activeAnalysisCandidate)}
                    className="px-4 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-900/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Retry Analysis
                  </button>
                </div>
              )}

              {/* Success Content */}
              {analysisResult && (
                <div className="space-y-6 animate-fadeIn">
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5" />
                      Relationship Potential Analysis
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium p-4 bg-zinc-900/35 border border-zinc-800 rounded-xl">
                      {analysisResult.potentialAnalysis}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        Personalized Introduction Pitch
                      </h4>
                      
                      <button
                        onClick={() => handleCopyIntroduction(analysisResult.introduction)}
                        className={`flex items-center gap-1 text-[10px] font-semibold transition-colors px-2 py-1 rounded-lg border cursor-pointer ${
                          copied 
                            ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
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
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAnalysisCandidate(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close Brief
                </button>
                {analysisResult && (
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenRecommendModal(activeAnalysisCandidate, analysisResult.score);
                      setActiveAnalysisCandidate(null);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-[0.98] transition-colors cursor-pointer"
                  >
                    Send Recommendation Email
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Recommendation / Mock Email Composer Modal */}
      {activeRecommendCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setActiveRecommendCandidate(null)}
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
                onClick={() => setActiveRecommendCandidate(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields Scroll */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Profile Summary in header of form */}
              <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500 font-medium">Recommending candidate:</span>
                  <p className="font-bold text-zinc-200 mt-0.5">
                    {activeRecommendCandidate.firstName} {activeRecommendCandidate.lastName} (Age {activeRecommendCandidate.age}, {activeRecommendCandidate.city})
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400 rounded">
                  {calculateCompatibility(client, activeRecommendCandidate).score}% Fit
                </span>
              </div>

              {/* Recipient Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Recipient Client</label>
                <input
                  type="text"
                  disabled
                  value={`${client.firstName} ${client.lastName} (${client.email})`}
                  className="w-full px-3 py-2 bg-zinc-900/30 border border-zinc-800 rounded-xl text-zinc-400 text-xs cursor-not-allowed"
                />
              </div>

              {/* Subject Input */}
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

              {/* Body Content Editor */}
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
                Clicking Send triggers a mock mailing delivery logged in our history list.
              </span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRecommendCandidate(null)}
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
