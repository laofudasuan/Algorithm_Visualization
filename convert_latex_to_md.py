import re

fi = 'Greedy/Greedy.mdx'
fo = 'Greedy/Greedy_converted.mdx'

# 读取文件内容
with open('/Users/laofu/Desktop/algorithm/Algorithm_Visualization/src/data/courseware/pages/' + fi, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 处理section标题：\section{标题} -> ## 标题
content = re.sub(r'\\section\{(.*?)\}', r'## \1', content)

# 2. 处理frame标题：\begin{frame}{标题} -> ##### 标题
# 处理单标题情况
content = re.sub(r'\\begin\{frame\}\{(.*?)\}', r'##### \1', content)
# 处理双标题情况（主标题和副标题）
content = re.sub(r'\\begin\{frame\}\{(.*?)\}\{(.*?)\}', r'##### \1 \2', content)

# 3. 移除所有的\end{frame}
content = content.replace('\\end{frame}', '')

# 4. 处理itemize列表：将\item替换为-，并移除\begin{itemize}和\end{itemize}
# 先将\begin{itemize}替换为空
content = content.replace('\\begin{itemize}', '')
# 将\end{itemize}替换为空
content = content.replace('\\end{itemize}', '')
# 将\item替换为-（注意处理可能的缩进）
content = re.sub(r'\\item', r'-', content)

# 5. 处理连续相同frame标题的情况
lines = content.split('\n')
new_lines = []
last_title = None
in_collapsible = False

for line in lines:
    if line.startswith('##### '):
        current_title = line
        if current_title == last_title:
            if not in_collapsible:
                # 开始一个新的CollapsibleComponent
                new_lines.append('<CollapsibleComponent title="解法">')
                in_collapsible = True
        else:
            if in_collapsible:
                # 结束之前的CollapsibleComponent
                new_lines.append('</CollapsibleComponent>')
                in_collapsible = False
            last_title = current_title
        new_lines.append(line)
    else:
        new_lines.append(line)

# 确保最后一个CollapsibleComponent被关闭
if in_collapsible:
    new_lines.append('</CollapsibleComponent>')

content = '\n'.join(new_lines)

# 保存转换后的内容
with open('/Users/laofu/Desktop/algorithm/Algorithm_Visualization/src/data/courseware/pages/' + fo, 'w', encoding='utf-8') as f:
    f.write(content)

print('转换完成，文件保存为 ' + fo)
