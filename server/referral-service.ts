import { db } from "./db";
import { users, transactions, referralSettings } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { cache } from "./redis";

/**
 * Referral Commission Service
 *
 * Handles:
 * - Commission distribution up to 5 levels when a user earns
 * - Signup bonus for referrer when a new user registers with a code
 * - Multi-level referral tree traversal
 * - Commission history
 */

interface CommissionLevel {
  level: number;
  percentage: number;
}

export class ReferralService {
  /**
   * Get commission percentages from the referralSettings table.
   * Falls back to defaults if no settings found.
   */
  async getCommissionLevels(): Promise<CommissionLevel[]> {
    const [settings] = await db
      .select()
      .from(referralSettings)
      .limit(1);

    if (!settings || !settings.enabled) {
      return []; // Referral system disabled
    }

    const maxLevels = settings.maxLevels || 5;
    const levels: CommissionLevel[] = [];

    const percentages = [
      parseFloat(settings.level1Percentage),
      parseFloat(settings.level2Percentage),
      parseFloat(settings.level3Percentage),
      parseFloat(settings.level4Percentage),
      parseFloat(settings.level5Percentage),
    ];

    for (let i = 0; i < Math.min(maxLevels, 5); i++) {
      if (percentages[i] > 0) {
        levels.push({ level: i + 1, percentage: percentages[i] });
      }
    }

    return levels;
  }

  /**
   * Distribute referral commissions when a user earns money (e.g., from viewing ads).
   *
   * Walks up the referral chain (up to 5 levels) and credits each referrer
   * their configured commission percentage.
   *
   * @param userId - The user who earned money
   * @param earnedAmount - The amount the user earned
   * @param description - What the earning was for (e.g., "ad view")
   * @returns Array of commissions distributed
   */
  async distributeCommissions(
    userId: string,
    earnedAmount: number,
    description: string = "ad view"
  ): Promise<{ userId: string; level: number; amount: number }[]> {
    if (earnedAmount <= 0) return [];

    const commissionLevels = await this.getCommissionLevels();
    if (commissionLevels.length === 0) return [];

    const distributed: { userId: string; level: number; amount: number }[] = [];
    let currentUserId = userId;

    for (const { level, percentage } of commissionLevels) {
      // Get the referrer of the current user
      const [currentUser] = await db
        .select({ referredBy: users.referredBy })
        .from(users)
        .where(eq(users.id, currentUserId))
        .limit(1);

      if (!currentUser?.referredBy) break; // No more referrers in the chain

      const referrerId = currentUser.referredBy;
      const commissionAmount = (earnedAmount * percentage) / 100;

      // Skip if commission is too small (less than 0.01)
      if (commissionAmount < 0.01) {
        currentUserId = referrerId;
        continue;
      }

      // Credit the referrer (in a transaction for safety)
      await db.transaction(async (tx) => {
        // Credit balance
        await tx
          .update(users)
          .set({
            balance: sql`CAST(${users.balance} AS numeric) + ${commissionAmount}`,
            lifetimeEarnings: sql`CAST(${users.lifetimeEarnings} AS numeric) + ${commissionAmount}`,
          })
          .where(eq(users.id, referrerId));

        // Log the commission transaction
        await tx.insert(transactions).values({
          userId: referrerId,
          type: "referral_commission",
          amount: commissionAmount.toFixed(2),
          description: `Level ${level} referral commission (${percentage}%) from ${description}`,
          status: "completed",
        });
      });

      // Invalidate cache for the referrer
      await cache.del(`user:${referrerId}`).catch(() => {});

      distributed.push({
        userId: referrerId,
        level,
        amount: commissionAmount,
      });

      // Move up the chain
      currentUserId = referrerId;
    }

    return distributed;
  }

  /**
   * Credit the referrer a signup bonus when a new user registers with their code.
   *
   * @param referrerId - The user who referred the new user
   * @param newUserName - Name of the new user (for the transaction description)
   * @param bonusAmount - Amount to credit (default ETB 5)
   */
  async creditSignupBonus(
    referrerId: string,
    newUserName: string,
    bonusAmount: number = 5
  ): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          balance: sql`CAST(${users.balance} AS numeric) + ${bonusAmount}`,
          lifetimeEarnings: sql`CAST(${users.lifetimeEarnings} AS numeric) + ${bonusAmount}`,
        })
        .where(eq(users.id, referrerId));

      await tx.insert(transactions).values({
        userId: referrerId,
        type: "referral_bonus",
        amount: bonusAmount.toFixed(2),
        description: `Signup bonus — ${newUserName} joined via your referral`,
        status: "completed",
      });
    });

    await cache.del(`user:${referrerId}`).catch(() => {});
  }

  /**
   * Resolve a referral code to a user ID.
   * Returns the user ID of the code owner, or null if not found.
   */
  async resolveReferralCode(code: string): Promise<string | null> {
    if (!code || code.trim().length === 0) return null;

    const [referrer] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.referralCode, code.trim().toUpperCase()))
      .limit(1);

    return referrer?.id || null;
  }

  /**
   * Get the multi-level referral tree for a user (up to 3 levels deep).
   */
  async getReferralTree(userId: string, maxDepth: number = 3): Promise<any[]> {
    const tree = await this.getChildrenRecursive(userId, 1, maxDepth);
    return tree;
  }

  private async getChildrenRecursive(
    parentId: string,
    currentLevel: number,
    maxDepth: number
  ): Promise<any[]> {
    if (currentLevel > maxDepth) return [];

    const children = await db
      .select({
        id: users.id,
        name: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        joinedAt: users.createdAt,
        earnings: users.lifetimeEarnings,
      })
      .from(users)
      .where(eq(users.referredBy, parentId))
      .orderBy(sql`${users.createdAt} DESC`);

    const results = [];
    for (const child of children) {
      const grandChildren = await this.getChildrenRecursive(
        child.id,
        currentLevel + 1,
        maxDepth
      );

      results.push({
        id: child.id,
        name: child.name,
        level: currentLevel,
        joinedAt: child.joinedAt,
        earnings: child.earnings,
        children: grandChildren,
      });
    }

    return results;
  }

  /**
   * Get commission transaction history for a user.
   */
  async getCommissionHistory(userId: string, limit: number = 50): Promise<any[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        sql`${transactions.userId} = ${userId} AND (${transactions.type} = 'referral_commission' OR ${transactions.type} = 'referral_bonus')`
      )
      .orderBy(sql`${transactions.createdAt} DESC`)
      .limit(limit);
  }
}

export const referralService = new ReferralService();
