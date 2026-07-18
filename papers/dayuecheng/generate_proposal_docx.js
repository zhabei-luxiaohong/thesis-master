const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat,
        TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageBreak, PageNumber } = require("docx");

// ============== 配置 ==============
const FONT_TITLE = "SimHei";
const FONT_BODY = "SimSun";
const FONT_HEADING = "SimHei";
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = { top: 1440, right: 1440, bottom: 1440, left: 1800 };

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 480, after: 240 },
    children: [new TextRun({ text, font: FONT_HEADING, size: 36, bold: true })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 360, after: 180 },
    children: [new TextRun({ text, font: FONT_HEADING, size: 30, bold: true })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: FONT_HEADING, size: 28, bold: true })] });
}
function h4(text) {
  return new Paragraph({ spacing: { before: 180, after: 120 },
    children: [new TextRun({ text, font: FONT_BODY, size: 24, bold: true })] });
}
function p(text) {
  return new Paragraph({ spacing: { line: 360, after: 60 }, indent: { firstLine: 480 }, alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: FONT_BODY, size: 24 })] });
}
function pn(text) {
  return new Paragraph({ spacing: { line: 360, after: 60 },
    children: [new TextRun({ text, font: FONT_BODY, size: 24 })] });
}
function li(text) {
  return new Paragraph({ spacing: { line: 340, after: 40 }, indent: { left: 480, hanging: 240 },
    children: [new TextRun({ text: "- " + text, font: FONT_BODY, size: 24 })] });
}
function empty() { return new Paragraph({ spacing: { after: 120 }, children: [] }); }
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

function tbl(headers, rows, cw) {
  const totalW = cw.reduce((a, b) => a + b, 0);
  const hr = new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({
    borders, width: { size: cw[i], type: WidthType.DXA },
    shading: { fill: "D9E2F3", type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: String(h), font: FONT_BODY, size: 20, bold: true })] })],
  })) });
  const dr = rows.map(row => new TableRow({ children: row.map((c, i) => new TableCell({
    borders, width: { size: cw[i], type: WidthType.DXA },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: [new Paragraph({ alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, spacing: { before: 20, after: 20 },
      children: [new TextRun({ text: String(c), font: FONT_BODY, size: 20 })] })],
  })) }));
  return new Table({ width: { size: totalW, type: WidthType.DXA }, columnWidths: cw, rows: [hr, ...dr] });
}

function ref(text) {
  return new Paragraph({ spacing: { line: 320, after: 40 },
    children: [new TextRun({ text, font: FONT_BODY, size: 21 })] });
}

