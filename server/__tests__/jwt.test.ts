import { jwtService } from "../jwt";
import type { User } from "@shared/schema";

describe("JWT Service", () => {
  const mockUser: User = {
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
    role: "user",
    status: "active",
    twoFactorEnabled: false,
    kycStatus: "pending",
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakFreezes: 0,
    createdAt: new Date(),
  };

  describe("generateTokenPair", () => {
    it("should generate access and refresh tokens", () => {
      const { accessToken, refreshToken } = jwtService.generateTokenPair(mockUser);

      expect(accessToken).toBeDefined();
      expect(typeof accessToken).toBe("string");
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe("string");
      expect(accessToken).not.toBe(refreshToken);
    });

    it("should include user information in token payload", () => {
      const { accessToken } = jwtService.generateTokenPair(mockUser);
      const payload = jwtService.verifyAccessToken(accessToken);

      expect(payload.userId).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify valid access token", () => {
      const { accessToken } = jwtService.generateTokenPair(mockUser);
      const payload = jwtService.verifyAccessToken(accessToken);

      expect(payload.userId).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });

    it("should throw error for invalid token", () => {
      expect(() => {
        jwtService.verifyAccessToken("invalid-token");
      }).toThrow();
    });

    it("should throw error for expired token", () => {
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDA5MDB9.invalid";

      expect(() => {
        jwtService.verifyAccessToken(expiredToken);
      }).toThrow();
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify valid refresh token", () => {
      const { refreshToken } = jwtService.generateTokenPair(mockUser);
      const payload = jwtService.verifyRefreshToken(refreshToken);

      expect(payload.userId).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });

    it("should throw error for invalid refresh token", () => {
      expect(() => {
        jwtService.verifyRefreshToken("invalid-token");
      }).toThrow();
    });

    it("should not accept access token as refresh token", () => {
      const { accessToken } = jwtService.generateTokenPair(mockUser);

      expect(() => {
        jwtService.verifyRefreshToken(accessToken);
      }).toThrow();
    });
  });

  describe("token expiration", () => {
    it("should generate valid tokens with correct types", () => {
      const { accessToken, refreshToken } = jwtService.generateTokenPair(mockUser);

      const accessPayload = jwtService.verifyAccessToken(accessToken);
      const refreshPayload = jwtService.verifyRefreshToken(refreshToken);

      expect(accessPayload.type).toBe("access");
      expect(refreshPayload.type).toBe("refresh");
    });
  });
});
