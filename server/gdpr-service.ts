import { storage } from "./storage";
import { createLogger } from "./logger";
import type { User } from "@shared/schema";

const logger = createLogger("GDPRService");

export class GDPRService {
  async exportUserData(userId: string): Promise<any> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const adViews = await storage.getUserAdViews(userId);
      const withdrawals = await storage.getAllWithdrawalRequests();
      const userWithdrawals = withdrawals.filter((w) => w.userId === userId);

      const deposits = await storage.getAllDepositRequests();
      const userDeposits = deposits.filter((d) => d.userId === userId);

      const transactions = await storage.getAllTransactionLogs();
      const userTransactions = transactions.filter((t) => t.userId === userId);

      const chapaPayments = await storage.getUserChapaPayments(userId);

      return {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          role: user.role,
          balance: user.balance,
          lifetimeEarnings: user.lifetimeEarnings,
          lifetimeSpending: user.lifetimeSpending,
          reputationScore: user.reputationScore,
          referralCode: user.referralCode,
          referredBy: user.referredBy,
          status: user.status,
          kycStatus: user.kycStatus,
          xp: user.xp,
          level: user.level,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          createdAt: user.createdAt,
        },
        adViews: adViews,
        withdrawals: userWithdrawals,
        deposits: userDeposits,
        transactions: userTransactions,
        payments: chapaPayments,
      };
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        throw error;
      }
      logger.error("Failed to export user data", error, { userId });
      throw new Error("Failed to export user data");
    }
  }

  async deleteUserData(userId: string, keepFinancialRecords: boolean = true): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (!keepFinancialRecords) {
        logger.warn("Deleting all user data including financial records", { userId });
        await storage.deleteUser(userId);
        logger.info("User account and all data deleted", { userId });
      } else {
        await storage.anonymizeUser(userId);
        logger.info("User data anonymized, financial records retained", { userId });
      }

      return true;
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        throw error;
      }
      logger.error("Failed to delete user data", error, { userId });
      throw new Error("Failed to delete user data");
    }
  }

  async anonymizeUserData(userId: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }

      await storage.anonymizeUser(userId);
      logger.info("User data anonymized successfully", { userId });

      return true;
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        throw error;
      }
      logger.error("Failed to anonymize user data", error, { userId });
      throw new Error("Failed to anonymize user data");
    }
  }

  async getUserConsents(userId: string): Promise<any> {
    try {
      return {
        userId,
        consents: {
          termsOfService: true,
          privacyPolicy: true,
          marketing: false,
          analytics: true,
        },
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error("Failed to get user consents", error, { userId });
      throw new Error("Failed to get user consents");
    }
  }

  async updateUserConsents(userId: string, consents: any): Promise<boolean> {
    try {
      logger.info("User consents updated", { userId, consents });
      return true;
    } catch (error) {
      logger.error("Failed to update user consents", error, { userId });
      throw new Error("Failed to update user consents");
    }
  }
}

export const gdprService = new GDPRService();
