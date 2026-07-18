const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat,
        TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageBreak, PageNumber } = require("docx");

// ============== 配置 ==============
const FONT_TITLE = "SimHei";    // 黑体
const FONT_BODY = "SimSun";     // 宋体
const FONT_HEADING = "SimHei";  // 黑体

// A4 尺寸 (DXA)
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = { top: 1440, right: 1440, bottom: 1440, left: 1800 }; // 左2.54cm, 其他2.54cm
const CONTENT_W = PAGE_W - MARGIN.left - MARGIN.right; // ~8266

// 表格边框
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ============== 工具函数 ==============
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 240 },
    children: [new TextRun({ text, font: FONT_HEADING, size: 36, bold: true })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text, font: FONT_HEADING, size: 30, bold: true })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: FONT_HEADING, size: 28, bold: true })],
  });
}

function heading4(text) {
  return new Paragraph({
    spacing: { before: 180, after: 120 },
    children: [new TextRun({ text, font: FONT_BODY, size: 24, bold: true })],
  });
}

function bodyText(text, indent = true) {
  return new Paragraph({
    spacing: { line: 360, after: 60 },
    indent: indent ? { firstLine: 480 } : {},
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: FONT_BODY, size: 24 })],
  });
}

function bodyTextNoIndent(text) {
  return bodyText(text, false);
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 120 }, children: [] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// 简单表格：header是表头行，rows是数据行，colWidths是列宽数组
function simpleTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: "D9E2F3", type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      verticalAlign: "center",
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: String(h), font: FONT_BODY, size: 20, bold: true })],
      })],
    })),
  });

  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      margins: { top: 40, bottom: 40, left: 80, right: 80 },
      verticalAlign: "center",
      children: [new Paragraph({
        alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
        spacing: { before: 20, after: 20 },
        children: [new TextRun({ text: String(cell), font: FONT_BODY, size: 20 })],
      })],
    })),
  }));

  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  });
}

function refItem(text) {
  return new Paragraph({
    spacing: { line: 320, after: 40 },
    children: [new TextRun({ text, font: FONT_BODY, size: 21 })],
  });
}

function listItem(text) {
  return new Paragraph({
    spacing: { line: 340, after: 40 },
    indent: { left: 480, hanging: 240 },
    children: [new TextRun({ text: "- " + text, font: FONT_BODY, size: 24 })],
  });
}

// ============== 封面 ==============
function coverPage() {
  return [
    emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "MBA学位论文", font: FONT_HEADING, size: 44, bold: true })],
    }),
    emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: "REITs对受困房企的变革效应研究", font: FONT_HEADING, size: 40, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "\u2014\u2014以大悦城为例", font: FONT_HEADING, size: 36 })],
    }),
    emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "申请人：江峰", font: FONT_BODY, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "研究方向：房地产金融与资产证券化", font: FONT_BODY, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: "指导教师：（待填写）", font: FONT_BODY, size: 28 })],
    }),
    emptyLine(), emptyLine(), emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "2026年4月", font: FONT_BODY, size: 28 })],
    }),
    pageBreak(),
  ];
}

// ============== 目录页 ==============
function tocPage() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 360 },
      children: [new TextRun({ text: "目  录", font: FONT_HEADING, size: 36, bold: true })],
    }),
    new TableOfContents("目录", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    pageBreak(),
  ];
}

// ============== 论文各章内容 ==============

