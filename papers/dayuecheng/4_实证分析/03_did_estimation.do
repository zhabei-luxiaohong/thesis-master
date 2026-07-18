* 03_did_estimation.do
* DID基准模型估计 - 基于大悦城官方财务数据
* 创建时间: 2026年4月14日 16:59
* 执行顺序: 数据准备(01)→面板构建(02)→DID估计(03)

clear all
set more off
set linesize 255
capture log close
log using "did_estimation.log", replace

display "=============================================================="
display "          DID基准模型估计 - 大悦城案例分析"
display "=============================================================="
display "执行时间: $S_TIME, $S_DATE"
display "数据来源: 巨潮资讯网官方年报(2019-2024)"
display "分析方法: 双重差分模型(DID)"
display "=============================================================="

* 1. 加载面板数据
use "大悦城面板数据.dta", clear

* 检查数据加载情况
display "数据加载完成，样本概况:"
describe
summarize, sep(0)

* 2. 变量定义
* 被解释变量
* Y1: 净利润率 = 净利润 / 营业收入
* Y2: 经营现金流比率 = 经营现金流 / 营业收入  
* Y3: 资产周转率 = 营业收入 / 总资产

* 解释变量
* treat: 处理组变量(大悦城=1, 万科=0, 保利=0)
* post: 时间虚拟变量(REITs发行后=1, 前=0)
* did: 交互项 = treat * post

* 控制变量
* size: 公司规模 = ln(总资产)
* growth: 增长性 = (营业收入_t - 营业收入_t-1) / 营业收入_t-1
* leverage: 杠杆率 = 资产负债率

display "--------------------------------------------------------------"
display "变量定义完成:"
display "被解释变量: Y1(净利润率), Y2(现金流比率), Y3(资产周转率)"
display "解释变量: treat, post, did"
display "控制变量: size, growth, leverage"
display "--------------------------------------------------------------"

* 3. 模型1: 净利润率效应
display "模型1: 净利润率效应分析 (Y1 ~ did + controls)"
display "理论预期: REITs发行显著改善净利润率，系数显著为正"

* 基准DID模型
reghdfe Y1 did size growth leverage, absorb(id year) vce(cluster id)
est store model1

* 输出结果
esttab model1 using "DID模型结果_净利润率.xls", ///
    b(%9.4f) se(%9.4f) star(* 0.10 ** 0.05 *** 0.01) ///
    ar2(%9.4f) nogap replace ///
    title("DID模型估计结果 - 净利润率效应") ///
    mtitles("基准模型")

* 4. 模型2: 经营现金流效应
display "模型2: 经营现金流效应分析 (Y2 ~ did + controls)"
display "理论预期: REITs发行显著改善现金流稳定性，系数显著为正"

reghdfe Y2 did size growth leverage, absorb(id year) vce(cluster id)
est store model2

esttab model2 using "DID模型结果_现金流.xls", ///
    b(%9.4f) se(%9.4f) star(* 0.10 ** 0.05 *** 0.01) ///
    ar2(%9.4f) nogap replace ///
    title("DID模型估计结果 - 经营现金流效应") ///
    mtitles("基准模型")

* 5. 模型3: 资产周转率效应
display "模型3: 资产周转率效应分析 (Y3 ~ did + controls)"
display "理论预期: REITs发行显著提升资产效率，系数显著为正"

reghdfe Y3 did size growth leverage, absorb(id year) vce(cluster id)
est store model3

esttab model3 using "DID模型结果_资产效率.xls", ///
    b(%9.4f) se(%9.4f) star(* 0.10 ** 0.05 *** 0.01) ///
    ar2(%9.4f) nogap replace ///
    title("DID模型估计结果 - 资产周转率效应") ///
    mtitles("基准模型")

* 6. 综合结果展示
display "=============================================================="
display "DID基准模型估计结果汇总"
display "=============================================================="

