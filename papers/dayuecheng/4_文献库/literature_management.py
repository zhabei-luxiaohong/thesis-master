#!/usr/bin/env python3
"""
文献管理工具 - 基于v2.1工作流
支持文献矩阵构建、四象限分类、质量评估等功能
"""

import pandas as pd
import numpy as np
from datetime import datetime
import json
import os

class LiteratureManager:
    """文献管理器类"""
    
    def __init__(self, data_file="literature_matrix.csv"):
        """
        初始化文献管理器
        
        Parameters:
        -----------
        data_file : str
            文献矩阵数据文件路径
        """
        self.data_file = data_file
        self.matrix = None
        self.load_or_create_matrix()
        
    def load_or_create_matrix(self):
        """加载或创建文献矩阵"""
        if os.path.exists(self.data_file):
            self.matrix = pd.read_csv(self.data_file, encoding='utf-8')
            print(f"已加载文献矩阵，包含 {len(self.matrix)} 篇文献")
        else:
            self.create_empty_matrix()
            print("创建新的文献矩阵")
    
    def create_empty_matrix(self):
        """创建空的文献矩阵"""
        columns = [
            'ID', '作者', '年份', '标题', '期刊', '质量评级', '相关性',
            '四象限', '研究问题', '理论框架', '研究方法', '样本数据',
            '主要发现', '研究局限', '引用状态', '笔记链接', '添加日期',
            '最后更新', '备注'
        ]
        
        self.matrix = pd.DataFrame(columns=columns)
        self.save_matrix()
    
    def add_literature(self, literature_data):
        """
        添加文献到矩阵
        
        Parameters:
        -----------
        literature_data : dict
            文献数据字典，包含ID、作者、年份等字段
        """
        # 设置默认值
        default_values = {
            'ID': f"L{len(self.matrix)+1:03d}",
            '添加日期': datetime.now().strftime('%Y-%m-%d'),
            '最后更新': datetime.now().strftime('%Y-%m-%d'),
            '引用状态': '待读',
            '质量评级': '待评估',
            '相关性': '待评估',
            '四象限': '待分类'
        }
        
        # 合并默认值和用户输入
        merged_data = {**default_values, **literature_data}
        
        # 添加到矩阵
        new_row = pd.DataFrame([merged_data])
        self.matrix = pd.concat([self.matrix, new_row], ignore_index=True)
        
        self.save_matrix()
        print(f"已添加文献: {merged_data['标题'][:50]}...")
        
        return merged_data['ID']
    
    def update_literature(self, literature_id, update_data):
        """
        更新文献信息
        
        Parameters:
        -----------
        literature_id : str
            文献ID，如"L001"
        update_data : dict
            要更新的数据
        """
        if literature_id not in self.matrix['ID'].values:
            print(f"错误: 文献ID '{literature_id}' 不存在")
            return False
        
        # 更新数据
        idx = self.matrix[self.matrix['ID'] == literature_id].index[0]
        
        # 更新字段
        for key, value in update_data.items():
            if key in self.matrix.columns:
                self.matrix.at[idx, key] = value
        
        # 更新最后更新日期
        self.matrix.at[idx, '最后更新'] = datetime.now().strftime('%Y-%m-%d')
        
        self.save_matrix()
        print(f"已更新文献: {literature_id}")
        return True
    
    def classify_quadrant(self, literature_id, quadrant):
        """
        对文献进行四象限分类
        
        Parameters:
        -----------
        literature_id : str
            文献ID
        quadrant : str
            四象限分类：'Q1', 'Q2', 'Q3', 'Q4'
        """
        valid_quadrants = ['Q1', 'Q2', 'Q3', 'Q4']
        if quadrant not in valid_quadrants:
            print(f"错误: 无效的四象限分类，应为 {valid_quadrants}")
            return False
        
        return self.update_literature(literature_id, {'四象限': quadrant})
    
    def assess_quality(self, literature_id, quality_rating):
        """
        评估文献质量
        
        Parameters:
        -----------
        literature_id : str
            文献ID
        quality_rating : str
            质量评级：'A', 'B', 'C', 'D'
        """
        valid_ratings = ['A', 'B', 'C', 'D']
        if quality_rating not in valid_ratings:
            print(f"错误: 无效的质量评级，应为 {valid_ratings}")
            return False
        
        return self.update_literature(literature_id, {'质量评级': quality_rating})
    
    def assess_relevance(self, literature_id, relevance):
        """
        评估文献相关性
        
        Parameters:
        -----------
        literature_id : str
            文献ID
        relevance : str
            相关性：'高', '中', '低'
        """
        valid_relevance = ['高', '中', '低']
        if relevance not in valid_relevance:
            print(f"错误: 无效的相关性评估，应为 {valid_relevance}")
            return False
        
        return self.update_literature(literature_id, {'相关性': relevance})
    
    def set_reading_status(self, literature_id, status):
        """
        设置阅读状态
        
        Parameters:
        -----------
        literature_id : str
            文献ID
        status : str
            阅读状态：'已读', '待读', '放弃'
        """
        valid_status = ['已读', '待读', '放弃']
        if status not in valid_status:
            print(f"错误: 无效的阅读状态，应为 {valid_status}")
            return False
        
        return self.update_literature(literature_id, {'引用状态': status})
    
    def generate_statistics(self):
        """生成文献统计信息"""
        if len(self.matrix) == 0:
            print("文献矩阵为空")
            return None
        
        stats = {
            '总文献数': len(self.matrix),
            '已读文献数': len(self.matrix[self.matrix['引用状态'] == '已读']),
            '待读文献数': len(self.matrix[self.matrix['引用状态'] == '待读']),
            '放弃文献数': len(self.matrix[self.matrix['引用状态'] == '放弃'])
        }
        
        # 四象限统计
        quadrant_stats = self.matrix['四象限'].value_counts().to_dict()
        stats.update({f'{q}文献数': quadrant_stats.get(q, 0) for q in ['Q1', 'Q2', 'Q3', 'Q4']})
        
        # 质量评级统计
        quality_stats = self.matrix['质量评级'].value_counts().to_dict()
        stats.update({f'质量评级{q}': quality_stats.get(q, 0) for q in ['A', 'B', 'C', 'D']})
        
        # 相关性统计
        relevance_stats = self.matrix['相关性'].value_counts().to_dict()
        stats.update({f'相关性{r}': relevance_stats.get(r, 0) for r in ['高', '中', '低']})
        
        return stats
    
    def get_literature_by_quadrant(self, quadrant):
        """
        获取指定四象限的文献
        
        Parameters:
        -----------
        quadrant : str
            四象限：'Q1', 'Q2', 'Q3', 'Q4'
        """
        if quadrant not in ['Q1', 'Q2', 'Q3', 'Q4']:
            print("错误: 无效的四象限")
            return None
        
        return self.matrix[self.matrix['四象限'] == quadrant]
    
    def get_literature_by_quality(self, quality):
        """
        获取指定质量评级的文献
        
        Parameters:
        -----------
        quality : str
            质量评级：'A', 'B', 'C', 'D'
        """
        if quality not in ['A', 'B', 'C', 'D']:
            print("错误: 无效的质量评级")
            return None
        
        return self.matrix[self.matrix['质量评级'] == quality]
    
    def search_literature(self, keyword, search_fields=['标题', '作者', '期刊']):
        """
        搜索文献
        
        Parameters:
        -----------
        keyword : str
            搜索关键词
        search_fields : list
            搜索字段列表
        """
        results = pd.DataFrame()
        
        for field in search_fields:
            if field in self.matrix.columns:
                mask = self.matrix[field].astype(str).str.contains(keyword, case=False, na=False)
                results = pd.concat([results, self.matrix[mask]], ignore_index=True)
        
        # 去重
        results = results.drop_duplicates(subset='ID')
        
        return results
    
    def save_matrix(self):
        """保存文献矩阵到文件"""
        self.matrix.to_csv(self.data_file, index=False, encoding='utf-8')
    
    def export_to_excel(self, output_file="literature_matrix_export.xlsx"):
        """导出文献矩阵到Excel"""
        self.matrix.to_excel(output_file, index=False)
        print(f"已导出到 {output_file}")
    
    def print_summary(self):
        """打印文献矩阵摘要"""
        stats = self.generate_statistics()
        
        if stats:
            print("\n" + "="*50)
            print("文献矩阵摘要")
            print("="*50)
            
            print(f"\n1. 文献数量统计:")
            print(f"   总文献数: {stats['总文献数']}")
            print(f"   已读文献数: {stats['已读文献数']}")
            print(f"   待读文献数: {stats['待读文献数']}")
            print(f"   放弃文献数: {stats['放弃文献数']}")
            
            print(f"\n2. 四象限分类统计:")
            for q in ['Q1', 'Q2', 'Q3', 'Q4']:
                print(f"   {q}文献数: {stats.get(f'{q}文献数', 0)}")
            
            print(f"\n3. 质量评级统计:")
            for q in ['A', 'B', 'C', 'D']:
                print(f"   质量评级{q}: {stats.get(f'质量评级{q}', 0)}")
            
            print(f"\n4. 相关性统计:")
            for r in ['高', '中', '低']:
                print(f"   相关性{r}: {stats.get(f'相关性{r}', 0)}")
            
            print("\n" + "="*50)
            
            # 打印Q1核心文献列表
            q1_literature = self.get_literature_by_quadrant('Q1')
            if len(q1_literature) > 0:
                print("\nQ1核心文献列表:")
                for idx, row in q1_literature.iterrows():
                    print(f"  {row['ID']}: {row['作者']} ({row['年份']}) - {row['标题'][:60]}...")
        else:
            print("文献矩阵为空")


