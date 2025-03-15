// search all photos, by user_id and tags

import { arrayFromQueryParam } from "@/pages/api/server_helpers/requests";
import { AuthenticatedRequest } from "@/utils/middleware";
import { NextApiResponse } from "next";

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { user_id, tags } = req.query;

  // Verify that the requested user_id matches the authenticated user's ID
  if (user_id !== req.user?.userId) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  const tagsArray = arrayFromQueryParam(tags);
}
