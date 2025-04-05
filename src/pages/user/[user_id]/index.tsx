import { useRouter } from "next/router";

import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { logout } from "@/utils/auth";
import { geistSans, geistMono } from "@/styles/font";
import { PageHead } from "@/components/PageHead";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/requests/queries/user";
import { Breadcrumbs } from "@/components/BreadCrumbs";

function UserPage() {
  const router = useRouter();
  const { user_id } = router.query;

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", user_id],
    queryFn: () => getUser({ user_id: user_id as string }),
    enabled: !!user_id,
  });

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
      <PageHead title="Account Home" description="User account home" />
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        <main style={sharedStyles.main}>
          <Breadcrumbs
            user_id={user_id as string}
            roll_id={undefined}
            photo_id={undefined}
            routes={{
              home: true,
            }}
          />
          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Account Home</h1>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                whiteSpace: "nowrap",
              }}
            >
              <Link href={`/user/${user_id}/rolls`}>
                <button style={sharedStyles.button}>View Rolls</button>
              </Link>
              <Link href={`/user/${user_id}/search`}>
                <button
                  style={{ ...sharedStyles.button, backgroundColor: "#3962b4" }}
                >
                  Search Photos
                </button>
              </Link>
              <button onClick={logout} style={sharedStyles.secondaryButton}>
                Logout
              </button>
            </div>
          </div>

          <div
            style={{
              ...sharedStyles.card,
              cursor: "default",
              width: "100%",
              maxWidth: "600px",
            }}
          >
            <h2
              style={{
                ...sharedStyles.subtitle,
                marginBottom: "1rem",
                fontSize: "1.2rem",
              }}
            >
              Account Information
            </h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ ...sharedStyles.subtitle, fontSize: "0.9rem" }}>
                  User ID
                </label>
                <p
                  style={{
                    margin: "0.5rem 0",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                >
                  {userData?.id}
                </p>
              </div>
              <div>
                <label style={{ ...sharedStyles.subtitle, fontSize: "0.9rem" }}>
                  Username
                </label>
                <p
                  style={{
                    margin: "0.5rem 0",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                >
                  {userData?.username}
                </p>
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
