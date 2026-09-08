import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

/**
 * Al iniciar sesión con Clerk, esto llama a /auth/sync una vez para
 * crear (o recuperar) tu usuario y plantilla reales en la base de datos.
 */
export function useCurrentUser() {
  const { getToken, isSignedIn } = useAuth();
  const [userId, setUserId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(true);

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
      }
      setLoading(false);
    })();
  }, [isSignedIn]);

  return { userId, teamId, loading, isSignedIn };
}
