/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { fetchWithAuth } from "@/utils/auth";

import { geistSans } from "@/styles/font";

function MaxiPhotoPage() {
  const router = useRouter();
  const { user_id, roll_id, photo_id } = router.query;

  const [photo, setPhoto] = useState<{
    photo_url: string | null;
    subject: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user_id || !roll_id || !photo_id) return;

    fetchWithAuth(`/api/user/${user_id}/rolls/${roll_id}/${photo_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setPhoto(null);
        } else {
          setPhoto(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load photo");
        setPhoto(null);
        setLoading(false);
      });
  }, [user_id, roll_id, photo_id]);

  if (loading) {
    return (
      <div
        style={{
          ...sharedStyles.page,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={sharedStyles.subtitle}>Loading...</p>
      </div>
    );
  }

  if (error || !photo?.photo_url) {
    return (
      <div
        style={{
          ...sharedStyles.page,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={sharedStyles.error}>{error || "Photo not found"}</p>
        <Link href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`}>
          <button style={{ ...sharedStyles.button, marginTop: "1rem" }}>
            Back to Photo
          </button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Photo #{photo_id} - Full Size - In-focus</title>
        <meta name="description" content="View full size photo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={geistSans.variable} style={sharedStyles.page}>
        <main
          style={{
            ...sharedStyles.main,
            padding: "1rem",
            width: "100%",
            maxWidth: "none",
            display: "flex",
            flexDirection: "column" as const,
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Link href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`}>
              <button style={sharedStyles.secondaryButton}>
                ← Back to Photo
              </button>
            </Link>
          </div>
          <div
            style={{
              width: "100%",
              overflow: "auto",
              backgroundColor: "#f5f5f5",
              borderRadius: "0.5rem",
              padding: "1rem",
            }}
          >
            <img
              src={photo.photo_url}
              alt={photo.subject}
              style={{
                width: "100%",
                height: "800px",
                objectFit: "contain",
              }}
            />
          </div>
        </main>
      </div>
    </>
  );
}

export default withAuth(MaxiPhotoPage);
