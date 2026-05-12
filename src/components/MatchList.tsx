"use client";

import React, { useEffect, useState } from 'react';
import { IMatch, getTodayMatches, getTopPredictions } from '@/services/api';
import { MatchCard } from '@/components/MatchCard';
import { RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';
import { useSearchParams } from 'next/navigation';

interface MatchListProps {
  initialMatches: IMatch[];
  leagueId?: number;
}

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'https://fehhpaes-previsao-fc-worker.hf.space';

export const MatchList: React.FC<MatchListProps> = ({ initialMatches, leagueId }) => {
  const [matches, setMatches] = useState<IMatch[]>(initialMatches);
  const [filterMode, setFilterMode] = useState<'all' | 'high-confidence' | 'value-bet'>('all');
  const searchParams = useSearchParams();

  // Polling to keep data fresh as a fallback to WebSocket
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const dateType = searchParams.get('date_type') || 'today';
        const filter = searchParams.get('filter');
        
        let updatedData: IMatch[];
        if (filter === 'top') {
          updatedData = await getTopPredictions();
        } else {
          updatedData = await getTodayMatches(leagueId, dateType);
        }

        if (updatedData && updatedData.length > 0) {
          setMatches(updatedData);
        }
      } catch (error) {
        console.error('[Polling] Failed to refresh matches:', error);
      }
    }, 300000); // 5 minutes

    return () => clearInterval(pollInterval);
  }, [leagueId, searchParams]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(initialMatches);
  }, [initialMatches]);

  const filteredMatches = matches.filter(match => {
    if (filterMode === 'all') return true;
    if (filterMode === 'high-confidence') {
      const probs = match.prediction?.probabilities;
      if (!probs) return false;
      return Math.max(probs.homeWin, probs.draw, probs.awayWin) >= 0.7;
    }
    if (filterMode === 'value-bet') {
      return match.prediction?.valueBet?.isFound === true;
    }
    return true;
  });

  useEffect(() => {
    const socket = io(WORKER_URL);

    socket.on('connect', () => {
      console.log('[Socket] Connected to live updates');
    });

    socket.on('matchUpdated', (updatedMatch: IMatch) => {
      console.log('[Socket] Match updated:', updatedMatch);
      setMatches((prevMatches) => {
        const matchIndex = prevMatches.findIndex(m => m.fixture_id === updatedMatch.fixture_id);
        
        if (matchIndex > -1) {
          const newMatches = [...prevMatches];
          newMatches[matchIndex] = updatedMatch;
          return newMatches;
        } else {
          return prevMatches;
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: 'Todos os Jogos' },
          { id: 'high-confidence', label: 'Alta Confiança (+70%)' },
          { id: 'value-bet', label: 'Apostas de Valor' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterMode(f.id as 'all' | 'high-confidence' | 'value-bet')}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
              filterMode === f.id
              ? 'bg-zinc-100 text-black border-white'
              : 'bg-zinc-900/50 text-zinc-500 border-white/5 hover:border-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredMatches.length === 0 ? (
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
      ) : (
        <div className="grid gap-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match.fixture_id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};
