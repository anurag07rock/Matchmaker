'use client';

import React from 'react';
import Image from 'next/image';
import { Customer, CustomerStatus } from '@/types/customer';
import { MapPin, Briefcase, Calendar, ChevronDown, Check } from 'lucide-react';

interface ProfileHeaderProps {
  customer: Customer;
  currentStatus: CustomerStatus;
  onStatusChange: (status: CustomerStatus) => void;
}

export default function ProfileHeader({ customer, currentStatus, onStatusChange }: ProfileHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const statuses: { value: CustomerStatus; label: string; color: string; dot: string }[] = [
    { value: 'active', label: 'Active Matching', color: 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/30', dot: 'bg-emerald-400' },
    { value: 'paused', label: 'On Hold / Paused', color: 'bg-amber-950/40 border-amber-500/20 text-amber-400 hover:bg-amber-900/30', dot: 'bg-amber-400' },
    { value: 'matched', label: 'Successfully Matched', color: 'bg-rose-950/40 border-rose-500/20 text-rose-400 hover:bg-rose-900/30', dot: 'bg-rose-400' },
    { value: 'inactive', label: 'Inactive / Closed', color: 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800', dot: 'bg-zinc-500' }
  ];

  const activeStatus = statuses.find(s => s.value === currentStatus) || statuses[0];

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 border-zinc-800/60 relative overflow-hidden shadow-lg">
      <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-rose-500/[0.03] to-transparent pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        {/* Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden relative shadow-lg shrink-0">
          <Image
            src={customer.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={`${customer.firstName} ${customer.lastName}`}
            width={112}
            height={112}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Vital Metrics */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-sm font-semibold text-zinc-400 mt-1 capitalize">
                {customer.gender} • {customer.age} years old • {customer.maritalStatus}
              </p>
            </div>

            {/* Interactive CRM Status Tracker Dropdown */}
            <div className="relative self-center sm:self-auto">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-rose-500/50 cursor-pointer ${activeStatus.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeStatus.dot}`} />
                {activeStatus.label}
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl z-20 p-1.5 animate-fadeIn">
                    <div className="px-2.5 py-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 mb-1">
                      Update Profile Status
                    </div>
                    {statuses.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => {
                          onStatusChange(s.value);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                          currentStatus === s.value
                            ? 'bg-zinc-800 text-zinc-200'
                            : 'text-zinc-400 hover:bg-zinc-950 hover:text-zinc-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                        {currentStatus === s.value && <Check className="w-3.5 h-3.5 text-rose-500" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Details Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-zinc-500" />
              {customer.city}, {customer.country}
            </span>
            <span className="hidden sm:inline text-zinc-800">•</span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-zinc-500" />
              {customer.designation} at {customer.company}
            </span>
            <span className="hidden sm:inline text-zinc-800">•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-500" />
              Registered: {new Date(customer.createdAt).toLocaleDateString('en-US')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
