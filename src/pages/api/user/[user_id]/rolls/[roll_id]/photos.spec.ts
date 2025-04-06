import { createMocks } from "node-mocks-http";
import { handler } from "./photos";
import { queryOne } from "@/utils/db";

jest.mock("@/utils/db", () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
}));

jest.mock("@/utils/updateTags", () => ({
  updatePhotoTags: jest.fn(),
  updatePhotoLens: jest.fn(),
}));

describe("Photos API Handler", () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
  const mockRollId = "456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if user_id is invalid", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: "invalid-uuid", roll_id: mockRollId },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: "Invalid user_id format. Must be a UUID-like string.",
    });
  });

  it("should return 400 if roll_id is invalid", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: mockUserId, roll_id: "invalid-roll-id" },
    });

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
      query: { user_id: mockUserId, roll_id: mockRollId },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({ error: "Roll not found" });
  });
});

// TODO: Other methods
