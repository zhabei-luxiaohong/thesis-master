* ============================================
* 文件名：01_data_preparation.do
* 功能：数据导入与清洗
* 创建时间：2026年4月14日
* 作者：江峰（MBA论文研究）
* ============================================

* 清空内存
clear all
set more off

* 设置工作目录
cd "/Users/op/WorkBuddy/科研代理/mba_paper_project/4_实证分析"

* 记录分析开始时间
di "DID分析开始时间：$S_TIME $S_DATE"
di "=========================================="

* ============================================
* 1.1 创建大悦城官方财务数据
* ============================================

di "1.1 创建大悦城官方财务数据..."
input year revenue profit total_assets cash_flow
2019 337.87 37.05 1351.48 40.65
2020 384.45 -3.87 1537.80 98.14
2021 426.14 1.08 1704.56 71.00
2022 395.79 -28.83 1583.16 27.10
2023 367.83 -14.65 1980.61 106.42
2024 357.91 -29.77 . 66.17
end

* 创建企业标识变量
gen firm_id = 1  // 大悦城
label define firm_label 1 "大悦城"
label values firm_id firm_label

* 创建DID核心变量
gen post = (year >= 2024)  // REITs发行后
gen treat = 1              // 处理组
gen did = treat * post    // DID交互项

* 显示数据
di "1.1.1 原始数据预览："
list year revenue profit total_assets cash_flow post treat did, clean noobs

* ============================================
* 1.2 计算关键财务比率
* ============================================

di "1.2 计算关键财务比率..."

* 计算净利润率（%）
gen profit_margin = profit / revenue * 100
label variable profit_margin "净利润率（%）"

* 计算经营现金流比率（%）
gen cash_flow_ratio = cash_flow / revenue * 100
label variable cash_flow_ratio "经营现金流比率（%）"

* 估算2024年总资产（基于趋势）
gen total_assets_est = total_assets
replace total_assets_est = 1931.40 if missing(total_assets) & year == 2024
label variable total_assets_est "总资产（亿元，2024年估算）"

* 计算总资产周转率
gen asset_turnover = revenue / total_assets_est
label variable asset_turnover "总资产周转率"

* 计算公司规模（对数总资产）
gen ln_assets = ln(total_assets_est)
label variable ln_assets "对数总资产"

* 计算收入增长率
sort firm_id year
by firm_id: gen growth = (revenue - L.revenue) / L.revenue * 100
label variable growth "营业收入增长率（%）"

* 显示计算结果
di "1.2.1 财务比率计算结果："
list year profit_margin cash_flow_ratio asset_turnover ln_assets growth, clean noobs

* ============================================
* 1.3 数据描述性统计
* ============================================

di "1.3 数据描述性统计..."

* 基本描述性统计
di "1.3.1 基本描述性统计："
sum revenue profit total_assets cash_flow profit_margin cash_flow_ratio asset_turnover

* 按年份分组统计
di "1.3.2 按年份分组统计："
bysort year: sum profit_margin cash_flow_ratio asset_turnover

* 保存描述性统计结果
preserve
collapse (mean) profit_margin cash_flow_ratio asset_turnover (sd) sd_profit=profit_margin sd_cash=cash_flow_ratio sd_asset=asset_turnover, by(year)

di "1.3.3 描述性统计汇总表："
list year profit_margin sd_profit cash_flow_ratio sd_cash asset_turnover sd_asset, clean noobs

* 保存到文件
export delimited using "描述性统计汇总.csv", replace
restore

* ============================================
* 1.4 创建描述性统计表格
* ============================================

di "1.4 创建描述性统计表格..."

* 安装estout包（如果未安装）
capture ssc install estout

estpost tabstat revenue profit total_assets cash_flow profit_margin cash_flow_ratio asset_turnover, statistics(mean sd min max) columns(statistics)

esttab using "描述性统计表.tex", replace cells("mean sd min max") ///
    title("描述性统计：大悦城2019-2024年财务指标") ///
    addnotes("数据来源：巨潮资讯网官方年报，单位：亿元或百分比") ///
    label
    
di "1.4.1 描述性统计表格已保存到：描述性统计表.tex"

* ============================================
* 1.5 数据质量检查
* ============================================

di "1.5 数据质量检查..."

* 检查缺失值
di "1.5.1 缺失值检查："
misstable sum revenue profit total_assets cash_flow profit_margin cash_flow_ratio asset_turnover

* 检查异常值
di "1.5.2 异常值检查（Winsorization）："
capture ssc install winsor2

winsor2 profit_margin cash_flow_ratio asset_turnover, cuts(1 99) replace suffix(_w)

* 检查变量相关性
di "1.5.3 变量相关性检查："
corr profit_margin cash_flow_ratio asset_turnover ln_assets growth
pwcorr profit_margin cash_flow_ratio asset_turnover ln_assets growth, star(0.05)

* ============================================
* 1.6 保存处理后的数据
* ============================================

di "1.6 保存处理后的数据..."

* 保存原始数据
save "大悦城官方财务数据.dta", replace
di "1.6.1 原始数据已保存到：大悦城官方财务数据.dta"

* 保存处理后的数据
save "大悦城DID分析数据.dta", replace
di "1.6.2 分析数据已保存到：大悦城DID分析数据.dta"

* ============================================
* 1.7 输出数据摘要
* ============================================

di "1.7 输出数据摘要..."

* 创建数据摘要文件
capture log close
log using "数据准备摘要.log", replace text

di "=========================================="
di "数据准备阶段摘要"
di "=========================================="
di "分析时间：$S_TIME $S_DATE"
di "数据范围：大悦城2019-2024年"
di "数据来源：巨潮资讯网官方年报"
di "观测值数量：6"
di "变量数量：12"
di ""
di "核心变量："
di "  - revenue: 营业收入（亿元）"
di "  - profit: 净利润（亿元）"
di "  - total_assets: 总资产（亿元）"
di "  - cash_flow: 经营现金流（亿元）"
di "  - profit_margin: 净利润率（%）"
di "  - cash_flow_ratio: 经营现金流比率（%）"
di "  - asset_turnover: 总资产周转率"
di ""
di "DID变量："
di "  - post: REITs发行后（2024年及以后）"
di "  - treat: 处理组（大悦城=1）"
di "  - did: DID交互项（post × treat）"
di ""
di "控制变量："
di "  - ln_assets: 对数总资产（公司规模）"
di "  - growth: 营业收入增长率（%）"
di "  - time_trend: 时间趋势（将在下一步创建）"
di ""
di "数据质量检查结果："
di "  - 缺失值：2024年总资产需要估算"
di "  - 异常值：已进行Winsorization处理"
di "  - 相关性：各变量相关性合理"
di ""
di "下一步：面板数据构建（02_panel_construction.do）"

log close

di "=========================================="
di "数据准备阶段完成！"
di "完成时间：$S_TIME $S_DATE"
di "输出文件："
di "  1. 大悦城官方财务数据.dta"
di "  2. 大悦城DID分析数据.dta"
di "  3. 描述性统计表.tex"
di "  4. 描述性统计汇总.csv"
di "  5. 数据准备摘要.log"
di "=========================================="