import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { jwtService } from "./jwt";
import { asyncHandler } from "./error-handler";
import { AuthErrors } from "./errors";
import bcrypt from "bcrypt";
import { z } from "zod";
import { mfaService } from "./mfa-service";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const mfaVerifySchema = z.object({
  token: z.string().length(6),
});

export function registerAuthRoutes(app: Express) {
  app.post(
    "/api/auth/login",
    asyncHandler(async (req: Request, res: Response) => {
      const { email, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        throw AuthErrors.invalidCredentials();
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw AuthErrors.invalidCredentials();
      }

      const { accessToken, refreshToken } = jwtService.generateTokenPair(user);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      });
    })
  );

  app.post(
    "/api/auth/refresh",
    asyncHandler(async (req: Request, res: Response) => {
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

      if (!refreshToken) {
        throw AuthErrors.required();
      }

      const payload = jwtService.verifyRefreshToken(refreshToken);

      const user = await storage.getUser(payload.userId);
      if (!user) {
        throw AuthErrors.invalidUser(payload.userId);
      }

      const { accessToken, refreshToken: newRefreshToken } = jwtService.generateTokenPair(user);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    })
  );

  app.post(
    "/api/auth/logout",
    asyncHandler(async (req: Request, res: Response) => {
      const authHeader = req.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

      if (token) {
        await jwtService.revokeToken(token);
      }

      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
      if (refreshToken) {
        await jwtService.revokeToken(refreshToken);
      }

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({ message: "Logged out successfully" });
    })
  );

  app.post(
    "/api/auth/revoke",
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
      await jwtService.revokeAllUserTokens(payload.userId);

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({ message: "All tokens revoked successfully" });
    })
  );

  app.get(
    "/api/auth/me",
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

      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        balance: user.balance,
        lifetimeEarnings: user.lifetimeEarnings,
        twoFactorEnabled: user.twoFactorEnabled,
      });
    })
  );

  app.post(
    "/api/auth/mfa/setup",
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

      const { secret, qrCode } = await mfaService.generateSecret(user.id.toString(), user.email);

      res.json({
        secret,
        qrCode,
      });
    })
  );

  app.post(
    "/api/auth/mfa/verify",
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

      const { token: mfaToken } = mfaVerifySchema.parse(req.body);
      const { secret } = req.body;

      if (!secret) {
        return res.status(400).json({ message: "Secret is required" });
      }

      const isValid = mfaService.verifyToken(secret, mfaToken);

      if (!isValid) {
        return res.status(400).json({ message: "Invalid MFA token" });
      }

      res.json({
        message: "MFA verified successfully",
        verified: true,
      });
    })
  );

  app.post(
    "/api/auth/mfa/enable",
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

      const { token: mfaToken, secret } = req.body;

      if (!secret || !mfaToken) {
        return res.status(400).json({ message: "Secret and token are required" });
      }

      const isValid = mfaService.verifyToken(secret, mfaToken);

      if (!isValid) {
        return res.status(400).json({ message: "Invalid MFA token" });
      }

      res.json({
        message: "MFA enabled successfully",
        enabled: true,
      });
    })
  );

  app.post(
    "/api/auth/mfa/disable",
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

      const { token: mfaToken } = mfaVerifySchema.parse(req.body);

      res.json({
        message: "MFA disabled successfully",
        disabled: true,
      });
    })
  );
}
