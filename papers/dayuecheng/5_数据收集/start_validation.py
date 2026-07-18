#!/usr/bin/env python3
"""
数据验证启动脚本
开始执行证据三角形验证工作
"""

import pandas as pd
import numpy as np
from datetime import datetime
import os
import sys

# 添加当前目录到路径，以便导入自定义模块
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data_validation_tool import DataValidator

def initialize_validation_system():
    """初始化验证系统"""
    print("初始化数据验证系统...")
    
    # 创建验证器实例
    validator = DataValidator("validation_records.csv")
    
    # 打印系统信息
    print(f"验证系统已初始化")
    print(f"验证记录文件: validation_records.csv")
    print(f"当前记录数: {len(validator.records)}")
    
    return validator

def create_core_data_points(validator):
    """创建核心数据点验证记录"""
    print("\n创建核心数据点验证记录...")
    
    # 大悦城核心财务数据
    joycity_financial_data = [
        # 2024年数据
        {'data_point': '营业收入', 'data_type': '财务数据', 'company': '大悦城', 'year': 2024, 'notes': '大悦城2024年营业收入'},
        {'data_point': '净利润', 'data_type': '财务数据', 'company': '大悦城', 'year': 2024, 'notes': '大悦城2024年净利润'},
        {'data_point': '经营现金流净额', 'data_type': '财务数据', 'company': '大悦城', 'year': 2024, 'notes': '大悦城2024年经营现金流'},
        {'data_point': '资产负债率', 'data_type': '财务数据', 'company': '大悦城', 'year': 2024, 'notes': '大悦城2024年资产负债率'},
        
        # 2023年数据
        {'data_point': '营业收入', 'data_type': '财务数据', 'company': '大悦城', 'year': 2023, 'notes': '大悦城2023年营业收入'},
        {'data_point': '净利润', 'data_type': '财务数据', 'company': '大悦城', 'year': 2023, 'notes': '大悦城2023年净利润'},
        
        # 2022年数据
        {'data_point': '营业收入', 'data_type': '财务数据', 'company': '大悦城', 'year': 2022, 'notes': '大悦城2022年营业收入'},
        {'data_point': '净利润', 'data_type': '财务数据', 'company': '大悦城', 'year': 2022, 'notes': '大悦城2022年净利润'},
        
        # 2021年数据
        {'data_point': '营业收入', 'data_type': '财务数据', 'company': '大悦城', 'year': 2021, 'notes': '大悦城2021年营业收入'},
        {'data_point': '净利润', 'data_type': '财务数据', 'company': '大悦城', 'year': 2021, 'notes': '大悦城2021年净利润'},
        
        # 2020年数据
        {'data_point': '营业收入', 'data_type': '财务数据', 'company': '大悦城', 'year': 2020, 'notes': '大悦城2020年营业收入'},
        {'data_point': '净利润', 'data_type': '财务数据', 'company': '大悦城', 'year': 2020, 'notes': '大悦城2020年净利润'},
        
        # 2019年数据
        {'data_point': '营业收入', 'data_type': '财务数据', 'company': '大悦城', 'year': 2019, 'notes': '大悦城2019年营业收入'},
        {'data_point': '净利润', 'data_type': '财务数据', 'company': '大悦城', 'year': 2019, 'notes': '大悦城2019年净利润'},
    ]
    
    # 万科核心财务数据
    vanke_financial_data = [
        # 2024年数据
        {'data_point': '营业收入', 'data_type': '财务数据', 'company': '万科', 'year': 2024, 'notes': '万科2024年营业收入'},
        {'data_point': '净利润', 'data_type': '财务数据', 'company': '万科', 'year': 2024, 'notes': '万科2024年净利润'},
        
        # 2023年数据
        {'data_point': '营业收入', 'data_type': '财务数据', 'company': '万科', 'year': 2023, 'notes': '万科2023年营业收入'},
        {'data_point': '净利润', 'data_type': '财务数据', 'company': '万科', 'year': 2023, 'notes': '万科2023年净利润'},
        
        # 2022年数据
        {'data_point': '营业收入', 'data_type': '财务数据', 'company': '万科', 'year': 2022, 'notes': '万科2022年营业收入'},
        {'data_point': '净利润', 'data_type': '财务数据', 'company': '万科', 'year': 2022, 'notes': '万科2022年净利润'},
    ]
    
    # 保利核心财务数据
    poly_financial_data = [
        # 2024年数据
        {'data_point': '营业收入', 'data_type': '财务数据', 'company': '保利', 'year': 2024, 'notes': '保利2024年营业收入'},
        {'data_point': '净利润', 'data_type': '财务数据', 'company': '保利', 'year': 2024, 'notes': '保利2024年净利润'},
        
        # 2023年数据
        {'data_point': '营业收入', 'data_type': '财务数据', 'company': '保利', 'year': 2023, 'notes': '保利2023年营业收入'},
        {'data_point': '净利润', 'data_type': '财务数据', 'company': '保利', 'year': 2023, 'notes': '保利2023年净利润'},
    ]
    
    # REITs产品数据
    reits_data = [
        # 华夏大悦城REIT
        {'data_point': '发行规模', 'data_type': 'REITs数据', 'company': '华夏大悦城REIT', 'year': 2024, 'notes': '华夏大悦城REIT发行规模'},
        {'data_point': '现金流分派率', 'data_type': 'REITs数据', 'company': '华夏大悦城REIT', 'year': 2024, 'notes': '2024年预测分派率'},
        {'data_point': '底层资产销售额', 'data_type': 'REITs数据', 'company': '华夏大悦城REIT', 'year': 2023, 'notes': '成都大悦城2023年销售额'},
        
        # 中金印力REIT
        {'data_point': '发行规模', 'data_type': 'REITs数据', 'company': '中金印力REIT', 'year': 2024, 'notes': '中金印力REIT发行规模'},
        {'data_point': '2024年收入', 'data_type': 'REITs数据', 'company': '中金印力REIT', 'year': 2024, 'notes': '中金印力REIT 2024年收入'},
    ]
    
    # 合并所有数据点
    all_data_points = joycity_financial_data + vanke_financial_data + poly_financial_data + reits_data
    
    # 添加到验证系统
    record_ids = {}
    for data in all_data_points:
        record_id = validator.add_validation_record(**data)
        
        # 按公司分组记录ID
        company = data['company']
        if company not in record_ids:
            record_ids[company] = []
        record_ids[company].append(record_id)
    
    print(f"已创建 {len(all_data_points)} 个核心数据点验证记录")
    
    # 打印按公司统计
    print("\n按公司统计:")
    for company, ids in record_ids.items():
        print(f"  {company}: {len(ids)} 个数据点")
    
    return record_ids

