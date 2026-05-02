'use client';

import React from 'react';
import { ILeague } from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation';

import Image from 'next/image';

interface LeagueFilterProps {
  leagues: ILeague[];
}

export const LeagueFilter: React.FC<LeagueFilterProps> = ({ leagues }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeLeague = searchParams.get('league_id');

  const handleLeagueClick = (id: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('league_id', id.toString());
    } else {
      params.delete('league_id');
    }
    router.push(`?${params.toString()}`, { scroll: false });
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
          className={`whitespace-nowrap px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
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
        </button>
      ))}
    </div>
  );
};
