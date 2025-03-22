import { createRoll } from "@/requests/mutations/rolls";
import { sharedStyles } from "@/styles/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

export const CreateNewRollButton = ({ user_id }: { user_id: string }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    mutate: createRollMutation,
    isPending,
    isError: isCreateError,
  } = useMutation({
    mutationKey: ["createRoll", user_id],
    mutationFn: createRoll,
    onSuccess: (data) => {
      router.push(`/user/${user_id}/rolls/${data.id}`);
      queryClient.invalidateQueries({ queryKey: ["rolls", user_id] });
    },
  });

  const handleCreateRoll = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createRollMutation({ user_id });
  };

  return (
    <form onSubmit={handleCreateRoll} style={sharedStyles.form}>
      <button
        type="submit"
        style={{ ...sharedStyles.button, maxWidth: "200px" }}
        disabled={isPending}
      >
        {isCreateError
          ? "Error creating (try again)"
          : isPending
          ? "Creating..."
          : "Create Roll"}
      </button>
    </form>
  );
};
