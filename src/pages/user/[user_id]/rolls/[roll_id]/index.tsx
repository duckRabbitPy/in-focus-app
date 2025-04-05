import { useRouter } from "next/router";
import { useState } from "react";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { ConfirmModal } from "@/components/ConfirmModal";
import { geistMono, geistSans } from "@/styles/font";
import { PageHead } from "@/components/PageHead";
import { formatDateString } from "@/utils/date";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteRoll } from "@/requests/mutations/rolls";
import { deletePhoto, updateUrlOnly } from "@/requests/mutations/photos";
import { getPhotos } from "@/requests/queries/photos";
import { exportRoll } from "@/utils/client";
import { FullPhotoSettingsData } from "@/types/photos";
import { Tag } from "@/types/tags";
import { Lens } from "@/types/lenses";
import { Breadcrumbs } from "@/components/BreadCrumbs";

function RollPage() {
  const router = useRouter();
  const { user_id, roll_id } = router.query;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [editingUrlAtIndex, setEditingUrlAtIndex] = useState<number | null>(
    null
  );
  const [photoUrls, setPhotoUrls] = useState<{ [photo_id: number]: string }>(
    {}
  );

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["photos", user_id, Number(roll_id)],
    queryFn: () => getPhotos(user_id as string, Number(roll_id)),
    enabled: !!user_id && !!roll_id,
  });

  const photos = data?.photos || [];
  const roll = data?.roll;

  const { mutate: deleteRollMutation } = useMutation({
    mutationKey: ["deleteRoll", user_id, selectedPhotoId],
    mutationFn: deleteRoll,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["photos", user_id, Number(roll_id)],
      });
      setIsDeleteModalOpen(false);
    },
  });

  const { mutate: updateUrlOnlyMutation } = useMutation({
    mutationFn: updateUrlOnly,
    onMutate: async (variables) => {
      // avoid overwriting the optimistic update
      await queryClient.cancelQueries({
        queryKey: ["photos", user_id, Number(roll_id)],
      });

      const previousData = queryClient.getQueryData([
        "photos",
        user_id,
        Number(roll_id),
      ]);

      // Optimistic update
      queryClient.setQueryData(
        ["photos", user_id, Number(roll_id)],
        (oldData: {
          photos: FullPhotoSettingsData[];
          tags: Tag[];
          lenses: Lens[];
        }) => {
          return {
            ...oldData,
            photos: oldData.photos.map((photo) =>
              photo.id === variables.photo_id
                ? { ...photo, photo_url: variables.photo_url }
                : photo
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        // rollback
        queryClient.setQueryData(
          ["photos", user_id, Number(roll_id)],
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["photos", user_id, Number(roll_id)],
      });
    },
  });

  const { mutate: deletePhotoMutation } = useMutation({
    mutationKey: ["deletePhoto", user_id, roll_id, selectedPhotoId],
    mutationFn: deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["photos", user_id, Number(roll_id)],
      });
      setIsDeleteModalOpen(false);
      setSelectedPhotoId(null);
    },
    onError: (err) => {
      console.error("Error deleting photo:", err);
    },
  });

  const handleDeleteRoll = async () => {
    if (typeof user_id !== "string" || typeof roll_id !== "string") return;
    deleteRollMutation({ user_id, roll_id: Number(roll_id) });
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (typeof user_id !== "string" || !selectedPhotoId) return;
    deletePhotoMutation({
      user_id,
      roll_id: Number(roll_id),
      photo_id: photoId,
    });
  };

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

  if (error) {
    return (
      <div
        style={{
          ...sharedStyles.page,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={sharedStyles.error}>{error.message}</p>
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
          <Breadcrumbs
            user_id={user_id as string}
            roll_id={Number(roll_id)}
            photo_id={undefined}
            routes={{
              home: true,
              search: false,
              rolls: true,
              roll: true,
            }}
          />

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
                {roll && photos.length > 0 && (
                  <button
                    style={sharedStyles.secondaryButton}
                    onClick={() => exportRoll(roll, photos)}
                  >
                    Export
                  </button>
                )}
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
              {photos.map((photo, index) => (
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

                    {photo.photo_url ? (
                      <div style={{ marginTop: "0.5rem" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.photo_url}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                          alt={photo.subject}
                        />
                      </div>
                    ) : (
                      <div>
                        <input
                          value={
                            editingUrlAtIndex === index
                              ? photoUrls[photo.id] || ""
                              : photo.photo_url || ""
                          }
                          onChange={(e) => {
                            setPhotoUrls({
                              ...photoUrls,
                              [photo.id]: e.target.value,
                            });
                          }}
                          onClick={() => {
                            setEditingUrlAtIndex(index);
                          }}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            marginTop: "0.5rem",
                          }}
                          placeholder="No photo URL"
                        />
                        {editingUrlAtIndex === index && (
                          <div style={{ ...styles.actions, gap: "0.25rem" }}>
                            <button
                              style={{
                                ...sharedStyles.secondaryButton,
                                backgroundColor: sharedStyles.green,
                                color: "white",
                                border: "none",
                                width: "80px",
                                marginTop: "0.5rem",
                              }}
                              onClick={() => {
                                setEditingUrlAtIndex(null);
                                updateUrlOnlyMutation({
                                  user_id: user_id as string,
                                  roll_id: Number(roll_id),
                                  photo_id: photo.id,
                                  photo_url: photoUrls[photo.id],
                                });
                              }}
                            >
                              update
                            </button>
                            <button
                              style={{
                                ...sharedStyles.secondaryButton,
                                border: "none",
                                width: "20px",
                                marginTop: "0.5rem",
                              }}
                              onClick={() => {
                                setEditingUrlAtIndex(null);
                              }}
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

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

export default withAuth(RollPage);
