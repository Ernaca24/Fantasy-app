import { PrismaClient, Position } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email: "prueba@mifantasy.local" },
    include: { teams: true, leagues: { include: { league: true } } },
  });

  if (existingUser) {
    console.log("\nℹ El usuario de prueba ya existía, no se ha vuelto a crear nada nuevo.\n");
    const team = existingUser.teams[0];
    const membership = existingUser.leagues[0];
    const gameweek = await prisma.gameweek.findFirst({ orderBy: { number: "asc" } });

    console.log("ID de usuario:  ", existingUser.id);
    console.log("ID de plantilla:", team?.id ?? "(no encontrada)");
    console.log("ID de liga:     ", membership?.league.id ?? "(no encontrada)");
    console.log("ID de jornada:  ", gameweek?.id ?? "(no encontrada)");
    return;
  }

  console.log("Creando clubes...");
  const clubsData = [
    { name: "Halcones FC", city: "Sevilla", color: "#1e3a5f" },
    { name: "Titanes United", city: "Madrid", color: "#7a1e1e" },
    { name: "Costa Real", city: "Málaga", color: "#0f766e" },
    { name: "Norte Atlético", city: "Bilbao", color: "#78350f" },
  ];
  const clubs = [];
  for (const c of clubsData) {
    clubs.push(await prisma.club.create({ data: c }));
  }

  console.log("Creando jugadores...");
  const namesByPosition: Record<Position, string[]> = {
    GK: ["Marcos Ríos", "Iván Torres"],
    DEF: ["Diego Vega", "Pablo Fuentes", "Adrián Costa", "Rubén Silva", "Álvaro Peña", "Nico Lara"],
    MID: ["Hugo Moreno", "Mateo Ibáñez", "Bruno Cabrera", "Leo Ortega", "Dani Prieto", "Iker Nogales"],
    FWD: ["Sergio Blanco", "Tomás Reyes", "Marco Aguilar", "Carlos Duarte"],
  };
  const priceByPosition: Record<Position, number> = { GK: 4.5, DEF: 5, MID: 7, FWD: 8.5 };

  const players = [];
  let i = 0;
  for (const [position, names] of Object.entries(namesByPosition) as [Position, string[]][]) {
    for (const name of names) {
      const club = clubs[i % clubs.length];
      i++;
      const price = priceByPosition[position] + (i % 3) * 0.5;
      players.push(
        await prisma.player.create({
          data: { name, position, price, clubId: club.id },
        })
      );
    }
  }

  console.log("Creando usuario de prueba...");
  const user = await prisma.user.create({
    data: { email: "prueba@mifantasy.local", name: "Usuario de Prueba" },
  });

  console.log("Creando plantilla y fichando 15 jugadores...");
  const userTeam = await prisma.userTeam.create({
    data: { userId: user.id, budget: 100 },
  });
  const initialSquad = players.slice(0, 15); // 2 GK, 6 DEF, 5 MID... ajusta si quieres otra mezcla
  for (const p of initialSquad) {
    await prisma.userTeamPlayer.create({
      data: { userTeamId: userTeam.id, playerId: p.id },
    });
  }

  console.log("Creando liga de prueba...");
  const league = await prisma.league.create({
    data: { name: "Liga de Amigos", members: { create: { userId: user.id } } },
  });

  console.log("Creando jornada y partidos...");
  const gameweek = await prisma.gameweek.create({
    data: {
      number: 1,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.match.create({
    data: {
      gameweekId: gameweek.id,
      homeClubId: clubs[0].id,
      awayClubId: clubs[1].id,
      kickoff: new Date(),
      status: "LIVE",
      homeScore: 1,
      awayScore: 0,
      minute: 37,
    },
  });
  await prisma.match.create({
    data: {
      gameweekId: gameweek.id,
      homeClubId: clubs[2].id,
      awayClubId: clubs[3].id,
      kickoff: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: "SCHEDULED",
    },
  });

  console.log("Poniendo 2 jugadores libres en el mercado...");
  const freeAgents = players.slice(15, 17);
  for (const p of freeAgents) {
    await prisma.marketListing.create({
      data: { playerId: p.id, askingPrice: p.price, sellerId: null },
    });
  }

  console.log("\n✅ Listo. Guarda estos IDs en la página ⚙ Config de tu app:\n");
  console.log("ID de usuario:  ", user.id);
  console.log("ID de plantilla:", userTeam.id);
  console.log("ID de liga:     ", league.id, "(para ver /clasificacion/" + league.id + ")");
  console.log("ID de jornada:  ", gameweek.id, "(para la pestaña Once/Puntos de Mi Equipo)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
