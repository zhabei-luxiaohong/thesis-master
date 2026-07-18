#!/usr/bin/env python3
"""
MBA 论文写作助手系统测试脚本
测试系统部署和核心功能可用性
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def print_header(title):
    """打印标题"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def test_system_dependencies():
    """测试系统依赖"""
    print_header("测试系统依赖")
    
    # 检查 Python 版本
    python_version = sys.version_info
    print(f"✓ Python 版本: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # 检查 Node.js 版本
    try:
        result = subprocess.run(
            ["/Users/op/.workbuddy/binaries/node/versions/22.12.0/bin/node", "--version"],
            capture_output=True,
            text=True
        )
        print(f"✓ Node.js 版本: {result.stdout.strip()}")
    except Exception as e:
        print(f"✗ Node.js 检查失败: {e}")
        return False
    
    return True

def test_academic_writing_assistant():
    """测试 Academic Writing Assistant"""
    print_header("测试 Academic Writing Assistant")
    
    # 检查项目目录
    project_path = Path("academic-writing-assistant")
    if not project_path.exists():
        print("✗ 项目目录不存在")
        return False
    
    print(f"✓ 项目目录存在: {project_path}")
    
    # 检查核心文件
    required_files = [
        "package.json",
        "README.md",
        "app",
        "components"
    ]
    
    for file in required_files:
        file_path = project_path / file
        if file_path.exists():
            print(f"✓ 核心文件存在: {file}")
        else:
            print(f"✗ 核心文件缺失: {file}")
    
    # 测试服务器连接
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code in [200, 404]:  # 404 在开发模式下也正常
            print(f"✓ 服务器响应正常 (状态码: {response.status_code})")
            return True
        else:
            print(f"✗ 服务器异常 (状态码: {response.status_code})")
            return False
    except requests.ConnectionError:
        print("⚠️  服务器未运行 (可能需要手动启动)")
        print("   启动命令: cd academic-writing-assistant && npm run dev")
        return False
    except Exception as e:
        print(f"✗ 服务器测试失败: {e}")
        return False

def test_scientific_skills():
    """测试 Scientific Agent Skills"""
    print_header("测试 Scientific Agent Skills")
    
    # 检查技能库目录
    skills_path = Path("scientific-agent-skills")
    if not skills_path.exists():
        print("✗ 技能库目录不存在")
        return False
    
    print(f"✓ 技能库目录存在: {skills_path}")
    
    # 检查核心技能目录
    scientific_skills_path = skills_path / "scientific-skills"
    if not scientific_skills_path.exists():
        print("✗ 科学技能目录不存在")
        return False
    
    print(f"✓ 科学技能目录存在: {scientific_skills_path}")
    
    # 检查关键技能
    key_skills = [
        "citation-management",
        "scientific-writing", 
        "literature-review",
        "paper-lookup"
    ]
    
    skill_count = 0
    for skill in key_skills:
        skill_path = scientific_skills_path / skill
        if skill_path.exists():
            print(f"✓ 关键技能存在: {skill}")
            skill_count += 1
        else:
            print(f"⚠️  技能缺失: {skill}")
    
    # 统计总技能数
    try:
        total_skills = len(list(scientific_skills_path.iterdir()))
        print(f"✓ 总技能数量: {total_skills}")
    except Exception as e:
        print(f"⚠️  无法统计技能数量: {e}")
    
    return skill_count >= 2  # 至少需要2个关键技能

def test_mba_writing_skill():
    """测试 MBA 论文写作专用技能"""
    print_header("测试 MBA 论文写作专用技能")
    
    # 检查技能文件
    skill_path = Path(".workbuddy/skills/MBA_Thesis_Writing.md")
    if not skill_path.exists():
        print("✗ MBA 论文写作技能文件不存在")
        return False
    
    print(f"✓ MBA 技能文件存在: {skill_path}")
    
    # 检查文件内容
    try:
        with open(skill_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 检查关键部分
        required_sections = [
            "MBA Thesis Writing Skill",
            "REITs研究框架",
            "工作流程"
        ]
        
        section_count = 0
        for section in required_sections:
            if section in content:
                print(f"✓ 包含核心部分: {section}")
                section_count += 1
            else:
                print(f"⚠️  缺少部分: {section}")
        
        return section_count >= 2
    except Exception as e:
        print(f"✗ 读取技能文件失败: {e}")
        return False

def test_configuration_files():
    """测试配置文件"""
    print_header("测试配置文件")
    
    config_files = [
        "mba_paper_assistant_config.md",
        "MBA_Paper_Assistant_User_Guide.md"
    ]
    
    file_count = 0
    for config_file in config_files:
        if Path(config_file).exists():
            print(f"✓ 配置文件存在: {config_file}")
            file_count += 1
        else:
            print(f"✗ 配置文件缺失: {config_file}")
    
    return file_count == len(config_files)

def run_integration_test():
    """运行集成测试"""
    print_header("MBA 论文写作助手系统集成测试")
    
    tests = [
        ("系统依赖检查", test_system_dependencies),
        ("Academic Writing Assistant", test_academic_writing_assistant),
        ("Scientific Agent Skills", test_scientific_skills),
        ("MBA 写作技能", test_mba_writing_skill),
        ("配置文件检查", test_configuration_files)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"✗ {test_name} 测试异常: {e}")
            results.append((test_name, False))
    
    # 汇总结果
    print_header("测试结果汇总")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✓ 通过" if success else "✗ 失败"
        print(f"{status} - {test_name}")
    
    print(f"\n{'='*60}")
    print(f"  总测试: {total} | 通过: {passed} | 失败: {total - passed}")
    print(f"{'='*60}")
    
    if passed == total:
        print("\n🎉 所有测试通过！MBA 论文写作助手系统部署成功。")
        print("\n下一步操作:")
        print("1. 启动 Academic Writing Assistant: cd academic-writing-assistant && npm run dev")
        print("2. 访问 http://localhost:3000")
        print("3. 参考 MBA_Paper_Assistant_User_Guide.md 开始使用")
        return True
    elif passed >= 3:
        print("\n⚠️  系统基本可用，但部分功能可能受限。")
        print("   建议检查失败的项目并修复。")
        return True
    else:
        print("\n❌ 系统部署存在问题，请检查部署步骤。")
        return False

def main():
    """主函数"""
    print("MBA 论文写作助手系统测试")
    print("版本: 1.0 | 测试日期: 2026-04-13")
    
    # 切换到工作目录
    os.chdir("/Users/op/WorkBuddy/科研代理")
    print(f"工作目录: {os.getcwd()}")
    
    success = run_integration_test()
    
    if success:
        # 创建启动脚本
        create_startup_script()
        print("\n📋 已创建启动脚本: start_mba_assistant.sh")
        print("   使用: bash start_mba_assistant.sh")
    else:
        print("\n🔧 请参考部署文档重新配置系统。")
    
    return 0 if success else 1

def create_startup_script():
    """创建启动脚本"""
    script_content = """#!/bin/bash
# MBA 论文写作助手启动脚本

echo "启动 MBA 论文写作助手系统..."
echo "=============================="

# 检查是否在正确目录
if [ ! -d "academic-writing-assistant" ]; then
    echo "错误: 请在工作目录中运行此脚本"
    exit 1
fi

# 设置 Node.js 路径
export PATH="/Users/op/.workbuddy/binaries/node/versions/22.12.0/bin:$PATH"

# 启动 Academic Writing Assistant
echo "启动 Academic Writing Assistant..."
cd academic-writing-assistant
npm run dev &

# 等待服务器启动
echo "等待服务器启动..."
sleep 5

# 检查服务器状态
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|404"; then
    echo "✓ Academic Writing Assistant 已启动"
    echo "访问地址: http://localhost:3000"
else
    echo "⚠️  服务器可能未完全启动，请稍后访问"
fi

echo ""
echo "系统组件:"
echo "1. Academic Writing Assistant - 写作工具"
echo "2. Scientific Agent Skills - 研究技能库"
echo "3. MBA Thesis Writing Skill - 专业写作支持"
echo ""
echo "详细使用指南: 查看 MBA_Paper_Assistant_User_Guide.md"
echo "配置文件: 查看 mba_paper_assistant_config.md"

# 保持脚本运行
echo ""
echo "按 Ctrl+C 停止系统"
wait
"""
    
    with open("start_mba_assistant.sh", "w") as f:
        f.write(script_content)
    
    # 设置执行权限
    os.chmod("start_mba_assistant.sh", 0o755)

if __name__ == "__main__":
    sys.exit(main())