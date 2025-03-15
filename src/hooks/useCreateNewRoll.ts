import { useState } from "react";
import { useRouter } from "next/router";
import { fetchWithAuth } from "@/utils/auth";

const useCreateNewRoll = (user_id: string) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetchWithAuth(`/api/user/${user_id}/rolls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create new roll");
      }

      const data = await response.json();
      router.push(`/user/${user_id}/rolls/${data.id}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create roll"
      );
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit, error, loading };
};

export default useCreateNewRoll;
