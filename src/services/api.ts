export interface IMatch {
  fixture_id: number;
  date: string;
  status: 'SCHEDULED' | 'FINISHED';
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

export async function getTodayMatches(): Promise<IMatch[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/matches/today`, {
      cache: 'no-store', // Ensure we get fresh data
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
