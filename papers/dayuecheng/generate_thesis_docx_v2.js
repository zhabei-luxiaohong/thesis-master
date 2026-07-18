/**
 * MBA学位论文完整版 Word 生成器
 * 直接读取 Markdown 深度优化版源文件，100%内容转换为 Word
 * 格式标准：MBA论文格式（黑体标题、宋体正文、小四号、1.5倍行距）
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

// ============== Markdown 解析器 ==============

/**
 * 解析 Markdown 文本为 Word 段落/表格数组
 * 支持：# ~ #### 标题，> 引用/注释，**加粗**，| 表格，- 列表，``` 代码块，---
 */
function parseMarkdown(md) {
  const lines = md.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 跳过文档信息块
    if (line.match(/^---\s*$/) && i > 0) {
      // 检查是否是文档底部的信息块
      const nextNonEmpty = lines.slice(i + 1).find(l => l.trim());
      if (nextNonEmpty && nextNonEmpty.match(/^(\*\*文档信息|文档版本|\*\*创建|版本|更新|创建人|数据截止|核心|下一步)/)) {
        i++;
        while (i < lines.length && !lines[i].match(/^---\s*$/)) i++;
        i++;
        continue;
      }
    }

    // 空行
    if (line.trim() === "") { i++; continue; }

    // 代码块 (```) - 转为灰色背景的等宽文本
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      if (codeLines.length > 0) {
        elements.push({
          type: "code",
          text: codeLines.join("\n")
        });
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

    // 列表 (- 开头)
    if (line.trim().startsWith("- ") || line.trim().match(/^\d+\.\s/)) {
      const listItems = [];
      while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().match(/^\d+\.\s/))) {
        listItems.push(lines[i].trim());
        i++;
      }
      listItems.forEach(item => {
        const isNumbered = item.match(/^(\d+)\.\s/);
        let text = item;
        let prefix = "• ";
        if (isNumbered) {
          prefix = isNumbered[1] + ". ";
          text = text.replace(/^\d+\.\s/, "");
        } else {
          text = text.replace(/^- /, "");
        }
        // Handle nested bullet
        const nestedMatch = text.match(/^(\s+)-\s*(.+)/);
        if (nestedMatch) {
          elements.push({
            type: "list_nested",
            prefix: prefix.trim(),
            text: processInline(nestedMatch[2].trim()),
            indent: nestedMatch[1].length
          });
        } else {
          elements.push({
            type: "list",
            prefix,
            text: processInline(text.trim())
          });
        }
      });
      continue;
    }

    // 水平线 (---)
    if (line.trim().match(/^---+$/)) {
      // just skip, or add a page break for major sections
      i++;
      continue;
    }

    // 普通段落
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== "" &&
           !lines[i].trim().startsWith("#") &&
           !lines[i].trim().startsWith(">") &&
           !lines[i].trim().startsWith("|") &&
           !lines[i].trim().startsWith("- ") &&
           !lines[i].trim().match(/^\d+\.\s/) &&
           !lines[i].trim().startsWith("```") &&
           !lines[i].trim().match(/^---+$/)) {
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

/**
 * 处理行内格式：**加粗**、*斜体*、`代码`
 */
function processInline(text) {
  // 返回 runs 数组
  const runs = [];
  // 使用正则匹配 **bold** and `code`
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let lastIdx = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    // 匹配前的普通文本
    if (match.index > lastIdx) {
      runs.push({ text: text.slice(lastIdx, match.index), bold: false });
    }
    if (match[2]) {
      // **bold**
      runs.push({ text: match[2], bold: true });
    } else if (match[3]) {
      // `code`
      runs.push({ text: match[3], bold: false, font: "Courier New" });
    }
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) {
    runs.push({ text: text.slice(lastIdx), bold: false });
  }
  return runs;
}

/**
 * 解析 Markdown 表格为 Word Table 对象
 */
