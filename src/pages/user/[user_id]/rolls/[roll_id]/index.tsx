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
import { PhotoCard } from "@/components/PhotoCard";

function RollPage() {
  const router = useRouter();
  const { user_id, roll_id } = router.query;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedForDeletePhotoId, setSelectedForDeletePhotoId] = useState<
    number | null
  >(null);
  const [editingUrlAtIndex, setEditingUrlAtIndex] = useState<number | null>(
    null
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
    mutationKey: ["deleteRoll", user_id, selectedForDeletePhotoId],
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
    mutationKey: ["deletePhoto", user_id, roll_id, selectedForDeletePhotoId],
    mutationFn: deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["photos", user_id, Number(roll_id)],
      });
      setIsDeleteModalOpen(false);
      setSelectedForDeletePhotoId(null);
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
    if (typeof user_id !== "string" || !selectedForDeletePhotoId) return;
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
          isOpen={isDeleteModalOpen && !selectedForDeletePhotoId}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteRoll}
          title="Delete Roll"
          message="Are you sure you want to delete this roll? This will also delete all photos in this roll. This action cannot be undone."
        />
        <ConfirmModal
          isOpen={isDeleteModalOpen && selectedForDeletePhotoId !== null}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedForDeletePhotoId(null);
          }}
          onConfirm={() => {
            if (selectedForDeletePhotoId) {
              handleDeletePhoto(selectedForDeletePhotoId);
            }
            setIsDeleteModalOpen(false);
            setSelectedForDeletePhotoId(null);
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
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  user_id={user_id as string}
                  roll_id={Number(roll_id)}
                  isEditing={editingUrlAtIndex === index}
                  setEditingIndex={(i) => setEditingUrlAtIndex(i)}
                  onUpdateUrl={updateUrlOnlyMutation}
                  onDelete={() => {
                    setSelectedForDeletePhotoId(photo.id);
                    setIsDeleteModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default withAuth(RollPage);
