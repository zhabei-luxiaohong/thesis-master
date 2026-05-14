import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const db = getDb();
  const theses = db.prepare("SELECT t.*, (SELECT COUNT(*) FROM chapters WHERE thesis_id = t.id) as chapter_count, (SELECT COUNT(*) FROM chapters WHERE thesis_id = t.id AND status = 'completed') as completed_chapters FROM theses t WHERE t.user_id = ? ORDER BY t.updated_at DESC").all(userId);
  return NextResponse.json({ theses });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });
  try {
    const { title, type } = await req.json();
    if (!title) return NextResponse.json({ error: '请输入论文标题' }, { status: 400 });
    const db = getDb();
    const thesisId = uuidv4();
    db.prepare('INSERT INTO theses (id, user_id, title, type, status) VALUES (?, ?, ?, ?, ?)').run(thesisId, userId, title, type || 'MBA', 'draft');
    const insertCh = db.prepare('INSERT INTO chapters (id, thesis_id, title, sort_order, status) VALUES (?, ?, ?, ?, ?)');
    ['摘要','第一章 绪论','第二章 文献综述','第三章 研究设计','第四章 实证分析','第五章 结论与建议'].forEach((ch, i) => insertCh.run(uuidv4(), thesisId, ch, i+1, 'pending'));
    return NextResponse.json({ thesis: db.prepare('SELECT * FROM theses WHERE id = ?').get(thesisId) });
  } catch (err: any) { return NextResponse.json({ error: '创建失败: ' + err.message }, { status: 500 }); }
}