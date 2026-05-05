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
    <main className="min-h-screen bg-[#050505] text-white pb-32">
      <Header />
      
      <div className="max-w-md mx-auto px-5 pt-8">
        {/* User Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <User size={32} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase">Minha Banca</h1>
            <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">ID: {deviceId?.slice(0, 8)}...</p>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-zinc-900/50 rounded-[2rem]" />
            <div className="h-64 bg-zinc-900/50 rounded-[2rem]" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wallet size={40} />
                </div>
                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">Lucro Total</p>
                <p className={`text-xl font-black ${stats && stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats && stats.profit >= 0 ? '+' : ''}{stats?.profit?.toFixed(2) ?? '0.00'}
                </p>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp size={40} />
                </div>
                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">ROI Mensal</p>
                <p className={`text-xl font-black ${stats && stats.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats?.roi?.toFixed(1) ?? '0.0'}%
                </p>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target size={40} />
                </div>
                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">Win Rate</p>
                <p className="text-xl font-black text-white">{stats?.winRate?.toFixed(1) ?? '0.0'}%</p>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <History size={40} />
                </div>
                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">Total Apostas</p>
                <p className="text-xl font-black text-white">{stats?.totalBets ?? 0}</p>
              </div>
            </div>

            {/* Bankroll Evolution Chart */}
            <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2.5rem] mb-8">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Evolução de Banca</p>
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">LIVE TREND</span>
              </div>
              
              <div className="h-32 w-full flex items-end gap-1 px-2">
                {data?.bets && data.bets.length > 0 ? (
                  (() => {
                    const profitTrend: number[] = [];
                    let currentProfit = 0;
                    // Calculate profit after each bet (reversed because bets are sorted newest first)
                    [...data.bets].reverse().forEach(bet => {
                      if (bet.status === 'WON') currentProfit += (bet.potentialReturn - bet.stake);
                      else if (bet.status === 'LOST') currentProfit -= bet.stake;
                      profitTrend.push(currentProfit);
                    });

                    const max = Math.max(...profitTrend, 10);
                    const min = Math.min(...profitTrend, -10);
                    const range = max - min;

                    return (
                      <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path
                          d={`M 0 40 ${profitTrend.map((p, i) => 
                            `L ${(i / (profitTrend.length - 1)) * 100} ${40 - ((p - min) / range) * 40}`
                          ).join(' ')} L 100 40 Z`}
                          fill="url(#gradient)"
                        />
                        {/* Line */}
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
                  <div className="w-full h-full flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
                    <p className="text-[8px] font-black text-zinc-700 uppercase">Aguardando dados de apostas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Betting History */}
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 px-2">Histórico Recente</h2>
              
              {data?.bets.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/10">
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Nenhuma aposta registrada</p>
                </div>
              ) : (
                data?.bets.map((bet) => (
                  <div key={bet._id} className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        {bet.status === 'WON' && <CheckCircle2 size={16} className="text-green-500" />}
                        {bet.status === 'LOST' && <XCircle size={16} className="text-red-500" />}
                        {bet.status === 'PENDING' && <Clock size={16} className="text-zinc-500 animate-pulse" />}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          bet.status === 'WON' ? 'text-green-500' : 
                          bet.status === 'LOST' ? 'text-red-500' : 'text-zinc-500'
                        }`}>
                          {bet.status === 'WON' ? 'Ganhou' : bet.status === 'LOST' ? 'Perdeu' : 'Pendente'}
                        </span>
                      </div>
                      <span className="text-zinc-600 text-[9px] font-bold">{new Date(bet.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-sm font-black tracking-tight mb-1">{bet.matchInfo.homeTeam} vs {bet.matchInfo.awayTeam}</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{bet.matchInfo.league}</p>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/5 pt-4">
                      <div>
                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Mercado / Seleção</p>
                        <p className="text-[11px] font-bold uppercase">{bet.market.replace(/_/g, ' ')}: <span className="text-green-500">{bet.selection}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1">Stake / Odds</p>
                        <p className="text-xs font-black">R$ {bet.stake} @ {bet.odds.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
