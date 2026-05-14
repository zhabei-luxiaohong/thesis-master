'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, Sparkles, FileText, Settings, ChevronRight, Plus, Menu, Loader2 } from 'lucide-react';

const API_BASE = '/api';

interface Chapter { id: string; title: string; status: string; sort_order: number; }
interface Message { id?: string; role: 'user' | 'assistant'; content: string; }

const statusDots: Record<string, string> = { completed: 'bg-green-400', in_progress: 'bg-blue-400', pending: 'bg-gray-600' };

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ThesisWorkspacePage() {
  const params = useParams(); const router = useRouter(); const thesisId = params.id as string;
  const [thesis, setThesis] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChapter, setActiveChapter] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/theses/${thesisId}`, { headers: getAuthHeaders() });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setThesis(data.thesis); setChapters(data.chapters || []);
      if (data.chapters?.length > 0) setActiveChapter(data.chapters[0].id);
    } catch { setError('加载失败'); } finally { setLoading(false); }
  }, [thesisId, router]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/theses/${thesisId}/messages`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok && data.messages) setMessages(data.messages);
    } catch {}
  }, [thesisId]);

  useEffect(() => { fetchData(); fetchMessages(); }, [fetchData, fetchMessages]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim(); setInput(''); setSending(true);
    setMessages((prev) => [...prev, { role: 'user', content }]);
    try {
      const res = await fetch(`${API_BASE}/theses/${thesisId}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify({ content }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.aiMessage?.content || ('发送失败: ' + (data.error || '未知错误')) }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: '网络错误，请重试' }]);
    } finally { setSending(false); }
  };

  if (loading) return <div className="h-screen bg-[#0a0e27] flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;
  if (error) return <div className="h-screen bg-[#0a0e27] flex items-center justify-center"><div className="text-center"><p className="text-red-400 mb-4">{error}</p><button onClick={() => router.push('/dashboard')} className="text-blue-400 hover:underline">返回仪表盘</button></div></div>;

  return (
    <div className="h-screen bg-[#0a0e27] flex overflow-hidden">
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-white/10 bg-[#0d1130] flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-white/10"><h2 className="text-lg font-semibold text-white mb-1">论文大纲</h2><p className="text-gray-500 text-xs truncate">{thesis?.title}</p></div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chapters.map((ch) => (
            <button key={ch.id} onClick={() => setActiveChapter(ch.id)} className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${activeChapter === ch.id ? 'bg-blue-500/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <div className={`w-2 h-2 rounded-full ${statusDots[ch.status] || 'bg-gray-600'}`} /><span className="text-sm truncate">{ch.title}</span>{activeChapter === ch.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/10"><button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"><Plus className="w-4 h-4" />添加章节</button></div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-white/10 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><span className="text-white font-bold text-xs">TM</span></div><div><div className="text-white text-sm font-medium truncate max-w-[200px]">{thesis?.title}</div><div className="text-gray-500 text-xs">AI 写作助手</div></div></div>
          <div className="ml-auto flex items-center gap-2"><button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"><FileText className="w-5 h-5" /></button><button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"><Settings className="w-5 h-5" /></button></div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (<div className="text-center py-16"><Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" /><h3 className="text-lg font-semibold text-white mb-2">开始你的论文写作</h3><p className="text-gray-500 text-sm max-w-md mx-auto">在下方输入你的需求，AI 助手将帮助你完成论文的每个章节。</p></div>)}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4 text-white" /></div>}
              <div className={`max-w-[70%] rounded-2xl px-5 py-3.5 ${msg.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-white/5 border border-white/10 text-gray-200'}`}><div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div></div>
              {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><span className="text-white text-xs font-bold">W</span></div>}
            </div>
          ))}
          {sending && (<div className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0"><Loader2 className="w-4 h-4 text-white animate-spin" /></div><div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-gray-400 text-sm">AI 正在思考...</div></div>)}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="输入你的写作需求，或让AI继续生成..." disabled={sending} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50" /></div>
            <button onClick={handleSend} disabled={!input.trim() || sending} className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all">{sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}</button>
          </div>
          <div className="flex gap-2 mt-3">
            {['继续写当前章节', '检查语法', '补充参考文献', '优化逻辑'].map((s) => (<button key={s} onClick={() => setInput(s)} disabled={sending} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/20 transition-colors disabled:opacity-50">{s}</button>))}
          </div>
        </div>
      </div>
    </div>
  );
}
