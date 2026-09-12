import "dotenv/config";
import { PrismaClient, Position } from "@prisma/client";

const prisma = new PrismaClient();

const API_KEY = process.env.API_FOOTBALL_KEY!;
console.log("Clave leída (debería ver algo, no 'undefined'):", API_KEY ? `${API_KEY.slice(0, 6)}...` : "undefined");
const BASE = "https://v3.football.api-sports.io";
const HEADERS = { "x-apisports-key": API_KEY };

// ID de LaLiga en API-Football. Si el script no encuentra nada, lo primero
// a revisar es si este número sigue siendo el correcto.
const LALIGA_ID = 140;
const SEASON = 2026; // temporada 2026/27 (la que está en juego ahora mismo)

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: HEADERS });
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football devolvió un error: ${JSON.stringify(data.errors)}`);
  }
  return data;
}

function mapPosition(apiPosition: string): Position {
  switch (apiPosition) {
    case "Goalkeeper": return "GK";
    case "Defender": return "DEF";
    case "Midfielder": return "MID";
    case "Attacker": return "FWD";
    default: return "MID";
  }
}

// Nuestra propia fórmula de precio -- NO copia el sistema de ninguna app existente.
// Usa datos reales de la temporada (goles, asistencias, tarjetas, minutos).
function computePrice(position: Position, stats: any): number {
  const BASE_PRICE: Record<Position, number> = { GK: 4, DEF: 4.5, MID: 6, FWD: 7 };
  const GOAL_WEIGHT: Record<Position, number> = { GK: 2, DEF: 1.5, MID: 1, FWD: 0.6 };

  const goals = stats.goals?.total ?? 0;
  const assists = stats.goals?.assists ?? 0;
  const yellow = stats.cards?.yellow ?? 0;
  const red = (stats.cards?.red ?? 0) + (stats.cards?.yellowred ?? 0);
  const minutes = stats.games?.minutes ?? 0;

  let price = BASE_PRICE[position];
  price += goals * GOAL_WEIGHT[position];
  price += assists * 0.4;
  price -= yellow * 0.05;
  price -= red * 0.6;
  price += Math.min(minutes / 900, 2.5); // regularidad, tope de +2.5

  price = Math.max(3, Math.min(15, price)); // entre 3M y 15M
  return Math.round(price * 2) / 2; // redondeado a .5
}

async function main() {
  console.log(`Importando jugadores de LaLiga (temporada ${SEASON})...`);

  let page = 1;
  let totalPages = 1;
  let imported = 0;

  do {
    console.log(`Página ${page}${totalPages > 1 ? ` de ${totalPages}` : ""}...`);
    const data = await fetchJson(
      `${BASE}/players?league=${LALIGA_ID}&season=${SEASON}&page=${page}`
    );
    totalPages = data.paging?.total ?? 1;

    for (const entry of data.response) {
      const p = entry.player;
      const stats = entry.statistics?.[0];
      if (!stats || !stats.games?.position) continue;

      const clubName = stats.team?.name ?? "Sin equipo";
      let club = await prisma.club.findFirst({ where: { name: clubName } });
      if (!club) {
        club = await prisma.club.create({ data: { name: clubName, color: "#1e3a5f" } });
      }

      const position = mapPosition(stats.games.position);
      const price = computePrice(position, stats);

      const existing = await prisma.player.findFirst({ where: { name: p.name, clubId: club.id } });
      if (existing) {
        await prisma.player.update({ where: { id: existing.id }, data: { price } });
      } else {
        await prisma.player.create({
          data: { name: p.name, position, price, clubId: club.id },
        });
        imported++;
      }
    }

    page++;
  } while (page <= totalPages);

  console.log(`\n✅ Listo. ${imported} jugadores nuevos importados (y precios actualizados para los ya existentes).`);
}

main()
  .catch((e) => {
    console.error("\n❌ Algo falló -- manda este mensaje para revisarlo juntos:\n");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
