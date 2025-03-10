import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function RollsPage() {
  const router = useRouter();
  const { user_id } = router.query;
  const [rollIds, setRollIds] = useState<number[] | null>(null);

  useEffect(() => {
    if (!user_id) return;

    const fetchRolls = async () => {
      try {
        const response = await fetch(`/api/user/${user_id}/rolls`);
        if (!response.ok) throw new Error("Failed to fetch rolls");

        const data: number[] = await response.json();
        setRollIds(data);
      } catch (error) {
        console.error(error);
        setRollIds([]);
      }
    };

    fetchRolls();
  }, [user_id]);

  if (!user_id) return <p>Loading...</p>;
  if (rollIds === null) return <p>Fetching rolls...</p>;
  if (rollIds.length === 0) return <p>No rolls found.</p>;

  return (
    <div>
      <h1>Rolls Page</h1>
      <p>User ID: {user_id}</p>
      {rollIds.map((roll_id) => (
        <a key={roll_id} href={`/user/${user_id}/rolls/${roll_id}`}>
          <p>Roll ID: {roll_id}</p>
        </a>
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <a href={`/user/${user_id}/rolls`}>Back to rolls</a>
        <a href={`/user/${user_id}`}>Back to user page</a>
        <a href={`/`}>Back to home</a>
      </div>
    </div>
  );
}
