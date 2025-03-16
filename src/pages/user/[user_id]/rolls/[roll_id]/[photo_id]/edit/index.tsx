import { PhotoSettingsFormData } from "@/types/photoSettings";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import PhotoForm from "@/components/PhotoForm";
import { geistSans, geistMono } from "@/styles/font";
import { PageHead } from "@/components/PageHead";

function EditPhotoSettingsPage() {
  const router = useRouter();
  const { user_id, roll_id, photo_id } = router.query;

  const [photo, setPhoto] = useState<PhotoSettingsFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user_id || !roll_id || !photo_id) return;

    fetch(`/api/user/${user_id}/rolls/${roll_id}/${photo_id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
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
      .catch((error: Error) => {
        console.error("Failed to load photo data:", error);
        setError("Failed to load photo data");
        setPhoto(null);
        setLoading(false);
      });
  }, [user_id, roll_id, photo_id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(
        `/api/user/${user_id}/rolls/${roll_id}/${photo_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(photo),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        router.push(`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`);
      }
    } catch (error: unknown) {
      console.error("Failed to save changes:", error);
      setError("Failed to save changes");
    } finally {
      setSaving(false);
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
        title={`Edit Photo ${photo?.subject || "untitled"}`}
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
              photo?.subject || "untitled"
            }`}</h1>
          </div>

          {loading ? (
            <LoadingState />
          ) : !photo ? (
            <ErrorState />
          ) : (
            <PhotoForm
              photo={photo}
              onPhotoChange={setPhoto}
              onSubmit={handleSubmit}
              submitButtonText="Save Changes"
              cancelHref={`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`}
              error={error}
              isSubmitting={saving}
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
