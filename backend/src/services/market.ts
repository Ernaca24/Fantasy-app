import { prisma } from "../db.js";

/**
 * Reglas del mercado:
 * - Listado del sistema (sellerId null): la puja más alta gana automáticamente
 *   cuando se resuelve el listado (por ejemplo, al cumplirse el plazo de 24h).
 * - Listado de un participante (sellerId presente): aunque haya una puja "ganadora",
 *   el vendedor tiene que aceptarla manualmente antes de cerrarse la operación.
 */

export async function placeBid(listingId: string, bidderId: string, amount: number) {
  const listing = await prisma.marketListing.findUnique({
    where: { id: listingId },
    include: { bids: true },
  });
  if (!listing) throw new Error("Listado no encontrado");
  if (listing.status !== "AVAILABLE") throw new Error("Este listado ya no admite pujas");

  const currentTop = listing.bids
    .filter((b) => b.status === "WINNING")
    .sort((a, b) => b.amount - a.amount)[0];

  if (currentTop && amount <= currentTop.amount) {
    throw new Error(`La puja debe superar la actual (${currentTop.amount}M)`);
  }
  if (amount < listing.askingPrice) {
    throw new Error(`La puja mínima es el precio de salida (${listing.askingPrice}M)`);
  }

  // La puja anterior más alta pasa a "superada"
  if (currentTop) {
    await prisma.bid.update({ where: { id: currentTop.id }, data: { status: "OUTBID" } });
  }

  return prisma.bid.create({
    data: { listingId, bidderId, amount, status: "WINNING" },
  });
}

// Cierra un listado del SISTEMA (mercado libre): la puja más alta se lleva el jugador
export async function resolveSystemListing(listingId: string) {
  const listing = await prisma.marketListing.findUnique({
    where: { id: listingId },
    include: { bids: true },
  });
  if (!listing) throw new Error("Listado no encontrado");
  if (listing.sellerId) throw new Error("Este listado pertenece a un participante, no se resuelve automáticamente");

  const winningBid = listing.bids
    .filter((b) => b.status === "WINNING")
    .sort((a, b) => b.amount - a.amount)[0];

  if (!winningBid) {
    await prisma.marketListing.update({ where: { id: listingId }, data: { status: "EXPIRED" } });
    return null;
  }

  return closeListingWithBid(listing.id, winningBid);
}

// El vendedor (participante) acepta una puja concreta sobre su jugador
export async function acceptBid(listingId: string, sellerId: string, bidId: string) {
  const listing = await prisma.marketListing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listado no encontrado");
  if (listing.sellerId !== sellerId) throw new Error("Solo el dueño del jugador puede aceptar una puja");

  const bid = await prisma.bid.findUnique({ where: { id: bidId } });
  if (!bid || bid.listingId !== listingId) throw new Error("Puja no encontrada");

  return closeListingWithBid(listingId, bid);
}

// El vendedor rechaza una puja: el listado sigue abierto para otras pujas
export async function rejectBid(listingId: string, sellerId: string, bidId: string) {
  const listing = await prisma.marketListing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listado no encontrado");
  if (listing.sellerId !== sellerId) throw new Error("Solo el dueño del jugador puede rechazar una puja");

  await prisma.bid.update({ where: { id: bidId }, data: { status: "REJECTED" } });
  await prisma.marketListing.update({ where: { id: listingId }, data: { status: "AVAILABLE" } });
}

async function closeListingWithBid(listingId: string, bid: { id: string; bidderId: string; amount: number }) {
  const listing = await prisma.marketListing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error("Listado no encontrado");

  return prisma.$transaction(async (tx) => {
    await tx.bid.update({ where: { id: bid.id }, data: { status: "ACCEPTED" } });
    await tx.marketListing.update({ where: { id: listingId }, data: { status: "SOLD" } });

    const operation = await tx.operation.create({
      data: {
        listingId,
        playerId: listing.playerId,
        buyerId: bid.bidderId,
        sellerId: listing.sellerId,
        price: bid.amount,
      },
    });

    // Traspasar el jugador: quitarlo de la plantilla del vendedor (si tenía) y dárselo al comprador
    if (listing.sellerId) {
      const sellerTeam = await tx.userTeam.findFirst({ where: { userId: listing.sellerId } });
      if (sellerTeam) {
        await tx.userTeamPlayer.deleteMany({
          where: { userTeamId: sellerTeam.id, playerId: listing.playerId },
        });
      }
    }
    const buyerTeam = await tx.userTeam.findFirst({ where: { userId: bid.bidderId } });
    if (buyerTeam) {
      await tx.userTeamPlayer.create({
        data: { userTeamId: buyerTeam.id, playerId: listing.playerId },
      });
    }

    return operation;
  });
}
