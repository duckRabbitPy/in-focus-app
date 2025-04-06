import { createMocks } from "node-mocks-http";
import { handler } from "./index";
import { query } from "@/utils/db";

// Mock dependencies
jest.mock("@/utils/db", () => ({
  queryOne: jest.fn(),
  query: jest.fn(),
}));

describe("API /api/user/[user_id]/lenses handler", () => {
  const mockUserId = "123";
  const mockLenses = [
    {
      id: "1",
      name: "lens1",
      created_at: "2023-01-01",
      updated_at: "2023-01-01",
    },
    {
      id: "2",
      name: "lens2",
      created_at: "2023-01-02",
      updated_at: "2023-01-02",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 403 if user_id does not match authenticated user", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: "wrong_id" },
    });
    req.user = { userId: mockUserId };

    await handler(req, res);
    expect(res._getStatusCode()).toBe(403);
    expect(res._getData()).toEqual(
      JSON.stringify({ error: "Unauthorized access" })
    );
  });

  it("returns 200 and lenses on GET request", async () => {
    (query as jest.Mock).mockResolvedValue(mockLenses);

    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: mockUserId },
    });
    req.user = { userId: mockUserId };

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual(JSON.stringify(mockLenses));
  });

  it("returns 500 if fetching lenses fails", async () => {
    (query as jest.Mock).mockImplementation(() => {
      throw new Error("DB error");
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: mockUserId },
    });
    req.user = { userId: mockUserId };

    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toEqual(
      JSON.stringify({ error: "Failed to fetch lenses" })
    );
  });

  it("returns 400 if POST body is invalid", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: mockUserId },
      body: { lenses: "invalid" },
    });
    req.user = { userId: mockUserId };

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toEqual(
      JSON.stringify({
        error: "Lenses must be provided as an array of strings",
      })
    );
  });

  it("returns 400 if no valid lenses are provided", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: mockUserId },
      body: { lenses: ["", "   ", "a".repeat(51)] },
    });
    req.user = { userId: mockUserId };

    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toEqual(
      JSON.stringify({ error: "No valid lenses provided" })
    );
  });

  it("returns 200 and inserted lenses on successful POST", async () => {
    const newLenses = ["lens3", "lens4"];
    const insertedLenses = [
      {
        id: "3",
        name: "lens3",
        created_at: "2023-01-03",
        updated_at: "2023-01-03",
      },
      {
        id: "4",
        name: "lens4",
        created_at: "2023-01-04",
        updated_at: "2023-01-04",
      },
    ];
    (query as jest.Mock)
      .mockResolvedValueOnce(insertedLenses) // For inserted lenses
      .mockResolvedValueOnce([...mockLenses, ...insertedLenses]); // For all lenses

    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: mockUserId },
      body: { lenses: newLenses },
    });
    req.user = { userId: mockUserId };

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.inserted).toEqual(insertedLenses);
    expect(data.all).toEqual([...mockLenses, ...insertedLenses]);
  });

  it("returns 500 if inserting lenses fails", async () => {
    (query as jest.Mock).mockImplementation(() => {
      throw new Error("DB error");
    });

    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: mockUserId },
      body: { lenses: ["lens3"] },
    });
    req.user = { userId: mockUserId };

    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toEqual(
      JSON.stringify({ error: "Failed to create lenses" })
    );
  });

  it("returns 405 for unsupported methods", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      query: { user_id: mockUserId },
    });
    req.user = { userId: mockUserId };

    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    expect(res._getData()).toEqual(
      JSON.stringify({ error: "Method not allowed" })
    );
  });
});
