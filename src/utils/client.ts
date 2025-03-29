import { FullPhotoSettingsData, FullPhotoSettingsSchema } from "@/types/photos";
import { Roll } from "@/types/rolls";

import { QueryClient } from "@tanstack/react-query";
import { z } from "zod";

type getPhotoFromCacheParams = {
  queryClient: QueryClient;
  user_id: string;
  roll_id: number;
  photo_id: number;
};

export function getPhotoFromRollCache({
  queryClient,
  user_id,
  roll_id,
  photo_id,
}: getPhotoFromCacheParams): FullPhotoSettingsData | undefined {
  if (!user_id || !roll_id || !photo_id) {
    return undefined;
  }

  const queryCache = queryClient.getQueryCache();
  const rollDataCacheQuery = queryCache.find({
    queryKey: ["photos", user_id, Number(roll_id)],
  });

  const rollData = rollDataCacheQuery?.state?.data as {
    roll?: unknown;
    photos?: unknown;
  };
  if (!rollData) {
    return undefined;
  }

  const validatedResult = z
    .array(FullPhotoSettingsSchema)
    .safeParse(rollData.photos);

  if (!validatedResult.success) {
    return undefined;
  }

  return validatedResult.data.find((p) => p.id === Number(photo_id));
}

export const exportRoll = (roll: Roll, photos: FullPhotoSettingsData[]) => {
  const { film_type, iso, name } = roll;
  const header = [
    "roll_id",
    "photo_id",
    "subject",
    "photo_url",
    "film_type",
    "iso",
    "created_at",
    "updated_at",
    "f_stop",
    "focal_distance",
    "shutter_speed",
    "exposure_value",
    "phone_light_meter",
    "stabilisation",
    "timer",
    "flash",
    "exposure_memory",
    "lens",
    "tags",
  ];

  const rows = photos.map((photo) => [
    roll.id,
    photo.id,
    photo.subject,
    photo.photo_url,
    film_type,
    iso,
    photo.created_at,
    photo.updated_at,
    photo.f_stop,
    photo.focal_distance,
    photo.shutter_speed,
    photo.exposure_value,
    photo.phone_light_meter,
    photo.stabilisation,
    photo.timer,
    photo.flash,
    photo.exposure_memory,
    photo.lens,
    photo.tags.join(", "),
  ]);

  const csvRows = [header, ...rows].map((row) => row.join(","));
  const csvString = csvRows.join("\n");
  const csvContent = `data:text/csv;charset=utf-8,${csvString}`;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${name}.csv`);
  document.body.appendChild(link);
  link.click();
};
