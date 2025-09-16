import { useState } from 'react';

function FibonacciVisualization() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [currentStep, setCurrentStep] = useState(-1);
  const [fibN, setFibN] = useState(8);
  const [fibTable, setFibTable] = useState([]);
  const [fibCurrentN, setFibCurrentN] = useState(-1);

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

  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentStep(-1);
    setFibTable([]);
    setFibCurrentN(-1);
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

  return (
    <div style={{ padding: '20px', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#1976d2',
        marginBottom: '30px'
      }}>斐波那契数列动态规划可视化</h1>
      
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

          {/* 算法特定参数 */}
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

          {/* 控制按钮 */}
          <button 
            onClick={fibonacciDP}
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
        <div style={{ width: '100%', maxWidth: '1200px' }}>
          {renderFibonacciTable()}
        </div>

        {/* 算法说明 */}
        <div style={{ 
          maxWidth: '800px', 
          padding: '24px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          width: '100%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>算法说明</h3>
          <div>
            <p><strong>斐波那契数列动态规划:</strong></p>
            <p>使用动态规划自底向上计算斐波那契数列，避免重复计算。</p>
            <p><strong>状态转移方程:</strong> F(n) = F(n-1) + F(n-2)</p>
            <p><strong>时间复杂度:</strong> O(n)</p>
            <p><strong>空间复杂度:</strong> O(n)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FibonacciVisualization;