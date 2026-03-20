import { db } from "./db";
import { campaigns, users, transactions } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";
import { cache } from "./redis";

/**
 * Campaign Escrow Service
 * 
 * Handles all financial operations for campaigns:
 * - Create: freeze budget from user balance → escrow
 * - Approve: activate campaign
 * - Reject: refund escrow → user balance
 * - Cancel: refund unspent escrow → user balance
 * - Delete: refund unspent escrow → user balance → remove campaign
 * - Record click: deduct from escrow, increment spent
 */

export interface CreateCampaignInput {
  userId: string;
  name: string;
  type: string;
  description: string;
  url: string;
  imageUrl?: string;
  budget: string;
  cpc: string;
  duration: number;
}

export class CampaignService {
  /**
   * Create a campaign with escrow — freezes budget from user balance
   */
  async createCampaign(input: CreateCampaignInput) {
    const budgetAmount = parseFloat(input.budget);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      throw new Error("Budget must be a positive number");
    }

    const cpcAmount = parseFloat(input.cpc);
    if (isNaN(cpcAmount) || cpcAmount <= 0) {
      throw new Error("Cost per click must be a positive number");
    }

    if (cpcAmount > budgetAmount) {
      throw new Error("Cost per click cannot exceed total budget");
    }

    // Get user and verify balance
    const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
    if (!user) {
      throw new Error("User not found");
    }

    const userBalance = parseFloat(user.balance);
    if (userBalance < budgetAmount) {
      throw new Error(
        `Insufficient balance. You have ETB ${userBalance.toFixed(2)} but the campaign requires ETB ${budgetAmount.toFixed(2)}`
      );
    }

    // Atomic transaction: deduct balance + create campaign + log transaction
    const newBalance = (userBalance - budgetAmount).toFixed(2);

    const [campaign] = await db
      .insert(campaigns)
      .values({
        userId: input.userId,
        name: input.name,
        type: input.type,
        description: input.description,
        url: input.url,
        imageUrl: input.imageUrl || null,
        budget: input.budget,
        cpc: input.cpc,
        duration: input.duration,
        escrowAmount: input.budget,
        spent: "0.00",
        refundedAmount: "0.00",
        status: "pending_review",
      })
      .returning();

