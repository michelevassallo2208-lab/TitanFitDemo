import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { Exercise } from '../../../types';

const parseJson = async <T>(request: Request): Promise<T> => {
  const body = await request.json();
  return body as T;
};

export async function GET() {
  try {
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
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJson<Exercise>(request);
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
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
