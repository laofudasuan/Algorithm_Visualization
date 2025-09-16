import { useState } from 'react';

function KnapsackVisualization() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [currentStep, setCurrentStep] = useState(-1);
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

  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentStep(-1);
    setKnapsackTable([]);
    setKnapsackCurrentI(-1);
    setKnapsackCurrentW(-1);
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
    <div style={{ padding: '20px', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#1976d2',
        marginBottom: '30px'
      }}>0-1背包问题动态规划可视化</h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        margin: '0 auto',
        width: '100%'
      }}>
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
          width: '100%', // 改回100%宽度
          justifyContent: 'center'
        }}>
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

          {/* 背包容量 */}
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

          {/* 控制按钮 */}
          <button 
            onClick={knapsackDP}
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
          {renderKnapsackTable()}
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
          <div>
            <p><strong>0-1背包问题:</strong></p>
            <p>在给定容量的背包中选择物品，使得价值最大。</p>
            <p><strong>状态转移方程:</strong></p>
            <p>如果 weight[i] ≤ w: dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])</p>
            <p>否则: dp[i][w] = dp[i-1][w]</p>
            <p><strong>时间复杂度:</strong> O(n×W)</p>
            <p><strong>空间复杂度:</strong> O(n×W)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KnapsackVisualization;