import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authRouter from "./auth.js";
import policyRouter from "./policy.js";
import User from "../models/User.js";
import Policy from "../models/Policy.js";

// Test that creates a new policy and checks if it is saved correctly
describe("Policy routes", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);
    app.use("/api/policies", policyRouter);
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";
    vi.restoreAllMocks();
  });

  it("creates a new policy", async () => {
    const adminUser = {
      _id: "admin-user-id",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      comparePassword: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(User, "findOne").mockReturnValue({
      select: vi.fn().mockResolvedValue(adminUser),
    } as never);
    vi.spyOn(User, "findById").mockResolvedValue(adminUser as never);
    vi.spyOn(Policy, "findOne").mockResolvedValue(null as never);
    vi.spyOn(Policy.prototype, "save").mockImplementation(async function () {
      return {
        _id: "policy-123",
        holderName: this.holderName,
        type: this.type,
        premium: this.premium,
        status: this.status,
        effectiveDate: this.effectiveDate,
        expirationDate: this.expirationDate,
        owner: this.owner,
      } as never;
    });

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "Password123!",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeTruthy();

    const response = await request(app)
      .post("/api/policies")
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send({
        policyNumber: "POL-LIFE-123",
        holderName: "John Doe",
        type: "life",
        premium: 1000,
        status: "active",
        effectiveDate: new Date().toISOString(),
        expirationDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ).toISOString(),
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      holderName: "John Doe",
      type: "life",
      premium: 1000,
      status: "active",
    });
  });
});
