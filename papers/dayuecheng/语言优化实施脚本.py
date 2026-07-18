#!/usr/bin/env python3
"""
语言优化实施脚本
基于humanizer技能原理，进行去AI化语言优化
"""

import re
from collections import Counter

class AcademicHumanizer:
    """学术论文去AI化优化器"""
    
    def __init__(self):
        # AI高频词汇检测与替换表
        self.ai_patterns = {
            # 过度结构化表达
            'structure_overuse': {
                'patterns': [r'首先', r'其次', r'再次', r'最后', r'第一', r'第二', r'第三'],
                'replacements': {
                    '首先': ['首要的是', '从...角度来看', '首先需要明确的是'],
                    '其次': ['此外', '进一步而言', '其次需要关注的是'],
                    '再次': ['同时', '除此之外', '值得注意的是'],
                    '最后': ['总而言之', '综上所述', '最后需要强调的是'],
                    '第一': ['首要', '关键', '第一方面'],
                    '第二': ['其次', '第二方面', '进一步'],
                    '第三': ['再次', '第三方面', '此外还需要']
                }
            },
            
            # 学术短语堆砌
            'academic_phrases': {
                'patterns': [r'研究表明', r'研究发现', r'研究结果', r'结果表明', r'数据分析'],
                'replacements': {
                    '研究表明': ['已有证据显示', '现有研究证实', '相关文献普遍认为'],
                    '研究发现': ['观察结果显示', '实证证据表明', '数据分析揭示'],
                    '研究结果': ['分析结果', '实证发现', '研究结论'],
                    '结果表明': ['数据显示', '实证揭示', '统计检验表明'],
                    '数据分析': ['统计检验', '实证分析', '定量考察']
                }
            },
            
            # 连接词单调
            'connectors': {
                'patterns': [r'然而', r'因此', r'所以', r'并且', r'或者', r'而且'],
                'replacements': {
                    '然而': ['尽管如此', '不过', '然而需要指出的是'],
                    '因此': ['基于此', '由此可见', '据此可以认为'],
                    '所以': ['故而', '因而', '由此可以推断'],
                    '并且': ['同时', '此外', '进一步而言'],
                    '或者': ['抑或', '或是', '或选择'],
                    '而且': ['并且', '同时', '进一步而言']
                }
            },
            
            # 模式化表达
            'patterned_expressions': {
                'patterns': [r'本研究采用', r'通过...方法', r'使用...分析'],
                'replacements': {
                    '本研究采用': ['本文选择', '我们运用', '为探讨...问题，本文采取...方法'],
                    '通过...方法': ['借助...手段', '利用...方式', '基于...理论基础，采用...技术路线'],
                    '使用...分析': ['运用...探讨', '采用...考察', '借助...分析框架，系统考察...']
                }
            },
            
            # 过度修饰词汇
            'over_modification': {
                'patterns': [r'显著', r'深入', r'系统', r'全面', r'重要'],
                'replacements': {
                    '显著': ['明显', '突出', '显著性'],
                    '深入': ['深刻', '透彻', '深入分析'],
                    '系统': ['体系化', '系统性', '系统考察'],
                    '全面': ['全方位', '全面性', '全面考察'],
                    '重要': ['关键', '重要性', '重要意义']
                }
            }
        }
        
        # 段落结构优化参数
        self.paragraph_params = {
            'min_length': 80,  # 最小段落长度
            'max_length': 200, # 最大段落长度
            'ideal_length': 120 # 理想段落长度
        }
    
    def detect_ai_patterns(self, text):
        """检测AI写作模式"""
        results = {}
        
        for category, data in self.ai_patterns.items():
            total_count = 0
            details = []
            
            for pattern in data['patterns']:
                # 确保模式是完整的词边界
                if pattern.endswith('...'):
                    # 处理模糊匹配模式
                    base_pattern = pattern.replace('...', '.*?')
                    matches = re.findall(base_pattern, text)
                    count = len(matches)
                else:
                    # 精确匹配
                    word_boundary_pattern = r'\b' + pattern + r'\b'
                    matches = re.findall(word_boundary_pattern, text)
                    count = len(matches)
                
                if count > 0:
                    total_count += count
                    details.append({
                        'pattern': pattern,
                        'count': count,
                        'locations': self.get_locations(pattern, text, 3)
                    })
            
            results[category] = {
                'total_count': total_count,
                'details': details,
                'score': self.calculate_pattern_score(total_count, len(text))
            }
        
        return results
    
    def get_locations(self, pattern, text, max_locations=3):
        """获取模式出现位置"""
        locations = []
        if pattern.endswith('...'):
            base_pattern = pattern.replace('...', '.*?')
            for match in re.finditer(base_pattern, text):
                locations.append(match.start())
                if len(locations) >= max_locations:
                    break
        else:
            word_boundary_pattern = r'\b' + pattern + r'\b'
            for match in re.finditer(word_boundary_pattern, text):
                locations.append(match.start())
                if len(locations) >= max_locations:
                    break
        return locations
    
    def calculate_pattern_score(self, count, text_length):
        """计算模式使用评分"""
        frequency_per_thousand = count / (text_length / 1000)
        
        if frequency_per_thousand > 5:
            return 4  # 严重AI痕迹
        elif frequency_per_thousand > 3:
            return 3  # 明显AI痕迹
        elif frequency_per_thousand > 1:
            return 2  # 轻微AI痕迹
        else:
            return 1  # 正常范围
    
    def optimize_text(self, text, aggressive=False):
        """优化文本，去除AI痕迹"""
        optimized_text = text
        
        # 第一阶段：替换高频AI词汇
        for category, data in self.ai_patterns.items():
            for original, replacements in data['replacements'].items():
                if original.endswith('...'):
                    # 模糊匹配模式，记录但暂不替换
                    continue
                
                # 创建正则表达式模式，确保匹配完整词语
                pattern = r'\b' + re.escape(original) + r'\b'
                
                # 选择替换词
                if aggressive:
                    replacement = replacements[1] if len(replacements) > 1 else replacements[0]
                else:
                    replacement = replacements[0]
                
                # 执行替换
                optimized_text = re.sub(pattern, replacement, optimized_text)
        
        # 第二阶段：优化段落结构
        optimized_text = self.optimize_paragraphs(optimized_text)
        
        # 第三阶段：增强个人声音（如果激进模式）
        if aggressive:
            optimized_text = self.add_personal_voice(optimized_text)
        
        return optimized_text
    
    def optimize_paragraphs(self, text):
        """优化段落结构"""
        paragraphs = text.split('\n\n')
        optimized_paragraphs = []
        
        for i, para in enumerate(paragraphs):
            para = para.strip()
            if not para:
                continue
            
            # 检查段落长度
            char_count = len(para)
            
            if char_count < self.paragraph_params['min_length']:
                # 短段落：尝试与下段合并或优化
                if i < len(paragraphs) - 1:
                    next_para = paragraphs[i + 1].strip()
                    if len(next_para) < 150:  # 下一段也不长
                        merged_para = para + " " + next_para
                        if len(merged_para) <= self.paragraph_params['ideal_length']:
                            optimized_paragraphs.append(merged_para)
                            paragraphs[i + 1] = ""  # 标记已合并
                            continue
            
            elif char_count > self.paragraph_params['max_length']:
                # 长段落：尝试拆分
                split_points = self.find_split_points(para)
                if split_points:
                    split_paras = self.split_paragraph(para, split_points[0])
                    for split_para in split_paras:
                        if split_para.strip():
                            optimized_paragraphs.append(split_para.strip())
                else:
                    optimized_paragraphs.append(para)
            else:
                optimized_paragraphs.append(para)
        
        return '\n\n'.join(optimized_paragraphs)
    
    def find_split_points(self, text):
        """找到合适的分段点"""
        split_points = []
        
        # 寻找句子结束点
        sentence_endings = ['. ', '。', '！', '!', '；', ';']
        for i in range(len(text)):
            for ending in sentence_endings:
                if text[i:i+len(ending)] == ending and i > 50:
                    # 确保不在专业术语中间
                    if i > 0 and text[i-1].isalnum():
                        split_points.append(i + len(ending))
        
        # 寻找逻辑转折点
        logical_markers = ['此外', '同时', '进一步', '值得注意的是']
        for marker in logical_markers:
            pos = text.find(marker)
            if pos != -1 and pos > 50:
                split_points.append(pos)
        
        return sorted(split_points)
    
    def split_paragraph(self, text, split_point):
        """拆分段落"""
        part1 = text[:split_point].strip()
        part2 = text[split_point:].strip()
        
        # 确保拆分后两部分都有合理长度
        if len(part1) > 50 and len(part2) > 50:
            return [part1, part2]
        else:
            return [text]
    
    def add_personal_voice(self, text):
        """增强个人声音"""
        # 在适当位置添加个人观点表达
        personal_expressions = [
            "基于我的分析，",
            "我认为，",
            "从本研究视角看，",
            "本文的观点是，",
            "我们的研究发现，"
        ]
        
        optimized_text = text
        
        # 在结论段落前添加个人声音
        conclusion_markers = ['综上所述', '总而言之', '总结而言']
        for marker in conclusion_markers:
            pattern = r'\b' + marker + r'\b'
            replacement = f"基于以上分析，{marker}"
            optimized_text = re.sub(pattern, replacement, optimized_text, count=1)
        
        return optimized_text
    
    def analyze_text_quality(self, text):
        """分析文本质量"""
        # 计算词汇丰富度
        words = re.findall(r'\b\w+\b', text)
        unique_words = set(words)
        vocabulary_richness = len(unique_words) / len(words) if words else 0
        
        # 计算句子多样性
        sentences = re.split(r'[。！!；;]', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        sentence_lengths = [len(s) for s in sentences]
        
        if sentence_lengths:
            avg_sentence_length = sum(sentence_lengths) / len(sentence_lengths)
            sentence_variance = sum((l - avg_sentence_length) ** 2 for l in sentence_lengths) / len(sentence_lengths)
        else:
            avg_sentence_length = 0
            sentence_variance = 0
        
        # 检测AI模式
        ai_results = self.detect_ai_patterns(text)
        ai_score = sum(result['score'] for result in ai_results.values()) / len(ai_results) if ai_results else 0
        
        return {
            'vocabulary_richness': vocabulary_richness,
            'avg_sentence_length': avg_sentence_length,
            'sentence_variance': sentence_variance,
            'ai_pattern_score': ai_score,
            'ai_pattern_details': ai_results,
            'sentence_count': len(sentences),
            'word_count': len(words),
            'unique_word_count': len(unique_words)
        }
    
    def generate_optimization_report(self, original_text, optimized_text):
        """生成优化报告"""
        original_analysis = self.analyze_text_quality(original_text)
        optimized_analysis = self.analyze_text_quality(optimized_text)
        
        report = "# 语言优化报告\n\n"
        report += "## 优化前后对比\n\n"
        
        # 质量指标对比
        report += "### 质量指标对比\n\n"
        report += "| 指标 | 优化前 | 优化后 | 变化 |\n"
        report += "|------|--------|--------|------|\n"
        
        metrics = [
            ("词汇丰富度", original_analysis['vocabulary_richness'], optimized_analysis['vocabulary_richness']),
            ("平均句长", original_analysis['avg_sentence_length'], optimized_analysis['avg_sentence_length']),
            ("句子变化度", original_analysis['sentence_variance'], optimized_analysis['sentence_variance']),
            ("AI痕迹评分", original_analysis['ai_pattern_score'], optimized_analysis['ai_pattern_score'])
        ]
        
        for name, orig, opt in metrics:
            change = opt - orig
            change_str = f"+{change:.3f}" if change > 0 else f"{change:.3f}"
            report += f"| {name} | {orig:.3f} | {opt:.3f} | {change_str} |\n"
        
        report += "\n## AI模式检测结果\n\n"
        
        # AI模式检测
        for category, details in original_analysis['ai_pattern_details'].items():
            report += f"### {category}\n\n"
            report += f"- 优化前出现次数: {details['total_count']}\n"
            
            # 优化后次数
            opt_count = optimized_analysis['ai_pattern_details'][category]['total_count']
            reduction = details['total_count'] - opt_count
            reduction_rate = reduction / details['total_count'] * 100 if details['total_count'] > 0 else 0
            
            report += f"- 优化后出现次数: {opt_count}\n"
            report += f"- 减少次数: {reduction}\n"
            report += f"- 减少比例: {reduction_rate:.1f}%\n\n"
            
            if details['details']:
                report += "  高频模式:\n"
                for detail in details['details'][:3]:  # 只显示前3个
                    report += f"  - `{detail['pattern']}`: {detail['count']}次\n"
                report += "\n"
        
        return report

def main():
    """主函数"""
    humanizer = AcademicHumanizer()
    
    # 测试示例
    sample_text = """
    本研究采用案例分析法。研究表明，REITs对房企有积极影响。
    研究发现，财务指标明显改善。数据分析显示，资产负债率下降。
    结果表明，融资成本降低。综上所述，REITs有效缓解财务困境。
    首先，REITs改善融资结构。其次，REITs优化现金流。再次，REITs提升企业价值。
    然而，这些影响需要时间验证。因此，需要进一步研究。并且，需要注意风险控制。
    """
    
    print("=== 原始文本分析 ===\n")
    analysis = humanizer.analyze_text_quality(sample_text)
    print(f"词汇丰富度: {analysis['vocabulary_richness']:.3f}")
    print(f"平均句长: {analysis['avg_sentence_length']:.1f}")
    print(f"AI痕迹评分: {analysis['ai_pattern_score']:.1f}/4.0")
    
    print("\n=== AI模式检测 ===\n")
    ai_results = analysis['ai_pattern_details']
    for category, details in ai_results.items():
        print(f"{category}: {details['total_count']}次")
    
    print("\n=== 优化后文本 ===\n")
    optimized = humanizer.optimize_text(sample_text, aggressive=True)
    print(optimized)
    
    print("\n=== 优化报告 ===\n")
    report = humanizer.generate_optimization_report(sample_text, optimized)
    print(report)

if __name__ == "__main__":
    main()