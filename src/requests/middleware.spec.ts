import { NextApiRequest, NextApiResponse } from "next";
import { WithApiAuthMiddleware } from "./middleware";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("WithApiAuthMiddleware", () => {
  const mockHandler = jest.fn();
  const mockResponse = () => {
    const res: Partial<NextApiResponse> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as NextApiResponse;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if no authorization header is provided", async () => {
    const req = { headers: {} } as NextApiRequest;
    const res = mockResponse();

    const middleware = WithApiAuthMiddleware(mockHandler);
    await middleware(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing authentication token",
    });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("should return 401 if the authorization header format is invalid", async () => {
    const req = { headers: { authorization: "Bearer" } } as NextApiRequest;
    const res = mockResponse();

    const middleware = WithApiAuthMiddleware(mockHandler);
    await middleware(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid authentication format",
    });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("should return 401 if the token is invalid", async () => {
    const req = {
      headers: { authorization: "Bearer invalid-token" },
    } as NextApiRequest;
    const res = mockResponse();

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const middleware = WithApiAuthMiddleware(mockHandler);
    await middleware(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid authentication token",
    });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("should call the handler if the token is valid", async () => {
    const req: NextApiRequest & {
      user?: { userId: string; username: string };
    } = {
      headers: { authorization: "Bearer valid-token" },
      // Mock the user object
      body: {
        user: {
          id: "123",
          username: "testuser",
        },
      },
    } as NextApiRequest;
    const res = mockResponse();

    (jwt.verify as jest.Mock).mockReturnValue({
      userId: "123",
      username: "testuser",
    });

    const middleware = WithApiAuthMiddleware(mockHandler);
    await middleware(req, res);

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", expect.any(String));
    expect(req.user).toEqual({ userId: "123", username: "testuser" });
    expect(mockHandler).toHaveBeenCalledWith(req, res);
  });

  it("should return 500 if handler errors", async () => {
    const req = {
      headers: { authorization: "Bearer valid-token" },
    } as NextApiRequest;
    const res = mockResponse();

    (jwt.verify as jest.Mock).mockReturnValue({
      userId: "123",
      username: "testuser",
    });

    mockHandler.mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    const middleware = WithApiAuthMiddleware(mockHandler);
    await middleware(req, res);

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", expect.any(String));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error",
    });
    expect(mockHandler).toHaveBeenCalledWith(req, res);
  });
});
