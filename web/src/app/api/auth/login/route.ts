import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 });
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?').get(email) as any;
    if (!user || !verifyPassword(password, user.password_hash)) return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    return NextResponse.json({ token: generateToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch (err: any) { return NextResponse.json({ error: '登录失败: ' + err.message }, { status: 500 }); }
}