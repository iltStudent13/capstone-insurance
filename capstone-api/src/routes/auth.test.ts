import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authRouter from "./auth.js";
import User from "../models/User.js";

describe("Auth routes", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);

    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";
    vi.restoreAllMocks();
  });

  it("registers a user and returns a token and user payload", async () => {
    vi.spyOn(User, "findOne").mockResolvedValue(null as never);
    vi.spyOn(User.prototype, "save").mockResolvedValue({
      _id: "new-user-id",
      name: "Jane Doe",
      email: "jane@example.com",
      role: "admin",
    } as never);

    const response = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
      role: "admin",
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user).toMatchObject({
      name: "Jane Doe",
      email: "jane@example.com",
      role: "admin",
    });
  });

  it("logs in an existing user and returns a token and user payload", async () => {
    const mockUser = {
      _id: "mock-user-id",
      name: "Jane Doe",
      email: "jane@example.com",
      role: "admin",
      comparePassword: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(User, "findOne").mockReturnValue({
      select: vi.fn().mockResolvedValue(mockUser),
    } as never);

    const response = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user).toMatchObject({
      email: "jane@example.com",
      role: "admin",
    });
  });

  it("rejects an invalid login", async () => {
    vi.spyOn(User, "findOne").mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    } as never);

    const response = await request(app).post("/api/auth/login").send({
      email: "doesnotexist@example.com",
      password: "wrongpass",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid email or password");
  });
});
