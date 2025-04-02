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
    ? req.query.searchTerm.join(" ") // Convert array to a single string
    : req.query.searchTerm;

  const searchTermEmpty = !rawSearchTerm || rawSearchTerm.trim().length === 0;

  const searchTerms = !searchTermEmpty ? rawSearchTerm.trim().split(/\s+/) : [];

  try {
    if (user_id !== req.user?.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (tags.length === 0) {
      return res.json({ photos: [] });
    }

    // See readme for details for detailed explanation of this query
    let queryText = `
    SELECT DISTINCT 
      p.id,                      
      p.roll_id,                  
      p.subject,                  
      p.photo_url,                
      p.created_at,               
      r.name as roll_name,        
      ARRAY_AGG(t.name) as tags   
    
    FROM 
      photos p                     
      JOIN rolls r                 
        ON p.roll_id = r.id
      JOIN photo_tags pt           
        ON p.id = pt.photo_id
      JOIN tags t                  
        ON pt.tag_id = t.id
    
    WHERE 
      r.user_id = $1
      AND EXISTS (
        SELECT 1 
        FROM photo_tags pt2
        JOIN tags t2 ON pt2.tag_id = t2.id
        WHERE 
          pt2.photo_id = p.id     
          AND t2.name = ANY($2)  
      )
  `;

    const queryParams = [user_id, tags];

    // Add search term conditions with ILIKE for partial matching
    if (searchTerms.length > 0) {
      queryText += ` AND (`;

      const likeConditions = searchTerms.map((_, index) => {
        // $3, $4, etc. for each search term
        const paramIndex = index + 3;
        return `p.subject ILIKE $${paramIndex}`;
      });

      queryText += likeConditions.join(" OR ");
      queryText += `)`;

      // Add each search term with wildcards to the parameters
      searchTerms.forEach((term) => {
        queryParams.push(`%${term}%`);
      });
    }

    // SQL requires all non-aggregated columns in the SELECT statement to appear in the GROUP BY clause
    // when using aggregate functions like ARRAY_AGG.
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

    // Query photos that have any of the provided tags
    const result = await query<DBPhotoResult>(queryText, queryParams);

    // Transform results to match PhotoSearchResult
    const transformedPhotos = result.map(transformDBResultToSearchResult);
    return res.json({ photos: transformedPhotos });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ error: "Failed to search photos" });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};

export default WithApiAuthMiddleware(handler);
