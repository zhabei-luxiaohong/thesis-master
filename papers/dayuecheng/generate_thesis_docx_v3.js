/**
 * MBA学位论文完整版 Word 生成器 v3
 * 直接读取 Markdown 深度优化版源文件，100%内容转换为 Word
 * 
 * v3 修复内容：
 * - 表格：列数不一致时自动补齐，不再丢弃行
 * - 列表：支持 emoji 前缀（✅🔄⚠️❌ 等）和树状图字符（├└→↓等）
 * - 段落：不再跳过特殊字符开头的行
 * - 标题：标题文本中的 **加粗** 正确保留
 * - 换行：<br> 标签转为实际换行
 */
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat,
        TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageBreak, PageNumber, Tab, TabStopPosition, TabStopType } = require("docx");

// ============== 配置 ==============
const FONT_HEADING = "SimHei";  // 黑体
const FONT_BODY = "SimSun";     // 宋体
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = { top: 1440, right: 1440, bottom: 1440, left: 1800 };

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

const BASE = "/Users/op/WorkBuddy/科研代理/mba_paper_project/6_论文草稿";

// ============== 工具函数 ==============

/** 判断行是否"有实质内容" */
function hasContent(line) {
  return line.trim().length > 0;
}

/** 判断行是否以Markdown结构语法开头 */
function isStructural(line) {
  const t = line.trim();
  if (t === "") return true; // 空行
  if (t.startsWith("#")) return true;
  if (t.startsWith(">")) return true;
  if (t.startsWith("|")) return true;
  if (t.startsWith("```")) return true;
  if (t.match(/^---+$/)) return true;
  // 列表
  if (t.startsWith("- ") || t.match(/^\d+\.\s/)) return true;
  // emoji列表
  if (t.match(/^[✅🔄⚠️❌📊📈📉🔑💡🎯📌🔍✓✗★◆●○■□△▽]/)) return true;
  // 树状图字符
  if (t.match(/^[├└┌┐└─│→←↑↓►▶◀]/)) return true;
  return false;
}

// ============== Markdown 解析器 v3 ==============

function parseMarkdown(md) {
  const lines = md.split("\n");
  const elements = [];
  let i = 0;
  let lostCount = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 跳过文档信息块（--- 包围的元数据区域）
    if (line.match(/^---\s*$/) && i > 0) {
      const nextNonEmpty = lines.slice(i + 1).find(l => l.trim());
      if (nextNonEmpty && nextNonEmpty.match(/^(\*\*文档信息|文档版本|\*\*创建|版本|更新|创建人|数据截止|核心|下一步|说明)/)) {
        i++;
        while (i < lines.length && !lines[i].match(/^---\s*$/)) i++;
        i++;
        continue;
      }
    }

    // 空行
    if (line.trim() === "") { i++; continue; }

    // 代码块 (```)
    if (line.trim().startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      if (codeLines.length > 0) {
        elements.push({ type: "code", text: codeLines.join("\n") });
      }
      continue;
    }

    // 表格
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const table = parseTable(tableLines);
      if (table) elements.push(table);
      else {
        // 表格解析失败，转为普通文本行
        tableLines.forEach(tl => {
          const cleanLine = tl.replace(/^\|/, "").replace(/\|$/, "").replace(/\|/g, "  ").trim();
          if (cleanLine && !cleanLine.match(/^[-:\s]+$/)) {
            elements.push({ type: "paragraph", text: processInline(cleanLine) });
          }
        });
      }
      continue;
    }

    // 标题 (# ~ ####)
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = processInline(headingMatch[2].trim());
      elements.push({ type: "heading", level, text });
      i++;
      continue;
    }

    // 引用 (> 开头)
    if (line.trim().startsWith(">")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      elements.push({
        type: "quote",
        text: processInline(quoteLines.join(" ").trim())
      });
      continue;
    }

    // 列表匹配（扩展版：支持 emoji/树状图/普通列表）
    if (isListItem(line)) {
      const listItems = [];
      while (i < lines.length && isListItem(lines[i])) {
        listItems.push(lines[i].trim());
        i++;
      }
      listItems.forEach(item => {
        const { indent, prefix, text } = parseListItem(item);
        if (indent > 0) {
          elements.push({
            type: "list_nested",
            prefix: prefix || "",
            text: processInline(text.trim()),
            indent: indent
          });
        } else {
          elements.push({
            type: "list",
            prefix: prefix || "",
            text: processInline(text.trim())
          });
        }
      });
      continue;
    }

    // 水平线 (---)
    if (line.trim().match(/^---+$/)) {
      i++;
      continue;
    }

    // 普通段落 — v3: 只在遇到明确的分隔符时停止
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== "" &&
           !lines[i].trim().startsWith("#") &&
           !lines[i].trim().startsWith(">") &&
           !lines[i].trim().startsWith("|") &&
           !lines[i].trim().startsWith("```") &&
           !lines[i].trim().match(/^---+$/) &&
           !isListItem(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      const fullText = paraLines.join(" ").replace(/\s+/g, " ").trim();
      if (fullText) {
        elements.push({
          type: "paragraph",
          text: processInline(fullText)
        });
      }
    }
  }

  return elements;
}

