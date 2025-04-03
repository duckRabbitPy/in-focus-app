import { NextApiResponse } from "next";
import { query } from "@/utils/db";
import {
  WithApiAuthMiddleware,
  AuthenticatedRequest,
} from "../../../../../requests/middleware";

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

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id } = req.query;
  const tags = req.query.tags
    ? Array.isArray(req.query.tags)
      ? req.query.tags
      : [req.query.tags]
    : [];

  const rawSearchTerm = Array.isArray(req.query.searchTerm)
    ? req.query.searchTerm.join(" ")
    : req.query.searchTerm;

  const searchTermEmpty = !rawSearchTerm || rawSearchTerm.trim().length === 0;

  const searchTerms = !searchTermEmpty ? rawSearchTerm.trim().split(/\s+/) : [];

  try {
    if (user_id !== req.user?.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    let queryText = `
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
    
    WHERE 
      r.user_id = $1
    `;

    const queryParams = [user_id];
    let paramIndex = 2;

    if (tags.length > 0) {
      queryText += `
        AND EXISTS (
          SELECT 1 
          FROM photo_tags pt2
          JOIN tags t2 ON pt2.tag_id = t2.id
          WHERE 
            pt2.photo_id = p.id     
            AND t2.name = ANY(ARRAY[${tags
              .map((_, i) => `$${paramIndex + i}`)
              .join(", ")}])
        )
      `;

      tags.forEach((tag) => {
        queryParams.push(tag);
        paramIndex++;
      });
    }

    // Add search term conditions with ILIKE for partial matching
    if (searchTerms.length > 0) {
      queryText += ` AND (`;

      const likeConditions = searchTerms.map((_, index) => {
        return `p.subject ILIKE $${paramIndex + index}`;
      });

      queryText += likeConditions.join(" OR ");
      queryText += `)`;

      // Add each search term with wildcards to the parameters
      searchTerms.forEach((term) => {
        queryParams.push(`%${term}%`);
      });
    }

    // Group by and order by
    queryText += `
      GROUP BY 
        p.id,
        p.roll_id,
        p.subject,
        p.photo_url,
        p.created_at,
        r.name
      ORDER BY p.created_at DESC
    `;

    // Query photos that match the criteria
    const result = await query<DBPhotoResult>(queryText, queryParams);

    // Transform results to match PhotoSearchResult
    const transformedPhotos = result.map(transformDBResultToSearchResult);
    return res.json({ photos: transformedPhotos });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ error: "Failed to search photos" });
  }
}

export default WithApiAuthMiddleware(handler);
