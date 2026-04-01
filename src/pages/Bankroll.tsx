import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBankrollState,
  getBankrollTransactions,
  getBankrollSettings,
  getBankrollStats,
  deposit,
  withdraw,
  initializeBankroll,
  updateBankrollSettings,
} from '../services/api';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Settings,
  Plus,
  Minus,
  BarChart2,
  Calendar,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { BankrollState, BankrollTransaction, BankrollSettings } from '../types';

const STAKING_METHODS = [
  { value: 'fixed', label: 'Stake Fixa', description: 'Valor fixo por aposta' },
  { value: 'percentage', label: 'Percentual', description: 'Porcentagem da banca' },
  { value: 'kelly', label: 'Kelly Criterion', description: 'Stake otimizada por formula' },
];

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'gray',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  color?: 'gray' | 'green' | 'red' | 'blue';
}) {
  const colors = {
    gray: 'bg-gray-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };
  
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${trend ? trendColors[trend] : ''}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ transaction }: { transaction: BankrollTransaction }) {
  const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    deposit: { icon: ArrowDownRight, color: 'text-green-600', label: 'Deposito' },
    withdrawal: { icon: ArrowUpRight, color: 'text-red-600', label: 'Saque' },
    bet: { icon: Minus, color: 'text-orange-600', label: 'Aposta' },
    win: { icon: Plus, color: 'text-green-600', label: 'Ganho' },
    loss: { icon: Minus, color: 'text-red-600', label: 'Perda' },
    refund: { icon: ArrowDownRight, color: 'text-blue-600', label: 'Reembolso' },
  };
  
  const config = typeConfig[transaction.type] || typeConfig.bet;
  const Icon = config.icon;
  
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full bg-gray-100 ${config.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="font-medium">{config.label}</p>
          <p className="text-sm text-gray-500">
            {transaction.description || new Date(transaction.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {transaction.amount >= 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-gray-500">
          Saldo: R$ {transaction.balance_after.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}

function SettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: BankrollSettings;
  onSave: (settings: BankrollSettings) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<BankrollSettings>(settings);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Configuracoes da Banca</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Metodo de Stake</label>
            <select
              value={formData.staking_method}
              onChange={(e) => setFormData({ ...formData, staking_method: e.target.value as 'fixed' | 'percentage' | 'kelly' })}
              className="w-full border rounded-lg px-3 py-2"
            >
              {STAKING_METHODS.map((method) => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>
          
          {formData.staking_method === 'fixed' && (
            <div>
              <label className="block text-sm font-medium mb-1">Stake Fixa (R$)</label>
              <input
                type="number"
                value={formData.fixed_stake || 100}
                onChange={(e) => setFormData({ ...formData, fixed_stake: parseFloat(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          )}
          
          {formData.staking_method === 'percentage' && (
            <div>
              <label className="block text-sm font-medium mb-1">Percentual da Banca (%)</label>
              <input
                type="number"
                step="0.1"
                value={(formData.percentage_stake || 2) * 100}
                onChange={(e) => setFormData({ ...formData, percentage_stake: parseFloat(e.target.value) / 100 })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          )}
          
          {formData.staking_method === 'kelly' && (
            <div>
              <label className="block text-sm font-medium mb-1">Fracao do Kelly</label>
              <input
                type="number"
                step="0.05"
                value={formData.kelly_fraction || 0.25}
                onChange={(e) => setFormData({ ...formData, kelly_fraction: parseFloat(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recomendado: 0.25 (1/4 Kelly) para menor volatilidade
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Stake Maxima (% da banca)</label>
            <input
              type="number"
              value={(formData.max_stake_percentage || 5)}
              onChange={(e) => setFormData({ ...formData, max_stake_percentage: parseFloat(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Stop Loss (%)</label>
            <input
              type="number"
              value={formData.stop_loss_percentage || 20}
              onChange={(e) => setFormData({ ...formData, stop_loss_percentage: parseFloat(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Alertar quando a banca cair este percentual
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Bankroll() {
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const { data: bankroll, isLoading: bankrollLoading } = useQuery<BankrollState>({
    queryKey: ['bankroll'],
    queryFn: async () => {
      const response = await getBankrollState();
      return response.data;
    },
  });
  
  const { data: transactions } = useQuery<BankrollTransaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await getBankrollTransactions({ limit: 20 });
      return response.data;
    },
  });
  
  const { data: settings } = useQuery<BankrollSettings>({
    queryKey: ['bankroll-settings'],
    queryFn: async () => {
      const response = await getBankrollSettings();
      return response.data;
    },
  });
  
  const { data: stats } = useQuery({
    queryKey: ['bankroll-stats'],
    queryFn: async () => {
      const response = await getBankrollStats('month');
      return response.data;
    },
  });
  
  const depositMutation = useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description?: string }) => {
      return deposit(amount, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowDepositModal(false);
      setAmount('');
      setDescription('');
    },
  });
  
  const withdrawMutation = useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description?: string }) => {
      return withdraw(amount, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowWithdrawModal(false);
      setAmount('');
      setDescription('');
    },
  });
  
  const settingsMutation = useMutation({
    mutationFn: updateBankrollSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll-settings'] });
      setShowSettings(false);
    },
  });
  
  const initMutation = useMutation({
    mutationFn: async (initialBalance: number) => {
      return initializeBankroll(initialBalance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankroll'] });
    },
  });
  
  if (bankrollLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!bankroll) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Wallet className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Inicialize sua Banca</h2>
          <p className="text-gray-500 mb-4">
            Configure o valor inicial da sua banca para comecar a gerenciar suas apostas.
          </p>
          <input
            type="number"
            placeholder="Valor inicial (R$)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 mb-4"
          />
          <button
            onClick={() => initMutation.mutate(parseFloat(amount))}
            disabled={!amount || initMutation.isPending}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            Inicializar Banca
          </button>
        </div>
      </div>
    );
  }
  
  const profitTrend = bankroll.total_profit >= 0 ? 'up' : 'down';
  
  // Mock data for chart - replace with real data
  const chartData = transactions?.slice(0, 10).reverse().map((t, i) => ({
    name: `${i + 1}`,
    balance: t.balance_after,
  })) || [];
  
  const pieData = [
    { name: 'Vitorias', value: stats?.total_wins || 0, color: '#22c55e' },
    { name: 'Derrotas', value: stats?.total_losses || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestao de Banca</h2>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <Settings className="w-4 h-4" />
          Configuracoes
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo Atual"
          value={`R$ ${bankroll.current_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={Wallet}
          color="blue"
        />
        <StatCard
          title="Lucro Total"
          value={`R$ ${bankroll.total_profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend={profitTrend}
          icon={profitTrend === 'up' ? TrendingUp : TrendingDown}
          color={profitTrend === 'up' ? 'green' : 'red'}
        />
        <StatCard
          title="ROI"
          value={`${bankroll.roi.toFixed(1)}%`}
          trend={profitTrend}
          icon={Target}
          color={profitTrend === 'up' ? 'green' : 'red'}
        />
        <StatCard
          title="Total Apostado"
          value={`R$ ${bankroll.total_wagered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={BarChart2}
          color="gray"
        />
      </div>
      
      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowDepositModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Depositar
        </button>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Minus className="w-4 h-4" />
          Sacar
        </button>
      </div>
      
      {/* Chart and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Evolucao da Banca</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Saldo']}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#4f46e5" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Resultados</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold">Historico de Transacoes</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="p-4">
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Nenhuma transacao registrada
            </p>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {showSettings && settings && (
        <SettingsModal
          settings={settings}
          onSave={(s) => settingsMutation.mutate(s)}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Depositar</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descricao (opcional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ex: Deposito mensal"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowDepositModal(false); setAmount(''); setDescription(''); }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => depositMutation.mutate({ amount: parseFloat(amount), description })}
                disabled={!amount || depositMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Depositar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Sacar</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="0.00"
                  max={bankroll.current_balance}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descricao (opcional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ex: Lucros do mes"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowWithdrawModal(false); setAmount(''); setDescription(''); }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => withdrawMutation.mutate({ amount: parseFloat(amount), description })}
                disabled={!amount || parseFloat(amount) > bankroll.current_balance || withdrawMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Sacar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
