import { Router } from "express";

export const realMatchesRouter = Router();

const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/football.json/master/2026-27/es.1.json";

// Trae los partidos reales de LaLiga (dominio público, sin necesidad de clave).
// Se vuelve a pedir cada vez -- si quieres, más adelante lo guardamos en caché
// para no depender de que GitHub esté disponible en cada visita.
realMatchesRouter.get("/", async (_req, res) => {
  try {
    const response = await fetch(OPENFOOTBALL_URL);
    if (!response.ok) throw new Error(`openfootball devolvió HTTP ${response.status}`);
    const data = await response.json();

    // Mandamos la temporada completa (todas las jornadas), ordenada por fecha,
    // para poder navegar por J1, J2, J3... sin límite de días.
    const matches = data.matches
      .map((m: any) => ({
        round: m.round,
        date: m.date,
        team1: m.team1,
        team2: m.team2,
        score: m.score?.ft ?? null, // [golesLocal, golesVisitante] o null si aún no se jugó
      }))
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json({ competition: data.name, matches });
  } catch (err: any) {
    res.status(502).json({ error: `No se pudo obtener los partidos reales: ${err.message}` });
  }
});