// Common types
export interface Sport {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

export interface League {
  id: number;
  sport_id: number;
  name: string;
  slug: string;
  country?: string;
  country_code?: string;
  logo_url?: string;
  season?: string;
  is_active: boolean;
}

export interface Team {
  id: number;
  league_id?: number;
  name: string;
  short_name?: string;
  slug: string;
  logo_url?: string;
  country?: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

export interface Match {
  id: number;
  league_id: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  status: MatchStatus;
  round?: string;
  venue?: string;
  home_score?: number;
  away_score?: number;
  home_team?: { id: number; name: string; logo_url?: string };
  away_team?: { id: number; name: string; logo_url?: string };
  league?: { id: number; name: string };
}

export type MatchStatus = 
  | 'scheduled' 
  | 'live' 
  | 'halftime' 
  | 'finished' 
  | 'postponed' 
  | 'cancelled' 
  | 'suspended';

export interface Odds {
  id: number;
  match_id: number;
  bookmaker_id: number;
  market_type: string;
  home_odds?: number;
  draw_odds?: number;
  away_odds?: number;
  over_odds?: number;
  under_odds?: number;
  line?: number;
  is_value_bet: boolean;
  value_percentage?: number;
  bookmaker?: Bookmaker;
}

export interface Bookmaker {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
}

export interface Prediction {
  id: number;
  match_id: number;
  model_name: string;
  home_win_prob?: number;
  draw_prob?: number;
  away_win_prob?: number;
  predicted_home_score?: number;
  predicted_away_score?: number;
  confidence_score?: number;
  recommended_bet?: string;
  expected_value?: number;
}

export interface DashboardSummary {
  total_matches: number;
  today_matches: number;
  live_matches: number;
  total_teams: number;
  total_leagues: number;
  total_predictions: number;
}

export interface TeamStats {
  team: {
    id: number;
    name: string;
    logo_url?: string;
  };
  overall: {
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    avg_goals_for: number;
    avg_goals_against: number;
    win_rate: number;
  };
  home: {
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
  };
  away: {
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
  };
  trends: {
    over_2_5_percentage: number;
    btts_percentage: number;
  };
}

export interface ValueBet {
  match_id: number;
  match_info: Record<string, unknown>;
  market: string;
  selection: string;
  predicted_prob: number;
  bookmaker_odds: number;
  bookmaker_name: string;
  edge_percentage: number;
  expected_value: number;
  confidence: number;
}

// Backtesting types
export interface BacktestStrategy {
  id?: number;
  name: string;
  strategy_type: StrategyType;
  min_edge: number;
  min_odds: number;
  max_odds: number;
  min_confidence: number;
  base_stake: number;
  stake_percentage?: number;
  kelly_fraction?: number;
  max_stake: number;
  markets: string[];
}

export type StrategyType = 
  | 'value_betting'
  | 'arbitrage'
  | 'kelly_criterion'
  | 'fixed_stake'
  | 'percentage_stake'
  | 'martingale'
  | 'fibonacci'
  | 'custom';

export interface BacktestResult {
  strategy_name: string;
  period_start: string;
  period_end: string;
  total_bets: number;
  winning_bets: number;
  losing_bets: number;
  void_bets: number;
  win_rate: number;
  total_staked: number;
  total_profit: number;
  roi: number;
  max_drawdown: number;
  sharpe_ratio: number;
  profit_factor: number;
  average_odds: number;
  average_stake: number;
  longest_winning_streak: number;
  longest_losing_streak: number;
  equity_curve: { date: string; equity: number }[];
  monthly_returns: Record<string, number>;
  market_breakdown: Record<string, { bets: number; wins: number; profit: number; roi: number }>;
}

// Bankroll types
export interface BankrollState {
  id?: number;
  user_id?: number;
  initial_balance: number;
  current_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_wagered: number;
  total_profit: number;
  roi: number;
  created_at?: string;
  updated_at?: string;
}

export interface BankrollTransaction {
  id: number;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'loss' | 'refund';
  amount: number;
  balance_after: number;
  description?: string;
  match_id?: number;
  created_at: string;
}

export interface BankrollSettings {
  staking_method: 'fixed' | 'percentage' | 'kelly';
  fixed_stake?: number;
  percentage_stake?: number;
  kelly_fraction?: number;
  max_stake_percentage: number;
  stop_loss_percentage?: number;
  take_profit_percentage?: number;
}

// Export types
export interface ExportConfig {
  format: 'csv' | 'json' | 'excel' | 'pdf';
  data_type: 'matches' | 'predictions' | 'bets' | 'bankroll' | 'backtest';
  date_from?: string;
  date_to?: string;
  filters?: Record<string, unknown>;
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  download_url?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

// User Settings
export interface UserSettings {
  id: number;
  user_id: number;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  date_format: string;
  odds_format: 'decimal' | 'fractional' | 'american';
  default_stake: number;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sound_enabled: boolean;
  auto_refresh_interval: number;
  show_live_scores: boolean;
  favorite_leagues: number[];
  favorite_teams: number[];
}

export interface NotificationSettings {
  value_bet_alerts: boolean;
  live_match_updates: boolean;
  prediction_results: boolean;
  bankroll_alerts: boolean;
  system_notifications: boolean;
  email_daily_summary: boolean;
  email_weekly_report: boolean;
  [key: string]: boolean;
}

// Notification Preferences (Advanced)
export type NotificationType = 
  | 'value_bet'
  | 'match_start'
  | 'match_end'
  | 'score_update'
  | 'odds_movement'
  | 'prediction_result'
  | 'daily_summary'
  | 'weekly_report'
  | 'system_alert';

export type NotificationChannel = 'email' | 'telegram' | 'push' | 'websocket';

export type DigestFrequency = 'instant' | 'hourly' | 'daily' | 'weekly';

export interface NotificationPreferences {
  id: number;
  user_id: number;
  
  // Channel settings
  email_enabled: boolean;
  telegram_enabled: boolean;
  push_enabled: boolean;
  websocket_enabled: boolean;
  
  // Telegram settings
  telegram_chat_id?: string;
  telegram_username?: string;
  telegram_verified: boolean;
  
  // Digest settings
  digest_frequency: DigestFrequency;
  digest_time: string;
  
  // Alert types
  enabled_alert_types: NotificationType[];
  
  // Thresholds
  min_edge_percentage: number;
  min_confidence: number;
  min_odds_change: number;
  
  // Filters
  favorite_teams: number[];
  favorite_leagues: number[];
  favorite_sports: number[];
  
  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  
  // Locale
  timezone: string;
  language: string;
  
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  notification_type: NotificationType;
  channel: NotificationChannel;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  match_id?: number;
  scheduled_at: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
}

export interface TelegramLinkResponse {
  verification_code: string;
  bot_username: string;
  expires_at: string;
  instructions: string;
}

export interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  notifications_today: number;
  notifications_this_week: number;
  by_type: Record<string, number>;
  by_channel: Record<string, number>;
  by_status: Record<string, number>;
}
