import { useRouter } from "next/router";
import { useState } from "react";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { logout } from "@/utils/auth";
import { ConfirmModal } from "@/components/ConfirmModal";
import { geistMono, geistSans } from "@/styles/font";
import { CreateNewRollButton } from "@/components/CreateNewRollButton";
import { RollCard } from "@/components/RollCard/RollCard";
import { PageHead } from "@/components/PageHead";
import { deleteRoll } from "@/requests/mutations/rolls";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRolls } from "@/requests/queries/rolls";
import { Breadcrumbs } from "@/components/BreadCrumbs";

function RollsPage() {
  const router = useRouter();
  const { user_id } = router.query;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRollId, setSelectedRollId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const {
    data: rolls,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rolls", user_id],
    queryFn: () => getRolls({ user_id: user_id as string }),
    enabled: !!user_id,
  });

  const { mutate: deleteRollMutation, error: deleteRollError } = useMutation({
    mutationKey: ["deleteRoll", user_id, selectedRollId],
    mutationFn: deleteRoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rolls", user_id] });
      setIsDeleteModalOpen(false);
    },
  });

  const handleDeleteRoll = async () => {
    if (typeof user_id !== "string" || !selectedRollId) return;
    deleteRollMutation({ user_id, roll_id: selectedRollId });
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
        <Link href="/">
          <button style={{ ...sharedStyles.button, marginTop: "1rem" }}>
            Back to Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title="Film Rolls"
        description="View and manage your film rolls"
      />
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedRollId(null);
          }}
          onConfirm={handleDeleteRoll}
          title="Delete Roll"
          message="Are you sure you want to delete this roll? This will also delete all photos in this roll. This action cannot be undone."
        />
        <main style={sharedStyles.main}>
          <Breadcrumbs
            user_id={user_id as string}
            photo_id={undefined}
            roll_id={undefined}
            routes={{
              home: true,
              search: false,
              rolls: true,
            }}
          />

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Film Rolls</h1>
            <div style={headerButtonStyles.container}>
              <CreateNewRollButton user_id={user_id as string} />
              <button onClick={logout} style={headerButtonStyles.logoutButton}>
                Logout
              </button>
            </div>
          </div>

          {rolls?.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <p style={sharedStyles.subtitle}>No rolls found</p>
            </div>
          ) : (
            <div style={sharedStyles.grid}>
              {rolls?.map((roll) => (
                <RollCard
                  key={roll.id}
                  roll={roll}
                  user_id={user_id as string}
                  onDelete={(rollId: number) => {
                    setSelectedRollId(rollId);
                    setIsDeleteModalOpen(true);
                  }}
                  deleteError={deleteRollError}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

const headerButtonStyles = {
  container: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    "@media (minWidth: 640px)": {
      gap: "1rem",
    },
  },
  linkWrapper: {
    display: "inline-block",
  },
  newRollButton: {
    ...sharedStyles.button,
    whiteSpace: "nowrap" as const,
    padding: "0.75rem 1.25rem",
  },
  logoutButton: {
    ...sharedStyles.secondaryButton,
    whiteSpace: "nowrap" as const,
    fontSize: "0.9rem",
    padding: "0.75rem 1.25rem",
  },
};

export default withAuth(RollsPage);
