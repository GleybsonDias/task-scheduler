import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../types/express.d.js";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("A variável de ambiente JWT_SECRET não está definida.");
  }
  return secret;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Formato: "Bearer <TOKEN>"

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acesso não autorizado: token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as UserPayload;
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido ou expirado." });
  }
}
