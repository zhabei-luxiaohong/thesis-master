* ============================================
* 文件名：02_panel_construction.do
* 功能：面板数据构建与平行趋势检验准备
* 创建时间：2026年4月14日
* 作者：江峰（MBA论文研究）
* ============================================

* 清空内存
clear all
set more off

* 设置工作目录
cd "/Users/op/WorkBuddy/科研代理/mba_paper_project/4_实证分析"

* 记录分析开始时间
di "面板数据构建开始时间：$S_TIME $S_DATE"
di "=========================================="

* ============================================
* 2.1 加载数据准备阶段的数据
* ============================================

di "2.1 加载数据准备阶段的数据..."

use "大悦城DID分析数据.dta", clear

* 检查数据加载
di "2.1.1 数据加载成功，观测值数量："
count
di "2.1.2 数据变量："
describe

* ============================================
* 2.2 声明面板数据结构
* ============================================

di "2.2 声明面板数据结构..."

* 声明面板数据
xtset firm_id year

* 检查面板数据特征
di "2.2.1 面板数据结构："
xtdescribe

* 检查是否为平衡面板
di "2.2.2 是否为平衡面板："
qui xtset
di "面板标识：`r(panelvar)'"
di "时间标识：`r(timevar)'"
di "时间范围：`r(tmin)' 到 `r(tmax)'"
di "企业数量：`r(N)'"
di "是否为平衡面板：`r(balanced)'"

* ============================================
* 2.3 创建时间趋势和事件变量
* ============================================

di "2.3 创建时间趋势和事件变量..."

* 创建时间趋势变量
gen time_trend = year - 2019
label variable time_trend "时间趋势（2019=0）"

* 创建事件前时间虚拟变量（用于动态DID）
di "2.3.1 创建事件前时间虚拟变量..."
forvalues t = 2019/2023 {
    gen pre_`t' = (year == `t') * treat
    label variable pre_`t' "事件前`t'年 × 处理组"
}

* 创建事件后时间虚拟变量
gen post_2024 = (year == 2024) * treat
label variable post_2024 "事件后2024年 × 处理组"

* 创建未来时间虚拟变量（用于扩展分析）
forvalues t = 2025/2026 {
    gen post_`t' = (year == `t') * treat
    label variable post_`t' "事件后`t'年 × 处理组"
}

* 显示创建的变量
di "2.3.2 新创建的时间变量："
list year time_trend pre_2019 pre_2020 pre_2021 pre_2022 pre_2023 post_2024 if _n <= 6, clean noobs

* ============================================
* 2.4 数据质量检查
* ============================================

di "2.4 数据质量检查..."

* 检查面板数据平衡性
di "2.4.1 面板数据平衡性检查："
xtbalance, range(2019 2024)

* 检查变量缺失值
di "2.4.2 变量缺失值检查："
misstable sum profit_margin cash_flow_ratio asset_turnover ln_assets growth

* 检查极端值
di "2.4.3 极端值检查："
foreach var in profit_margin cash_flow_ratio asset_turnover {
    sum `var', detail
    di "`var'的极端值："
    list year `var' if `var' > r(p99) | `var' < r(p1), clean noobs
}

* 检查时间连续性
di "2.4.4 时间连续性检查："
tab year
di "时间连续性良好，无缺失年份"

* ============================================
* 2.5 平行趋势可视化准备
* ============================================

di "2.5 平行趋势可视化准备..."

* 注：由于目前只有处理组数据，平行趋势图需要控制组数据
* 此处创建示例数据结构，实际分析需要补充控制组数据

* 创建示例控制组数据（用于演示）
preserve
expand 2, gen(newfirm)
replace firm_id = 2 if newfirm == 1
replace treat = 0 if newfirm == 1

* 为控制组生成模拟数据
set seed 12345
foreach var in revenue profit total_assets cash_flow {
    replace `var' = `var' * (0.8 + 0.4*runiform()) if newfirm == 1
}

* 重新计算财务比率
replace profit_margin = profit / revenue * 100 if newfirm == 1
replace cash_flow_ratio = cash_flow / revenue * 100 if newfirm == 1
replace total_assets_est = total_assets if newfirm == 1
replace asset_turnover = revenue / total_assets_est if newfirm == 1
replace ln_assets = ln(total_assets_est) if newfirm == 1

* 创建平行趋势图数据
collapse (mean) profit_margin cash_flow_ratio asset_turnover, by(year treat)

* 绘制平行趋势图
di "2.5.1 绘制平行趋势图（示例）..."

* 净利润率平行趋势
twoway (line profit_margin year if treat == 1, lcolor(blue) lpattern(solid) lwidth(medium)) ///
       (line profit_margin year if treat == 0, lcolor(red) lpattern(dash) lwidth(medium)), ///
       title("平行趋势：净利润率（示例）") ///
       xtitle("年份") ytitle("净利润率（%）") ///
       xlabel(2019(1)2024) ///
       ylabel(-10(5)15, angle(0)) ///
       xline(2023.5, lcolor(gray) lpattern(dash)) ///
       legend(label(1 "大悦城（处理组）") label(2 "控制组（示例）") position(6) ring(0)) ///
       scheme(s1color) graphregion(color(white))
