'use client';

import React, { useState } from 'react';
import { ILeague, triggerBackendSync, getSyncStatus } from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

import Image from 'next/image';

interface LeagueFilterProps {
  leagues: ILeague[];
}

export const LeagueFilter: React.FC<LeagueFilterProps> = ({ leagues }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeLeague = searchParams.get('league_id');
  const [localSyncing, setLocalSyncing] = useState<number | null>(null);

  // Map league IDs to Football-Data codes (IDs fixed for Football-Data.org)
  const getLeagueCode = (id: number) => {
    const mapping: { [key: number]: string } = {
      2013: 'BSA', // Brasileirão
      2021: 'PL',  // Premier League
      2014: 'PD',  // La Liga
      2002: 'BL1', // Bundesliga
      2019: 'SA',  // Serie A
      2015: 'FL1', // Ligue 1
      2017: 'PPL', // Primeira Liga (Portugal)
      2003: 'DED'  // Eredivisie
    };
    return mapping[id];
  };

  const handleLeagueClick = (id: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('league_id', id.toString());
    } else {
      params.delete('league_id');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSyncLeague = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const code = getLeagueCode(id);
    if (!code) {
      alert('Sincronização direta não disponível para esta liga.');
      return;
    }

    try {
      setLocalSyncing(id);
      await triggerBackendSync(code);
      // The Header component will pick up the global sync state via polling
    } catch {
      alert('Erro ao sincronizar liga.');
    } finally {
      setTimeout(() => setLocalSyncing(null), 2000);
    }
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5 mb-6">
      <button
        onClick={() => handleLeagueClick(null)}
        className={`whitespace-nowrap px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
          !activeLeague 
          ? 'bg-green-500 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
          : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/10'
        }`}
      >
        Todas
      </button>

      {leagues.map((league, index) => (
        <button
          key={league?.id ?? `league-${index}`}
          onClick={() => (league?.id ? handleLeagueClick(league.id) : undefined)}
          className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2 group relative ${
            activeLeague && league?.id && activeLeague === league.id.toString()
            ? 'bg-green-500 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
            : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/10'
          }`}
        >
          {league?.logo && (
            <div className="relative w-4 h-4 grayscale brightness-200">
              <Image 
                src={league.logo} 
                alt={league?.name || 'League'} 
                fill
                className="object-contain rounded-sm"
              />
            </div>
          )}
          {league?.name || 'Desconhecida'}

          {/* Individual Sync Button (Quick Test) */}
          {league?.id && getLeagueCode(league.id) && (
            <div 
              onClick={(e) => handleSyncLeague(e, league.id)}
              className={`ml-1 p-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors ${localSyncing === league.id ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={10} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
