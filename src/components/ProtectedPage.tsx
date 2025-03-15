import { useRouter } from "next/router";
import { useEffect, useState, ReactNode } from "react";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { geistSans, geistMono } from "@/styles/font";
import { PageHead } from "./PageHead";

interface ProtectedPageProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function ProtectedPage({
  children,
  title,
  description = "",
}: ProtectedPageProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        router.replace("/");
        return false;
      }
      setIsAuthenticated(true);
      return true;
    };

    // Check immediately
    checkAuth();
    setIsLoading(false);

    // Set up interval to check periodically
    const interval = setInterval(checkAuth, 1000);

    // Add storage event listener to catch token removal
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        checkAuth();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);

  if (isLoading || !isAuthenticated) {
    return null; // Prevent flash of content while checking auth or redirecting
  }

  return (
    <>
      <PageHead title={title} description={description} />
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        {children}
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
