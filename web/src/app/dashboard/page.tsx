'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, Clock, CheckCircle, AlertCircle, ChevronRight, Search } from 'lucide-react';

const API_BASE = '/api';

interface Thesis {
  id: string; title: string; type: string; status: string; updated_at: string;
  chapter_count: number; completed_chapters: number;
}

const statusIcons: Record<string, React.ReactNode> = {
  draft: <AlertCircle className="w-4 h-4 text-yellow-400" />,
  in_progress: <Clock className="w-4 h-4 text-blue-400" />,
  completed: <CheckCircle className="w-4 h-4 text-green-400" />,
};
const statusLabels: Record<string, string> = { draft: '草稿', in_progress: '写作中', completed: '已完成' };

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function DashboardPage() {
  const router = useRouter();
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTheses = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/theses`, { headers: getAuthHeaders() });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (res.ok) setTheses(data.theses); else setError(data.error);
    } catch { setError('加载失败，请检查网络'); } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchTheses(); }, [fetchTheses]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/theses`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify({ title: '新论文', type: 'MBA' }) });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (res.ok) router.push(`/thesis/${data.thesis.id}`);
    } catch {} finally { setCreating(false); }
  };

  const filtered = theses.filter((t) => !search || t.title.includes(search));

  if (loading) return <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center"><div className="text-gray-400">加载中...</div></div>;

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold text-white">我的论文</h1><p className="text-gray-400 mt-1">管理你的论文项目，开始AI辅助写作</p></div>
          <button onClick={handleCreate} disabled={creating} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"><Plus className="w-5 h-5" />{creating ? '创建中...' : '新建论文'}</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: '全部论文', value: theses.length, color: 'from-blue-500/20 to-blue-500/5' },
            { label: '写作中', value: theses.filter(t => t.status === 'in_progress').length, color: 'from-purple-500/20 to-purple-500/5' },
            { label: '已完成', value: theses.filter(t => t.status === 'completed').length, color: 'from-green-500/20 to-green-500/5' },
            { label: '总章节', value: theses.reduce((s, t) => s + (t.chapter_count || 0), 0), color: 'from-orange-500/20 to-orange-500/5' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} border border-white/10 p-5`}><div className="text-3xl font-bold text-white">{stat.value}</div><div className="text-gray-400 text-sm mt-1">{stat.label}</div></div>
          ))}
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input type="text" placeholder="搜索论文..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors" />
        </div>
        {error && <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
        <div className="space-y-4">
          {filtered.map((thesis) => {
            const progress = thesis.chapter_count > 0 ? Math.round((thesis.completed_chapters / thesis.chapter_count) * 100) : 0;
            return (
              <Link key={thesis.id} href={`/thesis/${thesis.id}`} className="block group">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:border-blue-500/50 hover:bg-white/[0.07] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium">{thesis.type}</span>
                        <span className={`inline-flex items-center gap-1 text-xs ${thesis.status === 'completed' ? 'text-green-400' : thesis.status === 'in_progress' ? 'text-blue-400' : 'text-yellow-400'}`}>{statusIcons[thesis.status]}{statusLabels[thesis.status] || thesis.status}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">{thesis.title}</h3>
                      <p className="text-gray-500 text-sm mt-2">{thesis.chapter_count || 0} 章节 · 更新于 {thesis.updated_at?.split(' ')[0] || '-'}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-2" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1.5"><span className="text-gray-500">完成度</span><span className="text-gray-400">{progress}%</span></div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} style={{ width: `${progress}%` }} /></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {filtered.length === 0 && !loading && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">还没有论文</h3>
            <p className="text-gray-500 mb-6">创建你的第一篇AI辅助论文</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium"><Plus className="w-5 h-5" />开始写作</button>
          </div>
        )}
      </div>
    </div>
  );
}
