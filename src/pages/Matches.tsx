import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMatches, getLeagues } from '../services/api';
import { Calendar, Clock, Filter, RefreshCw, Eye } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Table, Pagination } from '../components/ui/Table';
import { Select, Button } from '../components/ui/Form';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import type { Match, League } from '../types';

export default function Matches() {
  const [leagueFilter, setLeagueFilter] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const itemsPerPage = 20;

  const { data: leagues } = useQuery<League[]>({
    queryKey: ['leagues'],
    queryFn: async () => {
      const response = await getLeagues();
      return response.data;
    },
  });

  const { data: matches, isLoading, refetch } = useQuery<Match[]>({
    queryKey: ['matches', leagueFilter, statusFilter],
    queryFn: async () => {
      const response = await getMatches({
        league_id: leagueFilter,
        status: statusFilter || undefined,
      });
      return response.data;
    },
  });

  // Pagination
  const totalPages = matches ? Math.ceil(matches.length / itemsPerPage) : 0;
  const paginatedMatches = matches?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const leagueOptions = [
    { value: '', label: 'Todas as Ligas' },
    ...(leagues?.map((league) => ({ value: league.id.toString(), label: league.name })) || []),
  ];

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'scheduled', label: 'Agendado' },
    { value: 'live', label: 'Ao Vivo' },
    { value: 'halftime', label: 'Intervalo' },
    { value: 'finished', label: 'Finalizado' },
    { value: 'postponed', label: 'Adiado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  const columns = [
    {
      key: 'league',
      header: 'Liga',
      render: (match: Match) => (
        <span className="text-sm text-gray-600">{match.league?.name || '-'}</span>
      ),
    },
    {
      key: 'match',
      header: 'Partida',
      render: (match: Match) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {match.home_team?.logo_url && (
              <img src={match.home_team.logo_url} alt="" className="w-5 h-5" />
            )}
            <span className="text-sm font-medium text-gray-900">
              {match.home_team?.name || 'Time Casa'}
            </span>
          </div>
          <span className="text-xs text-gray-400 my-0.5">vs</span>
          <div className="flex items-center gap-2">
            {match.away_team?.logo_url && (
              <img src={match.away_team.logo_url} alt="" className="w-5 h-5" />
            )}
            <span className="text-sm font-medium text-gray-900">
              {match.away_team?.name || 'Time Visitante'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'score',
      header: 'Placar',
      render: (match: Match) => (
        <div className="text-center">
          <span className="text-xl font-bold text-gray-900">
            {match.home_score ?? '-'} x {match.away_score ?? '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'datetime',
      header: 'Data/Hora',
      render: (match: Match) => (
        <div className="text-sm text-gray-500">
          <div className="flex items-center mb-1">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(match.match_date).toLocaleDateString('pt-BR')}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {new Date(match.match_date).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'round',
      header: 'Rodada',
      render: (match: Match) => (
        <span className="text-sm text-gray-600">{match.round || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (match: Match) => (
        <StatusBadge status={match.status} />
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (match: Match) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMatch(match);
          }}
          leftIcon={<Eye className="w-4 h-4" />}
        >
          Detalhes
        </Button>
      ),
    },
  ];

  const handleResetFilters = () => {
    setLeagueFilter(undefined);
    setStatusFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partidas</h1>
          <p className="text-sm text-gray-500">
            {matches ? `${matches.length} partidas encontradas` : 'Carregando...'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader 
          title="Filtros" 
          action={<Filter className="w-5 h-5 text-gray-400" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Liga"
            options={leagueOptions}
            value={leagueFilter?.toString() || ''}
            onChange={(e) => {
              setLeagueFilter(e.target.value ? Number(e.target.value) : undefined);
              setCurrentPage(1);
            }}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="sm:col-span-2 flex items-end">
            <Button variant="outline" onClick={handleResetFilters}>
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Status Filters */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant={statusFilter === '' ? 'primary' : 'default'}
          className="cursor-pointer"
          onClick={() => setStatusFilter('')}
        >
          Todos
        </Badge>
        <Badge 
          variant={statusFilter === 'live' ? 'danger' : 'default'}
          className="cursor-pointer"
          onClick={() => setStatusFilter('live')}
        >
          Ao Vivo
        </Badge>
        <Badge 
          variant={statusFilter === 'scheduled' ? 'primary' : 'default'}
          className="cursor-pointer"
          onClick={() => setStatusFilter('scheduled')}
        >
          Agendados
        </Badge>
        <Badge 
          variant={statusFilter === 'finished' ? 'success' : 'default'}
          className="cursor-pointer"
          onClick={() => setStatusFilter('finished')}
        >
          Finalizados
        </Badge>
      </div>

      {/* Matches Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-12 w-12 animate-spin text-gray-400" />
          </div>
        ) : paginatedMatches && paginatedMatches.length > 0 ? (
          <>
            <Table
              data={paginatedMatches}
              columns={columns}
              onRowClick={(match) => setSelectedMatch(match)}
            />
            {totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={matches?.length || 0}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhuma partida encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Tente ajustar os filtros para ver mais resultados.
            </p>
          </div>
        )}
      </Card>

      {/* Match Details Modal */}
      <Modal
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        title="Detalhes da Partida"
        size="lg"
      >
        {selectedMatch && (
          <div className="space-y-6">
            {/* Match Header */}
            <div className="text-center">
              <Badge variant="default" className="mb-4">
                {selectedMatch.league?.name}
              </Badge>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  {selectedMatch.home_team?.logo_url && (
                    <img 
                      src={selectedMatch.home_team.logo_url} 
                      alt={selectedMatch.home_team.name} 
                      className="w-16 h-16 mx-auto mb-2"
                    />
                  )}
                  <p className="font-semibold text-gray-900">
                    {selectedMatch.home_team?.name}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">
                    {selectedMatch.home_score ?? '-'} x {selectedMatch.away_score ?? '-'}
                  </p>
                  <StatusBadge status={selectedMatch.status} className="mt-2" />
                </div>
                <div className="text-center">
                  {selectedMatch.away_team?.logo_url && (
                    <img 
                      src={selectedMatch.away_team.logo_url} 
                      alt={selectedMatch.away_team.name} 
                      className="w-16 h-16 mx-auto mb-2"
                    />
                  )}
                  <p className="font-semibold text-gray-900">
                    {selectedMatch.away_team?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Match Info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-medium">
                  {new Date(selectedMatch.match_date).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Horário</p>
                <p className="font-medium">
                  {new Date(selectedMatch.match_date).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {selectedMatch.round && (
                <div>
                  <p className="text-sm text-gray-500">Rodada</p>
                  <p className="font-medium">{selectedMatch.round}</p>
                </div>
              )}
              {selectedMatch.venue && (
                <div>
                  <p className="text-sm text-gray-500">Local</p>
                  <p className="font-medium">{selectedMatch.venue}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedMatch(null)}
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  window.location.href = `/odds?match_id=${selectedMatch.id}`;
                }}
              >
                Ver Odds
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  window.location.href = `/predictions?match_id=${selectedMatch.id}`;
                }}
              >
                Ver Previsões
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
