import type { Express } from "express";
import { pgStorage as storage } from "./pg-storage";
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
      const { firstName, lastName, email, username, phoneNumber, dateOfBirth, password } = req.body;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
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
      });

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
}
