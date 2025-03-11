import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { fetchWithAuth, logout } from "@/utils/auth";

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

function RollsPage() {
  const router = useRouter();
  const { user_id } = router.query;
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <main style={sharedStyles.main}>
          <div style={sharedStyles.breadcrumbs}>
            <Link href={`/user/${user_id}`} style={sharedStyles.link}>Account</Link>
            <span style={sharedStyles.separator}>/</span>
            <span>Rolls</span>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Film Rolls</h1>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <Link href={`/user/${user_id}/rolls/new`}>
                <button style={sharedStyles.button}>New Roll</button>
              </Link>
              <button 
                onClick={logout}
                style={{
                  ...sharedStyles.secondaryButton,
                  fontSize: '0.9rem',
                  padding: '0.5rem 1rem'
                }}
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
                    <Link href={`/user/${user_id}/rolls/${roll.id}`}>
                      <button style={sharedStyles.button}>View Roll</button>
                    </Link>
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
