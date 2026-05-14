'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Clock, CheckCircle, AlertCircle, ChevronRight, Search, Filter } from 'lucide-react';

// Mock data
const mockTheses = [
  { id: '1', title: 'REITs轻资产运营模式对财务绩效的影响研究', type: 'MBA', status: 'in_progress', progress: 65, updatedAt: '2026-05-14', chapters: 6 },
  { id: '2', title: '数字化转型对传统零售企业的影响分析', type: 'MBA', status: 'draft', progress: 20, updatedAt: '2026-05-10', chapters: 2 },
  { id: '3', title: '绿色金融政策对企业融资行为的影响', type: 'Master', status: 'completed', progress: 100, updatedAt: '2026-04-28', chapters: 6 },
];

const statusIcons: Record<string, React.ReactNode> = {
  draft: <AlertCircle className="w-4 h-4 text-yellow-400" />,
  in_progress: <Clock className="w-4 h-4 text-blue-400" />,
  completed: <CheckCircle className="w-4 h-4 text-green-400" />,
};

const statusLabels: Record<string, string> = {
  draft: '草稿',
  in_progress: '写作中',
  completed: '已完成',
};

export default function DashboardPage() {
  const [theses] = useState(mockTheses);
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">我的论文</h1>
            <p className="text-gray-400 mt-1">管理你的论文项目，开始AI辅助写作</p>
          </div>
          <Link
            href="/thesis/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            新建论文
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: '全部论文', value: theses.length, color: 'from-blue-500/20 to-blue-500/5' },
            { label: '写作中', value: theses.filter(t => t.status === 'in_progress').length, color: 'from-purple-500/20 to-purple-500/5' },
            { label: '已完成', value: theses.filter(t => t.status === 'completed').length, color: 'from-green-500/20 to-green-500/5' },
            { label: '总章节', value: theses.reduce((s, t) => s + t.chapters, 0), color: 'from-orange-500/20 to-orange-500/5' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} border border-white/10 p-5`}>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="搜索论文..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Thesis List */}
        <div className="space-y-4">
          {theses.filter(t => !search || t.title.includes(search)).map((thesis) => (
            <Link
              key={thesis.id}
              href={`/thesis/${thesis.id}`}
              className="block group"
            >
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:border-blue-500/50 hover:bg-white/[0.07] transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium">
                        {thesis.type}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs ${thesis.status === 'completed' ? 'text-green-400' : thesis.status === 'in_progress' ? 'text-blue-400' : 'text-yellow-400'}`}>
                        {statusIcons[thesis.status]}
                        {statusLabels[thesis.status]}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {thesis.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-2">
                      {thesis.chapters} 章节 · 更新于 {thesis.updatedAt}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-2" />
                </div>
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-500">完成度</span>
                    <span className="text-gray-400">{thesis.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        thesis.progress === 100
                          ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                      style={{ width: `${thesis.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {theses.filter(t => !search || t.title.includes(search)).length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">还没有论文</h3>
            <p className="text-gray-500 mb-6">创建你的第一篇AI辅助论文</p>
            <Link
              href="/thesis/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium"
            >
              <Plus className="w-5 h-5" />
              开始写作
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