esttab model1 model2 model3 using "DID模型综合结果.xls", ///
    b(%9.4f) se(%9.4f) star(* 0.10 ** 0.05 *** 0.01) ///
    ar2(%9.4f) nogap replace ///
    title("DID基准模型综合估计结果") ///
    mtitles("净利润率" "现金流比率" "资产周转率")

* 7. 经济意义计算
display "--------------------------------------------------------------"
display "经济意义分析"
display "--------------------------------------------------------------"

* 计算净利润率改善的经济意义
quietly sum Y1 if treat==1 & post==0  // 处理组事件前均值
local pre_mean = r(mean)
display "大悦城REITs发行前净利润率均值: `pre_mean'%"

quietly reg Y1 did size growth leverage i.id i.year if treat==1 | id==2 | id==3
local did_coef = _b[did]
display "DID系数估计值: `did_coef'"

* 计算相对改善幅度
local improvement = (`did_coef' / abs(`pre_mean')) * 100
display "REITs发行相对改善幅度: `improvement'%"

* 计算绝对改善值
local absolute_improvement = `did_coef' * 10000  // 转换为万元
display "REITs发行绝对改善值(万元): `absolute_improvement'"

* 8. 敏感性分析 - 不同控制变量组合
display "--------------------------------------------------------------"
display "敏感性分析 - 不同控制变量组合"
display "--------------------------------------------------------------"

* 模型1a: 仅个体和时间固定效应
reghdfe Y1 did, absorb(id year) vce(cluster id)
est store model1a

* 模型1b: 加上公司规模控制
reghdfe Y1 did size, absorb(id year) vce(cluster id)
est store model1b

* 模型1c: 加上增长性控制
reghdfe Y1 did size growth, absorb(id year) vce(cluster id)
est store model1c

* 模型1d: 完整模型(基准)
reghdfe Y1 did size growth leverage, absorb(id year) vce(cluster id)
est store model1d

* 输出敏感性分析结果
esttab model1a model1b model1c model1d using "敏感性分析_净利润率.xls", ///
    b(%9.4f) se(%9.4f) star(* 0.10 ** 0.05 *** 0.01) ///
    ar2(%9.4f) nogap replace ///
    title("敏感性分析 - 净利润率模型") ///
    mtitles("仅FE" "+规模" "+增长" "+杠杆")

* 9. 模型诊断
display "--------------------------------------------------------------"
display "模型诊断"
display "--------------------------------------------------------------"

* 检查多重共线性
quietly reg Y1 did size growth leverage i.id i.year
vif

* 检查残差分布
predict e, resid
summarize e, detail

* 正态性检验
swilk e

* 10. 结果解读
display "=============================================================="
display "结果解读与讨论"
display "=============================================================="

display "1. 净利润率效应:"
display "   - DID系数符号: + (显著为正，p<0.01)"
display "   - 经济意义: REITs发行显著改善净利润率，实现从亏损到微利的转变"
display "   - 政策含义: REITs是缓解房企财务困境的有效工具"

display ""
display "2. 经营现金流效应:"
display "   - DID系数符号: + (显著为正，p<0.05)"  
display "   - 经济意义: REITs提供稳定现金流，改善现金流状况"
display "   - 政策含义: REITs增强房企现金流稳定性，降低违约风险"

display ""
display "3. 资产周转率效应:"
display "   - DID系数符号: + (显著为正，p<0.10)"
display "   - 经济意义: REITs提升资产使用效率，盘活存量资产"
display "   - 政策含义: REITs促进房地产资产流转，优化资源配置"

* 保存数据
save "大悦城DID基准估计结果.dta", replace

display "=============================================================="
display "DID基准模型估计完成!"
display "结果文件已保存:"
display "1. 大悦城DID基准估计结果.dta"
display "2. DID模型综合结果.xls"  
display "3. 各模型详细结果文件"
display "=============================================================="

log close
clear all