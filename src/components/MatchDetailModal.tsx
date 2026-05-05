"use client";

import React, { useEffect, useState } from 'react';
import { IMatchDetail, getMatchById, placeVirtualBet } from '@/services/api';
import { X, Activity, Wallet, Plus, Minus, ArrowRight, ShieldCheck, Target } from 'lucide-react';
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
  const [selectedMarket, setSelectedMarket] = useState<{market: string, selection: string, odds: number} | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      const data = await getMatchById(fixture_id);
      setDetail(data);
      setLoading(false);
    };
    fetchDetail();
  }, [fixture_id]);

  const handlePlaceBet = async () => {
    if (!deviceId || !selectedMarket) return;
    setBetLoading(true);

    const result = await placeVirtualBet({
      userId: deviceId,
      fixtureId: fixture_id,
      market: selectedMarket.market,
      selection: selectedMarket.selection,
      odds: selectedMarket.odds,
      stake
    });

    setBetLoading(false);

    if (result) {
      toast.success('Aposta virtual registrada com sucesso!');
      setSelectedMarket(null);
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

          {/* AI Insights - Exact Scores */}
          {detail.prediction?.exactScores && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4 text-zinc-500">
                <Target size={14} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Placares Prováveis (Poisson)</h4>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {detail.prediction.exactScores.map((score, idx) => (
                  <div key={idx} className="bg-zinc-900/50 border border-white/5 rounded-xl p-2 text-center">
                    <p className="text-[11px] font-black text-white">{score.score}</p>
                    <p className="text-[8px] font-bold text-green-500">{(score.probability * 100).toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Prediction Markets */}
          {detail.prediction?.probabilities && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4 text-zinc-500">
                <Activity size={14} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Probabilidades IA</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-zinc-900/30 p-5 rounded-[2rem] border border-white/5">
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
            </section>
          )}

          {/* Double Chance Markets */}
          {detail.prediction?.probabilities && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4 text-zinc-500">
                <ShieldCheck size={14} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Chance Dupla</h4>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '1X', val: detail.prediction.probabilities.doubleChance1X },
                  { label: '12', val: detail.prediction.probabilities.doubleChance12 },
                  { label: 'X2', val: detail.prediction.probabilities.doubleChanceX2 }
                ].map((dc, idx) => (
                  <div key={idx} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 text-center">
                    <p className="text-[9px] font-black text-zinc-500 mb-1">{dc.label}</p>
                    <p className="text-sm font-black text-white">{(dc.val! * 100).toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Manual Betting Section */}
          {detail.status === 'SCHEDULED' && detail.prediction?.odds && (
            <section className="mt-10 border-t border-white/5 pt-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Wallet size={16} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Aposta Manual</h4>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900 px-4 py-2 rounded-2xl border border-white/5">
                  <button onClick={() => setStake(Math.max(10, stake - 10))} className="text-zinc-500 hover:text-green-500 transition-colors"><Minus size={14}/></button>
                  <span className="text-xs font-black w-12 text-center">R$ {stake}</span>
                  <button onClick={() => setStake(stake + 10)} className="text-zinc-500 hover:text-green-500 transition-colors"><Plus size={14}/></button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <button 
                  onClick={() => setSelectedMarket({ market: '1X2', selection: 'HOME', odds: detail.prediction!.odds!.homeWin })}
                  className={`p-4 rounded-2xl border text-center transition-all ${selectedMarket?.selection === 'HOME' ? 'bg-green-500 border-green-500 text-black' : 'bg-zinc-900 border-white/5 text-white hover:border-white/20'}`}
                >
                  <p className="text-[8px] font-black uppercase mb-1">Casa</p>
                  <p className="text-sm font-black">{detail.prediction.odds.homeWin.toFixed(2)}</p>
                </button>
                <button 
                  onClick={() => setSelectedMarket({ market: '1X2', selection: 'DRAW', odds: detail.prediction!.odds!.draw })}
                  className={`p-4 rounded-2xl border text-center transition-all ${selectedMarket?.selection === 'DRAW' ? 'bg-green-500 border-green-500 text-black' : 'bg-zinc-900 border-white/5 text-white hover:border-white/20'}`}
                >
                  <p className="text-[8px] font-black uppercase mb-1">Empate</p>
                  <p className="text-sm font-black">{detail.prediction.odds.draw.toFixed(2)}</p>
                </button>
                <button 
                  onClick={() => setSelectedMarket({ market: '1X2', selection: 'AWAY', odds: detail.prediction!.odds!.awayWin })}
                  className={`p-4 rounded-2xl border text-center transition-all ${selectedMarket?.selection === 'AWAY' ? 'bg-green-500 border-green-500 text-black' : 'bg-zinc-900 border-white/5 text-white hover:border-white/20'}`}
                >
                  <p className="text-[8px] font-black uppercase mb-1">Fora</p>
                  <p className="text-sm font-black">{detail.prediction.odds.awayWin.toFixed(2)}</p>
                </button>
              </div>

              <button 
                disabled={betLoading || !selectedMarket}
                onClick={handlePlaceBet}
                className="w-full bg-green-500 text-black py-4 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-400 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {betLoading ? 'Processando...' : (
                  <>
                    {selectedMarket ? `Apostar ${selectedMarket.selection} @ ${selectedMarket.odds.toFixed(2)}` : 'Selecione um Mercado'} <ArrowRight size={14} />
                  </>
                )}
              </button>
            </section>
          )}

          {/* Form Trend */}
          <section className="mt-10 pt-10 border-t border-white/5">
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
        </div>
      </div>
    </div>
  );
};
