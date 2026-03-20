import type { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export interface MaintenanceRequest extends Request {
  maintenanceMode?: boolean;
}

export async function checkMaintenanceMode(
  req: MaintenanceRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.path.startsWith("/api/maintenance")) {
      return next();
    }

    if (req.path.startsWith("/api/auth")) {
      return next();
    }

    const settings = await storage.getMaintenanceSettings();

    if (!settings.enabled) {
      return next();
    }

    const userId = req.headers["x-user-id"] as string;
    if (userId) {
      const user = await storage.getUser(userId);
      if (user && (user.role === "admin" || user.role === "staff")) {
        req.maintenanceMode = true; // Flag that maintenance is active but user can bypass
        return next();
      }
    }

    return res.status(503).json({
      error: "Service Unavailable",
      message:
        settings.message || "The system is currently under maintenance. Please try again later.",
      maintenanceMode: true,
    });
  } catch (error) {
    next();
  }
}
