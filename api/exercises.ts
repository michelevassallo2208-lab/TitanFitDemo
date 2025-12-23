import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../server/db';
import { Exercise } from '../types';

const parseBody = <T>(req: VercelRequest): T => {
  if (!req.body) {
    return {} as T;
  }

  return typeof req.body === 'string' ? (JSON.parse(req.body) as T) : (req.body as T);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const rows = await sql`
        select
          id,
          name,
          muscle_group as "muscleGroup",
          video_url as "videoUrl",
          description,
          tips,
          is_custom as "isCustom"
        from exercises
        order by name asc
      ` as Exercise[];
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const payload = parseBody<Exercise>(req);
      const rows = await sql`
        insert into exercises (id, name, muscle_group, video_url, description, tips, is_custom)
        values (
          ${payload.id},
          ${payload.name},
          ${payload.muscleGroup},
          ${payload.videoUrl},
          ${payload.description},
          ${payload.tips},
          ${payload.isCustom ?? true}
        )
        returning
          id,
          name,
          muscle_group as "muscleGroup",
          video_url as "videoUrl",
          description,
          tips,
          is_custom as "isCustom"
      ` as Exercise[];
      return res.status(200).json(rows[0]);
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
