'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, FileText, BookOpen, Settings, ChevronRight, Plus, Menu } from 'lucide-react';

const chapters = [
  { id: 'abstract', title: '摘要', status: 'completed' },
  { id: 'chapter1', title: '第一章 绪论', status: 'completed' },
  { id: 'chapter2', title: '第二章 文献综述', status: 'in_progress' },
  { id: 'chapter3', title: '第三章 研究设计', status: 'pending' },
  { id: 'chapter4', title: '第四章 案例分析', status: 'pending' },
  { id: 'chapter5', title: '第五章 对比分析', status: 'pending' },
  { id: 'chapter6', title: '第六章 结论与建议', status: 'pending' },
];

const statusColors: Record<string, string> = {
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  pending: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
};

const statusDots: Record<string, string> = {
  completed: 'bg-green-400',
  in_progress: 'bg-blue-400',
  pending: 'bg-gray-600',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const initialMessages: Message[] = [
  { role: 'assistant', content: '你好！我是 Thesis Master AI 写作助手。我正在帮你撰写《REITs轻资产运营模式对财务绩效的影响研究》。\n\n当前进度：第二章 文献综述。\n\n你可以：\n• 让我继续写当前章节\n• 修改已写内容\n• 提出研究问题让我分析\n• 上传数据让我帮你解读\n\n请告诉我你想做什么？' },
];

export default function ThesisWorkspacePage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChapter, setActiveChapter] = useState('chapter2');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        role: 'assistant',
        content: '好的，我来帮你完善这一部分。基于现有的文献梳理，我建议从以下三个维度展开文献综述：\n\n1. **REITs理论基础**：包括REITs的起源、发展历程及核心特征\n2. **轻资产运营模式**：梳理轻资产概念、分类及实施路径\n3. **财务绩效评价**：整理国内外财务绩效评估方法及指标体系\n\n需要我按照这个框架继续撰写吗？',
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1500);
  };

  return (
    <div className="h-screen bg-[#0a0e27] flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-white/10 bg-[#0d1130] flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white mb-1">论文大纲</h2>
          <p className="text-gray-500 text-xs">REITs轻资产运营模式对财务绩效的影响研究</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChapter(ch.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                activeChapter === ch.id
                  ? 'bg-blue-500/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${statusDots[ch.status]}`} />
              <span className="text-sm truncate">{ch.title}</span>
              {activeChapter === ch.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/10">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            添加章节
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-14 border-b border-white/10 flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">TM</span>
            </div>
            <div>
              <div className="text-white text-sm font-medium">Thesis Master</div>
              <div className="text-gray-500 text-xs">AI 写作助手</div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
              <FileText className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-5 py-3.5 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">W</span>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入你的写作需求，或让AI继续生成..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {['继续写当前章节', '检查语法', '补充参考文献', '优化逻辑'].map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/20 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
