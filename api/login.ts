import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../server/db';
import { User } from '../types';

const parseBody = <T>(req: VercelRequest): T => {
  if (!req.body) {
    return {} as T;
  }

  return typeof req.body === 'string' ? (JSON.parse(req.body) as T) : (req.body as T);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = parseBody<{ username?: string; password?: string }>(req);

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const rows = await sql`
      select
        id,
        username,
        password,
        full_name as "fullName",
        role,
        assigned_plan_id as "assignedPlanId",
        plan_history as "planHistory",
        goals
      from users
      where username = ${username} and password = ${password}
      limit 1
    ` as User[];

    if (rows.length === 0) {
      return res.status(401).json(null);
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
