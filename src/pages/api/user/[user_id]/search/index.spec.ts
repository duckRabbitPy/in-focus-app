import { createMocks } from "node-mocks-http";
import { handler } from "./index";
import { query } from "@/utils/db";

jest.mock("@/utils/db", () => ({
  query: jest.fn(),
}));

describe("Search API Handler", () => {
  const mockUserId = "123";
  const mockTags = ["tag1", "tag2"];
  const mockSearchTerm = "example";

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
    expect(res._getJSONData()).toEqual({ error: "Unauthorized" });
  });

  it("should return 405 for unsupported HTTP methods", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: mockUserId },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({ error: "Method not allowed" });
  });

  it("should return paginated photos with tags and metadata", async () => {
    const mockPhotos = [
      {
        id: 1,
        roll_id: 1,
        subject: "Photo 1",
        photo_url: "http://example.com/photo1.jpg",
        created_at: "2025-04-06T12:00:00Z",
        roll_name: "Roll 1",
        tags: ["tag1", "tag2"],
      },
    ];

    (query as jest.Mock).mockResolvedValueOnce([
      { total_count: "1" }, // Mock count query result
    ]);
    (query as jest.Mock).mockResolvedValueOnce(mockPhotos); // Mock main query result

    const { req, res } = createMocks({
      method: "GET",
      query: {
        user_id: mockUserId,
        tags: mockTags,
        searchTerm: mockSearchTerm,
        page: "1",
        pageSize: "10",
      },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      photos: [
        {
          id: "1",
          roll_id: "1",
          subject: "Photo 1",
          photo_url: "http://example.com/photo1.jpg",
          created_at: "2025-04-06T12:00:00Z",
          roll_name: "Roll 1",
          tags: ["tag1", "tag2"],
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it("should return 500 if an error occurs during the query", async () => {
    (query as jest.Mock).mockRejectedValueOnce(new Error("Database error"));

    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: mockUserId },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: "Failed to search photos" });
  });
});
