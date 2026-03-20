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
};

const testCampaign = {
  id: "test-campaign-id",
  userId: "test-user-id",
  title: "Test Campaign",
  description: "Test Description",
  targetUrl: "https://example.com",
  budget: 100,
  status: "active",
};

describe("Campaign Integration Tests", () => {
  let authToken: string;

  beforeAll(() => {
    authToken = jwtService.generateAccessToken(testUser as any);
  });

  describe("GET /api/admin-campaigns", () => {
    it("should get all admin campaigns", async () => {
      jest.spyOn(storage, "getAllAdminCampaigns").mockResolvedValue([testCampaign] as any);

      const response = await request(app)
        .get("/api/admin-campaigns")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/admin-campaigns/:id", () => {
    it("should get campaign by id", async () => {
      jest.spyOn(storage, "getAdminCampaign").mockResolvedValue(testCampaign as any);

      const response = await request(app)
        .get(`/api/admin-campaigns/${testCampaign.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testCampaign.id,
        title: testCampaign.title,
      });
    });

    it("should return 404 for non-existent campaign", async () => {
      jest.spyOn(storage, "getAdminCampaign").mockResolvedValue(null);

      const response = await request(app)
        .get("/api/admin-campaigns/non-existent-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/admin-campaigns", () => {
    it("should create new campaign", async () => {
      const newCampaign = {
        title: "New Campaign",
        description: "New Description",
        targetUrl: "https://example.com",
        budget: 200,
      };

      jest.spyOn(storage, "createAdminCampaign").mockResolvedValue({
        ...newCampaign,
        id: "new-campaign-id",
        userId: testUser.id,
        status: "active",
      } as any);

      const response = await request(app)
        .post("/api/admin-campaigns")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newCampaign);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe(newCampaign.title);
    });

    it("should fail with invalid data", async () => {
      const response = await request(app)
        .post("/api/admin-campaigns")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/admin-campaigns/:id", () => {
    it("should update campaign", async () => {
      const updates = {
        title: "Updated Campaign",
        budget: 300,
      };

      jest.spyOn(storage, "updateAdminCampaign").mockResolvedValue({
        ...testCampaign,
        ...updates,
      } as any);

      const response = await request(app)
        .put(`/api/admin-campaigns/${testCampaign.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updates.title);
      expect(response.body.budget).toBe(updates.budget);
    });

    it("should return 404 for non-existent campaign", async () => {
      jest.spyOn(storage, "updateAdminCampaign").mockResolvedValue(null);

      const response = await request(app)
        .put("/api/admin-campaigns/non-existent-id")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated" });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/admin-campaigns/:id", () => {
    it("should delete campaign", async () => {
      jest.spyOn(storage, "deleteAdminCampaign").mockResolvedValue(true);

      const response = await request(app)
        .delete(`/api/admin-campaigns/${testCampaign.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it("should return 404 for non-existent campaign", async () => {
      jest.spyOn(storage, "deleteAdminCampaign").mockResolvedValue(false);

      const response = await request(app)
        .delete("/api/admin-campaigns/non-existent-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
