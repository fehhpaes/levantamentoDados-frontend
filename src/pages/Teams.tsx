import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTeams, getTeamStats } from '../services/api';
import { Users, Search, Trophy, Target, TrendingUp } from 'lucide-react';
import type { Team, TeamStats } from '../types';

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ['teams', searchTerm],
    queryFn: async () => {
      const response = await getTeams(undefined, searchTerm || undefined);
      return response.data;
    },
  });

  const { data: teamStats, isLoading: statsLoading } = useQuery<TeamStats>({
    queryKey: ['team-stats', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return null;
      const response = await getTeamStats(selectedTeamId);
      return response.data;
    },
    enabled: !!selectedTeamId,
  });

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar times..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : teams && teams.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      J
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      V
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      D
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GP
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GC
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pts
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.map((team) => (
                    <tr
                      key={team.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedTeamId === team.id ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => setSelectedTeamId(team.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {team.logo_url ? (
                            <img
                              src={team.logo_url}
                              alt={team.name}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {team.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {team.short_name || team.country || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {team.matches_played}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                        {team.wins}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {team.draws}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">
                        {team.losses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {team.goals_for}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {team.goals_against}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                        {team.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhum time encontrado
              </h3>
            </div>
          )}
        </div>

        {/* Team Stats */}
        <div className="lg:col-span-1">
          {selectedTeamId ? (
            statsLoading ? (
              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : teamStats ? (
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {teamStats.team.name}
                    </h3>
                    <p className="text-sm text-gray-500">Estatisticas</p>
                  </div>
                </div>

                {/* Overall Stats */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Geral</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500">Taxa Vitoria</p>
                      <p className="text-xl font-bold text-green-600">
                        {teamStats.overall.win_rate}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500">Saldo Gols</p>
                      <p className={`text-xl font-bold ${
                        teamStats.overall.goal_difference >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {teamStats.overall.goal_difference >= 0 ? '+' : ''}{teamStats.overall.goal_difference}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500">Media Gols Feitos</p>
                      <p className="text-xl font-bold text-gray-900">
                        {teamStats.overall.avg_goals_for}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500">Media Gols Sofridos</p>
                      <p className="text-xl font-bold text-gray-900">
                        {teamStats.overall.avg_goals_against}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trends */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Tendencias</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Over 2.5</span>
                      <span className="font-medium text-gray-900">
                        {teamStats.trends.over_2_5_percentage}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ambos Marcam</span>
                      <span className="font-medium text-gray-900">
                        {teamStats.trends.btts_percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Selecione um time
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Clique em um time para ver as estatisticas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
