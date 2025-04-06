import { PageHead } from "@/components/PageHead";
import { sharedStyles } from "@/styles/shared";
import { geistMono, geistSans } from "@/styles/font";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "@/requests/mutations/register";

export default function LandingPage() {
  const [navigating, setNavigating] = useState(false);
  const {
    mutate: createUserMutation,
    isPending: loading,
    error,
  } = useMutation({
    mutationKey: ["createUser"],
    mutationFn: createUser,
    onSuccess: (data) => {
      if (data.token) {
        setNavigating(true);
        localStorage.setItem("token", data.token);
        window.location.href = `user/${data.user_id}/`;
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation({
      username,
      password,
    });
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <PageHead title={"In-focus"} description={"Photography settings app"} />
      {!navigating && (
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
                Register
              </h1>
            </div>

            <p style={sharedStyles.subtitle}>
              Enter desired username and password
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ ...sharedStyles.form, maxWidth: "400px" }}
              autoComplete="on"
            >
              <input
                type="text"
                name="username"
                minLength={5}
                maxLength={25}
                autoComplete="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={sharedStyles.input}
                disabled={loading}
                required
              />
              <input
                type="text"
                name="password"
                minLength={5}
                maxLength={25}
                autoComplete="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={sharedStyles.input}
                disabled={loading}
                required
              />
              <button
                type="submit"
                style={{
                  ...sharedStyles.button,
                  backgroundColor: loading
                    ? sharedStyles.grey
                    : sharedStyles.green,
                }}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
              {error && <p style={sharedStyles.error}>{error.message}</p>}
            </form>
            <div>
              <Link href="/">Home</Link>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
