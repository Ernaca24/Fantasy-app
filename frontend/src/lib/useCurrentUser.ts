import { useEffect, useState } from "react";

/**
 * Usuario de prueba guardado en el navegador, mientras no haya login real.
 * Cuando montemos autenticación, esto se sustituye por el usuario autenticado de verdad.
 */
export function useCurrentUser() {
  const [userId, setUserId] = useState(() => localStorage.getItem("mifantasy_userId") ?? "");
  const [teamId, setTeamId] = useState(() => localStorage.getItem("mifantasy_teamId") ?? "");

  useEffect(() => {
    if (userId) localStorage.setItem("mifantasy_userId", userId);
  }, [userId]);
  useEffect(() => {
    if (teamId) localStorage.setItem("mifantasy_teamId", teamId);
  }, [teamId]);

  return { userId, setUserId, teamId, setTeamId };
}
