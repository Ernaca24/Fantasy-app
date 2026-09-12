const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Error ${res.status}`);
  }
  return res.json();
}

export interface Player {
  id: string;
  name: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  price: number;
  club: { id: string; name: string; color?: string };
}

export interface Match {
  id: string;
  homeClub: { id: string; name: string; color?: string };
  awayClub: { id: string; name: string; color?: string };
  homeScore: number;
  awayScore: number;
  minute: number | null;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  kickoff: string;
}

export interface MarketListing {
  id: string;
  askingPrice: number;
  status: string;
  player: Player;
  seller: { id: string; name: string } | null;
  bids: { id: string; amount: number; status: string; bidderId: string }[];
}

export interface StandingRow {
  userId: string;
  name: string;
  totalPoints: number;
}

export interface RealMatch {
  round: string;
  date: string;
  team1: string;
  team2: string;
  score: [number, number] | null;
}

export const api = {
  // Jugadores / plantilla
  getPlayers: (params?: { position?: string; clubId?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<Player[]>(`/players${qs ? `?${qs}` : ""}`);
  },
  getTeam: (teamId: string) => request<any>(`/teams/${teamId}`),
  addPlayerToTeam: (teamId: string, playerId: string) =>
    request(`/teams/${teamId}/players`, {
      method: "POST",
      body: JSON.stringify({ playerId }),
    }),

  // Ligas / clasificación
  getMyLeagues: (userId: string) => request<any[]>(`/leagues/mine/${userId}`),
  createLeague: (name: string, userId: string) =>
    request(`/leagues`, { method: "POST", body: JSON.stringify({ name, userId }) }),
  joinLeague: (inviteCode: string, userId: string) =>
    request(`/leagues/join/${inviteCode}`, { method: "POST", body: JSON.stringify({ userId }) }),
  getStandings: (leagueId: string) =>
    request<{ league: string; standings: StandingRow[] }>(`/leagues/${leagueId}/standings`),

  // Partidos en vivo
  getMatches: (gameweekId?: string) =>
    request<Match[]>(`/matches${gameweekId ? `?gameweekId=${gameweekId}` : ""}`),
  getRealMatches: () =>
    request<{ competition: string; matches: RealMatch[] }>(`/real-matches`),

  // Once / Puntos
  getLineup: (userTeamId: string, gameweekId: string) =>
    request<any>(`/lineups/${userTeamId}/${gameweekId}`),
  saveLineup: (
    userTeamId: string,
    gameweekId: string,
    players: { playerId: string; isStarting: boolean; isCaptain: boolean }[]
  ) =>
    request(`/lineups/${userTeamId}/${gameweekId}`, {
      method: "PUT",
      body: JSON.stringify({ players }),
    }),
  getLineupPoints: (userTeamId: string, gameweekId: string) =>
    request<{ total: number; detail: any[] }>(`/lineups/${userTeamId}/${gameweekId}/points`),

  // Mercado de fichajes
  getMarket: () => request<MarketListing[]>(`/market`),
  createListing: (playerId: string, sellerId: string, askingPrice: number) =>
    request(`/market`, { method: "POST", body: JSON.stringify({ playerId, sellerId, askingPrice }) }),
  placeBid: (listingId: string, bidderId: string, amount: number) =>
    request(`/market/${listingId}/bids`, {
      method: "POST",
      body: JSON.stringify({ bidderId, amount }),
    }),
  acceptBid: (listingId: string, sellerId: string, bidId: string) =>
    request(`/market/${listingId}/bids/${bidId}/accept`, {
      method: "POST",
      body: JSON.stringify({ sellerId }),
    }),
  rejectBid: (listingId: string, sellerId: string, bidId: string) =>
    request(`/market/${listingId}/bids/${bidId}/reject`, {
      method: "POST",
      body: JSON.stringify({ sellerId }),
    }),
  getMyOperations: (userId: string) => request<any>(`/market/mine/${userId}`),
  getHistory: (userId: string) => request<any[]>(`/market/history/${userId}`),
  getMarketActivity: () => request<any[]>(`/market/activity`),
};
