import { Router } from "express";
import { prisma } from "../db.js";

export const matchesRouter = Router();

// Partidos de una jornada (para el recuadro de "Mis Fantasys")
matchesRouter.get("/", async (req, res) => {
  const { gameweekId } = req.query;
  const matches = await prisma.match.findMany({
    where: gameweekId ? { gameweekId: String(gameweekId) } : undefined,
    include: { homeClub: true, awayClub: true },
    orderBy: { kickoff: "asc" },
  });
  res.json(matches);
});

// Actualizar el marcador / minuto / estado de un partido (para alimentar el "en vivo")
matchesRouter.patch("/:id", async (req, res) => {
  const { homeScore, awayScore, minute, status } = req.body;
  const match = await prisma.match.update({
    where: { id: req.params.id },
    data: { homeScore, awayScore, minute, status },
  });
  res.json(match);
});

// Crear un partido (panel de administración / seed de una jornada)
matchesRouter.post("/", async (req, res) => {
  const { gameweekId, homeClubId, awayClubId, kickoff } = req.body;
  const match = await prisma.match.create({
    data: { gameweekId, homeClubId, awayClubId, kickoff: new Date(kickoff) },
  });
  res.status(201).json(match);
});
