import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getUserFromToken } from "@/utils/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    backgroundColor: "#ffffff",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    gap: "2rem",
  },
  title: {
    fontSize: "3rem",
    fontWeight: 700,
    margin: 0,
    fontFamily: "var(--font-geist-mono)",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#444",
    margin: 0,
    fontFamily: "var(--font-geist-sans)",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    width: "100%",
    maxWidth: "300px",
    marginTop: "1rem",
  },
  input: {
    padding: "0.8rem 1rem",
    border: "2px solid #000",
    borderRadius: "4px",
    fontSize: "1rem",
    width: "100%",
    fontFamily: "var(--font-geist-sans)",
    transition: "border-color 0.2s",
    outline: "none",
    "&:focus": {
      borderColor: "#666",
    },
  },
  button: {
    padding: "0.8rem 1rem",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    fontFamily: "var(--font-geist-sans)",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#333",
    },
    "&:disabled": {
      backgroundColor: "#666",
      cursor: "not-allowed",
    },
  },
  error: {
    color: "#ff3333",
    fontSize: "0.9rem",
    margin: 0,
    fontFamily: "var(--font-geist-sans)",
  },
  footer: {
    padding: "2rem",
    textAlign: "center" as const,
    borderTop: "1px solid #eaeaea",
  },
  link: {
    color: "#444",
    textDecoration: "none",
    fontFamily: "var(--font-geist-sans)",
    transition: "color 0.2s",
    "&:hover": {
      color: "#000",
    },
  },
};

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = getUserFromToken();
      if (user) {
        router.push(`/user/${user.userId}/rolls`);
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with username:", username);
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("Auth response status:", response.status);

      if (!response.ok) {
        console.error("Auth error:", data);
        throw new Error(
          data.error || `Authentication failed (${response.status})`
        );
      }

      if (!data.token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", data.token);

      // Get user ID from token and redirect
      const user = getUserFromToken();
      if (!user) {
        throw new Error("Failed to get user information from token");
      }
      router.push(`/user/${user.userId}`);
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const user = getUserFromToken();
  if (user) {
    console.log(user.userId, user.username);
  }

  return (
    <>
      <Head>
        <title>In-focus</title>
        <meta name="description" content="Photography settings app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={styles.page}
      >
        <main style={styles.main}>
          <h1 style={styles.title}>In-focus</h1>
          <p style={styles.subtitle}>Photography settings app</p>

          <form onSubmit={handleSubmit} style={styles.form} autoComplete="on">
            <input
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              disabled={loading}
              required
            />
            <input
              type="password"
              name="current-password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={loading}
              required
            />
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </form>
        </main>
        <footer style={styles.footer}>
          <a
            href="https://github.com/DuckRabbitPy"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            DuckRabbitPy
          </a>
        </footer>
      </div>
    </>
  );
}
