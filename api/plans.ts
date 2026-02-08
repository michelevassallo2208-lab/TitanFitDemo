import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../server/db';
import { WorkoutPlan } from '../types';

const parseBody = <T>(req: VercelRequest): T => {
  if (!req.body) {
    return {} as T;
  }

  return typeof req.body === 'string' ? (JSON.parse(req.body) as T) : (req.body as T);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const { id } = req.query;

      if (id) {
        const rows = await sql<WorkoutPlan[]>`
          select
            id,
            name,
            description,
            days,
            created_at as "createdAt"
          from plans
          where id = ${String(id)}
        `;
        return res.status(200).json(rows[0] ?? null);
      }

      const rows = await sql<WorkoutPlan[]>`
        select
          id,
          name,
          description,
          days,
          created_at as "createdAt"
        from plans
        order by created_at desc
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const payload = parseBody<WorkoutPlan>(req);
      const rows = await sql<WorkoutPlan[]>`
        insert into plans (id, name, description, days, created_at)
        values (
          ${payload.id},
          ${payload.name},
          ${payload.description},
          ${payload.days},
          ${payload.createdAt}
        )
        on conflict (id) do update set
          name = excluded.name,
          description = excluded.description,
          days = excluded.days,
          created_at = excluded.created_at
        returning
          id,
          name,
          description,
          days,
          created_at as "createdAt"
      `;
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }
      await sql`
        delete from plans where id = ${String(id)}
      `;
      return res.status(204).send('');
    }

    res.setHeader('Allow', 'GET,POST,DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
