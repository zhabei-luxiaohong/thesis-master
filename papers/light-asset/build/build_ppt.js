const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "王江峰";
pres.title = "开题答辩";

const BG = "1a1a2e";
const W = "ffffff";
const R = "c0392b";
const G = "888899";
const CARD = "252540";
const mkShadow = () => ({ type: "outer", blur: 4, offset: 2, color: "000000", opacity: 0.3 });

function redBar(s, x, y, w, h) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: R } });
}

function card(s, x, y, w, h, accent) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: CARD }, shadow: mkShadow() });
  if (accent) s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.04, h, fill: { color: accent } });
}

// ===== S1: COVER =====
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addText("首都经济贸易大学  MBA学位论文开题答辩", {
    x: 0, y: 1.2, w: 10, h: 0.4, fontSize: 14, color: W, align: "center", fontFace: "Arial", margin: 0,
  });
  s.addText("REITs驱动的商业地产企业\n轻资产转型路径与效应研究", {
    x: 1, y: 1.9, w: 8, h: 1.2, fontSize: 34, color: W, bold: true, align: "center", fontFace: "Arial Black", margin: 0, lineSpacingMultiple: 1.3,
  });
  s.addText("王江峰  |  22025023138", {
    x: 0, y: 4.2, w: 10, h: 0.3, fontSize: 12, color: G, align: "center", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: 3.3, w: 3, h: 0.03, fill: { color: R } });
}

// ===== S2: FOUR NUMBERS =====
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addText("四组数字，一个问题", { x: 0.6, y: 0.3, w: 8.8, h: 0.6, fontSize: 28, color: W, bold: true, fontFace: "Arial Black", margin: 0 });

  const nums = [
    { v: "77.27%", l: "大悦城控股 资产负债率" },
    { v: "70.81%", l: "新城控股 资产负债率" },
    { v: "52.2%", l: "龙湖集团 净负债率" },
    { v: "14.2%", l: "华润置地 开发毛利率" },
  ];
  nums.forEach((n, i) => {
    const x = 0.5 + (i % 2) * 4.7;
    const y = 1.2 + Math.floor(i / 2) * 1.8;
    card(s, x, y, 4.3, 1.55);
    s.addText(n.v, { x: x + 0.3, y: y + 0.2, w: 3.7, h: 0.7, fontSize: 48, color: R, bold: true, fontFace: "Arial Black", margin: 0 });
    s.addText(n.l, { x: x + 0.3, y: y + 1.0, w: 3.7, h: 0.35, fontSize: 11, color: G, margin: 0 });
  });

  s.addText("各公司2025年年报 · 新城同比降2.28pp · 华润六年跌36个百分点", {
    x: 0.6, y: 5, w: 8.8, h: 0.25, fontSize: 8, color: G, margin: 0,
  });
}

// ===== S3: CHART =====
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addText("50.3% → 14.2%", { x: 0.6, y: 0.3, w: 8.8, h: 0.6, fontSize: 28, color: R, bold: true, fontFace: "Arial Black", margin: 0 });

  const chartData = [{
    name: "开发毛利率",
    labels: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"],
    values: [50.3, 30.2, 24.5, 22.2, 18.6, 14.2, 15.5],
  }];
  s.addChart(pres.charts.BAR, chartData, {
    x: 0.5, y: 1.1, w: 6.5, h: 3.5, barDir: "col",
    chartColors: [R],
    showValue: true, dataLabelColor: W, dataLabelFontSize: 10,
    catAxisLabelColor: G, valAxisLabelColor: G, valAxisLabelFontSize: 9, catAxisLabelFontSize: 9,
    catGridLine: { style: "none" }, valGridLine: { color: "333355", size: 0.5 },
    chartArea: { fill: { color: BG } },
    plotArea: { fill: { color: BG } },
    showLegend: false,
    valAxisMaxVal: 55,
  });

  s.addText([
    { text: "2020年末\n", options: { bold: true, fontSize: 12, color: W, breakLine: true } },
    { text: "投资性房地产 2,363亿元\n占总资产超30%\n\n", options: { fontSize: 10, color: G, breakLine: true } },
    { text: "\u201c资产沉淀 \u2192 负债攀升\n \u2192 盈利承压\u201d", options: { fontSize: 9, color: R, italic: true } },
  ], { x: 7.2, y: 1.3, w: 2.5, h: 3.0, margin: 0 });

  s.addText("华润置地年度报告（2019-2025）", { x: 0.6, y: 5, w: 8.8, h: 0.25, fontSize: 8, color: G, margin: 0 });
}

