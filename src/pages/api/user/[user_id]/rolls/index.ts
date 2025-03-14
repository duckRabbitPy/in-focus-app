import { NextApiResponse } from 'next';
import { query, queryOne } from '@/utils/db';
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
  const { user_id } = req.query;

  // Verify that the requested user_id matches the authenticated user's ID
  if (user_id !== req.user?.userId) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  switch (req.method) {
    case 'GET':
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

    case 'POST':
      try {
        // Create a new roll with a default name
        const newRoll = await queryOne<Roll>(
          'INSERT INTO rolls (user_id, name) VALUES ($1, $2) RETURNING id, name, created_at, updated_at',
          [user_id, `Roll #${new Date().toLocaleDateString()}`]
        );

        if (!newRoll) {
          throw new Error('Failed to create roll');
        }

        return res.status(201).json(newRoll);
      } catch (error) {
        console.error('Error creating roll:', error);
        return res.status(500).json({ error: 'Failed to create roll' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
