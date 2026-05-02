'use client';

import React, { useState } from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const Header = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <header className="sticky top-0 z-20 bg-black/60 backdrop-blur-xl border-b border-white/5 p-5">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-400 to-green-600 p-2.5 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <LayoutDashboard size={22} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none italic uppercase">PREVISÃO FC</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1.5">
              AI Intelligence System
            </p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 bg-zinc-900 rounded-full border border-white/5 active:scale-90 transition-all hover:bg-zinc-800"
          title="Atualizar dados"
        >
          <RefreshCw 
            size={18} 
            className={`text-zinc-400 transition-all duration-700 ${isRefreshing ? 'rotate-180 text-green-500' : ''}`} 
          />
        </button>
      </div>
    </header>
  );
};
