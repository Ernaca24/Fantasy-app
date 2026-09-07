import { Router } from "express";
import { prisma } from "../db.js";

export const leaguesRouter = Router();

// Crear liga privada
leaguesRouter.post("/", async (req, res) => {
  const { name, userId } = req.body;
  const league = await prisma.league.create({
    data: { name, members: { create: { userId } } },
  });
  res.status(201).json(league);
});

// Unirse a una liga con código de invitación
leaguesRouter.post("/join/:inviteCode", async (req, res) => {
  const { userId } = req.body;
  const league = await prisma.league.findUnique({ where: { inviteCode: req.params.inviteCode } });
  if (!league) return res.status(404).json({ error: "Liga no encontrada" });

  const member = await prisma.leagueMember.create({
    data: { leagueId: league.id, userId },
  });
  res.status(201).json(member);
});

// Clasificación de la liga (suma simple de puntos, ejemplo simplificado)
leaguesRouter.get("/:leagueId/standings", async (req, res) => {
  const league = await prisma.league.findUnique({
    where: { id: req.params.leagueId },
    include: { members: { include: { user: { include: { teams: true } } } } },
  });
  if (!league) return res.status(404).json({ error: "Liga no encontrada" });

  // Aquí conectarías con la suma real de fantasyPoints por jornada;
  // se deja como TODO para que lo completes según tu lógica de temporada.
  res.json({ league: league.name, members: league.members.map((m) => m.user.name) });
});
