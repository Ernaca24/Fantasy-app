import { Router } from "express";
import { prisma } from "../db.js";

export const teamsRouter = Router();

const STARTING_BUDGET = 100;
const MAX_PLAYERS = 15; // 2 GK, 5 DEF, 5 MID, 3 FWD, típico de este tipo de juego

// Crear una plantilla nueva para un usuario
teamsRouter.post("/", async (req, res) => {
  const { userId } = req.body;
  const team = await prisma.userTeam.create({
    data: { userId, budget: STARTING_BUDGET },
  });
  res.status(201).json(team);
});

// Añadir un jugador a la plantilla, validando presupuesto y límite de plantilla
teamsRouter.post("/:teamId/players", async (req, res) => {
  const { teamId } = req.params;
  const { playerId } = req.body;

  const team = await prisma.userTeam.findUnique({
    where: { id: teamId },
    include: { players: { include: { player: true } } },
  });
  if (!team) return res.status(404).json({ error: "Plantilla no encontrada" });

  if (team.players.length >= MAX_PLAYERS) {
    return res.status(400).json({ error: "La plantilla ya tiene el máximo de jugadores" });
  }

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) return res.status(404).json({ error: "Jugador no encontrado" });

  const spent = team.players.reduce((sum, p) => sum + p.player.price, 0);
  if (spent + player.price > team.budget) {
    return res.status(400).json({ error: "Presupuesto insuficiente" });
  }

  const added = await prisma.userTeamPlayer.create({
    data: { userTeamId: teamId, playerId },
  });
  res.status(201).json(added);
});

// Marcar capitán
teamsRouter.patch("/:teamId/captain/:userTeamPlayerId", async (req, res) => {
  const { teamId, userTeamPlayerId } = req.params;

  await prisma.userTeamPlayer.updateMany({
    where: { userTeamId: teamId },
    data: { isCaptain: false },
  });
  const updated = await prisma.userTeamPlayer.update({
    where: { id: userTeamPlayerId },
    data: { isCaptain: true },
  });
  res.json(updated);
});

// Ver plantilla completa con puntos totales de la última jornada
teamsRouter.get("/:teamId", async (req, res) => {
  const team = await prisma.userTeam.findUnique({
    where: { id: req.params.teamId },
    include: { players: { include: { player: true } } },
  });
  if (!team) return res.status(404).json({ error: "Plantilla no encontrada" });
  res.json(team);
});
