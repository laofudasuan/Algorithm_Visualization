import { useState, useRef, useEffect } from 'react';
import '../styles/modal.css';

function OnlinePythonEditor() {
  const [code, setCode] = useState(`# 欢迎使用在线Python编辑器！
# 这是一个在浏览器中运行的Python环境
# 无需安装任何软件，即可编写和运行Python代码

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
print("现在你可以编写自己的Python代码了！")`);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const outputRef = useRef(null);

  // 初始化Skulpt
  useEffect(() => {
    // 动态加载Skulpt库
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.jsdelivr.net/npm/skulpt@1.3.2/dist/skulpt.min.js';
    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://cdn.jsdelivr.net/npm/skulpt@1.3.2/dist/skulpt-stdlib.js';
      document.head.appendChild(script2);
    };
    document.head.appendChild(script1);

    return () => {
      // 清理脚本
      if (script1.parentNode) script1.parentNode.removeChild(script1);
      const script2 = document.head.querySelector('script[src*="skulpt-stdlib"]');
      if (script2 && script2.parentNode) script2.parentNode.removeChild(script2);
    };
  }, []);

  // 配置输出函数
  const configureOutput = () => {
    if (typeof Sk === 'undefined') return;
    
    Sk.configure({
      output: (text) => {
        setOutput(prev => prev + text);
      },
      read: (filename) => {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined)
          throw "File not found: '" + filename + "'";
        return Sk.builtinFiles["files"][filename];
      }
    });
  };

  const runCode = async () => {
    if (typeof Sk === 'undefined') {
      setOutput('正在加载Python环境，请稍后再试...');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setExecutionTime(0);
    
    const startTime = performance.now();

    try {
      configureOutput();
      await Sk.misceval.asyncToPromise(() => {
        return Sk.importMainWithBody("<stdin>", false, code, true);
      });
    } catch (error) {
      setOutput(`错误: ${error.toString()}`);
    } finally {
      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));
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

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2', marginBottom: '20px' }}>
        在线Python编程环境
      </h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        marginBottom: '20px'
      }}>
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
              {output || (typeof Sk === 'undefined' ? '正在加载Python环境...' : '点击"运行代码"来执行Python代码')}
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
            <li>这是一个完全在浏览器中运行的Python环境，无需服务器支持</li>
            <li>支持Python基本语法，包括循环、条件语句、函数定义等</li>
            <li>不支持需要外部库的代码（如numpy、matplotlib等）</li>
            <li>使用print()函数输出结果</li>
            <li>点击"Hello World示例"或"数据结构示例"可以加载预设代码</li>
            <li>执行时间显示在输出窗口的标题栏中</li>
          </ul>
          <h3>功能特点：</h3>
          <ul>
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

export default OnlinePythonEditor;