import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const thesis = db.prepare('SELECT * FROM theses WHERE id = ? AND user_id = ?').get(id, userId) as any;
  if (!thesis) return NextResponse.json({ error: '论文不存在' }, { status: 404 });
  const chapters = db.prepare('SELECT * FROM chapters WHERE thesis_id = ? ORDER BY sort_order').all(id);
  return NextResponse.json({ thesis, chapters });
}