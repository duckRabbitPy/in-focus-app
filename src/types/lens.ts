import { z } from "zod";

export const LensSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Lens = z.infer<typeof LensSchema>;
