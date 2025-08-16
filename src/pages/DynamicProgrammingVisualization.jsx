import { useState, useRef, useEffect } from 'react';

function DynamicProgrammingVisualization() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('fibonacci');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [currentStep, setCurrentStep] = useState(-1);
  
  // 斐波那契数列相关状态
  const [fibN, setFibN] = useState(8);
  const [fibTable, setFibTable] = useState([]);
  const [fibCurrentN, setFibCurrentN] = useState(-1);
  
  // 最长公共子序列相关状态
  const [lcsString1, setLcsString1] = useState('ABCDGH');
  const [lcsString2, setLcsString2] = useState('AEDFHR');
  const [lcsTable, setLcsTable] = useState([]);
  const [lcsCurrentI, setLcsCurrentI] = useState(-1);
  const [lcsCurrentJ, setLcsCurrentJ] = useState(-1);
  
  // 背包问题相关状态
  const [knapsackCapacity, setKnapsackCapacity] = useState(10);
  const [knapsackItems, setKnapsackItems] = useState([
    { weight: 1, value: 1 },
    { weight: 3, value: 4 },
    { weight: 4, value: 5 },
    { weight: 5, value: 7 }
  ]);
  const [knapsackTable, setKnapsackTable] = useState([]);
  const [knapsackCurrentI, setKnapsackCurrentI] = useState(-1);
  const [knapsackCurrentW, setKnapsackCurrentW] = useState(-1);

  // 斐波那契数列动态规划可视化
  const fibonacciDP = async () => {
    setIsAnimating(true);
    setCurrentStep(0);
    
    const table = new Array(fibN + 1).fill(0);
    table[0] = 0;
    table[1] = 1;
    setFibTable([...table]);
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    for (let i = 2; i <= fibN; i++) {
      setFibCurrentN(i);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      table[i] = table[i - 1] + table[i - 2];
      setFibTable([...table]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    
    setFibCurrentN(-1);
    setIsAnimating(false);
    setCurrentStep(-1);
  };

  // 最长公共子序列动态规划可视化
  const lcsDP = async () => {
    setIsAnimating(true);
    setCurrentStep(0);
    
    const m = lcsString1.length;
    const n = lcsString2.length;
    const table = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    setLcsTable([...table]);
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        setLcsCurrentI(i);
        setLcsCurrentJ(j);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        
        if (lcsString1[i - 1] === lcsString2[j - 1]) {
          table[i][j] = table[i - 1][j - 1] + 1;
        } else {
          table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
        }
        
        setLcsTable([...table]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
      }
    }
    
    setLcsCurrentI(-1);
    setLcsCurrentJ(-1);
    setIsAnimating(false);
    setCurrentStep(-1);
  };

  // 0-1背包问题动态规划可视化
  const knapsackDP = async () => {
    setIsAnimating(true);
    setCurrentStep(0);
    
    const n = knapsackItems.length;
    const W = knapsackCapacity;
    const table = Array(n + 1).fill().map(() => Array(W + 1).fill(0));
    
    setKnapsackTable([...table]);
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    for (let i = 1; i <= n; i++) {
      for (let w = 1; w <= W; w++) {
        setKnapsackCurrentI(i);
        setKnapsackCurrentW(w);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        
        const item = knapsackItems[i - 1];
        if (item.weight <= w) {
          table[i][w] = Math.max(
            table[i - 1][w],
            table[i - 1][w - item.weight] + item.value
          );
        } else {
          table[i][w] = table[i - 1][w];
        }
        
        setKnapsackTable([...table]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
      }
    }
    
    setKnapsackCurrentI(-1);
    setKnapsackCurrentW(-1);
    setIsAnimating(false);
    setCurrentStep(-1);
  };

  const runAlgorithm = () => {
    switch (selectedAlgorithm) {
      case 'fibonacci':
        fibonacciDP();
        break;
      case 'lcs':
        lcsDP();
        break;
      case 'knapsack':
        knapsackDP();
        break;
      default:
        break;
    }
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentStep(-1);
    setFibTable([]);
    setFibCurrentN(-1);
    setLcsTable([]);
    setLcsCurrentI(-1);
    setLcsCurrentJ(-1);
    setKnapsackTable([]);
    setKnapsackCurrentI(-1);
    setKnapsackCurrentW(-1);
  };

  // 渲染斐波那契数列表格
  const renderFibonacciTable = () => {
    if (fibTable.length === 0) return null;
    
    return (
      <div style={{ margin: '20px 0' }}>
        <h3>动态规划表格</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginBottom: '10px' }}>
          {fibTable.map((value, index) => (
            <div
              key={index}
              style={{
                width: '40px',
                height: '40px',
                border: '2px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: index === fibCurrentN ? '#ff9800' : 
                                index <= currentStep ? '#4caf50' : '#f5f5f5',
                color: index === fibCurrentN || index <= currentStep ? 'white' : 'black',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {value}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
          {fibTable.map((_, index) => (
            <div
              key={index}
              style={{
                width: '40px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              F({index})
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染LCS表格
  const renderLCSTable = () => {
    if (lcsTable.length === 0) return null;
    
    return (
      <div style={{ margin: '20px 0' }}>
        <h3>动态规划表格</h3>
        <div style={{ marginBottom: '10px' }}>
          <div>字符串1: {lcsString1}</div>
          <div>字符串2: {lcsString2}</div>
        </div>
        <table style={{ borderCollapse: 'collapse', margin: '10px 0' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#f5f5f5' }}></th>
              <th style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#f5f5f5' }}>""</th>
              {lcsString2.split('').map((char, index) => (
                <th key={index} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#f5f5f5' }}>
                  {char}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lcsTable.map((row, i) => (
              <tr key={i}>
                <th style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#f5f5f5' }}>
                  {i === 0 ? '""' : lcsString1[i - 1]}
                </th>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    style={{
                      border: '1px solid #ccc',
                      padding: '8px',
                      textAlign: 'center',
                      backgroundColor: i === lcsCurrentI && j === lcsCurrentJ ? '#ff9800' : 
                                     (i <= lcsCurrentI && j <= lcsCurrentJ && lcsCurrentI !== -1) ? '#4caf50' : 
                                     'white',
                      color: i === lcsCurrentI && j === lcsCurrentJ ? 'white' : 'black',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 渲染背包问题表格
  const renderKnapsackTable = () => {
    if (knapsackTable.length === 0) return null;
    
    return (
      <div style={{ margin: '20px 0' }}>
        <h3>动态规划表格</h3>
        <div style={{ marginBottom: '10px' }}>
          <div>背包容量: {knapsackCapacity}</div>
          <div>物品信息:</div>
          {knapsackItems.map((item, index) => (
            <div key={index} style={{ marginLeft: '20px' }}>
              物品{index + 1}: 重量={item.weight}, 价值={item.value}
            </div>
          ))}
        </div>
        <table style={{ borderCollapse: 'collapse', margin: '10px 0' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#f5f5f5' }}>物品/容量</th>
              {Array.from({ length: knapsackCapacity + 1 }, (_, i) => (
                <th key={i} style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#f5f5f5' }}>
                  {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {knapsackTable.map((row, i) => (
              <tr key={i}>
                <th style={{ border: '1px solid #ccc', padding: '8px', backgroundColor: '#f5f5f5' }}>
                  {i === 0 ? '0' : `物品${i}`}
                </th>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    style={{
                      border: '1px solid #ccc',
                      padding: '8px',
                      textAlign: 'center',
                      backgroundColor: i === knapsackCurrentI && j === knapsackCurrentW ? '#ff9800' : 
                                     (i <= knapsackCurrentI && j <= knapsackCurrentW && knapsackCurrentI !== -1) ? '#4caf50' : 
                                     'white',
                      color: i === knapsackCurrentI && j === knapsackCurrentW ? 'white' : 'black',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', padding: '20px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ margin: 0, color: '#1976d2' }}>动态规划可视化</h1>
        
        {/* 控制面板 */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 16, 
          alignItems: 'center', 
          padding: 20, 
          border: '1px solid #ddd', 
          borderRadius: 8, 
          backgroundColor: '#f9f9f9',
          width: '100%',
          justifyContent: 'center'
        }}>
          {/* 算法选择 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label>算法:</label>
            <select 
              value={selectedAlgorithm} 
              onChange={(e) => {
                setSelectedAlgorithm(e.target.value);
                resetAnimation();
              }}
              disabled={isAnimating}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="fibonacci">斐波那契数列</option>
              <option value="lcs">最长公共子序列</option>
              <option value="knapsack">0-1背包问题</option>
            </select>
          </div>

          {/* 动画速度 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label>速度:</label>
            <select 
              value={animationSpeed} 
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              disabled={isAnimating}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value={1000}>慢</option>
              <option value={500}>中等</option>
              <option value={200}>快</option>
            </select>
          </div>

          {/* 算法特定参数 */}
          {selectedAlgorithm === 'fibonacci' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label>计算第几项:</label>
              <input 
                type="number" 
                value={fibN} 
                onChange={(e) => setFibN(Math.max(2, Math.min(15, Number(e.target.value))))}
                disabled={isAnimating}
                min="2" 
                max="15"
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '80px' }}
              />
            </div>
          )}

          {selectedAlgorithm === 'lcs' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label>字符串1:</label>
                <input 
                  type="text" 
                  value={lcsString1} 
                  onChange={(e) => setLcsString1(e.target.value.toUpperCase())}
                  disabled={isAnimating}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label>字符串2:</label>
                <input 
                  type="text" 
                  value={lcsString2} 
                  onChange={(e) => setLcsString2(e.target.value.toUpperCase())}
                  disabled={isAnimating}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
            </>
          )}

          {selectedAlgorithm === 'knapsack' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label>背包容量:</label>
              <input 
                type="number" 
                value={knapsackCapacity} 
                onChange={(e) => setKnapsackCapacity(Math.max(1, Math.min(20, Number(e.target.value))))}
                disabled={isAnimating}
                min="1" 
                max="20"
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '80px' }}
              />
            </div>
          )}

          {/* 控制按钮 */}
          <button 
            onClick={runAlgorithm}
            disabled={isAnimating}
            style={{
              padding: '10px 20px',
              backgroundColor: isAnimating ? '#ccc' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isAnimating ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isAnimating ? '运行中...' : '开始动画'}
          </button>
          
          <button 
            onClick={resetAnimation}
            disabled={isAnimating}
            style={{
              padding: '10px 20px',
              backgroundColor: isAnimating ? '#ccc' : '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isAnimating ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            重置
          </button>
        </div>

        {/* 可视化区域 */}
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          {selectedAlgorithm === 'fibonacci' && renderFibonacciTable()}
          {selectedAlgorithm === 'lcs' && renderLCSTable()}
          {selectedAlgorithm === 'knapsack' && renderKnapsackTable()}
        </div>

        {/* 算法说明 */}
        <div style={{ 
          maxWidth: '800px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          width: '100%'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>算法说明</h3>
          {selectedAlgorithm === 'fibonacci' && (
            <div>
              <p><strong>斐波那契数列动态规划:</strong></p>
              <p>使用动态规划自底向上计算斐波那契数列，避免重复计算。</p>
              <p><strong>状态转移方程:</strong> F(n) = F(n-1) + F(n-2)</p>
              <p><strong>时间复杂度:</strong> O(n)</p>
              <p><strong>空间复杂度:</strong> O(n)</p>
            </div>
          )}
          {selectedAlgorithm === 'lcs' && (
            <div>
              <p><strong>最长公共子序列(LCS):</strong></p>
              <p>找出两个字符串的最长公共子序列长度。</p>
              <p><strong>状态转移方程:</strong></p>
              <p>如果 X[i] == Y[j]: LCS[i][j] = LCS[i-1][j-1] + 1</p>
              <p>否则: LCS[i][j] = max(LCS[i-1][j], LCS[i][j-1])</p>
              <p><strong>时间复杂度:</strong> O(m×n)</p>
              <p><strong>空间复杂度:</strong> O(m×n)</p>
            </div>
          )}
          {selectedAlgorithm === 'knapsack' && (
            <div>
              <p><strong>0-1背包问题:</strong></p>
              <p>在给定容量的背包中选择物品，使得价值最大。</p>
              <p><strong>状态转移方程:</strong></p>
              <p>如果 weight[i] ≤ w: dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])</p>
              <p>否则: dp[i][w] = dp[i-1][w]</p>
              <p><strong>时间复杂度:</strong> O(n×W)</p>
              <p><strong>空间复杂度:</strong> O(n×W)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DynamicProgrammingVisualization;
