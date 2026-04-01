import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  RefreshCw, 
  Filter, 
  Bell, 
  BellOff,
  ArrowUpRight,
  DollarSign,
  Percent,
  Target,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, StatCard } from '../components/ui/Card';
import { Button, Input, Select, Toggle } from '../components/ui/Form';
import { Table, Pagination } from '../components/ui/Table';
import { Badge, ValueBadge } from '../components/ui/Badge';
import { getPredictedValueBets, getValueBets } from '../services/api';
import type { ValueBet } from '../types';

export default function ValueBets() {
  const [valueBets, setValueBets] = useState<ValueBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [minEdge, setMinEdge] = useState(5);
  const [minConfidence, setMinConfidence] = useState(60);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Real-time alerts
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [realtimeAlerts, setRealtimeAlerts] = useState<ValueBet[]>([]);

  // WebSocket disabled - Render free tier doesn't support WebSockets
  const wsStatus: string = 'disabled';

  useEffect(() => {
    loadValueBets();
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [minEdge, minConfidence]);

  const loadValueBets = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getPredictedValueBets(minConfidence, minEdge);
      setValueBets(response.data);
    } catch (err) {
      setError('Failed to load value bets');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter bets
  const filteredBets = valueBets.filter((bet) => {
    if (selectedMarket && bet.market !== selectedMarket) return false;
    // Add league filter when match_info includes league
    return true;
  });

  // Paginate
  const totalPages = Math.ceil(filteredBets.length / itemsPerPage);
  const paginatedBets = filteredBets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats calculations
  const totalBets = filteredBets.length;
  const avgEdge = totalBets > 0 
    ? filteredBets.reduce((sum, bet) => sum + bet.edge_percentage, 0) / totalBets 
    : 0;
  const avgConfidence = totalBets > 0 
    ? filteredBets.reduce((sum, bet) => sum + bet.confidence, 0) / totalBets 
    : 0;
  const avgEV = totalBets > 0 
    ? filteredBets.reduce((sum, bet) => sum + bet.expected_value, 0) / totalBets 
    : 0;

  const marketOptions = [
    { value: '', label: 'All Markets' },
    { value: '1X2', label: 'Match Result (1X2)' },
    { value: 'over_under', label: 'Over/Under' },
    { value: 'btts', label: 'Both Teams to Score' },
    { value: 'double_chance', label: 'Double Chance' },
    { value: 'asian_handicap', label: 'Asian Handicap' },
  ];

  const columns = [
    {
      key: 'match',
      header: 'Match',
      render: (bet: ValueBet) => (
        <div>
          <div className="font-medium text-gray-900">
            {(bet.match_info as { home_team?: string; away_team?: string })?.home_team || 'TBD'} vs {(bet.match_info as { home_team?: string; away_team?: string })?.away_team || 'TBD'}
          </div>
          <div className="text-xs text-gray-500">
            {(bet.match_info as { league?: string })?.league || 'Unknown League'}
          </div>
        </div>
      ),
    },
    {
      key: 'market',
      header: 'Market',
      render: (bet: ValueBet) => (
        <Badge variant="default">{bet.market}</Badge>
      ),
    },
    {
      key: 'selection',
      header: 'Selection',
      render: (bet: ValueBet) => (
        <span className="font-medium">{bet.selection}</span>
      ),
    },
    {
      key: 'odds',
      header: 'Odds',
      render: (bet: ValueBet) => (
        <div>
          <div className="font-bold text-lg text-primary-600">
            {bet.bookmaker_odds.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">{bet.bookmaker_name}</div>
        </div>
      ),
    },
    {
      key: 'edge',
      header: 'Edge',
      render: (bet: ValueBet) => (
        <ValueBadge 
          value={bet.edge_percentage} 
          thresholds={{ low: 3, medium: 7, high: 12 }}
          suffix="%"
        />
      ),
    },
    {
      key: 'confidence',
      header: 'Confidence',
      render: (bet: ValueBet) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className={`h-2 rounded-full ${
                bet.confidence >= 80 ? 'bg-green-500' :
                bet.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${bet.confidence}%` }}
            />
          </div>
          <span className="text-sm">{bet.confidence.toFixed(0)}%</span>
        </div>
      ),
    },
    {
      key: 'ev',
      header: 'Expected Value',
      render: (bet: ValueBet) => (
        <span className={`font-medium ${bet.expected_value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {bet.expected_value >= 0 ? '+' : ''}{bet.expected_value.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'prob',
      header: 'Predicted Prob',
      render: (bet: ValueBet) => (
        <span>{(bet.predicted_prob * 100).toFixed(1)}%</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Value Bets</h1>
            <p className="text-sm text-gray-500">AI-powered betting opportunities with positive expected value</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* WebSocket Status */}
          <div className="flex items-center text-sm">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              wsStatus === 'connected' ? 'bg-green-500' : 
              wsStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-gray-500">
              {wsStatus === 'connected' ? 'Live' : wsStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
          </div>
          
          {/* Alerts Toggle */}
          <Button
            variant={alertsEnabled ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            leftIcon={alertsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          >
            {alertsEnabled ? 'Alerts On' : 'Alerts Off'}
          </Button>
          
          <Button
            variant="outline"
            onClick={loadValueBets}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Value Bets"
          value={totalBets}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Average Edge"
          value={`${avgEdge.toFixed(1)}%`}
          icon={Percent}
          color="green"
        />
        <StatCard
          title="Avg Confidence"
          value={`${avgConfidence.toFixed(0)}%`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Avg Expected Value"
          value={avgEV >= 0 ? `+${avgEV.toFixed(2)}` : avgEV.toFixed(2)}
          icon={DollarSign}
          color={avgEV >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Real-time Alerts Section */}
      {realtimeAlerts.length > 0 && (
        <Card>
          <CardHeader 
            title="Real-time Alerts" 
            subtitle="Latest value bet opportunities"
            action={
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setRealtimeAlerts([])}
              >
                Clear
              </Button>
            }
          />
          <div className="space-y-2">
            {realtimeAlerts.slice(0, 5).map((alert, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {(alert.match_info as { home_team?: string; away_team?: string })?.home_team} vs {(alert.match_info as { home_team?: string; away_team?: string })?.away_team}
                    </p>
                    <p className="text-sm text-gray-600">
                      {alert.selection} @ {alert.bookmaker_odds.toFixed(2)} ({alert.bookmaker_name})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <ValueBadge 
                    value={alert.edge_percentage} 
                    thresholds={{ low: 3, medium: 7, high: 12 }}
                    suffix="% edge"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Just now
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader 
          title="Filters" 
          subtitle="Refine your value bet search"
          action={<Filter className="h-5 w-5 text-gray-400" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Edge (%)
            </label>
            <Input
              type="number"
              value={minEdge}
              onChange={(e) => setMinEdge(parseFloat(e.target.value) || 0)}
              min={0}
              max={50}
              step={0.5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Confidence (%)
            </label>
            <Input
              type="number"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value) || 0)}
              min={0}
              max={100}
              step={5}
            />
          </div>
          <Select
            label="Market Type"
            options={marketOptions}
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
          />
          <div className="flex items-end">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setMinEdge(5);
                setMinConfidence(60);
                setSelectedMarket('');
                setSelectedLeague('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Value Bets Table */}
      <Card padding="none">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Value Bet Opportunities</h3>
          <p className="text-sm text-gray-500">
            Showing {paginatedBets.length} of {filteredBets.length} bets
          </p>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            <p className="mt-2 text-gray-500">Loading value bets...</p>
          </div>
        ) : filteredBets.length === 0 ? (
          <div className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-2 text-gray-500">No value bets found with current filters</p>
            <p className="text-sm text-gray-400">Try adjusting your minimum edge or confidence settings</p>
          </div>
        ) : (
          <>
            <Table
              data={paginatedBets}
              columns={columns}
              onRowClick={(bet) => {
                // Navigate to match details or open modal
                console.log('Clicked bet:', bet);
              }}
            />
            {totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredBets.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Tips Section */}
      <Card>
        <CardHeader 
          title="Value Betting Tips" 
          subtitle="Maximize your edge with these guidelines"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Edge Threshold</h4>
            <p className="text-sm text-blue-700">
              Bets with 5%+ edge offer the best long-term value. Higher edge = more potential profit, but consider liquidity.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Confidence Score</h4>
            <p className="text-sm text-green-700">
              Higher confidence indicates stronger model predictions. Prioritize bets with 70%+ confidence for stability.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Bankroll Management</h4>
            <p className="text-sm text-purple-700">
              Use Kelly Criterion or flat staking. Never bet more than 5% of bankroll on a single bet.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
