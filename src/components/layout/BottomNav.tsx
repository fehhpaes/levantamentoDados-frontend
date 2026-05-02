'use client';

import React from 'react';
import { LayoutDashboard, History, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Início', icon: LayoutDashboard, href: '/' },
    { label: 'Histórico', icon: History, href: '/history' },
    { label: 'Conta', icon: User, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 flex justify-around items-center shadow-2xl z-30">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-3 px-5 rounded-[1.5rem] transition-all duration-300 ${
              isActive 
              ? 'bg-white/10 text-green-400 shadow-lg' 
              : 'text-zinc-500 hover:text-zinc-300 active:scale-95'
            }`}
          >
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
