/**
 * MBA开题报告 Word 生成器
 * 直接读取开题报告终稿v2.1 Markdown，100%内容转换
 */
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType,
        TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageBreak, PageNumber } = require("docx");

const FONT_HEADING = "SimHei";
const FONT_BODY = "SimSun";
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = { top: 1440, right: 1440, bottom: 1440, left: 1800 };

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

// ====== 复用论文生成器的 Markdown 解析器 ======
function parseInline(text) {
  const runs = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let lastIdx = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) runs.push({ text: text.slice(lastIdx, match.index), bold: false });
    if (match[2]) runs.push({ text: match[2], bold: true });
    else if (match[3]) runs.push({ text: match[3], bold: false, font: "Courier New" });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) runs.push({ text: text.slice(lastIdx), bold: false });
  return runs;
}

function parseMdTable(lines) {
  if (lines.length < 2) return null;
  const parseRow = (line) => line.split("|").slice(1, -1).map(cell => cell.trim());
  const headers = parseRow(lines[0]);
  const rows = [];
  for (let r = 2; r < lines.length; r++) {
    const row = parseRow(lines[r]);
    if (row.length === headers.length) rows.push(row);
  }
  if (rows.length === 0) return null;
  const contentW = PAGE_W - MARGIN.left - MARGIN.right;
  const colW = Math.floor(contentW / headers.length);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      borders, width: { size: colW, type: WidthType.DXA },
      shading: { fill: "D9E2F3", type: ShadingType.CLEAR },
      margins: { top: 40, bottom: 40, left: 60, right: 60 },
      verticalAlign: "center",
      children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 20, after: 20 },
        children: [new TextRun({ text: h, font: FONT_BODY, size: 20, bold: true })] })],
    })),
  });
  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      borders, width: { size: colW, type: WidthType.DXA },
      margins: { top: 30, bottom: 30, left: 60, right: 60 },
      verticalAlign: "center",
      children: [new Paragraph({ alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, spacing: { before: 10, after: 10 },
        children: [new TextRun({ text: String(cell), font: FONT_BODY, size: 20 })] })],
    })),
  }));
  return new Table({ width: { size: contentW, type: WidthType.DXA }, rows: [headerRow, ...dataRows] });
}

function parseMd(md) {
  const lines = md.split("\n");
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Skip metadata at bottom
    if (line.match(/^---\s*$/) && i > 0) {
      const next = lines.slice(i + 1).find(l => l.trim());
      if (next && next.match(/^(\*\*文档|文档版本|审核状态)/)) { i++; while (i < lines.length && !lines[i].match(/^---\s*$/)) i++; i++; continue; }
    }
    if (line.trim() === "") { i++; continue; }
    // Code block
    if (line.trim().startsWith("```")) {
      const codeLines = []; i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) { codeLines.push(lines[i]); i++; }
      i++;
      if (codeLines.length > 0) elements.push({ type: "code", text: codeLines.join("\n") });
      continue;
    }
    // Table
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tl = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) { tl.push(lines[i]); i++; }
      const t = parseMdTable(tl);
      if (t) elements.push({ type: "table", table: t });
      continue;
    }
    // Heading
    const hm = line.match(/^(#{1,4})\s+(.+)/);
    if (hm) { elements.push({ type: "heading", level: hm[1].length, text: parseInline(hm[2].trim()) }); i++; continue; }
    // Quote
    if (line.trim().startsWith(">")) {
      const ql = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) { ql.push(lines[i].trim().replace(/^>\s*/, "")); i++; }
      elements.push({ type: "quote", text: parseInline(ql.join(" ").trim()) });
      continue;
    }
    // List
    if (line.trim().startsWith("- ") || line.trim().match(/^\d+\.\s/) || line.trim().startsWith("✅") || line.trim().startsWith("🔄") || line.trim().startsWith("⚠️")) {
      while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().match(/^\d+\.\s/) || lines[i].trim().startsWith("✅") || lines[i].trim().startsWith("🔄") || lines[i].trim().startsWith("⚠️"))) {
        let item = lines[i].trim();
        let prefix = "";
        if (item.match(/^(\d+)\.\s/)) { prefix = item.match(/^(\d+)\.\s/)[1] + ". "; item = item.replace(/^\d+\.\s/, ""); }
        else if (item.startsWith("✅") || item.startsWith("🔄") || item.startsWith("⚠️")) { prefix = ""; }
        else { prefix = "• "; item = item.replace(/^- /, ""); }
        // Handle nested
        const indent = item.match(/^(\s+)/);
        const indentLevel = indent ? Math.min(indent[1].length / 2, 3) : 0;
        item = item.trim();
        elements.push({ type: "list", prefix, text: parseInline(item), indent: indentLevel });
        i++;
      }
      continue;
    }
    // HR
    if (line.trim().match(/^---+$/)) { i++; continue; }
    // Paragraph
    const pl = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].trim().startsWith("#") && !lines[i].trim().startsWith(">") && !lines[i].trim().startsWith("|") && !lines[i].trim().startsWith("- ") && !lines[i].trim().startsWith("```") && !lines[i].trim().match(/^---+$/)) { pl.push(lines[i]); i++; }
    if (pl.length > 0) {
      const ft = pl.join(" ").replace(/\s+/g, " ").trim();
      if (ft) elements.push({ type: "paragraph", text: parseInline(ft) });
    }
  }
  return elements;
}

