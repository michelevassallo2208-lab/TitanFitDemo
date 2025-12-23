import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../server/db';
import { Role, User } from '../types';

const parseBody = <T>(req: VercelRequest): T => {
  if (!req.body) {
    return {} as T;
  }

  return typeof req.body === 'string' ? (JSON.parse(req.body) as T) : (req.body as T);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const { id, hasAdmin } = req.query;

      if (hasAdmin) {
        const rows = await sql`
          select exists(select 1 from users where role = ${Role.ADMIN}) as "exists"
        ` as { exists: boolean }[];
        return res.status(200).json({ hasAdmin: rows[0]?.exists ?? false });
      }

      if (id) {
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
          where id = ${String(id)}
        ` as User[];
        return res.status(200).json(rows[0] ?? null);
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
        order by full_name asc
      ` as User[];
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const payload = parseBody<User>(req);
      const rows = await sql`
        insert into users (id, username, password, full_name, role, assigned_plan_id, plan_history, goals)
        values (
          ${payload.id},
          ${payload.username},
          ${payload.password},
          ${payload.fullName},
          ${payload.role},
          ${payload.assignedPlanId ?? null},
          ${payload.planHistory ?? null},
          ${payload.goals ?? null}
        )
        on conflict (id) do update set
          username = excluded.username,
          password = excluded.password,
          full_name = excluded.full_name,
          role = excluded.role,
          assigned_plan_id = excluded.assigned_plan_id,
          plan_history = excluded.plan_history,
          goals = excluded.goals
        returning
          id,
          username,
          password,
          full_name as "fullName",
          role,
          assigned_plan_id as "assignedPlanId",
          plan_history as "planHistory",
          goals
      ` as User[];
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const payload = parseBody<User>(req);
      const rows = await sql`
        update users
        set
          username = ${payload.username},
          password = ${payload.password},
          full_name = ${payload.fullName},
          role = ${payload.role},
          assigned_plan_id = ${payload.assignedPlanId ?? null},
          plan_history = ${payload.planHistory ?? null},
          goals = ${payload.goals ?? null}
        where id = ${payload.id}
        returning
          id,
          username,
          password,
          full_name as "fullName",
          role,
          assigned_plan_id as "assignedPlanId",
          plan_history as "planHistory",
          goals
      ` as User[];
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing id' });
      }
      await sql`
        delete from users where id = ${String(id)}
      `;
      return res.status(204).send('');
    }

    res.setHeader('Allow', 'GET,POST,PUT,DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
