export interface ILeague {
  id: number;
  name: string;
  logo?: string;
}

export interface IMatch {
  fixture_id: number;
  date: string;
  status: 'SCHEDULED' | 'FINISHED';
  league: ILeague;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  score: { home: number; away: number };
  stats?: {
    home_possession: number;
    away_possession: number;
    home_shots_on_target: number;
    away_shots_on_target: number;
  };
  prediction?: {
    outcome: number; 
    probabilities: {
      homeWin: number;
      draw: number;
      awayWin: number;
      over25?: number;
      under25?: number;
      bttsYes?: number;
      bttsNo?: number;
      doubleChance1X?: number;
      doubleChance12?: number;
      doubleChanceX2?: number;
    };
    exactScores?: { score: string; probability: number }[];
    odds?: {
      homeWin: number;
      draw: number;
      awayWin: number;
      over25?: number;
      under25?: number;
      bttsYes?: number;
      bttsNo?: number;
      doubleChance1X?: number;
      doubleChance12?: number;
      doubleChanceX2?: number;
    };
    valueBet?: {
      isFound: boolean;
      target: 'HOME' | 'DRAW' | 'AWAY';
      expectedValue: number;
    };
    analysis?: string;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://levantamentodados-backend.onrender.com';

/**
 * Custom fetch with timeout to prevent Vercel 504 timeouts
 */
async function fetchWithTimeout(url: string, options: any = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function getTodayMatches(leagueId?: number, dateType: string = 'today'): Promise<IMatch[]> {
  try {
    const url = new URL(`${BASE_URL}/api/matches/today`);
    url.searchParams.append('date_type', dateType);
    if (leagueId) {
      url.searchParams.append('league_id', leagueId.toString());
    }

    const res = await fetchWithTimeout(url.toString());
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  } catch (error) {
    console.error('API Error (Matches):', error);
    return [];
  }
}

export async function getTopPredictions(): Promise<IMatch[]> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/matches/top`);
    if (!res.ok) throw new Error('Failed to fetch top predictions');
    return res.json();
  } catch (error) {
    console.error('API Error (Top):', error);
    return [];
  }
}

export async function getLeagues(): Promise<ILeague[]> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/matches/leagues`);
    if (!res.ok) throw new Error('Failed to fetch leagues');
    const data = await res.json();
    return Array.isArray(data) ? data.filter((l: any) => l && l.id) : [];
  } catch (error) {
    console.error('API Error (Leagues):', error);
    return [];
  }
}

// ... Restante das interfaces e funções (Sync, Backtest, Bets) seguem o mesmo padrão ...

export interface ISyncStatus {
  isSyncing: boolean;
  progress: number;
  currentTask: string;
  lastSync: string | null;
}

export async function getSyncStatus(): Promise<ISyncStatus> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/matches/sync-status`);
    if (!res.ok) throw new Error('Sync status failed');
    return res.json();
  } catch (error) {
    return { isSyncing: false, progress: 0, currentTask: '', lastSync: null };
  }
}

export interface IBacktestStats {
  total: number;
  hits: number;
  accuracy: number;
  leagueStats: {
    name: string;
    total: number;
    hits: number;
    accuracy: number;
  }[];
  recentMatches: {
    fixture_id: number;
    homeTeam: string;
    awayTeam: string;
    score: { home: number; away: number };
    predictedOutcome: number;
    actualOutcome: number;
    isHit: boolean;
    date: string;
    league: string;
  }[];
}

export async function getBacktestStats(): Promise<IBacktestStats> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/matches/backtest`);
    if (!res.ok) throw new Error('Backtest failed');
    return res.json();
  } catch (error) {
    return { total: 0, hits: 0, accuracy: 0, leagueStats: [], recentMatches: [] };
  }
}

export interface IMatchDetail extends IMatch {
  h2h: IMatch[];
  form: {
    home: { result: 'W' | 'D' | 'L'; date: string; score: string; opponent: string }[];
    away: { result: 'W' | 'D' | 'L'; date: string; score: string; opponent: string }[];
  };
}

export async function getMatchById(fixture_id: number): Promise<IMatchDetail | null> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/matches/${fixture_id}`);
    if (!res.ok) throw new Error('Match detail failed');
    return res.json();
  } catch (error) {
    return null;
  }
}

export interface IVirtualBet {
  _id: string;
  userId: string;
  fixtureId: number;
  matchInfo: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    date: string;
  };
  market: '1X2' | 'OVER_UNDER_2.5' | 'BTTS';
  selection: string;
  odds: number;
  stake: number;
  potentialReturn: number;
  status: 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';
  result?: {
    homeScore: number;
    awayScore: number;
  };
  createdAt: string;
}

export interface IBankrollStats {
  totalStaked: number;
  totalReturned: number;
  profit: number;
  roi: number;
  winRate: number;
  wonCount: number;
  lostCount: number;
  totalBets: number;
}

export async function placeVirtualBet(betData: any): Promise<IVirtualBet | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/bets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(betData),
    });
    if (!res.ok) throw new Error('Bet place failed');
    return res.json();
  } catch (error) {
    return null;
  }
}

export async function getUserBets(userId: string): Promise<{ bets: IVirtualBet[]; stats: IBankrollStats }> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/bets/user/${userId}`);
    if (!res.ok) throw new Error('User bets failed');
    return res.json();
  } catch (error) {
    return {
      bets: [],
      stats: { totalStaked: 0, totalReturned: 0, profit: 0, roi: 0, winRate: 0, wonCount: 0, lostCount: 0, totalBets: 0 }
    };
  }
}
