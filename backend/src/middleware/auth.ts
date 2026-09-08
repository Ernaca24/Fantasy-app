import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";

export interface AuthedRequest extends Request {
  clerkUserId?: string;
}

// Comprueba el token que manda el frontend y guarda el ID de Clerk en la petición.
// Si no hay token válido, corta la petición con 401 (no autorizado).
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Falta iniciar sesión" });
  }
  const token = header.replace("Bearer ", "");
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
    req.clerkUserId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Sesión no válida, vuelve a iniciar sesión" });
  }
}
