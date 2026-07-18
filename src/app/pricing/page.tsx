'use client';

import { useState } from 'react';
import { Check, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0',
    period: '/月',
    icon: Zap,
    color: 'from-gray-500 to-gray-400',
    features: [
      '1篇论文项目',
      '基础AI写作辅助',
      '3个章节生成/月',
      '标准论文模板',
      '社区支持',
    ],
    cta: '免费开始',
    popular: false,
  },
  {
    name: 'Pro',
    price: '29',
    period: '/月',
    icon: Sparkles,
    color: 'from-blue-500 to-purple-600',
    features: [
      '5篇论文项目',
      '高级AI写作辅助',
      '无限章节生成',
      '6D分析框架',
      '文献矩阵工具',
      '优先技术支持',
      '导出Word/PDF',
    ],
    cta: '升级 Pro',
    popular: true,
  },
  {
    name: 'VIP',
    price: '99',
    period: '/月',
    icon: Crown,
    color: 'from-amber-500 to-orange-600',
    features: [
      '无限论文项目',
      '顶级AI写作模型',
      '无限章节生成',
      '一对一导师指导',
      '查重 + 降重工具',
      '优先技术支持',
      '专属客服通道',
      '提前体验新功能',
    ],
    cta: '成为 VIP',
    popular: false,
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Hero */}
      <div className="relative py-20 text-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            选择适合你的<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">方案</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            从免费开始，随时升级到Pro或VIP获得更强大的AI写作能力
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span className={`text-sm ${!annual ? 'text-white' : 'text-gray-500'}`}>月付</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${annual ? 'translate-x-7' : 'translate-x-0.5'}`} />
        </button>
        <span className={`text-sm ${annual ? 'text-white' : 'text-gray-500'}`}>
          年付 <span className="text-green-400 text-xs">省20%</span>
        </span>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.popular
                  ? 'border-blue-500/50 bg-white/[0.07] ring-1 ring-blue-500/20'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium">
                    最受欢迎
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  ¥{annual ? Math.floor(Number(plan.price) * 0.8) : plan.price}
                </span>
                <span className="text-gray-500">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  plan.popular
                    ? `bg-gradient-to-r ${plan.color} text-white shadow-lg hover:opacity-90`
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="max-w-4xl mx-auto px-4 pb-20 text-center">
        <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-10">
          <h2 className="text-2xl font-bold text-white mb-3">需要定制方案？</h2>
          <p className="text-gray-400 mb-6">为团队或机构提供批量账号、专属模型、私有部署等定制服务</p>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
            联系销售 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
