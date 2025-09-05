import { useState } from 'react';

function Doubling() {
  const [base, setBase] = useState(2);
  const [exponent, setExponent] = useState(10);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [currentStep, setCurrentStep] = useState(-1);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);

  // 快速幂算法实现
  const fastPower = async () => {
    setIsAnimating(true);
    setSteps([]);
    setResult(null);
    setCurrentStep(0);

    let b = parseInt(base);
    let e = parseInt(exponent);
    let res = 1;
    let stepCount = 0;

    setSteps(prev => [...prev, {
      step: ++stepCount,
      base: b,
      exponent: e,
      result: res,
      operation: '初始化'
    }]);

    await new Promise(resolve => setTimeout(resolve, animationSpeed));

    while (e > 0) {
      if (e % 2 === 1) {
        res *= b;
        setSteps(prev => [...prev, {
          step: ++stepCount,
          base: b,
          exponent: e,
          result: res,
          operation: `指数为奇数，结果 *= ${b}`
        }]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
      }

      b *= b;
      e = Math.floor(e / 2);
      
      setSteps(prev => [...prev, {
        step: ++stepCount,
        base: b,
        exponent: e,
        result: res,
        operation: '底数平方，指数除以2'
      }]);
      
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }

    setResult(res);
    setIsAnimating(false);
  };

  const reset = () => {
    setIsAnimating(false);
    setCurrentStep(-1);
    setSteps([]);
    setResult(null);
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2' }}>倍增算法可视化</h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* 控制面板 */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 16, 
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          width: '100%'
        }}>
          <div>
            <label style={{ marginRight: 8 }}>底数:</label>
            <input 
              type="number" 
              value={base} 
              onChange={e => {
                setBase(e.target.value);
                reset();
              }}
              disabled={isAnimating}
              style={{ padding: 4, width: 60 }}
            />
          </div>
          
          <div>
            <label style={{ marginRight: 8 }}>指数:</label>
            <input 
              type="number" 
              value={exponent} 
              onChange={e => {
                setExponent(e.target.value);
                reset();
              }}
              disabled={isAnimating}
              style={{ padding: 4, width: 60 }}
            />
          </div>
          
          <div>
            <label style={{ marginRight: 8 }}>动画速度:</label>
            <input 
              type="range" 
              min="200" 
              max="1500" 
              value={animationSpeed}
              onChange={e => setAnimationSpeed(Number(e.target.value))}
              disabled={isAnimating}
              style={{ width: 100 }}
            />
            <span style={{ marginLeft: 8 }}>{animationSpeed}ms</span>
          </div>
          
          <button 
            onClick={fastPower} 
            disabled={isAnimating}
            style={{ 
              padding: '8px 16px', 
              background: '#1976d2', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: isAnimating ? 'not-allowed' : 'pointer' 
            }}
          >
            {isAnimating ? '计算中...' : '快速幂计算'}
          </button>
          
          <button 
            onClick={reset} 
            disabled={isAnimating}
            style={{ 
              padding: '8px 16px', 
              background: '#666', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4,
              cursor: isAnimating ? 'not-allowed' : 'pointer'
            }}
          >
            重置
          </button>
        </div>

        {/* 结果显示 */}
        {result !== null && (
          <div style={{ 
            padding: '20px',
            backgroundColor: '#e8f5e9',
            border: '2px solid #4caf50',
            borderRadius: '8px',
            textAlign: 'center',
            width: '100%',
            maxWidth: '600px'
          }}>
            <h2>计算结果</h2>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {base}<sup>{exponent}</sup> = {result}
            </p>
          </div>
        )}

        {/* 算法步骤可视化 */}
        {steps.length > 0 && (
          <div style={{ 
            width: '100%',
            maxWidth: '800px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <h3>计算步骤:</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#e0e0e0' }}>步骤</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#e0e0e0' }}>底数</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#e0e0e0' }}>指数</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#e0e0e0' }}>结果</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#e0e0e0' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{step.step}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{step.base}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{step.exponent}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{step.result}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{step.operation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 算法说明 */}
        <div style={{ 
          maxWidth: 800, 
          padding: 20, 
          border: '1px solid #ddd', 
          borderRadius: 8, 
          background: '#f5f5f5' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>倍增算法说明</h3>
          <div style={{ color: '#666' }}>
            <p><strong>应用场景:</strong> 快速幂运算、RMQ问题、LCA问题等</p>
            <p><strong>基本思想:</strong> 通过成倍增加规模来优化算法效率，避免线性计算。</p>
            <p><strong>快速幂算法原理:</strong></p>
            <p>计算 a^n 时，利用以下性质：</p>
            <ul>
              <li>当 n 为偶数时，a^n = (a^(n/2))^2</li>
              <li>当 n 为奇数时，a^n = a * a^(n-1)</li>
            </ul>
            <p><strong>时间复杂度:</strong> O(log n)</p>
            <p><strong>空间复杂度:</strong> O(1)</p>
            <p><strong>优势:</strong> 相比于朴素的逐次相乘方法（O(n)），快速幂大大提高了计算效率，特别是当指数很大时。</p>
          </div>
        </div>

        {/* 倍增算法应用场景 */}
        <div style={{ 
          maxWidth: 800, 
          padding: 20, 
          border: '1px solid #ddd', 
          borderRadius: 8, 
          background: '#fff3e0' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ff9800' }}>倍增算法常见应用</h3>
          <div style={{ color: '#666' }}>
            <ol>
              <li><strong>快速幂运算:</strong> 计算大数的幂次方</li>
              <li><strong>最近公共祖先(LCA):</strong> 在树结构中快速查找两个节点的最近公共祖先</li>
              <li><strong>区间最值查询(RMQ):</strong> 快速查询数组区间内的最值</li>
              <li><strong>字符串匹配:</strong> KMP算法中的失配函数计算</li>
              <li><strong>图论算法:</strong> 倍增法求解最短路径等</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Doubling;