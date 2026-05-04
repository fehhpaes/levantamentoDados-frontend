'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { triggerBackendSync, getSyncStatus, ISyncStatus } from '@/services/api';

export const Header = () => {
  const [syncInfo, setSyncInfo] = useState<ISyncStatus>({
    isSyncing: false,
    progress: 0,
    currentTask: '',
    lastSync: null
  });
  const router = useRouter();

  // Polling to check sync status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const status = await getSyncStatus();
        setSyncInfo(status);
        
        if (!status.isSyncing && syncInfo.isSyncing) {
          router.refresh();
        }

        if (!status.isSyncing) {
          clearInterval(interval);
        }
      } catch {
        // Silent error
      }
    };

    if (syncInfo.isSyncing) {
      interval = setInterval(checkStatus, 2000);
    }

    return () => clearInterval(interval);
  }, [syncInfo.isSyncing, router]);

  const handleSync = async () => {
    if (syncInfo.isSyncing) return;
    
    try {
      setSyncInfo(prev => ({ ...prev, isSyncing: true, progress: 0, currentTask: 'Iniciando...' }));
      await triggerBackendSync();
    } catch {
      alert('Erro ao iniciar sincronização.');
      setSyncInfo(prev => ({ ...prev, isSyncing: false }));
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-black/60 backdrop-blur-xl border-b border-white/5 p-5">
      <div className="flex flex-col max-w-md mx-auto gap-4">
        <div className="flex justify-between items-center">
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
            disabled={syncInfo.isSyncing}
            className={`p-2 rounded-full border border-white/5 active:scale-90 transition-all ${
              syncInfo.isSyncing ? 'bg-zinc-800 cursor-not-allowed' : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
            title="Sincronizar dados agora"
          >
            <RefreshCw 
              size={18} 
              className={`transition-all duration-1000 ${
                syncInfo.isSyncing ? 'animate-spin text-green-500' : 'text-zinc-400'
              }`} 
            />
          </button>
        </div>

        {/* Progress Bar UI */}
        {syncInfo.isSyncing && (
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                {syncInfo.currentTask}
              </span>
              <span className="text-[10px] font-black text-green-500">{syncInfo.progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                style={{ width: `${syncInfo.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success Message UI */}
        {!syncInfo.isSyncing && syncInfo.progress === 100 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-3 flex items-center gap-3 animate-out fade-out fill-mode-forwards delay-[3000ms] duration-1000">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">
              Dados atualizados com sucesso!
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
