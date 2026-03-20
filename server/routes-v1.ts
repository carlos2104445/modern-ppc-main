import type { Express } from "express";
import { pgStorage as storage } from "./pg-storage";
import { db } from "./db";
import { users, transactions as txns, depositRequests, withdrawalRequests } from "@shared/schema";
import { sql, eq, and } from "drizzle-orm";
import { cache } from "./redis";
import {
  insertBlogPostSchema,
  insertAdminCampaignSchema,
  insertWithdrawalRequestSchema,
  insertDepositRequestSchema,
  insertFinancialSettingsSchema,
  insertTransactionLogSchema,
  insertReferralSettingsSchema,
  insertRoleSchema,
  insertStaffMemberSchema,
  insertSubscriptionPlanSchema,
  insertFaqSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
} from "@shared/schema";
import { randomBytes } from "crypto";
import { logAdminAction } from "./audit-logger";
import bcrypt from "bcrypt";
import { pool } from "./db";
import redis from "./redis";
import { jwtService } from "./jwt";
import { paymentRateLimiter, adViewRateLimiter, campaignRateLimiter } from "./middleware/rate-limit";

export function registerV1Routes(app: Express): void {
  const API_PREFIX = "/api/v1";

  app.get(`${API_PREFIX}/health`, async (req, res) => {
    try {
      const health = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          api: "operational",
        },
      };

      res.json(health);
    } catch (error: any) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  });

  app.get(`${API_PREFIX}/health/detailed`, async (req, res) => {
    try {
      let dbStatus = "operational";
      let dbLatency = 0;
      try {
        const start = Date.now();
        await pool.query("SELECT 1");
        dbLatency = Date.now() - start;
      } catch (error) {
        dbStatus = "down";
      }

      let redisStatus = "operational";
      let redisLatency = 0;
      try {
        const start = Date.now();
        await redis.ping();
        redisLatency = Date.now() - start;
      } catch (error) {
        redisStatus = "down";
      }

      const overallStatus =
        dbStatus === "operational" && redisStatus === "operational" ? "healthy" : "degraded";

      const health = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        services: {
          api: {
            status: "operational",
            uptime: process.uptime(),
          },
          database: {
            status: dbStatus,
            latency: `${dbLatency}ms`,
            type: "PostgreSQL",
          },
          cache: {
            status: redisStatus,
            latency: `${redisLatency}ms`,
            type: "Redis/Valkey",
          },
        },
        system: {
          memory: {
            used: process.memoryUsage().heapUsed / 1024 / 1024,
            total: process.memoryUsage().heapTotal / 1024 / 1024,
            unit: "MB",
          },
          cpu: process.cpuUsage(),
        },
      };

      const statusCode = overallStatus === "healthy" ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error: any) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  });

  // Authentication routes
  app.post(`${API_PREFIX}/auth/register`, async (req, res) => {
    try {
      const { firstName, lastName, email, username, phoneNumber, dateOfBirth, password, referralCode: refCode } = req.body;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Resolve referral code to referrer's user ID
      const { referralService } = await import("./referral-service");
      let referredBy: string | undefined;
      if (refCode) {
        const referrerId = await referralService.resolveReferralCode(refCode);
        if (referrerId) {
          referredBy = referrerId;
        }
      }

      const fullName = `${firstName} ${lastName}`;

      // Don't hash here — pgStorage.createUser() handles hashing
      const newUser = await storage.createUser({
        fullName,
        email,
        username,
        phoneNumber,
        dateOfBirth: dateOfBirth || undefined,
        password,
        referredBy,
      });

      // Credit signup bonus to referrer (ETB 5)
      if (referredBy) {
        referralService.creditSignupBonus(referredBy, fullName).catch((err) =>
          console.error("Failed to credit signup bonus:", err)
        );
      }

      // Generate JWT tokens for auto-login after registration
      const { accessToken, refreshToken } = jwtService.generateTokenPair(newUser);

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

      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword, accessToken, refreshToken });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Username availability check
  app.get(`${API_PREFIX}/auth/check-username/:username`, async (req, res) => {
    try {
      const { username } = req.params;
      if (!username || username.length < 3) {
        return res.json({ available: false, reason: "Username must be at least 3 characters" });
      }
      const existing = await storage.getUserByUsername(username);
      res.json({ available: !existing });
    } catch (error: any) {
      res.status(500).json({ available: false, error: error.message });
    }
  });

  app.post(`${API_PREFIX}/auth/signin`, async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user.role === "admin" || user.role === "staff") {
        return res.status(403).json({ message: "Please use the admin login page" });
      }

      // Generate JWT tokens
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

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, accessToken, refreshToken });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Sign in failed" });
    }
  });

  app.post(`${API_PREFIX}/auth/login`, async (req, res) => {
    try {
      const validated = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(validated.email);

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(validated.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      if (user.role !== "admin" && user.role !== "staff") {
        return res.status(403).json({ error: "Access denied. Admin or staff role required." });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Login failed" });
    }
  });

  app.post(`${API_PREFIX}/auth/logout`, async (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  app.post(`${API_PREFIX}/auth/password-reset-request`, async (req, res) => {
    try {
      const validated = passwordResetRequestSchema.parse(req.body);
      const user = await storage.getUserByEmail(validated.email);

      if (!user) {
        return res.json({
          message: "If an account exists with this email, you will receive a password reset link.",
        });
      }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
      });

      res.json({
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Password reset request failed" });
    }
  });

  app.post(`${API_PREFIX}/auth/password-reset-confirm`, async (req, res) => {
    try {
      const validated = passwordResetConfirmSchema.parse(req.body);
      const resetToken = await storage.getPasswordResetToken(validated.token);

      if (!resetToken) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      if (resetToken.expiresAt < new Date()) {
        return res.status(400).json({ error: "Reset token has expired" });
      }

      await storage.updateUserPassword(resetToken.userId, validated.password);
      await storage.markTokenAsUsed(resetToken.id);

      res.json({ message: "Password reset successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Password reset failed" });
    }
  });

  // ==========================================
  // User profile & data routes
  // ==========================================

  // Get current user profile
  app.get(`${API_PREFIX}/user/profile`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid or expired token" });

      const user = await storage.getUser(decoded.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { password: _, ...profile } = user;
      res.json(profile);
    } catch (error: any) {
      res.status(401).json({ error: error.message || "Authentication failed" });
    }
  });

  // Update user profile
  app.patch(`${API_PREFIX}/user/profile`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid or expired token" });

      const { firstName, lastName, phoneNumber, dateOfBirth } = req.body;
      const updates: any = {};
      if (firstName) updates.firstName = firstName;
      if (lastName) updates.lastName = lastName;
      if (phoneNumber) updates.phoneNumber = phoneNumber;
      if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
      if (firstName || lastName) {
        const user = await storage.getUser(decoded.userId);
        updates.fullName = `${firstName || user?.firstName} ${lastName || user?.lastName}`;
      }

      await storage.updateUser(decoded.userId, updates);
      const updatedUser = await storage.getUser(decoded.userId);
      if (!updatedUser) return res.status(404).json({ error: "User not found" });

      const { password: _, ...profile } = updatedUser;
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update profile" });
    }
  });

  // Get user's transaction history
  app.get(`${API_PREFIX}/user/transactions`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid or expired token" });

      const transactions = await storage.getTransactionsByUserId(decoded.userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch transactions" });
    }
  });

  // Get user dashboard stats
  app.get(`${API_PREFIX}/user/stats`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid or expired token" });

      const user = await storage.getUser(decoded.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { campaignService } = await import("./campaign-service");
      const campaigns = await campaignService.getUserCampaigns(decoded.userId);
      const transactions = await storage.getTransactionsByUserId(decoded.userId);

      const activeCampaigns = campaigns.filter(c => c.status === "active").length;
      const totalCampaignSpent = campaigns.reduce((s, c) => s + parseFloat(c.spent || "0"), 0);
      const totalEscrow = campaigns.reduce((s, c) => {
        const remaining = parseFloat(c.escrowAmount || "0") - parseFloat(c.spent || "0") - parseFloat(c.refundedAmount || "0");
        return s + Math.max(remaining, 0);
      }, 0);

      res.json({
        balance: user.balance,
        lifetimeEarnings: user.lifetimeEarnings,
        lifetimeSpending: user.lifetimeSpending,
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        streakFreezes: user.streakFreezes,
        reputationScore: user.reputationScore,
        referralCode: user.referralCode,
        activeCampaigns,
        totalCampaigns: campaigns.length,
        totalCampaignSpent: totalCampaignSpent.toFixed(2),
        totalInEscrow: totalEscrow.toFixed(2),
        recentTransactions: transactions.slice(0, 10),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch stats" });
    }
  });

  // ==========================================
  // Earn routes — ads available for viewing
  // ==========================================

  // Get available ads (active campaigns from other users)
  app.get(`${API_PREFIX}/earn/ads`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid or expired token" });

      const { campaignService } = await import("./campaign-service");
      const allCampaigns = await campaignService.getAllCampaigns();

      // Show active campaigns from OTHER users as ads
      const availableAds = allCampaigns
        .filter(c => c.status === "active" && c.userId !== decoded.userId)
        .map(c => ({
          id: c.id,
          title: c.name,
          name: c.name,
          description: c.description,
          type: c.type,
          url: c.url,
          imageUrl: c.imageUrl,
          cpc: c.cpc,
          duration: c.duration,
          advertiserName: "Advertiser",
        }));

      res.json(availableAds);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch ads" });
    }
  });

  // ==========================================
  // Ad View routes — server-side verification
  // ==========================================

  // In-memory session store (replace with Redis in production)
  const adViewSessions = new Map<string, {
    userId: string;
    campaignId: string;
    startedAt: number;
    requiredDuration: number;
    claimed: boolean;
  }>();

  // Clean up expired sessions every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [id, session] of Array.from(adViewSessions)) {
      if (now - session.startedAt > 10 * 60 * 1000) {
        adViewSessions.delete(id);
      }
    }
  }, 5 * 60 * 1000);

  // Start an ad view session
  app.post(`${API_PREFIX}/ad-views/start`, adViewRateLimiter, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const { campaignId, duration } = req.body;
      if (!campaignId || !duration) {
        return res.status(400).json({ error: "campaignId and duration are required" });
      }

      // Verify the campaign exists and is active
      const { campaignService } = await import("./campaign-service");
      const campaign = await campaignService.getCampaign(campaignId);
      if (!campaign || campaign.status !== "active") {
        return res.status(400).json({ error: "Campaign not available" });
      }

      // Don't let users view their own campaigns
      if (campaign.userId === decoded.userId) {
        return res.status(400).json({ error: "Cannot view your own campaign" });
      }

      // Check for existing active sessions for this user+campaign (prevent spam)
      for (const [, session] of Array.from(adViewSessions)) {
        if (session.userId === decoded.userId && session.campaignId === campaignId && !session.claimed) {
          const elapsed = (Date.now() - session.startedAt) / 1000;
          if (elapsed < session.requiredDuration + 60) {
            return res.status(429).json({ error: "You already have an active session for this ad" });
          }
        }
      }

      // Create session
      const sessionId = crypto.randomUUID();
      adViewSessions.set(sessionId, {
        userId: decoded.userId,
        campaignId,
        startedAt: Date.now(),
        requiredDuration: Math.max(duration, 10), // Minimum 10 seconds
        claimed: false,
      });

      res.json({ sessionId, duration: Math.max(duration, 10) });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to start ad view" });
    }
  });

  // Claim reward after viewing
  app.post(`${API_PREFIX}/ad-views/claim`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const { sessionId } = req.body;
      if (!sessionId) return res.status(400).json({ error: "sessionId is required" });

      const session = adViewSessions.get(sessionId);
      if (!session) return res.status(404).json({ error: "Session not found or expired" });

      // Verify ownership
      if (session.userId !== decoded.userId) {
        return res.status(403).json({ error: "This session does not belong to you" });
      }

      // Verify not already claimed
      if (session.claimed) {
        return res.status(400).json({ error: "Reward already claimed" });
      }

      // Verify minimum time has elapsed (allow 2s tolerance)
      const elapsedSeconds = (Date.now() - session.startedAt) / 1000;
      if (elapsedSeconds < session.requiredDuration - 2) {
        return res.status(400).json({
          error: `Must view for at least ${session.requiredDuration} seconds. Only ${Math.floor(elapsedSeconds)}s elapsed.`,
        });
      }

      // Session expired (10 min window)
      if (elapsedSeconds > 600) {
        adViewSessions.delete(sessionId);
        return res.status(400).json({ error: "Session expired. Please start a new view." });
      }

      // Mark as claimed before processing
      session.claimed = true;

      // Record the click/view — deducts CPC from campaign escrow
      const { campaignService } = await import("./campaign-service");
      const campaign = await campaignService.getCampaign(session.campaignId);
      if (!campaign) {
        session.claimed = false;
        return res.status(400).json({ error: "Campaign no longer exists" });
      }

      const cpcAmount = parseFloat(campaign.cpc || "0");
      if (cpcAmount <= 0) {
        session.claimed = false;
        return res.status(400).json({ error: "Invalid campaign CPC" });
      }

      try {
        await campaignService.recordClick(session.campaignId, cpcAmount);
      } catch (err: any) {
        session.claimed = false;
        return res.status(400).json({ error: err.message || "Failed to record ad view" });
      }

      // Credit the viewer's balance
      await db
        .update(users)
        .set({ balance: sql`CAST(${users.balance} AS numeric) + ${cpcAmount}` })
        .where(eq(users.id, decoded.userId));

      // Log the earning for the viewer
      await db.insert(txns).values({
        userId: decoded.userId,
        type: "click_earning",
        amount: cpcAmount.toFixed(2),
        description: `Earned from viewing ad "${campaign.name}"`,
        status: "completed",
      });

      // Invalidate cache
      await cache.del(`user:${decoded.userId}`);

      // Distribute referral commissions up to 5 levels
      const { referralService } = await import("./referral-service");
      referralService.distributeCommissions(
        decoded.userId,
        cpcAmount,
        `ad view "${campaign.name}"`
      ).catch((err) => console.error("Commission distribution error:", err));

      // Gamification: XP, streak, achievements
      const { gamificationService } = await import("./gamification-service");
      gamificationService.onAdViewCompleted(decoded.userId)
        .catch((err) => console.error("Gamification error:", err));

      // Clean up session
      adViewSessions.delete(sessionId);

      res.json({ success: true, message: "Reward claimed successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to claim reward" });
    }
  });

  // ==========================================
  // Payment routes — Chapa + Manual
  // ==========================================

  // Deposit via Chapa (automated)
  app.post(`${API_PREFIX}/payments/deposit`, paymentRateLimiter, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const user = await storage.getUser(decoded.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { amount } = req.body;
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 10) {
        return res.status(400).json({ error: "Minimum deposit is ETB 10.00" });
      }

      const { chapaService } = await import("./chapa");
      const txRef = chapaService.generateTxRef();

      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // Initialize Chapa payment
      const chapaResponse = await chapaService.initializePayment({
        amount: numAmount.toFixed(2),
        currency: "ETB",
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        phone_number: user.phoneNumber,
        tx_ref: txRef,
        callback_url: `${baseUrl}/api/v1/payments/verify/${txRef}`,
        return_url: `${baseUrl}/wallet?payment=success&tx_ref=${txRef}`,
        customization: {
          title: "AdConnect Deposit",
          description: `Deposit ETB ${numAmount.toFixed(2)} to your wallet`,
        },
      });

      // Save payment record to DB
      await storage.createChapaPayment({
        userId: decoded.userId,
        txRef,
        amount: numAmount.toFixed(2),
        currency: "ETB",
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        status: "pending",
        checkoutUrl: chapaResponse.data.checkout_url,
      });

      res.json({
        checkoutUrl: chapaResponse.data.checkout_url,
        txRef,
      });
    } catch (error: any) {
      console.error("Deposit error:", error);
      res.status(500).json({ error: error.message || "Failed to initiate deposit" });
    }
  });

  // Deposit manually (bank transfer, etc.)
  app.post(`${API_PREFIX}/payments/deposit/manual`, paymentRateLimiter, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const user = await storage.getUser(decoded.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { amount, method, reference } = req.body;
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 10) {
        return res.status(400).json({ error: "Minimum deposit is ETB 10.00" });
      }
      if (!method) return res.status(400).json({ error: "Payment method required" });

      const txRef = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create a pending deposit request for admin review
      await storage.createDepositRequest({
        userId: decoded.userId,
        amount: numAmount.toFixed(2),
        method,
        status: "pending",
      });

      // Also log as a pending transaction
      await db.insert(txns).values({
        userId: decoded.userId,
        type: "deposit",
        amount: numAmount.toFixed(2),
        description: `Manual deposit via ${method}${reference ? ` (ref: ${reference})` : ""} — pending admin approval`,
        status: "pending",
      });

      res.json({
        success: true,
        message: "Your deposit request has been submitted. It will be credited after admin verification.",
        txRef,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to submit deposit" });
    }
  });

  // Verify Chapa payment (callback + manual check)
  app.get(`${API_PREFIX}/payments/verify/:txRef`, async (req, res) => {
    try {
      const { txRef } = req.params;
      if (!txRef) return res.status(400).json({ error: "Transaction reference required" });

      const payment = await storage.getChapaPaymentByTxRef(txRef);
      if (!payment) return res.status(404).json({ error: "Payment not found" });

      // Already completed
      if (payment.status === "completed") {
        return res.json({ status: "completed", message: "Payment already credited" });
      }

      // Verify with Chapa
      const { chapaService } = await import("./chapa");
      const verification = await chapaService.verifyPayment(txRef);

      if (verification.data.status === "success") {
        // Update payment record
        await storage.updateChapaPayment(payment.id, {
          status: "completed",
          chapaReference: verification.data.reference,
          paymentMethod: verification.data.method,
          charge: verification.data.charge,
          mode: verification.data.mode,
          type: verification.data.type,
          completedAt: new Date(),
        });

        // Credit user balance
        const creditAmount = parseFloat(payment.amount);
        await db
          .update(users)
          .set({ balance: sql`CAST(${users.balance} AS numeric) + ${creditAmount}` })
          .where(eq(users.id, payment.userId));

        // Log the deposit transaction
        await db.insert(txns).values({
          userId: payment.userId,
          type: "deposit",
          amount: creditAmount.toFixed(2),
          description: `Chapa deposit — ${verification.data.method || "online payment"}`,
          status: "completed",
        });

        // Invalidate cache
        await cache.del(`user:${payment.userId}`);

        // Redirect back to wallet (for browser callbacks)
        if (req.headers.accept?.includes("text/html")) {
          return res.redirect(`/wallet?payment=success&amount=${payment.amount}`);
        }

        return res.json({ status: "completed", message: "Payment verified and credited" });
      }

      // Payment not yet successful
      await storage.updateChapaPayment(payment.id, {
        status: verification.data.status || "failed",
      });

      if (req.headers.accept?.includes("text/html")) {
        return res.redirect(`/wallet?payment=failed`);
      }

      res.json({ status: verification.data.status, message: "Payment not yet completed" });
    } catch (error: any) {
      console.error("Verification error:", error);
      if (req.headers.accept?.includes("text/html")) {
        return res.redirect(`/wallet?payment=error`);
      }
      res.status(500).json({ error: error.message || "Verification failed" });
    }
  });

  // Withdraw funds
  app.post(`${API_PREFIX}/payments/withdraw`, paymentRateLimiter, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const user = await storage.getUser(decoded.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { amount, method, accountDetails } = req.body;
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 10) {
        return res.status(400).json({ error: "Minimum withdrawal is ETB 10.00" });
      }
      if (!method) return res.status(400).json({ error: "Withdrawal method required" });

      const userBalance = parseFloat(user.balance);
      if (userBalance < numAmount) {
        return res.status(400).json({
          error: `Insufficient balance. You have ETB ${userBalance.toFixed(2)}`,
        });
      }

      // Deduct from balance immediately (to prevent double-withdrawal)
      const newBalance = (userBalance - numAmount).toFixed(2);
      await db
        .update(users)
        .set({ balance: newBalance })
        .where(eq(users.id, decoded.userId));

      // Create withdrawal request for admin processing
      await storage.createWithdrawalRequest({
        userId: decoded.userId,
        amount: numAmount.toFixed(2),
        method,
        status: "pending",
      });

      // Log the withdrawal transaction
      await db.insert(txns).values({
        userId: decoded.userId,
        type: "withdrawal",
        amount: `-${numAmount.toFixed(2)}`,
        description: `Withdrawal via ${method}${accountDetails ? ` to ${accountDetails}` : ""} — processing`,
        status: "pending",
      });

      // Invalidate cache
      await cache.del(`user:${decoded.userId}`);

      res.json({
        success: true,
        message: "Withdrawal request submitted. Processing typically takes 1-3 business days.",
        newBalance,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to process withdrawal" });
    }
  });

  // Chapa webhook handler
  app.post(`${API_PREFIX}/webhooks/chapa`, async (req, res) => {
    try {
      const { chapaService } = await import("./chapa");
      const signature = req.headers["chapa-signature"] as string || "";
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      if (signature && !chapaService.verifyWebhookSignature(payload, signature)) {
        return res.status(403).json({ error: "Invalid webhook signature" });
      }

      const { event, data } = req.body;
      if (!data?.tx_ref) return res.status(400).json({ error: "Missing tx_ref" });

      const payment = await storage.getChapaPaymentByTxRef(data.tx_ref);
      if (!payment) return res.status(404).json({ error: "Payment not found" });

      if (payment.status === "completed") {
        return res.json({ status: "already_processed" });
      }

      if (data.status === "success") {
        // Update payment record
        await storage.updateChapaPayment(payment.id, {
          status: "completed",
          chapaReference: data.reference,
          paymentMethod: data.method,
          charge: data.charge,
          mode: data.mode,
          type: data.type,
          completedAt: new Date(),
        });

        // Credit user balance
        const creditAmount = parseFloat(payment.amount);
        await db
          .update(users)
          .set({ balance: sql`CAST(${users.balance} AS numeric) + ${creditAmount}` })
          .where(eq(users.id, payment.userId));

        // Log the deposit transaction
        await db.insert(txns).values({
          userId: payment.userId,
          type: "deposit",
          amount: creditAmount.toFixed(2),
          description: `Chapa deposit — ${data.method || "online payment"}`,
          status: "completed",
        });

        await cache.del(`user:${payment.userId}`);
      } else {
        await storage.updateChapaPayment(payment.id, {
          status: data.status || "failed",
        });
      }

      res.json({ status: "ok" });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // ==========================================
  // Campaign routes (with escrow/refund)
  // ==========================================

  // Create a campaign — freezes budget from user balance into escrow
  app.post(`${API_PREFIX}/campaigns`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid or expired token" });

      const { name, type, description, url, imageUrl, budget, cpc, duration } = req.body;

      if (!name || !budget || !cpc) {
        return res.status(400).json({ error: "Name, budget, and cost per click are required" });
      }

      const { campaignService } = await import("./campaign-service");
      const campaign = await campaignService.createCampaign({
        userId: decoded.userId,
        name,
        type: type || "link",
        description: description || "",
        url: url || "",
        imageUrl,
        budget: budget.toString(),
        cpc: cpc.toString(),
        duration: parseInt(duration) || 15,
      });

      res.status(201).json({ campaign, message: "Campaign created. Budget has been placed in escrow pending review." });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create campaign" });
    }
  });

  // List user's campaigns
  app.get(`${API_PREFIX}/campaigns`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid or expired token" });

      const { campaignService } = await import("./campaign-service");
      const campaigns = await campaignService.getUserCampaigns(decoded.userId);
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch campaigns" });
    }
  });

  // Get campaign details
  app.get(`${API_PREFIX}/campaigns/:id`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid or expired token" });

      const { campaignService } = await import("./campaign-service");
      const campaign = await campaignService.getCampaign(req.params.id);
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      if (campaign.userId !== decoded.userId && decoded.role !== "admin") {
        return res.status(403).json({ error: "Not authorized" });
      }

      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch campaign" });
    }
  });

  // Cancel a campaign — refunds unspent escrow to user
  app.patch(`${API_PREFIX}/campaigns/:id/cancel`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid or expired token" });

      const { campaignService } = await import("./campaign-service");
      const campaign = await campaignService.cancelCampaign(req.params.id, decoded.userId);
      res.json({ campaign, message: "Campaign cancelled. Unspent escrow has been refunded to your balance." });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to cancel campaign" });
    }
  });

  // Delete a campaign — refunds unspent escrow and removes campaign
  app.delete(`${API_PREFIX}/campaigns/:id`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid or expired token" });

      const { campaignService } = await import("./campaign-service");
      const result = await campaignService.deleteCampaign(req.params.id, decoded.userId);
      res.json({ ...result, message: `Campaign deleted. ETB ${result.refunded} refunded to your balance.` });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to delete campaign" });
    }
  });

  // Admin: approve a campaign
  app.patch(`${API_PREFIX}/campaigns/:id/approve`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded || (decoded.role !== "admin" && decoded.role !== "staff")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { campaignService } = await import("./campaign-service");
      const campaign = await campaignService.approveCampaign(req.params.id, decoded.userId);
      res.json({ campaign, message: "Campaign approved and is now active." });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to approve campaign" });
    }
  });

  // Admin: reject a campaign — refunds escrow to user
  app.patch(`${API_PREFIX}/campaigns/:id/reject`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded || (decoded.role !== "admin" && decoded.role !== "staff")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { reason } = req.body;
      const { campaignService } = await import("./campaign-service");
      const campaign = await campaignService.rejectCampaign(req.params.id, decoded.userId, reason || "Campaign rejected by admin");
      res.json({ campaign, message: "Campaign rejected. Escrow has been refunded to the user." });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to reject campaign" });
    }
  });

  // Admin: gamification configuration (read-only, serves level/achievement/challenge definitions)
  app.get(`${API_PREFIX}/admin/gamification`, async (req, res) => {
    try {
      const { ACHIEVEMENTS, LEVELS, DAILY_CHALLENGES, WEEKLY_CHALLENGES } = await import("./gamification-service");

      res.json({
        achievements: ACHIEVEMENTS,
        levels: LEVELS,
        challenges: [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch gamification data" });
    }
  });

  // Admin: list all campaigns
  app.get(`${API_PREFIX}/admin/campaigns`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded || (decoded.role !== "admin" && decoded.role !== "staff")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { campaignService } = await import("./campaign-service");
      const campaigns = await campaignService.getAllCampaigns();
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch campaigns" });
    }
  });

  // Blog posts routes
  app.get(`${API_PREFIX}/blog-posts`, async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get(`${API_PREFIX}/blog-posts/:id`, async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  app.post(`${API_PREFIX}/blog-posts`, async (req, res) => {
    try {
      const validated = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validated);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create blog post" });
    }
  });

  app.patch(`${API_PREFIX}/blog-posts/:id`, async (req, res) => {
    try {
      const post = await storage.updateBlogPost(req.params.id, req.body);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update blog post" });
    }
  });

  app.delete(`${API_PREFIX}/blog-posts/:id`, async (req, res) => {
    try {
      const success = await storage.deleteBlogPost(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  app.post(`${API_PREFIX}/blog-posts/:id/view`, async (req, res) => {
    try {
      await storage.incrementBlogPostViews(req.params.id);
      res.status(200).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to increment views" });
    }
  });

  // Admin campaigns routes
  app.get(`${API_PREFIX}/admin-campaigns`, async (req, res) => {
    try {
      const campaigns = await storage.getAllAdminCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin campaigns" });
    }
  });

  app.get(`${API_PREFIX}/admin-campaigns/:id`, async (req, res) => {
    try {
      const campaign = await storage.getAdminCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Admin campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin campaign" });
    }
  });

  app.post(`${API_PREFIX}/admin-campaigns`, async (req, res) => {
    try {
      const validated = insertAdminCampaignSchema.parse(req.body);
      const campaign = await storage.createAdminCampaign(validated);
      res.status(201).json(campaign);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create admin campaign" });
    }
  });

  app.patch(`${API_PREFIX}/admin-campaigns/:id`, async (req, res) => {
    try {
      const validated = insertAdminCampaignSchema.partial().parse(req.body);
      const campaign = await storage.updateAdminCampaign(req.params.id, validated);
      if (!campaign) {
        return res.status(404).json({ error: "Admin campaign not found" });
      }
      res.json(campaign);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update admin campaign" });
    }
  });

  app.delete(`${API_PREFIX}/admin-campaigns/:id`, async (req, res) => {
    try {
      const success = await storage.deleteAdminCampaign(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Admin campaign not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete admin campaign" });
    }
  });

  // Withdrawal requests routes
  app.get(`${API_PREFIX}/withdrawal-requests`, async (req, res) => {
    try {
      const requests = await storage.getAllWithdrawalRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch withdrawal requests" });
    }
  });

  app.get(`${API_PREFIX}/withdrawal-requests/:id`, async (req, res) => {
    try {
      const request = await storage.getWithdrawalRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Withdrawal request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch withdrawal request" });
    }
  });

  app.post(`${API_PREFIX}/withdrawal-requests`, async (req, res) => {
    try {
      const validated = insertWithdrawalRequestSchema.parse(req.body);
      const request = await storage.createWithdrawalRequest(validated);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create withdrawal request" });
    }
  });

  app.patch(`${API_PREFIX}/withdrawal-requests/:id`, async (req, res) => {
    try {
      const request = await storage.updateWithdrawalRequest(req.params.id, req.body);
      if (!request) {
        return res.status(404).json({ error: "Withdrawal request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update withdrawal request" });
    }
  });

  // Deposit requests routes
  app.get(`${API_PREFIX}/deposit-requests`, async (req, res) => {
    try {
      const requests = await storage.getAllDepositRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deposit requests" });
    }
  });

  app.get(`${API_PREFIX}/deposit-requests/:id`, async (req, res) => {
    try {
      const request = await storage.getDepositRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Deposit request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deposit request" });
    }
  });

  app.post(`${API_PREFIX}/deposit-requests`, async (req, res) => {
    try {
      const validated = insertDepositRequestSchema.parse(req.body);
      const request = await storage.createDepositRequest(validated);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create deposit request" });
    }
  });

  app.patch(`${API_PREFIX}/deposit-requests/:id`, async (req, res) => {
    try {
      const request = await storage.updateDepositRequest(req.params.id, req.body);
      if (!request) {
        return res.status(404).json({ error: "Deposit request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update deposit request" });
    }
  });

  // Financial settings routes
  app.get(`${API_PREFIX}/financial-settings`, async (req, res) => {
    try {
      const settings = await storage.getFinancialSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch financial settings" });
    }
  });

  app.patch(`${API_PREFIX}/financial-settings`, async (req, res) => {
    try {
      const validated = insertFinancialSettingsSchema.partial().parse(req.body);

      if (validated.taxPercentage !== undefined) {
        const tax = parseFloat(validated.taxPercentage);
        if (isNaN(tax) || tax < 0 || tax > 100) {
          return res.status(400).json({ error: "Tax percentage must be between 0 and 100" });
        }
      }

      if (validated.withdrawalFeePercentage !== undefined) {
        const withdrawalFee = parseFloat(validated.withdrawalFeePercentage);
        if (isNaN(withdrawalFee) || withdrawalFee < 0 || withdrawalFee > 100) {
          return res
            .status(400)
            .json({ error: "Withdrawal fee percentage must be between 0 and 100" });
        }
      }

      if (validated.depositFeePercentage !== undefined) {
        const depositFee = parseFloat(validated.depositFeePercentage);
        if (isNaN(depositFee) || depositFee < 0 || depositFee > 100) {
          return res
            .status(400)
            .json({ error: "Deposit fee percentage must be between 0 and 100" });
        }
      }

      const settings = await storage.updateFinancialSettings(validated);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update financial settings" });
    }
  });

  // Transaction logs routes
  app.get(`${API_PREFIX}/transaction-logs`, async (req, res) => {
    try {
      const { txnId } = req.query;

      if (txnId && typeof txnId === "string") {
        const log = await storage.getTransactionLogByTxnId(txnId);
        return res.json(log ? [log] : []);
      }

      const logs = await storage.getAllTransactionLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction logs" });
    }
  });

  app.post(`${API_PREFIX}/transaction-logs`, async (req, res) => {
    try {
      const validated = insertTransactionLogSchema.parse(req.body);
      const log = await storage.createTransactionLog(validated);
      res.status(201).json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create transaction log" });
    }
  });

  // Referral settings routes
  app.get(`${API_PREFIX}/referral-settings`, async (req, res) => {
    try {
      const settings = await storage.getReferralSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referral settings" });
    }
  });

  app.patch(`${API_PREFIX}/referral-settings`, async (req, res) => {
    try {
      const validated = insertReferralSettingsSchema.partial().parse(req.body);

      const percentageFields = [
        { field: "level1Percentage", name: "Level 1" },
        { field: "level2Percentage", name: "Level 2" },
        { field: "level3Percentage", name: "Level 3" },
        { field: "level4Percentage", name: "Level 4" },
        { field: "level5Percentage", name: "Level 5" },
      ];

      for (const { field, name } of percentageFields) {
        const value = validated[field as keyof typeof validated];
        if (value !== undefined && typeof value === "string") {
          const percentage = parseFloat(value);
          if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            return res.status(400).json({ error: `${name} percentage must be between 0 and 100` });
          }
        }
      }

      if (validated.maxLevels !== undefined) {
        if (validated.maxLevels < 1 || validated.maxLevels > 5) {
          return res.status(400).json({ error: "Maximum levels must be between 1 and 5" });
        }
      }

      const settings = await storage.updateReferralSettings(validated);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update referral settings" });
    }
  });

  // Role routes
  app.get(`${API_PREFIX}/roles`, async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.get(`${API_PREFIX}/roles/:id`, async (req, res) => {
    try {
      const role = await storage.getRole(req.params.id);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch role" });
    }
  });

  app.post(`${API_PREFIX}/roles`, async (req, res) => {
    try {
      const validated = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validated);
      res.status(201).json(role);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create role" });
    }
  });

  app.patch(`${API_PREFIX}/roles/:id`, async (req, res) => {
    try {
      const validated = insertRoleSchema.partial().parse(req.body);
      const role = await storage.updateRole(req.params.id, validated);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(role);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update role" });
    }
  });

  app.delete(`${API_PREFIX}/roles/:id`, async (req, res) => {
    try {
      const deleted = await storage.deleteRole(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json({ message: "Role deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to delete role" });
    }
  });

  app.get(`${API_PREFIX}/staff-members`, async (req, res) => {
    try {
      const staff = await storage.getAllStaffMembers();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff members" });
    }
  });

  app.get(`${API_PREFIX}/staff-members/:id`, async (req, res) => {
    try {
      const staff = await storage.getStaffMember(req.params.id);
      if (!staff) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff member" });
    }
  });

  app.post(`${API_PREFIX}/staff-members`, async (req, res) => {
    try {
      const validated = insertStaffMemberSchema.parse(req.body);
      const staff = await storage.createStaffMember(validated);
      res.status(201).json(staff);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create staff member" });
    }
  });

  app.patch(`${API_PREFIX}/staff-members/:id`, async (req, res) => {
    try {
      const validated = insertStaffMemberSchema.partial().parse(req.body);
      const staff = await storage.updateStaffMember(req.params.id, validated);
      if (!staff) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.json(staff);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update staff member" });
    }
  });

  app.delete(`${API_PREFIX}/staff-members/:id`, async (req, res) => {
    try {
      const deleted = await storage.deleteStaffMember(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.json({ message: "Staff member deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to delete staff member" });
    }
  });

  app.get(`${API_PREFIX}/subscription-plans`, async (req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  app.get(`${API_PREFIX}/subscription-plans/:id`, async (req, res) => {
    try {
      const plan = await storage.getSubscriptionPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: "Subscription plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription plan" });
    }
  });

  app.post(`${API_PREFIX}/subscription-plans`, async (req, res) => {
    try {
      const validated = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(validated);
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create subscription plan" });
    }
  });

  app.patch(`${API_PREFIX}/subscription-plans/:id`, async (req, res) => {
    try {
      const validated = insertSubscriptionPlanSchema.partial().parse(req.body);
      const plan = await storage.updateSubscriptionPlan(req.params.id, validated);
      if (!plan) {
        return res.status(404).json({ error: "Subscription plan not found" });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update subscription plan" });
    }
  });

  app.delete(`${API_PREFIX}/subscription-plans/:id`, async (req, res) => {
    try {
      const deleted = await storage.deleteSubscriptionPlan(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Subscription plan not found" });
      }
      res.json({ message: "Subscription plan deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to delete subscription plan" });
    }
  });

  // FAQ routes
  app.get(`${API_PREFIX}/faqs`, async (req, res) => {
    try {
      const faqs = await storage.getAllFaqs();
      res.json(faqs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch FAQs" });
    }
  });

  app.get(`${API_PREFIX}/faqs/:id`, async (req, res) => {
    try {
      const faq = await storage.getFaq(req.params.id);
      if (!faq) {
        return res.status(404).json({ error: "FAQ not found" });
      }
      res.json(faq);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch FAQ" });
    }
  });

  app.post(`${API_PREFIX}/faqs`, async (req, res) => {
    try {
      const validated = insertFaqSchema.parse(req.body);
      const faq = await storage.createFaq(validated);
      res.status(201).json(faq);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create FAQ" });
    }
  });

  app.patch(`${API_PREFIX}/faqs/:id`, async (req, res) => {
    try {
      const validated = insertFaqSchema.partial().parse(req.body);
      const faq = await storage.updateFaq(req.params.id, validated);
      if (!faq) {
        return res.status(404).json({ error: "FAQ not found" });
      }
      res.json(faq);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update FAQ" });
    }
  });

  app.delete(`${API_PREFIX}/faqs/:id`, async (req, res) => {
    try {
      const deleted = await storage.deleteFaq(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "FAQ not found" });
      }
      res.json({ message: "FAQ deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to delete FAQ" });
    }
  });

  app.get(`${API_PREFIX}/payment-methods/user/:userId`, async (req, res) => {
    try {
      const methods = await storage.getUserPaymentMethods(req.params.userId);
      res.json(methods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  app.get(`${API_PREFIX}/payment-methods/:id`, async (req, res) => {
    try {
      const method = await storage.getPaymentMethod(req.params.id);
      if (!method) {
        return res.status(404).json({ error: "Payment method not found" });
      }
      res.json(method);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment method" });
    }
  });

  app.get(`${API_PREFIX}/audit-logs`, async (req, res) => {
    try {
      const { adminId, resource, resourceId } = req.query;

      if (adminId && typeof adminId === "string") {
        const logs = await storage.getAuditLogsByAdmin(adminId);
        return res.json(logs);
      }

      if (resource && typeof resource === "string") {
        const logs = await storage.getAuditLogsByResource(
          resource,
          resourceId as string | undefined
        );
        return res.json(logs);
      }

      const logs = await storage.getAllAuditLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // ==========================================
  // Leaderboard API — real data from DB
  // ==========================================

  app.get(`${API_PREFIX}/leaderboard/:type`, async (req, res) => {
    try {
      const { type } = req.params;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      let results: any[] = [];

      switch (type) {
        case "earners":
          results = await db
            .select({
              userId: users.id,
              name: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
              value: sql`CAST(${users.lifetimeEarnings} AS numeric)`,
            })
            .from(users)
            .orderBy(sql`CAST(${users.lifetimeEarnings} AS numeric) DESC`)
            .limit(limit);
          break;

        case "advertisers":
          results = await db
            .select({
              userId: users.id,
              name: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
              value: sql`CAST(${users.lifetimeSpending} AS numeric)`,
            })
            .from(users)
            .orderBy(sql`CAST(${users.lifetimeSpending} AS numeric) DESC`)
            .limit(limit);
          break;

        case "streaks":
          results = await db
            .select({
              userId: users.id,
              name: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
              value: users.currentStreak,
            })
            .from(users)
            .orderBy(sql`${users.currentStreak} DESC`)
            .limit(limit);
          break;

        case "referrers":
          // Count referrals per user
          results = await db
            .select({
              userId: users.id,
              name: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
              value: sql`(SELECT COUNT(*) FROM users AS r WHERE r.referred_by = ${users.id})`,
            })
            .from(users)
            .orderBy(sql`(SELECT COUNT(*) FROM users AS r WHERE r.referred_by = ${users.id}) DESC`)
            .limit(limit);
          break;

        default:
          return res.status(400).json({ error: "Invalid leaderboard type" });
      }

      // Add rank and determine if current user (from token if present)
      let currentUserId: string | null = null;
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (token) {
        try {
          const decoded = jwtService.verifyAccessToken(token);
          currentUserId = decoded?.userId || null;
        } catch {}
      }

      const ranked = results.map((r: any, i: number) => ({
        rank: i + 1,
        userId: r.userId,
        name: r.name,
        value: parseFloat(r.value) || 0,
        isCurrentUser: r.userId === currentUserId,
      }));

      res.json(ranked);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch leaderboard" });
    }
  });

  // ==========================================
  // Gamification API
  // ==========================================

  // Get user gamification state (XP, level, streak, all levels)
  app.get(`${API_PREFIX}/user/gamification`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const user = await storage.getUser(decoded.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { LEVELS } = await import("./gamification-service");

      res.json({
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        streakFreezes: user.streakFreezes,
        levels: LEVELS,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch gamification data" });
    }
  });

  // Get user achievements with real progress
  app.get(`${API_PREFIX}/user/achievements`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const { gamificationService } = await import("./gamification-service");
      const { achievements, newlyUnlocked } = await gamificationService.getAchievements(decoded.userId);

      res.json({ achievements, newlyUnlocked });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch achievements" });
    }
  });

  // Get daily/weekly challenges with real progress
  app.get(`${API_PREFIX}/user/challenges`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const { gamificationService } = await import("./gamification-service");
      const challenges = await gamificationService.getChallenges(decoded.userId);

      res.json(challenges);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch challenges" });
    }
  });

  // Claim a challenge reward
  app.post(`${API_PREFIX}/user/challenges/:id/claim`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const { gamificationService } = await import("./gamification-service");
      const result = await gamificationService.claimChallengeReward(decoded.userId, req.params.id);

      if (!result.success) return res.status(400).json({ error: result.message });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to claim reward" });
    }
  });

  // ==========================================
  // Referral stats API
  // ==========================================

  app.get(`${API_PREFIX}/user/referrals`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const user = await storage.getUser(decoded.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { referralService } = await import("./referral-service");

      // Get multi-level referral tree (3 levels deep)
      const tree = await referralService.getReferralTree(decoded.userId, 3);

      // Get commission history
      const commissions = await referralService.getCommissionHistory(decoded.userId, 20);

      // Calculate totals
      const commissionTotal = await db
        .select({
          total: sql`COALESCE(SUM(CAST(amount AS numeric)), 0)`,
        })
        .from(txns)
        .where(and(
          eq(txns.userId, decoded.userId),
          sql`(${txns.type} = 'referral_commission' OR ${txns.type} = 'referral_bonus')`
        ));

      const totalCommission = parseFloat(commissionTotal[0]?.total as string) || 0;

      // Count total referrals across all levels
      const countAll = (nodes: any[]): number =>
        nodes.reduce((sum: number, n: any) => sum + 1 + countAll(n.children || []), 0);

      // Get commission levels config
      const levels = await referralService.getCommissionLevels();

      res.json({
        referralCode: user.referralCode,
        totalReferrals: countAll(tree),
        directReferrals: tree.length,
        totalCommission: totalCommission.toFixed(2),
        commissionLevels: levels,
        tree,
        recentCommissions: commissions.map((c: any) => ({
          id: c.id,
          amount: c.amount,
          description: c.description,
          type: c.type,
          createdAt: c.createdAt,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch referral data" });
    }
  });

  // ==========================================
  // Admin: Payment Processing
  // ==========================================

  // Get pending deposit requests
  app.get(`${API_PREFIX}/admin/deposits/pending`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const admin = await storage.getUser(decoded.userId);
      if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const deposits = await db.select().from(depositRequests).where(eq(depositRequests.status, "pending")).orderBy(sql`${depositRequests.createdAt} DESC`);
      res.json(deposits);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch deposits" });
    }
  });

  // Approve a manual deposit
  app.post(`${API_PREFIX}/admin/deposits/:id/approve`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const admin = await storage.getUser(decoded.userId);
      if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const deposit = await storage.getDepositRequest(req.params.id);
      if (!deposit) return res.status(404).json({ error: "Deposit not found" });
      if (deposit.status !== "pending") return res.status(400).json({ error: "Deposit already processed" });

      await db.transaction(async (tx) => {
        // Credit user balance
        const creditAmount = parseFloat(deposit.amount);
        await tx
          .update(users)
          .set({ balance: sql`CAST(${users.balance} AS numeric) + ${creditAmount}` })
          .where(eq(users.id, deposit.userId));

        // Log completed transaction
        await tx.insert(txns).values({
          userId: deposit.userId,
          type: "deposit",
          amount: creditAmount.toFixed(2),
          description: `Manual deposit approved by admin`,
          status: "completed",
        });
      });

      await storage.updateDepositRequest(req.params.id, { status: "approved" });
      await cache.del(`user:${deposit.userId}`).catch(() => {});

      res.json({ success: true, message: "Deposit approved and credited" });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to approve deposit" });
    }
  });

  // Reject a manual deposit
  app.post(`${API_PREFIX}/admin/deposits/:id/reject`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const admin = await storage.getUser(decoded.userId);
      if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      await storage.updateDepositRequest(req.params.id, {
        status: "rejected",
      });

      res.json({ success: true, message: "Deposit rejected" });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to reject deposit" });
    }
  });

  // Get pending withdrawal requests
  app.get(`${API_PREFIX}/admin/withdrawals/pending`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const admin = await storage.getUser(decoded.userId);
      if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const withdrawals = await db.select().from(withdrawalRequests).where(eq(withdrawalRequests.status, "pending")).orderBy(sql`${withdrawalRequests.createdAt} DESC`);
      res.json(withdrawals);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch withdrawals" });
    }
  });

  // Approve and process a withdrawal
  app.post(`${API_PREFIX}/admin/withdrawals/:id/approve`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const admin = await storage.getUser(decoded.userId);
      if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const withdrawal = await storage.getWithdrawalRequest(req.params.id);
      if (!withdrawal) return res.status(404).json({ error: "Withdrawal not found" });
      if (withdrawal.status !== "pending") return res.status(400).json({ error: "Withdrawal already processed" });

      // Update withdrawal status to approved (balance already deducted when user submitted)
      await storage.updateWithdrawalRequest(req.params.id, { status: "approved" });

      // Update the corresponding pending transaction to completed
      await db
        .update(txns)
        .set({ status: "completed", description: sql`${txns.description} || ' — approved'` })
        .where(and(
          eq(txns.userId, withdrawal.userId),
          sql`${txns.type} = 'withdrawal'`,
          sql`${txns.status} = 'pending'`
        ));

      res.json({ success: true, message: "Withdrawal approved" });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to approve withdrawal" });
    }
  });

  // Reject a withdrawal — refund the balance back
  app.post(`${API_PREFIX}/admin/withdrawals/:id/reject`, async (req, res) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ error: "Authentication required" });

      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) return res.status(401).json({ error: "Invalid token" });

      const admin = await storage.getUser(decoded.userId);
      if (!admin || admin.role !== "admin") return res.status(403).json({ error: "Admin access required" });

      const withdrawal = await storage.getWithdrawalRequest(req.params.id);
      if (!withdrawal) return res.status(404).json({ error: "Withdrawal not found" });
      if (withdrawal.status !== "pending") return res.status(400).json({ error: "Withdrawal already processed" });

      // Refund the balance back to user
      await db.transaction(async (tx) => {
        const refundAmount = parseFloat(withdrawal.amount);
        await tx
          .update(users)
          .set({ balance: sql`CAST(${users.balance} AS numeric) + ${refundAmount}` })
          .where(eq(users.id, withdrawal.userId));

        await tx.insert(txns).values({
          userId: withdrawal.userId,
          type: "withdrawal_refund",
          amount: refundAmount.toFixed(2),
          description: `Withdrawal rejected — funds returned to wallet`,
          status: "completed",
        });
      });

      await storage.updateWithdrawalRequest(req.params.id, { status: "rejected" });
      await cache.del(`user:${withdrawal.userId}`).catch(() => {});

      res.json({ success: true, message: "Withdrawal rejected, balance refunded" });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to reject withdrawal" });
    }
  });
}
