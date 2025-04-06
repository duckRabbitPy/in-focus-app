import { createMocks } from "node-mocks-http";
import { handler } from "./lookup";
import { queryOne } from "@/utils/db";

jest.mock("@/utils/db", () => ({
  queryOne: jest.fn(),
}));

describe("User Lookup API Handler", () => {
  const mockUsername = "testuser";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 405 for unsupported HTTP methods", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({ error: "Method not allowed" });
  });

  it("should return 400 if username is missing", async () => {
    const { req, res } = createMocks({
      method: "POST",
    });

    req.user = {};

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ error: "Username is required" });
  });

  it("should return 404 if the user is not found", async () => {
    (queryOne as jest.Mock).mockResolvedValueOnce(null);

    const { req, res } = createMocks({
      method: "POST",
    });

    req.user = { username: mockUsername };

    await handler(req, res);

    expect(queryOne).toHaveBeenCalledWith(
      "SELECT id, username, password_hash FROM users WHERE username = $1",
      [mockUsername]
    );
    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({ error: "User not found" });
  });

  it("should return the user without the password hash if found", async () => {
    const mockUser = {
      id: "123",
      username: mockUsername,
      password_hash: "hashedpassword",
    };

    (queryOne as jest.Mock).mockResolvedValueOnce(mockUser);

    const { req, res } = createMocks({
      method: "POST",
    });

    req.user = { username: mockUsername };

    await handler(req, res);

    expect(queryOne).toHaveBeenCalledWith(
      "SELECT id, username, password_hash FROM users WHERE username = $1",
      [mockUsername]
    );
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      id: "123",
      username: mockUsername,
    });
  });

  it("should return 500 if an internal error occurs", async () => {
    (queryOne as jest.Mock).mockRejectedValueOnce(new Error("Database error"));

    const { req, res } = createMocks({
      method: "POST",
    });

    req.user = { username: mockUsername };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: "Internal server error" });
  });
});
