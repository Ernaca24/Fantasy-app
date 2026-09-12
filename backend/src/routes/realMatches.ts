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

    // Nos quedamos con los partidos más recientes (jugados o por jugar) para
    // no mandar la temporada entera al frontend de golpe
    const now = new Date();
    const matches = data.matches
      .map((m: any) => ({
        round: m.round,
        date: m.date,
        team1: m.team1,
        team2: m.team2,
        score: m.score?.ft ?? null, // [golesLocal, golesVisitante] o null si aún no se jugó
      }))
      .filter((m: any) => {
        const matchDate = new Date(m.date);
        const diffDays = Math.abs((matchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 10; // solo partidos de +/- 10 días respecto a hoy
      });

    res.json({ competition: data.name, matches });
  } catch (err: any) {
    res.status(502).json({ error: `No se pudo obtener los partidos reales: ${err.message}` });
  }
});
