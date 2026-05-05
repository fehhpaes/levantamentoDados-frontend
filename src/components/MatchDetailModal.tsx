"use client";

import React, { useEffect, useState } from 'react';
import { IMatchDetail, getMatchById } from '@/services/api';
import { X, Trophy, History, Activity, Calendar } from 'lucide-react';

interface MatchDetailModalProps {
  fixture_id: number;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ fixture_id, onClose }) => {
  const [detail, setDetail] = useState<IMatchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      const data = await getMatchById(fixture_id);
      setDetail(data);
      setLoading(false);
    };
    fetchDetail();
  }, [fixture_id]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center">
          <Activity className="text-green-500 animate-pulse mb-4" size={40} />
          <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Carregando Dados...</p>
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const getResultColor = (result: 'W' | 'D' | 'L') => {
    if (result === 'W') return 'bg-green-500 text-black';
    if (result === 'D') return 'bg-zinc-700 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] relative my-auto">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">
              {detail.league.name}
            </span>
          </div>

          {/* Teams Header */}
          <div className="flex items-center justify-between gap-4 mb-10">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center text-2xl font-black text-zinc-500 mx-auto mb-3">
                {detail.homeTeam.name.charAt(0)}
              </div>
              <p className="text-sm font-black uppercase text-white leading-tight">{detail.homeTeam.name}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white italic tabular-nums">
                {detail.status === 'FINISHED' ? `${detail.score.home} - ${detail.score.away}` : 'VS'}
              </p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center text-2xl font-black text-zinc-500 mx-auto mb-3">
                {detail.awayTeam.name.charAt(0)}
              </div>
              <p className="text-sm font-black uppercase text-white leading-tight">{detail.awayTeam.name}</p>
            </div>
          </div>

          {/* Form Trend */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4 text-zinc-500">
              <Activity size={14} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Tendência de Forma (Últimos 5)</h4>
            </div>
            <div className="flex justify-between items-center bg-zinc-900/30 p-4 rounded-2xl border border-white/5">
              <div className="flex gap-1.5">
                {detail.form.home.map((f, i) => (
                  <span key={i} className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${getResultColor(f.result)}`}>
                    {f.result}
                  </span>
                ))}
              </div>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex gap-1.5">
                {detail.form.away.map((f, i) => (
                  <span key={i} className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${getResultColor(f.result)}`}>
                    {f.result}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* H2H History */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-zinc-500">
              <History size={14} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Confrontos Diretos (H2H)</h4>
            </div>
            <div className="space-y-3">
              {detail.h2h.length === 0 ? (
                <p className="text-center py-6 text-zinc-600 text-[10px] font-black uppercase italic">Nenhum confronto recente registrado</p>
              ) : (
                detail.h2h.map((m) => (
                  <div key={m.fixture_id} className="bg-zinc-900/50 p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex-1 text-right truncate">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">{m.homeTeam.name}</span>
                    </div>
                    <div className="bg-black px-2 py-1 rounded-md border border-white/5 min-w-[45px] text-center">
                      <span className="text-[10px] font-black text-white tabular-nums">{m.score.home}-{m.score.away}</span>
                    </div>
                    <div className="flex-1 text-left truncate">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">{m.awayTeam.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {detail.prediction?.analysis && (
            <section className="mt-8 p-5 bg-green-500/[0.03] border border-green-500/10 rounded-[2rem]">
               <div className="flex items-center gap-2 mb-3 text-green-500">
                <Trophy size={14} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Análise Técnica</h4>
              </div>
              <p className="text-xs text-zinc-400 italic leading-relaxed">
                "{detail.prediction.analysis}"
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
