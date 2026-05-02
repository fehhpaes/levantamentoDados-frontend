import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { History as HistoryIcon } from "lucide-react";

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white pb-32">
      <Header />
      <div className="max-w-md mx-auto px-5 pt-8 text-center">
        <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] py-20 px-10">
          <HistoryIcon size={48} className="mx-auto text-zinc-700 mb-6" />
          <h1 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Histórico</h1>
          <p className="text-zinc-500 text-sm font-medium">Em breve você poderá ver o desempenho das análises anteriores aqui.</p>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
