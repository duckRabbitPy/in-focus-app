import { useRouter } from "next/router";

export default function UserPage() {
  const router = useRouter();
  const { user_id } = router.query;

  return (
    <div>
      <h1>User page</h1>
      <p>User ID: {user_id}</p>
      <p>Account settings</p>
      <a href={`/user/${user_id}/rolls`}>View rolls</a>
      <a href={`/`}>Back to home</a>
    </div>
  );
}
