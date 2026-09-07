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

export const api = {
  getPlayers: (params?: { position?: string; clubId?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<Player[]>(`/players${qs ? `?${qs}` : ""}`);
  },
  getTeam: (teamId: string) => request(`/teams/${teamId}`),
  addPlayerToTeam: (teamId: string, playerId: string) =>
    request(`/teams/${teamId}/players`, {
      method: "POST",
      body: JSON.stringify({ playerId }),
    }),
};
