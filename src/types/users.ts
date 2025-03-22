import { z } from "zod";

export const ClientUserSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export const ServerOnlyUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  password_hash: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type ClientUser = z.infer<typeof ClientUserSchema>;
