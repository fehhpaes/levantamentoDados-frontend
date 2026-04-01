import axios from 'axios';
import type { 
  BacktestStrategy, 
  BankrollSettings, 
  ExportConfig, 
  UserSettings,
  NotificationPreferences,
  NotificationType,
  NotificationChannel
} from '../types';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (storedRefreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: storedRefreshToken,
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication
export const login = (email: string, password: string) => 
  api.post('/auth/login', { email, password });
export const logout = () => api.post('/auth/logout');
export const register = (email: string, password: string, username: string) =>
  api.post('/auth/register', { email, password, username });
export const getCurrentUser = () => api.get('/auth/me');
export const refreshToken = (refresh_token: string) => 
  api.post('/auth/refresh', { refresh_token });
export const changePassword = (currentPassword: string, newPassword: string) =>
  api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword });

// User Settings
export const getUserSettings = () => api.get('/settings/');
export const updateUserSettings = (settings: Partial<UserSettings>) => 
  api.put('/settings/', settings);
export const getNotificationSettings = () => api.get('/settings/notifications');
export const updateNotificationSettings = (settings: Record<string, boolean>) =>
  api.put('/settings/notifications', settings);

// Sports & Leagues
export const getSports = () => api.get('/sports/');
export const getLeagues = (sportId?: number) => 
  api.get('/sports/leagues/', { params: { sport_id: sportId } });
export const getTeams = (leagueId?: number, search?: string) => 
  api.get('/sports/teams/', { params: { league_id: leagueId, search } });

// Matches
export const getMatches = (params?: {
  league_id?: number;
  team_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}) => api.get('/matches/', { params });
export const getLiveMatches = () => api.get('/matches/live');
export const getTodayMatches = () => api.get('/matches/today');
export const getMatchDetails = (matchId: number) => api.get(`/matches/${matchId}`);

// Odds
export const getMatchOdds = (matchId: number, marketType?: string) => 
  api.get(`/odds/match/${matchId}`, { params: { market_type: marketType } });
export const getOddsComparison = (matchId: number, marketType?: string) => 
  api.get(`/odds/match/${matchId}/comparison`, { params: { market_type: marketType } });
export const getValueBets = (minEdge?: number) => 
  api.get('/odds/value-bets', { params: { min_edge: minEdge } });

// Predictions
export const getMatchPredictions = (matchId: number) => 
  api.get(`/predictions/match/${matchId}`);
export const getPredictedValueBets = (minConfidence?: number, minEdge?: number) =>
  api.get('/predictions/value-bets', { params: { min_confidence: minConfidence, min_edge: minEdge } });
export const getModelPerformance = () => 
  api.get('/predictions/models/performance');

// Analytics
export const getDashboardSummary = () => api.get('/analytics/dashboard/summary');
export const getTeamStats = (teamId: number, lastNMatches?: number) => 
  api.get(`/analytics/team/${teamId}/stats`, { params: { last_n_matches: lastNMatches } });
export const getLeagueStandings = (leagueId: number) => 
  api.get(`/analytics/league/${leagueId}/standings`);
export const getTopScorers = (leagueId: number, limit?: number) => 
  api.get(`/analytics/league/${leagueId}/top-scorers`, { params: { limit } });
export const getMarketAnalysis = (leagueId?: number, days?: number) => 
  api.get('/analytics/odds/market-analysis', { params: { league_id: leagueId, days } });

// Backtesting
export const getStrategies = () => api.get('/backtesting/strategies');
export const getStrategy = (strategyId: number) => api.get(`/backtesting/strategies/${strategyId}`);
export const createStrategy = (strategy: BacktestStrategy) => 
  api.post('/backtesting/strategies', strategy);
export const updateStrategy = (strategyId: number, strategy: Partial<BacktestStrategy>) => 
  api.patch(`/backtesting/strategies/${strategyId}`, strategy);
export const deleteStrategy = (strategyId: number) => 
  api.delete(`/backtesting/strategies/${strategyId}`);
export const runBacktest = (strategyId: number, params: {
  league_id?: number;
  date_from?: string;
  date_to?: string;
}) => api.post(`/backtesting/run/${strategyId}`, params);
export const getBacktestResults = (strategyId?: number) => 
  api.get('/backtesting/results', { params: { strategy_id: strategyId } });
export const getBacktestResult = (resultId: number) => 
  api.get(`/backtesting/results/${resultId}`);
export const compareStrategies = (strategyIds: number[], params: {
  league_id?: number;
  date_from?: string;
  date_to?: string;
}) => api.post('/backtesting/compare', { strategy_ids: strategyIds, ...params });

// Bankroll Management
export const getBankrollState = () => api.get('/bankroll/');
export const initializeBankroll = (initialBalance: number) => 
  api.post('/bankroll/initialize', { initial_balance: initialBalance });
export const deposit = (amount: number, description?: string) => 
  api.post('/bankroll/deposit', { amount, description });
export const withdraw = (amount: number, description?: string) => 
  api.post('/bankroll/withdraw', { amount, description });
export const getBankrollTransactions = (params?: {
  type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}) => api.get('/bankroll/transactions', { params });
export const getBankrollSettings = () => api.get('/bankroll/settings');
export const updateBankrollSettings = (settings: BankrollSettings) => 
  api.put('/bankroll/settings', settings);
export const calculateStake = (odds: number, confidence: number) => 
  api.post('/bankroll/calculate-stake', { odds, confidence });
export const getBankrollStats = (period?: 'day' | 'week' | 'month' | 'year' | 'all') => 
  api.get('/bankroll/stats', { params: { period } });

// Data Export
export const exportData = (config: ExportConfig) => 
  api.post('/export/', config);
export const getExportJobs = () => api.get('/export/jobs');
export const getExportJob = (jobId: string) => api.get(`/export/jobs/${jobId}`);
export const downloadExport = (jobId: string) => 
  api.get(`/export/download/${jobId}`, { responseType: 'blob' });
export const getExportFormats = () => api.get('/export/formats');

// Notifications
export const getNotificationPreferences = () => api.get('/notifications/preferences');
export const updateNotificationPreferences = (preferences: Partial<NotificationPreferences>) =>
  api.put('/notifications/preferences', preferences);
export const resetNotificationPreferences = () => api.post('/notifications/preferences/reset');

// Telegram linking
export const linkTelegram = () => api.post('/notifications/telegram/link');
export const unlinkTelegram = () => api.delete('/notifications/telegram/unlink');

// Notification history
export const getNotifications = (params?: {
  page?: number;
  page_size?: number;
  notification_type?: NotificationType;
  channel?: NotificationChannel;
  status?: string;
  unread_only?: boolean;
}) => api.get('/notifications/', { params });
export const getNotification = (notificationId: number) => 
  api.get(`/notifications/${notificationId}`);
export const markNotificationRead = (notificationId: number) =>
  api.post(`/notifications/${notificationId}/read`);
export const markAllNotificationsRead = () => api.post('/notifications/mark-all-read');
export const deleteNotification = (notificationId: number) =>
  api.delete(`/notifications/${notificationId}`);
export const deleteAllNotifications = (olderThanDays?: number) =>
  api.delete('/notifications/', { params: { older_than_days: olderThanDays } });
export const getNotificationStats = () => api.get('/notifications/stats');

export default api;
