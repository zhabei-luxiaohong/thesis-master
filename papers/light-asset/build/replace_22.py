import sys
with open('/Users/op/WorkBuddy/论文优化/mba_thesis_full.txt', 'r', encoding='utf-8') as f:
    content = f.read()

p_old22 = content.find('\n2.2 REITs与企业转型研究\n')
p_ch3 = content.find('\n第三章 研究设计\n')
print(f'old2.2:{p_old22} ch3:{p_ch3}')

if p_old22 > 0 and p_ch3 > p_old22:
    # Keep 2.1 section intact, replace 2.2 through end of Ch2 with new content
    content = content[:p_old22] + '\n' + open('/Users/op/WorkBuddy/论文优化/2.2_文献综述_优化版.txt', 'r', encoding='utf-8').read() + '\n\n' + open('/Users/op/WorkBuddy/论文优化/2.3_文献评述_优化版.txt', 'r', encoding='utf-8').read() + '\n\n' + content[p_ch3:]
    with open('/Users/op/WorkBuddy/论文优化/mba_thesis_full.txt', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Done: {len(content)} chars')
else:
    print('Boundaries not found')
    # Show what's around Ch3
    if p_ch3 > 0:
        print(repr(content[p_ch3-50:p_ch3+50]))
