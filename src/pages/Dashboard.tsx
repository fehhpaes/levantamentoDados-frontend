import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary, getTodayMatches, getLiveMatches, getPredictedValueBets } from '../services/api';
import {
  Calendar,
  Trophy,
  Users,
  Target,
  TrendingUp,
  Clock,
  Zap,
  RefreshCw,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { Card, CardHeader, StatCard } from '../components/ui/Card';
import { Badge, StatusBadge, ValueBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Form';
import { useLiveMatches } from '../hooks/useWebSocket';
import type { DashboardSummary, Match, ValueBet } from '../types';

function MatchCard({ match, isRealtime = false }: { match: Match; isRealtime?: boolean }) {
  const isLive = match.status === 'live' || match.status === 'halftime';
  const isFinished = match.status === 'finished';

  return (
    <Card className={`hover:shadow-md transition-shadow ${isRealtime ? 'ring-2 ring-green-400' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {match.league?.name || 'Liga'}
        </span>
        <StatusBadge 
          status={isLive ? 'live' : isFinished ? 'finished' : 'scheduled'} 
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {match.home_team?.name || 'Time Casa'}
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {match.home_score ?? '-'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {match.away_team?.name || 'Time Visitante'}
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {match.away_score ?? '-'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(match.match_date).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
        {isRealtime && (
          <span className="flex items-center text-green-600 dark:text-green-400">
            <Activity className="w-3 h-3 mr-1" />
            Realtime
          </span>
        )}
      </div>
    </Card>
  );
}

function ValueBetCard({ bet }: { bet: ValueBet }) {
  const matchInfo = bet.match_info as { home_team?: string; away_team?: string; league?: string };
  
  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {matchInfo.home_team} vs {matchInfo.away_team}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{matchInfo.league}</p>
          <div className="flex items-center gap-2">
            <Badge variant="primary">{bet.market}</Badge>
            <span className="text-sm font-medium dark:text-gray-200">{bet.selection}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{bet.bookmaker_odds.toFixed(2)}</p>
          <ValueBadge 
            value={bet.edge_percentage} 
            thresholds={{ low: 3, medium: 7, high: 12 }}
            suffix="% edge"
          />
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [realtimeMatches, setRealtimeMatches] = useState<Record<number, Match>>({});
  
  // WebSocket for live match updates
  const { status: wsStatus } = useLiveMatches((update) => {
    setRealtimeMatches((prev) => ({
      ...prev,
      [update.match_id]: {
        ...prev[update.match_id],
        id: update.match_id,
        home_score: update.home_score,
        away_score: update.away_score,
        status: update.status as Match['status'],
      } as Match,
    }));
  });

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await getDashboardSummary();
      return response.data;
    },
  });

  const { data: todayMatches, isLoading: todayLoading, refetch: refetchToday } = useQuery<Match[]>({
    queryKey: ['today-matches'],
    queryFn: async () => {
      const response = await getTodayMatches();
      return response.data;
    },
  });

  const { data: liveMatches, refetch: refetchLive } = useQuery<Match[]>({
    queryKey: ['live-matches'],
    queryFn: async () => {
      const response = await getLiveMatches();
      return response.data;
    },
    refetchInterval: 30000,
  });

  const { data: valueBets } = useQuery<ValueBet[]>({
    queryKey: ['top-value-bets'],
    queryFn: async () => {
      const response = await getPredictedValueBets(60, 5);
      return response.data;
    },
    refetchInterval: 60000,
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchToday();
    refetchLive();
  };

  // Merge realtime updates with fetched matches
  const getMatchWithRealtimeData = (match: Match): Match => {
    const realtimeData = realtimeMatches[match.id];
    if (realtimeData) {
      return { ...match, ...realtimeData };
    }
    return match;
  };

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with WebSocket Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overview of sports data and predictions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              wsStatus === 'connected' ? 'bg-green-500' : 
              wsStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-gray-500 dark:text-gray-400">
              {wsStatus === 'connected' ? 'Live' : wsStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Partidas"
          value={summary?.total_matches || 0}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Partidas Hoje"
          value={summary?.today_matches || 0}
          icon={Trophy}
          color="green"
        />
        <StatCard
          title="Ao Vivo"
          value={summary?.live_matches || 0}
          icon={TrendingUp}
          color="red"
        />
        <StatCard
          title="Times"
          value={summary?.total_teams || 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Ligas"
          value={summary?.total_leagues || 0}
          icon={Trophy}
          color="yellow"
        />
        <StatCard
          title="Previsoes"
          value={summary?.total_predictions || 0}
          icon={Target}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Matches & Today's Matches */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Matches */}
          {liveMatches && liveMatches.length > 0 && (
            <Card padding="none">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Partidas Ao Vivo</h3>
                </div>
                <Badge variant="danger">{liveMatches.length} live</Badge>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={getMatchWithRealtimeData(match)} 
                    isRealtime={!!realtimeMatches[match.id]}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Today's Matches */}
          <Card padding="none">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Partidas de Hoje</h3>
              {todayMatches && <Badge variant="default">{todayMatches.length} matches</Badge>}
            </div>
            <div className="p-4">
              {todayLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : todayMatches && todayMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayMatches.slice(0, 6).map((match) => (
                    <MatchCard 
                      key={match.id} 
                      match={getMatchWithRealtimeData(match)}
                      isRealtime={!!realtimeMatches[match.id]}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    Nenhuma partida hoje
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Nao ha partidas agendadas para hoje.
                  </p>
                </div>
              )}
              {todayMatches && todayMatches.length > 6 && (
                <div className="mt-4 text-center">
                  <a href="/matches" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                    Ver todas as {todayMatches.length} partidas
                    <ArrowUpRight className="inline w-4 h-4 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Value Bets Sidebar */}
        <div className="space-y-6">
          <Card padding="none">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Value Bets</h3>
              </div>
              <a href="/value-bets" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                Ver todos
              </a>
            </div>
            <div className="p-4 space-y-4">
              {valueBets && valueBets.length > 0 ? (
                valueBets.slice(0, 5).map((bet, index) => (
                  <ValueBetCard key={index} bet={bet} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No value bets found</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Stats Card */}
          <Card>
            <CardHeader title="Quick Stats" subtitle="Last 24 hours" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Predictions Made</span>
                <span className="font-semibold dark:text-gray-100">{summary?.total_predictions || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Matches Tracked</span>
                <span className="font-semibold dark:text-gray-100">{summary?.today_matches || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Leagues</span>
                <span className="font-semibold dark:text-gray-100">{summary?.total_leagues || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">WebSocket Status</span>
                <StatusBadge 
                  status={wsStatus === 'connected' ? 'active' : wsStatus === 'connecting' ? 'pending' : 'inactive'} 
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
