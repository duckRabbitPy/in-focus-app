import { AuthenticatedRequest } from "@/requests/middleware";
import { NextApiResponse } from "next";
import { query, queryOne } from "@/utils/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { username, password } = req.body;
  console.log("Register attempt for username:", username);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    return res.status(500).json({ error: "Internal server error" });
  }

  if (!username || !password) {
    console.log("Missing username or password");
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  if (
    username.length < 5 ||
    username.length >= 25 ||
    password.length < 5 ||
    password.length >= 25
  ) {
    console.log("Username or password length is invalid");
    return res.status(400).json({
      error: "Username and password must be between 5 and 25 characters",
    });
  }

  // prevent SQL injection
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    console.log("Invalid username format");
    return res.status(400).json({
      error: "Username can only contain letters, numbers, and underscores",
    });
  }
  // prevent SQL injection
  const passwordRegex = /^[a-zA-Z0-9_!@#$%^&*]+$/;
  if (!passwordRegex.test(password)) {
    console.log("Invalid password format");
    return res.status(400).json({
      error:
        "Password can only contain letters, numbers, and special characters",
    });
  }

  try {
    // Check if the user already exists
    const existingUser = await query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.length > 0) {
      console.log("User already exists:", username);
      return res.status(409).json({ error: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the user into the database
    const user = await queryOne<{
      id: string;
      username: string;
    }>(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword]
    );

    if (!user) {
      console.log("User registration failed:", username);
      return res.status(500).json({ error: "User registration failed" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Login successful for user:", username);
    res.status(200).json({ token, user_id: user.id });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
