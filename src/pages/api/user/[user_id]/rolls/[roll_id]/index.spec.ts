import { createMocks } from "node-mocks-http";
import { handler } from "./index";
import { query } from "@/utils/db";

jest.mock("@/utils/db", () => ({
  query: jest.fn(),
}));

describe("Rolls/[roll_id] API Handler", () => {
  const mockUserId = "123";
  const mockRollId = "456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if user_id does not match authenticated user", async () => {
    const { req, res } = createMocks({
      method: "PUT",
      query: { user_id: "wrong_id", roll_id: mockRollId },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(res._getJSONData()).toEqual({ error: "Unauthorized access" });
  });

  it("should return 405 for unsupported HTTP methods", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: mockUserId, roll_id: mockRollId },
    });

    req.user = { userId: mockUserId };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({ error: "Method not allowed" });
  });

  describe("PUT method", () => {
    it("should return 400 if name is not provided", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        query: { user_id: mockUserId, roll_id: mockRollId },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({ error: "Name is required" });
    });

    it("should update a roll and return it for a valid PUT request", async () => {
      const mockUpdatedRoll = {
        id: mockRollId,
        user_id: mockUserId,
        name: "Updated Roll",
        film_type: "35mm",
        iso: 400,
        created_at: "2025-04-06T12:00:00Z",
        updated_at: "2025-04-06T12:00:00Z",
      };

      (query as jest.Mock).mockResolvedValueOnce([mockUpdatedRoll]);

      const { req, res } = createMocks({
        method: "PUT",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          name: "Updated Roll",
          film_type: "35mm",
          iso: "400",
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(mockUpdatedRoll);
    });

    it("should return 404 if the roll is not found during PUT", async () => {
      (query as jest.Mock).mockResolvedValueOnce([]);

      const { req, res } = createMocks({
        method: "PUT",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          name: "Updated Roll",
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({ error: "Roll not found" });
    });

    it("should return 500 if an error occurs during PUT", async () => {
      (query as jest.Mock).mockRejectedValueOnce(new Error("Database error"));

      const { req, res } = createMocks({
        method: "PUT",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          name: "Updated Roll",
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({ error: "Failed to update roll" });
    });
  });

  describe("DELETE method", () => {
    it("should delete a roll and return success for a valid DELETE request", async () => {
      (query as jest.Mock)
        .mockResolvedValueOnce([]) // Mock deleting photos
        .mockResolvedValueOnce([{ id: mockRollId }]); // Mock deleting roll

      const { req, res } = createMocks({
        method: "DELETE",
        query: { user_id: mockUserId, roll_id: mockRollId },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(query).toHaveBeenCalledWith(
        "DELETE FROM photos WHERE roll_id = $1 AND roll_id IN (SELECT id FROM rolls WHERE user_id = $2)",
        [mockRollId, mockUserId]
      );
      expect(query).toHaveBeenCalledWith(
        "DELETE FROM rolls WHERE id = $1 AND user_id = $2 RETURNING id",
        [mockRollId, mockUserId]
      );

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "Roll deleted successfully",
      });
    });

    it("should return 404 if the roll is not found during DELETE", async () => {
      (query as jest.Mock)
        .mockResolvedValueOnce({}) // Mock deleting photos
        .mockResolvedValueOnce([]); // Mock no roll found

      const { req, res } = createMocks({
        method: "DELETE",
        query: { user_id: mockUserId, roll_id: mockRollId },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(query).toHaveBeenCalledWith(
        "DELETE FROM photos WHERE roll_id = $1 AND roll_id IN (SELECT id FROM rolls WHERE user_id = $2)",
        [mockRollId, mockUserId]
      );

      expect(query).toHaveBeenCalledWith(
        "DELETE FROM rolls WHERE id = $1 AND user_id = $2 RETURNING id",
        [mockRollId, mockUserId]
      );
      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({ error: "Roll not found" });
    });

    it("should return 500 if an error occurs during DELETE", async () => {
      (query as jest.Mock).mockRejectedValueOnce(new Error("Database error"));

      const { req, res } = createMocks({
        method: "DELETE",
        query: { user_id: mockUserId, roll_id: mockRollId },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({ error: "Failed to delete roll" });
    });
  });
});
