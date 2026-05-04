import { getTodayMatches, getLeagues, getTopPredictions } from "@/services/api";
import { MatchCard } from "@/components/MatchCard";
import { RefreshCw, Star, Calendar } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { LeagueFilter } from "@/components/LeagueFilter";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const leagueId = params.league_id ? Number(params.league_id) : undefined;
  const dateType = (params.date_type as string) || 'today';
  const showTop = params.filter === 'top';

  const [matches, leagues] = await Promise.all([
    showTop ? getTopPredictions() : getTodayMatches(leagueId, dateType),
    getLeagues()
  ]);

  const dateFilters = [
    { label: 'Ontem', value: 'yesterday' },
    { label: 'Hoje', value: 'today' },
    { label: 'Amanhã', value: 'tomorrow' }
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white pb-32">
      <Header />

      <div className="max-w-md mx-auto px-5 pt-8">
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white/90">
                Live <span className="text-green-500">Board</span>
              </h2>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-1">
                Análises de Precisão IA
              </p>
            </div>
          </div>

          {/* Quick Filters: Dates & Top 5 */}
          <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar py-2">
            <Link 
              href="?filter=top"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                showTop 
                ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                : 'bg-zinc-900 text-yellow-500/70 border-yellow-500/10 hover:border-yellow-500/30'
              }`}
            >
              <Star size={14} fill={showTop ? "currentColor" : "none"} />
              Top 5 Bet
            </Link>

            <div className="h-10 w-[1px] bg-white/5 mx-1" />

            {dateFilters.map((df) => (
              <Link
                key={df.value}
                href={`?date_type=${df.value}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  !showTop && dateType === df.value
                  ? 'bg-white text-black border-white'
                  : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-white/10'
                }`}
              >
                <Calendar size={12} />
                {df.label}
              </Link>
            ))}
          </div>

          <LeagueFilter leagues={leagues} />

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {showTop ? 'Melhores Probabilidades' : `Partidas de ${dateFilters.find(d => d.value === dateType)?.label}`}
            </h3>
            <span className="text-[10px] font-black text-zinc-700 bg-zinc-900/50 px-2 py-0.5 rounded-md border border-white/5">
              {matches.length} JOGOS
            </span>
          </div>

          {matches.length === 0 ? (
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
              {matches.map((match) => (
                <MatchCard key={match.fixture_id} match={match} />
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
