import { jwtDecode } from 'jwt-decode';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  username: string;
  exp: number;
}

const isBrowser = typeof window !== 'undefined';

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

export function getAuthHeaders(): HeadersInit {
  if (!isBrowser) return {};
  
  const token = localStorage.getItem('token');
  if (!token) return {};

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchWithAuth(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If we get a 401, clear the token and redirect to home
  if (response.status === 401) {
    if (isBrowser) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  }

  return response;
}

export function logout() {
  if (!isBrowser) return;
  localStorage.removeItem('token');
  window.location.href = '/';
}

export function getUserIdFromToken(): string | null {
  try {
    if (!isBrowser) return null;
    
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = verifyToken(token);
    return decoded?.userId || null;
  } catch (error) {
    console.error('Error getting user ID from token:', error);
    return null;
  }
}

export function getUserFromToken(): { userId: string; username: string } | null {
  try {
    if (!isBrowser) return null;
    
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    return {
      userId: decoded.userId,
      username: decoded.username
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
} 