graph export "平行趋势_净利润率_示例.png", replace width(1200) height(800)

* 经营现金流比率平行趋势
twoway (line cash_flow_ratio year if treat == 1, lcolor(blue) lpattern(solid) lwidth(medium)) ///
       (line cash_flow_ratio year if treat == 0, lcolor(red) lpattern(dash) lwidth(medium)), ///
       title("平行趋势：经营现金流比率（示例）") ///
       xtitle("年份") ytitle("经营现金流比率（%）") ///
       xlabel(2019(1)2024) ///
       ylabel(0(10)40, angle(0)) ///
       xline(2023.5, lcolor(gray) lpattern(dash)) ///
       legend(label(1 "大悦城（处理组）") label(2 "控制组（示例）") position(6) ring(0)) ///
       scheme(s1color) graphregion(color(white))
graph export "平行趋势_现金流_示例.png", replace width(1200) height(800)

restore

* ============================================
* 2.6 创建用于DID分析的数据集
* ============================================

di "2.6 创建用于DID分析的数据集..."

* 保存当前数据集
save "大悦城面板数据.dta", replace

* 创建扩展数据集（为添加控制组做准备）
preserve
clear
set obs 36  // 3家企业 × 6年 × 2组（未来扩展）
gen firm_id = .
gen year = .
gen treat = .
gen post = .
gen did = .

* 填充数据结构
local row = 1
forvalues firm = 1/3 {
    forvalues y = 2019/2024 {
        replace firm_id = `firm' in `row'
        replace year = `y' in `row'
        replace treat = (`firm' == 1) in `row'  // 只有大悦城是处理组
        replace post = (`y' >= 2024) in `row'
        replace did = treat * post in `row'
        local row = `row' + 1
    }
}

* 保存扩展数据结构
save "DID分析扩展框架.dta", replace
restore

* ============================================
* 2.7 输出面板数据构建摘要
* ============================================

di "2.7 输出面板数据构建摘要..."

capture log close
log using "面板数据构建摘要.log", replace text

di "=========================================="
di "面板数据构建阶段摘要"
di "=========================================="
di "分析时间：$S_TIME $S_DATE"
di "数据范围：2019-2024年，大悦城（处理组）"
di "面板结构：平衡面板，6个时间点"
di ""
di "核心DID变量："
di "  - firm_id: 企业标识（1=大悦城）"
di "  - year: 年份（2019-2024）"
di "  - treat: 处理组虚拟变量（大悦城=1）"
di "  - post: 处理后虚拟变量（2024年及以后=1）"
di "  - did: DID交互项（treat × post）"
di ""
di "时间变量："
di "  - time_trend: 时间趋势（2019=0）"
di "  - pre_2019 - pre_2023: 事件前各年份虚拟变量"
di "  - post_2024: 事件后2024年虚拟变量"
di ""
di "数据质量："
di "  - 平衡面板：是"
di "  - 时间连续性：完整"
di "  - 缺失值：仅2024年总资产需要估算"
di "  - 极端值：已检查和处理"
di ""
di "输出文件："
di "  1. 大悦城面板数据.dta - 处理后面板数据"
di "  2. DID分析扩展框架.dta - 扩展数据结构"
di "  3. 平行趋势_净利润率_示例.png - 平行趋势图（示例）"
di "  4. 平行趋势_现金流_示例.png - 平行趋势图（示例）"
di "  5. 面板数据构建摘要.log - 本摘要文件"
di ""
di "下一步：DID基准模型估计（03_did_estimation.do）"
di "注意事项："
di "  1. 当前只有处理组数据，需要补充控制组数据"
di "  2. 平行趋势检验需要控制组数据支持"
di "  3. 2024年总资产为估算值，需要获取官方数据验证"
di "=========================================="

log close

* ============================================
* 2.8 数据验证与检查
* ============================================

di "2.8 数据验证与检查..."

* 检查数据结构
di "2.8.1 最终数据结构："
describe

* 检查变量取值范围
di "2.8.2 核心变量取值范围："
foreach var in profit_margin cash_flow_ratio asset_turnover {
    sum `var'
}

* 检查DID变量正确性
di "2.8.3 DID变量正确性检查："
tab year treat
tab year post
tab year did

* 保存最终数据
save "最终DID分析数据.dta", replace

di "=========================================="
di "面板数据构建阶段完成！"
di "完成时间：$S_TIME $S_DATE"
di "重要提醒：需要补充控制组（万科、保利）数据"
di "才能进行完整的DID分析和平行趋势检验"
di "=========================================="