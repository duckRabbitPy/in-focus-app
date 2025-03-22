/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";

import { geistSans } from "@/styles/font";
import { PageHead } from "@/components/PageHead";
import { getPhoto } from "@/requests/queries/photos";
import { useQuery } from "@tanstack/react-query";

function MaxiPhotoPage() {
  const router = useRouter();
  const { user_id, roll_id, photo_id } = router.query;

  const {
    data: photo,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["photo", user_id, roll_id, photo_id],
    queryFn: () =>
      getPhoto({
        user_id: user_id as string,
        roll_id: Number(roll_id),
        photo_id: Number(photo_id),
      }),
    enabled: !!user_id && !!roll_id && !!photo_id,
  });

  if (isLoading) {
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

  if (isError || !photo?.photo_url) {
    return (
      <div
        style={{
          ...sharedStyles.page,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={sharedStyles.error}>{error?.message || "Photo not found"}</p>
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
      <PageHead
        title={`View photo: ${photo?.subject || "untitled"}`}
        description="View full size photo"
      />
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