/** 判断是否是列表项（包括 emoji 和树状图字符） */
function isListItem(line) {
  const t = line.trim();
  if (t.startsWith("- ") || t.match(/^\d+\.\s/)) return true;
  if (t.match(/^[✅🔄⚠️❌📊📈📉🔑💡🎯📌🔍✓✗]/)) return true;
  if (t.match(/^[├└┌┐─│→←↑↓►▶◀]/)) return true;
  return false;
}

/** 解析列表项，返回 { indent, prefix, text } */
function parseListItem(item) {
  const t = item;
  
  // 计算缩进
  const indentMatch = t.match(/^(\s+)/);
  const indent = indentMatch ? Math.min(Math.floor(indentMatch[1].length / 2), 3) : 0;
  const content = t.trim();
  
  // 数字列表
  const numMatch = content.match(/^(\d+)\.\s/);
  if (numMatch) {
    return { indent, prefix: numMatch[1] + ". ", text: content.replace(/^\d+\.\s/, "") };
  }
  
  // 普通列表
  if (content.startsWith("- ")) {
    return { indent, prefix: "", text: content.replace(/^- /, "") };
  }
  
  // emoji 列表
  if (content.match(/^[✅🔄⚠️❌📊📈📉🔑💡🎯📌🔍✓✗]/)) {
    return { indent, prefix: "", text: content };
  }
  
  // 树状图列表
  if (content.match(/^[├└┌┐─│→←↑↓►▶◀]/)) {
    // 去掉树状图前缀，保留文本
    const cleanText = content.replace(/^[├└┌┐─│►▶◀→←↑↓\s]+/, "").trim();
    return { indent, prefix: "", text: cleanText || content };
  }
  
  return { indent, prefix: "", text: content };
}

/**
 * 处理行内格式：**加粗**、*斜体*、`代码`、~~删除线~~
 */
