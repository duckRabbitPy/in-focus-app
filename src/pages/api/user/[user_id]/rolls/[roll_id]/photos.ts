import { NextApiRequest, NextApiResponse } from "next";
import { query, queryOne } from "@/utils/db";
import {
  FullPhotoSettingsData,
  NewPhotoSettingsSchema,
} from "@/types/photoSettings";

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
  const rollInfo = await queryOne<{
    id: number;
    name: string;
    film_type: string;
    iso: number;
    created_at: Date;
    updated_at: Date;
  }>(
    "SELECT r.id, r.name, r.film_type, r.iso, r.created_at, r.updated_at FROM rolls r WHERE r.id = $1 AND r.user_id = $2",
    [parseInt(roll_id), user_id]
  );

  if (!rollInfo) {
    return res.status(404).json({ error: "Roll not found" });
  }

  switch (req.method) {
    case "GET":
      try {
        const photos = await query<FullPhotoSettingsData>(
          `SELECT * FROM photos 
           WHERE roll_id = $1 
           ORDER BY sequence_number`,
          [parseInt(roll_id)]
        );

        return res.status(200).json({
          roll: rollInfo,
          photos,
        });
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

        const validatedData = NewPhotoSettingsSchema.parse({
          subject: req.body.subject,
          photo_url: req.body.photo_url,
          f_stop: req.body.f_stop,
          focal_distance: req.body.focal_distance,
          shutter_speed: req.body.shutter_speed,
          exposure_value: req.body.exposure_value,
          phone_light_meter: req.body.phone_light_meter,
          stabilisation: req.body.stabilisation,
          timer: req.body.timer,
          flash: req.body.flash,
          exposure_memory: req.body.exposure_memory,
          lens: req.body.lens,
          tags: req.body.tags,
          notes: req.body.notes,
        });

        const newPhoto = await queryOne<FullPhotoSettingsData>(
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
            parseInt(roll_id), // 1
            validatedData.subject, // 2
            validatedData.photo_url, // 3
            validatedData.f_stop, // 4
            validatedData.focal_distance, // 5
            validatedData.shutter_speed, // 6
            validatedData.exposure_value, // 7
            validatedData.phone_light_meter, // 8
            validatedData.stabilisation, // 9
            validatedData.timer, // 10
            validatedData.flash, // 11
            validatedData.exposure_memory, // 12
            nextSequence?.next_sequence || 1, // 13
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
