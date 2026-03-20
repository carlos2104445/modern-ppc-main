import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { asyncHandler } from "./error-handler";
import { AuthErrors } from "./errors";
import { jwtService } from "./jwt";
import { gdprService } from "./gdpr-service";
import { z } from "zod";

const exportDataSchema = z.object({
  userId: z.number(),
});

const deleteDataSchema = z.object({
  userId: z.number(),
  reason: z.string().optional(),
});

const anonymizeDataSchema = z.object({
  userId: z.number(),
  reason: z.string().optional(),
});

export function registerGDPRRoutes(app: Express) {
  app.post(
    "/api/gdpr/export",
    asyncHandler(async (req: Request, res: Response) => {
      const authHeader = req.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

      if (!token) {
        throw AuthErrors.required();
      }

      const payload = jwtService.verifyAccessToken(token);
      const user = await storage.getUser(payload.userId);

      if (!user) {
        throw AuthErrors.invalidUser(payload.userId);
      }

      const { userId } = exportDataSchema.parse(req.body);

      if (user.role !== "admin" && user.id.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden: You can only export your own data" });
      }

      const userData = await gdprService.exportUserData(userId.toString());

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="user-data-${userId}.json"`);
      res.json(userData);
    })
  );

  app.post(
    "/api/gdpr/delete",
    asyncHandler(async (req: Request, res: Response) => {
      const authHeader = req.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

      if (!token) {
        throw AuthErrors.required();
      }

      const payload = jwtService.verifyAccessToken(token);
      const user = await storage.getUser(payload.userId);

      if (!user) {
        throw AuthErrors.invalidUser(payload.userId);
      }

      const { userId, reason } = deleteDataSchema.parse(req.body);

      if (user.role !== "admin" && user.id.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden: You can only delete your own data" });
      }

      await gdprService.deleteUserData(userId.toString());

      res.json({
        message: "User data deleted successfully",
        userId,
      });
    })
  );

  app.post(
    "/api/gdpr/anonymize",
    asyncHandler(async (req: Request, res: Response) => {
      const authHeader = req.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

      if (!token) {
        throw AuthErrors.required();
      }

      const payload = jwtService.verifyAccessToken(token);
      const user = await storage.getUser(payload.userId);

      if (!user) {
        throw AuthErrors.invalidUser(payload.userId);
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Only admins can anonymize user data" });
      }

      const { userId, reason } = anonymizeDataSchema.parse(req.body);

      await gdprService.anonymizeUserData(userId.toString());

      res.json({
        message: "User data anonymized successfully",
        userId,
      });
    })
  );

  app.get(
    "/api/gdpr/requests",
    asyncHandler(async (req: Request, res: Response) => {
      const authHeader = req.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

      if (!token) {
        throw AuthErrors.required();
      }

      const payload = jwtService.verifyAccessToken(token);
      const user = await storage.getUser(payload.userId);

      if (!user) {
        throw AuthErrors.invalidUser(payload.userId);
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Only admins can view GDPR requests" });
      }

      res.json({
        message: "GDPR requests endpoint - to be implemented with database table",
        requests: [],
      });
    })
  );
}
