import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getUserFromToken } from "@/utils/auth";

import { PageHead } from "@/components/PageHead";
import Image from "next/image";
import { sharedStyles } from "@/styles/shared";
import { geistMono, geistSans } from "@/styles/font";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = getUserFromToken();

      // Redirect to user's rolls if logged in
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

  return (
    <>
      <PageHead title={"In-focus"} description={"Photography settings app"} />
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        <main
          style={{
            ...sharedStyles.main,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h1
              style={{
                ...sharedStyles.title,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              In-focus
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                <Image src="/camera.png" alt="Camera" width={50} height={50} />
              </span>
            </h1>
          </div>

          <p style={sharedStyles.subtitle}>Photography settings app</p>

          <form
            onSubmit={handleSubmit}
            style={{ ...sharedStyles.form, maxWidth: "400px" }}
            autoComplete="on"
          >
            <input
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={sharedStyles.input}
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
              style={sharedStyles.input}
              disabled={loading}
              required
            />
            <button
              type="submit"
              style={sharedStyles.button}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
            {error && <p style={sharedStyles.error}>{error}</p>}
          </form>
          <div>
            <Link href="/register">Register</Link>
          </div>
        </main>
        <footer style={sharedStyles.footer}>
          <a
            href="https://github.com/DuckRabbitPy"
            target="_blank"
            rel="noopener noreferrer"
            style={sharedStyles.link}
          >
            DuckRabbitPy
          </a>
        </footer>
      </div>
    </>
  );
}
