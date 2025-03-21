import { TagSchema } from "@/types/tag";
import { fetchWithAuth } from "@/utils/auth";

type CreateTagMutationParams = {
  userId: string;
  name: string;
};

export const createTag = async ({ userId, name }: CreateTagMutationParams) => {
  const url = `/api/user/${userId}/tags`;

  const response = await fetchWithAuth(url, {
    method: "POST",
    body: JSON.stringify({ tags: [name] }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

  return TagSchema.parse(data?.inserted[0]);
};
