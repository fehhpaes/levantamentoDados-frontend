import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPredictedValueBets } from '../services/api';
import { TrendingUp, Target, Percent, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Form';
import { Badge } from '../components/ui/Badge';

interface ValueBet {
  match_id: string;
  match_info: {
    match_date?: string;
    home_team?: { name?: string };
    away_team?: { name?: string };
    league?: { name?: string };
  };
  market: string;
  selection: string;
  predicted_prob: number;
  bookmaker_odds: number;
  edge_percentage: number;
  expected_value: number;
  confidence: number;
  recommended_bet?: string;
  model_name?: string;
}

export default function ValueBets() {
  const [minEdge, setMinEdge] = useState(3);

  const { data: predictions, isLoading, refetch } = useQuery<ValueBet[]>({
    queryKey: ['value-bets', minEdge],
    queryFn: async () => {
      const response = await getPredictedValueBets(0.5, minEdge);
      const data = response.data;
      return Array.isArray(data) ? data : [];
    },
  });

  const sortedBets = [...(predictions || [])].sort((a, b) => b.edge_percentage - a.edge_percentage);

  const avgEdge = sortedBets.length > 0
    ? sortedBets.reduce((s, b) => s + (b.edge_percentage || 0), 0) / sortedBets.length
    : 0;

  const avgConfidence = sortedBets.length > 0
    ? sortedBets.reduce((s, b) => s + (b.confidence || 0), 0) / sortedBets.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Previsoes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Apostas recomendadas pelo modelo com base em analise estatistica
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total de Aposta"
          value={sortedBets.length}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Edge Medio"
          value={`${avgEdge.toFixed(1)}%`}
          icon={Percent}
          color="green"
        />
        <StatCard
          title="Confianca Media"
          value={`${(avgConfidence * 100).toFixed(0)}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-600 dark:text-gray-400">Edge minimo:</label>
        <input
          type="range"
          min="0"
          max="20"
          value={minEdge}
          onChange={(e) => setMinEdge(Number(e.target.value))}
          className="w-48"
        />
        <span className="text-sm font-medium">{minEdge}%</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-12 w-12 animate-spin text-primary-600" />
        </div>
      ) : sortedBets.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              Nenhuma aposta encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Nao ha previsoes com edge acima de {minEdge}%. Tente reduzir o filtro.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedBets.map((bet, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {bet.match_info?.home_team?.name || 'Time A'} vs {bet.match_info?.away_team?.name || 'Time B'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {bet.match_info?.league?.name || ''}
                  </p>
                </div>
                <Badge variant="success">{(bet.edge_percentage || 0).toFixed(1)}% edge</Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Aposta</span>
                  <span className="font-medium dark:text-gray-200">{bet.selection || bet.recommended_bet || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Probabilidade</span>
                  <span className="font-medium dark:text-gray-200">{((bet.predicted_prob || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Confianca</span>
                  <span className="font-medium dark:text-gray-200">{((bet.confidence || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Valor Esperado</span>
                  <span className="font-medium text-green-600 dark:text-green-400">+{(bet.expected_value || 0).toFixed(1)}%</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{bet.model_name || 'ensemble'}</span>
                {bet.match_info?.match_date && (
                  <span className="flex items-center">
                    {new Date(bet.match_info.match_date).toLocaleDateString('pt-BR')}
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
