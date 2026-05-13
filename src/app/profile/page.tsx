"use client";

import React, { useEffect, useState } from 'react';
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { User, TrendingUp, Wallet, Target, History, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useUser } from '@/hooks/useUser';
import { getUserBets, IVirtualBet, IBankrollStats } from '@/services/api';

export default function ProfilePage() {
  const { deviceId } = useUser();
  const [data, setData] = useState<{ bets: IVirtualBet[]; stats: IBankrollStats } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (deviceId) {
      getUserBets(deviceId).then(res => {
        setData(res);
        setLoading(false);
      });
    }
  }, [deviceId]);

  const stats = data?.stats;

  return (
    <main className="min-h-screen bg-[#050505] text-white pb-32 md:pb-10">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        {/* User Header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <User size={40} className="text-black" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">Minha Banca</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-zinc-500 text-[10px] md:text-[11px] font-bold tracking-widest uppercase bg-zinc-900 px-3 py-1 rounded-full border border-white/5">
                ID: {deviceId?.slice(0, 8)}...
              </p>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live Sync</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="h-64 bg-zinc-900/50 rounded-[2.5rem]" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-96 bg-zinc-900/50 rounded-[2.5rem]" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Chart */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Wallet size={32} />
                  </div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Lucro Total</p>
                  <p className={`text-2xl font-black ${stats && stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats && stats.profit >= 0 ? '+' : ''}{stats?.profit?.toFixed(2) ?? '0.00'}
                  </p>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={32} />
                  </div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">ROI Mensal</p>
                  <p className={`text-2xl font-black ${stats && stats.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats?.roi?.toFixed(1) ?? '0.0'}%
                  </p>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target size={32} />
                  </div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Win Rate</p>
                  <p className="text-2xl font-black text-white">{stats?.winRate?.toFixed(1) ?? '0.0'}%</p>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <History size={32} />
                  </div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Bets</p>
                  <p className="text-2xl font-black text-white">{stats?.totalBets ?? 0}</p>
                </div>
              </div>

              {/* Bankroll Evolution Chart */}
              <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem]">
                <div className="flex justify-between items-center mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Evolução de Banca</p>
                  <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">Live Trend</span>
                </div>
                
                <div className="h-48 w-full flex items-end gap-1 px-2">
                  {data?.bets && data.bets.length > 0 ? (
                    (() => {
                      const profitTrend: number[] = [];
                      let currentProfit = 0;
                      [...data.bets].reverse().forEach(bet => {
                        if (bet.status === 'WON') currentProfit += (bet.potentialReturn - bet.stake);
                        else if (bet.status === 'LOST') currentProfit -= bet.stake;
                        profitTrend.push(currentProfit);
                      });

                      const max = Math.max(...profitTrend, 10);
                      const min = Math.min(...profitTrend, -10);
                      const range = max - min;

                      return (
                        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d={`M 0 40 ${profitTrend.map((p, i) => 
                              `L ${(i / (profitTrend.length - 1)) * 100} ${40 - ((p - min) / range) * 40}`
                            ).join(' ')} L 100 40 Z`}
                            fill="url(#gradient)"
                          />
                          <path
                            d={profitTrend.map((p, i) => 
                              `${i === 0 ? 'M' : 'L'} ${(i / (profitTrend.length - 1)) * 100} ${40 - ((p - min) / range) * 40}`
                            ).join(' ')}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      );
                    })()
                  ) : (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-white/5 rounded-[2rem]">
                      <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Nenhum dado disponível</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Betting History */}
            <div className="lg:col-span-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-2 px-2">
                <History size={14} /> Histórico de Apostas
              </h2>
              
              {data?.bets.length === 0 ? (
                <div className="text-center py-32 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/10">
                  <p className="text-zinc-600 text-[11px] font-black uppercase tracking-widest">Você ainda não realizou nenhuma aposta</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data?.bets.map((bet) => (
                    <div key={bet._id} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all group flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-2">
                            {bet.status === 'WON' && <div className="p-1 bg-green-500/10 rounded-lg"><CheckCircle2 size={14} className="text-green-500" /></div>}
                            {bet.status === 'LOST' && <div className="p-1 bg-red-500/10 rounded-lg"><XCircle size={14} className="text-red-500" /></div>}
                            {bet.status === 'PENDING' && <div className="p-1 bg-zinc-900 rounded-lg"><Clock size={14} className="text-zinc-500 animate-pulse" /></div>}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              bet.status === 'WON' ? 'text-green-500' : 
                              bet.status === 'LOST' ? 'text-red-500' : 'text-zinc-500'
                            }`}>
                              {bet.status === 'WON' ? 'Ganhou' : bet.status === 'LOST' ? 'Perdeu' : 'Pendente'}
                            </span>
                          </div>
                          <span className="text-zinc-600 text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                            {new Date(bet.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-base font-black tracking-tight mb-1 uppercase italic group-hover:text-green-500 transition-colors">
                            {bet.matchInfo.homeTeam} <span className="text-zinc-600">vs</span> {bet.matchInfo.awayTeam}
                          </h3>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                            {bet.matchInfo.league}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-white/5 pt-5">
                        <div>
                          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Mercado / Seleção</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black bg-white/5 px-2 py-0.5 rounded text-zinc-400 uppercase">{bet.market.replace(/_/g, ' ')}</span>
                            <span className="text-[12px] font-black text-green-400 uppercase tracking-tighter">{bet.selection}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1.5">Investimento</p>
                          <p className="text-[14px] font-black text-white tabular-nums">
                            R$ {bet.stake} <span className="text-zinc-600 text-[10px]">@ {bet.odds.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </main>
  );
}
