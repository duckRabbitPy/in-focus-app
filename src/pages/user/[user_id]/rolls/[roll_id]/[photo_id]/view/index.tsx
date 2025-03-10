import { PhotoSettingsData } from "@/types/photoSettings";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ViewPhotoSettingsPage() {
  const router = useRouter();
  const { user_id, roll_id, photo_id } = router.query;

  const [photo, setPhoto] = useState<PhotoSettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user_id || !roll_id || !photo_id) return;

    fetch(`/api/user/${user_id}/rolls/${roll_id}/${photo_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setPhoto(null);
        } else {
          setPhoto(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setPhoto(null);
        setLoading(false);
      });
  }, [user_id, roll_id, photo_id]);

  if (loading) return <p>Loading...</p>;
  if (!photo) return <p>Photo not found</p>;

  return (
    <div>
      <h1>View Photo</h1>
      <p>
        <strong>Subject:</strong> {photo.subject}
      </p>
      <p>
        <strong>F-Stop:</strong> f/{photo.fStop}
      </p>
      <p>
        <strong>Focal Distance:</strong> {photo.focalDistance}
      </p>
      <p>
        <strong>Shutter Speed:</strong> {photo.shutterSpeed}
      </p>
      <p>
        <strong>Exposure Value:</strong> {photo.exposureValue}
      </p>
      <p>
        <strong>Phone Light Meter:</strong> {photo.phoneLightMeter}
      </p>
      <p>
        <strong>Timer:</strong> {photo.timer ? "Yes" : "No"}
      </p>
      <p>
        <strong>Flash:</strong> {photo.flash ? "Yes" : "No"}
      </p>
      <p>
        <strong>Stabilisation:</strong> {photo.stabilisation}
      </p>
      <p>
        <strong>Exposure Memory:</strong> {photo.exposureMemory ? "Yes" : "No"}
      </p>

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
