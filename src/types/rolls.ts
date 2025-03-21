import { z } from "zod";

export const RollSchema = z.object({
  id: z.number(),
  name: z.string(),
  film_type: z.string().nullable(),
  iso: z.number().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Roll = z.infer<typeof RollSchema>;
