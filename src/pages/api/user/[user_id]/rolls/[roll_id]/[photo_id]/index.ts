import { NextApiResponse } from "next";
import { queryOne, query } from "@/utils/db";
import {
  AuthMiddleWare,
  AuthenticatedRequest,
} from "../../../../../../../requests/middleware";
import {
  FullPhotoSettingsData,
  PhotoSettingsInputSchema,
} from "@/types/photos";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
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
          parseInt(photo_id),
          parseInt(roll_id),
          user_id,
        ]);

        if (!photo) {
          return res.status(404).json({ error: "Photo not found" });
        }

        // Get tags for the photo
        const tagsQuery = `
          SELECT t.name
          FROM tags t
          JOIN photo_tags pt ON t.id = pt.tag_id
          WHERE pt.photo_id = $1
        `;

        const tagResults = await query<{
          name: string;
        }>(tagsQuery, [parseInt(photo_id)]);

        // Extract tag names into string array
        const tags = tagResults.map((tag) => tag.name);

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
            validatedInput.photo_url, // 2
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
            parseInt(photo_id), // 13
            parseInt(roll_id), // 14
            user_id, // 15
          ]
        );

        if (!updatedPhoto) {
          await query("ROLLBACK");
          return res.status(404).json({ error: "Photo not found" });
        }

        // Process tags if they exist in the request
        if (Array.isArray(req.body.tags)) {
          // Delete existing photo_tags associations
          await query("DELETE FROM photo_tags WHERE photo_id = $1", [
            parseInt(photo_id),
          ]);

          // If there are tags to add
          if (req.body.tags.length > 0) {
            // Get tag IDs for the provided tag names, ensuring they belong to the user
            const tagRows = await query<{ id: number }>(
              "SELECT id FROM tags WHERE user_id = $1 AND name = ANY($2)",
              [user_id, req.body.tags]
            );

            // Insert the new photo_tags associations
            if (tagRows.length > 0) {
              const tagValues = tagRows
                .map((tag) => `($1, ${tag.id})`)
                .join(", ");

              await query(
                `INSERT INTO photo_tags (photo_id, tag_id) VALUES ${tagValues}`,
                [parseInt(photo_id)]
              );
            }
          }
        }

        // Process lens if it exists in the request
        if (req.body.lens !== undefined) {
          // Delete existing photo_lenses associations
          await query("DELETE FROM photo_lenses WHERE photo_id = $1", [
            parseInt(photo_id),
          ]);

          // If a lens name was provided
          if (req.body.lens) {
            // Get lens ID for the provided lens name, ensuring it belongs to the user
            const lensRow = await queryOne<{ id: number }>(
              "SELECT id FROM lenses WHERE user_id = $1 AND name = $2",
              [user_id, req.body.lens]
            );

            // Insert the new photo_lenses association
            if (lensRow) {
              await query(
                "INSERT INTO photo_lenses (photo_id, lens_id) VALUES ($1, $2)",
                [parseInt(photo_id), lensRow.id]
              );
            }
          }
        }

        // Commit the transaction
        await query("COMMIT");

        // Get the updated tags for the response
        const updatedTags = await query<{ name: string }>(
          `SELECT t.name FROM tags t
             JOIN photo_tags pt ON t.id = pt.tag_id
             WHERE pt.photo_id = $1`,
          [parseInt(photo_id)]
        );

        // Get the updated lens for the response
        const updatedLens = await queryOne<{ name: string }>(
          `SELECT l.name FROM lenses l
             JOIN photo_lenses pl ON l.id = pl.lens_id
             WHERE pl.photo_id = $1
             LIMIT 1`,
          [parseInt(photo_id)]
        );

        return res.status(200).json({
          ...updatedPhoto,
          tags: updatedTags.map((tag) => tag.name),
          lens: updatedLens?.name || null,
        });
      } catch (error) {
        // Rollback in case of error
        await query("ROLLBACK");
        console.error("Error updating photo:", error);
        return res.status(500).json({ error: "Error updating photo" });
      }

    case "DELETE":
      try {
        const result = await query(
          "DELETE FROM photos WHERE id = $1 AND roll_id = $2 AND roll_id IN (SELECT id FROM rolls WHERE user_id = $3) RETURNING id",
          [parseInt(photo_id), parseInt(roll_id), user_id]
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

export default AuthMiddleWare(handler);
