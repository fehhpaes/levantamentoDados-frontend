import { getTodayMatches } from "@/services/api";
import { MatchCard } from "@/components/MatchCard";
import { RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

export const dynamic = "force-dynamic";

export default async function Home() {
  const matches = await getTodayMatches();

  return (
    <main className="min-h-screen bg-[#050505] text-white pb-32">
      <Header />

      <div className="max-w-md mx-auto px-5 pt-8">
        <section>
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white/90">
                Live <span className="text-green-500">Board</span>
              </h2>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-1">
                Análises de Precisão IA
              </p>
            </div>
            <div className="bg-zinc-900/80 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
              <span className="text-xs text-green-500 font-black tracking-widest tabular-nums uppercase">
                {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          </div>

          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center px-10 bg-zinc-900/20 rounded-[3rem] border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-green-500/[0.02] to-transparent" />
              <div className="bg-zinc-900 p-5 rounded-3xl mb-6 shadow-2xl relative z-10 border border-white/5">
                <RefreshCw size={36} className="text-zinc-700 animate-pulse" />
              </div>
              <p className="text-zinc-300 font-black text-xl tracking-tight relative z-10">NENHUMA PARTIDA</p>
              <p className="text-zinc-600 text-xs mt-3 leading-relaxed font-bold uppercase tracking-widest relative z-10">
                Aguardando processamento de dados globais
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
