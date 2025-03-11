import { NextApiRequest, NextApiResponse } from "next";
import { query, queryOne } from "@/utils/db";
import { DBPhoto } from "@/utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roll_id, photo_id, user_id } = req.query;

  // Validate basic UUID format (5 groups of hex chars separated by hyphens)
  const uuidRegex = /^[0-9a-f-]{36}$/i;
  if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
    return res.status(400).json({ error: "Invalid user_id format. Must be a UUID-like string." });
  }

  // Validate roll_id and photo_id are numbers
  if (typeof roll_id !== "string" || !/^\d+$/.test(roll_id)) {
    return res.status(400).json({ error: "Invalid roll_id format. Must be a number." });
  }
  if (typeof photo_id !== "string" || !/^\d+$/.test(photo_id)) {
    return res.status(400).json({ error: "Invalid photo_id format. Must be a number." });
  }

  // Verify that the roll belongs to the user
  const rollCheck = await queryOne<{ id: number }>(
    'SELECT r.id FROM rolls r WHERE r.id = $1 AND r.user_id = $2',
    [parseInt(roll_id), user_id]
  );

  if (!rollCheck) {
    return res.status(404).json({ error: "Roll not found or unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const photo = await queryOne<DBPhoto>(
          `SELECT * FROM photos WHERE id = $1 AND roll_id = $2`,
          [parseInt(photo_id), parseInt(roll_id)]
        );

        if (!photo) {
          return res.status(404).json({ error: "Photo not found" });
        }

        return res.status(200).json(photo);
      } catch (error) {
        console.error('Error fetching photo:', error);
        return res.status(500).json({ error: "Error fetching photo" });
      }

    case "PUT":
      try {
        const updatedData = req.body;
        const result = await queryOne<DBPhoto>(
          `UPDATE photos 
           SET subject = $1,
               photo_url = $2,
               f_stop = $3,
               focal_distance = $4,
               shutter_speed = $5,
               exposure_value = $6,
               phone_light_meter = $7,
               stabilisation = $8,
               timer = $9,
               flash = $10,
               exposure_memory = $11
           WHERE id = $12 AND roll_id = $13
           RETURNING *`,
          [
            updatedData.subject,
            updatedData.photo_url,
            updatedData.f_stop,
            updatedData.focal_distance,
            updatedData.shutter_speed,
            updatedData.exposure_value,
            updatedData.phone_light_meter,
            updatedData.stabilisation,
            updatedData.timer,
            updatedData.flash,
            updatedData.exposure_memory,
            parseInt(photo_id),
            parseInt(roll_id)
          ]
        );

        if (!result) {
          return res.status(404).json({ error: "Photo not found" });
        }

        return res.status(200).json(result);
      } catch (error) {
        console.error('Error updating photo:', error);
        return res.status(500).json({ error: "Error updating photo" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
