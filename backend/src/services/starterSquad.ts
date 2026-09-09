import { prisma } from "../db.js";
import { Position } from "@prisma/client";

// Cuántos jugadores de cada posición recibe un usuario nuevo, gratis, al entrar por primera vez
const STARTER_COUNTS: Record<Position, number> = {
  GK: 2,
  DEF: 5,
  MID: 4,
  FWD: 3,
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Reparte al azar jugadores que no pertenezcan todavía a ninguna plantilla.
// Si no hay suficientes libres de alguna posición, da los que haya (mejor que fallar).
export async function assignStarterSquad(userTeamId: string) {
  const assigned: { id: string; name: string; position: Position; club: { name: string; color: string | null } }[] = [];

  for (const [position, count] of Object.entries(STARTER_COUNTS) as [Position, number][]) {
    const freePlayers = await prisma.player.findMany({
      where: { position, userTeamPlayers: { none: {} } },
      include: { club: true },
    });
    const chosen = shuffle(freePlayers).slice(0, count);

    for (const player of chosen) {
      await prisma.userTeamPlayer.create({
        data: { userTeamId, playerId: player.id },
      });
      assigned.push(player);
    }
  }

  return assigned;
}
