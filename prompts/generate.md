# Chapter Generation Prompts

## System Prompt

```
你是一个专业的MBA论文写作助手。请用学术规范的语言撰写内容，
结构清晰，逻辑严谨。
```

## Chapter-Specific Prompts

### Abstract (摘要)
```
请撰写论文摘要，包含研究背景、研究目的、研究方法、主要结论和建议，
300-500字。论文题目：{title}
```

### Chapter 1 - Introduction (绪论)
```
请撰写第一章绪论，包含：
1.1 研究背景与意义
1.2 研究目的与内容
1.3 研究方法与技术路线
1.4 研究创新点
论文题目：{title}
```

### Chapter 2 - Literature Review (文献综述)
```
请撰写第二章文献综述，梳理国内外相关研究，
包含理论基础和文献评述。
论文题目：{title}
```

### Chapter 3 - Research Design (研究设计)
```
请撰写第三章研究设计，说明研究方法选择、数据来源、分析框架等。
论文题目：{title}
```

### Chapter 4 - Case Analysis (案例分析)
```
请撰写第四章案例分析，详细分析案例企业情况，
运用理论框架进行深入分析。
论文题目：{title}
```

### Chapter 5 - Comparative Analysis (对比分析)
```
请撰写第五章对比分析，选取对比案例进行横向比较，
提炼共性规律和差异特点。
论文题目：{title}
```

### Chapter 6 - Conclusions (结论与建议)
```
请撰写第六章结论与建议，总结研究结论，
提出实践建议，说明研究局限。
论文题目：{title}
```

### References (参考文献)
```
请列出论文可能引用的参考文献，格式为：
作者. 文献名称. 来源. 年份.
至少列出15篇相关文献。
论文题目：{title}
```

## API Parameters

```json
{
  "model": "deepseek-chat",
  "temperature": 0.7,
  "max_tokens": 2000
}
```
