import { FullPhotoSettingsData, FullPhotoSettingsSchema } from "@/types/photos";

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