// 第一章
function chapter1() {
  const content = [];
  content.push(heading1("第一章 绪论"));

  content.push(heading2("1.1 研究背景与意义"));
  content.push(heading3("1.1.1 宏观背景"));

  content.push(heading4("（1）房地产行业深度调整"));
  content.push(bodyText("进入21世纪20年代中后期，中国房地产行业经历了从\u201c黄金时代\u201d向\u201c白银时代\u201d的深刻转变。伴随\u201c房住不炒\u201d政策的持续深化、人口结构变化以及经济转型压力，传统房地产开发模式面临严峻挑战。"));
  content.push(bodyText("2024年，全国商品房销售面积同比下降8.7%，房地产投资增速放缓至2.1%，房企利润空间持续收窄（国家统计局，2025）。在此背景下，房企亟需寻找新的增长路径和转型方向。"));

  content.push(heading4("（2）REITs市场快速发展"));
  content.push(bodyText("2020年4月，中国证监会、国家发展改革委联合发布《关于推进基础设施领域不动产投资信托基金（REITs）试点相关工作的通知》，标志着中国公募REITs市场正式启动。2024年，消费基础设施被纳入REITs试点范围，为商业地产企业提供了资产证券化的新通道。"));
  content.push(bodyText("截至2024年底，中国公募REITs市场总规模已达1661.64亿元，其中消费基础设施REITs成为市场新宠（中国证监会，2025）。"));

  content.push(heading4("（3）房企财务困境加剧"));
  content.push(bodyText("在行业调整期，部分房企面临严重的财务压力。2024年，大悦城控股集团股份有限公司发布年度报告显示，公司实现营业收入357.91亿元，同比下降2.70%；实现净利润-29.77亿元，同比下降103.14%，首次出现年度亏损。"));
  content.push(bodyText("此外，公司经营活动产生的现金流量净额为66.17亿元，同比下降37.82%，筹资活动现金流量净额为-93.14亿元，现金流状况持续恶化（大悦城，2024年年报）。"));

  content.push(heading3("1.1.2 微观背景"));
  content.push(heading4("（1）大悦城案例的典型性"));
  content.push(bodyText("大悦城控股作为中国商业地产的关键参与者，其发展轨迹具有典型性。公司业务结构以商业地产运营为主，2024年商品房销售收入占比达到79.31%，对房地产市场波动高度敏感。在行业下行周期中，公司面临着收入下降、成本上升、融资困难等多重压力，成为受困房企的典型案例。"));

  content.push(heading4("（2）REITs作为解决方案的探索"));
  content.push(bodyText("为缓解财务困境，大悦城积极推进资产证券化。2024年5月24日，华夏大悦城购物中心封闭式基础设施证券投资基金（基金代码：180603）申报材料获受理，成为西南地区首单消费基础设施REITs。该REITs以成都大悦城购物中心为底层资产，发行规模33亿元，预计年化现金流分派率为5.25%-5.36%（深交所，2024）。"));

  content.push(heading4("（3）行业转型的迫切需求"));
  content.push(bodyText("房地产企业从\u201c开发商\u201d向\u201c运营商\u201d、\u201c资管商\u201d转型已成为行业共识。REITs不仅能够提供融资渠道，更能推动企业商业模式转型，实现轻资产运营。万科、华润置地、中国金茂等头部房企已通过REITs实现资产盘活和战略转型，为行业提供了可借鉴的实践经验。"));

  content.push(heading3("1.1.3 理论意义"));
  content.push(heading4("（1）丰富REITs理论研究"));
  content.push(bodyText("现有REITs研究多集中于成熟市场经验介绍、定价模型构建、投资组合优化等领域，对于REITs在特定情境下的应用效果研究相对不足。本研究聚焦于REITs对受困房企的救援效应，丰富了REITs理论的应用场景，拓展了REITs研究的理论边界。"));
  content.push(heading4("（2）深化财务困境研究"));
  content.push(bodyText("财务困境理论主要关注困境识别、预警模型和恢复策略，对于REITs这一特定金融工具在财务困境缓解中的作用机制缺乏系统研究。论文提出了REITs效应受困房企的理论框架，深化了财务困境解决机制的研究。"));
  content.push(heading4("（3）拓展资产证券化理论"));
  content.push(bodyText("资产证券化理论强调资产剥离、风险隔离和现金流重组，但对于证券化过程对企业财务结构和经营绩效的效应研究有限。本研究通过案例分析，揭示了REITs对企业资产负债结构、现金流状况和市场价值的系统性效应，拓展了资产证券化理论。"));

  content.push(heading3("1.1.4 实践意义"));
  content.push(bodyText("本研究通过大悦城案例分析，揭示了REITs对受困房企的具体效应机制和实际效果，为面临类似困境的房地产企业提供了决策参考。同时为REITs投资者提供了评估房企REITs投资价值的分析框架，为REITs政策制定提供实证依据。"));

  // 1.2
  content.push(heading2("1.2 研究问题与目标"));
  content.push(heading3("1.2.1 核心研究问题"));
  content.push(bodyText("基于上述分析，本研究提出以下核心研究问题："));
  content.push(bodyText("REITs发行对受困房企的财务困境缓解效应如何？具体包括以下几个子问题：", false));
  content.push(listItem("REITs发行对大悦城的资产负债结构有何效应？"));
  content.push(listItem("REITs发行对大悦城的现金流状况有何改善？"));
  content.push(listItem("REITs发行对大悦城的市场价值有何效应？"));
  content.push(listItem("REITs通过哪些机制发挥作用？"));

  content.push(heading3("1.2.2 研究目标"));
  content.push(bodyText("基于上述研究问题，本研究设定理论目标、实证目标和应用目标三个层面的研究目标。理论目标包括构建REITs效应受困房企的理论分析框架、揭示REITs缓解财务困境的作用机制、丰富REITs理论和财务困境理论的交叉研究。实证目标包括基于大悦城案例验证REITs发行的财务效应、比较REITs对不同类型房企的效应差异。应用目标包括为受困房企提供REITs发行的决策参考、为投资者提供房企REITs投资分析框架、为政策制定者提供REITs政策优化建议。"));

  // 1.3
  content.push(heading2("1.3 研究方法与框架"));
  content.push(heading3("1.3.1 研究方法"));
  content.push(bodyText("论文采用单案例深度研究法，以大悦城控股集团股份有限公司为研究对象。案例研究方法适用于探索性分析，能够深入挖掘复杂现象背后的机制，适合本研究探索REITs对受困房企效应的复杂过程。"));
  content.push(bodyText("通过分析大悦城2019-2024年的财务报告，计算关键财务指标的变化趋势，包括负债结构指标、盈利能力指标、现金流指标和市场表现指标。同时采用事件研究法分析REITs发行事件的市场反应，并将大悦城与万科、保利发展进行横向对比分析。"));

  content.push(heading3("1.3.2 研究框架"));
  content.push(bodyText("论文提出了\u201c理论框架-实证分析-机制检验\u201d的研究框架。理论框架层涵盖财务困境理论、REITs救援机制和财务效应分析。实证分析层包括案例研究、财务指标分析、事件研究和比较分析。机制检验层涵盖融资成本降低机制、资产负债重构机制和运营效率提升机制。"));

  // 1.4
  content.push(heading2("1.4 研究创新与局限"));
  content.push(heading3("1.4.1 研究创新"));
  content.push(bodyText("本研究在以下方面具有创新性：一是研究视角创新，从受困房企视角出发探索REITs的救援效应；二是理论框架创新，构建了\u201c财务困境-REITs救援-财务改善\u201d的理论框架；三是研究方法创新，采用案例研究法、财务指标分析、事件研究法和比较分析法相结合的综合研究方法；四是实践应用创新，为受困房企、REITs投资者和政策制定者提供了直接的决策参考。"));

  content.push(heading3("1.4.2 研究局限"));
  content.push(bodyText("本研究存在以下局限性：一是样本局限性，采用单案例分析方法，外部效度有限；二是时间局限性，大悦城REITs于2024年发行，可供观察的时间窗口较短；三是数据局限性，部分敏感财务数据难以获取；四是模型局限性，实证模型难以完全排除其他因素的干扰。"));

  // 1.5
  content.push(heading2("1.5 论文结构安排"));
  content.push(bodyText("本论文共分为六章，具体结构安排如下：第一章绪论阐述研究背景与意义，提出研究问题与目标，说明研究方法与框架，指出研究创新与局限。第二章文献综述系统梳理REITs理论、财务困境理论、资产证券化理论的相关研究。第三章研究设计构建理论分析框架，提出研究假设，说明数据来源与分析方法。第四章大悦城案例分析系统检验REITs发行在四个维度的变革效应。第五章对比案例分析将大悦城与万科、保利发展、华润万象生活、龙湖集团、新城控股进行横向对比。第六章结论与建议总结研究发现，提出政策建议。"));

  // 1.6
  content.push(heading2("1.6 本章小结"));
  content.push(bodyText("本章从宏观和微观两个层面阐述了研究背景，指出了REITs对受困房企变革效应研究的理论与实践意义。提出了核心研究问题和具体研究目标，说明了采用案例研究法、财务指标分析、事件研究法和比较分析法相结合的研究方法。构建了研究框架和技术路线，指出了研究的创新点和局限性，最后说明了论文的结构安排。"));

  content.push(pageBreak());
  return content;
}

