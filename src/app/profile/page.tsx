import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white pb-32">
      <Header />
      <div className="max-w-md mx-auto px-5 pt-8 text-center">
        <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] py-20 px-10">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <User size={40} className="text-black" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Sua Conta</h1>
          <p className="text-zinc-500 text-sm font-medium">Configure suas preferências de notificação e IA em breve.</p>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
