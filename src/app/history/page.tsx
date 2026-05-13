import { getBacktestStats } from "@/services/api";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { TrendingUp, CheckCircle2, XCircle, Trophy, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const stats = await getBacktestStats();

  const getOutcomeLabel = (outcome: number) => {
    if (outcome === 0) return 'CASA';
    if (outcome === 1) return 'EMPATE';
    return 'FORA';
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white pb-32 md:pb-10">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white/90 mb-1">
                Back<span className="text-green-500">testing</span>
              </h2>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">
                Transparência e Precisão IA • {stats.total} Amostras
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Stats Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Main Stats Card */}
              <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[60px] rounded-full" />
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Trophy className="text-green-500" size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Taxa de Acerto Geral</p>
                    <h3 className="text-4xl font-black tracking-tighter text-white">{stats.accuracy}%</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Análises</p>
                    <p className="text-xl font-black text-white">{stats.total}</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Acertos</p>
                    <p className="text-xl font-black text-green-500">{stats.hits}</p>
                  </div>
                </div>
              </div>

              {/* League Stats */}
              <div className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                  <Globe size={12} /> Desempenho por Liga
                </h3>
                <div className="space-y-4">
                  {stats.leagueStats.map((league, idx) => (
                    <div key={idx} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-tight">{league.name}</p>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase">{league.total} jogos</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${league.accuracy >= 70 ? 'text-green-500' : 'text-zinc-400'}`}>
                          {league.accuracy}%
                        </p>
                        <div className="w-16 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${league.accuracy}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Results Grid */}
            <div className="lg:col-span-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                <TrendingUp size={12} /> Resultados Recentes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.recentMatches.map((match) => (
                  <div key={match.fixture_id} className="bg-zinc-900/20 border border-white/5 rounded-[2rem] p-6 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                        {match.league}
                      </span>
                      {match.isHit ? (
                        <div className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                          <CheckCircle2 size={10} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Acerto</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-white/5">
                          <XCircle size={10} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Erro</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex-1 text-right">
                        <p className="text-xs font-black uppercase text-white truncate">{match.homeTeam}</p>
                      </div>
                      <div className="bg-black/60 px-3 py-2 rounded-xl border border-white/5 shadow-lg">
                        <p className="text-base font-black tabular-nums">
                          {match.score?.home ?? 0} : {match.score?.away ?? 0}
                        </p>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-black uppercase text-white truncate">{match.awayTeam}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Previsão IA</p>
                        <p className={`text-[10px] font-black uppercase ${match.isHit ? 'text-green-400' : 'text-zinc-400'}`}>
                          {getOutcomeLabel(match.predictedOutcome)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Resultado</p>
                        <p className="text-[10px] font-black uppercase text-white">
                          {getOutcomeLabel(match.actualOutcome)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </main>
  );
}
