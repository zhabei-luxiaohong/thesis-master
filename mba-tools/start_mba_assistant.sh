#!/bin/bash
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
