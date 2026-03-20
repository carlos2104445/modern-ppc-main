import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { createLogger } from "./logger";

const logger = createLogger("MFAService");

export class MFAService {
  async generateSecret(userId: string, email: string): Promise<{ secret: string; qrCode: string }> {
    try {
      const secret = speakeasy.generateSecret({
        name: `Modern PPC (${email})`,
        issuer: "Modern PPC",
        length: 32,
      });

      const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

      return {
        secret: secret.base32,
        qrCode,
      };
    } catch (error) {
      logger.error("Failed to generate MFA secret", error, { userId });
      throw new Error("Failed to generate MFA secret");
    }
  }

  verifyToken(secret: string, token: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 2,
      });
    } catch (error) {
      logger.error("Failed to verify MFA token", error);
      return false;
    }
  }

  async enableMFA(
    userId: string,
    secret: string,
    token: string
  ): Promise<{ success: boolean; backupCodes?: string[] }> {
    try {
      if (!this.verifyToken(secret, token)) {
        return { success: false };
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false };
      }

      const backupCodes = this.generateBackupCodes(10);
      const hashedCodes = await Promise.all(backupCodes.map((code) => bcrypt.hash(code, 10)));

      await storage.saveMFABackupCodes(userId, hashedCodes);

      return { success: true, backupCodes };
    } catch (error) {
      logger.error("Failed to enable MFA", error, { userId });
      return { success: false };
    }
  }

  async disableMFA(userId: string, token: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return false;
      }

      await storage.deleteMFABackupCodes(userId);

      return true;
    } catch (error) {
      logger.error("Failed to disable MFA", error, { userId });
      return false;
    }
  }

  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString("hex").toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const hashedCodes = await storage.getMFABackupCodes(userId);

      for (let i = 0; i < hashedCodes.length; i++) {
        const isValid = await bcrypt.compare(code, hashedCodes[i]);
        if (isValid) {
          await storage.removeUsedBackupCode(userId, hashedCodes[i]);
          logger.info("Backup code used successfully", { userId });
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error("Failed to verify backup code", error, { userId });
      return false;
    }
  }

  async regenerateBackupCodes(userId: string): Promise<string[]> {
    try {
      const backupCodes = this.generateBackupCodes(10);
      const hashedCodes = await Promise.all(backupCodes.map((code) => bcrypt.hash(code, 10)));

      await storage.saveMFABackupCodes(userId, hashedCodes);
      logger.info("Backup codes regenerated", { userId });

      return backupCodes;
    } catch (error) {
      logger.error("Failed to regenerate backup codes", error, { userId });
      throw new Error("Failed to regenerate backup codes");
    }
  }

  async getRemainingBackupCodesCount(userId: string): Promise<number> {
    try {
      const hashedCodes = await storage.getMFABackupCodes(userId);
      return hashedCodes.length;
    } catch (error) {
      logger.error("Failed to get backup codes count", error, { userId });
      return 0;
    }
  }
}

export const mfaService = new MFAService();
