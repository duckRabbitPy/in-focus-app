import { FullPhotoSettingsSchema } from "@/types/photoSettings";
import { fetchWithAuth } from "@/utils/auth";

interface GetPhotoParams {
  user_id: string;
  roll_id: number;
  photo_id: number;
}

export const getPhoto = async ({
  user_id,
  roll_id,
  photo_id,
}: GetPhotoParams) => {
  const url = `/api/user/${user_id}/rolls/${roll_id}/${photo_id}`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();

  try {
    return FullPhotoSettingsSchema.parse(data);
  } catch (error) {
    console.error("Error parsing photo data:", error);
    throw new Error("Failed to parse photo data");
  }
};
