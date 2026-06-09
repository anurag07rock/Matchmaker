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
  theme: 'light' | 'dark';
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
    theme: 'light',
    email: 'maggie@thedatecrew.com',
    phone: '+1 555-0199'
  });
  const [initialized, setInitialized] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // Load state from backend on mount
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch settings from local storage
        if (typeof window !== 'undefined') {
          const storedSettings = localStorage.getItem('matchmaker_settings');
          if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
          }
        }

        // 2. Fetch customers from API
        const custRes = await fetch(`${API_URL}/customers`);
        if (custRes.ok) {
          const custData = await custRes.json();
          setCustomers(custData);
        }

        // 3. Fetch matches from API
        const matchesRes = await fetch(`${API_URL}/matches`);
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setMatches(matchesData);
        }

        // 4. Fetch activities from API
        const actRes = await fetch(`${API_URL}/activities`);
        if (actRes.ok) {
          const actData = await actRes.json();
          setActivities(actData);
        }
      } catch (err) {
        console.error('Failed to load data from backend server:', err);
      } finally {
        setInitialized(true);
      }
    }

    loadData();
  }, [API_URL]);

  // Refresh helper functions
  const refreshData = async () => {
    try {
      const [custRes, matchesRes, actRes] = await Promise.all([
        fetch(`${API_URL}/customers`),
        fetch(`${API_URL}/matches`),
        fetch(`${API_URL}/activities`)
      ]);

      if (custRes.ok) setCustomers(await custRes.json());
      if (matchesRes.ok) setMatches(await matchesRes.json());
      if (actRes.ok) setActivities(await actRes.json());
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  // 1. Add Customer (Onboarding)
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = `cust_${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      internalNotes: []
    };

    // Optimistic update
    setCustomers(prev => [newCustomer, ...prev]);

    // Async save
    fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    })
      .then(res => {
        if (!res.ok) throw new Error('Onboarding failed');
        return res.json();
      })
      .then(saved => {
        setCustomers(prev => prev.map(c => c.id === tempId ? saved : c));
        refreshData();
      })
      .catch(err => {
        console.error('Add customer error:', err);
        refreshData();
      });

    return newCustomer;
  };

  // 2. Update Customer status
  const updateCustomerStatus = (customerId: string, status: CustomerStatus) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, status, updatedAt: new Date().toISOString() } : c));

    fetch(`${API_URL}/customers/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(res => {
        if (!res.ok) throw new Error('Status update failed');
        refreshData();
      })
      .catch(err => {
        console.error('Update status error:', err);
        refreshData();
      });
  };

  // 3. Update Customer Profile fields
  const updateCustomerProfile = (customerId: string, updatedData: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updatedData, updatedAt: new Date().toISOString() } : c));

    fetch(`${API_URL}/customers/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Profile update failed');
        refreshData();
      })
      .catch(err => {
        console.error('Update profile error:', err);
        refreshData();
      });
  };

  // 4. Notes management (Add, edit, delete)
  const addNote = (customerId: string, noteText: string) => {
    fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        text: noteText,
        author: `${settings.name} (${settings.title})`
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create note');
        refreshData();
      })
      .catch(err => {
        console.error('Add note error:', err);
      });
  };

  const editNote = (customerId: string, noteId: string, newText: string) => {
    fetch(`${API_URL}/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update note');
        refreshData();
      })
      .catch(err => {
        console.error('Edit note error:', err);
      });
  };

  const deleteNote = (customerId: string, noteId: string) => {
    fetch(`${API_URL}/notes/${noteId}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete note');
        refreshData();
      })
      .catch(err => {
        console.error('Delete note error:', err);
      });
  };

  // 5. Match Proposing
  const proposeMatch = (customerId: string, proposedMatchId: string, notes: string) => {
    const client = customers.find(c => c.id === customerId);
    const candidate = customers.find(c => c.id === proposedMatchId);
    if (!client || !candidate) return null;

    const comp = calculateCompatibility(client, candidate);
    const tempMatchId = `match_${Date.now()}`;
    const newMatch: Match = {
      id: tempMatchId,
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

    setMatches(prev => [newMatch, ...prev]);

    fetch(`${API_URL}/matches/propose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        proposedMatchId,
        matchmakerNotes: notes,
        aiReport: newMatch.aiReport
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Match proposal failed');
        return res.json();
      })
      .then(saved => {
        setMatches(prev => prev.map(m => m.id === tempMatchId ? saved : m));
        refreshData();
      })
      .catch(err => {
        console.error('Propose match error:', err);
        refreshData();
      });

    return newMatch;
  };

  // 6. Update Match status
  const updateMatchStatus = (matchId: string, status: MatchStatus) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status, updatedAt: new Date().toISOString() } : m));

    fetch(`${API_URL}/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(res => {
        if (!res.ok) throw new Error('Match status update failed');
        refreshData();
      })
      .catch(err => {
        console.error('Update match status error:', err);
        refreshData();
      });
  };

  // 7. Delete Match
  const deleteMatch = (matchId: string) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));

    fetch(`${API_URL}/matches/${matchId}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error('Match deletion failed');
        refreshData();
      })
      .catch(err => {
        console.error('Delete match error:', err);
        refreshData();
      });
  };

  // 8. Send Match recommendation
  const sendMatchRecommendation = (matchId: string, subject: string, body: string) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'approved' as MatchStatus, updatedAt: new Date().toISOString() } : m));

    fetch(`${API_URL}/matches/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId,
        timestamp: new Date().toISOString()
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to record match recommendation event');
        refreshData();
      })
      .catch(err => {
        console.error('Send match recommendation error:', err);
        refreshData();
      });
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
