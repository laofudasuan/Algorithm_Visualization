import { useState } from 'react';

function LCSVisualization() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [currentStep, setCurrentStep] = useState(-1);
  const [lcsString1, setLcsString1] = useState('ABCDGH');
  const [lcsString2, setLcsString2] = useState('AEDFHR');
  const [lcsTable, setLcsTable] = useState([]);
  const [lcsCurrentI, setLcsCurrentI] = useState(-1);
  const [lcsCurrentJ, setLcsCurrentJ] = useState(-1);

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

  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentStep(-1);
    setLcsTable([]);
    setLcsCurrentI(-1);
    setLcsCurrentJ(-1);
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

  return (
    <div style={{ padding: '20px', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2' }}>最长公共子序列动态规划可视化</h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '30px',
        maxWidth: '1400px',
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
          width: '100%',
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

          {/* 字符串输入 */}
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

          {/* 控制按钮 */}
          <button 
            onClick={lcsDP}
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
          {renderLCSTable()}
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
            <p><strong>最长公共子序列(LCS):</strong></p>
            <p>找出两个字符串的最长公共子序列长度。</p>
            <p><strong>状态转移方程:</strong></p>
            <p>如果 X[i] == Y[j]: LCS[i][j] = LCS[i-1][j-1] + 1</p>
            <p>否则: LCS[i][j] = max(LCS[i-1][j], LCS[i][j-1])</p>
            <p><strong>时间复杂度:</strong> O(m×n)</p>
            <p><strong>空间复杂度:</strong> O(m×n)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LCSVisualization;