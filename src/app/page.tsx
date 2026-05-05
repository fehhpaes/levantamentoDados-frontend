import { getTodayMatches, getLeagues, getTopPredictions } from "@/services/api";
import { Star, Calendar, Trophy, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { LeagueFilter } from "@/components/LeagueFilter";
import { MatchList } from "@/components/MatchList";
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
  const showValue = params.filter === 'value';

  const [matches, leagues] = await Promise.all([
    showTop ? getTopPredictions() : getTodayMatches(leagueId, dateType),
    getLeagues()
  ]);

  // Client-side filtering for value bets if requested
  const displayMatches = showValue 
    ? matches.filter(m => m.prediction?.valueBet?.isFound)
    : matches;

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
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white/90">
                Live <span className="text-green-500">Board</span>
              </h2>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-1">
                Análises de Precisão IA
              </p>
            </div>
            
            <a 
              href={`${process.env.NEXT_PUBLIC_API_URL || 'https://levantamentodados-backend.onrender.com'}/api/matches/report`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-95"
            >
              <Trophy size={14} />
              Imprimir
            </a>
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

            <Link 
              href="?filter=value"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                showValue 
                ? 'bg-purple-500 text-white border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                : 'bg-zinc-900 text-purple-400/70 border-purple-500/10 hover:border-purple-500/30'
              }`}
            >
              <TrendingUp size={14} />
              Value Radar
            </Link>

            <div className="h-10 w-[1px] bg-white/5 mx-1" />

            {dateFilters.map((df) => (
              <Link
                key={df.value}
                href={`?date_type=${df.value}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  !showTop && !showValue && dateType === df.value
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
              {showTop ? 'Melhores Probabilidades' : showValue ? 'Oportunidades de Valor' : `Partidas de ${dateFilters.find(d => d.value === dateType)?.label}`}
            </h3>
            <span className="text-[10px] font-black text-zinc-700 bg-zinc-900/50 px-2 py-0.5 rounded-md border border-white/5">
              {displayMatches.length} JOGOS
            </span>
          </div>

          <MatchList initialMatches={displayMatches} leagueId={leagueId} />
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
