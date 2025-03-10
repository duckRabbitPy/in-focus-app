import { userRollsMockDB } from "@/mocks/userRollsMock";
import { PhotoSettingsData } from "@/types/photoSettings";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roll_id, photo_id, user_id } = req.query;

  if (typeof roll_id !== "string" || typeof photo_id !== "string") {
    return res.status(400).json({ error: "Invalid roll_id or photo_id" });
  }

  switch (req.method) {
    case "PUT":
      try {
        const updatedData: PhotoSettingsData = req.body;

        // Simulate updating the photo in a database
        console.log(
          `Updating photo ${photo_id} in roll ${roll_id} for user ${user_id}`
        );
        console.log("Updated Data:", updatedData);

        return res
          .status(200)
          .json({ message: "Photo updated successfully", updatedData });
      } catch (error) {
        return res.status(500).json({ message: "Error updating photo", error });
      }
    case "GET":
      // Get photo settings by id
      console.log(
        `Getting photo settings ${photo_id} in roll ${roll_id} for user ${user_id}`
      );
      const photo = (userRollsMockDB[roll_id] || []).find(
        (photo) => photo.photo_id === photo_id
      );
      if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
      }
      return res.status(200).json(photo);

    default:
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}
