import { ClientUserSchema } from "@/types/users";
import { fetchWithAuth } from "@/utils/auth";

type GetUserParams = {
  user_id: string;
};

export const getUser = async ({ user_id }: GetUserParams) => {
  const url = `/api/user/${user_id}`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return ClientUserSchema.parse(await response.json());
};