// 第二章
function chapter2() {
  const content = [];
  content.push(heading1("第二章 文献综述"));

  content.push(bodyText("本章核心论点：通过系统梳理REITs理论、财务困境理论和资产证券化理论，并与经典公司金融理论（MM理论、代理理论、信号理论）进行深度对话，构建了\u201c资本结构优化-代理问题缓解-融资困境突破-信号效应增强\u201d的四重解释框架，为后续实证研究提供坚实的理论基础。", false));

  content.push(heading2("2.1 REITs理论基础：从资产证券化到金融创新"));
  content.push(heading3("2.1.1 REITs的定义、特征与理论渊源"));
  content.push(bodyText("房地产投资信托基金（Real Estate Investment Trusts，简称REITs）是一种将房地产投资证券化的金融工具，其理论渊源可追溯至金融创新理论和资产证券化理论。"));

  content.push(bodyText("资产证券化理论（Fabozzi & Kothari, 2007）的核心观点是将缺乏流动性但能产生稳定现金流的资产转化为可交易证券。REITs应用将房地产这种非流动性资产转化为标准化、可交易的金融产品，解决了房地产投资\u201c流动性困境\u201d，实现风险分散和资本配置优化。"));

  content.push(bodyText("根据美国1960年《REITs法案》，REITs被定义为一种以房地产为基础资产的投资信托基金，其主要特征包括：总收入的75%以上必须来自房地产相关收入；总资产的75%以上必须投资于房地产、现金或政府债券；至少拥有100名股东，且前五大股东持股比例不超过50%；每年至少将应税收入的90%分配给投资者。"));

  content.push(bodyText("中国REITs市场的发展呈现出特色化特征。2020年4月，中国证监会与国家发展改革委联合发布《关于推进基础设施领域不动产投资信托基金（REITs）试点相关工作的通知》，标志着中国基础设施REITs市场正式启动。中国REITs以基础设施为主要底层资产，这与国外以商业地产为主的REITs市场形成明显差异。"));

  content.push(heading3("2.1.2 REITs的发展历程"));
  content.push(bodyText("全球REITs市场发展可分为三个阶段：初创阶段（1960-1990年），以美国为代表，REITs市场初步形成；发展阶段（1990-2010年），市场规模快速扩张，产品创新不断涌现；成熟阶段（2010年至今），全球REITs市场一体化，跨境投资增多。"));
  content.push(bodyText("中国REITs市场发展经历了探索阶段（2007-2019年）的私募REITs产品尝试，试点阶段（2020-2022年）的基础设施REITs试点，以及扩大阶段（2023年至今）的资产范围扩大和市场规模快速增长。"));

  // 2.2
  content.push(heading2("2.2 REITs财务效应研究"));
  content.push(heading3("2.2.1 融资结构优化效应"));
  content.push(bodyText("REITs对企业融资结构的优化作用主要体现在三个方面：资产负债结构改善，通过资产出表降低资产负债率，REITs发行后企业资产负债率平均下降5-10个百分点；融资成本降低，REITs作为一种股权融资工具，能够有效替代高成本债务融资，融资成本通常比传统银行贷款低1-2个百分点；融资渠道多元化，减少对传统银行融资的依赖。"));

  content.push(heading3("2.2.2 现金流改善效应"));
  content.push(bodyText("REITs对企业现金流的改善作用主要体现在：现金流入增加，单个REITs产品的发行规模通常在10-50亿元之间；经营现金流优化，REITs管理下的物业出租率通常比企业自有管理高3-5个百分点；现金流稳定性提升，REITs的持续分红机制为企业提供了稳定的现金流来源。"));

  content.push(heading3("2.2.3 企业价值提升效应"));
  content.push(bodyText("REITs对企业价值的提升作用主要体现在：市场估值提升，REITs发行后的累计超额收益率在事件窗口[-20,+20]内平均达到15-20%；透明度提高，REITs的严格信息披露要求降低了信息不对称；专业化溢价，REITs的专业化管理为企业创造了价值。"));

  // 2.3
  content.push(heading2("2.3 财务困境与REITs研究"));
  content.push(heading3("2.3.1 财务困境理论基础"));
  content.push(bodyText("财务困境理论植根于经典公司金融理论的框架中。Modigliani-Miller理论指出在完美市场条件下企业价值与资本结构无关，但税收、破产成本、代理成本等因素使资本结构影响企业价值。Jensen-Meckling代理理论揭示了债务融资加剧股东-债权人利益冲突的问题。Myers的优序融资理论指出企业融资偏好为内源融资大于债务融资大于股权融资。"));
  content.push(bodyText("在财务困境预警模型方面，Altman Z-score模型通过多个财务指标构建预测模型用于评估企业破产风险。Ohlson O-score模型更适用于中国上市公司。流动性危机理论强调现金流危机是企业财务困境的主要原因。"));
  content.push(bodyText("信号传递理论（Spence, 1973）指出高质量企业通过可观察行动传递私有信息，REITs发行传递\u201c资产质量高\u201d、\u201c经营专业\u201d的积极信号，恢复市场信心，降低融资成本。"));
  content.push(bodyText("本研究将MM理论、代理理论、优序融资理论和信号理论有机结合，构建\u201c资本结构优化-代理问题缓解-融资困境突破-信号效应增强\u201d的四重解释框架。"));

  content.push(heading3("2.3.2 REITs作为财务困境解决方案研究"));
  content.push(bodyText("REITs作为财务困境解决方案的研究主要集中在资产盘活效应、债务重组效应和经营转型效应三个方面。通过资产证券化，企业能够将非流动性资产转化为流动性资产；REITs融资能够用于偿还高成本债务，优化债务结构；REITs有助于推动企业从重资产模式向轻资产模式转型。"));

  // 2.4
  content.push(heading2("2.4 资产证券化理论"));
  content.push(bodyText("资产证券化是将缺乏流动性但能够产生可预期现金流的资产，通过结构化设计转化为能够在金融市场上出售和流通的证券的过程。其主要特点包括资产重组、风险隔离、信用增级和现金流重组。REITs是资产证券化在房地产领域的典型应用，运用了结构化设计原理、风险隔离机制和流动性创造原理。"));

  // 2.5
  content.push(heading2("2.5 研究评述与研究缺口"));
  content.push(heading3("2.5.1 现有研究评述"));
  content.push(bodyText("通过对现有文献的分析，能够发现以下特点：理论研究的深入性，在REITs基础理论、财务效应等方面已有较为深入的研究；实证分析的丰富性，大量实证研究探讨了REITs对企业财务指标的影响；研究视角的多元化，从投资者、企业管理、政策制定等多个视角开展研究。"));

  content.push(heading3("2.5.2 研究缺口分析"));
  content.push(bodyText("现有研究仍存在以下研究缺口：受困房企视角缺失，缺乏对受困房企如何利用REITs缓解财务困境的系统研究；机制研究的深度不足，对具体作用机制的深入分析相对缺乏；中国实践的特色研究不足；长期效应研究有限。"));

  content.push(heading3("2.5.3 本研究贡献与创新"));
  content.push(bodyText("论文旨在填补上述研究缺口，主要贡献与创新包括：研究视角创新，首次从受困房企视角系统研究REITs的应用；理论框架创新，将财务困境理论与REITs理论有机结合，构建\u201c财务困境-REITs救援-财务改善\u201d的分析框架；比较研究创新，通过六家企业的横向对比，揭示不同企业规模、性质和业务结构下的REITs适用性差异。"));

  content.push(heading2("2.6 本章小结"));
  content.push(bodyText("本章对REITs相关理论进行了系统梳理和评述，包括理论基础回顾、财务效应分析、研究缺口识别和研究贡献定位。通过本章的分析，为后续的案例研究提供了理论支撑和分析框架。下一章将基于文献综述构建本研究的理论分析框架。"));

  content.push(pageBreak());
  return content;
}

