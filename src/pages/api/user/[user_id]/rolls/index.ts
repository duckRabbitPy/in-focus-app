import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/utils/db';
import { withAuth, AuthenticatedRequest } from '@/utils/middleware';

interface Roll {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id } = req.query;

  // Verify that the requested user_id matches the authenticated user's ID
  if (user_id !== req.user?.userId) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  try {
    const rolls = await query<Roll>(
      'SELECT id, name, created_at, updated_at FROM rolls WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );

    if (rolls.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(rolls);
  } catch (error) {
    console.error('Error fetching rolls:', error);
    return res.status(500).json({ error: 'Failed to fetch rolls' });
  }
}

export default withAuth(handler);
