import { createMocks } from "node-mocks-http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import handler from "./index";
import { queryOne } from "@/utils/db";

// Mock dependencies
jest.mock("@/utils/db", () => ({
  queryOne: jest.fn(),
}));
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

describe("POST /api/login", () => {
  it("should return the JWT_SECRET from the environment", () => {
    const JWT_SECRET = process.env.JWT_SECRET;
    expect(JWT_SECRET).toBeDefined();
  });

  it("returns 400 if username or password missing", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {},
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toEqual(
      JSON.stringify({
        error: "Username and password are required",
      })
    );
  });

  it("returns 401 if user not found", async () => {
    (queryOne as jest.Mock).mockResolvedValue(null);
    const { req, res } = createMocks({
      method: "POST",
      body: { username: "test", password: "test" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it("returns 401 if password is incorrect", async () => {
    (queryOne as jest.Mock).mockResolvedValue({
      id: "1",
      username: "test",
      password_hash: "hashedpw",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const { req, res } = createMocks({
      method: "POST",
      body: { username: "test", password: "wrong" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it("returns 200 and token on successful login", async () => {
    (queryOne as jest.Mock).mockResolvedValue({
      id: "1",
      username: "test",
      password_hash: "hashedpw",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("fake.jwt.token");

    const { req, res } = createMocks({
      method: "POST",
      body: { username: "test", password: "correct" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.token).toBe("fake.jwt.token");
  });

  it("returns 500 on unexpected error", async () => {
    (queryOne as jest.Mock).mockImplementation(() => {
      throw new Error("DB error");
    });

    const { req, res } = createMocks({
      method: "POST",
      body: { username: "test", password: "test" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
  });
});
