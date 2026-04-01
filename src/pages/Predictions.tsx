import { useQuery } from '@tanstack/react-query';
import { getPredictedValueBets, getModelPerformance } from '../services/api';
import { Target, TrendingUp, BarChart, AlertCircle } from 'lucide-react';
import type { ValueBet } from '../types';

export default function Predictions() {
  const { data: valueBets, isLoading: betsLoading } = useQuery<ValueBet[]>({
    queryKey: ['predicted-value-bets'],
    queryFn: async () => {
      const response = await getPredictedValueBets(0.6, 3);
      return response.data;
    },
  });

  const { data: modelPerformance, isLoading: perfLoading } = useQuery({
    queryKey: ['model-performance'],
    queryFn: async () => {
      const response = await getModelPerformance();
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Model Performance */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance dos Modelos
        </h3>
        {perfLoading ? (
          <div className="flex items-center justify-center h-32 bg-white rounded-lg shadow">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : modelPerformance && modelPerformance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelPerformance.map((model: any) => (
              <div key={model.model_name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <BarChart className="w-8 h-8 text-primary-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">{model.model_name}</h4>
                    <p className="text-sm text-gray-500">
                      {model.total_predictions} previsoes
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Acuracia (Resultado)</span>
                    <span className={`font-medium ${
                      model.accuracy_result >= 0.5 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(model.accuracy_result * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Acuracia (Placar)</span>
                    <span className="font-medium text-gray-900">
                      {(model.accuracy_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ROI</span>
                    <span className={`font-medium ${
                      model.roi_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {model.roi_percentage >= 0 ? '+' : ''}{model.roi_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <BarChart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum dado de performance
            </h3>
          </div>
        )}
      </div>

      {/* Value Bets from Predictions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Value Bets (Baseado em Previsoes)
        </h3>
        {betsLoading ? (
          <div className="flex items-center justify-center h-32 bg-white rounded-lg shadow">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : valueBets && valueBets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {valueBets.map((bet, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-6 h-6 text-primary-600" />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    bet.confidence >= 0.7 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Confianca: {(bet.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500">Selecao</p>
                  <p className="font-medium text-gray-900">{bet.selection}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Prob. Prevista</p>
                    <p className="font-medium text-gray-900">
                      {(bet.predicted_prob * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">EV</p>
                    <p className={`font-medium ${
                      bet.expected_value >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {bet.expected_value >= 0 ? '+' : ''}{bet.expected_value.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum value bet identificado
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
