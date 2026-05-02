'use client';

import React, { useState } from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { triggerBackendSync } from '@/services/api';

export const Header = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      // 1. Trigger the background process in backend
      const response = await triggerBackendSync();
      console.log(response.message);
      
      // 2. Wait a few seconds for the initial sync of basic match data
      // (The heavy AI training continues in background)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 3. Refresh the UI to show new matches
      router.refresh();
      
      alert('Sincronização iniciada! Os novos jogos aparecerão em instantes.');
    } catch {
      alert('Erro ao sincronizar. Tente novamente mais tarde.');
    } finally {
      setIsSyncing(false);
    }
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
          onClick={handleSync}
          disabled={isSyncing}
          className={`p-2 rounded-full border border-white/5 active:scale-90 transition-all ${
            isSyncing ? 'bg-zinc-800 cursor-not-allowed' : 'bg-zinc-900 hover:bg-zinc-800'
          }`}
          title="Sincronizar dados agora"
        >
          <RefreshCw 
            size={18} 
            className={`transition-all duration-1000 ${
              isSyncing ? 'animate-spin text-green-500' : 'text-zinc-400'
            }`} 
          />
        </button>
      </div>
    </header>
  );
};
