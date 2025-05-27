import { NextApiResponse } from "next";
import { queryOne, query } from "@/utils/db";
import {
  WithApiAuthMiddleware,
  AuthenticatedRequest,
} from "../../../../../../../requests/middleware";
import {
  FullPhotoSettingsData,
  PhotoSettingsInputSchema,
} from "@/types/photos";
import {
  getPhotoTags,
  updatePhotoLens,
  updatePhotoTags,
} from "@/utils/updateTags";
import { transformIfDropboxUrl } from "@/utils/server";

export async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { user_id, roll_id, photo_id } = req.query;

  // Verify that the requested user_id matches the authenticated user's ID
  if (user_id !== req.user?.userId) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  // Validate basic UUID format (5 groups of hex chars separated by hyphens)
  const uuidRegex = /^[0-9a-f-]{36}$/i;
  if (typeof user_id !== "string" || !uuidRegex.test(user_id)) {
    return res
      .status(400)
      .json({ error: "Invalid user_id format. Must be a UUID-like string." });
  }

  // Validate roll_id and photo_id are numbers
  if (typeof roll_id !== "string" || !/^\d+$/.test(roll_id)) {
    return res
      .status(400)
      .json({ error: "Invalid roll_id format. Must be a number." });
  }
  if (typeof photo_id !== "string" || !/^\d+$/.test(photo_id)) {
    return res
      .status(400)
      .json({ error: "Invalid photo_id format. Must be a number." });
  }

  // Verify that the roll belongs to the user
  const rollCheck = await queryOne<{ id: number }>(
    "SELECT r.id FROM rolls r WHERE r.id = $1 AND r.user_id = $2",
    [parseInt(roll_id), user_id]
  );

  if (!rollCheck) {
    return res.status(404).json({ error: "Roll not found or unauthorized" });
  }

  const photoIdNum = parseInt(photo_id);

  switch (req.method) {
    case "GET":
      try {
        // Base query to get photo with lens information
        const photoQuery = `
          SELECT 
            p.*,
            l.name AS lens
          FROM photos p
          LEFT JOIN photo_lenses pl ON p.id = pl.photo_id
          LEFT JOIN lenses l ON pl.lens_id = l.id
          WHERE p.id = $1 AND p.roll_id = $2 AND p.roll_id IN (
            SELECT id FROM rolls WHERE user_id = $3
          )
        `;

        const photo = await queryOne(photoQuery, [
          photoIdNum,
          parseInt(roll_id),
          user_id,
        ]);

        if (!photo) {
          return res.status(404).json({ error: "Photo not found" });
        }

        // Get tags for the photo using utility function
        const tags = await getPhotoTags(photoIdNum);

        // Add tags array to photo object
        const photoWithTags = {
          ...photo,
          tags,
        };
        return res.status(200).json(photoWithTags);
      } catch (error) {
        console.error("Error fetching photo:", error);
        return res.status(500).json({ error: "Error fetching photo" });
      }

    case "PUT":
      try {
        // Start a transaction
        await query("BEGIN");

        const validatedInput = PhotoSettingsInputSchema.parse({
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

        // Update the photo
        const updatedPhoto = await queryOne<FullPhotoSettingsData>(
          "UPDATE photos SET subject = $1, photo_url = $2, f_stop = $3, focal_distance = $4, shutter_speed = $5, exposure_value = $6, phone_light_meter = $7, stabilisation = $8, timer = $9, flash = $10, exposure_memory = $11, notes = $12 WHERE id = $13 AND roll_id = $14 AND roll_id IN (SELECT id FROM rolls WHERE user_id = $15) RETURNING *",
          [
            validatedInput.subject, // 1
            transformIfDropboxUrl(validatedInput.photo_url), // 2
            validatedInput.f_stop, // 3
            validatedInput.focal_distance, // 4
            validatedInput.shutter_speed, // 5
            validatedInput.exposure_value, // 6
            validatedInput.phone_light_meter, // 7
            validatedInput.stabilisation, // 8
            validatedInput.timer, // 9
            validatedInput.flash, // 10
            validatedInput.exposure_memory, // 11
            validatedInput.notes, // 12
            photoIdNum, // 13
            parseInt(roll_id), // 14
            user_id, // 15
          ]
        );

        if (!updatedPhoto) {
          await query("ROLLBACK");
          return res.status(404).json({ error: "Photo not found" });
        }

        // Use the utility functions to update tags and lens
        const updatedTags = await updatePhotoTags(
          photoIdNum,
          validatedInput.tags,
          user_id
        );
        const updatedLens = await updatePhotoLens(
          photoIdNum,
          validatedInput.lens,
          user_id
        );

        // Commit the transaction
        await query("COMMIT");

        return res.status(200).json({
          ...updatedPhoto,
          tags: updatedTags,
          lens: updatedLens,
        });
      } catch (error) {
        // Rollback in case of error
        await query("ROLLBACK");
        console.error("Error updating photo:", error);
        return res.status(500).json({ error: "Error updating photo" });
      }

    case "PATCH":
      try {
        const { photo_url } = req.body;
        if (!photo_url) {
          return res.status(400).json({ error: "URL is required" });
        }
        const updatedPhoto = await queryOne<FullPhotoSettingsData>(
          "UPDATE photos SET photo_url = $1 WHERE id = $2 AND roll_id = $3 AND roll_id IN (SELECT id FROM rolls WHERE user_id = $4) RETURNING *",
          [
            transformIfDropboxUrl(photo_url),
            photoIdNum,
            parseInt(roll_id),
            user_id,
          ]
        );
        if (!updatedPhoto) {
          return res.status(404).json({ error: "Photo not found" });
        }

        const tags = await getPhotoTags(photoIdNum);

        // Add tags array to photo object
        const photoWithTags = {
          ...updatedPhoto,
          tags,
        };
        return res.status(200).json(photoWithTags);
      } catch (error) {
        console.error("Error updating photo URL:", error);
        return res.status(500).json({ error: "Failed to update photo URL" });
      }

    case "DELETE":
      try {
        const result = await query(
          "DELETE FROM photos WHERE id = $1 AND roll_id = $2 AND roll_id IN (SELECT id FROM rolls WHERE user_id = $3) RETURNING id",
          [photoIdNum, parseInt(roll_id), user_id]
        );

        if (result.length === 0) {
          return res.status(404).json({ error: "Photo not found" });
        }

        return res.status(200).json({ message: "Photo deleted successfully" });
      } catch (error) {
        console.error("Error deleting photo:", error);
        return res.status(500).json({ error: "Failed to delete photo" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

export default WithApiAuthMiddleware(handler);
