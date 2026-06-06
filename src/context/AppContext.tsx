'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, CustomerStatus } from '@/types/customer';
import { Match, MatchStatus } from '@/types/match';
import { mockCustomers as initialCustomers } from '@/data/customers';
import { mockMatches as initialMatches } from '@/data/matches';
import { calculateCompatibility } from '@/services/matching/matcher';

export interface RichNote {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface ActivityItem {
  id: string;
  type: 'customer_added' | 'match_suggested' | 'match_sent' | 'note_added' | 'profile_updated';
  timestamp: string;
  customerId: string;
  customerName: string;
  details: string;
}

export interface SystemSettings {
  promptTone: string;
  maxDistance: number;
  ageRangeLeniency: number;
  apiKey: string;
  name: string;
  title: string;
  notifications: {
    email: boolean;
    push: boolean;
    alerts: boolean;
  };
  theme: 'dark' | 'midnight' | 'rose' | 'emerald';
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

interface AppContextType {
  customers: Customer[];
  matches: Match[];
  activities: ActivityItem[];
  settings: SystemSettings;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Customer;
  updateCustomerStatus: (customerId: string, status: CustomerStatus) => void;
  updateCustomerProfile: (customerId: string, updatedData: Partial<Customer>) => void;
  addNote: (customerId: string, noteText: string) => void;
  editNote: (customerId: string, noteId: string, newText: string) => void;
  deleteNote: (customerId: string, noteId: string) => void;
  proposeMatch: (customerId: string, proposedMatchId: string, notes: string) => Match | null;
  updateMatchStatus: (matchId: string, status: MatchStatus) => void;
  deleteMatch: (matchId: string) => void;
  sendMatchRecommendation: (matchId: string, subject: string, body: string) => void;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  getNotesForCustomer: (customer: Customer) => RichNote[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to convert simple strings or JSON strings to RichNote objects safely
export function parseNotes(notesArray: string[] | undefined, fallbackDate: string = new Date().toISOString()): RichNote[] {
  if (!notesArray || notesArray.length === 0) return [];
  return notesArray.map((noteStr, idx) => {
    try {
      if (noteStr.trim().startsWith('{')) {
        const parsed = JSON.parse(noteStr);
        if (parsed.id && parsed.text) {
          return parsed as RichNote;
        }
      }
    } catch (e) {
      // Not JSON, fall back to parsing it as plain text note
    }
    return {
      id: `note_fallback_${idx}`,
      text: noteStr,
      createdAt: fallbackDate,
      author: 'Maggie Crew (Senior Matchmaker)'
    };
  });
}

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    promptTone: 'detailed and analytical',
    maxDistance: 50,
    ageRangeLeniency: 2,
    apiKey: '••••••••••••••••••••••••••••••••',
    name: 'Maggie Crew',
    title: 'Senior Matchmaker',
    notifications: { email: true, push: false, alerts: true },
    theme: 'rose',
    email: 'maggie@thedatecrew.com',
    phone: '+1 555-0199'
  });
  const [initialized, setInitialized] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCustomers = localStorage.getItem('matchmaker_customers');
      const storedMatches = localStorage.getItem('matchmaker_matches');
      const storedActivities = localStorage.getItem('matchmaker_activities');
      const storedSettings = localStorage.getItem('matchmaker_settings');

      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers));
      } else {
        // Seed default notes into JSON format for initial customers to avoid parsing legacy logs
        const seededInitial = initialCustomers.map(c => {
          if (c.internalNotes && c.internalNotes.length > 0) {
            const parsed = c.internalNotes.map((n, i) => JSON.stringify({
              id: `note_seed_${c.id}_${i}`,
              text: n,
              createdAt: c.updatedAt || c.createdAt,
              author: 'Maggie Crew (Senior Matchmaker)'
            }));
            return { ...c, internalNotes: parsed };
          }
          return c;
        });
        setCustomers(seededInitial);
        localStorage.setItem('matchmaker_customers', JSON.stringify(seededInitial));
      }

      if (storedMatches) {
        setMatches(JSON.parse(storedMatches));
      } else {
        setMatches(initialMatches);
        localStorage.setItem('matchmaker_matches', JSON.stringify(initialMatches));
      }

      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      } else {
        // Seed initial mock activities for realistic dashboard on first open
        const initialActivities: ActivityItem[] = [
          {
            id: 'act_01',
            type: 'customer_added',
            timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
            customerId: 'cust_01',
            customerName: 'Alexander Wright',
            details: 'Profile onboarding completed.'
          },
          {
            id: 'act_02',
            type: 'match_suggested',
            timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
            customerId: 'cust_01',
            customerName: 'Alexander Wright',
            details: 'Algorithmic recommendation generated with Sophia Chen.'
          },
          {
            id: 'act_03',
            type: 'note_added',
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
            customerId: 'cust_02',
            customerName: 'Sophia Chen',
            details: 'Interview note added: Expresses strong desire for a creative partner.'
          }
        ];
        setActivities(initialActivities);
        localStorage.setItem('matchmaker_activities', JSON.stringify(initialActivities));
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        localStorage.setItem('matchmaker_settings', JSON.stringify(settings));
      }

      setInitialized(true);
    }
  }, []);

  // Save changes helper
  const saveCustomers = (updated: Customer[]) => {
    setCustomers(updated);
    localStorage.setItem('matchmaker_customers', JSON.stringify(updated));
  };

  const saveMatches = (updated: Match[]) => {
    setMatches(updated);
    localStorage.setItem('matchmaker_matches', JSON.stringify(updated));
  };

  const logActivity = (
    type: ActivityItem['type'],
    customerId: string,
    customerName: string,
    details: string
  ) => {
    const newActivity: ActivityItem = {
      id: `act_${Date.now()}`,
      type,
      timestamp: new Date().toISOString(),
      customerId,
      customerName,
      details
    };
    const updated = [newActivity, ...activities];
    setActivities(updated);
    localStorage.setItem('matchmaker_activities', JSON.stringify(updated));
  };

  // 1. Add Customer (Onboarding)
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `cust_${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newCustomer, ...customers];
    saveCustomers(updated);
    logActivity('customer_added', id, `${newCustomer.firstName} ${newCustomer.lastName}`, 'New client onboarding form submitted.');
    return newCustomer;
  };

  // 2. Update Customer status
  const updateCustomerStatus = (customerId: string, status: CustomerStatus) => {
    const updated = customers.map(c => {
      if (c.id === customerId) {
        return { ...c, status, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    saveCustomers(updated);
    const updatedCustomer = updated.find(c => c.id === customerId);
    if (updatedCustomer) {
      logActivity(
        'profile_updated',
        customerId,
        `${updatedCustomer.firstName} ${updatedCustomer.lastName}`,
        `CRM status updated to "${status}".`
      );
    }
  };

  // 3. Update Customer Profile fields
  const updateCustomerProfile = (customerId: string, updatedData: Partial<Customer>) => {
    const updated = customers.map(c => {
      if (c.id === customerId) {
        return { ...c, ...updatedData, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    saveCustomers(updated);
    const updatedCustomer = updated.find(c => c.id === customerId);
    if (updatedCustomer) {
      logActivity(
        'profile_updated',
        customerId,
        `${updatedCustomer.firstName} ${updatedCustomer.lastName}`,
        'Dossier details updated.'
      );
    }
  };

  // 4. Notes management (Add, edit, delete)
  const addNote = (customerId: string, noteText: string) => {
    const noteId = `note_${Date.now()}`;
    const newRichNote: RichNote = {
      id: noteId,
      text: noteText,
      createdAt: new Date().toISOString(),
      author: `${settings.name} (${settings.title})`
    };
    const updated = customers.map(c => {
      if (c.id === customerId) {
        const currentNotes = c.internalNotes || [];
        return {
          ...c,
          internalNotes: [...currentNotes, JSON.stringify(newRichNote)],
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    saveCustomers(updated);
    const client = customers.find(c => c.id === customerId);
    if (client) {
      logActivity('note_added', customerId, `${client.firstName} ${client.lastName}`, `Note logged: "${noteText.slice(0, 40)}${noteText.length > 40 ? '...' : ''}"`);
    }
  };

  const editNote = (customerId: string, noteId: string, newText: string) => {
    const updated = customers.map(c => {
      if (c.id === customerId) {
        const currentNotes = c.internalNotes || [];
        const richNotes = parseNotes(currentNotes);
        const updatedRichNotes = richNotes.map(n => {
          if (n.id === noteId) {
            return { ...n, text: newText, createdAt: new Date().toISOString() };
          }
          return n;
        });
        return {
          ...c,
          internalNotes: updatedRichNotes.map(n => JSON.stringify(n)),
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    saveCustomers(updated);
  };

  const deleteNote = (customerId: string, noteId: string) => {
    const updated = customers.map(c => {
      if (c.id === customerId) {
        const currentNotes = c.internalNotes || [];
        const richNotes = parseNotes(currentNotes);
        const filteredRichNotes = richNotes.filter(n => n.id !== noteId);
        return {
          ...c,
          internalNotes: filteredRichNotes.map(n => JSON.stringify(n)),
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    saveCustomers(updated);
  };

  // 5. Match Proposing
  const proposeMatch = (customerId: string, proposedMatchId: string, notes: string) => {
    const client = customers.find(c => c.id === customerId);
    const candidate = customers.find(c => c.id === proposedMatchId);
    if (!client || !candidate) return null;

    // Calculate compatibility
    const comp = calculateCompatibility(client, candidate);

    const newMatch: Match = {
      id: `match_${Date.now()}`,
      customerId,
      proposedMatchId,
      status: 'proposed',
      matchmakerNotes: notes,
      aiReport: {
        score: comp.score,
        pros: comp.pros,
        cons: comp.cons,
        summary: comp.reasons[0] || 'Strong profiles compatibility overlap.',
        generatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newMatch, ...matches];
    saveMatches(updated);

    logActivity(
      'match_suggested',
      customerId,
      `${client.firstName} & ${candidate.firstName}`,
      `Match pairing proposed with compatibility score of ${comp.score}%.`
    );

    return newMatch;
  };

  // 6. Update Match status
  const updateMatchStatus = (matchId: string, status: MatchStatus) => {
    const updated = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, status, updatedAt: new Date().toISOString() };
      }
      return m;
    });
    saveMatches(updated);

    const matchObj = matches.find(m => m.id === matchId);
    if (matchObj) {
      const client = customers.find(c => c.id === matchObj.customerId);
      const candidate = customers.find(c => c.id === matchObj.proposedMatchId);
      if (client && candidate) {
        let details = `Match status changed to ${status}.`;
        if (status === 'successful') {
          details = 'Match finalized! Both clients successfully matched.';
        } else if (status === 'rejected') {
          details = 'Match pairing closed.';
        }
        logActivity('profile_updated', client.id, `${client.firstName} & ${candidate.firstName}`, details);
      }
    }
  };

  // 7. Delete Match
  const deleteMatch = (matchId: string) => {
    const updated = matches.filter(m => m.id !== matchId);
    saveMatches(updated);
  };

  // 8. Send Match recommendation
  const sendMatchRecommendation = (matchId: string, subject: string, body: string) => {
    const updated = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, status: 'approved' as MatchStatus, updatedAt: new Date().toISOString() }; // Mark as sent/approved
      }
      return m;
    });
    saveMatches(updated);

    const matchObj = matches.find(m => m.id === matchId);
    if (matchObj) {
      const client = customers.find(c => c.id === matchObj.customerId);
      const candidate = customers.find(c => c.id === matchObj.proposedMatchId);
      if (client && candidate) {
        logActivity(
          'match_sent',
          client.id,
          `${client.firstName} ${client.lastName}`,
          `Recommendation email sent regarding match candidate ${candidate.firstName} ${candidate.lastName}.`
        );
      }
    }
  };

  // 9. Update settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('matchmaker_settings', JSON.stringify(updated));
  };

  // Interface helper
  const getNotesForCustomer = (customer: Customer): RichNote[] => {
    return parseNotes(customer.internalNotes, customer.updatedAt || customer.createdAt);
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        matches,
        activities,
        settings,
        addCustomer,
        updateCustomerStatus,
        updateCustomerProfile,
        addNote,
        editNote,
        deleteNote,
        proposeMatch,
        updateMatchStatus,
        deleteMatch,
        sendMatchRecommendation,
        updateSettings,
        getNotesForCustomer
      }}
    >
      {initialized ? children : (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative w-12 h-12">
              <div className="w-12 h-12 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin absolute" />
            </div>
            <p className="text-sm font-semibold text-zinc-400">Loading CRM Database Workspace...</p>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
