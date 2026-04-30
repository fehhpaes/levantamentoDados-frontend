import { getTodayMatches } from "@/services/api";
import { MatchCard } from "@/components/MatchCard";
import { LayoutDashboard } from "lucide-react";

export default async function Home() {
  const matches = await getTodayMatches();

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-800 p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <LayoutDashboard size={20} className="text-black" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">Previsão FC</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
              Dashboard de Previsões IA
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4">
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold tracking-tight">Jogos de Hoje</h2>
            <span className="text-xs text-zinc-500 font-medium">
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6 bg-zinc-950 rounded-3xl border border-dashed border-zinc-800">
              <p className="text-zinc-400 font-medium">Nenhuma partida encontrada para hoje.</p>
              <p className="text-zinc-600 text-xs mt-2">Os dados são atualizados automaticamente às 02h.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <MatchCard key={match.fixture_id} match={match} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Bottom Nav Placeholder for Mobile Feel */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4 flex justify-around items-center">
        <div className="flex flex-col items-center gap-1 text-green-500">
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold uppercase">Dashboard</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-600">
          <div className="w-5 h-5 rounded-md border-2 border-zinc-600" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Histórico</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-600">
          <div className="w-5 h-5 rounded-full border-2 border-zinc-600" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Perfil</span>
        </div>
      </nav>
    </main>
  );
}
