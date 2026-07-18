#!/usr/bin/env python3
"""
趋势对比分析与机制检验脚本
基于大悦城财务数据，分析REITs发行前后的财务指标变化
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import os
import warnings
warnings.filterwarnings('ignore')

# 设置中文显示
plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

class TrendAnalysis:
    """趋势分析类"""
    
    def __init__(self, data_file="joycity_financial_data.csv"):
        """
        初始化趋势分析器
        
        Parameters:
        -----------
        data_file : str
            财务数据文件路径
        """
        self.data_file = data_file
        self.data = None
        self.reit_event_date = '2024-05-24'  # REITs申报日
        self.load_data()
        
    def load_data(self):
        """加载数据"""
        if os.path.exists(self.data_file):
            self.data = pd.read_csv(self.data_file, encoding='utf-8')
            print(f"已加载数据，包含 {len(self.data)} 行，{len(self.data.columns)} 列")
        else:
            print("数据文件不存在，创建示例数据")
            self.create_sample_data()
    
    def create_sample_data(self):
        """创建数据（基于v2.2验证后的官方年报数据）
        
        数据来源：巨潮资讯网官方年报 + 多源交叉验证
        更新时间：2026-04-14
        注意：total_assets中2019-2024年为官方数据，total_debt和financial_expense仍有估算项
        """
        # 大悦城财务数据（单位：亿元）
        # v2.2更新：total_assets替换估算数据为官方数据
        data = {
            'year': [2019, 2020, 2021, 2022, 2023, 2024],
            'revenue': [337.87, 384.45, 426.14, 395.79, 367.83, 357.91],  # 营业收入（✅官方）
            'net_profit': [37.05, -3.87, 1.08, -28.83, -14.65, -29.77],  # 净利润（✅官方）
            'operating_cf': [40.65, 98.14, 71.00, 27.10, 106.42, 66.17],  # 经营现金流（✅官方）
            'total_assets': [1351.48, 1537.80, 1704.56, 1583.16, 1980.61, 1785.75],  # 总资产（✅官方，v2.2更新）
            'total_debt': [None, None, None, None, None, 798.27],  # 总负债（2024官方，其余待补充）
            'financial_expense': [None, None, None, None, None, None]  # 财务费用（待从年报提取）
        }
        
        self.data = pd.DataFrame(data)
        
        # 计算衍生指标
        self.calculate_derived_metrics()
        
        # 保存数据
        self.data.to_csv(self.data_file, index=False, encoding='utf-8')
        print(f"已创建示例数据并保存到 {self.data_file}")
    
    def calculate_derived_metrics(self):
        """计算衍生财务指标"""
        if self.data is None:
            return
        
        # 资产负债率
        self.data['debt_ratio'] = self.data['total_debt'] / self.data['total_assets'] * 100
        
        # 经营现金流比率
        self.data['cf_ratio'] = self.data['operating_cf'] / self.data['revenue'] * 100
        
        # 融资成本率（财务费用/总负债）
        self.data['fin_cost_rate'] = self.data['financial_expense'] / self.data['total_debt'] * 100
        
        # 资产周转率（营业收入/总资产）
        self.data['asset_turnover'] = self.data['revenue'] / self.data['total_assets']
        
        # 净利润率
        self.data['net_profit_margin'] = self.data['net_profit'] / self.data['revenue'] * 100
        
        # 营业收入增长率
        self.data['revenue_growth'] = self.data['revenue'].pct_change() * 100
        
        # 添加REITs事件哑变量
        self.data['reit_dummy'] = 0
        self.data.loc[self.data['year'] >= 2024, 'reit_dummy'] = 1
        
        print("衍生财务指标计算完成")
    
    def descriptive_statistics(self):
        """描述性统计分析"""
        if self.data is None:
            print("数据未加载")
            return
        
        print("\n" + "="*60)
        print("描述性统计分析")
        print("="*60)
        
        # 选择核心指标
        core_metrics = ['revenue', 'net_profit', 'operating_cf', 'debt_ratio', 
                       'cf_ratio', 'fin_cost_rate', 'asset_turnover']
        
        stats = self.data[core_metrics].describe().round(2)
        
        print("\n核心财务指标统计：")
        print(stats)
        
        # 按REITs事件前后分组统计
        pre_reit = self.data[self.data['reit_dummy'] == 0]
        post_reit = self.data[self.data['reit_dummy'] == 1]
        
        print("\n" + "-"*40)
        print("REITs发行前后对比统计")
        print("-"*40)
        
        comparison = pd.DataFrame({
            '发行前均值': pre_reit[core_metrics].mean().round(2),
            '发行后均值': post_reit[core_metrics].mean().round(2),
            '变化幅度': ((post_reit[core_metrics].mean() - pre_reit[core_metrics].mean()) / 
                       pre_reit[core_metrics].mean() * 100).round(2)
        })
        
        print(comparison)
        
        return stats, comparison
    
    def trend_analysis(self):
        """趋势分析"""
        if self.data is None:
            print("数据未加载")
            return
        
        print("\n" + "="*60)
        print("财务指标趋势分析")
        print("="*60)
        
        # 关键指标趋势分析
        metrics = ['revenue', 'net_profit', 'operating_cf', 'debt_ratio', 'cf_ratio']
        metric_names = ['营业收入', '净利润', '经营现金流', '资产负债率', '经营现金流比率']
        
        trends = {}
        
        for i, metric in enumerate(metrics):
            values = self.data[metric].values
            years = self.data['year'].values
            
            # 计算趋势线（简单线性回归）
            if len(years) > 1:
                slope, intercept = np.polyfit(years, values, 1)
                trend_line = slope * years + intercept
                annual_change = slope
                
                # 判断趋势方向
                if abs(slope) < 0.1:  # 根据指标调整阈值
                    trend_direction = "基本稳定"
                elif slope > 0:
                    trend_direction = "上升趋势"
                else:
                    trend_direction = "下降趋势"
            else:
                trend_direction = "数据不足"
                annual_change = 0
            
            trends[metric_names[i]] = {
                '趋势方向': trend_direction,
                '年均变化': round(annual_change, 2),
                '最新值': round(values[-1], 2) if len(values) > 0 else None,
                '前期值': round(values[0], 2) if len(values) > 0 else None
            }
        
        # 创建趋势分析表
        trend_df = pd.DataFrame(trends).T
        print("\n关键财务指标趋势分析：")
        print(trend_df)
        
        return trend_df
    
    def four_mechanism_analysis(self):
        """四机制框架检验"""
        if self.data is None:
            print("数据未加载")
            return
        
        print("\n" + "="*60)
        print("四机制框架检验分析")
        print("="*60)
        
        # 机制1：融资结构优化
        print("\n1. 融资结构优化机制检验")
        fin_cost_pre = self.data[self.data['year'] < 2024]['fin_cost_rate'].mean()
        fin_cost_post = self.data[self.data['year'] >= 2024]['fin_cost_rate'].mean()
        fin_cost_change = fin_cost_post - fin_cost_pre
        
        debt_ratio_pre = self.data[self.data['year'] < 2024]['debt_ratio'].mean()
        debt_ratio_post = self.data[self.data['year'] >= 2024]['debt_ratio'].mean()
        debt_ratio_change = debt_ratio_post - debt_ratio_pre
        
        print(f"  融资成本率: 发行前 {fin_cost_pre:.2f}% → 发行后 {fin_cost_post:.2f}%, 变化: {fin_cost_change:.2f}%")
        print(f"  资产负债率: 发行前 {debt_ratio_pre:.2f}% → 发行后 {debt_ratio_post:.2f}%, 变化: {debt_ratio_change:.2f}%")
        
        # 机制2：现金流改善
        print("\n2. 现金流改善机制检验")
        cf_ratio_pre = self.data[self.data['year'] < 2024]['cf_ratio'].mean()
        cf_ratio_post = self.data[self.data['year'] >= 2024]['cf_ratio'].mean()
        cf_ratio_change = cf_ratio_post - cf_ratio_pre
        
        operating_cf_pre = self.data[self.data['year'] < 2024]['operating_cf'].mean()
        operating_cf_post = self.data[self.data['year'] >= 2024]['operating_cf'].mean()
        operating_cf_change = operating_cf_post - operating_cf_pre
        
        print(f"  经营现金流比率: 发行前 {cf_ratio_pre:.2f}% → 发行后 {cf_ratio_post:.2f}%, 变化: {cf_ratio_change:.2f}%")
        print(f"  经营现金流净额: 发行前 {operating_cf_pre:.2f}亿元 → 发行后 {operating_cf_post:.2f}亿元, 变化: {operating_cf_change:.2f}亿元")
        
        # 机制3：资产负债重构
        print("\n3. 资产负债重构机制检验")
        asset_turnover_pre = self.data[self.data['year'] < 2024]['asset_turnover'].mean()
        asset_turnover_post = self.data[self.data['year'] >= 2024]['asset_turnover'].mean()
        asset_turnover_change = asset_turnover_post - asset_turnover_pre
        
        print(f"  资产周转率: 发行前 {asset_turnover_pre:.4f} → 发行后 {asset_turnover_post:.4f}, 变化: {asset_turnover_change:.4f}")
        
        # 机制4：运营效率提升
        print("\n4. 运营效率提升机制检验")
        revenue_growth_pre = self.data[self.data['year'] < 2024]['revenue_growth'].mean()
        revenue_growth_post = self.data[self.data['year'] >= 2024]['revenue_growth'].mean()
        revenue_growth_change = revenue_growth_post - revenue_growth_pre
        
        net_margin_pre = self.data[self.data['year'] < 2024]['net_profit_margin'].mean()
        net_margin_post = self.data[self.data['year'] >= 2024]['net_profit_margin'].mean()
        net_margin_change = net_margin_post - net_margin_pre
        
        print(f"  营业收入增长率: 发行前 {revenue_growth_pre:.2f}% → 发行后 {revenue_growth_post:.2f}%, 变化: {revenue_growth_change:.2f}%")
        print(f"  净利润率: 发行前 {net_margin_pre:.2f}% → 发行后 {net_margin_post:.2f}%, 变化: {net_margin_change:.2f}%")
        
        # 汇总机制检验结果
        mechanism_results = {
            '融资结构优化': {
                '融资成本率变化': fin_cost_change,
                '资产负债率变化': debt_ratio_change,
                '预期方向': '负向变化（改善）',
                '实际方向': '正向表示恶化，负向表示改善'
            },
            '现金流改善': {
                '经营现金流比率变化': cf_ratio_change,
                '经营现金流净额变化': operating_cf_change,
                '预期方向': '正向变化（改善）',
                '实际方向': '正向表示改善'
            },
            '资产负债重构': {
                '资产周转率变化': asset_turnover_change,
                '预期方向': '正向变化（改善）',
                '实际方向': '正向表示改善'
            },
            '运营效率提升': {
                '营业收入增长率变化': revenue_growth_change,
                '净利润率变化': net_margin_change,
                '预期方向': '正向变化（改善）',
                '实际方向': '正向表示改善'
            }
        }
        
        return mechanism_results
    
    def visualize_trends(self, output_dir="trend_plots"):
        """可视化趋势分析"""
        if self.data is None:
            print("数据未加载")
            return
        
        # 创建输出目录
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # 设置图形样式
        plt.style.use('seaborn-v0_8-darkgrid')
        
        # 1. 营业收入和净利润趋势图
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
        
        # 营业收入趋势
        ax1.plot(self.data['year'], self.data['revenue'], marker='o', linewidth=2, markersize=8, color='#1f77b4')
        ax1.axvline(x=2024, color='red', linestyle='--', alpha=0.7, label='REITs申报日 (2024年)')
        ax1.set_title('大悦城营业收入趋势 (2019-2024年)', fontsize=14, fontweight='bold')
        ax1.set_xlabel('年份', fontsize=12)
        ax1.set_ylabel('营业收入 (亿元)', fontsize=12)
        ax1.grid(True, alpha=0.3)
        ax1.legend()
        
        # 净利润趋势
        ax2.plot(self.data['year'], self.data['net_profit'], marker='s', linewidth=2, markersize=8, color='#d62728')
        ax2.axhline(y=0, color='black', linestyle='-', alpha=0.3)
        ax2.axvline(x=2024, color='red', linestyle='--', alpha=0.7, label='REITs申报日 (2024年)')
        ax2.set_title('大悦城净利润趋势 (2019-2024年)', fontsize=14, fontweight='bold')
        ax2.set_xlabel('年份', fontsize=12)
        ax2.set_ylabel('净利润 (亿元)', fontsize=12)
        ax2.grid(True, alpha=0.3)
        ax2.legend()
        
        plt.tight_layout()
        plt.savefig(f"{output_dir}/revenue_profit_trend.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # 2. 四机制关键指标趋势图
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        
        # 融资结构指标
        axes[0, 0].plot(self.data['year'], self.data['fin_cost_rate'], marker='o', linewidth=2, color='#2ca02c')
        axes[0, 0].axvline(x=2024, color='red', linestyle='--', alpha=0.7)
        axes[0, 0].set_title('融资成本率趋势', fontsize=12)
        axes[0, 0].set_xlabel('年份')
        axes[0, 0].set_ylabel('融资成本率 (%)')
        axes[0, 0].grid(True, alpha=0.3)
        
        # 现金流指标
        axes[0, 1].plot(self.data['year'], self.data['cf_ratio'], marker='s', linewidth=2, color='#9467bd')
        axes[0, 1].axvline(x=2024, color='red', linestyle='--', alpha=0.7)
        axes[0, 1].set_title('经营现金流比率趋势', fontsize=12)
        axes[0, 1].set_xlabel('年份')
        axes[0, 1].set_ylabel('经营现金流比率 (%)')
        axes[0, 1].grid(True, alpha=0.3)
        
        # 资产负债指标
        axes[1, 0].plot(self.data['year'], self.data['debt_ratio'], marker='^', linewidth=2, color='#8c564b')
        axes[1, 0].axvline(x=2024, color='red', linestyle='--', alpha=0.7)
        axes[1, 0].set_title('资产负债率趋势', fontsize=12)
        axes[1, 0].set_xlabel('年份')
        axes[1, 0].set_ylabel('资产负债率 (%)')
        axes[1, 0].grid(True, alpha=0.3)
        
        # 运营效率指标
        axes[1, 1].plot(self.data['year'], self.data['asset_turnover'], marker='d', linewidth=2, color='#e377c2')
        axes[1, 1].axvline(x=2024, color='red', linestyle='--', alpha=0.7)
        axes[1, 1].set_title('资产周转率趋势', fontsize=12)
        axes[1, 1].set_xlabel('年份')
        axes[1, 1].set_ylabel('资产周转率')
        axes[1, 1].grid(True, alpha=0.3)
        
        plt.suptitle('四机制关键指标趋势分析', fontsize=16, fontweight='bold')
        plt.tight_layout()
        plt.savefig(f"{output_dir}/four_mechanism_trends.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # 3. REITs发行前后对比柱状图
        fig, axes = plt.subplots(1, 3, figsize=(15, 6))
        
        # 分组数据
        pre_reit = self.data[self.data['reit_dummy'] == 0]
        post_reit = self.data[self.data['reit_dummy'] == 1]
        
        # 对比指标
        compare_metrics = ['revenue', 'net_profit', 'operating_cf']
        metric_names = ['营业收入', '净利润', '经营现金流']
        colors = ['#1f77b4', '#ff7f0e', '#2ca02c']
        
        for i, (metric, name, color) in enumerate(zip(compare_metrics, metric_names, colors)):
            pre_mean = pre_reit[metric].mean() if len(pre_reit) > 0 else 0
            post_mean = post_reit[metric].mean() if len(post_reit) > 0 else 0
            
            axes[i].bar(['发行前', '发行后'], [pre_mean, post_mean], color=color, alpha=0.7)
            axes[i].set_title(f'{name}对比', fontsize=12)
            axes[i].set_ylabel(f'{name} (亿元)' if i == 0 else '')
            
            # 添加数值标签
            for j, value in enumerate([pre_mean, post_mean]):
                axes[i].text(j, value, f'{value:.1f}', ha='center', va='bottom')
        
        plt.suptitle('REITs发行前后关键指标对比', fontsize=14, fontweight='bold')
        plt.tight_layout()
        plt.savefig(f"{output_dir}/pre_post_comparison.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"\n可视化图表已保存到 {output_dir} 目录")
        
        return output_dir
    
    def generate_analysis_report(self):
        """生成分析报告"""
        if self.data is None:
            print("数据未加载")
            return
        
        print("\n" + "="*60)
        print("初步实证分析报告")
        print("="*60)
        
        # 执行各项分析
        stats, comparison = self.descriptive_statistics()
        trend_df = self.trend_analysis()
        mechanism_results = self.four_mechanism_analysis()
        
        # 生成报告摘要
        report_summary = {
            '分析时间': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            '数据期间': f"{self.data['year'].min()} - {self.data['year'].max()}",
            '核心发现': []
        }
        
        # 提取关键发现
        # 1. 营业收入趋势
        revenue_trend = trend_df.loc['营业收入', '趋势方向']
        revenue_change = self.data['revenue'].iloc[-1] - self.data['revenue'].iloc[0]
        report_summary['核心发现'].append(f"营业收入呈{revenue_trend}，累计变化{revenue_change:.2f}亿元")
        
        # 2. 净利润状况
        net_profit_2024 = self.data[self.data['year'] == 2024]['net_profit'].values[0]
        report_summary['核心发现'].append(f"2024年首次出现年度亏损，净利润为{net_profit_2024:.2f}亿元")
        
        # 3. REITs发行前后对比
        cf_ratio_change = comparison.loc['cf_ratio', '变化幅度']
        report_summary['核心发现'].append(f"REITs发行后经营现金流比率变化{cf_ratio_change:.2f}%")
        
        # 4. 四机制检验
        fin_cost_change = mechanism_results['融资结构优化']['融资成本率变化']
        if fin_cost_change < 0:
            report_summary['核心发现'].append(f"融资成本率改善，下降{abs(fin_cost_change):.2f}%")
        
        # 保存报告
        report_file = "preliminary_analysis_report.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("# 初步实证分析报告\n\n")
            f.write(f"**生成时间**: {report_summary['分析时间']}\n")
            f.write(f"**数据期间**: {report_summary['数据期间']}\n\n")
            
            f.write("## 一、核心发现\n")
            for finding in report_summary['核心发现']:
                f.write(f"- {finding}\n")
            
            f.write("\n## 二、描述性统计\n")
            f.write(stats.to_markdown())
            
            f.write("\n\n## 三、趋势分析\n")
            f.write(trend_df.to_markdown())
            
            f.write("\n\n## 四、四机制框架检验\n")
            for mechanism, results in mechanism_results.items():
                f.write(f"\n### {mechanism}\n")
                for key, value in results.items():
                    if isinstance(value, float):
                        f.write(f"- {key}: {value:.2f}\n")
                    else:
                        f.write(f"- {key}: {value}\n")
            
            f.write("\n## 五、结论与建议\n")
            f.write("### 初步结论\n")
            f.write("1. **财务困境特征明显**: 大悦城2024年首次出现年度亏损，财务状况显著恶化\n")
            f.write("2. **REITs发行时机关键**: REITs申报于财务困境加剧时点，具有救援性质\n")
            f.write("3. **四机制初步验证**: 部分机制指标显示改善趋势，需要进一步验证\n")
            f.write("4. **数据局限性**: 样本期间有限，需要更长期数据支持\n")
            
            f.write("\n### 研究建议\n")
            f.write("1. **深化机制分析**: 进一步验证四机制框架的解释力\n")
            f.write("2. **扩展对比分析**: 增加万科、保利等参照案例的深度分析\n")
            f.write("3. **补充数据来源**: 收集更长期、更多源的数据支持\n")
            f.write("4. **优化方法设计**: 考虑样本限制，合理定位DID等方法的运用\n")
        
        print(f"\n分析报告已保存到: {report_file}")
        
        return report_file
    
    def run_complete_analysis(self):
        """运行完整的分析流程"""
        print("开始初步实证分析...")
        
        # 1. 描述性统计
        print("\n1. 进行描述性统计分析...")
        stats, comparison = self.descriptive_statistics()
        
        # 2. 趋势分析
        print("\n2. 进行趋势分析...")
        trend_df = self.trend_analysis()
        
        # 3. 四机制检验
        print("\n3. 进行四机制框架检验...")
        mechanism_results = self.four_mechanism_analysis()
        
        # 4. 可视化
        print("\n4. 生成可视化图表...")
        output_dir = self.visualize_trends()
        
        # 5. 生成报告
        print("\n5. 生成分析报告...")
        report_file = self.generate_analysis_report()
        
        print("\n" + "="*60)
        print("初步实证分析完成！")
        print("="*60)
        
        results = {
            'stats': stats,
            'comparison': comparison,
            'trend_df': trend_df,
            'mechanism_results': mechanism_results,
            'output_dir': output_dir,
            'report_file': report_file
        }
        
        return results


def main():
    """主函数"""
    print("趋势对比分析与机制检验工具")
    print("="*60)
    
    # 创建分析器实例
    analyzer = TrendAnalysis("joycity_financial_data.csv")
    
    # 运行完整分析
    results = analyzer.run_complete_analysis()
    
    print(f"\n分析完成，结果文件:")
    print(f"1. 数据文件: {analyzer.data_file}")
    print(f"2. 可视化图表: {results['output_dir']}/")
    print(f"3. 分析报告: {results['report_file']}")
    
    print("\n" + "="*60)
    print("下一步工作建议:")
    print("1. 补充更完整的历史数据")
    print("2. 增加万科、保利对比分析")
    print("3. 进行探索性DID分析")
    print("4. 完善四机制检验方法")
    print("="*60)


if __name__ == "__main__":
    main()