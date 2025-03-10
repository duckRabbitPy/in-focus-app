import { userRollsMockDB } from "@/mocks/userRollsMock";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;

  if (typeof user_id !== "string") {
    return res.status(400).json({ error: "Invalid user_id" });
  }

  switch (req.method) {
    case "GET":
      console.log(`Getting all roll ids for user ${user_id}`);
      // Get all roll ids for a user
      return res.status(200).json(Object.keys(userRollsMockDB[user_id] || []));

    case "POST":
      // Create a new roll
      const newRoll = { roll_id: Date.now().toString(), user_id, ...req.body };
      userRollsMockDB[user_id] = [...(userRollsMockDB[user_id] || []), newRoll];
      return res.status(201).json(newRoll);

    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}
