import { Router } from "express";
import { prisma } from "../db.js";
import { calculateFantasyPoints, applyCaptainMultiplier } from "../services/scoring.js";

export const lineupsRouter = Router();

// Ver el Once guardado de una plantilla para una jornada concreta
lineupsRouter.get("/:userTeamId/:gameweekId", async (req, res) => {
  const { userTeamId, gameweekId } = req.params;
  const lineup = await prisma.lineup.findUnique({
    where: { userTeamId_gameweekId: { userTeamId, gameweekId } },
    include: { players: { include: { player: true } } },
  });
  res.json(lineup);
});

// Guardar/actualizar el Once de una jornada: lista de { playerId, isStarting, isCaptain }
lineupsRouter.put("/:userTeamId/:gameweekId", async (req, res) => {
  const { userTeamId, gameweekId } = req.params;
  const { players } = req.body as {
    players: { playerId: string; isStarting: boolean; isCaptain: boolean }[];
  };

  const startingCount = players.filter((p) => p.isStarting).length;
  if (startingCount !== 11) {
    return res.status(400).json({ error: `El Once debe tener 11 titulares (tienes ${startingCount})` });
  }
  if (players.filter((p) => p.isCaptain).length !== 1) {
    return res.status(400).json({ error: "Debes elegir exactamente un capitán" });
  }

  const lineup = await prisma.lineup.upsert({
    where: { userTeamId_gameweekId: { userTeamId, gameweekId } },
    create: { userTeamId, gameweekId },
    update: {},
  });

  await prisma.lineupPlayer.deleteMany({ where: { lineupId: lineup.id } });
  await prisma.lineupPlayer.createMany({
    data: players.map((p) => ({
      lineupId: lineup.id,
      playerId: p.playerId,
      isStarting: p.isStarting,
      isCaptain: p.isCaptain,
    })),
  });

  res.json({ status: "guardado", lineupId: lineup.id });
});

// "Puntos": puntuación de la jornada para el Once guardado (solo cuentan los titulares)
lineupsRouter.get("/:userTeamId/:gameweekId/points", async (req, res) => {
  const { userTeamId, gameweekId } = req.params;
  const lineup = await prisma.lineup.findUnique({
    where: { userTeamId_gameweekId: { userTeamId, gameweekId } },
    include: { players: { include: { player: true } } },
  });
  if (!lineup) return res.status(404).json({ error: "No hay Once guardado para esta jornada" });

  const starters = lineup.players.filter((p) => p.isStarting);
  const stats = await prisma.playerGameweekStat.findMany({
    where: { gameweekId, playerId: { in: starters.map((p) => p.playerId) } },
  });

  let total = 0;
  const detail = starters.map((slot) => {
    const stat = stats.find((s) => s.playerId === slot.playerId);
    const base = stat
      ? calculateFantasyPoints({
          position: slot.player.position,
          minutesPlayed: stat.minutesPlayed,
          goals: stat.goals,
          assists: stat.assists,
          cleanSheet: stat.cleanSheet,
          yellowCards: stat.yellowCards,
          redCards: stat.redCards,
          ownGoals: stat.ownGoals,
          penaltiesSaved: stat.penaltiesSaved,
          penaltiesMissed: stat.penaltiesMissed,
        })
      : 0;
    const points = applyCaptainMultiplier(base, slot.isCaptain);
    total += points;
    return { playerId: slot.playerId, name: slot.player.name, isCaptain: slot.isCaptain, points };
  });

  res.json({ gameweekId, total, detail });
});
