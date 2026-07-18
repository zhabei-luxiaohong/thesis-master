#!/usr/bin/env python3
"""
数据验证工具 - 基于证据三角形验证方法
支持数据一致性检查、来源验证、质量评估等功能
"""

import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
from typing import Dict, List, Tuple, Optional

class DataValidator:
    """数据验证器类"""
    
    def __init__(self, data_file="validation_records.csv"):
        """
        初始化数据验证器
        
        Parameters:
        -----------
        data_file : str
            验证记录数据文件路径
        """
        self.data_file = data_file
        self.records = None
        self.load_or_create_records()
        
        # 验证标准配置
        self.validation_standards = {
            'consistency_threshold': 0.01,  # 一致性阈值1%
            'min_sources': 2,  # 最少验证来源数
            'official_source_priority': 10,  # 官方来源优先级
            'media_source_priority': 5,  # 媒体来源优先级
            'database_source_priority': 3,  # 数据库来源优先级
        }
        
    def load_or_create_records(self):
        """加载或创建验证记录"""
        if os.path.exists(self.data_file):
            self.records = pd.read_csv(self.data_file, encoding='utf-8')
            print(f"已加载验证记录，包含 {len(self.records)} 条记录")
        else:
            self.create_empty_records()
            print("创建新的验证记录表")
    
    def create_empty_records(self):
        """创建空的验证记录表"""
        columns = [
            'record_id', 'data_point', 'data_type', 'company', 'year',
            'official_value', 'official_source', 'official_date',
            'media_value', 'media_source', 'media_date',
            'database_value', 'database_source', 'database_date',
            'calculated_value', 'calculation_method',
            'final_value', 'final_source', 'final_reason',
            'consistency_score', 'reliability_score',
            'validation_status', 'validator', 'validation_date',
            'notes', 'attachments'
        ]
        
        self.records = pd.DataFrame(columns=columns)
        self.save_records()
    
    def add_validation_record(self, data_point: str, data_type: str, 
                            company: str, year: int, **kwargs):
        """
        添加验证记录
        
        Parameters:
        -----------
        data_point : str
            数据点名称，如"营业收入"
        data_type : str
            数据类型，如"财务数据"、"REITs数据"
        company : str
            公司名称，如"大悦城"
        year : int
            数据年份
        **kwargs : dict
            其他数据字段
        """
        # 生成记录ID
        record_id = f"VR{len(self.records)+1:04d}"
        
        # 设置默认值
        default_values = {
            'record_id': record_id,
            'data_point': data_point,
            'data_type': data_type,
            'company': company,
            'year': year,
            'validation_status': '待验证',
            'validator': '系统',
            'validation_date': datetime.now().strftime('%Y-%m-%d'),
            'consistency_score': 0,
            'reliability_score': 0,
            'notes': '',
            'attachments': ''
        }
        
        # 合并默认值和用户输入
        record_data = {**default_values, **kwargs}
        
        # 添加到记录表
        new_row = pd.DataFrame([record_data])
        self.records = pd.concat([self.records, new_row], ignore_index=True)
        
        self.save_records()
        print(f"已添加验证记录: {record_id} - {data_point} ({company}, {year})")
        
        return record_id
    
    def update_source_data(self, record_id: str, source_type: str, 
                          value: float, source: str, source_date: str = None):
        """
        更新数据来源信息
        
        Parameters:
        -----------
        record_id : str
            记录ID
        source_type : str
            来源类型：'official', 'media', 'database', 'calculated'
        value : float
            数据值
        source : str
            来源描述
        source_date : str, optional
            来源日期，默认当前日期
        """
        if record_id not in self.records['record_id'].values:
            print(f"错误: 记录ID '{record_id}' 不存在")
            return False
        
        if source_date is None:
            source_date = datetime.now().strftime('%Y-%m-%d')
        
        # 更新记录
        idx = self.records[self.records['record_id'] == record_id].index[0]
        
        if source_type == 'official':
            self.records.at[idx, 'official_value'] = value
            self.records.at[idx, 'official_source'] = source
            self.records.at[idx, 'official_date'] = source_date
        elif source_type == 'media':
            self.records.at[idx, 'media_value'] = value
            self.records.at[idx, 'media_source'] = source
            self.records.at[idx, 'media_date'] = source_date
        elif source_type == 'database':
            self.records.at[idx, 'database_value'] = value
            self.records.at[idx, 'database_source'] = source
            self.records.at[idx, 'database_date'] = source_date
        elif source_type == 'calculated':
            self.records.at[idx, 'calculated_value'] = value
            self.records.at[idx, 'calculation_method'] = source
        else:
            print(f"错误: 无效的来源类型 '{source_type}'")
            return False
        
        # 更新验证状态
        self.records.at[idx, 'validation_status'] = '验证中'
        self.records.at[idx, 'validation_date'] = datetime.now().strftime('%Y-%m-%d')
        
        self.save_records()
        print(f"已更新记录 {record_id} 的 {source_type} 来源数据")
        
        # 自动检查一致性
        self.check_consistency(record_id)
        
        return True
    
    def check_consistency(self, record_id: str):
        """
        检查数据一致性
        
        Parameters:
        -----------
        record_id : str
            记录ID
        """
        if record_id not in self.records['record_id'].values:
            print(f"错误: 记录ID '{record_id}' 不存在")
            return None
        
        idx = self.records[self.records['record_id'] == record_id].index[0]
        record = self.records.iloc[idx]
        
        # 收集所有可用值
        values = []
        sources = []
        
        if pd.notna(record['official_value']):
            values.append(record['official_value'])
            sources.append(('official', self.validation_standards['official_source_priority']))
        
        if pd.notna(record['media_value']):
            values.append(record['media_value'])
            sources.append(('media', self.validation_standards['media_source_priority']))
        
        if pd.notna(record['database_value']):
            values.append(record['database_value'])
            sources.append(('database', self.validation_standards['database_source_priority']))
        
        if len(values) < 2:
            # 至少需要两个来源才能进行一致性检查
            self.records.at[idx, 'consistency_score'] = 0
            self.records.at[idx, 'reliability_score'] = 0
            self.save_records()
            return {'status': 'insufficient_sources', 'message': '来源不足，无法进行一致性检查'}
        
        # 计算一致性
        max_value = max(values)
        min_value = min(values)
        
        if max_value == 0:
            # 避免除零错误
            relative_diff = 0
        else:
            relative_diff = (max_value - min_value) / max_value
        
        # 计算一致性分数（0-100）
        if relative_diff <= self.validation_standards['consistency_threshold']:
            consistency_score = 100  # 高度一致
        elif relative_diff <= 0.05:  # 5%
            consistency_score = 80   # 基本一致
        elif relative_diff <= 0.10:  # 10%
            consistency_score = 60   # 部分一致
        elif relative_diff <= 0.20:  # 20%
            consistency_score = 40   # 不一致
        else:
            consistency_score = 20   # 严重不一致
        
        # 计算可靠性分数
        reliability_score = self.calculate_reliability_score(values, sources)
        
        # 更新记录
        self.records.at[idx, 'consistency_score'] = consistency_score
        self.records.at[idx, 'reliability_score'] = reliability_score
        
        # 根据一致性自动确定最终值
        if consistency_score >= 80:
            # 高度或基本一致，使用加权平均
            final_value = self.calculate_weighted_average(values, sources)
            final_source = "加权平均值（多源验证）"
            final_reason = f"数据高度一致（一致性分数：{consistency_score}），采用加权平均值"
        elif consistency_score >= 60:
            # 部分一致，使用官方来源或优先级最高的来源
            final_value, final_source = self.select_best_source(values, sources)
            final_reason = f"数据部分一致（一致性分数：{consistency_score}），采用优先级最高的来源"
        else:
            # 不一致，需要人工处理
            final_value = None
            final_source = None
            final_reason = f"数据不一致（一致性分数：{consistency_score}），需要人工处理"
        
        if final_value is not None:
            self.records.at[idx, 'final_value'] = final_value
            self.records.at[idx, 'final_source'] = final_source
            self.records.at[idx, 'final_reason'] = final_reason
            self.records.at[idx, 'validation_status'] = '验证完成'
        
        self.save_records()
        
        result = {
            'record_id': record_id,
            'data_point': record['data_point'],
            'company': record['company'],
            'year': record['year'],
            'values': values,
            'sources': [s[0] for s in sources],
            'relative_diff': relative_diff,
            'consistency_score': consistency_score,
            'reliability_score': reliability_score,
            'final_value': final_value,
            'final_source': final_source,
            'final_reason': final_reason,
            'validation_status': self.records.at[idx, 'validation_status']
        }
        
        print(f"一致性检查完成: {record_id} - 一致性分数: {consistency_score}, 可靠性分数: {reliability_score}")
        
        return result
    
    def calculate_weighted_average(self, values: List[float], sources: List[Tuple[str, int]]) -> float:
        """
        计算加权平均值
        
        Parameters:
        -----------
        values : List[float]
            数值列表
        sources : List[Tuple[str, int]]
            来源列表（来源类型，优先级）
        
        Returns:
        --------
        float
            加权平均值
        """
        weights = [priority for _, priority in sources]
        total_weight = sum(weights)
        
        if total_weight == 0:
            return np.mean(values)
        
        weighted_sum = sum(value * weight for value, (_, weight) in zip(values, sources))
        return weighted_sum / total_weight
    
    def calculate_reliability_score(self, values: List[float], sources: List[Tuple[str, int]]) -> float:
        """
        计算可靠性分数
        
        Parameters:
        -----------
        values : List[float]
            数值列表
        sources : List[Tuple[str, int]]
            来源列表（来源类型，优先级）
        
        Returns:
        --------
        float
            可靠性分数（0-100）
        """
        # 基础分数：来源数量
        source_count_score = min(len(sources) * 20, 60)  # 每个来源20分，最多60分
        
        # 来源质量分数
        source_quality_score = sum(priority for _, priority in sources) / len(sources) * 2
        
        # 一致性分数（在check_consistency中计算）
        # 这里只计算基础可靠性
        
        reliability_score = source_count_score + source_quality_score
        
        return min(reliability_score, 100)
    
    def select_best_source(self, values: List[float], sources: List[Tuple[str, int]]) -> Tuple[float, str]:
        """
        选择最佳来源
        
        Parameters:
        -----------
        values : List[float]
            数值列表
        sources : List[Tuple[str, int]]
            来源列表（来源类型，优先级）
        
        Returns:
        --------
        Tuple[float, str]
            （最佳值，最佳来源类型）
        """
        # 按优先级排序
        sorted_sources = sorted(zip(values, sources), key=lambda x: x[1][1], reverse=True)
        
        # 选择优先级最高的
        best_value, (best_source_type, _) = sorted_sources[0]
        
        return best_value, best_source_type
    
    def set_final_value(self, record_id: str, final_value: float, 
                       final_source: str, final_reason: str):
        """
        人工设置最终值
        
        Parameters:
        -----------
        record_id : str
            记录ID
        final_value : float
            最终值
        final_source : str
            最终来源
        final_reason : str
            选择理由
        """
        if record_id not in self.records['record_id'].values:
            print(f"错误: 记录ID '{record_id}' 不存在")
            return False
        
        idx = self.records[self.records['record_id'] == record_id].index[0]
        
        self.records.at[idx, 'final_value'] = final_value
        self.records.at[idx, 'final_source'] = final_source
        self.records.at[idx, 'final_reason'] = final_reason
        self.records.at[idx, 'validation_status'] = '验证完成（人工确认）'
        self.records.at[idx, 'validation_date'] = datetime.now().strftime('%Y-%m-%d')
        
        self.save_records()
        print(f"已设置记录 {record_id} 的最终值: {final_value}")
        
        return True
    
    def get_validation_summary(self):
        """获取验证摘要"""
        if len(self.records) == 0:
            return {"message": "验证记录为空"}
        
        total_records = len(self.records)
        
        # 按验证状态统计
        status_counts = self.records['validation_status'].value_counts().to_dict()
        
        # 按公司统计
        company_counts = self.records['company'].value_counts().to_dict()
        
        # 按数据类型统计
        type_counts = self.records['data_type'].value_counts().to_dict()
        
        # 平均一致性分数
        avg_consistency = self.records['consistency_score'].mean() if 'consistency_score' in self.records.columns else 0
        
        # 平均可靠性分数
        avg_reliability = self.records['reliability_score'].mean() if 'reliability_score' in self.records.columns else 0
        
        # 验证完成比例
        completed = status_counts.get('验证完成', 0) + status_counts.get('验证完成（人工确认）', 0)
        completion_rate = completed / total_records * 100 if total_records > 0 else 0
        
        summary = {
            'total_records': total_records,
            'status_distribution': status_counts,
            'company_distribution': company_counts,
            'type_distribution': type_counts,
            'avg_consistency_score': round(avg_consistency, 2),
            'avg_reliability_score': round(avg_reliability, 2),
            'completion_rate': round(completion_rate, 2),
            'validation_progress': f"{completed}/{total_records} ({completion_rate:.1f}%)"
        }
        
        return summary
    
    def get_inconsistent_records(self, threshold: float = 60):
        """
        获取不一致的记录
        
        Parameters:
        -----------
        threshold : float
            一致性分数阈值，低于此阈值视为不一致
        
        Returns:
        --------
        pd.DataFrame
            不一致记录
        """
        if len(self.records) == 0:
            return pd.DataFrame()
        
        if 'consistency_score' not in self.records.columns:
            return pd.DataFrame()
        
        inconsistent = self.records[self.records['consistency_score'] < threshold]
        
        return inconsistent
    
    def export_to_excel(self, output_file: str = "validation_report.xlsx"):
        """
        导出验证报告到Excel
        
        Parameters:
        -----------
        output_file : str
            输出文件路径
        """
        if len(self.records) == 0:
            print("警告: 验证记录为空")
            return
        
        # 创建Excel写入器
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            # 写入验证记录
            self.records.to_excel(writer, sheet_name='验证记录', index=False)
            
            # 写入验证摘要
            summary = self.get_validation_summary()
            summary_df = pd.DataFrame([summary])
            summary_df.to_excel(writer, sheet_name='验证摘要', index=False)
            
            # 写入不一致记录
            inconsistent = self.get_inconsistent_records()
            if len(inconsistent) > 0:
                inconsistent.to_excel(writer, sheet_name='不一致记录', index=False)
            
            # 按公司分组统计
            if 'company' in self.records.columns:
                company_stats = self.records.groupby('company').agg({
                    'record_id': 'count',
                    'consistency_score': 'mean',
                    'reliability_score': 'mean',
                    'validation_status': lambda x: (x == '验证完成').sum()
                }).round(2)
                company_stats.columns = ['记录数', '平均一致性', '平均可靠性', '完成数']
                company_stats.to_excel(writer, sheet_name='公司统计')
            
            # 按数据类型分组统计
            if 'data_type' in self.records.columns:
                type_stats = self.records.groupby('data_type').agg({
                    'record_id': 'count',
                    'consistency_score': 'mean',
                    'reliability_score': 'mean'
                }).round(2)
                type_stats.columns = ['记录数', '平均一致性', '平均可靠性']
                type_stats.to_excel(writer, sheet_name='数据类型统计')
        
        print(f"验证报告已导出到: {output_file}")
    
    def save_records(self):
        """保存验证记录到文件"""
        self.records.to_csv(self.data_file, index=False, encoding='utf-8')
    
    def print_summary_report(self):
        """打印验证摘要报告"""
        summary = self.get_validation_summary()
        
        print("\n" + "="*60)
        print("数据验证摘要报告")
        print("="*60)
        
        print(f"\n1. 总体情况:")
        print(f"   总验证记录数: {summary['total_records']}")
        print(f"   验证完成率: {summary['completion_rate']}%")
        print(f"   平均一致性分数: {summary['avg_consistency_score']}")
        print(f"   平均可靠性分数: {summary['avg_reliability_score']}")
        
        print(f"\n2. 验证状态分布:")
        for status, count in summary['status_distribution'].items():
            percentage = count / summary['total_records'] * 100
            print(f"   {status}: {count} ({percentage:.1f}%)")
        
        print(f"\n3. 公司分布:")
        for company, count in summary['company_distribution'].items():
            percentage = count / summary['total_records'] * 100
            print(f"   {company}: {count} ({percentage:.1f}%)")
        
        print(f"\n4. 数据类型分布:")
        for data_type, count in summary['type_distribution'].items():
            percentage = count / summary['total_records'] * 100
            print(f"   {data_type}: {count} ({percentage:.1f}%)")
        
        # 检查不一致记录
        inconsistent = self.get_inconsistent_records()
        if len(inconsistent) > 0:
            print(f"\n5. 不一致记录警告:")
            print(f"   发现 {len(inconsistent)} 条不一致记录（一致性分数<60）")
            print("   不一致记录列表:")
            for idx, row in inconsistent.iterrows():
                print(f"   - {row['record_id']}: {row['data_point']} ({row['company']}, {row['year']}) - 一致性分数: {row['consistency_score']}")
        
        print("\n" + "="*60)


