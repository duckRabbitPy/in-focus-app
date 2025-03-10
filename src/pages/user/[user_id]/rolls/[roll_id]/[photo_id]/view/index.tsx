import { useRouter } from "next/router";

export default function ViewPhotoSettingsPage() {
  const router = useRouter();
  const { user_id, roll_id, photo_id } = router.query;

  return (
    <div>
      <h1>View Photo</h1>
      <p>User ID: {user_id}</p>
      <p>Roll ID: {roll_id}</p>
      <p>Photo ID: {photo_id}</p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <a href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/edit`}>
          Edit photo
        </a>
        <a href={`/user/${user_id}/rolls/${roll_id}`}>Back to roll</a>
        <a href={`/user/${user_id}/rolls`}>Back to rolls</a>
        <a href={`/user/${user_id}`}>Back to user page</a>
        <a href={`/`}>Back to home</a>
      </div>
    </div>
  );
}
