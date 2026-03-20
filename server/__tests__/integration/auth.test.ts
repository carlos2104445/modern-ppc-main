import request from "supertest";
import express from "express";
import { registerAuthRoutes } from "../../auth-routes";
import { storage } from "../../storage";
import { jwtService } from "../../jwt";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
registerAuthRoutes(app);

describe("Auth Integration Tests", () => {
  const testUser = {
    id: "test-user-id",
    email: "test@example.com",
    username: "testuser",
    fullName: "Test User",
    password: "",
    role: "user",
    balance: 0,
    lifetimeEarnings: 0,
    twoFactorEnabled: false,
  };

  beforeAll(async () => {
    testUser.password = await bcrypt.hash("password123", 10);
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      jest.spyOn(storage, "getUserByEmail").mockResolvedValue(testUser as any);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.user).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        username: testUser.username,
      });
    });

    it("should fail with invalid email", async () => {
      jest.spyOn(storage, "getUserByEmail").mockResolvedValue(undefined);

      const response = await request(app).post("/api/auth/login").send({
        email: "invalid@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
    });

    it("should fail with invalid password", async () => {
      jest.spyOn(storage, "getUserByEmail").mockResolvedValue(testUser as any);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
    });

    it("should fail with missing email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        password: "password123",
      });

      expect(response.status).toBe(400);
    });

    it("should fail with missing password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should refresh token successfully", async () => {
      const refreshToken = jwtService.generateRefreshToken(testUser as any);
      jest.spyOn(storage, "getUser").mockResolvedValue(testUser as any);

      const response = await request(app).post("/api/auth/refresh").send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should fail with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" });

      expect(response.status).toBe(401);
    });

    it("should fail with missing refresh token", async () => {
      const response = await request(app).post("/api/auth/refresh").send({});

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const accessToken = jwtService.generateAccessToken(testUser as any);

      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logged out successfully");
    });
  });

  describe("POST /api/auth/revoke", () => {
    it("should revoke all user tokens", async () => {
      const accessToken = jwtService.generateAccessToken(testUser as any);
      jest.spyOn(storage, "getUser").mockResolvedValue(testUser as any);

      const response = await request(app)
        .post("/api/auth/revoke")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("All tokens revoked successfully");
    });

    it("should fail without authentication", async () => {
      const response = await request(app).post("/api/auth/revoke").send({});

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user info", async () => {
      const accessToken = jwtService.generateAccessToken(testUser as any);
      jest.spyOn(storage, "getUser").mockResolvedValue(testUser as any);

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        username: testUser.username,
      });
    });

    it("should fail without authentication", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/auth/mfa/setup", () => {
    it("should generate MFA secret", async () => {
      const accessToken = jwtService.generateAccessToken(testUser as any);
      jest.spyOn(storage, "getUser").mockResolvedValue(testUser as any);

      const response = await request(app)
        .post("/api/auth/mfa/setup")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("secret");
      expect(response.body).toHaveProperty("qrCode");
    });

    it("should fail without authentication", async () => {
      const response = await request(app).post("/api/auth/mfa/setup");

      expect(response.status).toBe(401);
    });
  });
});
