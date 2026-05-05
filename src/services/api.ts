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
    outcome: number; // 0: Home, 1: Draw, 2: Away
    probabilities: {
      homeWin: number;
      draw: number;
      awayWin: number;
      over25?: number;
      under25?: number;
      bttsYes?: number;
      bttsNo?: number;
    };
    odds?: {
      homeWin: number;
      draw: number;
      awayWin: number;
      over25?: number;
      under25?: number;
      bttsYes?: number;
      bttsNo?: number;
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
console.log('[Frontend API] Using BASE_URL:', BASE_URL);

export async function getTodayMatches(leagueId?: number, dateType: string = 'today'): Promise<IMatch[]> {
  try {
    const url = new URL(`${BASE_URL}/api/matches/today`);
    url.searchParams.append('date_type', dateType);
    if (leagueId) {
      url.searchParams.append('league_id', leagueId.toString());
    }

    const res = await fetch(url.toString(), {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch matches');
    }

    return res.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

export async function getTopPredictions(): Promise<IMatch[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/matches/top`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch top predictions');
    }

    return res.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

export async function getLeagues(): Promise<ILeague[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/matches/leagues`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch leagues');
    }

    const data = await res.json();
    return Array.isArray(data) ? data.filter((league: ILeague) => league && league.id !== null && league.id !== undefined) : [];
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

export async function triggerBackendSync(competitionCode?: string): Promise<{ message: string }> {
  try {
    const url = new URL(`${BASE_URL}/api/matches/sync`);
    if (competitionCode) {
      url.searchParams.append('competitionCode', competitionCode);
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Sync failed');
    }

    return res.json();
  } catch (error) {
    console.error('Sync Error:', error);
    return { message: 'Failed to trigger sync' };
  }
}

export interface ISyncStatus {
  isSyncing: boolean;
  progress: number;
  currentTask: string;
  lastSync: string | null;
}

export async function getSyncStatus(): Promise<ISyncStatus> {
  try {
    const res = await fetch(`${BASE_URL}/api/matches/sync-status`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch sync status');
    }

    return res.json();
  } catch (error) {
    console.error('Status Error:', error);
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
    const res = await fetch(`${BASE_URL}/api/matches/backtest`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch backtest stats');
    }

    return res.json();
  } catch (error) {
    console.error('API Error:', error);
    return {
      total: 0,
      hits: 0,
      accuracy: 0,
      leagueStats: [],
      recentMatches: []
    };
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
    const res = await fetch(`${BASE_URL}/api/matches/${fixture_id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Match not found');
    }

    return res.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}
