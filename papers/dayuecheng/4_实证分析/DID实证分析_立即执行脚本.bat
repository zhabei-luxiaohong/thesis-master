@echo off
echo ==============================================================
echo         大悦城REITs救援效应DID实证分析
echo ==============================================================
echo 执行时间: %date% %time%
echo 数据来源: 巨潮资讯网官方年报(2019-2024)
echo 分析方法: 双重差分模型(DID) + 多重检验
echo ==============================================================

echo.
echo 第一步: 数据准备与清洗...
stata -b do "01_data_preparation.do"

echo.
echo 第二步: 面板数据构建...
stata -b do "02_panel_construction.do"

echo.
echo 第三步: DID基准模型估计...
stata -b do "03_did_estimation.do"

echo.
echo 第四步: 平行趋势检验...
stata -b do "04_parallel_trends.do"

echo.
echo 第五步: 稳健性检验...
stata -b do "05_robustness_checks.do"

echo.
echo 第六步: 机制分析...
stata -b do "06_mechanism_analysis.do"

echo.
echo 第七步: 结果解读与报告生成...
stata -b do "07_results_interpretation.do"

echo.
echo ==============================================================
echo 所有步骤执行完成!
echo ==============================================================
echo 生成的核心文件:
echo 1. 大悦城DID基准估计结果.dta
echo 2. 平行趋势检验结果.dta
echo 3. 稳健性检验完整结果.dta
echo 4. 机制分析完整结果.dta
echo 5. DID实证分析最终结果.dta/.csv
echo 6. DID实证分析研究报告.txt
echo ==============================================================
echo 按任意键查看研究报告内容...
pause > nul

type "DID实证分析研究报告.txt"

echo.
echo ==============================================================
echo 分析完成! 按任意键退出...
pause > nul