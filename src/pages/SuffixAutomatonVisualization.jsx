import React, { useState, useEffect, useRef } from 'react';
// 尝试直接导入anime函数
import anime from 'animejs/lib/anime.es.js';

// 后缀自动机状态类
class State {
  constructor(id) {
    this.id = id;          // 状态ID
    this.len = 0;         // 状态表示的最长子串长度
    this.link = -1;       // 后缀链接
    this.next = new Map(); // 转移映射
    this.isClone = false; // 是否为克隆状态
  }
}

// 构建后缀自动机的函数，返回构建步骤以便动画展示
function buildSuffixAutomatonWithSteps(s) {
  const steps = [];
  const states = [new State(0)];
  let size = 1;
  let last = 0;
  
  steps.push({
    type: 'init',
    states: [...states.map(s => ({...s, next: new Map(s.next)}))],
    last
  });
  
  for (const c of s) {
    // 创建新状态
    const curr = size++;
    states.push(new State(curr));
    states[curr].len = states[last].len + 1;
    
    steps.push({
      type: 'createState',
      stateId: curr,
      len: states[curr].len,
      states: [...states.map(s => ({...s, next: new Map(s.next)}))],
      last: curr
    });
    
    let p = last;
    // 遍历后缀链接
    while (p !== -1 && !states[p].next.has(c)) {
      states[p].next.set(c, curr);
      
      steps.push({
        type: 'addTransition',
        from: p,
        to: curr,
        char: c,
        states: [...states.map(s => ({...s, next: new Map(s.next)}))],
        last: curr
      });
      
      p = states[p].link;
    }
    
    if (p === -1) {
      // 链接到初始状态
      states[curr].link = 0;
      
      steps.push({
        type: 'setLink',
        from: curr,
        to: 0,
        states: [...states.map(s => ({...s, next: new Map(s.next)}))],
        last: curr
      });
    } else {
      const q = states[p].next.get(c);
      if (states[p].len + 1 === states[q].len) {
        // 直接链接
        states[curr].link = q;
        
        steps.push({
          type: 'setLink',
          from: curr,
          to: q,
          states: [...states.map(s => ({...s, next: new Map(s.next)}))],
          last: curr
        });
      } else {
        // 创建克隆状态
        const clone = size++;
        states.push(new State(clone));
        states[clone].len = states[p].len + 1;
        states[clone].next = new Map(states[q].next);
        states[clone].link = states[q].link;
        states[clone].isClone = true;
        
        steps.push({
          type: 'createClone',
          stateId: clone,
          original: q,
          len: states[clone].len,
          states: [...states.map(s => ({...s, next: new Map(s.next)}))],
          last: curr
        });
        
        // 更新转移
        while (p !== -1 && states[p].next.get(c) === q) {
          states[p].next.set(c, clone);
          
          steps.push({
            type: 'updateTransition',
            from: p,
            oldTo: q,
            newTo: clone,
            char: c,
            states: [...states.map(s => ({...s, next: new Map(s.next)}))],
            last: curr
          });
          
          p = states[p].link;
        }
        
        // 设置链接
        states[q].link = clone;
        steps.push({
          type: 'setLink',
          from: q,
          to: clone,
          states: [...states.map(s => ({...s, next: new Map(s.next)}))],
          last: curr
        });
        
        states[curr].link = clone;
        steps.push({
          type: 'setLink',
          from: curr,
          to: clone,
          states: [...states.map(s => ({...s, next: new Map(s.next)}))],
          last: curr
        });
      }
    }
    
    last = curr;
  }
  
  return { states, steps };
}

// 计算节点位置（层次布局）
function calculateNodePositions(states, width, height) {
  if (states.length === 0) return {};
  
  // 按长度分组
  const groups = {};
  states.forEach(state => {
    if (!groups[state.len]) {
      groups[state.len] = [];
    }
    groups[state.len].push(state.id);
  });
  
  // 排序长度
  const sortedLengths = Object.keys(groups).map(Number).sort((a, b) => a - b);
  const levels = sortedLengths.length;
  
  // 计算位置
  const positions = {};
  const yStep = (height - 200) / Math.max(1, levels - 1);
  
  sortedLengths.forEach((len, levelIndex) => {
    const nodes = groups[len];
    const xStep = (width - 200) / Math.max(1, nodes.length - 1);
    nodes.forEach((nodeId, i) => {
      positions[nodeId] = {
        x: 100 + (nodes.length > 1 ? i * xStep : (width - 200) / 2),
        y: 100 + levelIndex * yStep
      };
    });
  });
  
  return positions;
}

