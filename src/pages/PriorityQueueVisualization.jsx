import { useState, useEffect } from 'react';

function PriorityQueueVisualization() {
  // 优先队列状态 (使用最大堆实现)
  const [heap, setHeap] = useState([50, 30, 40, 10, 20, 15, 35]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [compareIndices, setCompareIndices] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  // 操作参数
  const [newValue, setNewValue] = useState('');
  const [heapType, setHeapType] = useState('max'); // 'max' 或 'min'
  
  // 堆操作辅助函数
  const getParentIndex = (index) => Math.floor((index - 1) / 2);
  const getLeftChildIndex = (index) => 2 * index + 1;
  const getRightChildIndex = (index) => 2 * index + 2;
  
  // 获取节点在可视化中的位置
  const getNodePosition = (index, totalNodes) => {
    const level = Math.floor(Math.log2(index + 1));
    const positionInLevel = index - (Math.pow(2, level) - 1);
    const maxNodesInLevel = Math.pow(2, level);
    
    const containerWidth = 800;
    const containerHeight = 400;
    const levelHeight = containerHeight / (Math.floor(Math.log2(totalNodes)) + 2);
    
    const x = (containerWidth / (maxNodesInLevel + 1)) * (positionInLevel + 1);
    const y = levelHeight * (level + 1);
    
    return { x, y };
  };
  
  // 交换堆中两个元素
  const swapElements = async (arr, i, j) => {
    setCompareIndices([i, j]);
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setHeap([...arr]);
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    setCompareIndices([]);
  };
  
  // 向上调整 (用于插入)
  const heapifyUp = async (arr, index) => {
    while (index > 0) {
      const parentIndex = getParentIndex(index);
      setCurrentIndex(index);
      setCompareIndices([index, parentIndex]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      const shouldSwap = heapType === 'max' 
        ? arr[index] > arr[parentIndex]
        : arr[index] < arr[parentIndex];
        
      if (shouldSwap) {
        await swapElements(arr, index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
    
    setCurrentIndex(-1);
    setCompareIndices([]);
  };
  
  // 向下调整 (用于删除)
  const heapifyDown = async (arr, index) => {
    const size = arr.length;
    
    while (true) {
      let targetIndex = index;
      const leftChild = getLeftChildIndex(index);
      const rightChild = getRightChildIndex(index);
      
      setCurrentIndex(index);
      const compareList = [index];
      
      // 检查左子节点
      if (leftChild < size) {
        compareList.push(leftChild);
        const shouldUpdate = heapType === 'max'
          ? arr[leftChild] > arr[targetIndex]
          : arr[leftChild] < arr[targetIndex];
        if (shouldUpdate) {
          targetIndex = leftChild;
        }
      }
      
      // 检查右子节点
      if (rightChild < size) {
        compareList.push(rightChild);
        const shouldUpdate = heapType === 'max'
          ? arr[rightChild] > arr[targetIndex]
          : arr[rightChild] < arr[targetIndex];
        if (shouldUpdate) {
          targetIndex = rightChild;
        }
      }
      
      setCompareIndices(compareList);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      if (targetIndex !== index) {
        await swapElements(arr, index, targetIndex);
        index = targetIndex;
      } else {
        break;
      }
    }
    
    setCurrentIndex(-1);
    setCompareIndices([]);
  };
  
  // 插入元素
  const insertElement = async (value) => {
    if (!value || value.trim() === '') return;
    
    setIsAnimating(true);
    const newHeap = [...heap];
    const numValue = parseInt(value);
    
    // 添加新元素到末尾
    newHeap.push(numValue);
    setHeap([...newHeap]);
    setHighlightedIndex(newHeap.length - 1);
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    // 向上调整
    await heapifyUp(newHeap, newHeap.length - 1);
    
    setHighlightedIndex(-1);
    setIsAnimating(false);
    setNewValue('');
  };
  
  // 删除堆顶元素
  const extractTop = async () => {
    if (heap.length === 0) return;
    
    setIsAnimating(true);
    const newHeap = [...heap];
    
    if (newHeap.length === 1) {
      setHeap([]);
      setIsAnimating(false);
      return;
    }
    
    // 标记要删除的元素
    setHighlightedIndex(0);
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    // 将最后一个元素移到堆顶
    newHeap[0] = newHeap[newHeap.length - 1];
    newHeap.pop();
    setHeap([...newHeap]);
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    // 向下调整
    if (newHeap.length > 0) {
      await heapifyDown(newHeap, 0);
    }
    
    setHighlightedIndex(-1);
    setIsAnimating(false);
  };
  
  // 构建堆
  const buildHeap = async (arr) => {
    setIsAnimating(true);
    const newHeap = [...arr];
    
    // 从最后一个非叶子节点开始，向上进行堆化
    for (let i = Math.floor(newHeap.length / 2) - 1; i >= 0; i--) {
      await heapifyDown(newHeap, i);
    }
    
    setIsAnimating(false);
  };
  
  // 切换堆类型
  const toggleHeapType = () => {
    if (!isAnimating) {
      const newType = heapType === 'max' ? 'min' : 'max';
      setHeapType(newType);
      buildHeap(heap);
    }
  };
  
  // 重置堆
  const resetHeap = () => {
    if (!isAnimating) {
      setHeap([50, 30, 40, 10, 20, 15, 35]);
      setCurrentIndex(-1);
      setCompareIndices([]);
      setHighlightedIndex(-1);
    }
  };
  
  // 清空堆
  const clearHeap = () => {
    if (!isAnimating) {
      setHeap([]);
      setCurrentIndex(-1);
      setCompareIndices([]);
      setHighlightedIndex(-1);
    }
  };
  
  // 随机生成堆
  const generateRandomHeap = () => {
    if (!isAnimating) {
      const size = Math.floor(Math.random() * 8) + 5; // 5-12个元素
      const newHeap = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
      setHeap(newHeap);
      buildHeap(newHeap);
    }
  };
  
  // 获取节点颜色
  const getNodeColor = (index) => {
    if (highlightedIndex === index) return '#f44336'; // 红色 - 即将删除
    if (currentIndex === index) return '#ff9800'; // 橙色 - 当前操作
    if (compareIndices.includes(index)) return '#2196f3'; // 蓝色 - 比较中
    return '#4caf50'; // 绿色 - 默认
  };
  
  // 获取节点文字颜色
  const getTextColor = (index) => {
    return 'white';
  };
  
  return (
    <div style={{ height: '100vh', padding: '20px', overflowY: 'auto', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: '100%', margin: '0 auto', width: '100%' }}>
        <h1 style={{ margin: 0, color: '#1976d2' }}>优先队列可视化</h1>
        <div style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
          当前堆类型: <strong style={{ color: '#1976d2' }}>{heapType === 'max' ? '最大堆' : '最小堆'}</strong>
          {heap.length > 0 && (
            <>
              <span style={{ margin: '0 20px' }}>|</span>
              堆顶元素: <strong style={{ color: '#f44336' }}>{heap[0]}</strong>
            </>
          )}
        </div>

        {/* 控制面板 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 16, 
          padding: 20, 
          border: '1px solid #ddd', 
          borderRadius: 8, 
          backgroundColor: '#f9f9f9',
          width: '100%',
          maxWidth: '100%'
        }}>
          {/* 动画速度控制 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
            <label>动画速度:</label>
            <select 
              value={animationSpeed} 
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              disabled={isAnimating}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value={1200}>慢</option>
              <option value={800}>中等</option>
              <option value={400}>快</option>
            </select>
          </div>

          {/* 操作控件 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 16,
            alignItems: 'start'
          }}>
            {/* 插入元素 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: 'white' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>插入元素</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input 
                  type="number" 
                  placeholder="元素值" 
                  value={newValue} 
                  onChange={(e) => setNewValue(e.target.value)}
                  disabled={isAnimating}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                  onClick={() => insertElement(newValue)}
                  disabled={isAnimating || !newValue}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isAnimating || !newValue ? '#ccc' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating || !newValue ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  插入元素
                </button>
              </div>
            </div>

            {/* 删除堆顶 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: 'white' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>删除堆顶</h4>
              <button 
                onClick={extractTop}
                disabled={isAnimating || heap.length === 0}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: isAnimating || heap.length === 0 ? '#ccc' : '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isAnimating || heap.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                删除 {heapType === 'max' ? '最大' : '最小'} 元素
              </button>
            </div>

            {/* 堆操作 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: 'white' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>堆操作</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button 
                  onClick={toggleHeapType}
                  disabled={isAnimating}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: isAnimating ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  切换为{heapType === 'max' ? '最小堆' : '最大堆'}
                </button>
                <button 
                  onClick={generateRandomHeap}
                  disabled={isAnimating}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: isAnimating ? '#ccc' : '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  随机生成
                </button>
              </div>
            </div>

            {/* 重置和清空 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: 'white' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>重置操作</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={resetHeap}
                  disabled={isAnimating}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    backgroundColor: isAnimating ? '#ccc' : '#607d8b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  重置
                </button>
                <button 
                  onClick={clearHeap}
                  disabled={isAnimating}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    backgroundColor: isAnimating ? '#ccc' : '#795548',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  清空
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 优先队列可视化区域 */}
        <div style={{ 
          width: '100%',
          height: '500px',
          border: '2px solid #1976d2',
          borderRadius: '12px',
          backgroundColor: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {heap.length === 0 ? (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontSize: '18px',
              color: '#666',
              fontWeight: 'bold'
            }}>
              优先队列为空
            </div>
          ) : (
            <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
              {/* 绘制连接线 */}
              {heap.map((_, index) => {
                const leftChild = getLeftChildIndex(index);
                const rightChild = getRightChildIndex(index);
                const lines = [];
                
                if (leftChild < heap.length) {
                  const parentPos = getNodePosition(index, heap.length);
                  const childPos = getNodePosition(leftChild, heap.length);
                  lines.push(
                    <line
                      key={`line-${index}-${leftChild}`}
                      x1={parentPos.x}
                      y1={parentPos.y}
                      x2={childPos.x}
                      y2={childPos.y}
                      stroke="#1976d2"
                      strokeWidth="2"
                    />
                  );
                }
                
                if (rightChild < heap.length) {
                  const parentPos = getNodePosition(index, heap.length);
                  const childPos = getNodePosition(rightChild, heap.length);
                  lines.push(
                    <line
                      key={`line-${index}-${rightChild}`}
                      x1={parentPos.x}
                      y1={parentPos.y}
                      x2={childPos.x}
                      y2={childPos.y}
                      stroke="#1976d2"
                      strokeWidth="2"
                    />
                  );
                }
                
                return lines;
              })}
              
              {/* 绘制节点 */}
              {heap.map((value, index) => {
                const position = getNodePosition(index, heap.length);
                const nodeColor = getNodeColor(index);
                const textColor = getTextColor(index);
                
                return (
                  <g key={index}>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="25"
                      fill={nodeColor}
                      stroke="#333"
                      strokeWidth="2"
                      style={{
                        transition: 'all 0.3s ease',
                        filter: currentIndex === index || compareIndices.includes(index) ? 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' : 'none'
                      }}
                    />
                    <text
                      x={position.x}
                      y={position.y + 5}
                      textAnchor="middle"
                      fill={textColor}
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {value}
                    </text>
                    <text
                      x={position.x}
                      y={position.y - 35}
                      textAnchor="middle"
                      fill="#666"
                      fontSize="10"
                    >
                      {index}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* 堆数组表示 */}
        {heap.length > 0 && (
          <div style={{ width: '100%' }}>
            <h3 style={{ color: '#1976d2', textAlign: 'center', marginBottom: '15px' }}>数组表示</h3>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px', 
              justifyContent: 'center',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              {heap.map((value, index) => (
                <div
                  key={index}
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: getNodeColor(index),
                    color: getTextColor(index),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    border: '2px solid #333',
                    transform: currentIndex === index || compareIndices.includes(index) ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  <div style={{ fontSize: '16px' }}>{value}</div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>[{index}]</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 算法说明 */}
        <div style={{ 
          maxWidth: '1000px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          width: '100%'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>优先队列（堆）说明</h3>
          <div style={{ color: '#666' }}>
            <p><strong>优先队列</strong>是一种抽象数据类型，通常用堆来实现。堆是一种完全二叉树，满足堆性质。</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div>
                <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>堆性质</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>最大堆:</strong> 父节点 ≥ 子节点</li>
                  <li><strong>最小堆:</strong> 父节点 ≤ 子节点</li>
                  <li><strong>完全二叉树:</strong> 除最后一层外都填满</li>
                  <li><strong>数组存储:</strong> 索引关系简单</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>基本操作</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>插入:</strong> 添加到末尾后向上调整 - O(log n)</li>
                  <li><strong>删除堆顶:</strong> 移除根节点后向下调整 - O(log n)</li>
                  <li><strong>查看堆顶:</strong> 获取最大/最小值 - O(1)</li>
                  <li><strong>构建堆:</strong> 从数组构建堆 - O(n)</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>索引关系</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>父节点:</strong> (i-1)/2</li>
                  <li><strong>左子节点:</strong> 2*i+1</li>
                  <li><strong>右子节点:</strong> 2*i+2</li>
                  <li><strong>根节点:</strong> 索引为0</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>颜色说明</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><span style={{color: '#4caf50'}}>🟢 绿色:</span> 普通节点</li>
                  <li><span style={{color: '#ff9800'}}>🟠 橙色:</span> 当前操作节点</li>
                  <li><span style={{color: '#2196f3'}}>🔵 蓝色:</span> 比较中的节点</li>
                  <li><span style={{color: '#f44336'}}>🔴 红色:</span> 即将删除的节点</li>
                </ul>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
              <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>应用场景</h4>
              <p>优先队列广泛应用于任务调度、Dijkstra算法、A*寻路算法、霍夫曼编码、堆排序等场景中。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriorityQueueVisualization;
