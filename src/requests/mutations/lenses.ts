import { LensSchema } from "@/types/lenses";
import { fetchWithAuth } from "@/utils/auth";

type CreateLensMutationParams = {
  userId: string;
  name: string;
};

export const createLens = async ({
  userId,
  name,
}: CreateLensMutationParams) => {
  const url = `/api/user/${userId}/lenses`;

  const response = await fetchWithAuth(url, {
    method: "POST",
    body: JSON.stringify({ lenses: [name] }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  const data = await response.json();

  return LensSchema.parse(data?.inserted[0]);
};
