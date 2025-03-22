import { z } from "zod";

const PhotoSearchResultSchema = z.object({
  id: z.string(),
  roll_id: z.string(),
  subject: z.string(),
  photo_url: z.string().optional(),
  created_at: z.string(),
  roll_name: z.string(),
  tags: z.array(z.string()),
});

export const SearchResponseSchema = z.object({
  photos: z.array(PhotoSearchResultSchema),
});

// Type inference from Zod schemas
export type PhotoSearchResult = z.infer<typeof PhotoSearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
