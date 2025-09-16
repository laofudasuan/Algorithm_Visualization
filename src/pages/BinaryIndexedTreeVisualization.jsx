import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BinaryIndexedTreeVisualization = () => {
  const [array, setArray] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [bit, setBit] = useState([]);
  const [operation, setOperation] = useState('');
  const [index, setIndex] = useState('');
  const [value, setValue] = useState('');
  const [queryRange, setQueryRange] = useState({ left: '', right: '' });
  const [result, setResult] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSteps, setAnimationSteps] = useState([]);
  const [speed, setSpeed] = useState(1000);
  
  const svgRef = useRef();
  const intervalRef = useRef();

  // 初始化树状数组
  useEffect(() => {
    initializeBIT();
  }, [array]);

  const initializeBIT = () => {
    const n = array.length;
    const newBit = new Array(n + 1).fill(0);
    
    // 构建树状数组
    for (let i = 1; i < n; i++) {
      updateBIT(newBit, i, array[i]);
    }
    
    setBit(newBit);
    visualizeBIT(newBit);
  };

  // 更新树状数组
  const updateBIT = (bitArray, index, delta) => {
    const n = bitArray.length;
    while (index < n) {
      bitArray[index] += delta;
      index += index & (-index); // 加上lowbit
    }
  };

  // 查询前缀和
  const queryBIT = (bitArray, index) => {
    let sum = 0;
    while (index > 0) {
      sum += bitArray[index];
      index -= index & (-index); // 减去lowbit
    }
    return sum;
  };

  // 区间查询
  const rangeQuery = (bitArray, left, right) => {
    if (left === 1) {
      return queryBIT(bitArray, right);
    }
    return queryBIT(bitArray, right) - queryBIT(bitArray, left - 1);
  };

  // 获取lowbit
  const lowbit = (x) => x & (-x);

  // 执行操作
  const executeOperation = () => {
    const idx = parseInt(index);
    const val = parseInt(value);
    const left = parseInt(queryRange.left);
    const right = parseInt(queryRange.right);
    
    if (operation === 'update' && idx && val !== undefined) {
      const newArray = [...array];
      const oldValue = newArray[idx];
      newArray[idx] = val;
      setArray(newArray);
      
      const newBit = [...bit];
      updateBIT(newBit, idx, val - oldValue);
      setBit(newBit);
      
      setResult(`更新位置 ${idx} 的值为 ${val}`);
      
      // 生成动画步骤
      generateUpdateSteps(idx, val - oldValue);
    } else if (operation === 'query' && idx) {
      const sum = queryBIT(bit, idx);
      setResult(`前缀和 [1, ${idx}] = ${sum}`);
      
      // 生成查询动画步骤
      generateQuerySteps(idx);
    } else if (operation === 'rangeQuery' && left && right) {
      const sum = rangeQuery(bit, left, right);
      setResult(`区间和 [${left}, ${right}] = ${sum}`);
      
      // 生成区间查询动画步骤
      generateRangeQuerySteps(left, right);
    }
  };

  // 生成更新动画步骤
  const generateUpdateSteps = (index, delta) => {
    const steps = [];
    let current = index;
    
    while (current < bit.length) {
      steps.push({
        type: 'update',
        index: current,
        delta: delta,
        description: `更新 BIT[${current}]，加上 ${delta}`
      });
      current += lowbit(current);
    }
    
    setAnimationSteps(steps);
    setCurrentStep(0);
  };

  // 生成查询动画步骤
  const generateQuerySteps = (index) => {
    const steps = [];
    let current = index;
    let sum = 0;
    
    while (current > 0) {
      sum += bit[current];
      steps.push({
        type: 'query',
        index: current,
        value: bit[current],
        sum: sum,
        description: `读取 BIT[${current}] = ${bit[current]}，累计和 = ${sum}`
      });
      current -= lowbit(current);
    }
    
    setAnimationSteps(steps);
    setCurrentStep(0);
  };

  // 生成区间查询动画步骤
  const generateRangeQuerySteps = (left, right) => {
    const steps = [];
    
    // 先查询右端点
    let current = right;
    let rightSum = 0;
    while (current > 0) {
      rightSum += bit[current];
      steps.push({
        type: 'rangeQuery',
        phase: 'right',
        index: current,
        value: bit[current],
        sum: rightSum,
        description: `查询右端点：读取 BIT[${current}] = ${bit[current]}，累计和 = ${rightSum}`
      });
      current -= lowbit(current);
    }
    
    // 再查询左端点-1（如果不是从1开始）
    if (left > 1) {
      current = left - 1;
      let leftSum = 0;
      while (current > 0) {
        leftSum += bit[current];
        steps.push({
          type: 'rangeQuery',
          phase: 'left',
          index: current,
          value: bit[current],
          sum: leftSum,
          description: `查询左端点-1：读取 BIT[${current}] = ${bit[current]}，累计和 = ${leftSum}`
        });
        current -= lowbit(current);
      }
      
      steps.push({
        type: 'rangeQuery',
        phase: 'result',
        result: rightSum - leftSum,
        description: `区间和 = ${rightSum} - ${leftSum} = ${rightSum - leftSum}`
      });
    } else {
      steps.push({
        type: 'rangeQuery',
        phase: 'result',
        result: rightSum,
        description: `区间和 = ${rightSum}`
      });
    }
    
    setAnimationSteps(steps);
    setCurrentStep(0);
  };

  // 开始/停止动画
  const toggleAnimation = () => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= animationSteps.length - 1) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
  };

  // 重置动画
  const resetAnimation = () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
    setCurrentStep(0);
  };

  // 可视化树状数组
  const visualizeBIT = (bitArray) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    
    svg.attr("width", width).attr("height", height);
    
    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // 绘制原数组
    const arrayY = 50;
    const cellWidth = 50;
    const cellHeight = 30;
    
    // 原数组标题
    g.append("text")
      .attr("x", 0)
      .attr("y", arrayY - 10)
      .text("原数组:")
      .attr("font-size", "14px")
      .attr("font-weight", "bold");
    
    // 原数组单元格
    array.slice(1).forEach((value, i) => {
      const index = i + 1;
      const x = index * cellWidth;
      
      g.append("rect")
        .attr("x", x)
        .attr("y", arrayY)
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("fill", "#e3f2fd")
        .attr("stroke", "#1976d2")
        .attr("stroke-width", 1);
      
      g.append("text")
        .attr("x", x + cellWidth / 2)
        .attr("y", arrayY + cellHeight / 2 + 5)
        .text(value)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px");
      
      g.append("text")
        .attr("x", x + cellWidth / 2)
        .attr("y", arrayY + cellHeight + 15)
        .text(index)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#666");
    });
    
    // 绘制BIT数组
    const bitY = 150;
    
    // BIT数组标题
    g.append("text")
      .attr("x", 0)
      .attr("y", bitY - 10)
      .text("树状数组 (BIT):")
      .attr("font-size", "14px")
      .attr("font-weight", "bold");
    
    // BIT数组单元格
    bitArray.slice(1).forEach((value, i) => {
      const index = i + 1;
      const x = index * cellWidth;
      
      // 高亮当前步骤涉及的节点
      let fillColor = "#fff3e0";
      let strokeColor = "#f57c00";
      
      if (animationSteps.length > 0 && currentStep < animationSteps.length) {
        const step = animationSteps[currentStep];
        if (step.index === index) {
          fillColor = "#ffcdd2";
          strokeColor = "#d32f2f";
        }
      }
      
      g.append("rect")
        .attr("x", x)
        .attr("y", bitY)
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("fill", fillColor)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2);
      
      g.append("text")
        .attr("x", x + cellWidth / 2)
        .attr("y", bitY + cellHeight / 2 + 5)
        .text(value)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px");
      
      g.append("text")
        .attr("x", x + cellWidth / 2)
        .attr("y", bitY + cellHeight + 15)
        .text(index)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#666");
      
      // 显示lowbit信息
      g.append("text")
        .attr("x", x + cellWidth / 2)
        .attr("y", bitY + cellHeight + 30)
        .text(`lowbit: ${lowbit(index)}`)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("fill", "#999");
    });
    
    // 绘制树状结构连接线
    bitArray.slice(1).forEach((value, i) => {
      const index = i + 1;
      const parent = index + lowbit(index);
      
      if (parent < bitArray.length) {
        const x1 = index * cellWidth + cellWidth / 2;
        const y1 = bitY + cellHeight;
        const x2 = parent * cellWidth + cellWidth / 2;
        const y2 = bitY;
        
        g.append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", "#999")
          .attr("stroke-width", 1)
          .attr("marker-end", "url(#arrowhead)");
      }
    });
    
    // 定义箭头标记
    const defs = svg.append("defs");
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("markerWidth", 10)
      .attr("markerHeight", 7)
      .attr("refX", 9)
      .attr("refY", 3.5)
      .attr("orient", "auto")
      .append("polygon")
      .attr("points", "0 0, 10 3.5, 0 7")
      .attr("fill", "#999");
  };

  // 更新可视化
  useEffect(() => {
    if (bit.length > 0) {
      visualizeBIT(bit);
    }
  }, [bit, currentStep, animationSteps]);

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    margin: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  };

  const inputStyle = {
    padding: '8px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    width: '80px',
    marginRight: '10px',
  };

  const buttonStyle = {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '10px',
    transition: 'background-color 0.3s',
  };

  const selectStyle = {
    padding: '8px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    marginRight: '10px',
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        树状数组 (Binary Indexed Tree) 可视化
      </h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '30px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* 左侧控制面板 */}
        <div style={{ flex: '0 0 300px' }}>
          <div style={cardStyle}>
            <h3>操作控制</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label>操作类型:</label>
              <select 
                style={selectStyle}
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
              >
                <option value="">选择操作</option>
                <option value="update">单点更新</option>
                <option value="query">前缀和查询</option>
                <option value="rangeQuery">区间查询</option>
              </select>
            </div>
            
            {operation === 'update' && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label>索引: </label>
                  <input
                    type="number"
                    style={inputStyle}
                    value={index}
                    onChange={(e) => setIndex(e.target.value)}
                    min="1"
                    max={array.length - 1}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>新值: </label>
                  <input
                    type="number"
                    style={inputStyle}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {operation === 'query' && (
              <div style={{ marginBottom: '15px' }}>
                <label>查询索引: </label>
                <input
                  type="number"
                  style={inputStyle}
                  value={index}
                  onChange={(e) => setIndex(e.target.value)}
                  min="1"
                  max={array.length - 1}
                />
              </div>
            )}
            
            {operation === 'rangeQuery' && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label>左端点: </label>
                  <input
                    type="number"
                    style={inputStyle}
                    value={queryRange.left}
                    onChange={(e) => setQueryRange({...queryRange, left: e.target.value})}
                    min="1"
                    max={array.length - 1}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>右端点: </label>
                  <input
                    type="number"
                    style={inputStyle}
                    value={queryRange.right}
                    onChange={(e) => setQueryRange({...queryRange, right: e.target.value})}
                    min="1"
                    max={array.length - 1}
                  />
                </div>
              </div>
            )}
            
            <button
              style={buttonStyle}
              onClick={executeOperation}
              disabled={!operation}
            >
              执行操作
            </button>
            
            {result && (
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                backgroundColor: '#e8f5e8', 
                borderRadius: '6px',
                border: '1px solid #4caf50'
              }}>
                <strong>结果: </strong>{result}
              </div>
            )}
          </div>
          
          <div style={cardStyle}>
            <h3>动画控制</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label>动画速度: </label>
              <select 
                style={selectStyle}
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
              >
                <option value={2000}>慢速</option>
                <option value={1000}>正常</option>
                <option value={500}>快速</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <button
                style={{
                  ...buttonStyle,
                  backgroundColor: isPlaying ? '#f44336' : '#2196f3'
                }}
                onClick={toggleAnimation}
                disabled={animationSteps.length === 0}
              >
                {isPlaying ? '暂停' : '播放'}
              </button>
              
              <button
                style={{
                  ...buttonStyle,
                  backgroundColor: '#ff9800'
                }}
                onClick={resetAnimation}
                disabled={animationSteps.length === 0}
              >
                重置
              </button>
            </div>
            
            {animationSteps.length > 0 && (
              <div>
                <div style={{ marginBottom: '10px' }}>
                  步骤: {currentStep + 1} / {animationSteps.length}
                </div>
                
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '6px',
                  fontSize: '12px'
                }}>
                  {currentStep < animationSteps.length && animationSteps[currentStep].description}
                </div>
              </div>
            )}
          </div>
          
          <div style={cardStyle}>
            <h3>算法说明</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>树状数组特点：</strong></p>
              <ul>
                <li>支持O(log n)的单点更新</li>
                <li>支持O(log n)的前缀和查询</li>
                <li>空间复杂度O(n)</li>
                <li>基于二进制的巧妙设计</li>
              </ul>
              
              <p><strong>Lowbit操作：</strong></p>
              <p>lowbit(x) = x & (-x)，提取x的最低位1</p>
              
              <p><strong>核心思想：</strong></p>
              <p>每个节点管理一段连续的区间，通过lowbit确定父子关系。</p>
            </div>
          </div>
        </div>
        
        {/* 右侧可视化区域 */}
        <div style={{ flex: 1 }}>
          <div style={cardStyle}>
            <h3>可视化区域</h3>
            <svg ref={svgRef}></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryIndexedTreeVisualization;
