import { AllPhotoSettings } from "@/types/photoSettings";
import { useRouter } from "next/router";
import { useState } from "react";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import PhotoForm from "@/components/Photo/PhotoForm";
import { geistMono, geistSans } from "@/styles/font";
import { PageHead } from "@/components/PageHead";

type NewPhotoData = Omit<AllPhotoSettings, "created_at" | "updated_at" | "id">;

function NewPhotoPage() {
  const router = useRouter();
  const { user_id, roll_id } = router.query;

  const [newPhotoData, setNewPhotoData] = useState<NewPhotoData>({
    roll_id: Number(roll_id),
    subject: "",
    photo_url: "",
    f_stop: 2.8,
    focal_distance: 1,
    shutter_speed: "1/125",
    exposure_value: 0,
    phone_light_meter: "1/125",
    stabilisation: "handheld",
    timer: false,
    flash: false,
    exposure_memory: false,
    notes: "",
    tags: [],
    lens: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/user/${user_id}/rolls/${roll_id}/photos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(newPhotoData),
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        router.push(`/user/${user_id}/rolls/${roll_id}`);
      }
    } catch (error: unknown) {
      console.error("Failed to create photo:", error);
      setError("Failed to create photo");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHead title={"New Photo"} description={"Add a new photo"} />
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
            <span>New Photo</span>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Add New Photo</h1>
          </div>

          <PhotoForm
            isNewPhoto
            photo={newPhotoData}
            onPhotoChange={setNewPhotoData}
            onSubmit={handleSubmit}
            submitButtonText="Create Photo"
            cancelHref={`/user/${user_id}/rolls/${roll_id}`}
            error={error}
            isSubmitting={submitting}
          />
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

export default withAuth(NewPhotoPage);