// 第三章
function chapter3() {
  const content = [];
  content.push(heading1("第三章 研究设计"));

  content.push(bodyText("本章核心论点：采用Yin案例研究法作为核心方法论，结合财务指标趋势分析、事件研究法和比较分析法，构建了多方法综合研究范式。研究设计创新性地采用\u201c中长期跟踪验证框架\u201d，将分析期间从REITs发行后的3个月延伸至完整的15个月运营周期。", false));

  content.push(heading2("3.1 方法论框架"));
  content.push(heading3("3.1.1 案例研究法（Yin框架）作为核心方法论"));
  content.push(bodyText("本研究采用Robert K. Yin（2013）的案例研究法作为核心方法论。研究问题类型为\u201cHow/Why\u201d型问题，适合采用案例研究方法进行深入分析。基于REITs理论和财务困境理论，构建四机制分析框架（融资结构优化、现金流改善、资产负债重构、运营效率提升），指导证据收集和模式匹配。以大悦城控股为单案例进行深度分析，另外以万科、保利为简要参照案例。采用模式匹配方法，对比理论预期与实证发现的一致性程度。"));

  content.push(heading3("3.1.2 方法组合设计"));
  content.push(bodyText("研究采用多层次方法组合策略，构建了\u201c核心方法+辅助验证+探索分析\u201d的三层方法体系。核心方法层采用Yin案例研究法，辅助验证层包括财务指标趋势对比、事件研究法和比较分析法，探索分析层采用DID模型作为补充性探索分析。"));

  content.push(heading3("3.1.3 方法论优化说明"));
  content.push(bodyText("DID定位调整：原设计中DID作为核心方法，现调整为探索性补充分析，需明确标注样本量限制（3家企业\u00d76年=18个观测值不满足大样本要求）。案例设计修正：万科/保利从\u201c控制组\u201d改为\u201c对比参照案例\u201d。分析框架统一：采用\u201c四机制为核心+5D为补充\u201d的统一框架。"));

  // 3.2
  content.push(heading2("3.2 研究设计要素"));
  content.push(heading3("3.2.1 案例选择逻辑"));
  content.push(bodyText("核心案例选择大悦城控股集团股份有限公司，选择标准包括：典型性（2024年首次出现年度亏损）、数据可得性（财务数据完整）、事件驱动（2024年5月24日申报华夏大悦城REIT）、规模适中（总资产约2000亿元）。参照案例选择万科（战略转型参照）和保利发展（创新尝试参照）。"));

  content.push(heading3("3.2.2 研究期间设置"));
  content.push(bodyText("总体研究期间为2019年1月1日至2025年12月31日，跨越7年时间。中长期验证窗口为2024年9月至2025年12月，覆盖REITs完整15个月运营周期。"));
  content.push(bodyText("三阶段分析框架：短期（2024年9-12月）验证信号效应和方向性变化；中期（2025年1-6月）验证实质性改善证据；中长期（2025年7-12月）验证机制和趋势确认。"));

  content.push(heading3("3.2.3 变量定义体系"));
  content.push(bodyText("被解释变量包括资产负债率、经营现金流比率、累计超额收益率和有息负债率。解释变量包括REITs发行哑变量和时间趋势变量。中介变量对应四机制：融资成本率、资产周转率、REITs分派贡献和出租率稳定性。控制变量包括企业规模、盈利能力、成长性和行业景气度。"));

  // 3.3
  content.push(heading2("3.3 实证分析路径"));
  content.push(heading3("3.3.1 四机制中长期跟踪验证路径"));
  content.push(bodyText("第一阶段为趋势对比分析，包括大悦城财务指标时间序列分析（2019-2025年）、REITs发行前后对比和跨年度变化趋势检验。第二阶段为四机制中长期跟踪检验，分别检验融资结构优化、现金流改善、资产负债重构和运营效率提升四个机制。第三阶段为模式匹配与中长期评估，对比理论预期与实证发现。"));

  content.push(heading3("3.3.2 数据分析方法"));
  content.push(bodyText("数据分析方法包括趋势对比分析、描述性统计分析、探索性DID分析和模式匹配分析。事件研究法采用市场模型法，估计窗口为[-120, -30]交易日，事件窗口为[-20, +20]交易日，事件日为2024年5月24日。"));

  content.push(heading3("3.3.3 四机制分析框架详细设计"));
  content.push(bodyText("机制一为融资结构优化机制，理论逻辑为REITs发行至资产出表至资金回笼至降低债务依赖至融资成本下降。机制二为现金流改善机制，理论逻辑为REITs发行至一次性现金流入加持续分红收入至经营现金流改善。机制三为资产负债重构机制，理论逻辑为REITs发行至重资产出表至轻资产转型至资产周转率提升。机制四为运营效率提升机制，理论逻辑为REITs专业化运营至底层资产运营效率提升至租金收入增长。"));

  // 3.4
  content.push(heading2("3.4 数据收集与验证"));
  content.push(bodyText("数据来源包括官方财报数据（巨潮资讯网、公司官网）、专业数据库（Wind、同花顺iFinD）、权威媒体报道和学术研究资料。数据验证采用证据三角形验证策略，包括定量数据（财务指标）、定性数据（文本材料）和交叉验证与整合分析。"));

  content.push(heading2("3.5 研究局限性及应对措施"));
  content.push(bodyText("主要局限性包括样本规模（核心案例单一）、方法选择（样本量限制DID应用）、数据约束（部分数据获取困难）和内生性问题。应对措施包括单案例深度分析、多种方法组合使用、多源交叉验证和机制分析替代因果推断。"));

  content.push(heading2("3.6 本章小结"));
  content.push(bodyText("本章系统阐述了本研究的方法论框架和研究设计，包括Yin案例研究法作为核心方法论、研究设计要素、中长期跟踪验证路径、数据收集与验证、研究局限性及应对措施。本章为后续的实证分析提供了完整的理论框架和分析路径。"));

  content.push(pageBreak());
  return content;
}

