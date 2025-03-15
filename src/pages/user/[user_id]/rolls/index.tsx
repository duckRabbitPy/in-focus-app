import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { fetchWithAuth, logout } from "@/utils/auth";
import { ConfirmModal } from "@/components/ConfirmModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface Roll {
  id: number;
  name: string;
  film_type: string | null;
  iso: number | null;
  created_at: string;
  updated_at: string;
}

const rollCardStyles = {
  card: {
    ...sharedStyles.card,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    cursor: 'default',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...sharedStyles.subtitle,
    fontFamily: 'var(--font-geist-mono)',
    fontSize: '1.1rem',
    margin: 0,
  },
  details: {
    display: 'grid',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.85rem',
    color: '#444',
    margin: 0,
  },
  value: {
    fontSize: '0.95rem',
    color: '#000',
    margin: 0,
    fontFamily: 'var(--font-geist-mono)',
  },
};

const headerButtonStyles = {
  container: {
    display: 'flex', 
    gap: '0.75rem', 
    alignItems: 'center',
    '@media (min-width: 640px)': {
      gap: '1rem'
    }
  },
  linkWrapper: {
    display: 'inline-block'
  },
  newRollButton: {
    ...sharedStyles.button,
    whiteSpace: 'nowrap' as const,
    padding: '0.75rem 1.25rem'
  },
  logoutButton: {
    ...sharedStyles.secondaryButton,
    whiteSpace: 'nowrap' as const,
    fontSize: '0.9rem',
    padding: '0.75rem 1.25rem'
  }
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
        console.error('Error fetching rolls:', err);
        setError("Failed to load rolls");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user_id])

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

  if (loading) {
    return (
      <div style={{...sharedStyles.page, justifyContent: 'center', alignItems: 'center'}}>
        <p style={sharedStyles.subtitle}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{...sharedStyles.page, justifyContent: 'center', alignItems: 'center'}}>
        <p style={sharedStyles.error}>{error}</p>
        <Link href="/">
          <button style={{...sharedStyles.button, marginTop: '1rem'}}>
            Back to Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Film Rolls - In-focus</title>
        <meta name="description" content="View and manage your film rolls" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
            <Link href={`/user/${user_id}`} style={sharedStyles.link}>Account</Link>
            <span style={sharedStyles.separator}>/</span>
            <span>Rolls</span>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Film Rolls</h1>
            <div style={headerButtonStyles.container}>
              <Link href={`/user/${user_id}/rolls/new`} style={headerButtonStyles.linkWrapper}>
                <button style={headerButtonStyles.newRollButton}>
                  New Roll
                </button>
              </Link>
              <button 
                onClick={logout}
                style={headerButtonStyles.logoutButton}
              >
                Logout
              </button>
            </div>
          </div>

          {rolls.length === 0 ? (
            <div style={{textAlign: 'center', padding: '2rem'}}>
              <p style={sharedStyles.subtitle}>No rolls found</p>
              <Link href={`/user/${user_id}/rolls/new`}>
                <button style={{...sharedStyles.button, marginTop: '1rem'}}>
                  Create Your First Roll
                </button>
              </Link>
            </div>
          ) : (
            <div style={sharedStyles.grid}>
              {rolls.map((roll) => (
                <div key={roll.id} style={rollCardStyles.card}>
                  <div style={rollCardStyles.header}>
                    <h2 style={rollCardStyles.title}>{roll.name}</h2>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <Link href={`/user/${user_id}/rolls/${roll.id}`}>
                        <button style={sharedStyles.button}>View Roll</button>
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedRollId(roll.id);
                          setIsDeleteModalOpen(true);
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          cursor: "pointer",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#dc2626",
                          backgroundColor: "transparent",
                          border: "2px solid #dc2626",
                          fontSize: "0.9rem",
                          fontFamily: "var(--font-geist-sans)",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.1)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        aria-label="Delete roll"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div style={rollCardStyles.details}>
                    {roll.film_type && (
                      <div>
                        <p style={rollCardStyles.label}>Film Type</p>
                        <p style={rollCardStyles.value}>{roll.film_type}</p>
                      </div>
                    )}
                    {roll.iso && (
                      <div>
                        <p style={rollCardStyles.label}>ISO</p>
                        <p style={rollCardStyles.value}>{roll.iso}</p>
                      </div>
                    )}
                    <div>
                      <p style={rollCardStyles.label}>Created</p>
                      <p style={rollCardStyles.value}>
                        {new Date(roll.created_at).toLocaleDateString()}
                      </p>
                    </div>
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

export default withAuth(RollsPage);
