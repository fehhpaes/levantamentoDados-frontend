import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStrategies,
  createStrategy,
  runBacktest,
  getBacktestResults,
  compareStrategies,
} from '../services/api';
import {
  Play,
  Plus,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Percent,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { BacktestStrategy, BacktestResult, StrategyType } from '../types';

const STRATEGY_TYPES: { value: StrategyType; label: string; description: string }[] = [
  { value: 'value_betting', label: 'Value Betting', description: 'Aposta quando a probabilidade real excede a implicita' },
  { value: 'kelly_criterion', label: 'Kelly Criterion', description: 'Stake otimizada matematicamente baseada na vantagem' },
  { value: 'fixed_stake', label: 'Stake Fixa', description: 'Mesmo valor de aposta para todas as selecoes' },
  { value: 'percentage_stake', label: 'Stake Percentual', description: 'Porcentagem fixa da banca por aposta' },
  { value: 'martingale', label: 'Martingale', description: 'Dobra a stake apos cada perda' },
  { value: 'fibonacci', label: 'Fibonacci', description: 'Stake segue a sequencia de Fibonacci' },
];

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        <Icon className={`w-5 h-5 ${trend ? trendColors[trend] : 'text-gray-400'}`} />
      </div>
      <div className={`text-2xl font-bold ${trend ? trendColors[trend] : 'text-gray-900'}`}>
        {value}
      </div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

function StrategyForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (strategy: BacktestStrategy) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<BacktestStrategy>({
    name: '',
    strategy_type: 'value_betting',
    min_edge: 0.05,
    min_odds: 1.5,
    max_odds: 5.0,
    min_confidence: 0.6,
    base_stake: 100,
    kelly_fraction: 0.25,
    max_stake: 500,
    markets: ['1X2'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold">Nova Estrategia</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={formData.strategy_type}
            onChange={(e) => setFormData({ ...formData, strategy_type: e.target.value as StrategyType })}
            className="w-full border rounded-lg px-3 py-2"
          >
            {STRATEGY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Edge Minimo (%)</label>
          <input
            type="number"
            step="0.01"
            value={formData.min_edge * 100}
            onChange={(e) => setFormData({ ...formData, min_edge: parseFloat(e.target.value) / 100 })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confianca Minima (%)</label>
          <input
            type="number"
            step="0.01"
            value={formData.min_confidence * 100}
            onChange={(e) => setFormData({ ...formData, min_confidence: parseFloat(e.target.value) / 100 })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Odds Minima</label>
          <input
            type="number"
            step="0.1"
            value={formData.min_odds}
            onChange={(e) => setFormData({ ...formData, min_odds: parseFloat(e.target.value) })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Odds Maxima</label>
          <input
            type="number"
            step="0.1"
            value={formData.max_odds}
            onChange={(e) => setFormData({ ...formData, max_odds: parseFloat(e.target.value) })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stake Base (R$)</label>
          <input
            type="number"
            value={formData.base_stake}
            onChange={(e) => setFormData({ ...formData, base_stake: parseFloat(e.target.value) })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stake Maxima (R$)</label>
          <input
            type="number"
            value={formData.max_stake}
            onChange={(e) => setFormData({ ...formData, max_stake: parseFloat(e.target.value) })}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Criar Estrategia
        </button>
      </div>
    </form>
  );
}

function ResultsCard({ result }: { result: BacktestResult }) {
  const [expanded, setExpanded] = useState(false);
  
  const profitColor = result.total_profit >= 0 ? 'text-green-600' : 'text-red-600';
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">{result.strategy_name}</h4>
            <p className="text-sm text-gray-500">
              {new Date(result.period_start).toLocaleDateString('pt-BR')} - {new Date(result.period_end).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={`text-lg font-bold ${profitColor}`}>
                R$ {result.total_profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-sm ${profitColor}`}>
                ROI: {result.roi.toFixed(1)}%
              </p>
            </div>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="border-t p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total de Apostas"
              value={result.total_bets}
              icon={BarChart2}
            />
            <StatCard
              title="Taxa de Acerto"
              value={`${(result.win_rate * 100).toFixed(1)}%`}
              icon={Percent}
              trend={result.win_rate > 0.5 ? 'up' : 'down'}
            />
            <StatCard
              title="Drawdown Maximo"
              value={`${result.max_drawdown.toFixed(1)}%`}
              icon={TrendingDown}
              trend="down"
            />
            <StatCard
              title="Sharpe Ratio"
              value={result.sharpe_ratio.toFixed(2)}
              icon={TrendingUp}
              trend={result.sharpe_ratio > 1 ? 'up' : 'neutral'}
            />
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.equity_curve}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Banca']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                />
                <Area 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#4f46e5" 
                  fill="#4f46e5" 
                  fillOpacity={0.1} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Vitorias:</span>
              <span className="ml-2 font-medium text-green-600">{result.winning_bets}</span>
            </div>
            <div>
              <span className="text-gray-500">Derrotas:</span>
              <span className="ml-2 font-medium text-red-600">{result.losing_bets}</span>
            </div>
            <div>
              <span className="text-gray-500">Odds Media:</span>
              <span className="ml-2 font-medium">{result.average_odds.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-500">Sequencia Vitorias:</span>
              <span className="ml-2 font-medium">{result.longest_winning_streak}</span>
            </div>
            <div>
              <span className="text-gray-500">Sequencia Derrotas:</span>
              <span className="ml-2 font-medium">{result.longest_losing_streak}</span>
            </div>
            <div>
              <span className="text-gray-500">Profit Factor:</span>
              <span className="ml-2 font-medium">{result.profit_factor.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Backtesting() {
  const queryClient = useQueryClient();
  const [showNewStrategy, setShowNewStrategy] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  
  const { data: strategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: async () => {
      const response = await getStrategies();
      return response.data;
    },
  });
  
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['backtest-results', selectedStrategy],
    queryFn: async () => {
      const response = await getBacktestResults(selectedStrategy ?? undefined);
      return response.data;
    },
  });
  
  const createMutation = useMutation({
    mutationFn: createStrategy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      setShowNewStrategy(false);
    },
  });
  
  const runBacktestMutation = useMutation({
    mutationFn: async ({ strategyId, params }: { strategyId: number; params: Record<string, unknown> }) => {
      const response = await runBacktest(strategyId, params as { league_id?: number; date_from?: string; date_to?: string });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backtest-results'] });
    },
  });
  
  const handleRunBacktest = (strategyId: number) => {
    runBacktestMutation.mutate({
      strategyId,
      params: {
        date_from: '2024-01-01',
        date_to: new Date().toISOString().split('T')[0],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Backtesting</h2>
        <button
          onClick={() => setShowNewStrategy(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Nova Estrategia
        </button>
      </div>
      
      {showNewStrategy && (
        <StrategyForm
          onSubmit={(strategy) => createMutation.mutate(strategy)}
          onCancel={() => setShowNewStrategy(false)}
        />
      )}
      
      {/* Strategies List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold">Estrategias</h3>
        </div>
        
        {strategiesLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : strategies && strategies.length > 0 ? (
          <div className="divide-y">
            {strategies.map((strategy: BacktestStrategy & { id: number }) => (
              <div
                key={strategy.id}
                className={`p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                  selectedStrategy === strategy.id ? 'bg-primary-50' : ''
                }`}
                onClick={() => setSelectedStrategy(strategy.id)}
              >
                <div>
                  <h4 className="font-medium">{strategy.name}</h4>
                  <p className="text-sm text-gray-500">
                    {STRATEGY_TYPES.find(t => t.value === strategy.strategy_type)?.label} | 
                    Edge: {(strategy.min_edge * 100).toFixed(0)}% | 
                    Odds: {strategy.min_odds} - {strategy.max_odds}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRunBacktest(strategy.id);
                  }}
                  disabled={runBacktestMutation.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  Executar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Nenhuma estrategia cadastrada. Crie uma nova para comecar.
          </div>
        )}
      </div>
      
      {/* Results */}
      <div>
        <h3 className="font-semibold mb-4">Resultados</h3>
        
        {resultsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : results && results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result: BacktestResult, index: number) => (
              <ResultsCard key={index} result={result} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum resultado de backtest ainda.</p>
            <p className="text-sm">Execute um backtest para ver os resultados aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}
