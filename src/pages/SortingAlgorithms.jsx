import { useState } from 'react';

function SortingAlgorithms() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubble-sort');
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);

  // 冒泡排序动画
  const bubbleSort = async () => {
    setIsAnimating(true);
    const arr = [...array];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setComparing([j, j + 1]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        
        if (arr[j] > arr[j + 1]) {
          setSwapping([j, j + 1]);
          await new Promise(resolve => setTimeout(resolve, animationSpeed));
          
          // 交换
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          await new Promise(resolve => setTimeout(resolve, animationSpeed));
          
          setSwapping([]);
        }
        setComparing([]);
      }
    }
    
    setIsAnimating(false);
    setCurrentStep(-1);
  };

  // 选择排序动画
  const selectionSort = async () => {
    setIsAnimating(true);
    const arr = [...array];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      setCurrentStep(i);
      
      for (let j = i + 1; j < n; j++) {
        setComparing([minIdx, j]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      
      if (minIdx !== i) {
        setSwapping([i, minIdx]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray([...arr]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        
        setSwapping([]);
      }
      setComparing([]);
    }
    
    setIsAnimating(false);
    setCurrentStep(-1);
  };

  // 插入排序动画
  const insertionSort = async () => {
    setIsAnimating(true);
    const arr = [...array];
    const n = arr.length;
    
    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;
      setCurrentStep(i);
      
      while (j >= 0 && arr[j] > key) {
        setComparing([j, j + 1]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        
        arr[j + 1] = arr[j];
        setArray([...arr]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        
        j = j - 1;
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setComparing([]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    
    setIsAnimating(false);
    setCurrentStep(-1);
  };

  const runAlgorithm = () => {
    switch (selectedAlgorithm) {
      case 'bubble-sort':
        bubbleSort();
        break;
      case 'selection-sort':
        selectionSort();
        break;
      case 'insertion-sort':
        insertionSort();
        break;
      default:
        break;
    }
  };

  const resetArray = () => {
    setArray([64, 34, 25, 12, 22, 11, 90]);
    setCurrentStep(-1);
    setComparing([]);
    setSwapping([]);
  };

  const shuffleArray = () => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    setArray(newArray);
    setCurrentStep(-1);
    setComparing([]);
    setSwapping([]);
  };

  const addNumber = () => {
    const newNum = Math.floor(Math.random() * 100) + 1;
    setArray([...array, newNum]);
  };

  const removeLastNumber = () => {
    if (array.length > 1) {
      setArray(array.slice(0, -1));
    }
  };

  const getBarColor = (index) => {
    if (swapping.includes(index)) return '#e91e63';
    if (comparing.includes(index)) return '#ff9800';
    if (currentStep >= 0 && index <= currentStep) return '#4caf50';
    return '#69b3a2';
  };

  return (
    <div style={{ height: '100vh', padding: '20px', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>
        <h1 style={{ margin: 0, color: '#1976d2' }}>排序算法可视化</h1>
        
        {/* 控制面板 */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 16, 
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '1200px'
        }}>
          <div>
            <label style={{ marginRight: 8 }}>选择算法:</label>
            <select 
              value={selectedAlgorithm} 
              onChange={e => setSelectedAlgorithm(e.target.value)}
              disabled={isAnimating}
              style={{ padding: 4 }}
            >
              <option value="bubble-sort">冒泡排序</option>
              <option value="selection-sort">选择排序</option>
              <option value="insertion-sort">插入排序</option>
            </select>
          </div>
          
          <div>
            <label style={{ marginRight: 8 }}>动画速度:</label>
            <input 
              type="range" 
              min="100" 
              max="1000" 
              value={animationSpeed}
              onChange={e => setAnimationSpeed(Number(e.target.value))}
              disabled={isAnimating}
              style={{ width: 100 }}
            />
            <span style={{ marginLeft: 8 }}>{animationSpeed}ms</span>
          </div>
          
          <button 
            onClick={runAlgorithm} 
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
            {isAnimating ? '排序中...' : '开始排序'}
          </button>
          
          <button 
            onClick={resetArray} 
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
            onClick={shuffleArray} 
            disabled={isAnimating}
            style={{ 
              padding: '8px 16px', 
              background: '#ff9800', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4,
              cursor: isAnimating ? 'not-allowed' : 'pointer'
            }}
          >
            随机打乱
          </button>
          
          <button 
            onClick={addNumber} 
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
          height: 400, 
          padding: 20,
          border: '2px solid #1976d2',
          borderRadius: 8,
          background: 'white'
        }}>
          {array.map((value, index) => (
            <div
              key={index}
              style={{
                width: Math.max(40, 600 / array.length - 4),
                height: value * 4,
                backgroundColor: getBarColor(index),
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                paddingBottom: '4px',
                transition: 'all 0.3s ease',
                border: comparing.includes(index) ? '3px solid #333' : 
                       swapping.includes(index) ? '3px solid #fff' : 'none'
              }}
            >
              {value}
            </div>
          ))}
        </div>

        {/* 算法说明 */}
        <div style={{ 
          maxWidth: 800, 
          padding: 20, 
          border: '1px solid #ddd', 
          borderRadius: 8, 
          background: '#f5f5f5' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>
            {selectedAlgorithm === 'bubble-sort' && '冒泡排序'}
            {selectedAlgorithm === 'selection-sort' && '选择排序'}
            {selectedAlgorithm === 'insertion-sort' && '插入排序'}
            算法说明
          </h3>
          <div style={{ color: '#666' }}>
            {selectedAlgorithm === 'bubble-sort' && (
              <div>
                <p><strong>时间复杂度:</strong> O(n²)</p>
                <p><strong>空间复杂度:</strong> O(1)</p>
                <p><strong>算法原理:</strong> 重复地遍历要排序的数列，比较相邻元素，如果它们的顺序错误就把它们交换过来。</p>
                <p><strong>颜色说明:</strong> 🔸橙色=正在比较 🔸粉色=正在交换 🔸蓝绿色=默认状态</p>
              </div>
            )}
            {selectedAlgorithm === 'selection-sort' && (
              <div>
                <p><strong>时间复杂度:</strong> O(n²)</p>
                <p><strong>空间复杂度:</strong> O(1)</p>
                <p><strong>算法原理:</strong> 在未排序序列中找到最小元素，存放到排序序列的起始位置。</p>
                <p><strong>颜色说明:</strong> 🔸绿色=已排序 🔸橙色=正在比较 🔸粉色=正在交换 🔸蓝绿色=未排序</p>
              </div>
            )}
            {selectedAlgorithm === 'insertion-sort' && (
              <div>
                <p><strong>时间复杂度:</strong> O(n²)</p>
                <p><strong>空间复杂度:</strong> O(1)</p>
                <p><strong>算法原理:</strong> 构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。</p>
                <p><strong>颜色说明:</strong> 🔸绿色=已排序 🔸橙色=正在比较 🔸蓝绿色=未排序</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortingAlgorithms;