import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/auth/guest — auto-create guest user and return token
export async function GET() {
  const db = getDb();
  const guestEmail = `guest_${Date.now()}@thesis.app`;

  const id = uuidv4();
  db.prepare(
    'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)'
  ).run(id, 'Guest', guestEmail, hashPassword(Math.random().toString(36)));

  const token = generateToken(id);

  return NextResponse.json({
    token,
    user: { id, name: 'Guest', email: guestEmail },
  });
}
