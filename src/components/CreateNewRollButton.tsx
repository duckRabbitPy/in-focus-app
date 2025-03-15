import useCreateNewRoll from "@/hooks/useCreateNewRoll";
import { sharedStyles } from "@/styles/shared";

const getText = ({ error, loading }: { error: string; loading: boolean }) => {
  if (error) return "Error creating (try again)";
  if (loading) return "Creating...";
  return "Create Roll";
};

const CreateNewRollButton = ({ user_id }: { user_id: string }) => {
  const { handleSubmit, error, loading } = useCreateNewRoll(user_id);

  return (
    <form onSubmit={handleSubmit} style={sharedStyles.form}>
      <button
        type="submit"
        style={{ ...sharedStyles.button, maxWidth: "200px" }}
        disabled={loading}
      >
        {getText({ error, loading })}
      </button>
    </form>
  );
};

export default CreateNewRollButton;
