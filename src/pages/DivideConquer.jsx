import { useState } from 'react';

function DivideConquer() {
  const [array, setArray] = useState([3, 3, 4, 5, 1, 2, 6, 8, 7, 9]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [currentStep, setCurrentStep] = useState(-1);
  const [merging, setMerging] = useState([]);
  const [comparing, setComparing] = useState([]);
  const [sortedArray, setSortedArray] = useState([]);

  // 归并排序实现
  const mergeSort = async () => {
    setIsAnimating(true);
    setCurrentStep(0);
    setMerging([]);
    setComparing([]);
    const arr = [...array];
    const result = await mergeSortHelper(arr, 0, arr.length - 1);
    setSortedArray(result);
    setIsAnimating(false);
  };

  const mergeSortHelper = async (arr, left, right) => {
    if (left >= right) {
      return [arr[left]];
    }

    const mid = Math.floor((left + right) / 2);
    
    // 递归排序左半部分
    const leftArr = await mergeSortHelper(arr, left, mid);
    
    // 递归排序右半部分
    const rightArr = await mergeSortHelper(arr, mid + 1, right);
    
    // 合并两个有序数组
    const merged = await merge(leftArr, rightArr, left, mid, right);
    return merged;
  };

  const merge = async (leftArr, rightArr, leftStart, mid, rightEnd) => {
    const result = [];
    let i = 0, j = 0;
    
    setMerging([leftStart, rightEnd]);
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    while (i < leftArr.length && j < rightArr.length) {
      setComparing([leftStart + i, mid + 1 + j]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      if (leftArr[i] <= rightArr[j]) {
        result.push(leftArr[i]);
        i++;
      } else {
        result.push(rightArr[j]);
        j++;
      }
    }
    
    // 添加剩余元素
    while (i < leftArr.length) {
      result.push(leftArr[i]);
      i++;
    }
    
    while (j < rightArr.length) {
      result.push(rightArr[j]);
      j++;
    }
    
    setComparing([]);
    return result;
  };

  const reset = () => {
    setIsAnimating(false);
    setCurrentStep(-1);
    setMerging([]);
    setComparing([]);
    setSortedArray([]);
  };

  const shuffleArray = () => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    setArray(newArray);
    reset();
  };

  const addRandomNumber = () => {
    const newNum = Math.floor(Math.random() * 20) + 1;
    setArray([...array, newNum]);
    reset();
  };

  const removeLastNumber = () => {
    if (array.length > 1) {
      setArray(array.slice(0, -1));
      reset();
    }
  };

  const getBarColor = (index) => {
    if (merging.length > 0 && index >= merging[0] && index <= merging[1]) {
      return '#2196f3'; // 正在合并的范围
    }
    if (comparing.includes(index)) {
      return '#ff9800'; // 正在比较的元素
    }
    return '#4caf50'; // 默认颜色
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2' }}>分治算法可视化</h1>
      
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
            onClick={mergeSort} 
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
            {isAnimating ? '排序中...' : '归并排序'}
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
                height: value * 20,
                backgroundColor: getBarColor(index),
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                paddingBottom: '4px',
                transition: 'all 0.3s ease',
                border: comparing.includes(index) ? '3px solid #333' : '1px solid #fff'
              }}
            >
              {value}
            </div>
          ))}
        </div>

        {/* 排序结果 */}
        {sortedArray.length > 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: 4, 
            height: 150, 
            padding: 20,
            border: '2px solid #4caf50',
            borderRadius: 8,
            background: '#e8f5e9',
            width: '100%',
            justifyContent: 'center'
          }}>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <h3>排序结果:</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                {sortedArray.map((value, index) => (
                  <div
                    key={index}
                    style={{
                      width: Math.max(30, 600 / sortedArray.length - 4),
                      height: value * 5,
                      backgroundColor: '#4caf50',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      paddingBottom: '2px'
                    }}
                  >
                    {value}
                  </div>
                ))}
              </div>
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
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>分治算法说明</h3>
          <div style={{ color: '#666' }}>
            <p><strong>典型算法:</strong> 归并排序、快速排序、二分查找等</p>
            <p><strong>基本思想:</strong> 将一个难以直接解决的大问题，分割成一些规模较小的相同问题，递归解决这些子问题，然后将子问题的解合并得到原问题的解。</p>
            <p><strong>三个步骤:</strong></p>
            <ol>
              <li><strong>分解(Divide):</strong> 将问题分解为若干个规模较小的相同子问题</li>
              <li><strong>解决(Conquer):</strong> 递归地解决各个子问题</li>
              <li><strong>合并(Combine):</strong> 将各个子问题的解合并为原问题的解</li>
            </ol>
            <p><strong>归并排序示例:</strong></p>
            <ul>
              <li>🔵 蓝色 = 当前正在合并的范围</li>
              <li>🟠 橙色 = 正在比较的元素</li>
              <li>🟢 绿色 = 默认状态</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DivideConquer;