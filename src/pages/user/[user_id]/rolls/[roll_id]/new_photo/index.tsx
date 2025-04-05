import { PhotoSettingsInput } from "@/types/photos";
import { useRouter } from "next/router";
import { useState } from "react";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import PhotoForm from "@/components/PhotoForm/PhotoForm";
import { geistMono, geistSans } from "@/styles/font";
import { PageHead } from "@/components/PageHead";
import { createPhoto } from "@/requests/mutations/photos";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Breadcrumbs } from "@/components/BreadCrumbs";

function NewPhotoPage() {
  const router = useRouter();
  const { user_id, roll_id } = router.query;

  const [newPhotoData, setNewPhotoData] = useState<PhotoSettingsInput>({
    subject: "",
    photo_url: "",
    f_stop: "2.8",
    focal_distance: "1",
    shutter_speed: "1/125",
    exposure_value: 1,
    phone_light_meter: "1/125",
    stabilisation: "handheld",
    timer: false,
    flash: false,
    exposure_memory: false,
    notes: "",
    tags: [],
    lens: "",
  });

  const queryClient = useQueryClient();

  const {
    mutate: createPhotoMutation,
    isPending,
    error,
  } = useMutation({
    mutationKey: ["createPhoto", user_id, roll_id],
    mutationFn: createPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["photos", user_id, Number(roll_id)],
      });
      router.push(`/user/${user_id}/rolls/${roll_id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createPhotoMutation({
      user_id: user_id as string,
      roll_id: Number(roll_id),
      ...newPhotoData,
    });
  };

  return (
    <>
      <PageHead title={"New Photo"} description={"Add a new photo"} />
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
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
              new_photo: true,
            }}
          />

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
            error={error?.message}
            isSubmitting={isPending}
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