async function main() {
  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT_BODY, size: 24 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: FONT_HEADING },
          paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 30, bold: true, font: FONT_HEADING },
          paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: FONT_HEADING },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } },
      ],
    },
    sections: [{
      properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: MARGIN } },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "MBA学位论文开题报告", font: FONT_BODY, size: 18, color: "888888" })] })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "第 ", font: FONT_BODY, size: 18 }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT_BODY, size: 18 }),
            new TextRun({ text: " 页", font: FONT_BODY, size: 18 })] })] }),
      },
      children: [
        // 封面
        ...Array(10).fill(null).map(() => empty()),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
          children: [new TextRun({ text: "MBA学位论文开题报告", font: FONT_HEADING, size: 44, bold: true })] }),
        empty(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
          children: [new TextRun({ text: "REITs对受困房企的变革效应研究", font: FONT_HEADING, size: 40, bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
          children: [new TextRun({ text: "\u2014\u2014以大悦城为例", font: FONT_HEADING, size: 36 })] }),
        ...Array(8).fill(null).map(() => empty()),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
          children: [new TextRun({ text: "申请人：江峰", font: FONT_BODY, size: 28 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
          children: [new TextRun({ text: "研究方向：房地产金融与资产证券化", font: FONT_BODY, size: 28 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
          children: [new TextRun({ text: "指导教师：（待填写）", font: FONT_BODY, size: 28 })] }),
        ...Array(3).fill(null).map(() => empty()),
        new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "2026年4月", font: FONT_BODY, size: 28 })] }),
        pb(),

        // 一、研究背景与意义
        h1("一、研究背景与意义"),
        h2("1.1 研究背景"),
        h3("1.1.1 宏观背景"),
        pn("行业深度调整：自2021年起，中国房地产行业进入深度调整阶段，多家房企面临严峻的财务困境。"),
        pn("REITs政策支持体系：2020年4月，中国证监会与国家发展改革委联合发布REITs试点通知，标志着中国公募REITs市场正式启动。"),
        pn("市场规模持续扩容：截至2024年底，中国公募REITs市场总规模已达1,661.64亿元。"),
        pn("政策导向明确：2024年REITs试点范围扩展至消费基础设施领域。"),

        h3("1.1.2 微观背景"),
        pn("大悦城控股2024年首次出现年度亏损，净利润-29.77亿元，同比下降103.14%。经营现金流净额66.17亿元，同比下降37.82%；筹资现金流净流出93.14亿元。79.31%的营业收入依赖于商品房销售，业务结构高度单一。"),
        pn("2024年5月24日，大悦城申报华夏大悦城购物中心REIT，发行规模33亿元，成为西南地区首单消费基础设施REITs。"),

        h2("1.2 研究意义"),
        h3("理论意义"),
        li("丰富REITs理论应用场景，从受困房企视角切入"),
        li("深化财务困境研究维度，系统探讨REITs作为财务困境解决方案的作用机制"),
        li("拓展资产证券化理论体系，探索本土化应用"),
        li("构建\u201c财务困境-REITs救援-财务改善\u201d的整合理论框架"),

        h3("实践意义"),
        li("为受困房企提供REITs应用的决策依据"),
        li("为投资者提供REITs投资价值评估框架"),
        li("为政策制定者提供REITs政策优化参考"),
        li("指导行业从重资产开发向轻资产运营转型"),

        h2("1.3 研究创新点"),
        h4("视角创新"),
        pn("首次聚焦受困房企视角，打破现有研究多关注健康企业的局限。"),
        h4("方法创新"),
        pn("采用Yin(2013)案例研究框架，构建\u201c四机制为核心+5D为补充\u201d的整合分析框架。DID降级为探索性补充分析，明确标注样本量限制。"),
        h4("应用创新"),
        pn("基于真实案例分析，为受困房企提供具有可操作性的REITs应用建议。"),

        // 二、文献综述
        h1("二、文献综述"),
        h2("2.1 REITs理论研究"),
        pn("REITs是一种通过发行收益凭证汇集投资者资金进行不动产投资经营管理的基金组织形式。全球REITs市场始于1960年美国，2020年在中国正式启动试点。"),
        h2("2.2 财务困境理论研究"),
        pn("Altman（1968）率先提出财务困境概念，将其界定为企业无法偿还到期债务的财务状态。中国房企财务困境具有高杠杆运作、投资周期长、政策敏感性强等特殊性。"),
        h2("2.3 研究缺口"),
        li("视角缺口：缺乏从受困房企视角的REITs应用研究"),
        li("机制缺口：REITs缓解财务困境的具体机制不够明确"),
        li("实证缺口：基于中国本土案例的实证研究不足"),
        li("比较缺口：不同类型房企REITs应用的比较研究较为缺乏"),

        // 三、研究内容与方法
        h1("三、研究内容与方法"),
        h2("3.1 核心研究问题"),
        pn("REITs发行对受困房企的财务困境缓解效应如何？具体分解为四个子问题：资产负债结构影响、现金流状况改善、市场价值效应和作用机制分析。"),

        h2("3.2 研究方法"),
        h3("3.2.1 核心方法论：Yin案例研究框架"),
        pn("研究问题类型为\u201cHow/Why\u201d型问题，四机制理论框架提供理论预期，大悦城为单案例深度分析，模式匹配检验理论框架解释力。"),

        h3("3.2.2 方法组合设计"),
        p("核心方法为Yin案例研究法，辅助方法包括财务指标趋势对比、事件研究法和比较分析法，探索性方法为DID模型（标注样本量限制）。"),

        h3("3.2.3 商学院战略管理工具组合"),
        p("研究融入PEST分析（宏观环境）、波特五力模型（行业分析）、SWOT分析（企业战略）和STP分析（市场定位），与四机制形成\u201c战略层+机制层\u201d的双轨分析体系。"),

        h2("3.3 研究框架"),
        p("核心理论框架是\u201cREITs对财务困境的缓解效应四机制\u201d：融资结构优化机制（降低融资成本、优化债务期限结构、增加融资渠道多样性）、现金流改善机制（提升租金收入稳定性、改善经营性现金流、降低财务费用支出）、资产负债重构机制（提升资产周转效率、优化资本结构、改善偿债能力指标）和运营效率提升机制（专业化运营管理、降低经营成本、提升投资回报率）。"),

        // 四、研究设计
        h1("四、研究设计"),
        h2("4.1 样本选择"),
        p("核心案例为大悦城控股（2024年首次年度亏损，2024年5月24日申报REITs）。参照案例为万科（转型参照）和保利发展（创新参照），定位为对比参照案例而非DID控制组。"),

        h2("4.2 研究期间"),
        p("总体研究期间：2019年1月1日至2025年12月31日。中长期跟踪验证窗口：2024年9月至2025年12月，覆盖REITs完整15个月运营周期。三阶段验证框架：短期（0-3月）信号效应验证、中期（3-12月）实质性改善验证、中长期（12月+）机制验证与趋势确认。"),

        h2("4.3 变量定义"),
        p("被解释变量包括资产负债率、经营现金流比率、累计超额收益率。解释变量包括REITs发行哑变量和企业在类型哑变量。中介变量包括融资成本率和资产周转率。控制变量包括企业规模、盈利能力、成长性和行业指数。"),

        h2("4.4 核心分析方法"),
        p("基于Yin案例研究法的模式匹配检验，包括趋势对比分析、参照对比分析和机制分解检验。DID模型探索性应用需明确标注样本量限制和统计推断局限性。"),

        // 五、研究基础与可行性
        h1("五、研究基础与可行性"),
        h2("5.1 研究基础"),
        p("理论准备方面已完成REITs理论研究、财务困境理论学习和案例研究方法论掌握。数据基础方面已完成大悦城、万科、保利等企业关键财务数据的初步收集和交叉验证。方法准备方面熟练掌握多种分析方法的综合应用。"),

        h2("5.2 研究计划"),
        h4("总研究周期：8周（4月14日 - 6月9日）"),
        tbl(
          ["阶段", "期间", "核心任务"],
          [
            ["第一阶段", "4.14-4.27", "开题报告完善与答辩准备"],
            ["第二阶段", "4.28-5.18", "文献综述、数据深度收集与实证分析"],
            ["第三阶段", "5.19-6.2", "论文初稿撰写与修改完善"],
            ["第四阶段", "6.3-6.9", "最终定稿、查重、答辩材料准备"],
          ],
          [1600, 2200, 5000]
        ),

        // 六、预期研究成果与创新
        h1("六、预期研究成果与创新"),
        h2("6.1 理论贡献"),
        li("首次系统研究REITs对受困房企的财务效应"),
        li("将REITs理论与财务困境理论相结合，拓展研究边界"),
        li("构建\u201c四机制+5D\u201d整合分析框架"),
        h2("6.2 实践价值"),
        li("为受困房企提供REITs应用的决策依据"),
        li("为投资者提供REITs投资价值评估工具"),
        li("为政策制定者提供政策优化建议"),

        // 七、研究局限与改进方向
        h1("七、研究局限与改进方向"),
        h2("7.1 研究局限"),
        li("案例研究局限性：单案例研究外部效度有限"),
        li("样本量限制：DID分析因18个观测值仅作为探索性补充"),
        li("数据时间跨度：中长期效应验证仍需持续跟踪"),
        li("内生性问题：企业选择发行REITs可能存在选择性偏误"),

        h2("7.2 改进方向"),
        li("扩大样本范围，进行多案例比较研究"),
        li("延长研究时间跨度，分析长期效应"),
        li("深化机制分析，采用中介效应和调节效应分析"),
        li("拓展研究视角，从投资者、监管者视角开展研究"),

        // 八、参考文献
        h1("八、参考文献"),
        ref("[1] 中国证监会, 国家发展改革委. (2020). 关于推进基础设施领域不动产投资信托基金（REITs）试点相关工作的通知."),
        ref("[2] 中国REITs市场年度报告（2024）. 中国REITs研究中心."),
        ref("[3] 大悦城控股集团股份有限公司. (2024). 2024年年度报告. 巨潮资讯网."),
        ref("[4] 华夏大悦城购物中心REIT. (2024). 招募说明书."),
        ref("[5] Ibbotson, R. G., & Siegel, L. B. (1984). Real estate returns: A comparison with other investments. AREUEA Journal, 12(3), 219-242."),
        ref("[6] Chan, S. H., Erickson, J., & Wang, K. (2003). Real estate investment trusts. Oxford University Press."),
        ref("[7] Gentry, W. M., & Mayer, C. J. (2014). The effects of property type diversification on REIT returns. Real Estate Economics, 42(1), 1-26."),
        ref("[8] Liu, C. H., & Sun, J. (2021). Real estate investment trusts and corporate restructuring. Journal of Real Estate Finance and Economics, 62(2), 245-271."),
        ref("[9] Altman, E. I. (1968). Financial ratios, discriminant analysis and the prediction of corporate bankruptcy. The Journal of Finance, 23(4), 589-609."),
        ref("[10] Platt, H. D., & Platt, M. B. (2002). Predicting corporate financial distress. Journal of Economics and Finance, 26(2), 184-199."),
        ref("[11] Yin, R. K. (2013). Case study research: Design and methods (5th ed.). Sage Publications."),
        ref("[12] Eisenhardt, K. M. (1989). Building theories from case study research. Academy of Management Review, 14(4), 532-550."),
        ref("[13] 赖一飞. (2022). MBA研究方法与论文写作. 清华大学出版社."),
        ref("[14] 李志辉. (2023). 中国房地产金融创新研究. 经济科学出版社."),
        ref("[15] 王晓东. (2024). REITs对中国房企转型的影响研究. 金融研究, 48(3), 56-72."),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = "/Users/op/WorkBuddy/科研代理/mba_paper_project/MBA开题报告_REITs对受困房企的变革效应研究.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("开题报告Word已生成: " + outPath);
}

main().catch(e => { console.error(e); process.exit(1); });
