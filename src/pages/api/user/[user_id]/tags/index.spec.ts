import { createMocks } from "node-mocks-http";
import { handler } from "./index";
import { query } from "@/utils/db";

jest.mock("@/utils/db", () => ({
  query: jest.fn(),
}));

describe("Tags API Handler", () => {
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

  it("should return all tags for a valid GET request", async () => {
    const mockTags = [
      {
        id: 1,
        name: "tag1",
        created_at: "2025-04-06T12:00:00Z",
        updated_at: "2025-04-06T12:00:00Z",
      },
      {
        id: 2,
        name: "tag2",
        created_at: "2025-04-06T12:00:00Z",
        updated_at: "2025-04-06T12:00:00Z",
      },
    ];

    (query as jest.Mock).mockResolvedValueOnce(mockTags);

    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: mockUserId },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual(mockTags);
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
    expect(res._getJSONData()).toEqual({ error: "Failed to fetch tags" });
  });

  it("should insert new tags and return all tags for a valid POST request", async () => {
    const mockInsertedTags = [
      {
        id: 3,
        name: "tag3",
        created_at: "2025-04-06T12:00:00Z",
        updated_at: "2025-04-06T12:00:00Z",
      },
    ];

    const mockAllTags = [
      {
        id: 1,
        name: "tag1",
        created_at: "2025-04-06T12:00:00Z",
        updated_at: "2025-04-06T12:00:00Z",
      },
      {
        id: 2,
        name: "tag2",
        created_at: "2025-04-06T12:00:00Z",
        updated_at: "2025-04-06T12:00:00Z",
      },
      {
        id: 3,
        name: "tag3",
        created_at: "2025-04-06T12:00:00Z",
        updated_at: "2025-04-06T12:00:00Z",
      },
    ];

    (query as jest.Mock)
      .mockResolvedValueOnce(mockInsertedTags) // Mock inserted tags
      .mockResolvedValueOnce(mockAllTags); // Mock all tags after insertion

    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: mockUserId },
      body: { tags: ["tag3"] },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      inserted: mockInsertedTags,
      all: mockAllTags,
    });
  });

  it("should return 400 if no valid tags are provided in POST", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: mockUserId },
      body: { tags: ["", "   ", null] },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ error: "No valid tags provided" });
  });

  it("should return 500 if an error occurs during POST", async () => {
    (query as jest.Mock).mockRejectedValueOnce(new Error("Database error"));

    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: mockUserId },
      body: { tags: ["tag3"] },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: "Failed to create tags" });
  });
});
