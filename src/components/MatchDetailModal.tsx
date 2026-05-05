"use client";

import React, { useEffect, useState } from 'react';
import { IMatchDetail, getMatchById, placeVirtualBet } from '@/services/api';
import { X, Trophy, History, Activity, Wallet, Plus, Minus, ArrowRight } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface MatchDetailModalProps {
  fixture_id: number;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ fixture_id, onClose }) => {
  const { deviceId } = useUser();
  const [detail, setDetail] = useState<IMatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [stake, setStake] = useState(50);
  const [betLoading, setBetLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      const data = await getMatchById(fixture_id);
      setDetail(data);
      setLoading(false);
    };
    fetchDetail();
  }, [fixture_id]);

  const handlePlaceBet = async (market: string, selection: string, odds: number) => {
    if (!deviceId) return;
    setBetLoading(true);

    const result = await placeVirtualBet({
      userId: deviceId,
      fixtureId: fixture_id,
      market,
      selection,
      odds,
      stake
    });

    setBetLoading(false);

    if (result) {
      toast.success('Aposta virtual registrada com sucesso!');
    } else {
      toast.error('Erro ao registrar aposta.');
    }
  };

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

          {/* Power Comparison */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4 text-zinc-500">
              <Activity size={14} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Comparativo de Poder</h4>
            </div>
            <div className="space-y-6 bg-zinc-900/30 p-5 rounded-[2rem] border border-white/5">
              {/* Attack Power */}
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-zinc-500">
                  <span>Ataque</span>
                  <span>Defesa</span>
                </div>
                <div className="flex gap-1 h-2">
                  <div className="flex-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] transition-all duration-1000"
                      style={{ width: `${Math.min((detail.stats?.home_shots_on_target || 4) * 15, 100)}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-zinc-800 rounded-full overflow-hidden flex justify-end">
                    <div 
                      className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all duration-1000"
                      style={{ width: `${Math.min((detail.stats?.away_shots_on_target || 4) * 15, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Prediction Markets */}
              {detail.prediction?.probabilities && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-zinc-500 uppercase mb-2">Over 2.5 Gols</p>
                    <div className="flex items-end justify-between">
                      <span className="text-xl font-black text-white">{(detail.prediction.probabilities.over25! * 100).toFixed(0)}%</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${detail.prediction.probabilities.over25! > 0.6 ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                        {detail.prediction.probabilities.over25! > 0.6 ? 'ALTO' : 'MÉDIO'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-zinc-500 uppercase mb-2">Ambas Marcam</p>
                    <div className="flex items-end justify-between">
                      <span className="text-xl font-black text-white">{(detail.prediction.probabilities.bttsYes! * 100).toFixed(0)}%</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${detail.prediction.probabilities.bttsYes! > 0.6 ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                        {detail.prediction.probabilities.bttsYes! > 0.6 ? 'SIM' : 'NÃO'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

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
                &quot;{detail.prediction.analysis}&quot;
              </p>
            </section>
          )}

          {/* Virtual Betting Section */}
          {detail.status === 'SCHEDULED' && detail.prediction?.probabilities && (
            <section className="mt-10 border-t border-white/5 pt-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Wallet size={16} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Aposta Virtual</h4>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900 px-4 py-2 rounded-2xl border border-white/5">
                  <button onClick={() => setStake(Math.max(10, stake - 10))} className="text-zinc-500 hover:text-green-500 transition-colors"><Minus size={14}/></button>
                  <span className="text-xs font-black w-12 text-center">R$ {stake}</span>
                  <button onClick={() => setStake(stake + 10)} className="text-zinc-500 hover:text-green-500 transition-colors"><Plus size={14}/></button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Winner Market */}
                <button 
                  disabled={betLoading}
                  onClick={() => {
                    const probs = detail.prediction!.probabilities;
                    const selection = probs.homeWin > probs.awayWin && probs.homeWin > probs.draw ? 'HOME' : 
                                     (probs.awayWin > probs.homeWin && probs.awayWin > probs.draw ? 'AWAY' : 'DRAW');
                    const odds = selection === 'HOME' ? (detail.prediction!.odds?.homeWin || 2.0) :
                                 selection === 'AWAY' ? (detail.prediction!.odds?.awayWin || 2.0) : 
                                 (detail.prediction!.odds?.draw || 3.0);
                    handlePlaceBet('1X2', selection, odds);
                  }}
                  className="w-full bg-green-500 text-black py-4 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-400 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {betLoading ? 'Processando...' : (
                    <>
                      Seguir Palpite AI (1X2) <ArrowRight size={14} />
                    </>
                  )}
                </button>

                {/* Over 2.5 Market (If high probability) */}
                {detail.prediction.probabilities.over25! > 0.6 && (
                  <button 
                    disabled={betLoading}
                    onClick={() => handlePlaceBet('OVER_UNDER_2.5', 'OVER', detail.prediction!.odds?.over25 || 1.85)}
                    className="w-full bg-zinc-900 text-white py-4 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-white/5 hover:bg-zinc-800 transition-all disabled:opacity-50"
                  >
                    Apostar Over 2.5 @ {(detail.prediction.odds?.over25 || 1.85).toFixed(2)}
                  </button>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
