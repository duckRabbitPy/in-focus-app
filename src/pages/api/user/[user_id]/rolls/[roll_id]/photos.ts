import { userRollsMockDB } from "@/mocks/userRollsMock";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roll_id } = req.query;
  if (typeof roll_id !== "string") {
    return res.status(400).json({ error: "Invalid roll_id" });
  }

  switch (req.method) {
    case "GET":
      // Get all photos for a roll
      console.log(`Getting all photos for roll ${roll_id}`);
      return res.status(200).json(userRollsMockDB[roll_id] || []);

    case "POST":
      // Add a new photo to a roll
      const newPhoto = {
        photo_id: Date.now().toString(),
        roll_id,
        ...req.body,
      };
      userRollsMockDB[roll_id] = [
        ...(userRollsMockDB[roll_id] || []),
        newPhoto,
      ];
      return res.status(201).json(newPhoto);

    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}
