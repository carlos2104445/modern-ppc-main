import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
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
  insertChapaPaymentSchema,
  insertAdViewSchema,
  insertFraudDetectionSettingsSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  insertAdViewingUpgradeSchema,
  insertUserAdViewingUpgradeSchema,
} from "@shared/schema";
import { randomBytes } from "crypto";
import { fraudDetection } from "./fraud-detection";
import { logAdminAction } from "./audit-logger";
import bcrypt from "bcrypt";
import { chapaService } from "./chapa";
import { requireAuth, requireAdmin, type AuthRequest } from "./middleware/auth";
import { apiRateLimiter, adViewRateLimiter, authRateLimiter } from "./middleware/rate-limit";
import { initializeWebSocket, emitFraudAlert } from "./websocket";
import { errorHandler, asyncHandler } from "./middleware/error-handler";
import {
  AuthErrors,
  ValidationErrors,
  ResourceErrors,
  AdTrackingErrors,
  FraudErrors,
  BusinessLogicErrors,
  AppError,
  ErrorCode,
} from "./errors";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post(
    "/api/auth/password-reset-request",
    apiRateLimiter,
    asyncHandler(async (req, res) => {
      const validated = passwordResetRequestSchema.parse(req.body);
      const user = await storage.getUserByEmail(validated.email);

      if (!user) {
        // Don't reveal if user exists
        return res.json({
          message: "If an account exists with this email, you will receive a password reset link.",
        });
      }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
      });

      // In a real app, we would send an email here
      res.json({
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    })
  );

  app.post(
    "/api/auth/password-reset-confirm",
    asyncHandler(async (req, res) => {
      const validated = passwordResetConfirmSchema.parse(req.body);
      const resetToken = await storage.getPasswordResetToken(validated.token);

      if (!resetToken) {
        throw AuthErrors.invalidToken();
      }

      if (resetToken.used) {
        throw AuthErrors.invalidToken();
      }

      if (resetToken.expiresAt < new Date()) {
        throw AuthErrors.tokenExpired();
      }

      await storage.updateUserPassword(resetToken.userId, validated.password);
      await storage.markTokenAsUsed(resetToken.id);

      res.json({ message: "Password reset successfully" });
    })
  );

  // Blog posts routes
  app.get(
    "/api/blog-posts",
    asyncHandler(async (req, res) => {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    })
  );

  app.get(
    "/api/blog-posts/:id",
    asyncHandler(async (req, res) => {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        throw ResourceErrors.notFound("Blog post", req.params.id);
      }
      res.json(post);
    })
  );

  app.post(
    "/api/blog-posts",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const validated = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validated);
      res.status(201).json(post);
    })
  );

  app.patch(
    "/api/blog-posts/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const post = await storage.updateBlogPost(req.params.id, req.body);
      if (!post) {
        throw ResourceErrors.notFound("Blog post", req.params.id);
      }
      res.json(post);
    })
  );

  app.delete(
    "/api/blog-posts/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const success = await storage.deleteBlogPost(req.params.id);
      if (!success) {
        throw ResourceErrors.notFound("Blog post", req.params.id);
      }
      res.status(204).send();
    })
  );

  app.post(
    "/api/blog-posts/:id/view",
    asyncHandler(async (req, res) => {
      await storage.incrementBlogPostViews(req.params.id);
      res.status(200).send();
    })
  );

  // Admin campaigns routes
  app.get(
    "/api/admin-campaigns",
    asyncHandler(async (req, res) => {
      const campaigns = await storage.getAllAdminCampaigns();
      res.json(campaigns);
    })
  );

  app.get(
    "/api/admin-campaigns/:id",
    asyncHandler(async (req, res) => {
      const campaign = await storage.getAdminCampaign(req.params.id);
      if (!campaign) {
        throw ResourceErrors.notFound("Admin campaign", req.params.id);
      }
      res.json(campaign);
    })
  );

  app.post(
    "/api/admin-campaigns",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const validated = insertAdminCampaignSchema.parse(req.body);
      const campaign = await storage.createAdminCampaign(validated);
      res.status(201).json(campaign);
    })
  );

  app.patch(
    "/api/admin-campaigns/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const validated = insertAdminCampaignSchema.partial().parse(req.body);
      const campaign = await storage.updateAdminCampaign(req.params.id, validated);
      if (!campaign) {
        throw ResourceErrors.notFound("Admin campaign", req.params.id);
      }
      res.json(campaign);
    })
  );

  app.delete(
    "/api/admin-campaigns/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const success = await storage.deleteAdminCampaign(req.params.id);
      if (!success) {
        throw ResourceErrors.notFound("Admin campaign", req.params.id);
      }
      res.status(204).send();
    })
  );

  app.post(
    "/api/ad-views/start",
    adViewRateLimiter,
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
      const userId = req.authUser!.id;
      const { campaignId } = req.body;

      if (!campaignId) {
        throw ValidationErrors.missingField("campaignId");
      }

      const ipAddress = req.ip || req.connection.remoteAddress || null;
      const userAgent = req.get("User-Agent") || null;

      const fraudCheck = await fraudDetection.checkAdView(userId, campaignId, ipAddress, userAgent);

      if (!fraudCheck.allowed) {
        throw FraudErrors.detected(
          fraudCheck.reason || "Suspicious activity detected",
          fraudCheck.fraudScore
        );
      }

      const trackingToken = randomBytes(32).toString("hex");

      const adView = await storage.createAdView({
        userId,
        campaignId,
        trackingToken,
        ipAddress,
        userAgent,
        fraudScore: fraudCheck.fraudScore,
      });

      if (fraudCheck.fraudScore >= 60) {
        emitFraudAlert(adView);
      }

      res.status(201).json({
        trackingToken: adView.trackingToken,
        viewId: adView.id,
      });
    })
  );

  app.get(
    "/api/ad-views/:token",
    asyncHandler(async (req, res) => {
      const { token } = req.params;
      const adView = await storage.getAdViewByToken(token);

      if (!adView) {
        throw AdTrackingErrors.adViewNotFound(token);
      }

      const campaign = await storage.getAdminCampaign(adView.campaignId);
      if (!campaign) {
        throw AdTrackingErrors.campaignNotFound(adView.campaignId);
      }

      res.json({ adView, campaign });
    })
  );

  app.post(
    "/api/ad-views/:token/complete",
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
      const { token } = req.params;
      const adView = await storage.getAdViewByToken(token);

      if (!adView) {
        throw AdTrackingErrors.adViewNotFound(token);
      }

      if (adView.userId !== req.authUser!.id) {
        throw AuthErrors.forbidden();
      }

      if (adView.viewCompleted) {
        throw AdTrackingErrors.alreadyCompleted();
      }

      const updatedAdView = await storage.updateAdView(adView.id, {
        viewCompleted: new Date(),
      });

      res.json({ success: true, adView: updatedAdView });
    })
  );

  app.post(
    "/api/ad-views/:token/click",
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
      const { token } = req.params;
      const adView = await storage.getAdViewByToken(token);

      if (!adView) {
        throw AdTrackingErrors.adViewNotFound(token);
      }

      if (adView.userId !== req.authUser!.id) {
        throw AuthErrors.forbidden();
      }

      const updatedAdView = await storage.updateAdView(adView.id, {
        linkClicked: true,
        linkClickedAt: new Date(),
      });

      res.json({ success: true, adView: updatedAdView });
    })
  );

  app.post(
    "/api/ad-views/:token/claim",
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
      const { token } = req.params;
      const { rewardAmount } = req.body;
      const adView = await storage.getAdViewByToken(token);

      if (!adView) {
        throw AdTrackingErrors.adViewNotFound(token);
      }

      if (adView.userId !== req.authUser!.id) {
        throw AuthErrors.forbidden();
      }

      if (adView.rewardClaimed) {
        throw AdTrackingErrors.rewardAlreadyClaimed();
      }

      if (!adView.viewCompleted) {
        throw AdTrackingErrors.notCompleted();
      }

      if (adView.flaggedAsFraud) {
        throw FraudErrors.rewardDenied();
      }

      const viewDuration = adView.viewCompleted
        ? (new Date(adView.viewCompleted).getTime() - new Date(adView.viewStarted).getTime()) / 1000
        : 0;

      const settings = await storage.getFraudDetectionSettings();
      if (viewDuration < settings.minViewDurationSeconds) {
        throw BusinessLogicErrors.minDurationNotMet(
          parseFloat(viewDuration.toFixed(1)),
          settings.minViewDurationSeconds
        );
      }

      const campaign = await storage.getAdminCampaign(adView.campaignId);
      if (!campaign) {
        throw AdTrackingErrors.campaignNotFound(adView.campaignId);
      }

      const campaignAdViews = await storage.getCampaignAdViews(adView.campaignId);
      const totalRewardsPaid = campaignAdViews
        .filter((v) => v.rewardAmount)
        .reduce((sum, v) => sum + parseFloat(v.rewardAmount || "0"), 0);

      const requestedReward = parseFloat(rewardAmount || "0");
      const campaignBudget = parseFloat(campaign.budget || "0");

      if (totalRewardsPaid + requestedReward > campaignBudget) {
        throw BusinessLogicErrors.budgetExceeded((campaignBudget - totalRewardsPaid).toFixed(2));
      }

      const userAdViews = await storage.getUserAdViews(adView.userId);
      const userCampaignViews = userAdViews.filter(
        (v) => v.campaignId === adView.campaignId && v.rewardClaimed
      );

      if (userCampaignViews.length >= settings.maxViewsPerCampaignPerUser) {
        throw BusinessLogicErrors.maxRewardsReached(settings.maxViewsPerCampaignPerUser);
      }

      let finalRewardAmount = requestedReward;
      const activeUpgrade = await storage.getActiveUserUpgrade(adView.userId);
      if (activeUpgrade) {
        const upgrade = await storage.getAdViewingUpgrade(activeUpgrade.upgradeId);
        if (upgrade) {
          const multiplier = parseFloat(upgrade.rewardMultiplier);
          finalRewardAmount = requestedReward * multiplier;
        }
      }

      const updatedAdView = await storage.updateAdView(adView.id, {
        rewardClaimed: true,
        rewardClaimedAt: new Date(),
        rewardAmount: finalRewardAmount.toFixed(2),
      });

      res.json({
        success: true,
        adView: updatedAdView,
        appliedMultiplier: activeUpgrade ? true : false,
      });
    })
  );

  app.get(
    "/api/ad-views/user/:userId",
    asyncHandler(async (req, res) => {
      const { userId } = req.params;
      const adViews = await storage.getUserAdViews(userId);
      res.json(adViews);
    })
  );

  app.get(
    "/api/ad-views/campaign/:campaignId",
    asyncHandler(async (req, res) => {
      const { campaignId } = req.params;
      const adViews = await storage.getCampaignAdViews(campaignId);
      res.json(adViews);
    })
  );

  app.get(
    "/api/ad-viewing-upgrades",
    apiRateLimiter,
    asyncHandler(async (req, res) => {
      const upgrades = await storage.getActiveAdViewingUpgrades();
      res.json(upgrades);
    })
  );

  app.get(
    "/api/user/ad-viewing-upgrades",
    apiRateLimiter,
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
      const userId = req.authUser!.id;
      const userUpgrades = await storage.getUserAdViewingUpgrades(userId);
      const upgradesWithDetails = await Promise.all(
        userUpgrades.map(async (uu) => {
          const upgrade = await storage.getAdViewingUpgrade(uu.upgradeId);
          return { ...uu, upgrade };
        })
      );
      res.json(upgradesWithDetails);
    })
  );

  app.post(
    "/api/ad-viewing-upgrades/purchase",
    apiRateLimiter,
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
      const userId = req.authUser!.id;
      const { upgradeId } = req.body;

      if (!upgradeId) {
        throw ValidationErrors.missingField("upgradeId");
      }

      const upgrade = await storage.getAdViewingUpgrade(upgradeId);
      if (!upgrade) {
        throw ResourceErrors.notFound("Upgrade", upgradeId);
      }

      if (upgrade.status !== "active") {
        throw ValidationErrors.invalidInput("This upgrade is not available for purchase");
      }

      const user = await storage.getUser(userId);
      if (!user) {
        throw ResourceErrors.notFound("User", userId);
      }

      const price = parseFloat(upgrade.price);
      const userBalance = parseFloat(user.balance);

      if (userBalance < price) {
        throw new AppError(
          ErrorCode.INSUFFICIENT_BALANCE,
          `Insufficient balance. Required: ETB ${price.toFixed(2)}, Available: ETB ${userBalance.toFixed(2)}`,
          400,
          { required: price.toFixed(2), available: userBalance.toFixed(2) }
        );
      }

      const activeUpgrade = await storage.getActiveUserUpgrade(userId);
      if (activeUpgrade) {
        throw ValidationErrors.invalidInput(
          "You already have an active upgrade. Please wait for it to expire before purchasing a new one."
        );
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + upgrade.duration);

      const userUpgrade = await storage.createUserAdViewingUpgrade({
        userId,
        upgradeId,
        purchaseDate: new Date(),
        expiryDate,
        status: "active",
        transactionId: null,
      });

      const newBalance = (userBalance - price).toFixed(2);
      await storage.updateUser(userId, { balance: newBalance });

      await storage.createTransactionLog({
        userId,
        type: "purchase",
        amount: upgrade.price,
        fee: "0.00",
        tax: "0.00",
        netAmount: upgrade.price,
        method: "internal",
        status: "completed",
        transactionId: randomBytes(16).toString("hex"),
        description: `Purchased ${upgrade.name} upgrade`,
      });

      res.json({ success: true, userUpgrade });
    })
  );

  app.get(
    "/api/track/:token",
    asyncHandler(async (req, res) => {
      const { token } = req.params;
      const adView = await storage.getAdViewByToken(token);

      if (!adView) {
        throw AdTrackingErrors.invalidToken();
      }

      await storage.updateAdView(adView.id, {
        linkClicked: true,
        linkClickedAt: new Date(),
      });

      const campaign = await storage.getAdminCampaign(adView.campaignId);
      if (!campaign) {
        throw AdTrackingErrors.campaignNotFound(adView.campaignId);
      }

      res.redirect(campaign.url);
    })
  );

  app.get(
    "/api/analytics/campaign/:campaignId",
    apiRateLimiter,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { campaignId } = req.params;
      const adViews = await storage.getCampaignAdViews(campaignId);

      const totalViews = adViews.length;
      const completedViews = adViews.filter((v) => v.viewCompleted).length;
      const clickedViews = adViews.filter((v) => v.linkClicked).length;
      const rewardsClaimed = adViews.filter((v) => v.rewardClaimed).length;
      const flaggedViews = adViews.filter((v) => v.flaggedAsFraud).length;

      const totalRewards = adViews
        .filter((v) => v.rewardAmount)
        .reduce((sum, v) => sum + parseFloat(v.rewardAmount || "0"), 0);

      const completionRate = totalViews > 0 ? (completedViews / totalViews) * 100 : 0;
      const clickThroughRate = completedViews > 0 ? (clickedViews / completedViews) * 100 : 0;
      const fraudRate = totalViews > 0 ? (flaggedViews / totalViews) * 100 : 0;

      const avgFraudScore =
        totalViews > 0 ? adViews.reduce((sum, v) => sum + (v.fraudScore || 0), 0) / totalViews : 0;

      res.json({
        campaignId,
        totalViews,
        completedViews,
        clickedViews,
        rewardsClaimed,
        flaggedViews,
        totalRewards: totalRewards.toFixed(2),
        completionRate: completionRate.toFixed(2),
        clickThroughRate: clickThroughRate.toFixed(2),
        fraudRate: fraudRate.toFixed(2),
        avgFraudScore: avgFraudScore.toFixed(2),
      });
    })
  );

  app.get(
    "/api/analytics/user/:userId",
    apiRateLimiter,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { userId } = req.params;
      const adViews = await storage.getUserAdViews(userId);

      const totalViews = adViews.length;
      const completedViews = adViews.filter((v) => v.viewCompleted).length;
      const clickedViews = adViews.filter((v) => v.linkClicked).length;
      const rewardsClaimed = adViews.filter((v) => v.rewardClaimed).length;
      const flaggedViews = adViews.filter((v) => v.flaggedAsFraud).length;

      const totalEarnings = adViews
        .filter((v) => v.rewardAmount)
        .reduce((sum, v) => sum + parseFloat(v.rewardAmount || "0"), 0);

      const avgFraudScore =
        totalViews > 0 ? adViews.reduce((sum, v) => sum + (v.fraudScore || 0), 0) / totalViews : 0;

      res.json({
        userId,
        totalViews,
        completedViews,
        clickedViews,
        rewardsClaimed,
        flaggedViews,
        totalEarnings: totalEarnings.toFixed(2),
        avgFraudScore: avgFraudScore.toFixed(2),
      });
    })
  );

  app.get(
    "/api/admin/fraud/flagged",
    apiRateLimiter,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const flaggedViews = await storage.getFlaggedAdViews();
      res.json(flaggedViews);
    })
  );

  app.get(
    "/api/admin/fraud/settings",
    apiRateLimiter,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const settings = await storage.getFraudDetectionSettings();
      res.json(settings);
    })
  );

  app.patch(
    "/api/admin/fraud/settings",
    apiRateLimiter,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const validated = insertFraudDetectionSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateFraudDetectionSettings(validated);
      res.json(settings);
    })
  );

  app.post(
    "/api/admin/fraud/flag/:adViewId",
    apiRateLimiter,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { adViewId } = req.params;
      const { reason } = req.body;

      const adView = await storage.getAdView(adViewId);
      if (!adView) {
        throw AdTrackingErrors.adViewNotFound();
      }

      await storage.updateAdView(adViewId, {
        flaggedAsFraud: true,
        fraudReason: reason || "Manually flagged by admin",
      });

      res.json({ success: true });
    })
  );

  // Withdrawal requests routes
  app.get(
    "/api/withdrawal-requests",
    asyncHandler(async (req, res) => {
      const requests = await storage.getAllWithdrawalRequests();
      res.json(requests);
    })
  );

  app.get(
    "/api/withdrawal-requests/:id",
    asyncHandler(async (req, res) => {
      const request = await storage.getWithdrawalRequest(req.params.id);
      if (!request) {
        throw ResourceErrors.notFound("Withdrawal request", req.params.id);
      }
      res.json(request);
    })
  );

  app.post(
    "/api/withdrawal-requests",
    asyncHandler(async (req, res) => {
      const validated = insertWithdrawalRequestSchema.parse(req.body);
      const request = await storage.createWithdrawalRequest(validated);
      res.status(201).json(request);
    })
  );

  app.patch(
    "/api/withdrawal-requests/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const request = await storage.updateWithdrawalRequest(req.params.id, req.body);
      if (!request) {
        throw ResourceErrors.notFound("Withdrawal request", req.params.id);
      }
      res.json(request);
    })
  );

  // Deposit requests routes
  app.get(
    "/api/deposit-requests",
    asyncHandler(async (req, res) => {
      const requests = await storage.getAllDepositRequests();
      res.json(requests);
    })
  );

  app.get(
    "/api/deposit-requests/:id",
    asyncHandler(async (req, res) => {
      const request = await storage.getDepositRequest(req.params.id);
      if (!request) {
        throw ResourceErrors.notFound("Deposit request", req.params.id);
      }
      res.json(request);
    })
  );

  app.post(
    "/api/deposit-requests",
    asyncHandler(async (req, res) => {
      const validated = insertDepositRequestSchema.parse(req.body);
      const request = await storage.createDepositRequest(validated);
      res.status(201).json(request);
    })
  );

  app.patch(
    "/api/deposit-requests/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const request = await storage.updateDepositRequest(req.params.id, req.body);
      if (!request) {
        throw ResourceErrors.notFound("Deposit request", req.params.id);
      }
      res.json(request);
    })
  );

  // Financial settings routes
  app.get(
    "/api/financial-settings",
    asyncHandler(async (req, res) => {
      const settings = await storage.getFinancialSettings();
      res.json(settings);
    })
  );

  app.patch(
    "/api/financial-settings",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const validated = insertFinancialSettingsSchema.partial().parse(req.body);

      // Validate percentage ranges
      if (validated.taxPercentage !== undefined) {
        const tax = parseFloat(validated.taxPercentage);
        if (isNaN(tax) || tax < 0 || tax > 100) {
          throw ValidationErrors.invalidInput("Tax percentage must be between 0 and 100");
        }
      }

      if (validated.withdrawalFeePercentage !== undefined) {
        const withdrawalFee = parseFloat(validated.withdrawalFeePercentage);
        if (isNaN(withdrawalFee) || withdrawalFee < 0 || withdrawalFee > 100) {
          throw ValidationErrors.invalidInput(
            "Withdrawal fee percentage must be between 0 and 100"
          );
        }
      }

      if (validated.depositFeePercentage !== undefined) {
        const depositFee = parseFloat(validated.depositFeePercentage);
        if (isNaN(depositFee) || depositFee < 0 || depositFee > 100) {
          throw ValidationErrors.invalidInput("Deposit fee percentage must be between 0 and 100");
        }
      }

      const settings = await storage.updateFinancialSettings(validated);
      res.json(settings);
    })
  );

  // Transaction logs routes
  app.get(
    "/api/transaction-logs",
    asyncHandler(async (req, res) => {
      const { txnId } = req.query;

      if (txnId && typeof txnId === "string") {
        const log = await storage.getTransactionLogByTxnId(txnId);
        return res.json(log ? [log] : []);
      }

      const logs = await storage.getAllTransactionLogs();
      res.json(logs);
    })
  );

  app.post(
    "/api/transaction-logs",
    asyncHandler(async (req, res) => {
      const validated = insertTransactionLogSchema.parse(req.body);
      const log = await storage.createTransactionLog(validated);
      res.status(201).json(log);
    })
  );

  // Referral settings routes
  app.get(
    "/api/referral-settings",
    asyncHandler(async (req, res) => {
      const settings = await storage.getReferralSettings();
      res.json(settings);
    })
  );

  app.patch(
    "/api/referral-settings",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const validated = insertReferralSettingsSchema.partial().parse(req.body);

      // Validate percentage ranges for each level
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
            throw ValidationErrors.invalidInput(`${name} percentage must be between 0 and 100`);
          }
        }
      }

      // Validate maxLevels if provided
      if (validated.maxLevels !== undefined) {
        if (validated.maxLevels < 1 || validated.maxLevels > 5) {
          throw ValidationErrors.invalidInput("Maximum levels must be between 1 and 5");
        }
      }

      const settings = await storage.updateReferralSettings(validated);
      res.json(settings);
    })
  );

  // Role routes
  app.get(
    "/api/roles",
    asyncHandler(async (req, res) => {
      const roles = await storage.getAllRoles();
      res.json(roles);
    })
  );

  app.get(
    "/api/roles/:id",
    asyncHandler(async (req, res) => {
      const role = await storage.getRole(req.params.id);
      if (!role) {
        throw ResourceErrors.notFound("Role", req.params.id);
      }
      res.json(role);
    })
  );

  app.post(
    "/api/roles",
    asyncHandler(async (req, res) => {
      const validated = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validated);
      res.status(201).json(role);
    })
  );

  app.patch(
    "/api/roles/:id",
    asyncHandler(async (req, res) => {
      const validated = insertRoleSchema.partial().parse(req.body);
      const role = await storage.updateRole(req.params.id, validated);
      if (!role) {
        throw ResourceErrors.notFound("Role", req.params.id);
      }
      res.json(role);
    })
  );

  app.delete(
    "/api/roles/:id",
    asyncHandler(async (req, res) => {
      const deleted = await storage.deleteRole(req.params.id);
      if (!deleted) {
        throw ResourceErrors.notFound("Role", req.params.id);
      }
      res.json({ message: "Role deleted successfully" });
    })
  );

  // Staff member routes
  app.get(
    "/api/staff",
    asyncHandler(async (req, res) => {
      const staff = await storage.getAllStaffMembers();
      res.json(staff);
    })
  );

  app.get(
    "/api/staff/:id",
    asyncHandler(async (req, res) => {
      const staff = await storage.getStaffMember(req.params.id);
      if (!staff) {
        throw ResourceErrors.notFound("Staff member", req.params.id);
      }
      res.json(staff);
    })
  );

  app.post(
    "/api/staff",
    asyncHandler(async (req, res) => {
      const validated = insertStaffMemberSchema.parse(req.body);
      const staff = await storage.createStaffMember(validated);
      res.status(201).json(staff);
    })
  );

  app.patch(
    "/api/staff/:id",
    asyncHandler(async (req, res) => {
      const staff = await storage.updateStaffMember(req.params.id, req.body);
      if (!staff) {
        throw ResourceErrors.notFound("Staff member", req.params.id);
      }
      res.json(staff);
    })
  );

  app.delete(
    "/api/staff/:id",
    asyncHandler(async (req, res) => {
      const deleted = await storage.deleteStaffMember(req.params.id);
      if (!deleted) {
        throw ResourceErrors.notFound("Staff member", req.params.id);
      }
      res.json({ message: "Staff member deleted successfully" });
    })
  );

  // FAQ routes
  // Subscription Plans routes
  app.get(
    "/api/admin/subscription-plans",
    asyncHandler(async (req, res) => {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    })
  );

  app.get(
    "/api/admin/subscription-plans/:id",
    asyncHandler(async (req, res) => {
      const plan = await storage.getSubscriptionPlan(req.params.id);
      if (!plan) {
        throw ResourceErrors.notFound("Subscription plan", req.params.id);
      }
      res.json(plan);
    })
  );

  app.post(
    "/api/admin/subscription-plans",
    asyncHandler(async (req, res) => {
      const validated = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(validated);

      // Log admin action
      if (req.user) {
        await logAdminAction({
          adminUser: req.user,
          action: "create_subscription_plan",
          resource: "subscription_plan",
          resourceId: plan.id,
          details: `Created plan: ${plan.name}`,
          req,
        });
      }

      res.status(201).json(plan);
    })
  );

  app.patch(
    "/api/admin/subscription-plans/:id",
    asyncHandler(async (req, res) => {
      const plan = await storage.updateSubscriptionPlan(req.params.id, req.body);
      if (!plan) {
        throw ResourceErrors.notFound("Subscription plan", req.params.id);
      }

      // Log admin action
      if (req.user) {
        await logAdminAction({
          adminUser: req.user,
          action: "update_subscription_plan",
          resource: "subscription_plan",
          resourceId: plan.id,
          details: `Updated plan: ${plan.name}`,
          req,
        });
      }

      res.json(plan);
    })
  );

  app.delete(
    "/api/admin/subscription-plans/:id",
    asyncHandler(async (req, res) => {
      const existing = await storage.getSubscriptionPlan(req.params.id);
      const deleted = await storage.deleteSubscriptionPlan(req.params.id);
      if (!deleted) {
        throw ResourceErrors.notFound("Subscription plan", req.params.id);
      }

      // Log admin action
      if (req.user && existing) {
        await logAdminAction({
          adminUser: req.user,
          action: "delete_subscription_plan",
          resource: "subscription_plan",
          resourceId: req.params.id,
          details: `Deleted plan: ${existing.name}`,
          req,
        });
      }

      res.json({ message: "Subscription plan deleted successfully" });
    })
  );

  // Payment Methods routes
  app.get(
    "/api/payment-methods",
    asyncHandler(async (req, res) => {
      if (!req.user) {
        throw AuthErrors.required();
      }
      const methods = await storage.getUserPaymentMethods(req.user.id);
      res.json(methods);
    })
  );

  app.get(
    "/api/payment-methods/:id",
    asyncHandler(async (req, res) => {
      if (!req.user) {
        throw AuthErrors.required();
      }
      const method = await storage.getPaymentMethod(req.params.id);
      if (!method) {
        throw ResourceErrors.notFound("Payment method", req.params.id);
      }
      if (method.userId !== req.user.id) {
        throw AuthErrors.insufficientPermissions("owner");
      }
      res.json(method);
    })
  );

  app.post(
    "/api/payment-methods",
    asyncHandler(async (req, res) => {
      if (!req.user) {
        throw AuthErrors.required();
      }
      const method = await storage.createPaymentMethod({
        ...req.body,
        userId: req.user.id,
      });
      res.status(201).json(method);
    })
  );

  app.patch(
    "/api/payment-methods/:id",
    asyncHandler(async (req, res) => {
      if (!req.user) {
        throw AuthErrors.required();
      }
      const existing = await storage.getPaymentMethod(req.params.id);
      if (!existing) {
        throw ResourceErrors.notFound("Payment method", req.params.id);
      }
      if (existing.userId !== req.user.id) {
        throw AuthErrors.insufficientPermissions("owner");
      }
      const method = await storage.updatePaymentMethod(req.params.id, req.body);
      res.json(method);
    })
  );

  app.delete(
    "/api/payment-methods/:id",
    asyncHandler(async (req, res) => {
      if (!req.user) {
        throw AuthErrors.required();
      }
      const existing = await storage.getPaymentMethod(req.params.id);
      if (!existing) {
        throw ResourceErrors.notFound("Payment method", req.params.id);
      }
      if (existing.userId !== req.user.id) {
        throw AuthErrors.insufficientPermissions("owner");
      }
      const deleted = await storage.deletePaymentMethod(req.params.id);
      res.json({ message: "Payment method deleted successfully" });
    })
  );

  app.post(
    "/api/payment-methods/:id/set-default",
    asyncHandler(async (req, res) => {
      if (!req.user) {
        throw AuthErrors.required();
      }
      const existing = await storage.getPaymentMethod(req.params.id);
      if (!existing) {
        throw ResourceErrors.notFound("Payment method", req.params.id);
      }
      if (existing.userId !== req.user.id) {
        throw AuthErrors.insufficientPermissions("owner");
      }
      await storage.setDefaultPaymentMethod(req.user.id, req.params.id);
      res.json({ message: "Default payment method set successfully" });
    })
  );

  app.get(
    "/api/faqs",
    asyncHandler(async (req, res) => {
      const faqs = await storage.getAllFaqs();
      res.json(faqs);
    })
  );

  app.get(
    "/api/faqs/:id",
    asyncHandler(async (req, res) => {
      const faq = await storage.getFaq(req.params.id);
      if (!faq) {
        throw ResourceErrors.notFound("FAQ", req.params.id);
      }
      res.json(faq);
    })
  );

  app.post(
    "/api/faqs",
    asyncHandler(async (req, res) => {
      const validated = insertFaqSchema.parse(req.body);
      const faq = await storage.createFaq(validated);

      // Log admin action
      if (req.user) {
        await logAdminAction({
          adminUser: req.user,
          action: "create_faq",
          resource: "faq",
          resourceId: faq.id,
          details: `Created FAQ: ${faq.question.substring(0, 50)}...`,
          req,
        });
      }

      res.status(201).json(faq);
    })
  );

  app.patch(
    "/api/faqs/:id",
    asyncHandler(async (req, res) => {
      const faq = await storage.updateFaq(req.params.id, req.body);
      if (!faq) {
        throw ResourceErrors.notFound("FAQ", req.params.id);
      }

      // Log admin action
      if (req.user) {
        await logAdminAction({
          adminUser: req.user,
          action: "update_faq",
          resource: "faq",
          resourceId: faq.id,
          details: `Updated FAQ: ${faq.question.substring(0, 50)}...`,
          req,
        });
      }

      res.json(faq);
    })
  );

  app.delete(
    "/api/faqs/:id",
    asyncHandler(async (req, res) => {
      const existing = await storage.getFaq(req.params.id);
      const deleted = await storage.deleteFaq(req.params.id);
      if (!deleted) {
        throw ResourceErrors.notFound("FAQ", req.params.id);
      }

      // Log admin action
      if (req.user && existing) {
        await logAdminAction({
          adminUser: req.user,
          action: "delete_faq",
          resource: "faq",
          resourceId: req.params.id,
          details: `Deleted FAQ: ${existing.question.substring(0, 50)}...`,
          req,
        });
      }

      res.json({ message: "FAQ deleted successfully" });
    })
  );

  app.get(
    "/api/chapa/payments",
    asyncHandler(async (req, res) => {
      const { userId } = req.query;

      if (userId && typeof userId === "string") {
        const payments = await storage.getUserChapaPayments(userId);
        return res.json(payments);
      }

      const payments = await storage.getAllChapaPayments();
      res.json(payments);
    })
  );

  app.get(
    "/api/chapa/payments/:id",
    asyncHandler(async (req, res) => {
      const payment = await storage.getChapaPayment(req.params.id);
      if (!payment) {
        throw ResourceErrors.notFound("Payment", req.params.id);
      }
      res.json(payment);
    })
  );

  app.get(
    "/api/chapa/payments/tx/:txRef",
    asyncHandler(async (req, res) => {
      const payment = await storage.getChapaPaymentByTxRef(req.params.txRef);
      if (!payment) {
        throw ResourceErrors.notFound("Payment", req.params.id);
      }
      res.json(payment);
    })
  );

  app.post(
    "/api/chapa/payments",
    asyncHandler(async (req, res) => {
      const validated = insertChapaPaymentSchema.parse(req.body);
      const payment = await storage.createChapaPayment(validated);
      res.status(201).json(payment);
    })
  );

  app.patch(
    "/api/chapa/payments/:id",
    asyncHandler(async (req, res) => {
      const payment = await storage.updateChapaPayment(req.params.id, req.body);
      if (!payment) {
        throw ResourceErrors.notFound("Payment", req.params.id);
      }
      res.json(payment);
    })
  );

  app.post(
    "/api/chapa/initialize",
    asyncHandler(async (req, res) => {
      const {
        userId,
        amount,
        currency,
        email,
        firstName,
        lastName,
        phoneNumber,
        returnUrl,
        callbackUrl,
      } = req.body;

      if (!userId || amount === undefined || amount === null || !email || !firstName || !lastName) {
        throw ValidationErrors.invalidInput("Missing required fields");
      }

      if (amount <= 0) {
        throw ValidationErrors.invalidInput("Amount must be greater than 0");
      }

      const txRef = chapaService.generateTxRef();
      const appUrl = process.env.APP_URL || "http://localhost:5000";

      const paymentRequest = {
        amount: amount.toString(),
        currency: currency || "ETB",
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        tx_ref: txRef,
        callback_url: callbackUrl || `${appUrl}/api/chapa/callback`,
        return_url: returnUrl || `${appUrl}/payment/success`,
        customization: {
          title: "Payment",
          description: "Payment for services",
        },
      };

      const chapaResponse = await chapaService.initializePayment(paymentRequest);

      const payment = await storage.createChapaPayment({
        userId,
        txRef,
        amount: amount.toString(),
        currency: currency || "ETB",
        email,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        status: "pending",
        checkoutUrl: chapaResponse.data.checkout_url,
      });

      res.json({
        payment,
        checkoutUrl: chapaResponse.data.checkout_url,
      });
    })
  );

  app.get(
    "/api/chapa/verify/:txRef",
    asyncHandler(async (req, res) => {
      const { txRef } = req.params;

      const payment = await storage.getChapaPaymentByTxRef(txRef);
      if (!payment) {
        throw ResourceErrors.notFound("Payment", req.params.id);
      }

      const verification = await chapaService.verifyPayment(txRef);

      if (verification.status === "success") {
        const updatedPayment = await storage.updateChapaPayment(payment.id, {
          status: verification.data.status,
          chapaReference: verification.data.reference,
          paymentMethod: verification.data.method,
          charge: verification.data.charge,
          mode: verification.data.mode,
          type: verification.data.type,
          completedAt: verification.data.status === "success" ? new Date() : null,
        });

        res.json({
          verified: true,
          payment: updatedPayment,
          verification: verification.data,
        });
      } else {
        res.json({
          verified: false,
          payment,
          message: verification.message,
        });
      }
    })
  );

  app.post(
    "/api/chapa/webhook",
    express.raw({ type: "application/json" }),
    asyncHandler(async (req, res) => {
      const signature = req.headers["chapa-signature"] as string;

      if (!signature) {
        throw AuthErrors.required();
      }

      const rawBody = req.body.toString("utf8");

      if (!chapaService.verifyWebhookSignature(rawBody, signature)) {
        throw AuthErrors.invalidToken();
      }

      const webhookData = JSON.parse(rawBody);

      if (webhookData.event === "charge.success") {
        const payment = await storage.getChapaPaymentByTxRef(webhookData.data.tx_ref);

        if (payment && webhookData.data.status === "success") {
          if (payment.status === "success") {
            return res.json({ message: "Webhook already processed" });
          }

          await storage.updateChapaPayment(payment.id, {
            status: webhookData.data.status,
            chapaReference: webhookData.data.reference,
            paymentMethod: webhookData.data.method,
            charge: webhookData.data.charge,
            mode: webhookData.data.mode,
            type: webhookData.data.type,
            completedAt: new Date(),
          });
        }
      }

      res.json({ message: "Webhook processed successfully" });
    })
  );

  // Maintenance Mode routes (Admin only)
  app.get(
    "/api/maintenance/status",
    asyncHandler(async (req, res) => {
      const settings = await storage.getMaintenanceSettings();
      res.json(settings);
    })
  );

  app.patch(
    "/api/maintenance/settings",
    apiRateLimiter,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { enabled, message, enabledBy } = req.body;
      const updates: any = {};

      if (typeof enabled === "boolean") {
        updates.enabled = enabled;
        if (enabled) {
          updates.enabledAt = new Date();
          updates.enabledBy = enabledBy || null;
        } else {
          updates.enabledAt = null;
          updates.enabledBy = null;
        }
      }

      if (message !== undefined) {
        updates.message = message;
      }

      if (enabledBy) {
        updates.updatedBy = enabledBy;
      }

      const settings = await storage.updateMaintenanceSettings(updates);

      if (enabledBy) {
        const adminUser = await storage.getUser(enabledBy);
        if (adminUser) {
          await logAdminAction({
            adminUser,
            action: enabled ? "enable_maintenance" : "disable_maintenance",
            resource: "maintenance_settings",
            resourceId: settings.id,
            details: `Maintenance mode ${enabled ? "enabled" : "disabled"}`,
            req,
          });
        }
      }

      res.json(settings);
    })
  );

  // Audit Logs routes (Admin only)
  app.get(
    "/api/admin/audit-logs",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const logs = await storage.getAllAuditLogs();
      res.json(logs);
    })
  );

  app.get(
    "/api/admin/audit-logs/admin/:adminId",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const logs = await storage.getAuditLogsByAdmin(req.params.adminId);
      res.json(logs);
    })
  );

  app.get(
    "/api/admin/audit-logs/resource/:resource",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const { resourceId } = req.query;
      const logs = await storage.getAuditLogsByResource(
        req.params.resource,
        resourceId as string | undefined
      );
      res.json(logs);
    })
  );

  app.use(errorHandler);

  const httpServer = createServer(app);

  initializeWebSocket(httpServer);

  return httpServer;
}
