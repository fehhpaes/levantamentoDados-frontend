import React, { useState } from 'react';
import { IMatch } from '@/services/api';
import { Clock, TrendingUp, Target, Brain, Info } from 'lucide-react';
import { MatchDetailModal } from './MatchDetailModal';

interface MatchCardProps {
  match: IMatch;
}

const TeamLogo = ({ name }: { name: string }) => (
  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/5 flex items-center justify-center text-zinc-500 font-black text-xl shadow-inner group-hover:border-green-500/30 transition-colors">
    {name.charAt(0)}
  </div>
);

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const matchDateTime = mounted 
    ? {
        time: new Date(match.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        date: new Date(match.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      }
    : { time: '--:--', date: '--/--' };

  const getProbColor = (prob: number, isWinner: boolean) => {
    if (isWinner) return 'from-green-400 to-green-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]';
    if (prob > 0.4) return 'from-blue-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
    return 'from-zinc-600 to-zinc-800';
  };

  const probs = match.prediction?.probabilities;

  // Determine hit/miss for finished matches
  const getAccuracyStatus = () => {
    if (match.status !== 'FINISHED' || !match.prediction) return null;
    
    const { home, away } = match.score;
    let actualOutcome;
    if (home > away) actualOutcome = 0;
    else if (home === away) actualOutcome = 1;
    else actualOutcome = 2;

    const isHit = match.prediction.outcome === actualOutcome;
    return isHit ? 'HIT' : 'MISS';
  };

  const accuracy = getAccuracyStatus();

  // Extract confidence from analysis text [Confiança: XX%]
  const confidenceMatch = match.prediction?.analysis?.match(/\[Confiança:\s*(\d+)%\]/);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : null;
  const cleanAnalysis = match.prediction?.analysis?.replace(/\[Confiança:\s*\d+%\]\s*•?\s*/, '') || '';

  const getConfidenceColor = (val: number) => {
    if (val >= 80) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (val >= 65) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-zinc-500 bg-zinc-900 border-white/5';
  };

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`group bg-zinc-900/40 backdrop-blur-md border rounded-[2rem] p-5 mb-1 transition-all active:scale-[0.98] hover:bg-zinc-900/60 shadow-xl overflow-hidden relative cursor-pointer ${
          accuracy === 'HIT' ? 'border-green-500/20' : accuracy === 'MISS' ? 'border-red-500/20' : 'border-white/5'
        }`}
      >
        {/* Accuracy Badge */}
        {accuracy && (
          <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl font-black text-[10px] tracking-widest uppercase shadow-2xl flex items-center gap-1.5 z-20 ${
            accuracy === 'HIT' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {accuracy === 'HIT' ? '✅ ACERTOU' : '❌ ERROU'}
          </div>
        )}

        {/* Confidence Badge */}
        {!accuracy && confidence && (
          <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl font-black text-[10px] tracking-widest uppercase border-l border-b flex items-center gap-1.5 z-20 ${getConfidenceColor(confidence)}`}>
            <Brain size={10} />
            Confiança: {confidence}%
          </div>
        )}

        {/* Decorative Gradient Background */}
        <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] -z-10 rounded-full ${
          accuracy === 'HIT' ? 'bg-green-500/10' : accuracy === 'MISS' ? 'bg-red-500/10' : 'bg-green-500/5'
        }`} />
        
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
            <Clock size={12} className="text-green-500" />
            <span className="text-zinc-400 text-[10px] font-bold tracking-widest uppercase">
              {matchDateTime.date} • {matchDateTime.time}
            </span>
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
                    {match.score?.home ?? 0} <span className="text-zinc-600 mx-1">:</span> {match.score?.away ?? 0}
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
                { label: 'Casa', val: probs.homeWin, odds: match.prediction?.odds?.homeWin, outcome: 0, target: 'HOME' },
                { label: 'Empate', val: probs.draw, odds: match.prediction?.odds?.draw, outcome: 1, target: 'DRAW' },
                { label: 'Fora', val: probs.awayWin, odds: match.prediction?.odds?.awayWin, outcome: 2, target: 'AWAY' },
              ].map((p, idx) => {
                const isValueBet = match.prediction?.valueBet?.isFound && match.prediction.valueBet.target === p.target;
                
                return (
                  <div key={idx} className={`flex flex-col gap-2 p-2.5 rounded-2xl border transition-all ${
                    isValueBet 
                    ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                    : 'bg-black/20 border-white/[0.02]'
                  }`}>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">{p.label}</span>
                        {p.odds && (
                          <span className="text-[10px] font-black text-zinc-400">@{p.odds.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-[11px] font-black ${(match.prediction?.outcome === p.outcome) ? 'text-green-400' : 'text-white'}`}>
                          {(p.val * 100).toFixed(0)}%
                        </span>
                        {isValueBet && (
                          <span className="text-[7px] font-black text-purple-400 uppercase tracking-tighter animate-pulse flex items-center gap-0.5">
                            <TrendingUp size={8} /> VALUE
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r rounded-full ${getProbColor(p.val, match.prediction?.outcome === p.outcome)}`}
                        style={{ width: `${p.val * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phase 4: Dashboard Insights */}
            {cleanAnalysis && (
              <div className="pt-4 border-t border-white/[0.02]">
                <div className="flex gap-2 items-start">
                  <div className="mt-0.5">
                    <Info size={12} className="text-zinc-600" />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium italic leading-relaxed">
                    {cleanAnalysis}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <MatchDetailModal 
          fixture_id={match.fixture_id} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};
