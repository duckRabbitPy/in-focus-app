import { NextApiResponse } from "next";
import { query } from "@/utils/db";
import {
  WithApiAuthMiddleware,
  AuthenticatedRequest,
} from "../../../../../../requests/middleware";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { user_id, roll_id, name, iso, film_type } = req.query;

  // Verify that the requested user_id matches the authenticated user's ID
  if (user_id !== req.user?.userId) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  switch (req.method) {
    case "PUT":
      const validIso = iso ? parseInt(iso as string, 10) : null;
      const validFilmType = film_type || null;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      try {
        const results = await query(
          "UPDATE rolls SET name = $1, film_type = $2, iso = $3 WHERE id = $4 AND user_id = $5 RETURNING *",
          [name, validFilmType, validIso, roll_id, user_id]
        );

        if (results.length === 0) {
          return res.status(404).json({ error: "Roll not found" });
        }

        return res.status(200).json(results[0]);
      } catch (error) {
        console.error("Error updating roll:", error);
        return res.status(500).json({ error: "Failed to update roll" });
      }
    case "DELETE":
      try {
        // First, delete all photos associated with this roll
        await query(
          "DELETE FROM photos WHERE roll_id = $1 AND roll_id IN (SELECT id FROM rolls WHERE user_id = $2)",
          [roll_id, user_id]
        );

        // Then delete the roll itself
        const result = await query(
          "DELETE FROM rolls WHERE id = $1 AND user_id = $2 RETURNING id",
          [roll_id, user_id]
        );

        if (result.length === 0) {
          return res.status(404).json({ error: "Roll not found" });
        }

        return res.status(200).json({ message: "Roll deleted successfully" });
      } catch (error) {
        console.error("Error deleting roll:", error);
        return res.status(500).json({ error: "Failed to delete roll" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

export default WithApiAuthMiddleware(handler);
