import { RollSchema } from "@/types/rolls";
import { fetchWithAuth } from "@/utils/auth";
import { z } from "zod";

type GetRollsParams = {
  user_id: string;
};

export const getRolls = async ({ user_id }: GetRollsParams) => {
  const url = `/api/user/${user_id}/rolls`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return z.array(RollSchema).parse(await response.json());
};