function processInline(text) {
  const runs = [];
  const regex = /(\*\*(.+?)\*\*|\*([^*]+?)\*|`([^`]+)`|~~(.+?)~~)/g;
  let lastIdx = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      runs.push({ text: text.slice(lastIdx, match.index), bold: false });
    }
    if (match[2]) {
      runs.push({ text: match[2], bold: true });
    } else if (match[3]) {
      runs.push({ text: match[3], bold: false, italics: true });
    } else if (match[4]) {
      runs.push({ text: match[4], bold: false, font: "Courier New" });
    } else if (match[5]) {
      runs.push({ text: match[5], bold: false, strike: true });
    }
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) {
    runs.push({ text: text.slice(lastIdx), bold: false });
  }
  if (runs.length === 0) runs.push({ text: text || " ", bold: false });
  return runs;
}

/**
 * 解析 Markdown 表格为 Word Table 对象
 * v3: 列数不一致时自动补齐空单元格
 */
function parseTable(lines) {
  if (lines.length < 2) return null;

  const parseRow = (line) => {
    return line.split("|").slice(1, -1).map(cell => cell.trim());
  };

  const headers = parseRow(lines[0]);
  if (headers.length === 0) return null;
  
  const maxCols = headers.length;
  // skip separator line (line[1])
  const rows = [];
  for (let r = 2; r < lines.length; r++) {
    let row = parseRow(lines[r]);
    // v3: 列数不一致时补齐
    while (row.length < maxCols) row.push("");
    if (row.length > maxCols) row = row.slice(0, maxCols);
    // 跳过纯分隔行
    if (row.every(c => c.match(/^[-:\s]+$/))) continue;
    rows.push(row);
  }

  if (rows.length === 0) return null;

  const contentW = PAGE_W - MARGIN.left - MARGIN.right;
  const colCount = maxCols;
  const colWidth = Math.floor(contentW / colCount);

  // 处理表头单元格中的加粗
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => {
      const runs = [];
      const boldRegex = /\*\*(.+?)\*\*/g;
      let m, last = 0;
      const plain = h;
      while ((m = boldRegex.exec(plain)) !== null) {
        if (m.index > last) runs.push({ text: plain.slice(last, m.index), bold: false });
        runs.push({ text: m[1], bold: true });
        last = m.index + m[0].length;
      }
      if (last < plain.length) runs.push({ text: plain.slice(last), bold: false });
      if (runs.length === 0) runs.push({ text: h, bold: true });
      
      return new TableCell({
        borders,
        width: { size: colWidth, type: WidthType.DXA },
        shading: { fill: "D9E2F3", type: ShadingType.CLEAR },
        margins: { top: 40, bottom: 40, left: 60, right: 60 },
        verticalAlign: "center",
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 20, after: 20 },
          children: runs.map(r => new TextRun({ text: r.text, font: FONT_BODY, size: 20, bold: r.bold })),
        })],
      });
    }),
  });

  // 处理数据单元格中的加粗
  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, ci) => {
      const runs = processInline(cell);
      return new TableCell({
        borders,
        width: { size: colWidth, type: WidthType.DXA },
        margins: { top: 30, bottom: 30, left: 60, right: 60 },
        verticalAlign: "center",
        children: [new Paragraph({
          alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
          spacing: { before: 10, after: 10 },
          children: runs.map(r => new TextRun({
            text: r.text,
            font: r.font || FONT_BODY,
            size: 20,
            bold: r.bold || false,
            italics: r.italics || false,
            strike: r.strike || false,
          })),
        })],
      });
    }),
  }));

  return {
    type: "table",
    table: new Table({
      width: { size: contentW, type: WidthType.DXA },
      rows: [headerRow, ...dataRows],
    }),
  };
}

/**
 * 将解析后的元素转换为 Word Paragraph/Table
 */
function elementsToWord(elements, isRefSection = false) {
  const results = [];

  for (const el of elements) {
    switch (el.type) {
      case "heading": {
        const levelMap = {
          1: { heading: HeadingLevel.HEADING_1, size: 32, before: 480, after: 240 },
          2: { heading: HeadingLevel.HEADING_2, size: 28, before: 360, after: 180 },
          3: { heading: HeadingLevel.HEADING_3, size: 24, before: 240, after: 120 },
          4: { heading: HeadingLevel.HEADING_4, size: 24, before: 180, after: 120 },
        };
        const config = levelMap[el.level] || levelMap[4];
        results.push(new Paragraph({
          heading: config.heading,
          spacing: { before: config.before, after: config.after },
          children: el.text.map(r => new TextRun({
            text: r.text,
            font: FONT_HEADING,
            size: config.size,
            bold: true,
          })),
        }));
        break;
      }

      case "paragraph": {
        const size = isRefSection ? 21 : 24;
        results.push(new Paragraph({
          spacing: { line: 360, after: 60 },
          indent: isRefSection ? {} : { firstLine: 480 },
          alignment: AlignmentType.JUSTIFIED,
          children: el.text.map(r => new TextRun({
            text: r.text,
            font: r.font || FONT_BODY,
            size,
            bold: r.bold || false,
            italics: r.italics || false,
            strike: r.strike || false,
          })),
        }));
        break;
      }

      case "quote": {
        results.push(new Paragraph({
          spacing: { line: 320, after: 60 },
          indent: { left: 400 },
          children: el.text.map(r => new TextRun({
            text: r.text,
            font: FONT_BODY,
            size: 21,
            bold: r.bold || false,
            italics: true,
            color: "555555",
          })),
        }));
        break;
      }

      case "list": {
        const size = isRefSection ? 21 : 24;
        const trs = [
          ...(el.prefix ? [new TextRun({ text: el.prefix, font: FONT_BODY, size })] : []),
          ...el.text.map(r => new TextRun({
            text: r.text,
            font: r.font || FONT_BODY,
            size,
            bold: r.bold || false,
          })),
        ];
        results.push(new Paragraph({
          spacing: { line: 340, after: 40 },
          indent: { left: 480, hanging: el.prefix ? 280 : 0 },
          children: trs,
        }));
        break;
      }

      case "list_nested": {
        const indent = Math.min(el.indent || 0, 3);
        const size = isRefSection ? 21 : 24;
        results.push(new Paragraph({
          spacing: { line: 340, after: 40 },
          indent: { left: 480 + indent * 240, hanging: 200 },
          children: [
            new TextRun({ text: el.prefix || "", font: FONT_BODY, size }),
            ...el.text.map(r => new TextRun({
              text: r.text,
              font: r.font || FONT_BODY,
              size,
              bold: r.bold || false,
            })),
          ],
        }));
        break;
      }

      case "code": {
        el.text.split("\n").forEach(cl => {
          results.push(new Paragraph({
            spacing: { line: 280, after: 0 },
            indent: { left: 360 },
            children: [new TextRun({
              text: cl || " ",
              font: "Courier New",
              size: 18,
              color: "333333",
            })],
          }));
        });
        break;
      }

      case "table": {
        results.push(el.table);
        results.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
        break;
      }
    }
  }

  return results;
}

// ============== 封面 ==============
function coverPage() {
  return [
    ...Array(6).fill(null).map(() => new Paragraph({ spacing: { after: 200 }, children: [] })),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({ text: "MBA学位论文", font: FONT_HEADING, size: 52, bold: true })],
    }),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "REITs对受困房企的变革效应研究", font: FONT_HEADING, size: 44, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "——以大悦城为例", font: FONT_HEADING, size: 36 })],
    }),
    ...Array(8).fill(null).map(() => new Paragraph({ spacing: { after: 200 }, children: [] })),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "申请人：", font: FONT_BODY, size: 28 }),
        new TextRun({ text: "江峰", font: FONT_BODY, size: 28, underline: { type: "single" } }),
      ],
    }),
    new Paragraph({ spacing: { after: 60 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "研究方向：", font: FONT_BODY, size: 28 }),
        new TextRun({ text: "房地产金融与资产证券化", font: FONT_BODY, size: 28, underline: { type: "single" } }),
      ],
    }),
    new Paragraph({ spacing: { after: 60 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "指导教师：", font: FONT_BODY, size: 28 }),
        new TextRun({ text: "　　　　　", font: FONT_BODY, size: 28, underline: { type: "single" } }),
      ],
    }),
    ...Array(4).fill(null).map(() => new Paragraph({ spacing: { after: 200 }, children: [] })),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "二〇二六年四月", font: FONT_BODY, size: 28 })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============== 目录 ==============
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
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============== 主函数 ==============
async function main() {
  console.log("=== MBA论文Word生成器 v3 ===");
  console.log("开始读取 Markdown 源文件...\n");

  const chapters = [
    { file: "第一章_绪论_去AI化版.md", label: "第一章" },
    { file: "第二章_文献综述_去AI化版.md", label: "第二章" },
    { file: "第三章_研究设计_去AI化版.md", label: "第三章" },
    { file: "第四章_大悦城案例分析_去AI化版.md", label: "第四章" },
    { file: "第五章_对比案例分析_去AI化版.md", label: "第五章" },
    { file: "第六章_结论与建议_去AI化版.md", label: "第六章" },
  ];

  const allChildren = [];
  allChildren.push(...coverPage());
  allChildren.push(...tocPage());

  for (const ch of chapters) {
    const filePath = path.join(BASE, ch.file);
    console.log(`  读取: ${ch.file}`);
    const md = fs.readFileSync(filePath, "utf-8");

    let cleaned = md;
    cleaned = cleaned.replace(/^>\s*版本[^\n]*\n/g, "");
    cleaned = cleaned.replace(/^>\s*核心变更[^\n]*\n/g, "");
    cleaned = cleaned.replace(/^>\s*定位[^\n]*\n/g, "");

    const elements = parseMarkdown(cleaned);
    const wordElements = elementsToWord(elements);
    allChildren.push(...wordElements);
    console.log(`  ${ch.label}: ${elements.length} 个MD元素 → ${wordElements.length} 个Word元素`);
  }

  // 参考文献
  console.log(`\n  读取: 参考文献.md`);
  const refMd = fs.readFileSync(path.join(BASE, "参考文献.md"), "utf-8");
  const refElements = parseMarkdown(refMd);
  const refWordElements = elementsToWord(refElements, true);
  allChildren.push(...refWordElements);
  console.log(`  参考文献: ${refElements.length} 个MD元素 → ${refWordElements.length} 个Word元素`);

  console.log(`\n总计: ${allChildren.length} 个 Word 元素`);

  // 构建文档
  console.log("\n构建 Word 文档...");
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT_BODY, size: 24 },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: FONT_HEADING },
          paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: FONT_HEADING },
          paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 1 },
        },
        {
          id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: FONT_HEADING },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
        },
        {
          id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: FONT_BODY },
          paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 3 },
        },
      ],
    },
    sections: [{
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
            children: [new TextRun({
              text: "MBA学位论文 — REITs对受困房企的变革效应研究",
              font: FONT_BODY, size: 18, color: "888888"
            })],
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
      children: allChildren,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = "/Users/op/WorkBuddy/科研代理/mba_paper_project/MBA学位论文_REITs对受困房企的变革效应研究_完整版.docx";
  fs.writeFileSync(outPath, buffer);
  console.log(`\n✅ 论文Word已生成: ${outPath}`);
  console.log(`文件大小: ${(buffer.length / 1024).toFixed(1)} KB`);
}

main().catch(e => { console.error(e); process.exit(1); });
