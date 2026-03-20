import { storage } from "./storage";
import type { AdView, FraudDetectionSettings } from "@shared/schema";

export class FraudDetectionService {
  async checkAdView(
    userId: string,
    campaignId: string,
    ipAddress: string | null,
    userAgent: string | null
  ): Promise<{ allowed: boolean; reason?: string; fraudScore: number }> {
    const settings = await storage.getFraudDetectionSettings();

    if (!settings.enabled) {
      return { allowed: true, fraudScore: 0 };
    }

    let fraudScore = 0;
    const reasons: string[] = [];

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const userViewsToday = await storage.getUserAdViewsSince(userId, oneDayAgo);
    if (userViewsToday.length >= settings.maxViewsPerUserPerDay) {
      fraudScore += 30;
      reasons.push(`Exceeded max views per user per day (${settings.maxViewsPerUserPerDay})`);
    }

    if (ipAddress) {
      const ipViewsToday = await storage.getAdViewsByIpSince(ipAddress, oneDayAgo);
      if (ipViewsToday.length >= settings.maxViewsPerIpPerDay) {
        fraudScore += 25;
        reasons.push(`Exceeded max views per IP per day (${settings.maxViewsPerIpPerDay})`);
      }
    }

    const campaignViewsByUser = await storage.getUserCampaignViews(userId, campaignId);
    if (campaignViewsByUser.length >= settings.maxViewsPerCampaignPerUser) {
      fraudScore += 20;
      reasons.push(
        `Exceeded max views per campaign per user (${settings.maxViewsPerCampaignPerUser})`
      );
    }

    if (userAgent && settings.suspiciousUserAgentPatterns.length > 0) {
      const isSuspicious = settings.suspiciousUserAgentPatterns.some((pattern) =>
        userAgent.toLowerCase().includes(pattern.toLowerCase())
      );
      if (isSuspicious) {
        fraudScore += 15;
        reasons.push("Suspicious user agent detected");
      }
    }

    if (!userAgent || userAgent.length < 10) {
      fraudScore += 10;
      reasons.push("Missing or invalid user agent");
    }

    const recentViews = userViewsToday.slice(0, 5);
    if (recentViews.length >= 3) {
      const timestamps = recentViews.map((v) => v.viewStarted.getTime());
      const intervals = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i - 1] - timestamps[i]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval < 10000) {
        fraudScore += 20;
        reasons.push("Views too frequent (possible bot)");
      }
    }

    const allowed = fraudScore < settings.autoFlagThreshold;

    return {
      allowed,
      reason: reasons.length > 0 ? reasons.join("; ") : undefined,
      fraudScore,
    };
  }

  async flagAdView(adViewId: string, reason: string, fraudScore: number): Promise<void> {
    await storage.updateAdView(adViewId, {
      flaggedAsFraud: true,
      fraudReason: reason,
      fraudScore,
    });
  }

  async analyzeViewDuration(adView: AdView): Promise<{ suspicious: boolean; reason?: string }> {
    if (!adView.viewCompleted || !adView.viewStarted) {
      return { suspicious: false };
    }

    const settings = await storage.getFraudDetectionSettings();
    const durationSeconds = (adView.viewCompleted.getTime() - adView.viewStarted.getTime()) / 1000;

    if (durationSeconds < settings.minViewDurationSeconds) {
      return {
        suspicious: true,
        reason: `View duration too short (${durationSeconds}s < ${settings.minViewDurationSeconds}s)`,
      };
    }

    return { suspicious: false };
  }
}

export const fraudDetection = new FraudDetectionService();