// 第四章 - 关键表格和数据较多，精简但保留核心内容
function chapter4() {
  const content = [];
  content.push(heading1("第四章 大悦城案例分析"));

  content.push(heading2("4.1 案例背景"));
  content.push(heading3("4.1.1 大悦城控股概况"));
  content.push(bodyText("大悦城控股集团股份有限公司（股票代码：000031.SZ）是中国中粮集团旗下一家专注于商业地产开发与运营的上市公司。公司以\u201c大悦城\u201d品牌为核心，业务范围覆盖房地产开发、经营管理、商业运营等多个领域，在中国商业地产行业具有突出的市场地位和品牌影响力。"));

  content.push(heading3("4.1.2 大悦城财务困境特征"));
  content.push(bodyText("本章所有财务数据均来自大悦城控股（000031.SZ）A股年度报告及公开披露信息。"));

  content.push(bodyText("大悦城净利润轨迹呈现\u201cW型\u2192改善\u201d路径：2020年首次亏损至2021年短暂回正至2022年亏损加剧至2023年收窄至2024年再次扩大至2025年上半年实现扭亏为盈，全年减亏趋势确认。2025年上半年的7.48亿元归母净利润是自2021年以来最好的半年度业绩，毛利率从22.59%大幅提升至36.35%。"));

  // 表4.2
  content.push(heading4("表4.2 大悦城净利润变化趋势（2019-2025年）"));
  content.push(simpleTable(
    ["年份", "净利润（亿元）", "净利润率", "同比变化", "财务状态"],
    [
      ["2019", "37.05", "10.97%", "-", "高盈利"],
      ["2020", "-3.87", "-1.01%", "-110.44%", "首次亏损"],
      ["2021", "1.08", "0.25%", "+127.91%", "微利转盈"],
      ["2022", "-28.83", "-7.28%", "-2775%", "亏损加剧"],
      ["2023", "-14.65", "-3.98%", "+49.18%", "亏损收窄"],
      ["2024", "-29.77", "-8.32%", "-103.14%", "亏损扩大"],
      ["2025H1", "7.48（归母）", "4.91%", "扭亏为盈", "显著改善"],
      ["2025E", "-27~-21", "-", "减亏9-29%", "减亏趋势确认"],
    ],
    [1500, 1800, 1200, 1600, 1600]
  ));
  content.push(emptyLine());

  content.push(heading3("4.1.3 大悦城财务困境成因分析"));
  content.push(bodyText("基于波特五力模型和SWOT分析，大悦城财务困境是外部环境恶化（买方议价能力提升、替代品威胁增大）与内部劣势放大（重资产模式、高负债结构）共同作用的结果。REITs发行正是大悦城利用机会（REITs政策）应对威胁（融资收紧）的战略选择。"));

  content.push(heading2("4.2 华夏大悦城REIT发行分析"));
  content.push(heading3("4.2.1 REITs产品基本信息"));
  content.push(bodyText("华夏大悦城购物中心封闭式基础设施证券投资基金（基金代码：180603）是西南地区首单消费基础设施公募REITs产品。基金管理人为华夏基金管理有限公司，申报日期为2024年5月24日，上市日期为2024年9月20日，发行规模33.23亿元，底层资产为成都大悦城购物中心，存续期限24年。"));

  content.push(heading3("4.2.2 REITs运营全周期数据（2024Q4-2025Q4）"));
  content.push(simpleTable(
    ["季度", "收入（万元）", "出租率", "年化分派率", "可供分配（万元）", "收缴率"],
    [
      ["2025Q1", "8,469.91", "~97%", "5.46%", "4,473.76", "-"],
      ["2025Q2", "8,223.82", "98.44%", "5.48%", "4,539.99", "99.22%"],
      ["2025Q3", "8,546.40", "97.05%", "5.49%", "4,598.30", "-"],
      ["2025Q4", "8,918.04", "98.10%", "5.49%", "4,601.90", "100%"],
      ["2025全年", "34,158", "~97.6%", "~5.48%", "18,214", "99%+"],
    ],
    [1200, 1400, 1100, 1200, 1600, 1100]
  ));
  content.push(emptyLine());

  content.push(heading2("4.3 财务指标趋势对比分析"));
  content.push(bodyText("以2024年5月24日华夏大悦城REIT申报为分界点，将分析期间分为\u201c发行前\u201d（2019-2023年）、\u201c发行过渡期\u201d（2024年）、\u201c发行后\u201d（2025年起）三个阶段。中长期发现表明毛利率和融资成本的改善是最显著的两个维度，全年减亏趋势进一步确认了REITs发行后企业财务状况的边际改善。"));

  content.push(heading2("4.4 四机制中长期跟踪验证"));
  content.push(heading3("4.4.1 机制一：融资结构优化"));
  content.push(bodyText("融资结构优化机制得到实质性验证。融资成本显著下降：综合融资成本从约4.06%降至3.64%（-42bp），新增借款成本仅2.85%。信用评级维持AAA，中诚信国际、中证鹏元维持AAA评级。REITs资金回笼效应：33.23亿元发行规模虽相对总负债比例有限，但改善信号意义大于金额意义。"));

  content.push(heading3("4.4.2 机制二：现金流改善"));
  content.push(bodyText("现金流改善机制得到初步中长期验证。2025H1经营现金流同比增长38.15%，扭转2024年-37.82%的下降趋势。REITs分派贡献稳定，2025年全年分配1.95亿元，为大悦城提供持续稳定的现金流入。"));

  content.push(heading3("4.4.3 机制三：资产负债重构"));
  content.push(bodyText("资产负债重构机制得到部分中长期验证，效果维度从\u201c量\u201d转向\u201c质\u201d。毛利率从22.59%提升至36.35%（+13.76pp），说明公司正在从低利润率的开发销售模式转向高利润率的持有运营模式。REITs出表推动了大悦城从\u201c重资产开发\u201d向\u201c轻资产运营\u201d的渐进式转型。"));

  content.push(heading3("4.4.4 机制四：运营效率提升"));
  content.push(bodyText("运营效率提升机制得到最充分的中长期验证。出租率持续提升，从上市前的96%+提升至2025年的97-98%，创历史新高。租金单价同比提升3.7%至377.29元/平方米/月。分派率持续超预期，各季度分派率5.46-5.49%，均高于招募说明书预测的5.25-5.36%。收缴率接近100%。"));

  content.push(heading3("4.4.5 四机制中长期验证小结"));
  content.push(simpleTable(
    ["机制", "短期验证（3个月）", "中长期验证（15个月）", "验证升级", "置信度"],
    [
      ["融资结构优化", "初步验证", "实质性验证", "升级", "高"],
      ["现金流改善", "未验证", "初步验证", "显著升级", "中"],
      ["资产负债重构", "微幅验证", "部分验证（质>量）", "升级", "中"],
      ["运营效率提升", "数据不足", "充分验证", "显著升级", "高"],
    ],
    [1800, 1800, 2000, 1200, 1000]
  ));
  content.push(emptyLine());

  content.push(heading2("4.5 5D补充视角分析"));
  content.push(bodyText("基于5D框架的补充分析表明：筛选维度上，成都大悦城购物中心满足消费基础设施REITs试点要求的所有筛选标准；结构设计上，采用\u201c公募基金+ABS\u201d的双层架构；运营管理上，2025年租金单价同比提升3.7%，首店经济策略引入9家特色首店，全年租金收缴率99%+；风险评估上，单一资产风险仍存但228万平方米扩募储备提供了潜在对冲；跨境对比视角上，5.48%的分派率在亚太REITs中处于中等偏上水平。"));

  content.push(heading2("4.6 案例内分析小结"));
  content.push(bodyText("主要发现包括：大悦城财务困境出现转机，2025年上半年实现扭亏为盈；四机制从中短期验证升级为中长期验证；REITs效应具有阶段性特征，短期效应有限，中长期才能获得全面验证；\u201c质量改善\u201d先于\u201c规模改善\u201d；资产出表是双刃剑但利大于弊。"));

  content.push(heading2("4.7 基于SWOT的REITs战略建议"));
  content.push(bodyText("基于SWOT分析，短期（1年内）应执行WO战略，重点通过REITs改善负债结构；中期（1-3年）应执行SO战略，将REITs作为核心转型工具；长期（3年以上）应执行ST战略，建立基于REITs的可持续发展模式。"));

  content.push(pageBreak());
  return content;
}

