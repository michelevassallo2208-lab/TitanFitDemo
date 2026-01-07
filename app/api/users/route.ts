import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { Role, User } from '../../../types';

const parseJson = async <T>(request: Request): Promise<T> => {
  const body = await request.json();
  return body as T;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const hasAdmin = url.searchParams.get('hasAdmin');

    if (hasAdmin) {
      const rows = await sql`
        select exists(select 1 from users where role = ${Role.ADMIN}) as "exists"
      ` as { exists: boolean }[];
      return NextResponse.json({ hasAdmin: rows[0]?.exists ?? false });
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
        where id = ${id}
      ` as User[];
      return NextResponse.json(rows[0] ?? null);
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
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJson<User>(request);
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
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await parseJson<User>(request);
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
      delete from users where id = ${id}
    `;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
