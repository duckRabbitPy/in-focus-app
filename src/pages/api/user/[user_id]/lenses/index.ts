import { NextApiResponse } from "next";
import { query } from "@/utils/db";
import { withAuth, AuthenticatedRequest } from "@/utils/middleware";
import { Tag } from "@/types/tag";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { user_id } = req.query;

  if (user_id !== req.user?.userId) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  switch (req.method) {
    case "GET":
      try {
        const lenses = await query<Tag>(
          "SELECT id, name, created_at, updated_at FROM lenses WHERE user_id = $1 ORDER BY name ASC",
          [user_id]
        );

        return res.status(200).json(lenses);
      } catch (error) {
        console.error("Error fetching lenses:", error);
        return res.status(500).json({ error: "Failed to fetch lenses" });
      }

    case "POST":
      try {
        const { lenses: newLenses } = req.body as { lenses: string[] };

        if (!Array.isArray(newLenses)) {
          return res
            .status(400)
            .json({ error: "Lenses must be provided as an array of strings" });
        }

        const validLenses = newLenses
          .filter(
            (lens) =>
              typeof lens === "string" &&
              lens.trim().length > 0 &&
              lens.trim().length <= 50
          )
          .map((lens) => lens.trim().toLowerCase());

        if (validLenses.length === 0) {
          return res.status(400).json({ error: "No valid lenses provided" });
        }

        const insertQuery = `
          INSERT INTO lenses (user_id, name)
          SELECT $1, unnest($2::text[])
          ON CONFLICT (user_id, name) DO NOTHING
          RETURNING id, name, created_at, updated_at
        `;

        const insertedLenses = await query<Tag>(insertQuery, [
          user_id,
          validLenses,
        ]);

        const allLenses = await query<Tag>(
          "SELECT id, name, created_at, updated_at FROM lenses WHERE user_id = $1 ORDER BY name ASC",
          [user_id]
        );

        return res.status(200).json({
          inserted: insertedLenses,
          all: allLenses,
        });
      } catch (error) {
        console.error("Error creating lenses:", error);
        return res.status(500).json({ error: "Failed to create lenses" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

export default withAuth(handler);
