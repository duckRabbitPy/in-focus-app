import { LensSchema } from "@/types/lens";
import { fetchWithAuth } from "@/utils/auth";
import { z } from "zod";

export const getLenses = async ({ userId }: { userId: string }) => {
  const url = `/api/user/${userId}/lenses`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch lenses: ${response.status}`);
  }

  const data = await response.json();

  try {
    return z.array(LensSchema).parse(data);
  } catch (error) {
    console.error(`Error fetching lenses:`, error);
    throw new Error(`Failed to load lenses`);
  }
};
