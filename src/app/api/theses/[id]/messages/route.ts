import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const thesis = db.prepare('SELECT id FROM theses WHERE id = ? AND user_id = ?').get(id, userId);
  if (!thesis) return NextResponse.json({ error: '论文不存在' }, { status: 404 });
  return NextResponse.json({ messages: db.prepare('SELECT * FROM messages WHERE thesis_id = ? ORDER BY created_at ASC').all(id) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const thesis = db.prepare('SELECT * FROM theses WHERE id = ? AND user_id = ?').get(id, userId) as any;
  if (!thesis) return NextResponse.json({ error: '论文不存在' }, { status: 404 });
  try {
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
    const userMsgId = uuidv4();
    db.prepare('INSERT INTO messages (id, thesis_id, role, content) VALUES (?, ?, ?, ?)').run(userMsgId, id, 'user', content);
    const recentMessages = db.prepare('SELECT role, content FROM messages WHERE thesis_id = ? ORDER BY created_at DESC LIMIT 10').all(id).reverse();
    const aiResponse = await generateAIResponse(thesis.title, recentMessages);
    const aiMsgId = uuidv4();
    db.prepare('INSERT INTO messages (id, thesis_id, role, content) VALUES (?, ?, ?, ?)').run(aiMsgId, id, 'assistant', aiResponse);
    db.prepare("UPDATE theses SET updated_at = datetime('now') WHERE id = ?").run(id);
    return NextResponse.json({ userMessage: { id: userMsgId, thesis_id: id, role: 'user', content }, aiMessage: { id: aiMsgId, thesis_id: id, role: 'assistant', content: aiResponse } });
  } catch (err: any) { return NextResponse.json({ error: '发送失败: ' + err.message }, { status: 500 }); }
}

async function generateAIResponse(thesisTitle: string, messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return 'OpenAI API Key 未配置。请设置环境变量 OPENAI_API_KEY。\n\n不过我已经收到你的消息了，等 API 配置好之后我就能正常回复。';
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey });
    const resp = await openai.chat.completions.create({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: `你是 Thesis Master AI 写作助手。请用中文回复，提供专业学术写作建议。` }, ...messages.map((m: any) => ({ role: m.role, content: m.content }))], max_tokens: 2000, temperature: 0.7 });
    return resp.choices[0].message.content || '抱歉，AI 未能生成回复。';
  } catch (err: any) { return `AI 回复生成失败: ${err.message}`; }
}