    // Deduct from user balance
    await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, input.userId));

    // Log the escrow transaction
    await db.insert(transactions).values({
      userId: input.userId,
      type: "campaign_escrow",
      amount: `-${input.budget}`,
      description: `Campaign "${input.name}" — budget frozen in escrow`,
      status: "completed",
    });

    // Invalidate cache
    await cache.del(`user:${input.userId}`);

    return campaign;
  }

  /**
   * Get campaigns for a user
   */
  async getUserCampaigns(userId: string) {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, userId))
      .orderBy(sql`${campaigns.createdAt} DESC`);
  }

  /**
   * Get a single campaign by ID
   */
  async getCampaign(campaignId: string) {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);
    return campaign;
  }

  /**
   * Get all campaigns (admin)
   */
  async getAllCampaigns() {
    return await db
      .select()
      .from(campaigns)
      .orderBy(sql`${campaigns.createdAt} DESC`);
  }

  /**
   * Admin approves a campaign — sets status to active
   */
  async approveCampaign(campaignId: string, adminId: string) {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== "pending_review") {
      throw new Error(`Cannot approve campaign with status "${campaign.status}"`);
    }

    const [updated] = await db
      .update(campaigns)
      .set({
        status: "active",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId))
      .returning();

    return updated;
  }

  /**
   * Admin rejects a campaign — refunds full escrow to user
   */
  async rejectCampaign(campaignId: string, adminId: string, reason: string) {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== "pending_review") {
      throw new Error(`Cannot reject campaign with status "${campaign.status}"`);
    }

    const refundAmount = parseFloat(campaign.escrowAmount) - parseFloat(campaign.spent);
    if (refundAmount <= 0) {
      // Nothing to refund, just update status
      const [updated] = await db
        .update(campaigns)
        .set({
          status: "rejected",
          rejectionReason: reason,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(campaigns.id, campaignId))
        .returning();
      return updated;
    }

    // Refund to user
    await this.processRefund(campaign.userId, campaignId, refundAmount, `Campaign "${campaign.name}" rejected — escrow refunded`);

    const [updated] = await db
      .update(campaigns)
      .set({
        status: "rejected",
        rejectionReason: reason,
        refundedAmount: refundAmount.toFixed(2),
        reviewedBy: adminId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId))
      .returning();

    return updated;
  }

  /**
   * User cancels their own campaign — refunds unspent escrow
   */
  async cancelCampaign(campaignId: string, userId: string) {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.userId !== userId) throw new Error("Not authorized");
    if (!["pending_review", "active", "paused"].includes(campaign.status)) {
      throw new Error(`Cannot cancel campaign with status "${campaign.status}"`);
    }

    const refundAmount = parseFloat(campaign.escrowAmount) - parseFloat(campaign.spent);

    if (refundAmount > 0) {
      await this.processRefund(userId, campaignId, refundAmount, `Campaign "${campaign.name}" cancelled — unspent escrow refunded`);
    }

    const [updated] = await db
      .update(campaigns)
      .set({
        status: "cancelled",
        refundedAmount: refundAmount > 0 ? refundAmount.toFixed(2) : campaign.refundedAmount,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId))
      .returning();

    return updated;
  }

  /**
   * Delete a campaign — refunds unspent escrow and removes campaign
   */
  async deleteCampaign(campaignId: string, userId: string) {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.userId !== userId) throw new Error("Not authorized");

    const refundAmount = parseFloat(campaign.escrowAmount) - parseFloat(campaign.spent) - parseFloat(campaign.refundedAmount);

    if (refundAmount > 0) {
      await this.processRefund(userId, campaignId, refundAmount, `Campaign "${campaign.name}" deleted — unspent escrow refunded`);
    }

    await db.delete(campaigns).where(eq(campaigns.id, campaignId));
    return { deleted: true, refunded: refundAmount > 0 ? refundAmount.toFixed(2) : "0.00" };
  }

  /**
   * Record a click on a campaign — deducts CPC from escrow, increments spent
   */
  async recordClick(campaignId: string, clickAmount: number) {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status !== "active") throw new Error("Campaign is not active");

    const remainingEscrow = parseFloat(campaign.escrowAmount) - parseFloat(campaign.spent);
    if (remainingEscrow < clickAmount) {
      // Budget exhausted — complete the campaign and refund remainder
      await this.completeCampaign(campaignId);
      throw new Error("Campaign budget exhausted");
    }

    const newSpent = (parseFloat(campaign.spent) + clickAmount).toFixed(2);

    await db
      .update(campaigns)
      .set({ spent: newSpent, updatedAt: new Date() })
      .where(eq(campaigns.id, campaignId));

    // Check if budget is now exhausted
    if (parseFloat(newSpent) >= parseFloat(campaign.escrowAmount)) {
      await this.completeCampaign(campaignId);
    }

    return { spent: newSpent, remaining: (parseFloat(campaign.escrowAmount) - parseFloat(newSpent)).toFixed(2) };
  }

  /**
   * Complete a campaign — refunds any remaining unspent escrow
   */
  async completeCampaign(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) throw new Error("Campaign not found");

    const refundAmount = parseFloat(campaign.escrowAmount) - parseFloat(campaign.spent) - parseFloat(campaign.refundedAmount);

    if (refundAmount > 0) {
      await this.processRefund(campaign.userId, campaignId, refundAmount, `Campaign "${campaign.name}" completed — remaining escrow refunded`);
    }

    const [updated] = await db
      .update(campaigns)
      .set({
        status: "completed",
        refundedAmount: (parseFloat(campaign.refundedAmount) + Math.max(refundAmount, 0)).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId))
      .returning();

    return updated;
  }

  /**
   * Internal: process a refund — add to user balance + log transaction
   */
  private async processRefund(userId: string, campaignId: string, amount: number, description: string) {
    // Add to user balance
    await db
      .update(users)
      .set({
        balance: sql`CAST(${users.balance} AS numeric) + ${amount}`,
      })
      .where(eq(users.id, userId));

    // Log the refund transaction
    await db.insert(transactions).values({
      userId,
      type: "campaign_refund",
      amount: amount.toFixed(2),
      description,
      status: "completed",
    });

    // Invalidate cache
    await cache.del(`user:${userId}`);
  }
}

export const campaignService = new CampaignService();
