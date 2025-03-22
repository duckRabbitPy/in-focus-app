import { NextApiResponse } from "next";
import { query } from "@/utils/db";
import {
  WithApiAuthMiddleware,
  AuthenticatedRequest,
} from "../../../../../requests/middleware";
import { Tag } from "@/types/tags";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { user_id } = req.query;

  // Verify that the requested user_id matches the authenticated user's ID
  if (user_id !== req.user?.userId) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  switch (req.method) {
    case "GET":
      try {
        const tags = await query<Tag>(
          "SELECT id, name, created_at, updated_at FROM tags WHERE user_id = $1 ORDER BY name ASC",
          [user_id]
        );

        return res.status(200).json(tags);
      } catch (error) {
        console.error("Error fetching tags:", error);
        return res.status(500).json({ error: "Failed to fetch tags" });
      }

    case "POST":
      try {
        const { tags: newTags } = req.body as { tags: string[] };

        if (!Array.isArray(newTags)) {
          return res
            .status(400)
            .json({ error: "Tags must be provided as an array of strings" });
        }

        // Filter out invalid tag names
        const validTags = newTags
          .filter(
            (tag) =>
              typeof tag === "string" &&
              tag.trim().length > 0 &&
              tag.trim().length <= 50
          )
          .map((tag) => tag.trim().toLowerCase());
        console.log({ newTags, validTags });
        if (validTags.length === 0) {
          return res.status(400).json({ error: "No valid tags provided" });
        }

        // Use ON CONFLICT DO NOTHING to handle duplicates silently
        const insertQuery = `
          INSERT INTO tags (user_id, name)
          SELECT $1, unnest($2::text[])
          ON CONFLICT (user_id, name) DO NOTHING
          RETURNING id, name, created_at, updated_at
        `;

        // log what is in tags
        const tags = await query<Tag>(
          "SELECT id, name, created_at, updated_at FROM tags WHERE user_id = $1 ORDER BY name ASC",
          [user_id]
        );

        console.log({
          tags,
        });

        console.log({
          user_id,
          validTags,
        });

        const insertedTags = await query<Tag>(insertQuery, [
          user_id,
          validTags,
        ]);

        // Get all tags after insertion to return the complete list
        const allTags = await query<Tag>(
          "SELECT id, name, created_at, updated_at FROM tags WHERE user_id = $1 ORDER BY name ASC",
          [user_id]
        );

        return res.status(200).json({
          inserted: insertedTags,
          all: allTags,
        });
      } catch (error) {
        console.error("Error creating tags:", error);
        return res.status(500).json({ error: "Failed to create tags" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

export default WithApiAuthMiddleware(handler);
