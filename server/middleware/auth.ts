import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { AuthErrors } from "../errors";
import { jwtService } from "../jwt";

export interface AuthRequest extends Request {
  authUser?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let userId: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const payload = jwtService.verifyAccessToken(token);
        userId = payload.userId;
      } catch {
        throw AuthErrors.required();
      }
    } else if (req.cookies?.accessToken) {
      try {
        const payload = jwtService.verifyAccessToken(req.cookies.accessToken);
        userId = payload.userId;
      } catch {
        throw AuthErrors.required();
      }
    }

    if (!userId) {
      throw AuthErrors.required();
    }

    const user = await storage.getUser(userId);
    if (!user) {
      throw AuthErrors.invalidUser(userId);
    }

    req.authUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let userId: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const payload = jwtService.verifyAccessToken(token);
        userId = payload.userId;
      } catch {
        throw AuthErrors.required();
      }
    } else if (req.cookies?.accessToken) {
      try {
        const payload = jwtService.verifyAccessToken(req.cookies.accessToken);
        userId = payload.userId;
      } catch {
        throw AuthErrors.required();
      }
    }

    if (!userId) {
      throw AuthErrors.required();
    }

    const user = await storage.getUser(userId);
    if (!user) {
      throw AuthErrors.invalidUser(userId);
    }

    if (user.role !== "admin" && user.role !== "staff") {
      throw AuthErrors.insufficientPermissions("admin or staff");
    }

    req.authUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}
