import request from "supertest";
import User from "../models/User.js";
import Policy from "../models/Policy.js";
import Claim from "../models/Claim.js";
import connectDB from "../config/db.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";

describe("Claim routes", () => {
  let server: any;
  let adminToken: string;
  let userToken: string;
  let policyId: string;
  let claimId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB(
        process.env.MONGODB_URI || "mongodb://localhost:27017/capstone",
      );
    }

    server = request(`http://localhost:${process.env.PORT || 4000}`);

    const adminLoginResponse = await server.post("/api/auth/login").send({
      email: "admin@example.com",
      password: "Password123!",
    });

    adminToken = adminLoginResponse.body.token;

    const userLoginResponse = await server.post("/api/auth/login").send({
      email: "user@example.com",
      password: "Password123!",
    });

    userToken = userLoginResponse.body.token;

    const policy = await Policy.findOne({});
    policyId = policy?._id.toString() || "";
  });

  it("creates a new claim from an existing policy", async () => {
    const response = await server
      .post("/api/claims")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        policy: policyId,
        description: "Test claim",
        amount: 1000,
        incidentDate: new Date().toISOString(),
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    claimId = response.body._id;
  });

  it("returns 409 when trying to create a claim with an existing ObjectId", async () => {
    const existingClaim = await Claim.findOne({});

    const response = await server
      .post("/api/claims")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        _id: existingClaim?._id,
        policy: policyId,
        description: "Duplicate claim id test",
        amount: 500,
        incidentDate: new Date().toISOString(),
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Duplicate value");
  });

  it("adds a note to an existing claim", async () => {
    const response = await server
      .post(`/api/claims/${claimId}/notes`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        text: "This is a test note",
      });

    expect(response.status).toBe(201);
    expect(response.body.notes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          text: "This is a test note",
        }),
      ]),
    );
  });

  it("updates the status of an existing claim", async () => {
    const response = await server
      .put(`/api/claims/${claimId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "approved",
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("approved");
  });

  it("deletes an existing claim", async () => {
    const response = await server
      .delete(`/api/claims/${claimId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it("assigns a claim to the authenticated user when creating a new claim", async () => {
    const response = await server
      .post("/api/claims")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        policy: policyId,
        description: "Test claim for assignment",
        amount: 1500,
        incidentDate: new Date().toISOString(),
      });

    expect(response.status).toBe(201);
    expect(response.body.assignedTo).toBeTruthy();
    expect(response.body.assignedTo).toEqual(expect.any(String));
  });
});