// 第五章
function chapter5() {
  const content = [];
  content.push(heading1("第五章 对比案例分析"));

  content.push(bodyText("本章为第四章大悦城核心案例提供多维度对照视角，选择万科、保利、华润万象生活、龙湖集团和新城控股作为参照案例，验证REITs在不同企业状态下的适用性。", false));

  content.push(heading2("5.1 对比案例选择逻辑与参照定位"));
  content.push(bodyText("五家参照案例分别提供了规模效应参照、企业性质参照、REITs实践参照和商业地产占比参照。在方法论修正后，所有参照案例从原DID模型中的\u201c控制组\u201d调整为多维参照案例。"));

  content.push(heading2("5.2 住宅房企对比分析：万科与保利"));
  content.push(heading3("5.2.1 万科基本情况与REITs探索"));
  content.push(bodyText("万科企业股份有限公司（000002.SZ）2024年营业收入3,980.24亿元（下降12.5%），归母净利润-494.78亿元（创行业纪录）。万科在REITs领域进行了物流REITs、租赁住房REITs和商业地产REITs储备三方面探索，但面临资产收益率瓶颈、战略优先级不足、规模过大导致执行效率受限等制约因素。"));

  content.push(heading3("5.2.2 保利基本情况与REITs创新"));
  content.push(bodyText("保利发展控股集团股份有限公司（600048.SH）是央企中国保利集团旗下房地产平台，2023年营业收入3,468.94亿元，归母净利润120.37亿元，但2025H1净利润同比下降34%。保利在租赁住房REITs和商业地产REITs领域进行了探索，但收益率接近政策下限。"));

  content.push(heading3("5.2.3 住宅房企对比小结"));
  content.push(bodyText("核心发现：资产收益率是REITs发行的关键门槛，大悦城5.48%的收益率显著高于万科（3-4%）和保利（3.5-4.2%）；战略重视程度决定执行力度；中等规模企业REITs应用更具灵活性；决策效率影响REITs落地。"));

  content.push(heading2("5.3 商业地产企业对比分析"));
  content.push(heading3("5.3.2 华润万象生活：轻资产模式下的REITs成功实践"));
  content.push(bodyText("华润万象生活2024年营业收入177.47亿元（+15.67%），归母净利润36.29亿元（+23.92%），ROE 22.12%（+3.25pp），经营现金流42.59亿元（+40.02%）。轻资产模式优势、国资背景优势和商业运营专业化是其REITs成功的关键。"));

  content.push(heading3("5.3.3 龙湖集团：双轮驱动下的REITs转型探索"));
  content.push(bodyText("龙湖集团2024年营业收入1274.7亿元（同比-3.1%），净利润104亿元（同比-8.8%），平均融资成本3.51%（同比降0.23个百分点），资产负债率51.7%（三道红线绿档）。三年半压降有息负债约600亿元，融资成本持续下降。"));

  content.push(heading3("5.3.4 新城控股：商业资产潜力与REITs障碍"));
  content.push(bodyText("新城控股2024年营业总收入889.99亿元（-25.32%），净利润7.52亿元（+2.07%）。吾悦广场108座，出租率97.97%，商业毛利率70.17%，占总毛利47.89%。具备REITs发行条件但尚未建立相关工作机制。"));

  content.push(heading2("5.4 五家企业对比综合分析"));
  content.push(heading3("5.4.3 REITs适用性模型"));
  content.push(simpleTable(
    ["企业", "资产收益率", "资产质量", "企业规模", "执行效率", "政策匹配度", "商业占比", "综合得分"],
    [
      ["大悦城", "9/10", "8/10", "7/10", "9/10", "8/10", "9/10", "8.3"],
      ["万科", "6/10", "8/10", "5/10", "6/10", "7/10", "4/10", "6.0"],
      ["保利", "6/10", "7/10", "7/10", "6/10", "8/10", "5/10", "6.5"],
      ["华润万象生活", "8/10", "9/10", "7/10", "9/10", "9/10", "8/10", "8.3"],
      ["龙湖集团", "7/10", "8/10", "8/10", "7/10", "8/10", "7/10", "7.5"],
      ["新城控股", "7/10", "8/10", "7/10", "6/10", "8/10", "6/10", "7.0"],
    ],
    [1100, 900, 900, 900, 900, 900, 900, 900]
  ));
  content.push(emptyLine());

  content.push(bodyText("六个维度采用等权重赋权，每维度权重为1/6（约16.7%）。选择等权而非加权的原因在于：本研究为探索性案例研究，缺乏足够样本进行权重标定；各维度对REITs适用性的理论贡献度尚未有成熟文献提供公认权重排序；等权赋权减少了主观赋权偏差。"));

  content.push(heading2("5.5 本章小结"));
  content.push(bodyText("本章主要发现包括：资产收益率是REITs应用的核心门槛；商业地产占比显著影响REITs适用性；企业规模存在最优区间；国企在REITs发行中具有双重优势；REITs实践呈梯度分布；财务困境程度需要重新审视。这些多维对比发现极大地丰富了REITs对受困房企适用性的理解。"));

  content.push(pageBreak());
  return content;
}

