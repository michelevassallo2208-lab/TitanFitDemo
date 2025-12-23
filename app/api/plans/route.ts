import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { WorkoutPlan } from '../../../types';

const parseJson = async <T>(request: Request): Promise<T> => {
  const body = await request.json();
  return body as T;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      const rows = await sql`
        select
          id,
          name,
          description,
          days,
          created_at as "createdAt"
        from plans
        where id = ${id}
      ` as WorkoutPlan[];
      return NextResponse.json(rows[0] ?? null);
    }

    const rows = await sql`
      select
        id,
        name,
        description,
        days,
        created_at as "createdAt"
      from plans
      order by created_at desc
    ` as WorkoutPlan[];
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJson<WorkoutPlan>(request);
    const rows = await sql`
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
    ` as WorkoutPlan[];
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await sql`
      delete from plans where id = ${id}
    `;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
