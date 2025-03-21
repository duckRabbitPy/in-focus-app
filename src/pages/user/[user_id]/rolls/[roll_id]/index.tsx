import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { fetchWithAuth } from "@/utils/auth";
import { ConfirmModal } from "@/components/ConfirmModal";
import { geistMono, geistSans } from "@/styles/font";
import { PageHead } from "@/components/PageHead";
import { formatDateString } from "@/utils/date";
import { Roll } from "@/types/rolls";

const styles = {
  card: {
    ...sharedStyles.card,
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    cursor: "default",
  },
  photoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  photoId: {
    ...sharedStyles.subtitle,
    fontFamily: "var(--font-geist-mono)",
    fontSize: "1rem",
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "stretch",
  },
  viewButton: {
    ...sharedStyles.secondaryButton,
    padding: "0.5rem 1rem",
    fontSize: "0.9rem",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  editButton: sharedStyles.button,
};

interface Photo {
  id: number;
  roll_id: number;
  subject: string;
  photo_url: string | null;
  sequence_number: number;
  created_at: string;
}

function RollPage() {
  const router = useRouter();
  const { user_id, roll_id } = router.query;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [roll, setRoll] = useState<Roll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);

  useEffect(() => {
    if (!user_id || !roll_id) return;

    fetchWithAuth(`/api/user/${user_id}/rolls/${roll_id}/photos`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setPhotos([]);
          setRoll(null);
        } else {
          setPhotos(data.photos);
          setRoll(data.roll);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load roll data");
        setPhotos([]);
        setLoading(false);
      });
  }, [user_id, roll_id]);

  const handleDeleteRoll = async () => {
    try {
      const response = await fetchWithAuth(
        `/api/user/${user_id}/rolls/${roll_id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete roll");
      }

      router.push(`/user/${user_id}/rolls`);
    } catch (error) {
      console.error("Error deleting roll:", error);
      setError("Failed to delete roll");
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      const response = await fetchWithAuth(
        `/api/user/${user_id}/rolls/${roll_id}/${photoId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }

      setPhotos(photos.filter((p) => p.id !== photoId));
    } catch (error) {
      console.error("Error deleting photo:", error);
      setError("Failed to delete photo");
    }
  };

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

  if (error) {
    return (
      <div
        style={{
          ...sharedStyles.page,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={sharedStyles.error}>{error}</p>
        <Link href={`/user/${user_id}/rolls`}>
          <button style={{ ...sharedStyles.button, marginTop: "1rem" }}>
            Back to Rolls
          </button>
        </Link>
      </div>
    );
  }

  const title = roll?.name || `Roll #${roll_id}`;

  return (
    <>
      <PageHead
        title={title}
        description="View and manage your film roll photos"
      />
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        <ConfirmModal
          isOpen={isDeleteModalOpen && !selectedPhotoId}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteRoll}
          title="Delete Roll"
          message="Are you sure you want to delete this roll? This will also delete all photos in this roll. This action cannot be undone."
        />
        <ConfirmModal
          isOpen={isDeleteModalOpen && selectedPhotoId !== null}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedPhotoId(null);
          }}
          onConfirm={() => {
            if (selectedPhotoId) {
              handleDeletePhoto(selectedPhotoId);
            }
            setIsDeleteModalOpen(false);
            setSelectedPhotoId(null);
          }}
          title="Delete Photo"
          message="Are you sure you want to delete this photo? This action cannot be undone."
        />
        <main style={sharedStyles.main}>
          <div style={sharedStyles.breadcrumbs}>
            <Link href={`/user/${user_id}`} style={sharedStyles.link}>
              Home
            </Link>
            <span style={sharedStyles.separator}>/</span>
            <Link href={`/user/${user_id}/rolls`} style={sharedStyles.link}>
              Rolls
            </Link>
            <span style={sharedStyles.separator}>/</span>
            <span>Roll #{roll_id}</span>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>{title}</h1>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <p style={sharedStyles.subtitle}>
                {roll?.film_type ? `${roll.film_type} | ` : ""}
                {roll?.iso ? `ISO ${roll.iso} | ` : ""}
                {formatDateString(roll?.created_at)}
              </p>
            </div>
            {photos.length > 0 && (
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <Link href={`/user/${user_id}/rolls/${roll_id}/new_photo`}>
                  <button style={sharedStyles.button}>Add Photo</button>
                </Link>
              </div>
            )}
          </div>

          {photos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem" }}>
              <p style={sharedStyles.subtitle}>No photos in this roll yet</p>
              <Link href={`/user/${user_id}/rolls/${roll_id}/new_photo`}>
                <button style={{ ...sharedStyles.button, marginTop: "1rem" }}>
                  Add Your First Photo
                </button>
              </Link>
            </div>
          ) : (
            <div style={sharedStyles.grid}>
              {photos.map((photo) => (
                <div key={photo.id} style={styles.card}>
                  <div style={styles.photoHeader}>
                    <Link
                      href={`/user/${user_id}/rolls/${roll_id}/${photo.id}/view`}
                    >
                      <span style={styles.photoId}>
                        Photo #{photo.sequence_number}
                      </span>
                    </Link>
                    <div style={styles.actions}>
                      <Link
                        href={`/user/${user_id}/rolls/${roll_id}/${photo.id}/edit`}
                      >
                        <button style={styles.editButton}>Edit</button>
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedPhotoId(photo.id);
                          setIsDeleteModalOpen(true);
                        }}
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
                  <div
                    style={{
                      backgroundColor: "#f5f5f5",
                      borderRadius: "4px",
                      padding: "1rem",
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: "0.9rem",
                      color: "#666",
                    }}
                  >
                    <Link
                      href={`/user/${user_id}/rolls/${roll_id}/${photo.id}/view`}
                    >
                      {photo.subject || "No subject"}
                    </Link>
                    {photo.photo_url && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <a
                          href={photo.photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#0070f3",
                            textDecoration: "underline",
                          }}
                        >
                          View Photo
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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

export default withAuth(RollPage);
