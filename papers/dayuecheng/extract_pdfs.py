#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量提取优秀MBA论文PDF文本内容
"""

import pdfplumber
import os
from pathlib import Path

# PDF文件列表
pdf_files = [
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/财务方向（MBA）/A 保险资产管理公司资产配置研究 朱竑宇.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/财务方向（MBA）/股权投资风险管理优化研究 陈俊廷.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/财务方向（MBA）/IV 跨国公司采购业务内部控制研究 高庆.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/人力资源（MBA)/M 公司经营型人才培训体系构建研究 陈浩.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/营销方向（MBA）/M 国际早教长沙公司营销策略研究 彭娜.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/战略方向（MBA）/新科技革命背景下大众汽车智能出行业务发展战略研究 翟飞.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/营销方向（MBA）/A 公司美妆产品网红营销策略优化研究 刘菁.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/营销方向（MBA）/智慧零售背景下苏宁小店商业模式研究  杨俊玮.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/营销方向（MBA）/招商银行信用卡支付业务营销策略研究 任晶.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/营销方向（MBA）/数字经济背景下S媒体公司营销策略研究 申彬彬.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/营销方向（MBA）/客户分级管理研究 王晓亮.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/营销方向（MBA）/北京故宫文创产品营销策略研究 杨萌.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/人力资源（MBA)/L 软件技术公司产品经理绩效管理研究 张涵宇.pdf",
    "/Users/op/Downloads/MBA/01 论文/优秀论文（MBA）/分方向（不全）/人力资源（MBA)/基于公平理论的 B 企业薪酬体系 刘盛伟.pdf",
]

output_dir = Path("/Users/op/WorkBuddy/科研代理/mba_paper_project/优秀论文学习_14篇")
output_dir.mkdir(exist_ok=True)

def extract_pdf_text(pdf_path):
    """提取PDF文本内容"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n--- 第{i+1}页 ---\n"
                    text += page_text
            return text
    except Exception as e:
        return f"提取失败: {str(e)}"

def get_short_name(pdf_path):
    """从PDF路径提取简短名称"""
    filename = Path(pdf_path).stem
    # 清理文件名中的特殊字符
    return filename.replace("/", "_").replace("\\", "_")

print(f"开始提取 {len(pdf_files)} 篇优秀MBA论文...\n")

for i, pdf_path in enumerate(pdf_files, 1):
    print(f"[{i}/{len(pdf_files)}] 正在提取: {Path(pdf_path).name}")
    
    # 提取文本
    text = extract_pdf_text(pdf_path)
    
    # 保存到文件
    short_name = get_short_name(pdf_path)
    output_file = output_dir / f"{i:02d}_{short_name}.txt"
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"论文标题: {Path(pdf_path).stem}\n")
        f.write(f"原文路径: {pdf_path}\n")
        f.write(f"提取时间: 2026-04-16\n")
        f.write("=" * 80 + "\n\n")
        f.write(text)
    
    print(f"  ✓ 已保存到: {output_file.name}")

print(f"\n提取完成！所有文件保存在: {output_dir}")