// ===== S4: TURNING POINT =====
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addText("转机正在发生", { x: 0.6, y: 0.3, w: 8.8, h: 0.6, fontSize: 28, color: W, bold: true, fontFace: "Arial Black", margin: 0 });

  const cards = [
    { n: "180.22亿", l1: "华润万象生活", l2: "2025年营收" },
    { n: "1,250亿", l1: "凯德集团", l2: "FUM（新元）" },
    { n: "51.8%", l1: "经常性利润占比", l2: "首次过半" },
  ];
  cards.forEach((c, i) => {
    const x = 0.5 + i * 3.1;
    card(s, x, 1.2, 2.9, 2.0);
    s.addText(c.n, { x: x + 0.2, y: 1.4, w: 2.5, h: 0.7, fontSize: 32, color: R, bold: true, fontFace: "Arial Black", margin: 0 });
    s.addText(c.l1, { x: x + 0.2, y: 2.15, w: 2.5, h: 0.3, fontSize: 10, color: W, margin: 0 });
    s.addText(c.l2, { x: x + 0.2, y: 2.45, w: 2.5, h: 0.25, fontSize: 9, color: G, margin: 0 });
  });

  card(s, 0.5, 3.5, 9.0, 1.2);
  s.addText([
    { text: "REITs 如何驱动企业完成这场转型？\n", options: { fontSize: 16, color: W, bold: true, breakLine: true } },
    { text: "路径 \u00b7 效应 \u00b7 条件 —— 三个维度，三家企业，一个答案", options: { fontSize: 10, color: R } },
  ], { x: 0.8, y: 3.7, w: 8.4, h: 0.8, margin: 0 });
}

// ===== S5: THREE CASES =====
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addText("三家企业，三条路径", { x: 0.6, y: 0.3, w: 8.8, h: 0.6, fontSize: 28, color: W, bold: true, fontFace: "Arial Black", margin: 0 });

  const cases = [
    { name: "华润置地 + 万象生活", role: "主案例", desc: "双平台\n商管分拆+REITs发行\n港交所 2020-2025", accent: R },
    { name: "凯德集团", role: "验证案例", desc: "私募基金+REITs\n资本闭环\n新交所 2020-2025", accent: "3498db" },
    { name: "苏宁易购", role: "反面案例", desc: "类REITs/ABS\n65% \u2192 91%\n深交所 2015-2023", accent: "e74c3c" },
  ];
  cases.forEach((cs, i) => {
    const x = 0.5 + i * 3.1;
    card(s, x, 1.2, 2.9, 2.8, cs.accent);
    s.addText(cs.name, { x: x + 0.3, y: 1.35, w: 2.3, h: 0.5, fontSize: 14, color: W, bold: true, fontFace: "Arial Black", margin: 0 });
    s.addText(cs.role, { x: x + 0.3, y: 1.8, w: 2.3, h: 0.25, fontSize: 10, color: cs.accent, bold: true, margin: 0 });
    s.addText(cs.desc, { x: x + 0.3, y: 2.2, w: 2.3, h: 1.5, fontSize: 10, color: G, margin: 0, lineSpacingMultiple: 1.4 });
  });

  s.addText("正向验证 + 反向证伪 + 跨国对比 = 完整证据链", {
    x: 0.6, y: 4.6, w: 8.8, h: 0.3, fontSize: 10, color: R, bold: true, margin: 0,
  });
}

