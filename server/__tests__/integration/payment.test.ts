import request from "supertest";
import express from "express";
import { storage } from "../../storage";
import { jwtService } from "../../jwt";

const app = express();
app.use(express.json());

const testUser = {
  id: "test-user-id",
  email: "test@example.com",
  username: "testuser",
  fullName: "Test User",
  role: "user",
  balance: 100,
};

const testPayment = {
  id: "test-payment-id",
  userId: "test-user-id",
  amount: 50,
  currency: "ETB",
  status: "success",
  txRef: "test-tx-ref",
  chapaReference: "test-chapa-ref",
};

describe("Payment Integration Tests", () => {
  let authToken: string;

  beforeAll(() => {
    authToken = jwtService.generateAccessToken(testUser as any);
  });

  describe("POST /api/payments/deposit", () => {
    it("should initiate deposit successfully", async () => {
      const depositData = {
        amount: 100,
        currency: "ETB",
      };

      jest.spyOn(storage, "createChapaPayment").mockResolvedValue({
        ...testPayment,
        amount: depositData.amount,
        status: "pending",
      } as any);

      const response = await request(app)
        .post("/api/payments/deposit")
        .set("Authorization", `Bearer ${authToken}`)
        .send(depositData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("paymentId");
      expect(response.body).toHaveProperty("checkoutUrl");
    });

    it("should fail with invalid amount", async () => {
      const response = await request(app)
        .post("/api/payments/deposit")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          amount: -10,
          currency: "ETB",
        });

      expect(response.status).toBe(400);
    });

    it("should fail without authentication", async () => {
      const response = await request(app).post("/api/payments/deposit").send({
        amount: 100,
        currency: "ETB",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/payments/withdraw", () => {
    it("should initiate withdrawal successfully", async () => {
      const withdrawData = {
        amount: 50,
        accountNumber: "1234567890",
        bankName: "Test Bank",
      };

      jest.spyOn(storage, "getUser").mockResolvedValue(testUser as any);
      jest.spyOn(storage, "createWithdrawalRequest").mockResolvedValue({
        id: "withdrawal-id",
        userId: testUser.id,
        amount: withdrawData.amount,
        status: "pending",
      } as any);

      const response = await request(app)
        .post("/api/payments/withdraw")
        .set("Authorization", `Bearer ${authToken}`)
        .send(withdrawData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("withdrawalId");
      expect(response.body.status).toBe("pending");
    });

    it("should fail with insufficient balance", async () => {
      const withdrawData = {
        amount: 1000,
        accountNumber: "1234567890",
        bankName: "Test Bank",
      };

      jest.spyOn(storage, "getUser").mockResolvedValue({
        ...testUser,
        balance: 50,
      } as any);

      const response = await request(app)
        .post("/api/payments/withdraw")
        .set("Authorization", `Bearer ${authToken}`)
        .send(withdrawData);

      expect(response.status).toBe(400);
    });

    it("should fail with invalid amount", async () => {
      const response = await request(app)
        .post("/api/payments/withdraw")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          amount: -10,
          accountNumber: "1234567890",
          bankName: "Test Bank",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/payments/history", () => {
    it("should get payment history", async () => {
      jest.spyOn(storage, "getUserPayments").mockResolvedValue([testPayment] as any);

      const response = await request(app)
        .get("/api/payments/history")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should fail without authentication", async () => {
      const response = await request(app).get("/api/payments/history");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/payments/:id", () => {
    it("should get payment by id", async () => {
      jest.spyOn(storage, "getChapaPayment").mockResolvedValue(testPayment as any);

      const response = await request(app)
        .get(`/api/payments/${testPayment.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testPayment.id,
        amount: testPayment.amount,
      });
    });

    it("should return 404 for non-existent payment", async () => {
      jest.spyOn(storage, "getChapaPayment").mockResolvedValue(null);

      const response = await request(app)
        .get("/api/payments/non-existent-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/webhooks/chapa", () => {
    it("should process successful payment webhook", async () => {
      const webhookData = {
        tx_ref: "test-tx-ref",
        status: "success",
        amount: 100,
        currency: "ETB",
        reference: "test-chapa-ref",
      };

      jest.spyOn(storage, "getChapaPaymentByTxRef").mockResolvedValue({
        ...testPayment,
        status: "pending",
      } as any);
      jest.spyOn(storage, "updateChapaPayment").mockResolvedValue(testPayment as any);
      jest.spyOn(storage, "getUser").mockResolvedValue(testUser as any);
      jest.spyOn(storage, "updateUser").mockResolvedValue(testUser as any);

      const response = await request(app).post("/api/webhooks/chapa").send(webhookData);

      expect(response.status).toBe(200);
    });

    it("should handle failed payment webhook", async () => {
      const webhookData = {
        tx_ref: "test-tx-ref",
        status: "failed",
        amount: 100,
        currency: "ETB",
        reference: "test-chapa-ref",
      };

      jest.spyOn(storage, "getChapaPaymentByTxRef").mockResolvedValue({
        ...testPayment,
        status: "pending",
      } as any);
      jest.spyOn(storage, "updateChapaPayment").mockResolvedValue({
        ...testPayment,
        status: "failed",
      } as any);

      const response = await request(app).post("/api/webhooks/chapa").send(webhookData);

      expect(response.status).toBe(200);
    });
  });
});