// 第六章
function chapter6() {
  const content = [];
  content.push(heading1("第六章 结论与建议"));

  content.push(heading2("6.1 研究结论总结"));
  content.push(heading3("6.1.1 核心研究发现"));
  content.push(bodyText("本研究以\u201cREITs对受困房企的变革效应\u201d为主题，以大悦城控股为单案例进行深度分析，以万科、保利、华润万象生活、龙湖集团、新城控股为参照案例，得出以下核心结论："));

  content.push(bodyText("第一，REITs对受困房企具有显著的财务改善效应。时间窗口延伸至2025年后，四机制全部获得中长期验证证据。融资结构优化和运营效率提升达到高置信度，现金流改善和资产负债重构达到中等置信度。"));
  content.push(bodyText("第二，REITs效应具有明显的阶段性特征。短期（0-3个月）效应有限，中期（3-12个月）实质性改善显现，中长期（12个月+）机制全面验证。"));
  content.push(bodyText("第三，\u201c质量改善\u201d先于\u201c规模改善\u201d。毛利率大幅提升但营收仍在下降，REITs推动的首先是利润质量改善。"));
  content.push(bodyText("第四，资产出表是\u201c双刃剑\u201d但利大于弊。出表资产的运营效率在专业化运营下反而提升。"));
  content.push(bodyText("第五，REITs适用性存在关键门槛条件。资产收益率是核心门槛，中等规模企业更具灵活性，商业地产占比越高适用性越强。"));

  content.push(heading2("6.2 理论贡献与创新"));
  content.push(bodyText("本研究凝练出三个核心创新点：一是研究视角与框架创新，首创\u201c四机制中长期跟踪验证\u201d分析框架；二是对比分析体系创新，构建了\u201c住宅房企+商业地产企业\u201d的双重对比体系；三是方法论整合创新，将商学院经典战略分析框架系统融入房地产金融研究。"));

  content.push(heading2("6.3 实践启示与建议"));
  content.push(heading3("6.3.1 对受困房企的战略建议"));
  content.push(bodyText("建议受困房企将REITs定位为核心转型工具而非补充融资渠道，优先选择收益率较高（不低于5%）的优质资产，简化内部决策流程提升市场反应速度，设定明确的REITs发行时间表（建议9-12个月内完成）。"));

  content.push(heading3("6.3.2 对投资者的决策建议"));
  content.push(bodyText("建议投资者从资产质量（出租率不低于95%，租金增长不低于3%，收缴率不低于98%）、收益率水平（分派率不低于5%，资产收益率不低于4.5%）、运营能力（3年以上同类资产运营经验）和企业背景（信用评级AA+以上）四个维度评估房企REITs产品。"));

  content.push(heading3("6.3.3 对政策制定者的建议"));
  content.push(bodyText("政策落地三阶段实施路径：第一阶段（2026-2027年）试点深化与标准建立，扩大REITs试点范围，建立标准化发行流程；第二阶段（2027-2028年）体系完善与市场拓展，推出差异化收益率标准体系，建立税收优惠政策体系；第三阶段（2028-2030年）市场成熟与风险防控，建立价格稳定机制和投资者保护机制。"));

  content.push(heading2("6.4 研究局限性与未来展望"));
  content.push(bodyText("本研究存在样本局限性（单案例深度分析）、时间局限性（REITs上市仅15个月）、方法局限性（内生性问题）和数据局限性。未来研究方向包括多案例比较研究（6-12个月）、长期效应追踪研究（3-5年）、机制深化研究（12-18个月）和政策效果评估研究（12个月）。"));

  content.push(heading2("6.5 本章小结"));
  content.push(bodyText("本章系统总结了研究发现，提炼了理论贡献，提出了实践建议，并展望了未来研究方向。研究发现不仅具有理论价值，也为企业决策、投资分析和政策制定提供了实证依据和参考框架。随着中国REITs市场的快速发展和房地产行业的深度调整，REITs将在房企转型和行业发展中发挥越来越重要的作用。"));

  content.push(pageBreak());
  return content;
}

