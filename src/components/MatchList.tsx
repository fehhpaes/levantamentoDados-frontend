"use client";

import React, { useEffect, useState } from 'react';
import { IMatch } from '@/services/api';
import { MatchCard } from '@/components/MatchCard';
import { RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';

interface MatchListProps {
  initialMatches: IMatch[];
  leagueId?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://levantamentodados-backend.onrender.com';

export const MatchList: React.FC<MatchListProps> = ({ initialMatches, leagueId }) => {
  const [matches, setMatches] = useState<IMatch[]>(initialMatches);

  useEffect(() => {
    // Initialize matches when props change (e.g. user changes date/league)
    setMatches(initialMatches);
  }, [initialMatches]);

  useEffect(() => {
    const socket = io(BASE_URL);

    socket.on('connect', () => {
      console.log('[Socket] Connected to live updates');
    });

    socket.on('matchUpdated', (updatedMatch: IMatch) => {
      console.log('[Socket] Match updated:', updatedMatch);
      setMatches((prevMatches) => {
        const matchIndex = prevMatches.findIndex(m => m.fixture_id === updatedMatch.fixture_id);
        
        if (matchIndex > -1) {
          // Update existing match
          const newMatches = [...prevMatches];
          newMatches[matchIndex] = updatedMatch;
          return newMatches;
        } else {
          // If you want to add new matches dynamically, you can do it here.
          // For now, let's keep the existing list and only update if it's there.
          return prevMatches;
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-10 bg-zinc-900/20 rounded-[3rem] border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/[0.02] to-transparent" />
        <div className="bg-zinc-900 p-5 rounded-3xl mb-6 shadow-2xl relative z-10 border border-white/5">
          <RefreshCw size={36} className="text-zinc-700 animate-pulse" />
        </div>
        <p className="text-zinc-300 font-black text-xl tracking-tight relative z-10">NENHUMA PARTIDA</p>
        <p className="text-zinc-600 text-xs mt-3 leading-relaxed font-bold uppercase tracking-widest relative z-10">
          {leagueId ? "Nenhum jogo nesta liga hoje" : "Aguardando processamento de dados globais"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {matches.map((match) => (
        <MatchCard key={match.fixture_id} match={match} />
      ))}
    </div>
  );
};