const AnimatedSuffixAutomaton = () => {
  const [inputString, setInputString] = useState("abac");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [states, setStates] = useState([]);
  const [nodePositions, setNodePositions] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  const containerRef = useRef(null);

  // 当输入字符串变化时重新构建自动机
  useEffect(() => {
    if (inputString.trim() === "") {
      setSteps([]);
      setStates([]);
      setNodePositions({});
      setCurrentStep(-1);
      return;
    }
    
    const { states, steps } = buildSuffixAutomatonWithSteps(inputString);
    setStates(states);
    setSteps(steps);
    setCurrentStep(-1);
    
    // 计算初始位置
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setNodePositions(calculateNodePositions(states, width, height));
    }
  }, [inputString]);

  // 当容器大小变化时重新计算位置
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && states.length > 0) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setNodePositions(calculateNodePositions(states, width, height));
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [states]);

  // 处理步骤动画
  useEffect(() => {
    if (currentStep < 0 || currentStep >= steps.length || !svgRef.current) return;
    
    const step = steps[currentStep];
    const { type } = step;
    
    // 根据步骤类型执行不同的动画
    switch (type) {
      case 'init':
      case 'createState':
      case 'createClone':
        animateNodeCreation(step.stateId || 0);
        break;
      case 'addTransition':
      case 'updateTransition':
        animateTransition(step.from, step.to || step.newTo, step.char);
        break;
      case 'setLink':
        animateLink(step.from, step.to);
        break;
    }
    
    // 如果正在播放，继续下一步
    if (isPlaying && currentStep < steps.length - 1) {
      animationRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000 / animationSpeed);
    }
    
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [currentStep, steps, isPlaying, animationSpeed]);

  // 节点创建动画
  const animateNodeCreation = (nodeId) => {
    const node = document.getElementById(`node-${nodeId}`);
    if (!node) return;
    
    // 初始状态：透明且缩小
    node.style.opacity = "0";
    node.style.transform = "scale(0)";
    
    // 动画：淡入并放大到正常大小
    anime({
      targets: node,
      opacity: 1,
      scale: 1,
      duration: 500 / animationSpeed,
      easing: 'easeOutQuad'
    });
    
    // 节点标签动画
    const label = document.getElementById(`node-label-${nodeId}`);
    if (label) {
      label.style.opacity = "0";
      anime({
        targets: label,
        opacity: 1,
        delay: 200 / animationSpeed,
        duration: 300 / animationSpeed,
        easing: 'easeOutQuad'
      });
    }
  };

  // 转移边动画
  const animateTransition = (fromId, toId, char) => {
    const edgeId = `transition-${fromId}-${toId}-${char}`;
    const edge = document.getElementById(edgeId);
    const label = document.getElementById(`${edgeId}-label`);
    
    if (!edge || !label) return;
    
    // 初始状态：透明且线条细
    edge.style.opacity = "0";
    edge.style.strokeWidth = "0";
    
    // 标签初始状态
    label.style.opacity = "0";
    
    // 边动画
    anime({
      targets: edge,
      opacity: 1,
      strokeWidth: 2,
      duration: 500 / animationSpeed,
      easing: 'easeOutQuad'
    });
    
    // 标签动画
    anime({
      targets: label,
      opacity: 1,
      delay: 200 / animationSpeed,
      duration: 300 / animationSpeed,
      easing: 'easeOutQuad'
    });
  };

  // 后缀链接动画
  const animateLink = (fromId, toId) => {
    const link = document.getElementById(`link-${fromId}-${toId}`);
    if (!link) return;
    
    // 初始状态：透明且线条细
    link.style.opacity = "0";
    link.style.strokeWidth = "0";
    
    // 动画：淡入并增加线宽
    anime({
      targets: link,
      opacity: 0.7,
      strokeWidth: 2,
      duration: 500 / animationSpeed,
      easing: 'easeOutQuad'
    });
  };

  // 控制函数
  const handlePlayPause = () => {
    if (steps.length === 0) return;
    
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    } else {
      setIsPlaying(true);
      if (currentStep === steps.length - 1) {
        setCurrentStep(-1);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  // 获取当前要显示的状态
  const currentStates = currentStep >= 0 && steps[currentStep] ? steps[currentStep].states : [];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">后缀自动机动画可视化</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">输入字符串:</label>
            <input
              type="text"
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如: abac"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              重置
            </button>
            <button
              onClick={handlePrev}
              disabled={currentStep <= 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-blue-300"
            >
              上一步
            </button>
            <button
              onClick={handlePlayPause}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {isPlaying ? '暂停' : '播放'}
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep >= steps.length - 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-blue-300"
            >
              下一步
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">动画速度:</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-32"
            />
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          {currentStep >= 0 ? `步骤 ${currentStep + 1}/${steps.length}` : '准备就绪'}
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {currentStates.length > 0 && (
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            className="w-full h-full"
          >
            {/* 绘制后缀链接 - 虚线 */}
            {currentStates.map(state => {
              if (state.link === -1) return null;
              const fromPos = nodePositions[state.id];
              const toPos = nodePositions[state.link];
              
              if (!fromPos || !toPos) return null;
              
              // 计算曲线控制点
              const controlY = (fromPos.y + toPos.y) / 2 - 50;
              
              return (
                <path
                  key={`link-${state.id}-${state.link}`}
                  id={`link-${state.id}-${state.link}`}
                  d={`M ${fromPos.x} ${fromPos.y} Q ${(fromPos.x + toPos.x) / 2} ${controlY}, ${toPos.x} ${toPos.y}`}
                  stroke="gray"
                  strokeDasharray="5,5"
                  fill="none"
                  style={{ opacity: 0 }}
                />
              );
            })}
            
            {/* 绘制转移边 - 实线 */}
            {currentStates.flatMap(state => {
              return Array.from(state.next.entries()).map(([char, toId]) => {
                const fromPos = nodePositions[state.id];
                const toPos = nodePositions[toId];
                
                if (!fromPos || !toPos) return null;
                
                // 计算箭头位置（稍微偏离节点中心）
                const dx = toPos.x - fromPos.x;
                const dy = toPos.y - fromPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const arrowheadLength = 30; // 节点半径
                const scale = (distance - arrowheadLength) / distance;
                
                const adjustedToX = fromPos.x + dx * scale;
                const adjustedToY = fromPos.y + dy * scale;
                
                // 计算标签位置
                const labelX = fromPos.x + dx * 0.5;
                const labelY = fromPos.y + dy * 0.5 - 10;
                
                return (
                  <React.Fragment key={`transition-${state.id}-${toId}-${char}`}>
                    <line
                      id={`transition-${state.id}-${toId}-${char}`}
                      x1={fromPos.x}
                      y1={fromPos.y}
                      x2={adjustedToX}
                      y2={adjustedToY}
                      stroke="black"
                      fill="none"
                      style={{ opacity: 0, strokeWidth: 0 }}
                    />
                    <text
                      id={`transition-${state.id}-${toId}-${char}-label`}
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      fill="black"
                      fontSize="14"
                      style={{ opacity: 0 }}
                    >
                      {char}
                    </text>
                    {/* 箭头头部 */}
                    <polygon
                      points={`${toPos.x},${toPos.y} ${adjustedToX + (toPos.y - adjustedToY) * 0.2},${adjustedToY + (adjustedToX - toPos.x) * 0.2} ${adjustedToX - (toPos.y - adjustedToY) * 0.2},${adjustedToY - (adjustedToX - toPos.x) * 0.2}`}
                      fill="black"
                      style={{ opacity: 0 }}
                    />
                  </React.Fragment>
                );
              });
            })}
            
            {/* 绘制节点 */}
            {currentStates.map(state => {
              const pos = nodePositions[state.id];
              if (!pos) return null;
              
              return (
                <g key={`node-group-${state.id}`} id={`node-group-${state.id}`}>
                  <circle
                    id={`node-${state.id}`}
                    cx={pos.x}
                    cy={pos.y}
                    r="30"
                    fill={state.isClone ? "#e0f2fe" : state.id === 0 ? "#bbf7d0" : "#dbeafe"}
                    stroke={state.id === 0 ? "#22c55e" : "#3b82f6"}
                    strokeWidth="2"
                    style={{ opacity: 0, transform: "scale(0)" }}
                  />
                  <text
                    id={`node-label-${state.id}`}
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="black"
                    fontSize="16"
                    fontWeight="bold"
                    style={{ opacity: 0 }}
                  >
                    {state.id}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 50}
                    textAnchor="middle"
                    fill="gray"
                    fontSize="12"
                    style={{ opacity: 0 }}
                  >
                    len={state.len}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
        
        {currentStates.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            请输入字符串以生成后缀自动机
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white shadow-inner text-sm text-gray-600">
        <p>可视化说明：</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>绿色节点是初始状态（id=0）</li>
          <li>蓝色节点是普通状态</li>
          <li>浅蓝色节点是克隆状态</li>
          <li>黑色实线表示状态转移，标有转移字符</li>
          <li>灰色虚线表示后缀链接</li>
          <li>每个节点下方显示其最长子串长度（len）</li>
        </ul>
      </div>
    </div>
  );
};

export default AnimatedSuffixAutomaton;
