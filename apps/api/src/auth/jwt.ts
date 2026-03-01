import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { JWT_EXPIRY_SECONDS } from "@claimflow/shared";

export type JwtPayload = { sub: string; role: string; email: string; name: string };

export function signAccessToken(payload: JwtPayload, expiresIn: number = JWT_EXPIRY_SECONDS) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