def load_known_data(validator, record_ids):
    """加载已知数据到验证系统"""
    print("\n加载已知数据到验证系统...")
    
    # 大悦城已知数据（来自交叉验证数据表）
    known_data = {
        # 大悦城2024年数据
        ('大悦城', 2024, '营业收入'): {
            'official': (357.91, '巨潮资讯网2024年报', '2026-04-14'),
            'media': (357.9, '财新网报道', '2026-04-14'),
            'database': (357.92, 'Wind数据库', '2026-04-14')
        },
        ('大悦城', 2024, '净利润'): {
            'official': (-29.77, '巨潮资讯网2024年报', '2026-04-14'),
            'media': (-29.8, '证券时报报道', '2026-04-14')
        },
        ('大悦城', 2024, '经营现金流净额'): {
            'official': (66.17, '巨潮资讯网2024年报', '2026-04-14')
        },
        
        # 大悦城2023年数据
        ('大悦城', 2023, '营业收入'): {
            'official': (367.83, '巨潮资讯网2023年报', '2026-04-14')
        },
        ('大悦城', 2023, '净利润'): {
            'official': (-14.65, '巨潮资讯网2023年报', '2026-04-14')
        },
        
        # 大悦城2022年数据
        ('大悦城', 2022, '营业收入'): {
            'official': (395.79, '巨潮资讯网2022年报', '2026-04-14')
        },
        ('大悦城', 2022, '净利润'): {
            'official': (-28.83, '巨潮资讯网2022年报', '2026-04-14')
        },
        
        # 大悦城2021年数据
        ('大悦城', 2021, '营业收入'): {
            'official': (426.14, '巨潮资讯网2021年报', '2026-04-14')
        },
        ('大悦城', 2021, '净利润'): {
            'official': (1.08, '巨潮资讯网2021年报', '2026-04-14')
        },
        
        # 大悦城2020年数据
        ('大悦城', 2020, '营业收入'): {
            'official': (384.45, '巨潮资讯网2020年报', '2026-04-14')
        },
        ('大悦城', 2020, '净利润'): {
            'official': (-3.87, '巨潮资讯网2020年报', '2026-04-14')
        },
        
        # 大悦城2019年数据
        ('大悦城', 2019, '营业收入'): {
            'official': (337.87, '巨潮资讯网2019年报', '2026-04-14')
        },
        ('大悦城', 2019, '净利润'): {
            'official': (37.05, '巨潮资讯网2019年报', '2026-04-14')
        },
        
        # 万科数据
        ('万科', 2024, '营业收入'): {
            'media': (3431.8, '财经媒体报道', '2026-04-14')
        },
        ('万科', 2023, '营业收入'): {
            'official': (4657.4, '万科2023年报', '2026-04-14')
        },
        
        # 保利数据
        ('保利', 2024, '营业收入'): {
            'media': (3116.66, '财经媒体报道', '2026-04-14')
        },
        ('保利', 2023, '营业收入'): {
            'official': (3468.28, '保利2023年报', '2026-04-14')
        },
        
        # REITs数据
        ('华夏大悦城REIT', 2024, '发行规模'): {
            'official': (33.0, '招募说明书', '2026-04-14'),
            'media': (33.0, '证券时报报道', '2026-04-14')
        },
        ('华夏大悦城REIT', 2024, '现金流分派率'): {
            'official': (5.25, '招募说明书', '2026-04-14')
        },
        ('华夏大悦城REIT', 2023, '底层资产销售额'): {
            'official': (25.4, '运营报告', '2026-04-14')
        }
    }
    
    # 查找对应的记录ID并加载数据
    loaded_count = 0
    for (company, year, data_point), sources in known_data.items():
        # 查找记录ID
        matching_records = validator.records[
            (validator.records['company'] == company) &
            (validator.records['year'] == year) &
            (validator.records['data_point'] == data_point)
        ]
        
        if len(matching_records) == 0:
            print(f"警告: 未找到记录 - {company} {year} {data_point}")
            continue
        
        record_id = matching_records.iloc[0]['record_id']
        
        # 加载数据
        for source_type, (value, source, date) in sources.items():
            validator.update_source_data(
                record_id=record_id,
                source_type=source_type,
                value=value,
                source=source,
                source_date=date
            )
            loaded_count += 1
    
    print(f"已加载 {loaded_count} 条已知数据")
    
    return loaded_count

