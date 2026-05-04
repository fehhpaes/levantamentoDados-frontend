import React from 'react';
import { IMatch } from '@/services/api';
import { Clock, TrendingUp, Target } from 'lucide-react';

interface MatchCardProps {
  match: IMatch;
}

const TeamLogo = ({ name }: { name: string }) => (
  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/5 flex items-center justify-center text-zinc-500 font-black text-xl shadow-inner group-hover:border-green-500/30 transition-colors">
    {name.charAt(0)}
  </div>
);

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const matchTime = new Date(match.date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getProbColor = (prob: number, isWinner: boolean) => {
    if (isWinner) return 'from-green-400 to-green-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]';
    if (prob > 0.4) return 'from-blue-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
    return 'from-zinc-600 to-zinc-800';
  };

  const probs = match.prediction?.probabilities;

  return (
    <div className="group bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-5 mb-1 transition-all active:scale-[0.98] hover:bg-zinc-900/60 shadow-xl overflow-hidden relative">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px] -z-10 rounded-full" />
      
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
          <Clock size={12} className="text-green-500" />
          <span className="text-zinc-400 text-[10px] font-bold tracking-widest">{matchTime}</span>
        </div>
        <div className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${
          match.status === 'FINISHED' 
          ? 'bg-zinc-800/50 text-zinc-500 border-zinc-700/30' 
          : 'bg-green-500/10 text-green-500 border-green-500/20'
        }`}>
          {match.status === 'FINISHED' ? 'Encerrado' : 'Agendado'}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mb-6">
        {/* Home Team */}
        <div className="flex flex-col items-center gap-3 flex-1 text-center">
          <TeamLogo name={match.homeTeam.name} />
          <p className="text-white font-black text-xs uppercase leading-tight tracking-wide h-8 flex items-center">
            {match.homeTeam.name}
          </p>
        </div>

        {/* Score/VS */}
        <div className="flex flex-col items-center justify-center min-w-[60px]">
          {match.status === 'FINISHED' ? (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-zinc-600 mb-1 tracking-tighter">SCORE</span>
              <div className="bg-black/60 px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
                <p className="text-white font-black text-2xl tracking-tighter tabular-nums">
                  {match.score.home} <span className="text-zinc-600 mx-1">:</span> {match.score.away}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl">
                <span className="text-zinc-600 font-black text-[10px] tracking-widest">VS</span>
              </div>
              <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-full" />
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center gap-3 flex-1 text-center">
          <TeamLogo name={match.awayTeam.name} />
          <p className="text-white font-black text-xs uppercase leading-tight tracking-wide h-8 flex items-center">
            {match.awayTeam.name}
          </p>
        </div>
      </div>

      {probs && (
        <div className="space-y-4 pt-5 border-t border-white/5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <TrendingUp size={12} />
              <span>AI Prediction</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-500 text-[9px] font-bold">
              <Target size={10} />
              <span>Confidence High</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Casa', val: probs.homeWin, outcome: 0 },
              { label: 'Empate', val: probs.draw, outcome: 1 },
              { label: 'Fora', val: probs.awayWin, outcome: 2 },
            ].map((p, idx) => (
              <div key={idx} className="flex flex-col gap-2 bg-black/20 p-2.5 rounded-2xl border border-white/[0.02]">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">{p.label}</span>
                  <span className={`text-[11px] font-black ${(match.prediction?.outcome === p.outcome) ? 'text-green-400' : 'text-white'}`}>
                    {(p.val * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r rounded-full ${getProbColor(p.val, match.prediction?.outcome === p.outcome)}`}
                    style={{ width: `${p.val * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {match.prediction?.analysis && (
            <div className="mt-4 p-4 bg-green-500/[0.03] border border-green-500/10 rounded-2xl">
              <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                "{match.prediction.analysis}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
