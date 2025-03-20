import { FullPhotoSettingsData } from "@/types/photoSettings";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import PhotoForm from "@/components/PhotoForm/PhotoForm";
import { geistSans, geistMono } from "@/styles/font";
import { PageHead } from "@/components/PageHead";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updatePhoto } from "@/requests/mutations/photos";
import { useValidatedQueryParams } from "@/hooks/useValidatedQueryParams";
import { getPhoto } from "@/requests/queries/photos";

function EditPhotoSettingsPage() {
  const router = useRouter();
  const { photo_id, roll_id, user_id } = useValidatedQueryParams();
  const [error, setError] = useState("");

  const queryClient = useQueryClient();
  const [photoFormState, setPhotoFormState] =
    useState<FullPhotoSettingsData | null>(null);

  const {
    data: photoInDB,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["photo", user_id, roll_id, photo_id],
    queryFn: () =>
      getPhoto({
        user_id,
        roll_id: Number(roll_id),
        photo_id: Number(photo_id),
      }),
    enabled: !!user_id && !!roll_id && !!photo_id,
  });

  useEffect(() => {
    if (photoInDB) {
      setPhotoFormState(photoInDB);
    }
  }, [photoInDB]);

  // mutation function to update photo data
  const { mutate, isPending: isSaving } = useMutation({
    mutationKey: ["updatePhoto", user_id, roll_id, photo_id],
    mutationFn: updatePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos", user_id, roll_id] });
      router.push(`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`);
    },
    onError: (error) => {
      console.error("Failed to load photo data:", error);
      setError("Failed to load photo data");
      setPhotoFormState(null);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!photoFormState || !roll_id || !photo_id) {
      setError("Failed to save changes, missing key data");
      return;
    }
    setError("");
    mutate({
      ...photoFormState,
      user_id,
      roll_id: Number(roll_id),
      photo_id: Number(photo_id),
    });
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
          ? "Please log in to edit this page"
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
        title={`Edit Photo ${photoFormState?.subject || "untitled"}`}
        description="Edit photo settings"
      />
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
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
            <Link
              href={`/user/${user_id}/rolls/${roll_id}`}
              style={sharedStyles.link}
            >
              Roll #{roll_id}
            </Link>
            <span style={sharedStyles.separator}>/</span>
            <Link
              href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`}
              style={sharedStyles.link}
            >
              Photo #{photo_id}
            </Link>
            <span style={sharedStyles.separator}>/</span>
            <span>Edit</span>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>{`Edit photo: ${
              photoFormState?.subject || "untitled"
            }`}</h1>
          </div>

          {isSaving || isLoading || !photoFormState ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState />
          ) : (
            <PhotoForm
              isNewPhoto={false}
              photo={photoFormState}
              onPhotoChange={setPhotoFormState}
              onSubmit={handleSubmit}
              submitButtonText="Save Changes"
              cancelHref={`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`}
              error={error}
              isSubmitting={isSaving}
            />
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

export default withAuth(EditPhotoSettingsPage);
