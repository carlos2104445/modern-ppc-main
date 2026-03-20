import { gdprService } from "../gdpr-service";
import { storage } from "../storage";

jest.mock("../storage");

describe("GDPR Service", () => {
  const mockUser = {
    id: "1",
    fullName: "Test User",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    username: "testuser",
    phoneNumber: "1234567890",
    dateOfBirth: "1990-01-01",
    password: "hashedpassword",
    balance: "100.00",
    lifetimeEarnings: "500.00",
    lifetimeSpending: "0.00",
    reputationScore: 100,
    referralCode: "TEST123",
    referredBy: null,
    role: "user" as const,
    status: "active" as const,
    twoFactorEnabled: false,
    kycStatus: "pending" as const,
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakFreezes: 0,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (storage.getUserAdViews as jest.Mock).mockResolvedValue([]);
    (storage.getAllWithdrawalRequests as jest.Mock).mockResolvedValue([]);
    (storage.getAllDepositRequests as jest.Mock).mockResolvedValue([]);
    (storage.getAllTransactionLogs as jest.Mock).mockResolvedValue([]);
    (storage.getUserChapaPayments as jest.Mock).mockResolvedValue([]);
  });

  describe("exportUserData", () => {
    it("should export all user data", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(mockUser);

      const data = await gdprService.exportUserData("1");

      expect(data).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(mockUser.id);
      expect(data.user.email).toBe(mockUser.email);
      expect(data.user.fullName).toBe(mockUser.fullName);
      expect(data.exportDate).toBeDefined();
    });

    it("should not include password in exported data", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(mockUser);

      const data = await gdprService.exportUserData("1");

      expect(data.user.password).toBeUndefined();
    });

    it("should throw error if user not found", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(null);

      await expect(gdprService.exportUserData("999")).rejects.toThrow("User not found");
    });

    it("should include transactions if available", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(mockUser);

      const data = await gdprService.exportUserData("1");

      expect(data.transactions).toBeDefined();
      expect(Array.isArray(data.transactions)).toBe(true);
    });

    it("should include adViews if available", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(mockUser);

      const data = await gdprService.exportUserData("1");

      expect(data.adViews).toBeDefined();
      expect(Array.isArray(data.adViews)).toBe(true);
    });
  });

  describe("deleteUserData", () => {
    it("should delete user data with keepFinancialRecords=false", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(mockUser);
      (storage.deleteUser as jest.Mock).mockResolvedValue(undefined);

      await expect(gdprService.deleteUserData("1", false)).resolves.toBe(true);

      expect(storage.getUser).toHaveBeenCalledWith("1");
      expect(storage.deleteUser).toHaveBeenCalledWith("1");
    });

    it("should anonymize user data with keepFinancialRecords=true", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(mockUser);
      (storage.anonymizeUser as jest.Mock).mockResolvedValue(undefined);

      await expect(gdprService.deleteUserData("1", true)).resolves.toBe(true);

      expect(storage.getUser).toHaveBeenCalledWith("1");
      expect(storage.anonymizeUser).toHaveBeenCalledWith("1");
    });

    it("should throw error if user not found", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(null);

      await expect(gdprService.deleteUserData("999")).rejects.toThrow("User not found");
    });
  });

  describe("anonymizeUserData", () => {
    it("should anonymize user data", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(mockUser);
      (storage.anonymizeUser as jest.Mock).mockResolvedValue(undefined);

      await expect(gdprService.anonymizeUserData("1")).resolves.toBe(true);

      expect(storage.getUser).toHaveBeenCalledWith("1");
      expect(storage.anonymizeUser).toHaveBeenCalledWith("1");
    });

    it("should throw error if user not found", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(null);

      await expect(gdprService.anonymizeUserData("999")).rejects.toThrow("User not found");
    });
  });

  describe("data integrity", () => {
    it("should maintain data structure in export", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(mockUser);

      const data = await gdprService.exportUserData("1");

      expect(data).toHaveProperty("user");
      expect(data).toHaveProperty("transactions");
      expect(data).toHaveProperty("adViews");
      expect(data).toHaveProperty("exportDate");
    });

    it("should handle users with no transactions", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(mockUser);

      const data = await gdprService.exportUserData("1");

      expect(data.transactions).toBeDefined();
      expect(Array.isArray(data.transactions)).toBe(true);
    });

    it("should handle users with no adViews", async () => {
      (storage.getUser as jest.Mock).mockResolvedValue(mockUser);

      const data = await gdprService.exportUserData("1");

      expect(data.adViews).toBeDefined();
      expect(Array.isArray(data.adViews)).toBe(true);
    });
  });
});
