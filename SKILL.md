# Thesis Master Skill

> AI-powered academic writing assistant for MBA, Master, and PhD theses.
> A reusable Claude/Hermes skill that provides structured thesis planning,
> chapter generation, literature review, and methodology guidance.

## Quick Start

```yaml
# Activate the skill in any Claude/Hermes session:
# "Use thesis-master skill to help me plan my thesis"

研究命题: REITs轻资产运营模式对财务绩效的影响研究
论文用途: MBA学位论文
意向案例: 华润置地
时间约束: 截止2026-06-30，预留3周修改
```

## Core Capabilities

| Capability | Description |
|------------|-------------|
| **Thesis Planning** | AI generates structured 6-chapter outlines with research questions |
| **Chapter Generation** | Write each chapter with academic rigor and proper citations |
| **Literature Review** | Q1-Q4 quadrant matrix for systematic literature analysis |
| **Methodology Design** | Yin case study framework, evidence triangulation |
| **Data Analysis** | 6D analysis framework with multi-dimensional validation |
| **Quality Control** | Three-stage verification, dual data validation |

## Workflow

```
INPUT               PROCESSING              OUTPUT
─────               ──────────              ──────
Research Topic  →   Topic Validation    →   Feasibility Report
                →   Literature Search   →   Q1-Q4 Matrix
                →   Methodology Design  →   Research Framework
                →   Chapter Writing     →   6-Chapter Draft
                →   Quality Review      →   Final Paper
```

## Supported Thesis Types

- `mba` - MBA Thesis (case study focus)
- `master` - Master's Thesis
- `phd` - Doctoral Dissertation
- `academic` - Academic Paper

## Research Directions

- `finance` - Corporate Finance, Investment, REITs
- `strategy` - Strategic Management, Business Models
- `marketing` - Marketing Strategy, Consumer Behavior
- `hr` - Human Resources, Organizational Behavior
- `operations` - Operations Management, Supply Chain
- `innovation` - Innovation, Entrepreneurship, Digital Transformation

## Usage Examples

### 1. Generate a Thesis Plan

```
请帮我规划一篇MBA论文：
研究命题：REITs如何驱动商业地产企业实现轻资产转型？
意向案例：华润置地
```

### 2. Write a Chapter

```
请撰写第二章文献综述，梳理国内外REITs研究现状，
包含理论基础和文献评述。
```

### 3. Review Methodology

```
请评估我的研究设计：
- 方法：双案例对比分析
- 案例：万达（成功）vs 苏宁（失败）
- 数据：年报+访谈+行业报告
```

## Configuration

Set your DeepSeek API key:

```bash
export DEEPSEEK_API_KEY="sk-your-key-here"
```

## File Structure

```
thesis-master-skill/
├── SKILL.md              # Skill definition (this file)
├── prompts/
│   ├── plan.md           # Thesis planning prompt
│   ├── generate.md       # Chapter generation prompts
│   ├── chat.md           # Interactive writing assistant
│   └── mba-template.md   # Full MBA thesis workflow
├── frameworks/
│   ├── 6d-analysis.md    # 6D analysis framework
│   ├── q1q4-matrix.md    # Literature review matrix
│   └── yin-case-study.md # Case study methodology
└── README.md
```

## License

MIT - Free to use, modify, and distribute.
