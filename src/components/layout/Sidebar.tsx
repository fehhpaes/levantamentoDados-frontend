'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  History, 
  User, 
  TrendingUp, 
  Star, 
  ShieldCheck,
  Zap,
  Brain
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { label: 'Histórico', icon: History, href: '/history' },
    { label: 'Minha Conta', icon: User, href: '/profile' },
  ];

  const quickFilters = [
    { label: 'Top 5 Predictions', icon: Star, href: '/?filter=top', color: 'text-yellow-500' },
    { label: 'Value Radar', icon: TrendingUp, href: '/?filter=value', color: 'text-purple-500' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-black border-r border-white/5 h-screen sticky top-0 p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-gradient-to-br from-green-400 to-green-600 p-2 rounded-xl">
          <ShieldCheck size={20} className="text-black" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter italic uppercase">PREVISÃO FC</h1>
          <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em]">AI Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 space-y-8">
        <div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-2">Menu Principal</p>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                      ? 'bg-white/5 text-green-400 border border-white/5 shadow-lg' 
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-bold">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-2">Filtros Rápidos</p>
          <ul className="space-y-2">
            {quickFilters.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <item.icon size={18} className={`group-hover:${item.color}`} />
                  <span className="text-sm font-bold">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={14} className="text-purple-500" />
            <span className="text-[10px] font-black uppercase text-zinc-400">AI Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Model v2.4 Online</span>
          </div>
        </div>
        
        <p className="text-[8px] text-center text-zinc-700 font-bold uppercase tracking-widest">
          © 2026 PREVISÃO FC
        </p>
      </div>
    </aside>
  );
};
