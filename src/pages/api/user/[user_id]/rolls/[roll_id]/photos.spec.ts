import { createMocks } from "node-mocks-http";
import { handler } from "./photos";
import { query, queryOne } from "@/utils/db";
import {
  getTagsForPhotos,
  updatePhotoTags,
  updatePhotoLens,
} from "@/utils/updateTags";

jest.mock("@/utils/db", () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
}));

jest.mock("@/utils/updateTags", () => ({
  getTagsForPhotos: jest.fn(),
  updatePhotoTags: jest.fn(),
  updatePhotoLens: jest.fn(),
}));

describe("Photos API Handler", () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
  const mockRollId = "456";

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
    it("should return all photos with tags for a valid GET request", async () => {
      // Mock roll info
      const mockRollInfo = {
        id: parseInt(mockRollId),
        name: "Test Roll",
        film_type: "Kodak",
        iso: 400,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock photos
      const mockPhotos = [
        { id: 1, roll_id: parseInt(mockRollId), subject: "Photo 1" },
        { id: 2, roll_id: parseInt(mockRollId), subject: "Photo 2" },
      ];

      // Mock tags
      const mockTagsByPhotoId = {
        1: ["tag1", "tag2"],
        2: ["tag3"],
      };

      // Set up mocks with correct implementation
      (queryOne as jest.Mock).mockResolvedValueOnce(mockRollInfo); // Roll info
      (query as jest.Mock).mockResolvedValueOnce(mockPhotos); // Photos query
      (getTagsForPhotos as jest.Mock).mockResolvedValueOnce(mockTagsByPhotoId);

      const { req, res } = createMocks({
        method: "GET",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        roll: mockRollInfo,
        photos: [
          { ...mockPhotos[0], tags: ["tag1", "tag2"] },
          { ...mockPhotos[1], tags: ["tag3"] },
        ],
      });
    });

    it("should return 400 if user_id is invalid", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {
          user_id: "invalid-uuid",
          roll_id: mockRollId,
        },
      });

      req.user = { userId: "invalid-uuid" };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("should return 400 if roll_id is invalid", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {
          user_id: mockUserId,
          roll_id: "invalid-roll",
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("should return 404 if roll is not found", async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce(null); // Roll not found

      const { req, res } = createMocks({
        method: "GET",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });

    it("should return 500 if there's an error fetching photos", async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({
        id: parseInt(mockRollId),
      }); // Roll exists
      (query as jest.Mock).mockRejectedValueOnce(new Error("Database error")); // Query fails

      const { req, res } = createMocks({
        method: "GET",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });

  describe("POST method", () => {
    it("should create a new photo and return it with tags and lens", async () => {
      const mockRollInfo = { id: parseInt(mockRollId) };
      const mockNextSequence = { next_sequence: 1 };
      const mockNewPhoto = {
        id: 123,
        roll_id: parseInt(mockRollId),
        subject: "New Photo",
      };

      const mockTags = ["landscape", "sunset"];
      const mockLens = "35mm";

      // Mock transaction and queries in order
      (queryOne as jest.Mock)
        .mockResolvedValueOnce(mockRollInfo) // Roll check
        .mockResolvedValueOnce(mockNextSequence) // Next sequence
        .mockResolvedValueOnce(mockNewPhoto); // Insert photo

      (query as jest.Mock).mockImplementation((sql) => {
        if (sql === "BEGIN") return Promise.resolve({});
        if (sql === "COMMIT") return Promise.resolve({});
        return Promise.resolve([]);
      });

      // Mock tag and lens updates
      (updatePhotoTags as jest.Mock).mockResolvedValueOnce(mockTags);
      (updatePhotoLens as jest.Mock).mockResolvedValueOnce(mockLens);

      const { req, res } = createMocks({
        method: "POST",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
        },
        body: {
          id: 123,
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
          tags: mockTags,
          lens: mockLens,
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(query).toHaveBeenCalledWith("BEGIN");
      expect(query).toHaveBeenCalledWith("COMMIT");

      expect(updatePhotoTags).toHaveBeenCalledWith(
        mockNewPhoto.id,
        expect.arrayContaining(mockTags),
        mockUserId
      );
      expect(updatePhotoLens).toHaveBeenCalledWith(
        mockNewPhoto.id,
        mockLens,
        mockUserId
      );

      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toEqual({
        ...mockNewPhoto,
        tags: mockTags,
        lens: mockLens,
      });
    });

    it("should return 500 and rollback if creating photo fails", async () => {
      (queryOne as jest.Mock)
        .mockResolvedValueOnce({ id: parseInt(mockRollId) }) // Roll check
        .mockResolvedValueOnce({ next_sequence: 1 }) // Next sequence
        .mockResolvedValueOnce(null); // Failed insert

      const { req, res } = createMocks({
        method: "POST",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
        },
        body: {
          subject: "Failed Photo",
          photo_url: "http://example.com/photo.jpg",
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(query).toHaveBeenCalledWith("BEGIN");
      expect(query).toHaveBeenCalledWith("ROLLBACK");
      expect(res._getStatusCode()).toBe(500);
    });

    it("should handle and rollback on general errors", async () => {
      (queryOne as jest.Mock)
        .mockResolvedValueOnce({ id: parseInt(mockRollId) }) // Roll check
        .mockRejectedValueOnce(new Error("Database error")); // Error during query

      const { req, res } = createMocks({
        method: "POST",
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
        },
        body: {
          subject: "Error Photo",
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(query).toHaveBeenCalledWith("BEGIN");
      expect(query).toHaveBeenCalledWith("ROLLBACK");
      expect(res._getStatusCode()).toBe(500);
    });
  });

  describe("Unsupported method", () => {
    it("should return 405 for unsupported methods", async () => {
      (queryOne as jest.Mock).mockResolvedValueOnce({
        id: parseInt(mockRollId),
      }); // Roll check

      const { req, res } = createMocks({
        method: "PUT", // Method not supported by this endpoint
        query: {
          user_id: mockUserId,
          roll_id: mockRollId,
        },
      });

      req.user = { userId: mockUserId };

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });
});
