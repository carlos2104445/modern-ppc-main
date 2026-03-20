import { storage } from "./storage";
import { logger } from "./logger";
import type { ConsentRecord, InsertConsentRecord } from "@shared/schema";

type ConsentType = "marketing" | "analytics" | "functional" | "necessary";

export interface ConsentPreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export class ConsentService {
  private readonly CONSENT_VERSION = "1.0";

  async recordConsent(
    userId: string,
    preferences: ConsentPreferences,
    ipAddress: string | null,
    userAgent: string | null
  ): Promise<void> {
    try {
      const consentRecords: InsertConsentRecord[] = [
        {
          userId,
          consentType: "necessary",
          granted: preferences.necessary,
          timestamp: new Date(),
          ipAddress,
          userAgent,
          version: this.CONSENT_VERSION,
        },
        {
          userId,
          consentType: "functional",
          granted: preferences.functional,
          timestamp: new Date(),
          ipAddress,
          userAgent,
          version: this.CONSENT_VERSION,
        },
        {
          userId,
          consentType: "analytics",
          granted: preferences.analytics,
          timestamp: new Date(),
          ipAddress,
          userAgent,
          version: this.CONSENT_VERSION,
        },
        {
          userId,
          consentType: "marketing",
          granted: preferences.marketing,
          timestamp: new Date(),
          ipAddress,
          userAgent,
          version: this.CONSENT_VERSION,
        },
      ];

      await storage.saveConsentRecords(consentRecords);
      logger.info("Consent preferences recorded", { userId, preferences });
    } catch (error) {
      logger.error("Failed to record consent", { error, userId });
      throw new Error("Failed to record consent preferences");
    }
  }

  async getConsentPreferences(userId: string): Promise<ConsentPreferences | null> {
    try {
      const records = await storage.getLatestConsentRecords(userId);

      if (!records || records.length === 0) {
        return null;
      }

      const preferences: ConsentPreferences = {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
      };

      for (const record of records) {
        if (record.consentType === "necessary") {
          preferences.necessary = record.granted;
        } else if (record.consentType === "functional") {
          preferences.functional = record.granted;
        } else if (record.consentType === "analytics") {
          preferences.analytics = record.granted;
        } else if (record.consentType === "marketing") {
          preferences.marketing = record.granted;
        }
      }

      return preferences;
    } catch (error) {
      logger.error("Failed to get consent preferences", { error, userId });
      return null;
    }
  }

  async getConsentHistory(userId: string): Promise<ConsentRecord[]> {
    try {
      return await storage.getConsentHistory(userId);
    } catch (error) {
      logger.error("Failed to get consent history", { error, userId });
      return [];
    }
  }

  async hasConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    try {
      const preferences = await this.getConsentPreferences(userId);

      if (!preferences) {
        return consentType === "necessary";
      }

      return preferences[consentType];
    } catch (error) {
      logger.error("Failed to check consent", { error, userId, consentType });
      return false;
    }
  }

  async withdrawConsent(
    userId: string,
    consentType: ConsentType,
    ipAddress: string | null,
    userAgent: string | null
  ): Promise<void> {
    try {
      const consentRecord: InsertConsentRecord = {
        userId,
        consentType,
        granted: false,
        timestamp: new Date(),
        ipAddress,
        userAgent,
        version: this.CONSENT_VERSION,
      };

      await storage.saveConsentRecords([consentRecord]);
      logger.info("Consent withdrawn", { userId, consentType });
    } catch (error) {
      logger.error("Failed to withdraw consent", { error, userId, consentType });
      throw new Error("Failed to withdraw consent");
    }
  }

  async exportUserData(userId: string): Promise<any> {
    try {
      const user = await storage.getUser(userId);
      const payments = await storage.getUserChapaPayments(userId);
      const adViews = await storage.getUserAdViews(userId);
      const consentHistory = await this.getConsentHistory(userId);

      return {
        user: {
          id: user?.id,
          email: user?.email,
          username: user?.username,
          fullName: user?.fullName,
          phoneNumber: user?.phoneNumber,
          createdAt: user?.createdAt,
        },
        payments,
        adViews,
        consentHistory,
        exportedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Failed to export user data", { error, userId });
      throw new Error("Failed to export user data");
    }
  }

  async requestDataDeletion(userId: string): Promise<void> {
    try {
      await storage.markUserForDeletion(userId);
      logger.info("User data deletion requested", { userId });
    } catch (error) {
      logger.error("Failed to request data deletion", { error, userId });
      throw new Error("Failed to request data deletion");
    }
  }

  async anonymizeUserData(userId: string): Promise<void> {
    try {
      await storage.anonymizeUser(userId);
      logger.info("User data anonymized", { userId });
    } catch (error) {
      logger.error("Failed to anonymize user data", { error, userId });
      throw new Error("Failed to anonymize user data");
    }
  }

  getConsentVersion(): string {
    return this.CONSENT_VERSION;
  }

  needsConsentUpdate(userConsentVersion: string): boolean {
    return userConsentVersion !== this.CONSENT_VERSION;
  }
}

export const consentService = new ConsentService();
