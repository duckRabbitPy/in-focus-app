import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { fetchWithAuth, logout } from "@/utils/auth";
import { ConfirmModal } from "@/components/ConfirmModal";
import { geistMono, geistSans } from "@/styles/font";
import { CreateNewRollButton } from "@/components/CreateNewRollButton";
import { RollCard } from "@/components/RollCard/RollCard";
import { PageHead } from "@/components/PageHead";

interface Roll {
  id: number;
  name: string;
  film_type: string | null;
  iso: number | null;
  created_at: string;
  updated_at: string;
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

function RollsPage() {
  const router = useRouter();
  const { user_id } = router.query;
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRollId, setSelectedRollId] = useState<number | null>(null);

  useEffect(() => {
    if (!user_id) return;

    fetchWithAuth(`/api/user/${user_id}/rolls`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await res.text());
        }
        return res.json();
      })
      .then((data) => {
        setRolls(data);
        setError("");
      })
      .catch((err) => {
        console.error("Error fetching rolls:", err);
        setError("Failed to load rolls");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user_id]);

  const handleDeleteRoll = async () => {
    if (!selectedRollId) return;

    try {
      const response = await fetchWithAuth(
        `/api/user/${user_id}/rolls/${selectedRollId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete roll");
      }

      setRolls(rolls.filter((roll) => roll.id !== selectedRollId));
      setSelectedRollId(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting roll:", error);
      setError("Failed to delete roll");
    }
  };

  const handleUpdateRoll = (updatedRoll: Roll) => {
    setRolls(
      rolls.map((roll) => (roll.id === updatedRoll.id ? updatedRoll : roll))
    );
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
          <div style={sharedStyles.breadcrumbs}>
            <Link href={`/user/${user_id}`} style={sharedStyles.link}>
              Home
            </Link>
            <span style={sharedStyles.separator}>/</span>
            <span>Rolls</span>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Film Rolls</h1>
            <div style={headerButtonStyles.container}>
              <CreateNewRollButton user_id={user_id as string} />
              <button onClick={logout} style={headerButtonStyles.logoutButton}>
                Logout
              </button>
            </div>
          </div>

          {rolls.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p style={sharedStyles.subtitle}>No rolls found</p>
              <Link href={`/user/${user_id}/rolls/new`}>
                <button style={{ ...sharedStyles.button, marginTop: "1rem" }}>
                  Create Your First Roll
                </button>
              </Link>
            </div>
          ) : (
            <div style={sharedStyles.grid}>
              {rolls.map((roll) => (
                <RollCard
                  key={roll.id}
                  roll={roll}
                  user_id={user_id as string}
                  onDelete={(rollId: number) => {
                    setSelectedRollId(rollId);
                    setIsDeleteModalOpen(true);
                  }}
                  onUpdate={handleUpdateRoll}
                />
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

export default withAuth(RollsPage);
