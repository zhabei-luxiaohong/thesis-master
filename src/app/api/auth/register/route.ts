import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: '密码至少6位' }, { status: 400 });
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 });
    const id = uuidv4();
    db.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)').run(id, name, email, hashPassword(password));
    return NextResponse.json({ token: generateToken(id), user: { id, name, email } });
  } catch (err: any) { return NextResponse.json({ error: '注册失败: ' + err.message }, { status: 500 }); }
}