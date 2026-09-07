import { Router } from "express";
import { prisma } from "../db.js";
import { placeBid, resolveSystemListing, acceptBid, rejectBid } from "../services/market.js";

export const marketRouter = Router();

// "Mercado": todos los listados disponibles ahora mismo (del sistema + de participantes)
marketRouter.get("/", async (_req, res) => {
  const listings = await prisma.marketListing.findMany({
    where: { status: "AVAILABLE" },
    include: { player: { include: { club: true } }, bids: true, seller: true },
    orderBy: { listedAt: "desc" },
  });
  res.json(listings);
});

// Un participante pone uno de sus jugadores en venta
marketRouter.post("/", async (req, res) => {
  const { playerId, sellerId, askingPrice } = req.body;
  const listing = await prisma.marketListing.create({
    data: { playerId, sellerId, askingPrice },
  });
  res.status(201).json(listing);
});

// Pujar por un listado
marketRouter.post("/:listingId/bids", async (req, res) => {
  const { bidderId, amount } = req.body;
  try {
    const bid = await placeBid(req.params.listingId, bidderId, amount);
    res.status(201).json(bid);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Resolver un listado del sistema (mercado libre) cuando se cumple el plazo
marketRouter.post("/:listingId/resolve", async (req, res) => {
  try {
    const operation = await resolveSystemListing(req.params.listingId);
    res.json(operation ?? { status: "expired_sin_pujas" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// El vendedor (participante) acepta una puja concreta
marketRouter.post("/:listingId/bids/:bidId/accept", async (req, res) => {
  const { sellerId } = req.body;
  try {
    const operation = await acceptBid(req.params.listingId, sellerId, req.params.bidId);
    res.json(operation);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// El vendedor rechaza una puja
marketRouter.post("/:listingId/bids/:bidId/reject", async (req, res) => {
  const { sellerId } = req.body;
  try {
    await rejectBid(req.params.listingId, sellerId, req.params.bidId);
    res.json({ status: "rechazada" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// "Mis Operaciones": pujas activas del usuario, tanto de compra como de venta
marketRouter.get("/mine/:userId", async (req, res) => {
  const { userId } = req.params;

  const myBids = await prisma.bid.findMany({
    where: { bidderId: userId, status: { in: ["PENDING", "WINNING", "OUTBID"] } },
    include: { listing: { include: { player: true } } },
  });

  const mySellingListings = await prisma.marketListing.findMany({
    where: { sellerId: userId, status: { in: ["AVAILABLE", "PENDING_SELLER"] } },
    include: { player: true, bids: true },
  });

  res.json({ compras: myBids, ventas: mySellingListings });
});

// "Histórico Personal": todos los movimientos ya cerrados del usuario
marketRouter.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;
  const operations = await prisma.operation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: { listing: { include: { player: true } }, buyer: true, seller: true },
    orderBy: { closedAt: "desc" },
  });
  res.json(operations);
});

// "Actividad del Mercado": resumen de movimientos de TODOS los participantes
marketRouter.get("/activity", async (_req, res) => {
  const operations = await prisma.operation.findMany({
    include: { listing: { include: { player: true } }, buyer: true, seller: true },
    orderBy: { closedAt: "desc" },
    take: 50,
  });
  res.json(operations);
});
