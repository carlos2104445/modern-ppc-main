import { mfaService } from "../mfa-service";

describe("MFA Service", () => {
  describe("generateSecret", () => {
    it("should generate a secret and QR code", async () => {
      const userId = "test-user-id";
      const email = "test@example.com";
      const { secret, qrCode } = await mfaService.generateSecret(userId, email);

      expect(secret).toBeDefined();
      expect(typeof secret).toBe("string");
      expect(secret.length).toBeGreaterThan(0);
      expect(qrCode).toBeDefined();
      expect(typeof qrCode).toBe("string");
      expect(qrCode).toContain("data:image/png;base64");
    });

    it("should generate different secrets for each call", async () => {
      const userId = "test-user-id";
      const email = "test@example.com";
      const result1 = await mfaService.generateSecret(userId, email);
      const result2 = await mfaService.generateSecret(userId, email);

      expect(result1.secret).not.toBe(result2.secret);
      expect(result1.qrCode).not.toBe(result2.qrCode);
    });

    it("should include email in QR code", async () => {
      const userId = "test-user-id";
      const email = "test@example.com";
      const { qrCode } = await mfaService.generateSecret(userId, email);

      expect(qrCode).toBeDefined();
      expect(qrCode.length).toBeGreaterThan(100);
    });
  });

  describe("verifyToken", () => {
    it("should verify valid token", async () => {
      const userId = "test-user-id";
      const email = "test@example.com";
      const { secret } = await mfaService.generateSecret(userId, email);

      const speakeasy = require("speakeasy");
      const token = speakeasy.totp({
        secret: secret,
        encoding: "base32",
      });

      const isValid = mfaService.verifyToken(secret, token);
      expect(isValid).toBe(true);
    });

    it("should reject invalid token", async () => {
      const userId = "test-user-id";
      const email = "test@example.com";
      const { secret } = await mfaService.generateSecret(userId, email);

      const isValid = mfaService.verifyToken(secret, "000000");
      expect(isValid).toBe(false);
    });

    it("should reject token with wrong secret", async () => {
      const userId = "test-user-id";
      const email = "test@example.com";
      const { secret: secret1 } = await mfaService.generateSecret(userId, email);
      const { secret: secret2 } = await mfaService.generateSecret(userId, email);

      const speakeasy = require("speakeasy");
      const token = speakeasy.totp({
        secret: secret1,
        encoding: "base32",
      });

      const isValid = mfaService.verifyToken(secret2, token);
      expect(isValid).toBe(false);
    });

    it("should handle malformed tokens", async () => {
      const userId = "test-user-id";
      const email = "test@example.com";
      const { secret } = await mfaService.generateSecret(userId, email);

      const isValid = mfaService.verifyToken(secret, "invalid");
      expect(isValid).toBe(false);
    });

    it("should handle empty tokens", async () => {
      const userId = "test-user-id";
      const email = "test@example.com";
      const { secret } = await mfaService.generateSecret(userId, email);

      const isValid = mfaService.verifyToken(secret, "");
      expect(isValid).toBe(false);
    });
  });

  describe("token window", () => {
    it("should accept tokens within time window", async () => {
      const userId = "test-user-id";
      const email = "test@example.com";
      const { secret } = await mfaService.generateSecret(userId, email);

      const speakeasy = require("speakeasy");
      const token = speakeasy.totp({
        secret: secret,
        encoding: "base32",
        window: 1,
      });

      const isValid = mfaService.verifyToken(secret, token);
      expect(isValid).toBe(true);
    });
  });
});
