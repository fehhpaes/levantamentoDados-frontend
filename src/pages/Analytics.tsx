import { useQuery } from '@tanstack/react-query';
import { getMarketAnalysis } from '../services/api';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#10b981', '#6b7280', '#ef4444'];

export default function Analytics() {
  const { data: marketAnalysis, isLoading } = useQuery({
    queryKey: ['market-analysis'],
    queryFn: async () => {
      const response = await getMarketAnalysis(undefined, 30);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const resultsData = marketAnalysis ? [
    { name: 'Casa', value: marketAnalysis.results.home_wins, pct: marketAnalysis.results.home_wins_pct },
    { name: 'Empate', value: marketAnalysis.results.draws, pct: marketAnalysis.results.draws_pct },
    { name: 'Fora', value: marketAnalysis.results.away_wins, pct: marketAnalysis.results.away_wins_pct },
  ] : [];

  const goalsData = marketAnalysis ? [
    { name: 'Over 2.5', value: marketAnalysis.goals.over_2_5_pct },
    { name: 'Under 2.5', value: 100 - marketAnalysis.goals.over_2_5_pct },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Periodo Analisado</p>
              <p className="text-2xl font-bold text-gray-900">
                {marketAnalysis?.period_days || 0} dias
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Partidas</p>
              <p className="text-2xl font-bold text-gray-900">
                {marketAnalysis?.total_matches || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Over 2.5 Gols</p>
              <p className="text-2xl font-bold text-gray-900">
                {marketAnalysis?.goals.over_2_5_pct || 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ambos Marcam</p>
              <p className="text-2xl font-bold text-gray-900">
                {marketAnalysis?.goals.btts_pct || 0}%
              </p>
            </div>
            <Minus className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Results Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuicao de Resultados
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resultsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [`${value}%`, 'Porcentagem']}
                />
                <Bar dataKey="pct" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Vitoria Casa</p>
              <p className="text-lg font-bold text-green-600">
                {marketAnalysis?.results.home_wins_pct || 0}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Empate</p>
              <p className="text-lg font-bold text-gray-600">
                {marketAnalysis?.results.draws_pct || 0}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Vitoria Fora</p>
              <p className="text-lg font-bold text-red-600">
                {marketAnalysis?.results.away_wins_pct || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Goals Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Over/Under 2.5 Gols
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={goalsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {goalsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Favorites Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance dos Favoritos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Favoritos Vencem</p>
                <p className="text-2xl font-bold text-green-600">
                  {marketAnalysis?.favorites.favorite_wins_pct || 0}%
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {marketAnalysis?.favorites.favorite_wins || 0} vitórias
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <TrendingDown className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Zebras</p>
                <p className="text-2xl font-bold text-red-600">
                  {100 - (marketAnalysis?.favorites.favorite_wins_pct || 0)}%
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {marketAnalysis?.favorites.underdog_wins || 0} vitórias
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
