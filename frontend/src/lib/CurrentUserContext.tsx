import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export interface StarterPlayer {
  id: string;
  name: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  club: { name: string; color: string | null };
}

interface CurrentUserValue {
  userId: string;
  teamId: string;
  loading: boolean;
  isSignedIn: boolean | undefined;
  starterSquad: StarterPlayer[] | null;
  clearStarterSquad: () => void;
}

const CurrentUserContext = createContext<CurrentUserValue | null>(null);

/**
 * Llama a /auth/sync UNA sola vez por sesión (aquí arriba, en el árbol),
 * en vez de que cada página que necesite el usuario haga su propia llamada.
 * Si es la primera vez que esta persona entra, el backend reparte una
 * plantilla inicial al azar y la devuelve en starterSquad.
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [userId, setUserId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [starterSquad, setStarterSquad] = useState<StarterPlayer[] | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    (async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/auth/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserId(data.userId);
        setTeamId(data.teamId ?? "");
        if (data.isNewTeam && data.starterSquad?.length) {
          setStarterSquad(data.starterSquad);
        }
      }
      setLoading(false);
    })();
  }, [isSignedIn]);

  return (
    <CurrentUserContext.Provider
      value={{ userId, teamId, loading, isSignedIn, starterSquad, clearStarterSquad: () => setStarterSquad(null) }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser debe usarse dentro de <CurrentUserProvider>");
  return ctx;
}
