import { createMocks } from "node-mocks-http";
import { handler } from "./index";
import { generateShortId } from "@/utils/shared";
import { query, queryOne } from "@/utils/db";

jest.mock("@/utils/db", () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
}));

jest.mock("@/utils/shared", () => ({
  generateShortId: jest.fn(() => "abcd"),
}));

describe("Rolls API Handler", () => {
  const mockUserId = "123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if user_id does not match authenticated user", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: "wrong_id" },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(res._getJSONData()).toEqual({ error: "Unauthorized access" });
  });

  it("should return 405 for unsupported HTTP methods", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      query: { user_id: mockUserId },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({ error: "Method not allowed" });
  });

  it("should return all rolls for a valid GET request", async () => {
    const mockRolls = [
      {
        id: 1,
        user_id: mockUserId,
        name: "Roll 1",
        created_at: "2025-04-06T12:00:00Z",
        updated_at: "2025-04-06T12:00:00Z",
      },
      {
        id: 2,
        user_id: mockUserId,
        name: "Roll 2",
        created_at: "2025-04-05T12:00:00Z",
        updated_at: "2025-04-05T12:00:00Z",
      },
    ];

    (query as jest.Mock).mockResolvedValueOnce(mockRolls);

    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: mockUserId },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual(mockRolls);
  });

  it("should return an empty array if no rolls exist for a valid GET request", async () => {
    (query as jest.Mock).mockResolvedValueOnce([]);

    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: mockUserId },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual([]);
  });

  it("should return 500 if an error occurs during GET", async () => {
    (query as jest.Mock).mockRejectedValueOnce(new Error("Database error"));

    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: mockUserId },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: "Failed to fetch rolls" });
  });

  it("should create a new roll and return it for a valid POST request", async () => {
    const mockNewRoll = {
      id: 3,
      user_id: mockUserId,
      name: "Draft: #abcd",
      created_at: "2025-04-06T12:00:00Z",
      updated_at: "2025-04-06T12:00:00Z",
    };

    (queryOne as jest.Mock).mockResolvedValueOnce(mockNewRoll);

    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: mockUserId },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData()).toEqual(mockNewRoll);
    expect(generateShortId).toHaveBeenCalledWith(4);
  });

  it("should return 500 if creating a new roll fails to return roll", async () => {
    (queryOne as jest.Mock).mockResolvedValueOnce(null);

    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: mockUserId },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: "Failed to create roll" });
  });

  it("should return 500 if an error occurs during POST", async () => {
    (queryOne as jest.Mock).mockRejectedValueOnce(new Error("Database error"));

    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: mockUserId },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: "Failed to create roll" });
  });
});