def generate_validation_report(validator):
    """生成验证报告"""
    print("\n生成验证报告...")
    
    # 生成详细报告
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    report_file = f"validation_report_{timestamp}.xlsx"
    
    validator.export_to_excel(report_file)
    
    # 打印摘要
    validator.print_summary_report()
    
    return report_file

def create_validation_plan():
    """创建验证工作计划"""
    print("\n创建验证工作计划...")
    
    plan = {
        'phase_1': {
            'name': '核心数据验证',
            'date': '2026-04-15',
            'tasks': [
                '大悦城财务数据验证（2019-2024）',
                '万科财务数据验证（2022-2024）',
                '保利财务数据验证（2023-2024）',
                'REITs产品数据验证'
            ],
            'target': '完成所有核心数据点的初步验证'
        },
        'phase_2': {
            'name': '深度验证与补充',
            'date': '2026-04-16',
            'tasks': [
                '不一致数据深度分析',
                '缺失数据补充收集',
                '多源交叉验证',
                '数据溯源链建立'
            ],
            'target': '完成所有数据点的深度验证'
        },
        'phase_3': {
            'name': '质量控制与报告',
            'date': '2026-04-17',
            'tasks': [
                '质量检查与评估',
                '验证报告撰写',
                '数据使用说明制定',
                '导师审核与反馈'
            ],
            'target': '完成最终验证报告和质量控制'
        }
    }
    
    # 保存计划到文件
    plan_file = "validation_work_plan.md"
    with open(plan_file, 'w', encoding='utf-8') as f:
        f.write("# 数据验证工作计划\n\n")
        f.write("## 概述\n")
        f.write("基于证据三角形验证方法，系统验证研究所需的所有数据点。\n\n")
        
        for phase_name, phase_info in plan.items():
            f.write(f"## {phase_info['name']} ({phase_info['date']})\n\n")
            f.write(f"**目标**: {phase_info['target']}\n\n")
            f.write("**任务**:\n")
            for task in phase_info['tasks']:
                f.write(f"- [ ] {task}\n")
            f.write("\n")
    
    print(f"验证工作计划已保存到: {plan_file}")
    
    return plan

def main():
    """主函数"""
    print("="*70)
    print("数据验证系统启动")
    print("基于证据三角形验证方法 - v2.1工作流")
    print("="*70)
    
    # 初始化验证系统
    validator = initialize_validation_system()
    
    # 创建核心数据点
    record_ids = create_core_data_points(validator)
    
    # 加载已知数据
    loaded_count = load_known_data(validator, record_ids)
    
    # 生成验证报告
    report_file = generate_validation_report(validator)
    
    # 创建验证工作计划
    plan = create_validation_plan()
    
    # 总结
    print("\n" + "="*70)
    print("数据验证系统启动完成")
    print("="*70)
    
    summary = validator.get_validation_summary()
    
    print(f"\n系统状态总结:")
    print(f"1. 总验证记录: {summary['total_records']} 条")
    print(f"2. 验证完成率: {summary['completion_rate']}%")
    print(f"3. 平均一致性: {summary['avg_consistency_score']}")
    print(f"4. 平均可靠性: {summary['avg_reliability_score']}")
    
    print(f"\n生成的文件:")
    print(f"1. 验证记录文件: validation_records.csv")
    print(f"2. 验证报告文件: {report_file}")
    print(f"3. 工作计划文件: validation_work_plan.md")
    
    print(f"\n下一步行动:")
    print("1. 开始执行第一阶段验证（4月15日）")
    print("2. 补充缺失的数据来源")
    print("3. 处理不一致的数据点")
    print("4. 定期生成验证报告")
    
    print(f"\n注意事项:")
    print("1. 优先验证核心数据点（大悦城财务数据）")
    print("2. 确保每个数据点有至少两个独立来源")
    print("3. 记录所有验证过程和决策")
    print("4. 及时处理不一致数据")
    
    print("\n" + "="*70)
    print("系统启动完成，可以开始验证工作")
    print("="*70)

if __name__ == "__main__":
    main()