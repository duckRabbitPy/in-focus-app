import { NextApiResponse } from 'next';
import { queryOne } from '@/utils/db';
import { withAuth, AuthenticatedRequest } from '@/utils/middleware';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.query;

    // Verify that the requested user_id matches the authenticated user's ID
    if (user_id !== req.user?.userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const user = await queryOne<{ id: string; username: string; password_hash: string }>(
      'SELECT id, username, password_hash FROM users WHERE id = $1',
      [user_id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't send the password hash back to the client
    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler); 