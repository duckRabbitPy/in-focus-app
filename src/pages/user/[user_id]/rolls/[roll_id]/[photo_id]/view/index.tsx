import { PhotoSettingsData } from "@/types/photoSettings";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { sharedStyles } from "@/styles/shared";
import styles from "@/styles/ViewPhoto.module.css";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { fetchWithAuth } from "@/utils/auth";
import { ConfirmModal } from "@/components/ConfirmModal";
import { geistMono, geistSans } from "@/styles/font";
import { PageHead } from "@/components/PageHead";

function ViewPhotoSettingsPage() {
  const router = useRouter();
  const { user_id, roll_id, photo_id } = router.query;

  const [photo, setPhoto] = useState<PhotoSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
        setError("Failed to load photo data");
        setPhoto(null);
        setLoading(false);
      });
  }, [user_id, roll_id, photo_id]);

  const handleDeletePhoto = async () => {
    try {
      const response = await fetchWithAuth(
        `/api/user/${user_id}/rolls/${roll_id}/${photo_id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }

      router.push(`/user/${user_id}/rolls/${roll_id}`);
    } catch (error) {
      console.error("Error deleting photo:", error);
      setError("Failed to delete photo");
    }
  };

  const LoadingState = () => (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p style={sharedStyles.subtitle}>Loading...</p>
    </div>
  );

  const ErrorState = () => (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p style={sharedStyles.error}>
        {error === "Missing authentication token"
          ? "Please log in to view this page"
          : error || "Photo not found"}
      </p>
      <Link
        href={
          error === "Missing authentication token"
            ? "/"
            : `/user/${user_id}/rolls/${roll_id}`
        }
      >
        <button style={{ ...sharedStyles.button, marginTop: "1rem" }}>
          {error === "Missing authentication token"
            ? "Go to Home Page"
            : "Back to Roll"}
        </button>
      </Link>
    </div>
  );

  return (
    <>
      <PageHead
        title={`Photo #${photo_id}`}
        description="View photo settings"
      />
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeletePhoto}
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
              <h1 style={sharedStyles.title}>Photo #{photo_id}</h1>
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <Link
                  href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/edit`}
                  className={styles.linkContainer}
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

          {loading ? (
            <LoadingState />
          ) : !photo ? (
            <ErrorState />
          ) : (
            <div
              className={styles.detailsCard}
              style={{
                width: "100%",
                maxWidth: "800px",
              }}
            >
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
                    className={styles.maximizeButton}
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

              <h2 className={styles.title}>{photo.subject || "Untitled"}</h2>

              <div className={styles.detailsGroup}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Subject</span>
                  <p className={styles.value}>{photo.subject || "Not set"}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Photo URL</span>
                  {photo.photo_url ? (
                    <Link
                      className={styles.valueLink}
                      href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/max_size`}
                      target="_blank"
                    >
                      View Photo
                    </Link>
                  ) : (
                    <p className={styles.valueDisabled}>Not set</p>
                  )}
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Tags</span>
                  <p className={styles.value}>
                    {photo.tags.join(", ") || "Not set"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>F-Stop</span>
                  <p className={styles.value}>f/{photo.f_stop || "Not set"}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Lens</span>
                  <p className={styles.value}>{photo.lens || "Not set"}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Focal Distance</span>
                  <p className={styles.value}>
                    {photo.focal_distance === "infinity"
                      ? "∞"
                      : photo.focal_distance
                      ? `${photo.focal_distance}m`
                      : "Not set"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Shutter Speed</span>
                  <p className={styles.value}>
                    {photo.shutter_speed || "Not set"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Exposure Value</span>
                  <p className={styles.value}>
                    {photo.exposure_value?.toString() || "Not set"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Phone Light Meter</span>
                  <p className={styles.value}>
                    {photo.phone_light_meter || "Not set"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Stabilisation</span>
                  <p className={styles.value}>
                    {photo.stabilisation
                      ? photo.stabilisation.charAt(0).toUpperCase() +
                        photo.stabilisation.slice(1)
                      : "Not set"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Notes</span>
                  <p
                    className={styles.value}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {photo.notes || "Not set"}
                  </p>
                </div>
              </div>

              <div className={styles.booleanGroup}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Timer</span>
                  <p className={styles.value}>
                    {typeof photo.timer === "boolean"
                      ? photo.timer
                        ? "Yes"
                        : "No"
                      : "Not set"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Flash</span>
                  <p className={styles.value}>
                    {typeof photo.flash === "boolean"
                      ? photo.flash
                        ? "Yes"
                        : "No"
                      : "Not set"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Exposure Memory</span>
                  <p className={styles.value}>
                    {typeof photo.exposure_memory === "boolean"
                      ? photo.exposure_memory
                        ? "Yes"
                        : "No"
                      : "Not set"}
                  </p>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <Link
                  href={`/user/${user_id}/rolls/${roll_id}`}
                  className={styles.linkContainer}
                >
                  <button style={sharedStyles.secondaryButton}>
                    Back to Roll
                  </button>
                </Link>
                <Link
                  href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/edit`}
                  className={styles.linkContainer}
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
