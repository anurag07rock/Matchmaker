'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Heart, Sliders, LogOut, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Matches Board', href: '/dashboard/matches', icon: Heart },
    { name: 'Settings', href: '/dashboard/settings', icon: Sliders },
  ];

  const handleLogout = () => {
    document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-zinc-800/80 bg-zinc-950/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:bg-zinc-950",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Header/Brand */}
          <div className="h-16 flex items-center px-6 border-b border-zinc-900">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 group"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center group-hover:border-rose-500/60 transition-all duration-300">
                <HeartHandshake className="w-4.5 h-4.5 text-rose-500 fill-rose-500/10 group-hover:scale-105 transition-transform" />
              </div>
              <span className="font-bold tracking-tight text-zinc-100 group-hover:text-rose-400 transition-colors">
                The Date Crew
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-rose-500/10 text-rose-400 border-l-2 border-rose-500 pl-2.5"
                      : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                  )}
                >
                  <Icon className={cn(
                    "w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-rose-400" : "text-zinc-500 group-hover:text-zinc-400"
                  )} />
                  {item.name}
                  
                  {isActive && (
                    <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer/Logout */}
        <div className="p-4 border-t border-zinc-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:bg-red-950/20 hover:text-red-400 border border-transparent hover:border-red-900/40 transition-all duration-200 group"
          >
            <LogOut className="w-4.5 h-4.5 text-zinc-500 group-hover:text-red-400 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
