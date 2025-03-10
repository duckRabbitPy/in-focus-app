import { useRouter } from "next/router";

export default function NewRollPage() {
  const router = useRouter();
  const { user_id } = router.query;

  return (
    <div>
      <h1>New roll</h1>
      <p>User ID: {user_id}</p>
    </div>
  );
}
