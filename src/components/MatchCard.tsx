import React from 'react';
import { IMatch } from '@/services/api';
import { Clock, TrendingUp } from 'lucide-react';

interface MatchCardProps {
  match: IMatch;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const matchTime = new Date(match.date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getProbColor = (prob: number, isWinner: boolean) => {
    if (isWinner) return 'bg-green-500';
    if (prob > 0.4) return 'bg-blue-500';
    return 'bg-zinc-700';
  };

  const probs = match.prediction?.probabilities;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
          <Clock size={14} />
          <span>{matchTime}</span>
        </div>
        <div className="bg-zinc-800 text-zinc-300 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">
          {match.status}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-6">
        <div className="text-right">
          <p className="text-white font-bold text-sm leading-tight">{match.homeTeam.name}</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-xs font-bold px-2">VS</span>
          {match.status === 'FINISHED' && (
             <p className="text-white font-black text-xl mt-1">
                {match.score.home} - {match.score.away}
             </p>
          )}
        </div>
        <div className="text-left">
          <p className="text-white font-bold text-sm leading-tight">{match.awayTeam.name}</p>
        </div>
      </div>

      {probs && (
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 mb-2 text-green-400 text-[10px] font-bold uppercase tracking-widest">
            <TrendingUp size={12} />
            <span>Previsão IA</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Home Win */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase">
                <span>Casa</span>
                <span>{(probs.homeWin * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getProbColor(probs.homeWin, match.prediction?.outcome === 0)}`}
                  style={{ width: `${probs.homeWin * 100}%` }}
                />
              </div>
            </div>

            {/* Draw */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase">
                <span>Empate</span>
                <span>{(probs.draw * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getProbColor(probs.draw, match.prediction?.outcome === 1)}`}
                  style={{ width: `${probs.draw * 100}%` }}
                />
              </div>
            </div>

            {/* Away Win */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase">
                <span>Fora</span>
                <span>{(probs.awayWin * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getProbColor(probs.awayWin, match.prediction?.outcome === 2)}`}
                  style={{ width: `${probs.awayWin * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
