'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InfoItem {
  label: string;
  value: React.ReactNode;
  isFullWidth?: boolean;
}

interface InfoSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  items: InfoItem[];
  className?: string;
}

export default function InfoSection({ title, icon: Icon, iconColor = 'text-rose-500', items, className }: InfoSectionProps) {
  return (
    <div className={cn("glass-panel rounded-2xl p-6 border-zinc-800/60 shadow-sm relative", className)}>
      <div className="flex items-center gap-2 font-bold text-sm text-zinc-200 border-b border-zinc-900 pb-3 mb-4">
        <Icon className={cn("w-4.5 h-4.5", iconColor)} />
        {title}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4.5 gap-x-6">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className={cn(
              "space-y-1",
              item.isFullWidth ? "col-span-1 sm:col-span-2 md:col-span-3" : ""
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              {item.label}
            </span>
            <div className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
              {item.value || <span className="text-zinc-500 italic">Not specified</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
