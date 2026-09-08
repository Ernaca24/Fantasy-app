import { Router } from "express";
import { prisma } from "../db.js";

export const leaguesRouter = Router();

// Ligas a las que pertenece un usuario (para "Mis Fantasys")
leaguesRouter.get("/mine/:userId", async (req, res) => {
  const memberships = await prisma.leagueMember.findMany({
    where: { userId: req.params.userId },
    include: { league: true },
  });
  res.json(memberships.map((m) => m.league));
});

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

// Clasificación de la liga: suma los puntos de todas las jornadas de cada participante
leaguesRouter.get("/:leagueId/standings", async (req, res) => {
  const league = await prisma.league.findUnique({
    where: { id: req.params.leagueId },
    include: { members: { include: { user: { include: { teams: true } } } } },
  });
  if (!league) return res.status(404).json({ error: "Liga no encontrada" });

  const standings = await Promise.all(
    league.members.map(async (member) => {
      const team = member.user.teams[0];
      if (!team) return { userId: member.userId, name: member.user.name, totalPoints: 0 };

      const lineups = await prisma.lineup.findMany({
        where: { userTeamId: team.id },
        include: { players: { where: { isStarting: true }, include: { player: true } } },
      });

      let totalPoints = 0;
      for (const lineup of lineups) {
        const stats = await prisma.playerGameweekStat.findMany({
          where: {
            gameweekId: lineup.gameweekId,
            playerId: { in: lineup.players.map((p) => p.playerId) },
          },
        });
        for (const slot of lineup.players) {
          const stat = stats.find((s) => s.playerId === slot.playerId);
          if (!stat) continue;
          totalPoints += stat.fantasyPoints * (slot.isCaptain ? 2 : 1);
        }
      }

      return { userId: member.userId, name: member.user.name, totalPoints };
    })
  );

  standings.sort((a, b) => b.totalPoints - a.totalPoints);
  res.json({ league: league.name, standings });
});
