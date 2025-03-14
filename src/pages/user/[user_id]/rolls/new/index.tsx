import { useRouter } from "next/router";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { useState } from "react";
import { withAuth } from "@/utils/withAuth";
import { fetchWithAuth } from "@/utils/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default withAuth(function NewRollPage() {
  const router = useRouter();
  const { user_id } = router.query;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetchWithAuth(`/api/user/${user_id}/rolls`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create new roll");
      }

      const data = await response.json();
      router.push(`/user/${user_id}/rolls/${data.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create roll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>New Roll - In-focus</title>
        <meta name="description" content="Create a new film roll" />
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
            <Link href={`/user/${user_id}/rolls`} style={sharedStyles.link}>Rolls</Link>
            <span style={sharedStyles.separator}>/</span>
            <span>New Roll</span>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>New Roll</h1>
          </div>

          <form onSubmit={handleSubmit} style={sharedStyles.form}>
            <div style={{...sharedStyles.card, cursor: 'default'}}>
              <h2 style={{...sharedStyles.subtitle, marginBottom: '1rem'}}>
                Roll Details
              </h2>
              {/* Add form fields for roll details here */}
              {error && <p style={sharedStyles.error}>{error}</p>}
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <Link href={`/user/${user_id}/rolls`}>
                  <button type="button" style={sharedStyles.secondaryButton}>
                    Cancel
                  </button>
                </Link>
                <button 
                  type="submit" 
                  style={sharedStyles.button}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Roll"}
                </button>
              </div>
            </div>
          </form>
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
});
