import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';
import { User } from '../../../types';

type LoginPayload = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    const { username, password } = payload;

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
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
      return new NextResponse(null, { status: 401 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