function toWord(elements) {
  const results = [];
  for (const el of elements) {
    switch (el.type) {
      case "heading": {
        const cfg = {
          1: { heading: HeadingLevel.HEADING_1, size: 32, before: 480, after: 240 },
          2: { heading: HeadingLevel.HEADING_2, size: 28, before: 360, after: 180 },
          3: { heading: HeadingLevel.HEADING_3, size: 24, before: 240, after: 120 },
          4: { heading: HeadingLevel.HEADING_4, size: 24, before: 180, after: 120 },
        }[el.level] || { heading: HeadingLevel.HEADING_4, size: 24, before: 180, after: 120 };
        results.push(new Paragraph({
          heading: cfg.heading, spacing: { before: cfg.before, after: cfg.after },
          children: el.text.map(r => new TextRun({ text: r.text, font: FONT_HEADING, size: cfg.size, bold: true })),
        }));
        break;
      }
      case "paragraph":
        results.push(new Paragraph({
          spacing: { line: 360, after: 60 }, indent: { firstLine: 480 }, alignment: AlignmentType.JUSTIFIED,
          children: el.text.map(r => new TextRun({ text: r.text, font: r.font || FONT_BODY, size: 24, bold: r.bold || false })),
        }));
        break;
      case "quote":
        results.push(new Paragraph({
          spacing: { line: 320, after: 60 }, indent: { left: 400 },
          children: el.text.map(r => new TextRun({ text: r.text, font: FONT_BODY, size: 21, bold: r.bold || false, italics: true, color: "555555" })),
        }));
        break;
      case "list": {
        const indent = (el.indent || 0) * 200;
        const trs = [
          ...(el.prefix ? [new TextRun({ text: el.prefix, font: FONT_BODY, size: 24 })] : []),
          ...el.text.map(r => new TextRun({ text: r.text, font: r.font || FONT_BODY, size: 24, bold: r.bold || false })),
        ];
        results.push(new Paragraph({
          spacing: { line: 340, after: 40 },
          indent: { left: 480 + indent, hanging: el.prefix ? 280 : 0 },
          children: trs,
        }));
        break;
      }
      case "code":
        el.text.split("\n").forEach(cl => {
          results.push(new Paragraph({
            spacing: { line: 280, after: 0 }, indent: { left: 360 },
            children: [new TextRun({ text: cl || " ", font: "Courier New", size: 18, color: "333333" })],
          }));
        });
        break;
      case "table":
        results.push(el.table);
        results.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
        break;
    }
  }
  return results;
}

// ====== 封面 ======
function coverPage() {
  return [
    ...Array(6).fill(null).map(() => new Paragraph({ spacing: { after: 200 }, children: [] })),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 },
      children: [new TextRun({ text: "MBA学位论文开题报告", font: FONT_HEADING, size: 52, bold: true })] }),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
      children: [new TextRun({ text: "REITs对受困房企的变革效应研究", font: FONT_HEADING, size: 44, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
      children: [new TextRun({ text: "——以大悦城为例", font: FONT_HEADING, size: 36 })] }),
    ...Array(8).fill(null).map(() => new Paragraph({ spacing: { after: 200 }, children: [] })),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
      children: [new TextRun({ text: "申请人：", font: FONT_BODY, size: 28 }), new TextRun({ text: "江峰", font: FONT_BODY, size: 28, underline: { type: "single" } })] }),
    new Paragraph({ spacing: { after: 60 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
      children: [new TextRun({ text: "研究方向：", font: FONT_BODY, size: 28 }), new TextRun({ text: "房地产金融与资产证券化", font: FONT_BODY, size: 28, underline: { type: "single" } })] }),
    new Paragraph({ spacing: { after: 60 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
      children: [new TextRun({ text: "指导教师：", font: FONT_BODY, size: 28 }), new TextRun({ text: "　　　　　", font: FONT_BODY, size: 28, underline: { type: "single" } })] }),
    ...Array(4).fill(null).map(() => new Paragraph({ spacing: { after: 200 }, children: [] })),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
      children: [new TextRun({ text: "二〇二六年四月", font: FONT_BODY, size: 28 })] }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

async function main() {
  console.log("读取开题报告 Markdown...");
  const mdPath = "/Users/op/WorkBuddy/科研代理/mba_paper_project/2_开题准备/开题报告终稿_v2.1.md";
  const md = fs.readFileSync(mdPath, "utf-8");
  const elements = parseMd(md);
  const wordElements = toWord(elements);

  console.log(`解析完成: ${wordElements.length} 个元素`);

  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT_BODY, size: 24 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: FONT_HEADING },
          paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: FONT_HEADING },
          paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: FONT_HEADING },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } },
        { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: FONT_BODY },
          paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 3 } },
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
      children: [...coverPage(), ...wordElements],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = "/Users/op/WorkBuddy/科研代理/mba_paper_project/MBA开题报告_REITs对受困房企的变革效应研究.docx";
  fs.writeFileSync(outPath, buffer);
  console.log(`\n✅ 开题报告Word已生成: ${outPath}`);
  console.log(`文件大小: ${(buffer.length / 1024).toFixed(1)} KB`);
}

main().catch(e => { console.error(e); process.exit(1); });
