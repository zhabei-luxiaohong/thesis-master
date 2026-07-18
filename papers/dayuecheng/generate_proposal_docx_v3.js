/**
 * MBA开题报告 Word 生成器 v3
 * 直接读取开题报告终稿v2.1 Markdown，100%内容转换
 * v3: 同步修复表格列数补齐、emoji列表识别、段落收集逻辑
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

// ====== v3 解析器 ======

function processInline(text) {
  const runs = [];
  const regex = /(\*\*(.+?)\*\*|\*([^*]+?)\*|`([^`]+)`)/g;
  let lastIdx = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) runs.push({ text: text.slice(lastIdx, match.index), bold: false });
    if (match[2]) runs.push({ text: match[2], bold: true });
    else if (match[3]) runs.push({ text: match[3], bold: false, italics: true });
    else if (match[4]) runs.push({ text: match[4], bold: false, font: "Courier New" });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) runs.push({ text: text.slice(lastIdx), bold: false });
  if (runs.length === 0) runs.push({ text: text || " ", bold: false });
  return runs;
}

function isListItem(line) {
  const t = line.trim();
  if (t.startsWith("- ") || t.match(/^\d+\.\s/)) return true;
  if (t.match(/^[✅🔄⚠️❌📊📈📉🔑💡🎯📌🔍✓✗]/)) return true;
  if (t.match(/^[├└┌┐─│→←↑↓►▶◀]/)) return true;
  return false;
}

function parseListItem(item) {
  const t = item;
  const indentMatch = t.match(/^(\s+)/);
  const indent = indentMatch ? Math.min(Math.floor(indentMatch[1].length / 2), 3) : 0;
  const content = t.trim();
  const numMatch = content.match(/^(\d+)\.\s/);
  if (numMatch) return { indent, prefix: numMatch[1] + ". ", text: content.replace(/^\d+\.\s/, "") };
  if (content.startsWith("- ")) return { indent, prefix: "", text: content.replace(/^- /, "") };
  if (content.match(/^[✅🔄⚠️❌📊📈📉🔑💡🎯📌🔍✓✗]/)) return { indent, prefix: "", text: content };
  if (content.match(/^[├└┌┐─│►▶◀→←↑↓]/)) {
    const cleanText = content.replace(/^[├└┌┐─│►▶◀→←↑↓\s]+/, "").trim();
    return { indent, prefix: "", text: cleanText || content };
  }
  return { indent, prefix: "", text: content };
}

function parseMdTable(lines) {
  if (lines.length < 2) return null;
  const parseRow = (line) => line.split("|").slice(1, -1).map(cell => cell.trim());
  const headers = parseRow(lines[0]);
  if (headers.length === 0) return null;
  const maxCols = headers.length;
  const rows = [];
  for (let r = 2; r < lines.length; r++) {
    let row = parseRow(lines[r]);
    while (row.length < maxCols) row.push("");
    if (row.length > maxCols) row = row.slice(0, maxCols);
    if (row.every(c => c.match(/^[-:\s]+$/))) continue;
    rows.push(row);
  }
  if (rows.length === 0) return null;
  const contentW = PAGE_W - MARGIN.left - MARGIN.right;
  const colW = Math.floor(contentW / maxCols);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => {
      const runs = processInline(h);
      return new TableCell({
        borders, width: { size: colW, type: WidthType.DXA },
        shading: { fill: "D9E2F3", type: ShadingType.CLEAR },
        margins: { top: 40, bottom: 40, left: 60, right: 60 },
        verticalAlign: "center",
        children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 20, after: 20 },
          children: runs.map(r => new TextRun({ text: r.text, font: FONT_BODY, size: 20, bold: r.bold })) })],
      });
    }),
  });
  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, ci) => {
      const runs = processInline(cell);
      return new TableCell({
        borders, width: { size: colW, type: WidthType.DXA },
        margins: { top: 30, bottom: 30, left: 60, right: 60 },
        verticalAlign: "center",
        children: [new Paragraph({ alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, spacing: { before: 10, after: 10 },
          children: runs.map(r => new TextRun({ text: r.text, font: r.font || FONT_BODY, size: 20, bold: r.bold || false })) })],
      });
    }),
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
      if (next && next.match(/^(\*\*文档|文档版本|审核状态|说明)/)) { i++; while (i < lines.length && !lines[i].match(/^---\s*$/)) i++; i++; continue; }
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
      else {
        tl.forEach(l => {
          const clean = l.replace(/^\|/, "").replace(/\|$/, "").replace(/\|/g, "  ").trim();
          if (clean && !clean.match(/^[-:\s]+$/)) elements.push({ type: "paragraph", text: processInline(clean) });
        });
      }
      continue;
    }
    // Heading
    const hm = line.match(/^(#{1,4})\s+(.+)/);
    if (hm) { elements.push({ type: "heading", level: hm[1].length, text: processInline(hm[2].trim()) }); i++; continue; }
    // Quote
    if (line.trim().startsWith(">")) {
      const ql = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) { ql.push(lines[i].trim().replace(/^>\s*/, "")); i++; }
      elements.push({ type: "quote", text: processInline(ql.join(" ").trim()) });
      continue;
    }
    // List (v3: 扩展支持 emoji 和树状图)
    if (isListItem(line)) {
      while (i < lines.length && isListItem(lines[i])) {
        const { indent, prefix, text } = parseListItem(lines[i].trim());
        if (indent > 0) {
          elements.push({ type: "list", prefix: prefix || "", text: processInline(text.trim()), indent });
        } else {
          elements.push({ type: "list", prefix: prefix || "", text: processInline(text.trim()) });
        }
        i++;
      }
      continue;
    }
    // HR
    if (line.trim().match(/^---+$/)) { i++; continue; }
    // Paragraph (v3: 使用 isListItem 检查)
    const pl = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].trim().startsWith("#") && !lines[i].trim().startsWith(">") && !lines[i].trim().startsWith("|") && !lines[i].trim().startsWith("```") && !lines[i].trim().match(/^---+$/) && !isListItem(lines[i])) { pl.push(lines[i]); i++; }
    if (pl.length > 0) {
      const ft = pl.join(" ").replace(/\s+/g, " ").trim();
      if (ft) elements.push({ type: "paragraph", text: processInline(ft) });
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
  console.log("=== MBA开题报告Word生成器 v3 ===\n");
  const mdPath = "/Users/op/WorkBuddy/科研代理/mba_paper_project/2_开题准备/开题报告终稿_v2.1.md";
  const md = fs.readFileSync(mdPath, "utf-8");
  const elements = parseMd(md);
  const wordElements = toWord(elements);

  console.log(`解析完成: ${elements.length} 个MD元素 → ${wordElements.length} 个Word元素`);

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
