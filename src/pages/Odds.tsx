import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getValueBets, getMatchOdds, getOddsComparison, getTodayMatches } from '../services/api';
import { 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  RefreshCw, 
  Filter,
  ArrowUpDown,
  BarChart2,
  Zap
} from 'lucide-react';
import { Card, CardHeader, StatCard } from '../components/ui/Card';
import { Table, Pagination } from '../components/ui/Table';
import { Select, Button, Input } from '../components/ui/Form';
import { Badge, ValueBadge, StatusBadge } from '../components/ui/Badge';
import { useOddsUpdates } from '../hooks/useWebSocket';
import type { Match, Odds } from '../types';

interface OddsData {
  match_id: number;
  bookmaker: string;
  market_type: string;
  home_odds?: number;
  draw_odds?: number;
  away_odds?: number;
  over_odds?: number;
  under_odds?: number;
  line?: number;
  edge_percentage?: number;
  is_value_bet?: boolean;
}

export default function OddsPage() {
  const [searchParams] = useSearchParams();
  const matchIdParam = searchParams.get('match_id');
  
  const [selectedMatch, setSelectedMatch] = useState<number | undefined>(
    matchIdParam ? parseInt(matchIdParam) : undefined
  );
  const [marketFilter, setMarketFilter] = useState<string>('');
  const [minEdge, setMinEdge] = useState<number>(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [realtimeOdds, setRealtimeOdds] = useState<Record<string, OddsData>>({});
  const itemsPerPage = 20;

  // WebSocket for real-time odds updates
  const { status: wsStatus } = useOddsUpdates(selectedMatch, (update) => {
    const key = `${update.match_id}-${update.bookmaker_id}-${update.market_type}`;
    setRealtimeOdds((prev) => ({
      ...prev,
      [key]: {
        match_id: update.match_id,
        bookmaker: `Bookmaker ${update.bookmaker_id}`,
        market_type: update.market_type,
        home_odds: update.odds.home,
        draw_odds: update.odds.draw,
        away_odds: update.odds.away,
        over_odds: update.odds.over,
        under_odds: update.odds.under,
        line: update.odds.line,
        edge_percentage: update.value_percentage,
        is_value_bet: update.is_value_bet,
      },
    }));
  });

  const { data: matches } = useQuery<Match[]>({
    queryKey: ['today-matches-for-odds'],
    queryFn: async () => {
      const response = await getTodayMatches();
      return response.data;
    },
  });

  const { data: valueBets, isLoading: valueBetsLoading, refetch } = useQuery({
    queryKey: ['value-bets', minEdge],
    queryFn: async () => {
      const response = await getValueBets(minEdge);
      return response.data as OddsData[];
    },
  });

  const { data: matchOdds, isLoading: matchOddsLoading } = useQuery({
    queryKey: ['match-odds', selectedMatch, marketFilter],
    queryFn: async () => {
      if (!selectedMatch) return [];
      const response = await getMatchOdds(selectedMatch, marketFilter || undefined);
      return response.data as OddsData[];
    },
    enabled: !!selectedMatch,
  });

  const { data: oddsComparison } = useQuery({
    queryKey: ['odds-comparison', selectedMatch],
    queryFn: async () => {
      if (!selectedMatch) return null;
      const response = await getOddsComparison(selectedMatch);
      return response.data;
    },
    enabled: !!selectedMatch,
  });

  // Calculate stats
  const totalValueBets = valueBets?.filter((bet) => bet.is_value_bet).length || 0;
  const avgEdge = valueBets && valueBets.length > 0
    ? valueBets.reduce((sum, bet) => sum + (bet.edge_percentage || 0), 0) / valueBets.length
    : 0;

  // Pagination
  const currentData = selectedMatch ? matchOdds : valueBets;
  const totalPages = currentData ? Math.ceil(currentData.length / itemsPerPage) : 0;
  const paginatedData = currentData?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const marketOptions = [
    { value: '', label: 'Todos os Mercados' },
    { value: '1X2', label: 'Match Result (1X2)' },
    { value: 'over_under', label: 'Over/Under' },
    { value: 'btts', label: 'Both Teams to Score' },
    { value: 'double_chance', label: 'Double Chance' },
    { value: 'asian_handicap', label: 'Asian Handicap' },
  ];

  const matchOptions = [
    { value: '', label: 'Selecione uma partida' },
    ...(matches?.map((match) => ({
      value: match.id.toString(),
      label: `${match.home_team?.name || 'Home'} vs ${match.away_team?.name || 'Away'}`,
    })) || []),
  ];

  const columns = [
    {
      key: 'match',
      header: 'Match ID',
      render: (odds: OddsData) => (
        <span className="font-medium">#{odds.match_id}</span>
      ),
    },
    {
      key: 'bookmaker',
      header: 'Bookmaker',
      render: (odds: OddsData) => (
        <Badge variant="default">{odds.bookmaker}</Badge>
      ),
    },
    {
      key: 'market',
      header: 'Mercado',
      render: (odds: OddsData) => (
        <span className="text-sm">{odds.market_type}</span>
      ),
    },
    {
      key: 'odds',
      header: 'Odds',
      render: (odds: OddsData) => (
        <div className="flex gap-2">
          {odds.home_odds && (
            <div className="text-center">
              <p className="text-xs text-gray-500">1</p>
              <p className="font-bold text-primary-600">{odds.home_odds.toFixed(2)}</p>
            </div>
          )}
          {odds.draw_odds && (
            <div className="text-center">
              <p className="text-xs text-gray-500">X</p>
              <p className="font-bold text-gray-700">{odds.draw_odds.toFixed(2)}</p>
            </div>
          )}
          {odds.away_odds && (
            <div className="text-center">
              <p className="text-xs text-gray-500">2</p>
              <p className="font-bold text-primary-600">{odds.away_odds.toFixed(2)}</p>
            </div>
          )}
          {odds.over_odds && (
            <div className="text-center">
              <p className="text-xs text-gray-500">Over {odds.line}</p>
              <p className="font-bold text-green-600">{odds.over_odds.toFixed(2)}</p>
            </div>
          )}
          {odds.under_odds && (
            <div className="text-center">
              <p className="text-xs text-gray-500">Under {odds.line}</p>
              <p className="font-bold text-red-600">{odds.under_odds.toFixed(2)}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'edge',
      header: 'Edge',
      render: (odds: OddsData) => (
        odds.edge_percentage ? (
          <ValueBadge 
            value={odds.edge_percentage} 
            thresholds={{ low: 3, medium: 7, high: 12 }}
            suffix="%"
          />
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'value',
      header: 'Value Bet',
      render: (odds: OddsData) => (
        odds.is_value_bet ? (
          <Badge variant="success">
            <Zap className="w-3 h-3 mr-1" />
            Value
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Odds & Value Bets</h1>
          <p className="text-sm text-gray-500">
            Compare odds across bookmakers and find value betting opportunities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              wsStatus === 'connected' ? 'bg-green-500' : 
              wsStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-gray-500">
              {wsStatus === 'connected' ? 'Live Updates' : 'Offline'}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={valueBetsLoading}
            leftIcon={<RefreshCw className={`h-4 w-4 ${valueBetsLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Value Bets Found"
          value={totalValueBets}
          icon={Zap}
          color="green"
        />
        <StatCard
          title="Average Edge"
          value={`${avgEdge.toFixed(1)}%`}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Bookmakers Tracked"
          value={new Set(valueBets?.map(b => b.bookmaker)).size || 0}
          icon={BarChart2}
          color="purple"
        />
        <StatCard
          title="Markets Analyzed"
          value={new Set(valueBets?.map(b => b.market_type)).size || 0}
          icon={ArrowUpDown}
          color="indigo"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader 
          title="Filtros" 
          action={<Filter className="w-5 h-5 text-gray-400" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Partida"
            options={matchOptions}
            value={selectedMatch?.toString() || ''}
            onChange={(e) => {
              setSelectedMatch(e.target.value ? parseInt(e.target.value) : undefined);
              setCurrentPage(1);
            }}
          />
          <Select
            label="Mercado"
            options={marketOptions}
            value={marketFilter}
            onChange={(e) => {
              setMarketFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Input
            label="Edge Mínimo (%)"
            type="number"
            value={minEdge}
            onChange={(e) => setMinEdge(parseFloat(e.target.value) || 0)}
            min={0}
            max={50}
            step={0.5}
          />
          <div className="flex items-end">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setSelectedMatch(undefined);
                setMarketFilter('');
                setMinEdge(3);
                setCurrentPage(1);
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Odds Comparison (when match selected) */}
      {selectedMatch && oddsComparison && (
        <Card>
          <CardHeader 
            title="Comparação de Odds" 
            subtitle="Best odds across bookmakers"
          />
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Best Home Odds</p>
              <p className="text-2xl font-bold text-blue-600">
                {oddsComparison.best_home_odds?.toFixed(2) || '-'}
              </p>
              <p className="text-xs text-gray-500">{oddsComparison.best_home_bookmaker || ''}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Best Draw Odds</p>
              <p className="text-2xl font-bold text-gray-600">
                {oddsComparison.best_draw_odds?.toFixed(2) || '-'}
              </p>
              <p className="text-xs text-gray-500">{oddsComparison.best_draw_bookmaker || ''}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Best Away Odds</p>
              <p className="text-2xl font-bold text-green-600">
                {oddsComparison.best_away_odds?.toFixed(2) || '-'}
              </p>
              <p className="text-xs text-gray-500">{oddsComparison.best_away_bookmaker || ''}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Odds Table */}
      <Card padding="none">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedMatch ? 'Odds da Partida' : 'Value Bets'}
            </h3>
            <p className="text-sm text-gray-500">
              {paginatedData?.length || 0} de {currentData?.length || 0} resultados
            </p>
          </div>
          {!selectedMatch && (
            <a href="/value-bets" className="text-sm text-primary-600 hover:text-primary-700">
              Ver análise completa
            </a>
          )}
        </div>

        {valueBetsLoading || matchOddsLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-12 w-12 animate-spin text-gray-400" />
          </div>
        ) : paginatedData && paginatedData.length > 0 ? (
          <>
            <Table
              data={paginatedData}
              columns={columns}
            />
            {totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={currentData?.length || 0}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {selectedMatch ? 'Nenhuma odd encontrada' : 'Nenhum value bet encontrado'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedMatch 
                ? 'Não foram encontradas odds para esta partida.'
                : 'Não foram identificadas apostas com valor no momento. Tente reduzir o edge mínimo.'
              }
            </p>
          </div>
        )}
      </Card>

      {/* Real-time Updates Indicator */}
      {Object.keys(realtimeOdds).length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700">
              {Object.keys(realtimeOdds).length} odds atualizadas em tempo real
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
