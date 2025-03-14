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

interface UserData {
  id: string;
  username: string;
}

function UserPage() {
  const router = useRouter();
  const { user_id } = router.query;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user_id) return;

    fetchWithAuth(`/api/user/${user_id}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/');
            return;
          }
          throw new Error(await res.text());
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUserData(data);
          setError("");
        }
      })
      .catch((err) => {
        console.error('Error fetching user data:', err);
        setError(err.message || "Failed to load user data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user_id, router]);

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
        <title>Account Home - In-focus</title>
        <meta name="description" content="User account home" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        <main style={sharedStyles.main}>
          <div style={sharedStyles.breadcrumbs}>
            <span>Account home</span>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Account Home</h1>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center' , whiteSpace: 'nowrap'}}>
              <Link href={`/user/${user_id}/rolls`}>
                <button style={sharedStyles.button}>View Rolls</button>
              </Link>
              <button 
                onClick={logout}
                style={sharedStyles.secondaryButton}
              >
                Logout
              </button>
            </div>
          </div>

          <div style={{...sharedStyles.card, cursor: 'default', width: '100%', maxWidth: '600px'}}>
            <h2 style={{...sharedStyles.subtitle, marginBottom: '1rem', fontSize: '1.2rem'}}>
              Account Information
            </h2>
            <div style={{display: 'grid', gap: '1rem'}}>
              <div>
                <label style={{...sharedStyles.subtitle, fontSize: '0.9rem'}}>User ID</label>
                <p style={{margin: '0.5rem 0', fontFamily: 'var(--font-geist-mono)'}}>{userData?.id}</p>
              </div>
              <div>
                <label style={{...sharedStyles.subtitle, fontSize: '0.9rem'}}>Username</label>
                <p style={{margin: '0.5rem 0', fontFamily: 'var(--font-geist-mono)'}}>{userData?.username}</p>
              </div>
            </div>
          </div>
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

export default withAuth(UserPage);
