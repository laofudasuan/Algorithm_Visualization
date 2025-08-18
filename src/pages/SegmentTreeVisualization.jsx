import { useState, useEffect } from 'react';

function SegmentTreeVisualization() {
  // 原始数组和线段树状态
  const [originalArray, setOriginalArray] = useState([1, 3, 5, 7, 9, 11]);
  const [segmentTree, setSegmentTree] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [currentNode, setCurrentNode] = useState(-1);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [operationType, setOperationType] = useState('sum'); // 'sum', 'min', 'max'
  
  // 操作参数
  const [queryLeft, setQueryLeft] = useState(0);
  const [queryRight, setQueryRight] = useState(2);
  const [updateIndex, setUpdateIndex] = useState(0);
  const [updateValue, setUpdateValue] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  
  // 初始化线段树
  useEffect(() => {
    buildSegmentTree();
  }, [originalArray, operationType]);

  // 构建线段树
  const buildSegmentTree = async (animate = false) => {
    if (animate) setIsAnimating(true);
    
    const n = originalArray.length;
    const tree = new Array(4 * n).fill(null);
    
    // 递归构建线段树
    const build = async (node, start, end) => {
      if (animate) {
        setCurrentNode(node);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
      }
      
      if (start === end) {
        // 叶子节点
        tree[node] = originalArray[start];
      } else {
        const mid = Math.floor((start + end) / 2);
        await build(2 * node, start, mid);
        await build(2 * node + 1, mid + 1, end);
        
        // 根据操作类型计算内部节点的值
        const leftChild = tree[2 * node];
        const rightChild = tree[2 * node + 1];
        
        switch (operationType) {
          case 'sum':
            tree[node] = leftChild + rightChild;
            break;
          case 'min':
            tree[node] = Math.min(leftChild, rightChild);
            break;
          case 'max':
            tree[node] = Math.max(leftChild, rightChild);
            break;
          default:
            tree[node] = leftChild + rightChild;
        }
      }
      
      setSegmentTree([...tree]);
      if (animate) {
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
      }
    };
    
    await build(1, 0, n - 1);
    
    if (animate) {
      setCurrentNode(-1);
      setIsAnimating(false);
    }
  };

  // 区间查询
  const queryRange = async (left, right) => {
    setIsAnimating(true);
    setQueryResult(null);
    setHighlightedNodes([]);
    
    const n = originalArray.length;
    const visitedNodes = [];
    
    const query = async (node, start, end, l, r) => {
      setCurrentNode(node);
      visitedNodes.push(node);
      setHighlightedNodes([...visitedNodes]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      // 完全不相交
      if (r < start || end < l) {
        return getIdentityValue();
      }
      
      // 完全包含
      if (l <= start && end <= r) {
        return segmentTree[node];
      }
      
      // 部分相交
      const mid = Math.floor((start + end) / 2);
      const leftResult = await query(2 * node, start, mid, l, r);
      const rightResult = await query(2 * node + 1, mid + 1, end, l, r);
      
      return combineResults(leftResult, rightResult);
    };
    
    const result = await query(1, 0, n - 1, left, right);
    setQueryResult(result);
    setCurrentNode(-1);
    setIsAnimating(false);
  };

  // 单点更新
  const updatePoint = async (index, value) => {
    setIsAnimating(true);
    setHighlightedNodes([]);
    
    const n = originalArray.length;
    const newArray = [...originalArray];
    newArray[index] = parseInt(value);
    setOriginalArray(newArray);
    
    const visitedNodes = [];
    
    const update = async (node, start, end, idx, val) => {
      setCurrentNode(node);
      visitedNodes.push(node);
      setHighlightedNodes([...visitedNodes]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      if (start === end) {
        // 叶子节点
        segmentTree[node] = val;
      } else {
        const mid = Math.floor((start + end) / 2);
        if (idx <= mid) {
          await update(2 * node, start, mid, idx, val);
        } else {
          await update(2 * node + 1, mid + 1, end, idx, val);
        }
        
        // 更新内部节点
        const leftChild = segmentTree[2 * node];
        const rightChild = segmentTree[2 * node + 1];
        segmentTree[node] = combineResults(leftChild, rightChild);
      }
      
      setSegmentTree([...segmentTree]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    };
    
    await update(1, 0, n - 1, index, parseInt(value));
    setCurrentNode(-1);
    setIsAnimating(false);
    setUpdateValue('');
  };

  // 获取单位元
  const getIdentityValue = () => {
    switch (operationType) {
      case 'sum': return 0;
      case 'min': return Infinity;
      case 'max': return -Infinity;
      default: return 0;
    }
  };

  // 合并结果
  const combineResults = (left, right) => {
    if (left === getIdentityValue()) return right;
    if (right === getIdentityValue()) return left;
    
    switch (operationType) {
      case 'sum': return left + right;
      case 'min': return Math.min(left, right);
      case 'max': return Math.max(left, right);
      default: return left + right;
    }
  };

  // 获取节点在可视化中的位置
  const getNodePosition = (index, maxNodes) => {
    if (index === 0 || segmentTree[index] === null) return { x: 0, y: 0, visible: false };
    
    const level = Math.floor(Math.log2(index));
    const positionInLevel = index - Math.pow(2, level);
    const maxNodesInLevel = Math.pow(2, level);
    
    const containerWidth = 1000;
    const containerHeight = 400;
    const levelHeight = containerHeight / (Math.floor(Math.log2(maxNodes)) + 2);
    
    const x = (containerWidth / (maxNodesInLevel + 1)) * (positionInLevel + 1);
    const y = levelHeight * (level + 1);
    
    return { x, y, visible: true };
  };

  // 获取节点范围信息
  const getNodeRange = (index, n) => {
    const getRangeRecursive = (node, start, end) => {
      if (node === index) return { start, end };
      if (node > index) return null;
      
      const mid = Math.floor((start + end) / 2);
      const leftResult = getRangeRecursive(2 * node, start, mid);
      if (leftResult) return leftResult;
      
      return getRangeRecursive(2 * node + 1, mid + 1, end);
    };
    
    return getRangeRecursive(1, 0, n - 1);
  };

  // 获取节点颜色
  const getNodeColor = (index) => {
    if (currentNode === index) return '#ff9800'; // 橙色 - 当前访问
    if (highlightedNodes.includes(index)) return '#2196f3'; // 蓝色 - 查询路径
    const range = getNodeRange(index, originalArray.length);
    if (range && range.start === range.end) return '#4caf50'; // 绿色 - 叶子节点
    return '#9c27b0'; // 紫色 - 内部节点
  };

  // 重置为默认数组
  const resetArray = () => {
    if (!isAnimating) {
      setOriginalArray([1, 3, 5, 7, 9, 11]);
      setQueryResult(null);
      setHighlightedNodes([]);
      setCurrentNode(-1);
    }
  };

  // 随机生成数组
  const generateRandomArray = () => {
    if (!isAnimating) {
      const size = Math.floor(Math.random() * 5) + 4; // 4-8个元素
      const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 20) + 1);
      setOriginalArray(newArray);
      setQueryResult(null);
      setHighlightedNodes([]);
      setCurrentNode(-1);
    }
  };

  return (
    <div style={{ height: '100vh', padding: '20px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ margin: 0, color: '#1976d2' }}>线段树可视化</h1>
        
        <div style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
          当前操作类型: <strong style={{ color: '#1976d2' }}>
            {operationType === 'sum' ? '区间求和' : operationType === 'min' ? '区间最小值' : '区间最大值'}
          </strong>
          {queryResult !== null && (
            <>
              <span style={{ margin: '0 20px' }}>|</span>
              查询结果: <strong style={{ color: '#f44336' }}>{queryResult}</strong>
            </>
          )}
        </div>

        {/* 原始数组显示 */}
        <div style={{ width: '100%' }}>
          <h3 style={{ color: '#1976d2', textAlign: 'center', marginBottom: '15px' }}>原始数组</h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: '8px', 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {originalArray.map((value, index) => (
              <div
                key={index}
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  border: '2px solid #1976d2'
                }}
              >
                <div style={{ fontSize: '18px' }}>{value}</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>[{index}]</div>
              </div>
            ))}
          </div>
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
          width: '100%'
        }}>
          {/* 操作类型和动画速度 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label>操作类型:</label>
              <select 
                value={operationType} 
                onChange={(e) => {
                  if (!isAnimating) {
                    setOperationType(e.target.value);
                    setQueryResult(null);
                    setHighlightedNodes([]);
                  }
                }}
                disabled={isAnimating}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="sum">区间求和</option>
                <option value="min">区间最小值</option>
                <option value="max">区间最大值</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
          </div>

          {/* 操作控件 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 16,
            alignItems: 'start'
          }}>
            {/* 构建线段树 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: 'white' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>构建线段树</h4>
              <button 
                onClick={() => buildSegmentTree(true)}
                disabled={isAnimating}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: isAnimating ? '#ccc' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isAnimating ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                重新构建
              </button>
            </div>

            {/* 区间查询 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: 'white' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>区间查询</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="number" 
                    placeholder="左边界" 
                    value={queryLeft} 
                    onChange={(e) => setQueryLeft(Math.max(0, Math.min(originalArray.length - 1, parseInt(e.target.value) || 0)))}
                    disabled={isAnimating}
                    style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <input 
                    type="number" 
                    placeholder="右边界" 
                    value={queryRight} 
                    onChange={(e) => setQueryRight(Math.max(0, Math.min(originalArray.length - 1, parseInt(e.target.value) || 0)))}
                    disabled={isAnimating}
                    style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <button 
                  onClick={() => queryRange(queryLeft, queryRight)}
                  disabled={isAnimating}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isAnimating ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  查询区间
                </button>
              </div>
            </div>

            {/* 单点更新 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: 'white' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>单点更新</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="number" 
                    placeholder="索引" 
                    value={updateIndex} 
                    onChange={(e) => setUpdateIndex(Math.max(0, Math.min(originalArray.length - 1, parseInt(e.target.value) || 0)))}
                    disabled={isAnimating}
                    style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <input 
                    type="number" 
                    placeholder="新值" 
                    value={updateValue} 
                    onChange={(e) => setUpdateValue(e.target.value)}
                    disabled={isAnimating}
                    style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <button 
                  onClick={() => updatePoint(updateIndex, updateValue)}
                  disabled={isAnimating || !updateValue}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isAnimating || !updateValue ? '#ccc' : '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating || !updateValue ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  更新元素
                </button>
              </div>
            </div>

            {/* 数组操作 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: 'white' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>数组操作</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button 
                  onClick={generateRandomArray}
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
                <button 
                  onClick={resetArray}
                  disabled={isAnimating}
                  style={{
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
                  重置数组
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 线段树可视化区域 */}
        <div style={{ 
          width: '100%',
          height: '500px',
          border: '2px solid #1976d2',
          borderRadius: '12px',
          backgroundColor: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {segmentTree.length === 0 || segmentTree.every(val => val === null) ? (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontSize: '18px',
              color: '#666',
              fontWeight: 'bold'
            }}>
              点击"重新构建"来创建线段树
            </div>
          ) : (
            <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
              {/* 绘制连接线 */}
              {segmentTree.map((_, index) => {
                if (index === 0 || segmentTree[index] === null) return null;
                
                const leftChild = 2 * index;
                const rightChild = 2 * index + 1;
                const lines = [];
                
                if (leftChild < segmentTree.length && segmentTree[leftChild] !== null) {
                  const parentPos = getNodePosition(index, segmentTree.length);
                  const childPos = getNodePosition(leftChild, segmentTree.length);
                  if (parentPos.visible && childPos.visible) {
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
                }
                
                if (rightChild < segmentTree.length && segmentTree[rightChild] !== null) {
                  const parentPos = getNodePosition(index, segmentTree.length);
                  const childPos = getNodePosition(rightChild, segmentTree.length);
                  if (parentPos.visible && childPos.visible) {
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
                }
                
                return lines;
              })}
              
              {/* 绘制节点 */}
              {segmentTree.map((value, index) => {
                if (index === 0 || value === null) return null;
                
                const position = getNodePosition(index, segmentTree.length);
                if (!position.visible) return null;
                
                const nodeColor = getNodeColor(index);
                const range = getNodeRange(index, originalArray.length);
                
                return (
                  <g key={index}>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="30"
                      fill={nodeColor}
                      stroke="#333"
                      strokeWidth="2"
                      style={{
                        transition: 'all 0.3s ease',
                        filter: currentNode === index || highlightedNodes.includes(index) ? 
                               'drop-shadow(0 0 10px rgba(0,0,0,0.5))' : 'none'
                      }}
                    />
                    <text
                      x={position.x}
                      y={position.y + 5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      {value}
                    </text>
                    {range && (
                      <text
                        x={position.x}
                        y={position.y - 45}
                        textAnchor="middle"
                        fill="#666"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        [{range.start},{range.end}]
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* 算法说明 */}
        <div style={{ 
          maxWidth: '1000px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          width: '100%'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>线段树说明</h3>
          <div style={{ color: '#666' }}>
            <p><strong>线段树</strong>是一种二叉树数据结构，用于存储区间信息，支持高效的区间查询和单点更新操作。</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div>
                <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>基本性质</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>完全二叉树:</strong> 每个内部节点都有两个子节点</li>
                  <li><strong>叶子节点:</strong> 存储原数组的单个元素</li>
                  <li><strong>内部节点:</strong> 存储子区间的合并结果</li>
                  <li><strong>根节点:</strong> 存储整个数组的合并结果</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>操作复杂度</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>构建:</strong> O(n) - 一次性构建整个树</li>
                  <li><strong>区间查询:</strong> O(log n) - 查询任意区间</li>
                  <li><strong>单点更新:</strong> O(log n) - 更新单个元素</li>
                  <li><strong>空间复杂度:</strong> O(4n) - 数组实现</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>支持的操作</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>区间求和:</strong> 计算区间内所有元素的和</li>
                  <li><strong>区间最小值:</strong> 找出区间内的最小元素</li>
                  <li><strong>区间最大值:</strong> 找出区间内的最大元素</li>
                  <li><strong>可扩展:</strong> 支持其他可合并的操作</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>颜色说明</h4>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><span style={{color: '#4caf50'}}>🟢 绿色:</span> 叶子节点（原数组元素）</li>
                  <li><span style={{color: '#9c27b0'}}>🟣 紫色:</span> 内部节点（合并结果）</li>
                  <li><span style={{color: '#ff9800'}}>🟠 橙色:</span> 当前访问的节点</li>
                  <li><span style={{color: '#2196f3'}}>🔵 蓝色:</span> 查询路径上的节点</li>
                </ul>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
              <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>应用场景</h4>
              <p>线段树广泛应用于需要频繁进行区间查询的场景，如：</p>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                <li>数据库中的范围查询优化</li>
                <li>计算几何中的区间相关问题</li>
                <li>在线算法竞赛中的区间DP问题</li>
                <li>实时数据分析中的滑动窗口统计</li>
              </ul>
            </div>
            
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
              <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>使用提示</h4>
              <p>节点上方的 [start,end] 表示该节点负责的区间范围。叶子节点的区间长度为1，根节点覆盖整个数组。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SegmentTreeVisualization;