function parseTable(lines) {
  if (lines.length < 2) return null;

  const parseRow = (line) => {
    return line.split("|").slice(1, -1).map(cell => cell.trim());
  };

  const headers = parseRow(lines[0]);
  // skip separator line (line[1])
  const rows = [];
  for (let r = 2; r < lines.length; r++) {
    const row = parseRow(lines[r]);
    if (row.length === headers.length) rows.push(row);
  }

  if (rows.length === 0) return null;

  const contentW = PAGE_W - MARGIN.left - MARGIN.right;
  const colCount = headers.length;
  const colWidth = Math.floor(contentW / colCount);

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      borders,
      width: { size: colWidth, type: WidthType.DXA },
      shading: { fill: "D9E2F3", type: ShadingType.CLEAR },
      margins: { top: 40, bottom: 40, left: 60, right: 60 },
      verticalAlign: "center",
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 20 },
        children: [new TextRun({ text: h, font: FONT_BODY, size: 20, bold: true })],
      })],
    })),
  });

  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      borders,
      width: { size: colWidth, type: WidthType.DXA },
      margins: { top: 30, bottom: 30, left: 60, right: 60 },
      verticalAlign: "center",
      children: [new Paragraph({
        alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
        spacing: { before: 10, after: 10 },
        children: Array.isArray(cell) ? cell : [new TextRun({ text: String(cell), font: FONT_BODY, size: 20 })],
      })],
    })),
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
        const textRuns = el.text.map(r => new TextRun({
          text: r.text,
          font: r.font || FONT_HEADING,
          size: r.bold ? undefined : undefined,
          bold: true,
        }));
        const levelMap = {
          1: { heading: HeadingLevel.HEADING_1, size: 32, before: 480, after: 240 },   // 小二
          2: { heading: HeadingLevel.HEADING_2, size: 28, before: 360, after: 180 },   // 小三
          3: { heading: HeadingLevel.HEADING_3, size: 24, before: 240, after: 120 },   // 小四
          4: { heading: HeadingLevel.HEADING_4, size: 24, before: 180, after: 120 },   // 小四加粗
        };
        const config = levelMap[el.level] || levelMap[4];
        results.push(new Paragraph({
          heading: config.heading,
          spacing: { before: config.before, after: config.after },
          children: textRuns.map(r => new TextRun({
            text: r.text,
            font: FONT_HEADING,
            size: config.size,
            bold: true,
          })),
        }));
        // 章标题后加分页（只有 level 1 且是章标题）
        if (el.level === 1 && el.text[0] && el.text[0].text.match(/^第[一二三四五六]章/)) {
          // 不加 page break，让内容自然流动
        }
        break;
      }

      case "paragraph": {
        const textRuns = el.text.map(r => new TextRun({
          text: r.text,
          font: r.font || FONT_BODY,
          size: isRefSection ? 21 : 24,
          bold: r.bold || false,
        }));
        results.push(new Paragraph({
          spacing: { line: 360, after: 60 },
          indent: isRefSection ? {} : { firstLine: 480 },
          alignment: AlignmentType.JUSTIFIED,
          children: textRuns,
        }));
        break;
      }

      case "quote": {
        const textRuns = el.text.map(r => new TextRun({
          text: r.text,
          font: FONT_BODY,
          size: 21,
          bold: r.bold || false,
          italics: true,
          color: "555555",
        }));
        results.push(new Paragraph({
          spacing: { line: 320, after: 60 },
          indent: { left: 400 },
          children: textRuns,
        }));
        break;
      }

      case "list": {
        const textRuns = [
          new TextRun({ text: el.prefix, font: FONT_BODY, size: 24 }),
          ...el.text.map(r => new TextRun({
            text: r.text,
            font: r.font || FONT_BODY,
            size: 24,
            bold: r.bold || false,
          })),
        ];
        results.push(new Paragraph({
          spacing: { line: 340, after: 40 },
          indent: { left: 480, hanging: 280 },
          children: textRuns,
        }));
        break;
      }

      case "list_nested": {
        const indent = Math.min(el.indent || 0, 3);
        const textRuns = [
          new TextRun({ text: "- ", font: FONT_BODY, size: 24 }),
          ...el.text.map(r => new TextRun({
            text: r.text,
            font: r.font || FONT_BODY,
            size: 24,
            bold: r.bold || false,
          })),
        ];
        results.push(new Paragraph({
          spacing: { line: 340, after: 40 },
          indent: { left: 480 + indent * 240, hanging: 200 },
          children: textRuns,
        }));
        break;
      }

      case "code": {
        const codeLines = el.text.split("\n");
        codeLines.forEach(line => {
          results.push(new Paragraph({
            spacing: { line: 280, after: 0 },
            indent: { left: 360 },
            children: [new TextRun({
              text: line || " ",
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
    // 使用spacing来垂直居中
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
  console.log("开始读取 Markdown 源文件...");

  // 读取各章 Markdown 源文件
  const chapters = [
    { file: "第一章_绪论_深度优化版.md", label: "第一章" },
    { file: "第二章_文献综述_深度优化版.md", label: "第二章" },
    { file: "第三章_研究设计_深度优化版.md", label: "第三章" },
    { file: "第四章_大悦城案例分析_深度优化版.md", label: "第四章" },
    { file: "第五章_对比案例分析_深度优化版.md", label: "第五章" },
    { file: "第六章_结论与建议_深度优化版.md", label: "第六章" },
  ];

  const allChildren = [];

  // 封面
  allChildren.push(...coverPage());
  // 目录
  allChildren.push(...tocPage());

  for (const ch of chapters) {
    const filePath = path.join(BASE, ch.file);
    console.log(`  读取: ${ch.file}`);
    const md = fs.readFileSync(filePath, "utf-8");

    // 去掉开头的 YAML 版本信息和 > 标注（文档元数据）
    let cleaned = md;
    // 去掉第一行标题之前的内容（如果有版本标注）
    cleaned = cleaned.replace(/^>\s*版本[^\n]*\n/g, "");
    cleaned = cleaned.replace(/^>\s*核心变更[^\n]*\n/g, "");
    cleaned = cleaned.replace(/^>\s*定位[^\n]*\n/g, "");

    const elements = parseMarkdown(cleaned);
    const wordElements = elementsToWord(elements);
    allChildren.push(...wordElements);
    console.log(`  ${ch.label}: ${wordElements.length} 个元素`);
  }

  // 参考文献
  console.log("  读取: 参考文献.md");
  const refMd = fs.readFileSync(path.join(BASE, "参考文献.md"), "utf-8");
  const refElements = parseMarkdown(refMd);
  const refWordElements = elementsToWord(refElements, true);
  allChildren.push(...refWordElements);

  console.log(`\n总计: ${allChildren.length} 个 Word 元素`);

  // 构建文档
  console.log("构建 Word 文档...");
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
