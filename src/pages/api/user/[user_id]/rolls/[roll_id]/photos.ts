import { NextApiRequest, NextApiResponse } from "next";
import { query, queryOne } from "@/utils/db";
import { DBPhoto } from "@/utils/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { roll_id, user_id } = req.query;

  // Validate basic UUID format (5 groups of hex chars separated by hyphens)
  const uuidRegex = /^[0-9a-f-]{36}$/i;
  if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
    return res
      .status(400)
      .json({ error: "Invalid user_id format. Must be a UUID-like string." });
  }

  // Validate roll_id is a number
  if (typeof roll_id !== "string" || !/^\d+$/.test(roll_id)) {
    return res
      .status(400)
      .json({ error: "Invalid roll_id format. Must be a number." });
  }

  // Verify that the roll belongs to the user
  const rollCheck = await queryOne<{ id: number }>(
    "SELECT r.id FROM rolls r WHERE r.id = $1 AND r.user_id = $2",
    [parseInt(roll_id), user_id]
  );

  if (!rollCheck) {
    return res.status(404).json({ error: "Roll not found or unauthorized" });
  }

  switch (req.method) {
    case "GET":
      try {
        const photos = await query<DBPhoto>(
          `SELECT * FROM photos 
           WHERE roll_id = $1 
           ORDER BY sequence_number`,
          [parseInt(roll_id)]
        );

        return res.status(200).json(photos);
      } catch (error) {
        console.error("Error fetching photos:", error);
        return res.status(500).json({ error: "Error fetching photos" });
      }

    case "POST":
      try {
        // Get the next sequence number for this roll
        const nextSequence = await queryOne<{ next_sequence: number }>(
          `SELECT COALESCE(MAX(sequence_number), 0) + 1 as next_sequence 
           FROM photos 
           WHERE roll_id = $1`,
          [parseInt(roll_id)]
        );

        const {
          subject,
          photo_url,
          f_stop,
          focal_distance,
          shutter_speed,
          exposure_value,
          phone_light_meter,
          stabilisation,
          timer,
          flash,
          exposure_memory,
        } = req.body;

        const newPhoto = await queryOne<DBPhoto>(
          `INSERT INTO photos (
             roll_id,
             subject,
             photo_url,
             f_stop,
             focal_distance,
             shutter_speed,
             exposure_value,
             phone_light_meter,
             stabilisation,
             timer,
             flash,
             exposure_memory,
             sequence_number
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *`,
          [
            parseInt(roll_id),
            subject,
            photo_url,
            f_stop,
            focal_distance,
            shutter_speed,
            exposure_value,
            phone_light_meter,
            stabilisation,
            timer,
            flash,
            exposure_memory,
            nextSequence?.next_sequence || 1,
          ]
        );

        return res.status(201).json(newPhoto);
      } catch (error) {
        console.error("Error creating photo:", error);
        return res.status(500).json({ error: "Error creating photo" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
