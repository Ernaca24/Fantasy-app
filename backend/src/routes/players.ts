import { Router } from "express";
import { prisma } from "../db.js";

export const playersRouter = Router();

// Listar jugadores (con filtro opcional por posición o club)
playersRouter.get("/", async (req, res) => {
  const { position, clubId } = req.query;
  const players = await prisma.player.findMany({
    where: {
      position: position ? (position as any) : undefined,
      clubId: clubId ? String(clubId) : undefined,
    },
    include: { club: true },
    orderBy: { price: "desc" },
  });
  res.json(players);
});

// Crear jugador (panel de administración / seed)
playersRouter.post("/", async (req, res) => {
  const { name, position, price, clubId } = req.body;
  const player = await prisma.player.create({
    data: { name, position, price, clubId },
  });
  res.status(201).json(player);
});

// Detalle de un jugador con sus estadísticas por jornada
playersRouter.get("/:id", async (req, res) => {
  const player = await prisma.player.findUnique({
    where: { id: req.params.id },
    include: { club: true, stats: { include: { gameweek: true } } },
  });
  if (!player) return res.status(404).json({ error: "Jugador no encontrado" });
  res.json(player);
});
