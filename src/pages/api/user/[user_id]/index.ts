import { NextApiResponse } from 'next';
import { query, DBUser } from '@/utils/db';
import { withAuth, AuthenticatedRequest } from '@/utils/middleware';

export default withAuth(async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id } = req.query;

  try {
    const users = await query<DBUser>('SELECT id, username FROM users WHERE id = $1', [user_id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id, username } = users[0];
    return res.status(200).json({ id, username });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}); 