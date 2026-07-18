# MBA 论文写作助手集成配置

## 系统架构

### 1. Academic Writing Assistant
- **访问地址**: http://localhost:3000
- **主要功能**:
  - 学术写作改进
  - 引用管理和格式化
  - 文献综述工具
  - 语法和格式检查

### 2. Scientific Agent Skills
- **部署路径**: `./scientific-agent-skills/`
- **核心技能**:
  - `scientific-writing`: 科学写作
  - `literature-review`: 文献综述
  - `citation-management`: 引用管理
  - `bgpt-paper-search`: 论文搜索
  - `paper-lookup`: 论文查找

### 3. MBA 论文写作专用技能
- **文件路径**: `.workbuddy/skills/MBA_Thesis_Writing.md`
- **定制功能**: REITs研究、商业分析、MBA论文格式规范

## 工作流程配置

### 第一阶段：选题与研究设计
1. **主题确认**: 使用 `bgpt-paper-search` 搜索相关文献
2. **开题报告**: 使用 `scientific-writing` 撰写开题报告
3. **文献综述**: 使用 `literature-review` 进行文献整理和分析

### 第二阶段：数据收集与分析
1. **数据获取**: 使用 `paper-lookup` 查找相关案例和数据
2. **财务分析**: 使用定制MBA技能进行REITs财务分析
3. **风险评估**: 集成风险评估工具

### 第三阶段：论文撰写
1. **章节撰写**: 使用 Academic Writing Assistant 逐章节撰写
2. **引用管理**: 使用 `citation-management` 管理参考文献
3. **格式检查**: 确保符合《MBA论文写作规范》

### 第四阶段：修改与完善
1. **语言润色**: 使用 Academic Writing Assistant 的语言改进工具
2. **逻辑检查**: 审查论文结构和论证逻辑
3. **最终定稿**: 完成格式规范和提交准备

## 快速启动指南

### 1. 启动 Academic Writing Assistant
```bash
cd academic-writing-assistant
PATH="/Users/op/.workbuddy/binaries/node/versions/22.12.0/bin:$PATH" /Users/op/.workbuddy/binaries/node/versions/22.12.0/bin/npm run dev
```
访问: http://localhost:3000

### 2. 使用 Scientific Agent Skills
技能已克隆到 `./scientific-agent-skills/`，可以通过以下方式激活：

**通过 WorkBuddy 使用**:
- 技能路径: `.workbuddy/skills/`
- 包含: MBA_Thesis_Writing.md

### 3. 常见任务提示词

#### 文献检索
```
使用 bgpt-paper-search 查找有关中国REITs市场发展的最新研究。
```

#### 写作改进
```
使用 Academic Writing Assistant 改进以下段落的学术表达：
[插入需要改进的段落]
```

#### 引用管理
```
使用 citation-management 将以下参考文献格式化为APA格式：
[插入参考文献信息]
```

#### 案例研究
```
使用 MBA 论文写作技能分析万科租赁住房REITs案例。
```

## 特定功能配置

### A. REITs研究模块
- **分析框架**: 5D分析法
- **数据来源**: 国内外REITs数据库
- **分析工具**: 财务指标计算器、风险评估模型

### B. 学术写作模块
- **支持格式**: APA, MLA, Chicago, Harvard
- **检查项**: 格式规范、引用准确性、学术语言
- **改进工具**: 语法检查、逻辑优化、语言润色

### C. 项目管理模块
- **进度追踪**: 论文完成度监控
- **任务管理**: 阶段性目标设置
- **时间规划**: 合理分配写作时间

## 数据管理

### 文件结构
```
mba_paper_project/
├── 1_开题报告/
├── 2_文献综述/
├── 3_研究方法/
├── 4_数据分析/
├── 5_结论建议/
└── 附录/
```

### 参考文献管理
- 使用 Zotero 或 Mendeley 配合 `citation-management`
- 定期更新文献库
- 导出格式正确的参考文献列表

## 质量保证

### 检查清单
- [ ] 格式符合《MBA论文写作规范》
- [ ] 引用完整且格式正确
- [ ] 数据和案例分析充分
- [ ] 逻辑结构清晰
- [ ] 语言表达专业

### 定期审查
- 每周进度审查
- 导师定期反馈整合
- 同行评审意见采纳

## 故障排除

### 常见问题
1. **Academic Writing Assistant 无法启动**
   - 检查 Node.js 版本: 需要 Node 22.12.0+
   - 确保依赖安装完成: `npm install`

2. **技能无法识别**
   - 确认技能放置在正确路径: `.workbuddy/skills/`
   - 检查技能文件格式: 必须是 `.md` 格式

3. **数据访问问题**
   - 确保相关数据库访问权限
   - 检查API密钥配置（如果需要）

### 支持资源
- Academic Writing Assistant: 项目文档
- Scientific Agent Skills: GitHub Wiki
- MBA写作技能: 本地技能文档

## 高级配置（可选）

### 自定义技能扩展
如需添加特定分析工具或数据源，可创建自定义技能文件：
```
.workbuddy/skills/custom_REITS_analysis.md
```

### 集成第三方工具
可配置集成：
- Zotero 引用管理
- Excel 数据分析
- Python 分析脚本

---

**配置完成时间**: 2026年4月13日
**配置版本**: 1.0
**适用场景**: MBA论文写作，特别是REITs研究方向
**维护者**: WorkBuddy AI 助手