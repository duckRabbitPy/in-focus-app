import { UserRegistrationResponseSchema } from "@/types/users";

type CreateUserMutationParams = {
  username: string;
  password: string;
};

export const createUser = async ({
  username,
  password,
}: CreateUserMutationParams) => {
  const url = `/api/auth/register`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return UserRegistrationResponseSchema.parse(await response.json());
};
