import { TagSchema } from "@/types/tags";
import { fetchWithAuth } from "@/utils/auth";
import { z } from "zod";

export const getTags = async ({ userId }: { userId: string }) => {
  const url = `/api/user/${userId}/tags`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.status}`);
  }

  const data = await response.json();

  try {
    return z.array(TagSchema).parse(data);
  } catch (error) {
    console.error(`Error fetching tags:`, error);
    throw new Error(`Failed to load tags`);
  }
};