// 参考文献
function references() {
  const refs = [
    "[1] Yin R K. Case study research: Design and methods (5th ed.)[M]. Thousand Oaks: Sage Publications, 2013.",
    "[2] Eisenhardt K M. Building theories from case study research[J]. Academy of Management Review, 1989, 14(4): 532-550.",
    "[3] Booth W C, Colomb G G, Williams J M, et al. The craft of research (4th ed.)[M]. Chicago: University of Chicago Press, 2016.",
    "[4] 赖一飞, 吴思. MBA研究方法与论文写作[M]. 北京: 清华大学出版社, 2019.",
    "[5] Zhang L, Chen S, Li J. Capital structure and financial distress in China's real estate[J]. Humanities and Social Sciences Communications, 2025, 12(1): 45-60.",
    "[6] Liu Y, Wang Q. The impact of capital structure on firm performance: Evidence from Chinese real estate listed companies[J]. Research in International Business and Finance, 2022, 63: 101-115.",
    "[7] 李军, 张伟. 基于Z-Score模型的我国房地产业上市公司财务风险的实证分析[J]. 金融与经济, 2011(3): 45-52.",
    "[8] 王强. 基于Z值模型的房地产企业财务风险分析[J]. 财务管理, 2024(5): 78-85.",
    "[9] 中国房地产业协会. 房企债务重组与重整进展分析报告[R]. 北京: 中国房地产业协会, 2025.",
    "[10] 赵鹏, 孙丽. 我国房地产企业财务风险问题研究[J]. 经济管理, 2025(2): 56-68.",
    "[11] 刘洋, 陈静. 房地产企业债务违约风险研究[J]. 财务与会计, 2023(8): 34-42.",
    "[12] Wang J, Li L, Chen Q. Research trends and directions on REITs: A bibliometric analysis[J]. Sustainability, 2023, 15(8): 3456-3478.",
    "[13] Chen K, Zhou M. ESG disclosure, REIT debt financing and firm value[J]. Journal of Real Estate Research, 2021, 43(2): 213-235.",
    "[14] 李明, 张华. 基础设施公募REITs赋能企业高质量发展路径研究[J]. 金融研究, 2024(6): 112-128.",
    "[15] Zhou Y, Lin C, Tao Y. The financial performance of newly launched REITs: Evidence from China's infrastructure REITs[J]. Journal of Real Estate Research, 2023, 44(3): 412-432.",
    "[16] Lee S H. REIT capital structure: Evidence from US REITs[R]. Cornell Working Paper, 2020.",
    "[17] Ooi J, Li S, Sing T F. On the determinants of REIT capital structure: A cross-country study[J]. Journal of Real Estate Research, 2019, 41(4): 567-589.",
    "[18] 黄磊, 王芳. 基于房地产信托基金视角房地产企业转型路径研究[J]. 现代管理科学, 2023(4): 78-86.",
    "[19] 张磊, 陈思. 越秀REITs的财务风险研究[J]. 商业经济研究, 2023(15): 156-160.",
    "[20] 清华大学五道口金融学院. 消费基础设施REITs: 特点、机遇及展望[R]. 北京: 清华大学五道口金融学院, 2024.",
    "[21] 李健, 刘伟. 我国商业地产REITs发展展望及海外案例观察[J]. 房地产导刊, 2023(12): 45-52.",
    "[22] 东方财富网. 华夏大悦城购物中心REIT成功获批[EB/OL]. https://www.eastmoney.com, 2024-05-24.",
    "[23] 观点地产新媒体. 2025年度影响力产权类基础设施REITs10[J]. https://www.guandian.cn, 2025-01-15.",
    "[24] 东方财富研究. 中国REITs常态化发行与投资价值研究[R]. 上海: 东方财富证券研究所, 2024.",
    "[25] 仲量联行. 商业不动产REITs系列二：国际镜鉴[R]. 上海: 仲量联行, 2026.",
    "[26] 德勤中国. 2026年商业地产行业展望报告[R]. 北京: 德勤中国, 2026.",
    "[27] 中指研究院. 2024-2025年中国商业地产REITs发展分析[R]. 北京: 中指研究院, 2025.",
    "[28] 仲量联行. 亚太地区商业地产投资市场稳健复苏[R]. 上海: 仲量联行, 2026.",
    "[29] 深圳证券交易所. REITs产权类资产估值方法的实践探讨[R]. 深圳: 深圳证券交易所, 2022.",
    "[30] 中国资产评估协会. REITs项目资产评估研究报告[R]. 北京: 中国资产评估协会, 2024.",
    "[31] 戴德梁行. 保障性租赁住房REITs底层资产运营效率研究[R]. 北京: 戴德梁行, 2025.",
    "[32] 中国REITs论坛. 公募REITs精益运营促进资产价值提升研究[R]. 北京: 中国REITs论坛, 2026.",
    "[33] Singh A K, Singh A. Resilience and risk: Financial performance of lodging REITs during COVID-19[J]. Journal of Real Estate Finance and Economics, 2025, 70(2): 356-378.",
    "[34] Newell G, Peng H W. Evaluating the impact of economic factors on REITs' capital structure: A global perspective[J]. Journal of Property Investment & Finance, 2014, 32(6): 589-610.",
    "[35] 清华大学不动产金融研究中心. 中国公募REITs三周年报告[R]. 北京: 清华大学不动产金融研究中心, 2024.",
    "[36] 德勤中国. 中国REITs发展报告[R]. 北京: 德勤中国, 2023.",
    "[37] 国信证券. 2025年REITs市场回顾暨2026年投资策略[R]. 上海: 国信证券经济研究所, 2025.",
    "[38] 银河证券. REITs2025年投资策略报告[R]. 北京: 银河证券研究院, 2025.",
    "[39] 海通证券. 机构整体增持, 板块偏好显现差异[R]. 上海: 海通证券研究所, 2025.",
    "[40] 李博, 王晓燕. 中国公募REITs市场价格与投资者结构研究[J]. 金融研究, 2024(8): 88-102.",
    "[41] 北大光华管理学院. 中国公募REITs发展研究[R]. 北京: 北大光华管理学院, 2024.",
    "[42] Brown S, Warner J. Event studies in management research[J]. Journal of Financial Economics, 1985(3): 1-27.",
    "[43] MacKinlay A C. Event studies in economics and finance[J]. Journal of Economic Literature, 1997, 35(1): 13-39.",
    "[44] Wang J, Liu F. Statist forms of entrepreneurialism: Financing and managing urban development in China[J]. Journal of Urban Affairs, 2026, 48(4): 567-589.",
    "[45] 大悦城控股有限公司. 年度报告（2019-2024年）[R/OL]. 深圳证券交易所, 2020-2025.",
    "[46] 万科企业股份有限公司. 年度报告（2019-2024年）[R/OL]. 深圳证券交易所, 2020-2025.",
    "[47] 保利发展控股集团股份有限公司. 年度报告（2019-2024年）[R/OL]. 上海证券交易所, 2020-2025.",
    "[48] 华夏基金管理有限公司. 华夏大悦城购物中心封闭式基础设施证券投资基金申报材料[Z]. 2024.",
    "[49] 华夏基金管理有限公司. 华夏大悦城REIT季度报告（2024Q3-2025Q4）[R/OL]. 2024-2025.",
    "[50] 国家统计局. 中国统计年鉴-房地产行业数据（2019-2025年）[M]. 北京: 中国统计出版社, 2020-2025.",
    "[51] 中国证监会. 基础REITs试点相关政策文件（2020-2025年）[Z]. 2020-2025.",
  ];
  const content = [];
  content.push(heading1("参考文献"));
  refs.forEach(r => content.push(refItem(r)));
  return content;
}

// ============== 组装论文 ==============
async function main() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT_BODY, size: 24 }, // 小四 = 12pt = 24 half-points
        },
      },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: FONT_HEADING }, // 二号 ≈ 18pt = 36
          paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 30, bold: true, font: FONT_HEADING }, // 三号 ≈ 15pt = 30
          paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 1 },
        },
        {
          id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: FONT_HEADING }, // 四号 ≈ 14pt = 28
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: MARGIN,
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "MBA学位论文 \u2014 REITs对受困房企的变革效应研究", font: FONT_BODY, size: 18, color: "888888" })],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "第 ", font: FONT_BODY, size: 18 }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT_BODY, size: 18 }),
                new TextRun({ text: " 页", font: FONT_BODY, size: 18 }),
              ],
            })],
          }),
        },
        children: [
          ...coverPage(),
          ...tocPage(),
          ...chapter1(),
          ...chapter2(),
          ...chapter3(),
          ...chapter4(),
          ...chapter5(),
          ...chapter6(),
          ...references(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = "/Users/op/WorkBuddy/科研代理/mba_paper_project/MBA学位论文_REITs对受困房企的变革效应研究_完整版.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("论文Word已生成: " + outPath);
}

main().catch(e => { console.error(e); process.exit(1); });
