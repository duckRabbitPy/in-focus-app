import { createMocks } from "node-mocks-http";
import { handler } from "./index";
import { query, queryOne } from "@/utils/db";
import {
  updatePhotoTags,
  getPhotoTags,
  updatePhotoLens,
} from "@/utils/updateTags";

jest.mock("@/utils/db", () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
}));

jest.mock("@/utils/updateTags", () => ({
  updatePhotoTags: jest.fn(),
  updatePhotoLens: jest.fn(),
  getPhotoTags: jest.fn(),
}));

describe("Photo API Handler", () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
  const mockRollId = "456";
  const mockPhotoId = "789";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    (query as jest.Mock).mockImplementation((sql) => {
      if (sql === "BEGIN") return Promise.resolve({});
      if (sql === "COMMIT") return Promise.resolve({});
      if (sql === "ROLLBACK") return Promise.resolve({});
      return Promise.resolve([]);
    });
  });

  describe("GET method", () => {
    it("should return 403 if user_id does not match authenticated user", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {
          user_id: "wrong_id",
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(res._getJSONData()).toEqual({ error: "Unauthorized access" });
    });

    it("should return 400 if user_id is invalid", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {
          user_id: "invalid-uuid",
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
      });

      req.user = { userId: "invalid-uuid" };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "Invalid user_id format. Must be a UUID-like string.",
      });
    });

    it("should return 400 if roll_id or photo_id is invalid", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {
          user_id: mockUserId,
          roll_id: "invalid-roll-id",
          photo_id: mockPhotoId,
        },
      });
      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: "Invalid roll_id format. Must be a number.",
      });
    });

    it("should return 404 if the roll is not found", async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce(null);

      const { req, res } = createMocks({
        method: "GET",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(queryOne).toHaveBeenCalledWith(
        "SELECT r.id FROM rolls r WHERE r.id = $1 AND r.user_id = $2",
        [parseInt(mockRollId), mockUserId]
      );
      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        error: "Roll not found or unauthorized",
      });
    });
  });

  describe("PUT method", () => {
    it("should update a photo and return the updated photo with tags and lens", async () => {
      const mockUpdatedPhoto = {
        id: parseInt(mockPhotoId),
        roll_id: parseInt(mockRollId),
        subject: "Updated Photo",
        photo_url: "http://example.com/photo.jpg",
        f_stop: "2.8",
        focal_distance: "5",
        shutter_speed: "1/125",
        exposure_value: 0,
        phone_light_meter: "1/60",
        stabilisation: "tripod",
        timer: false,
        flash: false,
        exposure_memory: false,
        notes: "Updated notes",
      };

      const mockTags = ["tag1", "tag2"];
      const mockLens = "50mm";

      // Roll check
      (queryOne as jest.Mock).mockResolvedValueOnce({
        id: parseInt(mockRollId),
      });
      (query as jest.Mock).mockResolvedValueOnce({}); // Mock BEGIN
      (queryOne as jest.Mock).mockResolvedValueOnce(mockUpdatedPhoto); // Mock photo update
      (updatePhotoTags as jest.Mock).mockResolvedValueOnce(mockTags);
      (updatePhotoLens as jest.Mock).mockResolvedValueOnce(mockLens);
      (query as jest.Mock).mockResolvedValueOnce({}); // Mock COMMIT

      const { req, res } = createMocks({
        method: "PUT",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
        body: {
          subject: "Updated Photo",
          photo_url: "http://example.com/photo.jpg",
          f_stop: "2.8",
          focal_distance: "5",
          shutter_speed: "1/125",
          exposure_value: 0,
          phone_light_meter: "1/60",
          stabilisation: "tripod",
          timer: false,
          flash: false,
          exposure_memory: false,
          notes: "Updated notes",
          tags: ["tag1", "tag2"],
          lens: "50mm",
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(query).toHaveBeenCalledWith("BEGIN");

      expect(updatePhotoTags).toHaveBeenCalledWith(
        parseInt(mockPhotoId),
        ["tag1", "tag2"],
        mockUserId
      );
      expect(updatePhotoLens).toHaveBeenCalledWith(
        parseInt(mockPhotoId),
        "50mm",
        mockUserId
      );
      expect(query).toHaveBeenCalledWith("COMMIT");
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        ...mockUpdatedPhoto,
        tags: mockTags,
        lens: mockLens,
      });
    });

    it("should return 404 if the photo is not found during PUT", async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({
        id: parseInt(mockRollId),
      }); // Roll check
      (query as jest.Mock).mockResolvedValueOnce({}); // Mock BEGIN
      (queryOne as jest.Mock).mockResolvedValueOnce(null); // Mock photo not found
      (query as jest.Mock).mockResolvedValueOnce({}); // Mock ROLLBACK

      const { req, res } = createMocks({
        method: "PUT",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
        body: {
          subject: "Updated Photo",
          photo_url: "http://example.com/photo.jpg",
          f_stop: "2.8",
          focal_distance: "5",
          shutter_speed: "1/125",
          exposure_value: 0,
          phone_light_meter: "1/60",
          stabilisation: "tripod",
          timer: false,
          flash: false,
          exposure_memory: false,
          notes: "Updated notes",
          tags: ["tag1", "tag2"],
          lens: "50mm",
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(query).toHaveBeenCalledWith("ROLLBACK");
      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({ error: "Photo not found" });
    });

    it("should return 500 if an error occurs during PUT", async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({
        id: parseInt(mockRollId),
      }); // Roll check
      (query as jest.Mock).mockResolvedValueOnce({}); // Mock BEGIN
      (queryOne as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );
      (query as jest.Mock).mockResolvedValueOnce({}); // Mock ROLLBACK

      const { req, res } = createMocks({
        method: "PUT",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
        body: {
          subject: "Updated Photo",
          photo_url: "http://example.com/photo.jpg",
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(query).toHaveBeenCalledWith("ROLLBACK");
      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({ error: "Error updating photo" });
    });
  });

  describe("PATCH method", () => {
    it("should update the photo URL and return the updated photo with tags", async () => {
      const mockUpdatedPhoto = {
        id: parseInt(mockPhotoId),
        roll_id: parseInt(mockRollId),
        subject: "Test Photo",
        photo_url: "http://example.com/new-photo.jpg",
      };

      const mockTags = ["tag1", "tag2"];

      // Roll check
      (queryOne as jest.Mock).mockResolvedValueOnce({
        id: parseInt(mockRollId),
      });
      (queryOne as jest.Mock).mockResolvedValueOnce(mockUpdatedPhoto); // Mock photo update
      (getPhotoTags as jest.Mock).mockResolvedValueOnce(mockTags);

      const { req, res } = createMocks({
        method: "PATCH",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
        body: { photo_url: "http://example.com/new-photo.jpg" },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(queryOne).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE photos SET photo_url ="),
        expect.any(Array)
      );
      expect(getPhotoTags).toHaveBeenCalledWith(parseInt(mockPhotoId));
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        ...mockUpdatedPhoto,
        tags: mockTags,
      });
    });

    it("should return 400 if photo_url is missing in PATCH", async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({
        id: parseInt(mockRollId),
      }); // Roll check
      const { req, res } = createMocks({
        method: "PATCH",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
        body: {},
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      // Roll check
      expect(queryOne).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toEqual({ error: "URL is required" });
    });

    it("should return 404 if the photo is not found during PATCH", async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({
        id: parseInt(mockRollId),
      }); // Roll check
      (queryOne as jest.Mock).mockResolvedValueOnce(null); // Mock photo not found

      const { req, res } = createMocks({
        method: "PATCH",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
        body: { photo_url: "http://example.com/new-photo.jpg" },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({ error: "Photo not found" });
    });

    it("should return 500 if an error occurs during PATCH", async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({
        id: parseInt(mockRollId),
      }); // Roll check
      (queryOne as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );

      const { req, res } = createMocks({
        method: "PATCH",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
        body: { photo_url: "http://example.com/new-photo.jpg" },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        error: "Failed to update photo URL",
      });
    });
  });

  describe("DELETE method", () => {
    it("should delete a photo and return success", async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({
        id: parseInt(mockRollId),
      }); // Roll check
      (query as jest.Mock).mockResolvedValueOnce([
        { id: parseInt(mockPhotoId) },
      ]); // Delete query

      const { req, res } = createMocks({
        method: "DELETE",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(query).toHaveBeenCalledWith(
        "DELETE FROM photos WHERE id = $1 AND roll_id = $2 AND roll_id IN (SELECT id FROM rolls WHERE user_id = $3) RETURNING id",
        [parseInt(mockPhotoId), parseInt(mockRollId), mockUserId]
      );
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "Photo deleted successfully",
      });
    });

    it("should return 404 if the photo is not found during DELETE", async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({
        id: parseInt(mockRollId),
      }); // Roll check
      (query as jest.Mock).mockResolvedValueOnce([]); // Delete query

      const { req, res } = createMocks({
        method: "DELETE",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({ error: "Photo not found" });
    });
  });

  describe("Unsupported HTTP methods", () => {
    it("should return 405 for unsupported HTTP methods", async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({
        id: parseInt(mockRollId),
      }); // Roll check

      const { req, res } = createMocks({
        method: "CONNECT",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
          photo_id: mockPhotoId,
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getJSONData()).toEqual({ error: "Method not allowed" });
    });
  });
});