// ===== S6: LITERATURE MAP =====
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addText("本文在坐标系中的位置", { x: 0.6, y: 0.3, w: 8.8, h: 0.6, fontSize: 28, color: W, bold: true, fontFace: "Arial Black", margin: 0 });

  // Matrix area
  const ox = 0.4, oy = 1.0, w = 2.5, h = 2.2;
  // Quadrants
  [{ f: "1e1e35" }, { f: "202040" }, { f: "1e1e35" }, { f: "202040" }].forEach((q, i) => {
    const c = i % 2, r = Math.floor(i / 2);
    s.addShape(pres.shapes.RECTANGLE, { x: ox + c*w, y: oy + r*h, w, h, fill: { color: q.f } });
  });
  // Axes
  s.addShape(pres.shapes.LINE, { x: ox + w, y: oy, w: 0, h: h*2, line: { color: "444466", width: 1 } });
  s.addShape(pres.shapes.LINE, { x: ox, y: oy + h, w: w*2, h: 0, line: { color: "444466", width: 1 } });
  // Labels
  s.addText("金融工具视角", { x: ox, y: oy - 0.2, w, h: 0.18, fontSize: 7, color: G, align: "center", margin: 0 });
  s.addText("企业战略转型视角", { x: ox + w, y: oy - 0.2, w, h: 0.18, fontSize: 7, color: R, bold: true, align: "center", margin: 0 });
  s.addText("多维度评估\n\n\u2191\n\n\n\u2193\n\n单一指标", { x: ox - 0.38, y: oy + 0.1, w: 0.28, h: h*2 - 0.2, fontSize: 6, color: R, bold: true, align: "center", margin: 0 });
  // Dots
  [
    [0.12,0.55],[0.22,0.7],[0.08,0.82],[0.55,0.6],[0.58,0.75],[0.48,0.85],
    [0.18,0.15],[0.25,0.28],[0.6,0.22],[0.72,0.5]
  ].forEach(([dx, dy]) => {
    s.addShape(pres.shapes.OVAL, { x: ox + dx*w*2, y: oy + dy*h*2, w: 0.14, h: 0.14, fill: { color: G } });
  });
  // Our paper
  s.addShape(pres.shapes.OVAL, { x: ox + 0.78*w*2, y: oy + 0.12*h*2, w: 0.28, h: 0.28, fill: { color: R } });
  s.addText("本文", { x: ox + 0.78*w*2, y: oy + 0.09*h*2, w: 0.28, h: 0.25, fontSize: 6, color: W, bold: true, align: "center", fontFace: "Arial Black", margin: 0 });

  // Right text
  card(s, 5.7, 1.0, 3.8, 3.2);
  s.addText([
    { text: "定位\n\n", options: { fontSize: 14, color: R, bold: true, breakLine: true } },
    { text: "视角：企业战略转型\n", options: { fontSize: 10, color: W, bold: true, breakLine: true } },
    { text: "超越金融工具视角\n\n", options: { fontSize: 9, color: G, breakLine: true } },
    { text: "深度：五维度系统评估\n", options: { fontSize: 10, color: W, bold: true, breakLine: true } },
    { text: "资产\u2192收入\u2192盈利\u2192现金流\u2192资本效率\n\n", options: { fontSize: 9, color: G, breakLine: true } },
    { text: "设计：三案例双向验证\n", options: { fontSize: 10, color: W, bold: true, breakLine: true } },
    { text: "华润+凯德+苏宁 正反对照", options: { fontSize: 9, color: G } },
  ], { x: 6.0, y: 1.2, w: 3.3, h: 2.8, margin: 0 });
}

// ===== S7: THREE GAPS =====
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addText("三个研究不足", { x: 0.6, y: 0.3, w: 8.8, h: 0.6, fontSize: 28, color: W, bold: true, fontFace: "Arial Black", margin: 0 });

  const gaps = [
    { n: "01", t: "交易结构 \u2192 出表效果 \u2192 转型效应：尚未整合",
      d: "Hardin/Wu · 原野/彭 · 王宇/马 —— 分属金融学、会计学、公司财务，未形成统一框架" },
    { n: "02", t: "转型评估停留在单一指标",
      d: "Sohn \u2192 ROE · Hardin \u2192 负债率 · 吴晓波 \u2192 盈利波动 —— 各从一个维度，缺少系统工具" },
    { n: "03", t: "正反案例双向验证缺失",
      d: "多单案例描述（万达/越秀/凯德），华润\u201c双平台\u201d首创实践文献空白" },
  ];
  gaps.forEach((g, i) => {
    const y = 1.2 + i * 1.35;
    card(s, 0.5, y, 9.0, 1.15, R);
    s.addText(g.n, { x: 0.85, y: y + 0.1, w: 0.4, h: 0.3, fontSize: 18, color: R, bold: true, fontFace: "Arial Black", margin: 0 });
    s.addText(g.t, { x: 1.4, y: y + 0.1, w: 7.8, h: 0.35, fontSize: 13, color: W, bold: true, margin: 0 });
    s.addText(g.d, { x: 1.4, y: y + 0.55, w: 7.8, h: 0.45, fontSize: 9, color: G, margin: 0 });
  });
}

