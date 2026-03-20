import jwt, { type SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";
import type { User } from "@shared/schema";
import redisClient from "./redis";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET environment variable is required");
}

const INSECURE_SECRETS = [
  "change-this-secret-in-production",
  "change-this-refresh-secret-in-production",
  "secret",
  "password",
  "12345",
];

if (INSECURE_SECRETS.includes(process.env.JWT_SECRET)) {
  throw new Error("JWT_SECRET must not be a default or insecure value");
}
if (INSECURE_SECRETS.includes(process.env.JWT_REFRESH_SECRET)) {
  throw new Error("JWT_REFRESH_SECRET must not be a default or insecure value");
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}
if (process.env.JWT_REFRESH_SECRET.length < 32) {
  throw new Error("JWT_REFRESH_SECRET must be at least 32 characters long");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "15m") as StringValue;
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as StringValue;

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: "access" | "refresh";
  exp?: number;
  iat?: number;
}

export class JWTService {
  generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: "access",
    };

    const options: SignOptions = {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "modern-ppc",
      audience: "modern-ppc-users",
    };

    return jwt.sign(payload, JWT_SECRET, options);
  }

  generateRefreshToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: "refresh",
    };

    const options: SignOptions = {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: "modern-ppc",
      audience: "modern-ppc-users",
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, options);
  }

  generateTokenPair(user: User): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, JWT_SECRET, {
        issuer: "modern-ppc",
        audience: "modern-ppc-users",
      }) as JWTPayload;

      if (payload.type !== "access") {
        throw new Error("Invalid token type");
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }
      throw error;
    }
  }

  verifyRefreshToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: "modern-ppc",
        audience: "modern-ppc-users",
      }) as JWTPayload;

      if (payload.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Refresh token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid refresh token");
      }
      throw error;
    }
  }

  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  async revokeToken(token: string): Promise<void> {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      throw new Error("Invalid token");
    }

    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redisClient.setex(`blacklist:${token}`, ttl, "revoked");
    }
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    const result = await redisClient.get(`blacklist:${token}`);
    return result === "revoked";
  }

  async verifyAccessTokenWithBlacklist(token: string): Promise<JWTPayload> {
    const isRevoked = await this.isTokenRevoked(token);
    if (isRevoked) {
      throw new Error("Token has been revoked");
    }
    return this.verifyAccessToken(token);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await redisClient.set(
      `blacklist:user:${userId}`,
      Date.now().toString(),
      "EX",
      60 * 60 * 24 * 7
    );
  }

  async isUserTokensRevoked(userId: string, tokenIssuedAt: number): Promise<boolean> {
    const revokedAt = await redisClient.get(`blacklist:user:${userId}`);
    if (!revokedAt) {
      return false;
    }
    return parseInt(revokedAt) > tokenIssuedAt * 1000;
  }
}

export const jwtService = new JWTService();
