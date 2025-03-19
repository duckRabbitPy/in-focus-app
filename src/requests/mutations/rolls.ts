import { fetchWithAuth } from "@/utils/auth";
import { z } from "zod";

type UpdateRollMutationParams = {
  userId: string;
  rollId: number;
  name: string;
  filmType: string;
  iso: string;
};

const RollSchema = z.object({
  id: z.number(),
  name: z.string(),
  film_type: z.string(),
  iso: z.number(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const updateRoll = async ({
  userId,
  rollId,
  name,
  filmType,
  iso,
}: UpdateRollMutationParams) => {
  const url = `/api/user/${userId}/rolls/${rollId}?name=${encodeURIComponent(
    name
  )}&film_type=${encodeURIComponent(filmType)}&iso=${encodeURIComponent(iso)}`;

  const response = await fetchWithAuth(url, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return RollSchema.parse(await response.json());
};
