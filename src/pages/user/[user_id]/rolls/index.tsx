import { useRouter } from "next/router";

export default function RollsPage() {
  const router = useRouter();
  const { user_id } = router.query;

  const roll_ids = [1, 2, 3, 4, 5];

  return (
    <div>
      <h1>Rolls page</h1>
      <p>User ID: {user_id}</p>
      {roll_ids.map((roll_id) => (
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
