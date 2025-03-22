import { NextApiResponse } from "next";
import { queryOne } from "@/utils/db";
import {
  WithApiAuthMiddleware,
  AuthenticatedRequest,
} from "../../../requests/middleware";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Use the username from the token instead of the request body
    const username = req.user?.username;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await queryOne<{
      id: string;
      username: string;
      password_hash: string;
    }>("SELECT id, username, password_hash FROM users WHERE username = $1", [
      username,
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Don't send the password hash back to the client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("User lookup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default WithApiAuthMiddleware(handler);
