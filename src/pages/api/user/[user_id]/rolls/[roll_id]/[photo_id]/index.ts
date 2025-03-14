import { NextApiRequest, NextApiResponse } from "next";
import { queryOne, query } from "@/utils/db";
import { DBPhoto } from "@/utils/db";
import { withAuth, AuthenticatedRequest } from '@/utils/middleware';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { user_id, roll_id, photo_id } = req.query;

  // Verify that the requested user_id matches the authenticated user's ID
  if (user_id !== req.user?.userId) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

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
          'SELECT * FROM photos WHERE id = $1 AND roll_id = $2 AND roll_id IN (SELECT id FROM rolls WHERE user_id = $3)',
          [parseInt(photo_id), parseInt(roll_id), user_id]
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
        const result = await queryOne<DBPhoto>(
          'UPDATE photos SET subject = $1, photo_url = $2, f_stop = $3, focal_distance = $4, shutter_speed = $5, exposure_value = $6, phone_light_meter = $7, stabilisation = $8, timer = $9, flash = $10, exposure_memory = $11, notes = $12 WHERE id = $13 AND roll_id = $14 AND roll_id IN (SELECT id FROM rolls WHERE user_id = $15) RETURNING *',
          [
            req.body.subject,
            req.body.photo_url,
            req.body.f_stop,
            req.body.focal_distance,
            req.body.shutter_speed,
            req.body.exposure_value,
            req.body.phone_light_meter,
            req.body.stabilisation,
            req.body.timer,
            req.body.flash,
            req.body.exposure_memory,
            req.body.notes,
            parseInt(photo_id),
            parseInt(roll_id),
            user_id
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

    case "DELETE":
      try {
        const result = await query(
          'DELETE FROM photos WHERE id = $1 AND roll_id = $2 AND roll_id IN (SELECT id FROM rolls WHERE user_id = $3) RETURNING id',
          [parseInt(photo_id), parseInt(roll_id), user_id]
        );

        if (result.length === 0) {
          return res.status(404).json({ error: "Photo not found" });
        }

        return res.status(200).json({ message: "Photo deleted successfully" });
      } catch (error) {
        console.error('Error deleting photo:', error);
        return res.status(500).json({ error: "Failed to delete photo" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

export default withAuth(handler);