// ===== S8: HYPOTHESES =====
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addText("五个研究假设", { x: 0.6, y: 0.3, w: 8.8, h: 0.6, fontSize: 28, color: W, bold: true, fontFace: "Arial Black", margin: 0 });

  const hyps = [
    "H\u2081\uff1aREITs发行 \u2192 经常性收入占比显著提高",
    "H\u2082\uff1a轻资产转型 \u2192 净负债率显著下降",
    "H\u2083\uff1a运营能力是转型成功的必要条件",
    "H\u2084\uff1a真实出售的效应 远大于 售后租回",
    "H\u2085\uff1a完整资本循环 \u2192 转型效应更持久",
  ];
  hyps.forEach((h, i) => {
    const y = 1.1 + i * 0.7;
    card(s, 0.5, y, 9.0, 0.55, R);
    s.addText("0" + (i+1), { x: 0.8, y: y + 0.08, w: 0.4, h: 0.35, fontSize: 14, color: R, bold: true, fontFace: "Arial Black", margin: 0 });
    s.addText(h, { x: 1.3, y: y + 0.08, w: 7.8, h: 0.35, fontSize: 13, color: W, margin: 0 });
  });

  s.addText("理论依据：Hardin & Wu (2010) · Sohn et al. (2013) · 原野、彭晓松 (2019) · 刘月龙 (2023)", {
    x: 0.6, y: 4.8, w: 8.8, h: 0.25, fontSize: 8, color: G, margin: 0,
  });
}

// ===== S9: FRAMEWORK =====
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addText("分析框架", { x: 0.6, y: 0.3, w: 8.8, h: 0.6, fontSize: 28, color: W, bold: true, fontFace: "Arial Black", margin: 0 });

  // Left: three layers
  const layers = [
    { t: "REITs驱动机制", d: "制度功能 \u00d7 企业战略需求" },
    { t: "路径选择", d: "华润双平台 vs 凯德资本闭环" },
    { t: "效应评估", d: "财务效应(5维) + 运营效应(3维)" },
  ];
  layers.forEach((l, i) => {
    const y = 1.2 + i * 1.15;
    card(s, 0.5, y, 4.5, 0.95, R);
    s.addText(l.t, { x: 0.8, y: y + 0.1, w: 1.6, h: 0.35, fontSize: 12, color: R, bold: true, fontFace: "Arial Black", margin: 0 });
    s.addText(l.d, { x: 2.5, y: y + 0.15, w: 2.3, h: 0.6, fontSize: 10, color: W, margin: 0 });
    if (i < 2) s.addText("\u2193", { x: 2.5, y: y + 0.78, w: 0.5, h: 0.25, fontSize: 14, color: R, bold: true, align: "center", margin: 0 });
  });

  // Right top: five dimensions
  card(s, 5.3, 1.2, 4.3, 2.0);
  s.addText("五维度财务穿透", { x: 5.6, y: 1.3, w: 3.7, h: 0.3, fontSize: 11, color: R, bold: true, margin: 0 });
  ["\u2460 资产轻量化","\u2461 收入结构","\u2462 盈利质量","\u2463 现金流","\u2464 资本效率"].forEach((d, i) => {
    s.addText(d, { x: 5.6, y: 1.75 + i*0.28, w: 3.7, h: 0.22, fontSize: 10, color: W, margin: 0 });
  });

  // Right bottom: five stages
  card(s, 5.3, 3.5, 4.3, 0.9);
  s.addText("五阶段转型路径", { x: 5.6, y: 3.6, w: 3.7, h: 0.3, fontSize: 11, color: R, bold: true, margin: 0 });
  s.addText("持有 \u2192 剥离 \u2192 平台 \u2192 REITs \u2192 循环", {
    x: 5.6, y: 4.0, w: 3.7, h: 0.3, fontSize: 10, color: W, bold: true, margin: 0,
  });

  s.addText("数据来源：年报 + REITs文件 + Wind/戴德梁行/彭博", { x: 0.6, y: 5, w: 8.8, h: 0.25, fontSize: 8, color: G, margin: 0 });
}

