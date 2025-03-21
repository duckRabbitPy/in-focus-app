import { z } from "zod";

export const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Tag = z.infer<typeof TagSchema>;
