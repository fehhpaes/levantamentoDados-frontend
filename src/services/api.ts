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
  prediction?: {
    outcome: number; // 0: Home, 1: Draw, 2: Away
    probabilities: {
      homeWin: number;
      draw: number;
      awayWin: number;
    };
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://levantamentodados-backend.onrender.com';

export async function getTodayMatches(leagueId?: number): Promise<IMatch[]> {
  try {
    const url = new URL(`${BASE_URL}/api/matches/today`);
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

export async function getLeagues(): Promise<ILeague[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/matches/leagues`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch leagues');
    }

    return res.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

export async function triggerBackendSync(): Promise<{ message: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/matches/sync`, {
      method: 'GET', // or POST if you prefer
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
