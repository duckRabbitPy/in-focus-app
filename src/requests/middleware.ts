import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "your-secret-key";

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string;
    username: string;
  };
}

// protects API routes by requiring a valid JWT token
export function WithApiAuthMiddleware(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({ error: "Missing authentication token" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Invalid authentication format" });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          userId: string;
          username: string;
        };

        // Add the user info to the request object
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
        };
      } catch (error) {
        console.log("!!!");
        console.error("Token verification failed:", error);
        return res.status(401).json({ error: "Invalid authentication token" });
      }

      return handler(req, res);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
