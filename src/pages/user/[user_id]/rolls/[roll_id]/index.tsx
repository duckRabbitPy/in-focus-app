import { useRouter } from "next/router";

export default function RollPage() {
  const router = useRouter();
  const { user_id, roll_id } = router.query;

  const photo_ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div>
      <p>User ID: {user_id}</p>
      <h1>Roll {roll_id}</h1>
      {photo_ids.map((photo_id) => (
        <div
          key={photo_id}
          style={{ display: "flex", flexDirection: "row", gap: "1rem" }}
        >
          <p>Photo ID: {photo_id}</p>
          <div>
            <a
              key={photo_id}
              href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`}
            >
              View
            </a>
          </div>
          <div>
            <a
              key={photo_id}
              href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/edit`}
            >
              Edit
            </a>
          </div>
        </div>
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
