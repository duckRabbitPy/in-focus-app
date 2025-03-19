import { z } from "zod";
import { useRouter } from "next/router";

const querySchema = z.object({
  user_id: z.string(),
  roll_id: z.string().optional(),
  photo_id: z.string().optional(),
});

export const useValidatedQueryParams = () => {
  const router = useRouter();

  const result = querySchema.safeParse(router.query);

  if (!result.success) {
    console.error("Invalid query params:", result.error.format());
    router.replace("/error");
    return {
      user_id: "",
      roll_id: "",
      photo_id: "",
    };
  }

  return {
    user_id: result.data.user_id,
    roll_id: result.data.roll_id,
    photo_id: result.data.photo_id,
  };
};