// ===== S10: INNOVATIONS =====
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addText("四个创新点", { x: 0.6, y: 0.3, w: 5, h: 0.6, fontSize: 28, color: W, bold: true, fontFace: "Arial Black", margin: 0 });

  const innov = [
    { n: "\u2460", t: "首次系统研究\u201c双平台模式\u201d", d: "华润\u201c商管分拆+REITs发行\u201d国内首创，文献空白" },
    { n: "\u2461", t: "构建五维度财务穿透框架", d: "超越ROE/负债率，资产\u2192收入\u2192盈利\u2192现金流\u2192资本效率" },
    { n: "\u2462", t: "引入反面案例双向验证", d: "苏宁\u201c出表不降杠杆\u201d \u2194 华润/凯德成功，正反对照" },
    { n: "\u2463", t: "跨国对比增强普适性", d: "华润(央企) \u2194 凯德(新加坡)，制度环境差异检验" },
  ];
  innov.forEach((iv, i) => {
    const y = 1.1 + i * 0.85;
    card(s, 0.5, y, 6.2, 0.7, R);
    s.addText(iv.n, { x: 0.8, y: y + 0.1, w: 0.35, h: 0.3, fontSize: 16, color: R, bold: true, fontFace: "Arial Black", margin: 0 });
    s.addText(iv.t, { x: 1.25, y: y + 0.08, w: 5.2, h: 0.3, fontSize: 12, color: W, bold: true, margin: 0 });
    s.addText(iv.d, { x: 1.25, y: y + 0.38, w: 5.2, h: 0.22, fontSize: 9, color: G, margin: 0 });
  });

  // Outline box
  card(s, 7.0, 1.1, 2.7, 2.5);
  s.addText("七章结构", { x: 7.3, y: 1.2, w: 2.1, h: 0.3, fontSize: 11, color: R, bold: true, margin: 0 });
  ["绪论","文献综述","研究设计","华润分析","凯德分析","苏宁反面","结论建议"].forEach((ch, i) => {
    s.addText(ch, { x: 7.3, y: 1.65 + i*0.27, w: 2.1, h: 0.22, fontSize: 9, color: G, margin: 0 });
  });

  // Timeline
  s.addText("2026.05-07 文献 \u2192 08-09 资料 \u2192 10-11 华润 \u2192 11-12 凯德 \u2192 2027.01-02 初稿 \u2192 02-03 修改 \u2192 03-04 定稿", {
    x: 0.5, y: 4.6, w: 9.0, h: 0.3, fontSize: 9, color: G, margin: 0,
  });
}

// ===== S11: THANKS =====
{
  const s = pres.addSlide();
  s.background = { color: BG };
  s.addShape(pres.shapes.RECTANGLE, { x: 4.2, y: 2.0, w: 1.6, h: 0.03, fill: { color: R } });
  s.addText("感谢各位老师", { x: 0, y: 2.3, w: 10, h: 1, fontSize: 38, color: W, bold: true, align: "center", fontFace: "Arial Black", margin: 0 });
  s.addText("恳请批评指正", { x: 0, y: 3.3, w: 10, h: 0.5, fontSize: 14, color: G, align: "center", margin: 0 });
}

pres.writeFile({ fileName: "/Users/op/WorkBuddy/论文优化/开题答辩PPT.pptx" })
  .then(() => console.log("Done: 11 slides"))
  .catch(err => console.error(err));