def create_sample_data():
    """创建示例数据（用于测试）"""
    manager = LiteratureManager("sample_literature_matrix.csv")
    
    # 添加示例文献
    sample_literature = [
        {
            '作者': '张三、李四',
            '年份': '2023',
            '标题': 'REITs对中国房企财务困境的影响机制研究',
            '期刊': '《金融研究》',
            '研究问题': 'REITs如何影响中国房企的财务困境？',
            '理论框架': '资本结构理论、代理理论',
            '研究方法': '双重差分模型（DID）、案例研究法',
            '样本数据': '中国A股房企2010-2020年',
            '主要发现': 'REITs发行显著降低企业融资成本，改善经营性现金流',
            '研究局限': '样本量有限、内生性问题',
            '笔记链接': '/notes/L001_张三_2023.md'
        },
        {
            '作者': '王五、赵六',
            '年份': '2022',
            '标题': '案例研究方法在管理研究中的应用',
            '期刊': '《管理世界》',
            '研究问题': '如何有效应用案例研究方法？',
            '理论框架': '案例研究理论、质性研究方法论',
            '研究方法': '案例研究法、访谈法、文档分析',
            '样本数据': '多个企业管理案例',
            '主要发现': '提供了案例研究设计的系统框架',
            '研究局限': '主观性较强、外部效度有限',
            '笔记链接': '/notes/L002_王五_2022.md'
        },
        {
            '作者': 'Smith, J., & Johnson, M.',
            '年份': '2021',
            '标题': 'The Impact of REITs on Corporate Financial Distress: Evidence from the US',
            '期刊': 'Journal of Real Estate Finance and Economics',
            '研究问题': 'How do REITs affect corporate financial distress in the US?',
            '理论框架': 'Financial distress theory, Capital structure theory',
            '研究方法': 'Event study, Regression analysis',
            '样本数据': 'US REITs 2000-2020',
            '主要发现': 'REITs issuance reduces financial distress risk by 15-20%',
            '研究局限': 'US context may not generalize to other markets',
            '笔记链接': '/notes/L003_Smith_2021.md'
        }
    ]
    
    for lit in sample_literature:
        lit_id = manager.add_literature(lit)
        
        # 对第一篇文章进行完整分类和评估
        if lit_id == "L001":
            manager.classify_quadrant(lit_id, 'Q1')
            manager.assess_quality(lit_id, 'A')
            manager.assess_relevance(lit_id, '高')
            manager.set_reading_status(lit_id, '已读')
        
        # 对第二篇文章进行分类和评估
        elif lit_id == "L002":
            manager.classify_quadrant(lit_id, 'Q2')
            manager.assess_quality(lit_id, 'A')
            manager.assess_relevance(lit_id, '中')
            manager.set_reading_status(lit_id, '已读')
        
        # 对第三篇文章进行分类和评估
        elif lit_id == "L003":
            manager.classify_quadrant(lit_id, 'Q1')
            manager.assess_quality(lit_id, 'B')
            manager.assess_relevance(lit_id, '高')
            manager.set_reading_status(lit_id, '待读')
    
    # 打印摘要
    manager.print_summary()
    
    # 导出到Excel
    manager.export_to_excel("sample_literature_matrix_export.xlsx")
    
    return manager


def main():
    """主函数"""
    print("文献管理工具 - 基于v2.1工作流")
    print("="*50)
    
    # 创建或加载文献矩阵
    manager = LiteratureManager("literature_matrix.csv")
    
    # 打印当前状态
    manager.print_summary()
    
    # 示例：添加新文献
    print("\n示例：添加新文献")
    new_lit = {
        '作者': '测试作者',
        '年份': '2024',
        '标题': '测试文献标题',
        '期刊': '测试期刊',
        '研究问题': '测试研究问题',
        '理论框架': '测试理论框架',
        '研究方法': '测试研究方法',
        '样本数据': '测试样本数据',
        '主要发现': '测试主要发现',
        '研究局限': '测试研究局限'
    }
    
    lit_id = manager.add_literature(new_lit)
    
    # 示例：对文献进行分类和评估
    manager.classify_quadrant(lit_id, 'Q1')
    manager.assess_quality(lit_id, 'B')
    manager.assess_relevance(lit_id, '中')
    manager.set_reading_status(lit_id, '待读')
    
    # 打印更新后的摘要
    manager.print_summary()


if __name__ == "__main__":
    # 测试：创建示例数据
    # create_sample_data()
    
    # 运行主函数
    main()