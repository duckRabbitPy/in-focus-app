import { useRouter } from "next/router";
import { useState } from "react";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PageHead } from "@/components/PageHead";
import { getPhoto } from "@/requests/queries/photos";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deletePhoto } from "@/requests/mutations/photos";
import { styles } from "./styles";
import { getPhotoFromRollCache } from "@/utils/client";

function ViewPhotoSettingsPage() {
  const router = useRouter();
  const { photo_id, roll_id, user_id } = router.query;
  const queryClient = useQueryClient();

  const {
    data: photo,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["photo", user_id, Number(roll_id), Number(photo_id)],
    queryFn: () =>
      getPhoto({
        user_id: user_id as string,
        roll_id: Number(roll_id),
        photo_id: Number(photo_id),
      }),
    enabled: !!user_id && !!roll_id && !!photo_id,
    initialData: () => {
      // Try to find the photo in the existing roll data
      try {
        const existingPhotoInCache = getPhotoFromRollCache({
          user_id: user_id as string,
          roll_id: Number(roll_id),
          photo_id: Number(photo_id),
          queryClient: queryClient,
        });

        if (existingPhotoInCache) {
          return existingPhotoInCache;
        }
      } catch (e) {
        console.error("Error accessing query cache:", e);
      }

      return undefined;
    },
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { mutate: deletePhotoMutation } = useMutation({
    mutationKey: ["deletePhoto", user_id, roll_id, photo_id],
    mutationFn: deletePhoto,
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["photos", user_id, Number(roll_id)],
      });
      router.push(`/user/${user_id}/rolls/${roll_id}`);
    },
  });

  const LoadingState = () => (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p style={sharedStyles.subtitle}>Loading...</p>
    </div>
  );

  const ErrorState = () => (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p style={sharedStyles.error}>
        {error?.message === "Missing authentication token"
          ? "Please log in to view this page"
          : error?.message || "Photo not found"}
      </p>
      <Link
        href={
          error?.message === "Missing authentication token"
            ? "/"
            : `/user/${user_id}/rolls/${roll_id}`
        }
      >
        <button style={{ ...sharedStyles.button, marginTop: "1rem" }}>
          {error?.message === "Missing authentication token"
            ? "Go to Home Page"
            : "Back to Roll"}
        </button>
      </Link>
    </div>
  );

  return (
    <>
      <PageHead
        title={`View photo: ${photo?.subject || "untitled"}`}
        description="View photo settings"
      />
      <div style={sharedStyles.page}>
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            deletePhotoMutation({
              user_id: user_id as string,
              roll_id: Number(roll_id),
              photo_id: Number(photo_id),
            });
          }}
          title="Delete Photo"
          message="Are you sure you want to delete this photo? This action cannot be undone."
        />
        <main
          style={{
            ...sharedStyles.main,
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "800px",
            }}
          >
            <div style={sharedStyles.breadcrumbs}>
              <Link href={`/user/${user_id}`} style={sharedStyles.link}>
                Home
              </Link>
              <span style={sharedStyles.separator}>/</span>
              <Link href={`/user/${user_id}/rolls`} style={sharedStyles.link}>
                Rolls
              </Link>
              <span style={sharedStyles.separator}>/</span>
              <Link
                href={`/user/${user_id}/rolls/${roll_id}`}
                style={sharedStyles.link}
              >
                Roll #{roll_id}
              </Link>
              <span style={sharedStyles.separator}>/</span>
              <span>Photo #{photo_id}</span>
            </div>

            <div style={sharedStyles.header}>
              <h1 style={sharedStyles.title}>{`View photo: ${
                photo?.subject || "untitled"
              }`}</h1>
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <Link
                  href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/edit`}
                  style={styles.linkContainer}
                >
                  <button style={sharedStyles.button}>Edit Photo</button>
                </Link>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  style={{
                    ...sharedStyles.secondaryButton,
                    color: "#dc2626",
                    border: "2px solid #dc2626",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(220, 38, 38, 0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  aria-label="Delete photo"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : !photo || isError ? (
            <ErrorState />
          ) : (
            <div style={styles.detailsCard}>
              {photo.photo_url && (
                <div
                  style={{
                    width: "100%",
                    minHeight: "30vh",
                    maxHeight: "50vh",
                    marginBottom: "1.5rem",
                    position: "relative" as const,
                    backgroundColor: "#f5f5f5",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                  }}
                >
                  <Link
                    href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/max_size`}
                    target="_blank"
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      background: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "0.25rem",
                      padding: "0.5rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                      border: "none",
                    }}
                  >
                    {/* Maximize button */}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </Link>
                  {photo.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.photo_url}
                      alt={photo.subject}
                      style={{
                        width: "100%",
                        height: "300px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                </div>
              )}

              <h2 style={styles.title}>{photo.subject || "Untitled"}</h2>

              <div style={styles.detailsGroup}>
                <div style={styles.detailItem}>
                  <span style={styles.label}>Subject</span>
                  <p style={styles.value}>{photo.subject || "Not set"}</p>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.label}>Photo URL</span>
                  {photo.photo_url ? (
                    <Link
                      style={styles.valueLink}
                      href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/max_size`}
                      target="_blank"
                    >
                      View Photo
                    </Link>
                  ) : (
                    <p style={styles.valueDisabled}>Not set</p>
                  )}
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.label}>Tags</span>
                  <p style={styles.value}>
                    {photo.tags.join(", ") || "Not set"}
                  </p>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.label}>F-Stop</span>
                  <p style={styles.value}>f/{photo.f_stop || "Not set"}</p>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.label}>Lens</span>
                  <p style={styles.value}>{photo.lens || "Not set"}</p>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.label}>Focal Distance</span>
                  <p style={styles.value}>
                    {photo.focal_distance === "infinity"
                      ? "∞"
                      : photo.focal_distance
                      ? `${photo.focal_distance}m`
                      : "Not set"}
                  </p>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.label}>Shutter Speed</span>
                  <p style={styles.value}>{photo.shutter_speed || "Not set"}</p>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.label}>Exposure Value</span>
                  <p style={styles.value}>
                    {photo.exposure_value?.toString() || "Not set"}
                  </p>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.label}>Phone Light Meter</span>
                  <p style={styles.value}>
                    {photo.phone_light_meter || "Not set"}
                  </p>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.label}>Stabilisation</span>
                  <p style={styles.value}>
                    {photo.stabilisation
                      ? photo.stabilisation.charAt(0).toUpperCase() +
                        photo.stabilisation.slice(1)
                      : "Not set"}
                  </p>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.label}>Notes</span>
                  <p style={{ ...styles.value, whiteSpace: "pre-wrap" }}>
                    {photo.notes || "Not set"}
                  </p>
                </div>
              </div>

              <div style={styles.booleanGroup}>
                <div style={styles.detailItem}>
                  <span style={styles.label}>Timer</span>
                  <p style={styles.value}>
                    {typeof photo.timer === "boolean"
                      ? photo.timer
                        ? "Yes"
                        : "No"
                      : "Not set"}
                  </p>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.label}>Flash</span>
                  <p style={styles.value}>
                    {typeof photo.flash === "boolean"
                      ? photo.flash
                        ? "Yes"
                        : "No"
                      : "Not set"}
                  </p>
                </div>

                <div style={styles.detailItem}>
                  <span style={styles.label}>Exposure Memory</span>
                  <p style={styles.value}>
                    {typeof photo.exposure_memory === "boolean"
                      ? photo.exposure_memory
                        ? "Yes"
                        : "No"
                      : "Not set"}
                  </p>
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <Link
                  href={`/user/${user_id}/rolls/${roll_id}`}
                  style={styles.linkContainer}
                >
                  <button style={sharedStyles.secondaryButton}>
                    Back to Roll
                  </button>
                </Link>
                <Link
                  href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/edit`}
                  style={styles.linkContainer}
                >
                  <button style={sharedStyles.button}>Edit Photo</button>
                </Link>
              </div>
            </div>
          )}
        </main>
        <footer style={sharedStyles.footer}>
          <Link
            href="https://github.com/DuckRabbitPy"
            target="_blank"
            rel="noopener noreferrer"
            style={sharedStyles.link}
          >
            DuckRabbitPy
          </Link>
        </footer>
      </div>
    </>
  );
}

export default withAuth(ViewPhotoSettingsPage);
