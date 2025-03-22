import { RollSchema } from "@/types/rolls";
import { fetchWithAuth } from "@/utils/auth";

type UpdateRollMutationParams = {
  userId: string;
  rollId: number;
  name: string;
  filmType: string;
  iso: string;
};

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

type CreateRollParams = {
  user_id: string;
};

export const createRoll = async ({ user_id }: CreateRollParams) => {
  const url = `/api/user/${user_id}/rolls`;

  const response = await fetchWithAuth(url, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  return RollSchema.parse(await response.json());
};

type DeleteRollParams = {
  user_id: string;
  roll_id: number;
};

export const deleteRoll = async ({ user_id, roll_id }: DeleteRollParams) => {
  const url = `/api/user/${user_id}/rolls/${roll_id}`;

  const response = await fetchWithAuth(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data?.message;
};
