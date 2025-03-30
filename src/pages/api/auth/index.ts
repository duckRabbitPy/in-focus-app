import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { queryOne } from "@/utils/db";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    return res.status(500).json({ error: "Internal server error" });
  }

  try {
    const { username, password } = req.body;
    console.log("Auth attempt for username:", username);

    if (!username || !password) {
      console.log("Missing username or password");
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Look up user by username
    console.log("Looking up user in database...");
    const user = await queryOne<{
      id: string;
      username: string;
      password_hash: string;
    }>("SELECT id, username, password_hash FROM users WHERE username = $1", [
      username,
    ]);

    if (!user) {
      console.log("User not found:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("User found, verifying password...");
    // Compare password hash
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      console.log("Invalid password for user:", username);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("Password verified, generating token...");
    // Generate JWT token with user info and 24h expiration
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Login successful for user:", username);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Auth error:", error);
    // Log database connection details (but not sensitive info)
    console.log("Database config:", {
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
    });
    res.status(500).json({ error: "Internal server error" });
  }
}
