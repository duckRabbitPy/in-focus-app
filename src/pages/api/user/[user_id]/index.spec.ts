import { createMocks } from "node-mocks-http";
import { handler } from "./index";
import { query } from "@/utils/db";
jest.mock("@/utils/db", () => ({
  query: jest.fn(),
}));

describe("GET /api/user/[user_id]", () => {
  it("returns 405 if method is not GET", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: { user_id: "1" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    expect(res._getData()).toEqual(
      JSON.stringify({ error: "Method not allowed" })
    );
  });

  it("returns 404 if user is not found", async () => {
    (query as jest.Mock).mockResolvedValue([]);
    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: "1" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(404);
    expect(res._getData()).toEqual(JSON.stringify({ error: "User not found" }));
  });

  it("returns 200 and user data if user is found", async () => {
    (query as jest.Mock).mockResolvedValue([{ id: "1", username: "testuser" }]);
    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: "1" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toEqual(
      JSON.stringify({ id: "1", username: "testuser" })
    );
  });

  it("returns 500 on unexpected error", async () => {
    (query as jest.Mock).mockImplementation(() => {
      throw new Error("DB error");
    });
    const { req, res } = createMocks({
      method: "GET",
      query: { user_id: "1" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toEqual(
      JSON.stringify({ error: "Internal server error" })
    );
  });
});
