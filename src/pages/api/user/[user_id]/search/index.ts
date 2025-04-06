import {
  AuthenticatedRequest,
  WithApiAuthMiddleware,
} from "@/requests/middleware";
import { query } from "@/utils/db";
import { NextApiResponse } from "next";

interface DBPhotoResult {
  id: number;
  roll_id: number;
  subject: string;
  photo_url: string | null;
  created_at: string;
  roll_name: string;
  tags: string[];
}

interface PhotoSearchResult {
  id: string;
  roll_id: string;
  subject: string;
  photo_url?: string;
  created_at: string;
  roll_name: string;
  tags: string[];
}

function transformDBResultToSearchResult(
  photo: DBPhotoResult
): PhotoSearchResult {
  return {
    id: photo.id.toString(),
    roll_id: photo.roll_id.toString(),
    subject: photo.subject,
    photo_url: photo.photo_url || undefined,
    created_at: photo.created_at,
    roll_name: photo.roll_name,
    tags: photo.tags || [],
  };
}

export async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id } = req.query;
  const tags = req.query.tags
    ? Array.isArray(req.query.tags)
      ? req.query.tags
      : [req.query.tags]
    : [];

  let page = 1;
  let pageSize = 20;

  if (req.query.page && typeof req.query.page === "string") {
    page = parseInt(req.query.page, 10);
  }

  if (req.query.pageSize && typeof req.query.pageSize === "string") {
    pageSize = parseInt(req.query.pageSize, 10);
  }

  const offset = (page - 1) * pageSize;

  const rawSearchTerm = Array.isArray(req.query.searchTerm)
    ? req.query.searchTerm.join(" ")
    : req.query.searchTerm;

  const searchTerms = rawSearchTerm?.trim()
    ? rawSearchTerm.trim().split(/\s+/)
    : [];

  try {
    if (!user_id || user_id !== req.user?.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const queryParams: (string | number)[] = [user_id];
    let paramIndex = 2;

    let whereClause = `WHERE r.user_id = $1`;

    if (tags.length > 0) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM photo_tags pt2
        JOIN tags t2 ON pt2.tag_id = t2.id
        WHERE pt2.photo_id = p.id 
        AND t2.name = ANY($${paramIndex}::text[])
      )`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryParams.push(tags as any);
      paramIndex++;
    }

    if (searchTerms.length > 0) {
      whereClause += ` AND (`;
      const likeConditions = searchTerms.map((_, index) => {
        return `p.subject ILIKE $${paramIndex + index}`;
      });
      whereClause += likeConditions.join(" OR ") + `)`;

      searchTerms.forEach((term) => {
        queryParams.push(`%${term}%`);
      });

      paramIndex += searchTerms.length;
    }

    // Count query for pagination
    const countQueryText = `
      SELECT COUNT(DISTINCT p.id) AS total_count
      FROM photos p
      JOIN rolls r ON p.roll_id = r.id
      LEFT JOIN photo_tags pt ON p.id = pt.photo_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      ${whereClause}
    `;

    const countResult = await query<{ total_count: string }>(
      countQueryText,
      queryParams
    );
    const totalCount = parseInt(countResult[0].total_count, 10);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Main data query
    const queryText = `
      SELECT DISTINCT 
        p.id,                      
        p.roll_id,                  
        p.subject,                  
        p.photo_url,                
        p.created_at,               
        r.name as roll_name,        
        ARRAY_REMOVE(ARRAY_AGG(t.name), NULL) as tags   
      FROM 
        photos p                     
        JOIN rolls r ON p.roll_id = r.id
        LEFT JOIN photo_tags pt ON p.id = pt.photo_id
        LEFT JOIN tags t ON pt.tag_id = t.id
      ${whereClause}
      GROUP BY 
        p.id, p.roll_id, p.subject, p.photo_url, p.created_at, r.name
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(pageSize, offset);

    const result = await query<DBPhotoResult>(queryText, queryParams);
    const transformedPhotos = result.map(transformDBResultToSearchResult);

    return res.json({
      photos: transformedPhotos,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ error: "Failed to search photos" });
  }
}

export default WithApiAuthMiddleware(handler);
