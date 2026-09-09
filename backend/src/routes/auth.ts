import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { createClerkClient } from "@clerk/backend";
import { assignStarterSquad } from "../services/starterSquad.js";

export const authRouter = Router();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

// Se llama justo después de iniciar sesión: crea el usuario (y su plantilla) si es
// la primera vez -- y en ese caso, le reparte al azar su plantilla inicial de bienvenida.
authRouter.post("/sync", requireAuth, async (req: AuthedRequest, res) => {
  const clerkUserId = req.clerkUserId!;

  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    include: { teams: true },
  });

  let isNewTeam = false;
  let starterSquad: any[] = [];

  if (!user) {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkUserId}@sin-email.local`;
    const name = clerkUser.firstName
      ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim()
      : email.split("@")[0];

    user = await prisma.user.create({
      data: {
        clerkId: clerkUserId,
        email,
        name,
        teams: { create: { budget: 100 } },
      },
      include: { teams: true },
    });

    isNewTeam = true;
    starterSquad = await assignStarterSquad(user.teams[0].id);
  }

  const team = user.teams[0];
  res.json({ userId: user.id, teamId: team?.id ?? null, name: user.name, isNewTeam, starterSquad });
});
