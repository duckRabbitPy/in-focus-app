import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key';
const isBrowser = typeof window !== 'undefined';

interface JWTPayload {
  userId: string;
  username: string;
  exp: number;
}

interface AuthProps {
  userId: string | null;
  username: string | null;
}

function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    
    // Validate the decoded token has the expected shape
    if (
      decoded &&
      'userId' in decoded &&
      'username' in decoded &&
      'exp' in decoded
    ) {
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        console.log('Token expired');
        return null;
      }
      
      return decoded;
    }
    
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P & AuthProps>) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
      if (!isBrowser) return;

      const checkAuth = () => {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found');
          router.replace('/');
          return false;
        }

        const decoded = verifyToken(token);
        if (!decoded) {
          localStorage.removeItem('token');
          router.replace('/');
          return false;
        }

        setUserId(decoded.userId);
        setUsername(decoded.username);
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
        if (e.key === 'token' && !e.newValue) {
          checkAuth();
        }
      };
      window.addEventListener('storage', handleStorageChange);

      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorageChange);
      };
    }, [router]);

    if (isLoading || !isAuthenticated) {
      return null; // Prevent flash of content while checking auth or redirecting
    }

    return <WrappedComponent {...props} userId={userId} username={username} />;
  };
} 