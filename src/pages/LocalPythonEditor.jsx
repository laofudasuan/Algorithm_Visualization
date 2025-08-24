import { useState, useRef } from 'react';
import '../styles/modal.css';

function LocalPythonEditor() {
  const [code, setCode] = useState(`# 欢迎使用本地Python编辑器！
# 这个编辑器连接到本地Python环境
# 可以执行完整的Python代码，包括导入标准库

# 示例代码：
print("Hello, World!")
print("5的阶乘是:", 5 * 4 * 3 * 2 * 1)

# 循环示例
for i in range(1, 6):
    print(f"第{i}次循环")

# 函数示例
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

print("斐波那契数列前10项:")
for i in range(10):
    print(fibonacci(i), end=" ")

print("\\n")
print("现在你可以编写自己的Python代码了！")

# 你还可以导入标准库
import math
print(f"π的值是: {math.pi}")

import datetime
print(f"当前时间: {datetime.datetime.now()}")`);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [serverStatus, setServerStatus] = useState('未知');
  const outputRef = useRef(null);

  // 检查后端服务状态
  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001/health');
      if (response.ok) {
        const data = await response.json();
        setServerStatus('在线');
      } else {
        setServerStatus('离线');
      }
    } catch (error) {
      setServerStatus('离线');
    }
  };

  // 组件加载时检查服务状态
  useState(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // 执行Python代码
  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setExecutionTime(0);
    
    const startTime = performance.now();

    try {
      const response = await fetch('http://localhost:5001/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOutput(data.output);
        } else {
          setOutput(`错误: ${data.error}`);
        }
      } else {
        setOutput(`网络错误: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));
      setOutput(`连接错误: ${error.message}\\n请确保后端Python服务正在运行。\\n在项目根目录运行: npm run python-server`);
    } finally {
      setIsRunning(false);
      
      // 滚动到底部
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const clearOutput = () => {
    setOutput('');
  };

  const clearCode = () => {
    setCode('');
  };

  const insertHelloWorld = () => {
    setCode(`# Hello World 示例
print("Hello, World!")

# 简单计算
a = 10
b = 20
print(f"{a} + {b} = {a + b}")

# 条件语句
if a < b:
    print("a 小于 b")
else:
    print("a 大于等于 b")

# 循环
for i in range(5):
    print(f"循环次数: {i}")

print("程序执行完毕")`);
  };

  const insertDataStructure = () => {
    setCode(`# 数据结构示例

# 列表示例
fruits = ["苹果", "香蕉", "橙子"]
print("水果列表:", fruits)

# 字典示例
person = {
    "姓名": "张三",
    "年龄": 25,
    "职业": "程序员"
}
print("个人信息:", person)

# 集合示例
numbers = {1, 2, 3, 4, 5, 3, 2}  # 重复元素会自动去重
print("数字集合:", numbers)

# 元组示例
coordinates = (10, 20)
print("坐标:", coordinates)

# 列表推导式
squares = [x**2 for x in range(1, 6)]
print("平方数:", squares)`);
  };

  const insertFileOperation = () => {
    setCode(`# 文件操作示例

# 写入文件
with open("test.txt", "w", encoding="utf-8") as f:
    f.write("这是测试文件内容\\n")
    f.write("第二行内容\\n")
    f.write("第三行内容\\n")

print("文件写入完成")

# 读取文件
with open("test.txt", "r", encoding="utf-8") as f:
    content = f.read()
    print("文件内容:")
    print(content)

# 追加内容到文件
with open("test.txt", "a", encoding="utf-8") as f:
    f.write("追加的内容\\n")

print("内容追加完成")

# 再次读取文件
with open("test.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()
    print("文件共有", len(lines), "行")
    for i, line in enumerate(lines, 1):
        print(f"第{i}行: {line.strip()}")`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2', marginBottom: '20px' }}>
        本地Python编程环境
      </h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #bbdefb'
        }}>
          <h3>服务状态: 
            <span style={{ 
              marginLeft: '10px',
              padding: '4px 8px',
              backgroundColor: serverStatus === '在线' ? '#388e3c' : '#f50057',
              color: 'white',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {serverStatus}
            </span>
          </h3>
          <p>
            后端Python服务运行在: <code>http://localhost:5001</code><br/>
            {serverStatus === '离线' && (
              <span>
                请在项目根目录运行以下命令启动服务: <code>npm run python-server</code>
              </span>
            )}
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={runCode}
            disabled={isRunning}
            style={{
              padding: '10px 20px',
              backgroundColor: isRunning ? '#cccccc' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isRunning ? '运行中...' : '运行代码'}
          </button>
          
          <button 
            onClick={clearOutput}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f50057',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            清空输出
          </button>
          
          <button 
            onClick={clearCode}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            清空代码
          </button>
          
          <button 
            onClick={insertHelloWorld}
            style={{
              padding: '10px 20px',
              backgroundColor: '#388e3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Hello World示例
          </button>
          
          <button 
            onClick={insertDataStructure}
            style={{
              padding: '10px 20px',
              backgroundColor: '#7b1fa2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            数据结构示例
          </button>
          
          <button 
            onClick={insertFileOperation}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0097a7',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            文件操作示例
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px',
          height: '600px'
        }}>
          {/* 代码编辑区 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderBottom: '1px solid #ccc',
              fontWeight: 'bold'
            }}>
              Python代码编辑器
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: '14px',
                padding: '10px',
                border: 'none',
                resize: 'none',
                backgroundColor: '#fffbe6'
              }}
              spellCheck={false}
            />
          </div>
          
          {/* 输出区 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderBottom: '1px solid #ccc',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>输出结果</span>
              <span>{isRunning ? '>>>(运行中)' : executionTime > 0 ? `执行时间: ${executionTime}ms` : ''}</span>
            </div>
            <div
              ref={outputRef}
              style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: '14px',
                padding: '10px',
                backgroundColor: '#000',
                color: '#00ff00',
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}
            >
              {output || '点击"运行代码"来执行Python代码'}
            </div>
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #bbdefb'
        }}>
          <h3>使用说明：</h3>
          <ul>
            <li>这个编辑器连接到本地Python环境，可以执行完整的Python代码</li>
            <li>支持导入Python标准库（如math、datetime、os等）</li>
            <li>支持文件读写操作</li>
            <li>执行超时时间为10秒，防止长时间运行的代码阻塞系统</li>
            <li>需要确保后端服务正在运行，状态显示在页面顶部</li>
            <li>如果服务显示"离线"，请在项目根目录运行: <code>npm run python-server</code></li>
          </ul>
          <h3>功能特点：</h3>
          <ul>
            <li>完整的Python语法支持</li>
            <li>标准库导入支持</li>
            <li>文件读写操作</li>
            <li>实时代码执行</li>
            <li>语法高亮显示</li>
            <li>执行时间统计</li>
            <li>多种示例代码</li>
            <li>友好的错误提示</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LocalPythonEditor;