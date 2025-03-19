import { PhotoSchema, PhotoSettingsData } from "@/types/photoSettings";
import { fetchWithAuth } from "@/utils/auth";

interface UpdatePhotoMutationParams extends PhotoSettingsData {
  user_id: string;
  roll_id: number;
  photo_id: number;
}

export const updatePhoto = async ({
  user_id,
  roll_id,
  photo_id,
  subject,
  photo_url,
  f_stop,
  focal_distance,
  shutter_speed,
  exposure_value,
  phone_light_meter,
  timer,
  flash,
  stabilisation,
  exposure_memory,
  lens,
  tags,
  notes,
}: UpdatePhotoMutationParams) => {
  const url = `/api/user/${user_id}/rolls/${roll_id}/${photo_id}`;

  const response = await fetchWithAuth(url, {
    method: "PUT",
    body: JSON.stringify({
      roll_id,
      photo_id,
      subject,
      photo_url,
      f_stop,
      focal_distance,
      shutter_speed,
      exposure_value,
      phone_light_meter,
      timer,
      flash,
      stabilisation,
      exposure_memory,
      lens,
      tags,
      notes,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return PhotoSchema.parse(await response.json());
};
