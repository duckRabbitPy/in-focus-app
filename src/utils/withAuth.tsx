import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getUserFromToken } from "./auth";
import { Footer } from "@/components/Footer";

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const user = getUserFromToken();
      if (!user) {
        localStorage.removeItem("token");
        router.push("/");
        return;
      }

      setIsAuthenticated(true);
    }, [router]);

    if (!isAuthenticated) {
      return null;
    }

    return (
      <div>
        <WrappedComponent {...props} />
        <Footer />
      </div>
    );
  };
}