def create_sample_validation():
    """创建示例验证数据（用于测试）"""
    validator = DataValidator("sample_validation_records.csv")
    
    # 添加示例验证记录
    sample_records = [
        {
            'data_point': '营业收入',
            'data_type': '财务数据',
            'company': '大悦城',
            'year': 2024,
            'notes': '大悦城2024年营业收入验证'
        },
        {
            'data_point': '净利润',
            'data_type': '财务数据',
            'company': '大悦城',
            'year': 2024,
            'notes': '大悦城2024年净利润验证'
        },
        {
            'data_point': '发行规模',
            'data_type': 'REITs数据',
            'company': '华夏大悦城REIT',
            'year': 2024,
            'notes': '华夏大悦城REIT发行规模验证'
        }
    ]
    
    for record in sample_records:
        record_id = validator.add_validation_record(**record)
        
        # 为第一笔记录添加多个来源
        if record['data_point'] == '营业收入' and record['company'] == '大悦城':
            # 官方来源
            validator.update_source_data(
                record_id=record_id,
                source_type='official',
                value=357.91,
                source='巨潮资讯网2024年报',
                source_date='2026-04-14'
            )
            
            # 媒体来源
            validator.update_source_data(
                record_id=record_id,
                source_type='media',
                value=357.9,
                source='财新网报道',
                source_date='2026-04-14'
            )
            
            # 数据库来源
            validator.update_source_data(
                record_id=record_id,
                source_type='database',
                value=357.92,
                source='Wind数据库',
                source_date='2026-04-14'
            )
        
        # 为第二笔记录添加来源
        elif record['data_point'] == '净利润' and record['company'] == '大悦城':
            validator.update_source_data(
                record_id=record_id,
                source_type='official',
                value=-29.77,
                source='巨潮资讯网2024年报',
                source_date='2026-04-14'
            )
            
            validator.update_source_data(
                record_id=record_id,
                source_type='media',
                value=-29.8,
                source='证券时报报道',
                source_date='2026-04-14'
            )
    
    # 打印摘要
    validator.print_summary_report()
    
    # 导出报告
    validator.export_to_excel("sample_validation_report.xlsx")
    
    return validator


def main():
    """主函数"""
    print("数据验证工具 - 基于证据三角形验证方法")
    print("="*60)
    
    # 创建或加载验证记录
    validator = DataValidator("validation_records.csv")
    
    # 打印当前状态
    validator.print_summary_report()
    
    # 示例：添加新验证记录
    print("\n示例：添加新验证记录")
    record_id = validator.add_validation_record(
        data_point="测试数据点",
        data_type="测试类型",
        company="测试公司",
        year=2024,
        notes="测试验证记录"
    )
    
    # 示例：添加来源数据
    validator.update_source_data(
        record_id=record_id,
        source_type='official',
        value=100.0,
        source='测试官方来源',
        source_date='2026-04-14'
    )
    
    validator.update_source_data(
        record_id=record_id,
        source_type='media',
        value=101.0,
        source='测试媒体来源',
        source_date='2026-04-14'
    )
    
    # 打印更新后的摘要
    validator.print_summary_report()


if __name__ == "__main__":
    # 测试：创建示例数据
    # create_sample_validation()
    
    # 运行主函数
    main()