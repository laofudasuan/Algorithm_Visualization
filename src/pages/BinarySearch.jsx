import { useState } from 'react';

function BinarySearch() {
  const [array, setArray] = useState([1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
  const [target, setTarget] = useState(7);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(array.length - 1);
  const [mid, setMid] = useState(-1);
  const [found, setFound] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [steps, setSteps] = useState([]);

  const binarySearch = async () => {
    setIsAnimating(true);
    setSteps([]);
    setFound(false);
    setLow(0);
    setHigh(array.length - 1);
    setMid(-1);
    setCurrentIndex(-1);

    let l = 0;
    let h = array.length - 1;
    let stepCount = 0;

    while (l <= h) {
      const m = Math.floor((l + h) / 2);
      setLow(l);
      setHigh(h);
      setMid(m);
      setCurrentIndex(m);
      
      stepCount++;
      const stepInfo = {
        step: stepCount,
        low: l,
        high: h,
        mid: m,
        value: array[m],
        comparison: array[m] === target ? '等于' : array[m] < target ? '小于' : '大于'
      };
      setSteps(prev => [...prev, stepInfo]);

      await new Promise(resolve => setTimeout(resolve, animationSpeed));

      if (array[m] === target) {
        setFound(true);
        setIsAnimating(false);
        return;
      } else if (array[m] < target) {
        l = m + 1;
      } else {
        h = m - 1;
      }
    }

    setFound(false);
    setIsAnimating(false);
  };

  const resetSearch = () => {
    setIsAnimating(false);
    setLow(0);
    setHigh(array.length - 1);
    setMid(-1);
    setFound(false);
    setCurrentIndex(-1);
    setSteps([]);
  };

  const getBarColor = (index) => {
    if (index === currentIndex) return '#ff9800'; // 当前检查位置
    if (index < low || index > high) return '#9e9e9e'; // 已排除区域
    if (index === mid) return '#2196f3'; // 中间位置
    return '#4caf50'; // 仍在搜索范围内的元素
  };

  const updateArray = (newArray) => {
    // 确保数组是排序的
    const sortedArray = newArray.slice().sort((a, b) => a - b);
    setArray(sortedArray);
    resetSearch();
  };

  const addRandomNumber = () => {
    const newNum = Math.floor(Math.random() * 20) + 1;
    updateArray([...array, newNum]);
  };

  const removeLastNumber = () => {
    if (array.length > 1) {
      updateArray(array.slice(0, -1));
    }
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2' }}>二分查找算法可视化</h1>
      
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
            <label style={{ marginRight: 8 }}>查找目标:</label>
            <input 
              type="number" 
              value={target} 
              onChange={e => {
                setTarget(Number(e.target.value));
                resetSearch();
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
            onClick={binarySearch} 
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
            {isAnimating ? '查找中...' : '开始查找'}
          </button>
          
          <button 
            onClick={resetSearch} 
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
          
          <button 
            onClick={addRandomNumber} 
            disabled={isAnimating}
            style={{ 
              padding: '8px 16px', 
              background: '#4caf50', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4,
              cursor: isAnimating ? 'not-allowed' : 'pointer'
            }}
          >
            添加数字
          </button>
          
          <button 
            onClick={removeLastNumber} 
            disabled={isAnimating || array.length <= 1}
            style={{ 
              padding: '8px 16px', 
              background: '#e91e63', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4,
              cursor: (isAnimating || array.length <= 1) ? 'not-allowed' : 'pointer'
            }}
          >
            删除最后
          </button>
        </div>

        {/* 数组可视化 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: 4, 
          height: 300, 
          padding: 20,
          border: '2px solid #1976d2',
          borderRadius: 8,
          background: 'white',
          width: '100%',
          justifyContent: 'center'
        }}>
          {array.map((value, index) => (
            <div
              key={index}
              style={{
                width: Math.max(40, 800 / array.length - 4),
                height: 60,
                backgroundColor: getBarColor(index),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                border: index === currentIndex ? '3px solid #333' : '1px solid #fff'
              }}
            >
              {value}
            </div>
          ))}
        </div>

        {/* 索引标签 */}
        <div style={{ 
          display: 'flex', 
          gap: 4, 
          width: '100%',
          justifyContent: 'center'
        }}>
          {array.map((_, index) => (
            <div
              key={index}
              style={{
                width: Math.max(40, 800 / array.length - 4),
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {index}
            </div>
          ))}
        </div>

        {/* 查找状态指示 */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
          maxWidth: '600px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px'
        }}>
          <div>
            <strong>Low:</strong> {low}
          </div>
          <div>
            <strong>High:</strong> {high}
          </div>
          <div>
            <strong>Mid:</strong> {mid >= 0 ? mid : 'N/A'}
          </div>
          <div>
            <strong>状态:</strong> {found ? '找到' : isAnimating ? '查找中' : '未开始'}
          </div>
        </div>

        {/* 步骤记录 */}
        {steps.length > 0 && (
          <div style={{ 
            width: '100%',
            maxWidth: '800px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <h3>查找步骤:</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#e0e0e0' }}>步骤</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#e0e0e0' }}>Low</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#e0e0e0' }}>High</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#e0e0e0' }}>Mid</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#e0e0e0' }}>值</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#e0e0e0' }}>比较</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{step.step}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{step.low}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{step.high}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{step.mid}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{step.value}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        {step.value} {step.comparison} {target}
                      </td>
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
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>二分查找算法说明</h3>
          <div style={{ color: '#666' }}>
            <p><strong>时间复杂度:</strong> O(log n)</p>
            <p><strong>空间复杂度:</strong> O(1)</p>
            <p><strong>算法原理:</strong> 在有序数组中查找特定元素，通过每次比较中间元素与目标值，来确定目标值在左半部分还是右半部分，从而将搜索范围缩小一半。</p>
            <p><strong>适用条件:</strong> 数组必须是有序的</p>
            <p><strong>颜色说明:</strong></p>
            <ul>
              <li>🟢 绿色 = 当前搜索范围</li>
              <li>🔵 蓝色 = 当前中间位置</li>
              <li>🟠 橙色 = 当前正在检查的位置</li>
              <li>⚪ 灰色 = 已排除的范围</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BinarySearch;