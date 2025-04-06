import handler from "./register";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, queryOne } from "@/utils/db";

jest.mock("@/utils/db");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const mockQuery = query as jest.Mock;
const mockQueryOne = queryOne as jest.Mock;
const mockHash = bcrypt.hash as jest.Mock;
const mockSign = jwt.sign as jest.Mock;

describe("register API handler", () => {
  const mockReq = {
    method: "POST",
    body: {},
  } as NextApiRequest;

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as NextApiResponse;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 405 if method is not POST", async () => {
    mockReq.method = "GET";

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Method not allowed" });
  });

  it("should return 400 if username or password is missing", async () => {
    mockReq.body = { username: "", password: "" };
    mockReq.method = "POST";

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Username and password are required",
    });
  });

  it("should return 400 if username or password length is invalid", async () => {
    mockReq.body = { username: "usr", password: "pwd" };

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Username and password must be between 5 and 25 characters",
    });
  });

  it("should return 400 if username format is invalid", async () => {
    mockReq.body = { username: "invalid username!", password: "validPass123" };

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Username can only contain letters, numbers, and underscores",
    });
  });

  it("should return 400 if password format is invalid", async () => {
    mockReq.body = { username: "validUsername", password: "invalid pass!" };

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error:
        "Password can only contain letters, numbers, and special characters",
    });
  });

  it("should return 409 if user already exists", async () => {
    mockReq.body = { username: "existingUser", password: "validPass123" };
    mockQuery.mockResolvedValue([{ id: 1 }]);

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "User already exists" });
  });

  it("should return 500 if user registration fails", async () => {
    mockReq.body = { username: "newUser", password: "validPass123" };
    mockQuery.mockResolvedValue([]);
    mockHash.mockResolvedValue("hashedPassword");
    mockQueryOne.mockResolvedValue(null);

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "User registration failed",
    });
  });

  it("should return 201 and a token if registration is successful", async () => {
    mockReq.body = { username: "newUser", password: "validPass123" };
    mockQuery.mockResolvedValue([]);
    mockHash.mockResolvedValue("hashedPassword");
    mockQueryOne.mockResolvedValue({ id: "1", username: "newUser" });
    mockSign.mockReturnValue("testToken");

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User registered successfully",
    });
  });
});
