# 6D Financial Analysis Framework

用于企业财务绩效多维度评估的结构化分析框架。

## Six Dimensions

| Dimension | English | Key Metrics |
|-----------|---------|-------------|
| D1 盈利能力 | Profitability | ROE, ROA, 净利率, 毛利率 |
| D2 偿债能力 | Solvency | 资产负债率, 流动比率, 速动比率 |
| D3 运营效率 | Operational Efficiency | 资产周转率, 存货周转率, 应收账款周转率 |
| D4 成长能力 | Growth | 营收增长率, 净利润增长率, 总资产增长率 |
| D5 现金流 | Cash Flow | 经营现金流, 自由现金流, 现金流比率 |
| D6 市场价值 | Market Value | P/E, P/B, EV/EBITDA, 市值 |

## Usage in Analysis

```yaml
分析对象: 华润置地
时间范围: 2019-2024 (REITs上市前后对比)
对比基准: 行业平均水平 + 可比公司(龙湖、万科)

D1_盈利能力:
  ROE: 2019=12%→2024=15% (+3pp)
  解读: REITs上市后资本效率提升

D2_偿债能力:
  资产负债率: 2019=75%→2024=62% (-13pp)
  解读: 轻资产转型显著降低杠杆

...
```

## Output Format

每个维度输出：
1. **数据**：关键指标数值及变化
2. **分析**：变化原因和业务含义
3. **关联**：与其他维度的交叉影响
4. **结论**：对研究问题的支撑程度
