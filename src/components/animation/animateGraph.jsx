// animateGraph.jsx - 图的动画组件
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { GraphRenderer, CanvasRenderer } from './drawingTools';
import AnnotationTool from './annotationTools';

const AnimateGraph = forwardRef(({
  width = 800,
  height = 600,
  nodes = [],
  edges = [],
  nodesStyle = {},
  edgesStyle = {},
  initialMode = 'none',
  onInit
}, ref) => {
  // 本地状态管理绘图模式
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [drawingTool, setDrawingTool] = useState('brush'); // 'brush' 或 'eraser'
  
  // 切换模式函数
  const toggleMode = () => {
    setCurrentMode(prevMode => {
      return prevMode === 'none' ? 'draw' : 'none';
    });
  };
  
  // 切换绘图工具
  const switchDrawingTool = (tool) => {
    setDrawingTool(tool);
    if (annotationToolRef.current && currentMode === 'draw') {
      if (tool === 'brush') {
        annotationToolRef.current.enableDrawing();
      } else if (tool === 'eraser') {
        annotationToolRef.current.enableErasing();
      }
    }
  };
  
  // Refs for the canvas layers
  const refIndicator = useRef(null);
  const refSvgContainer = useRef(null); // 用于放置SVG元素的容器
  const annotationToolRef = useRef(null);
  
  // Store the drawing tools instances
  const indicatorRendererRef = useRef(null);
  const graphRendererRef = useRef(null);
  
  // Store indicators data
  const indicatorsRef = useRef(new Map());
  
  // 存储指示器脉冲动画的定时器ID
  const indicatorIntervalsRef = useRef([]);
  
  // 存储当前节点和边状态
  const currentNodesRef = useRef([]);
  const currentEdgesRef = useRef([]);
  const currentNodesStyleRef = useRef({});
  const currentEdgesStyleRef = useRef({});
  
  // Initialize the renderers - 只负责初始化
  useEffect(() => {
    const indicatorCanvas = refIndicator.current;
    const svgContainer = refSvgContainer.current;
    
    if (!indicatorCanvas || !svgContainer) return;
    
    // 初始化CanvasRenderer用于指示器图层
    indicatorRendererRef.current = new CanvasRenderer(indicatorCanvas, width, height);
    
    // 初始化GraphRenderer - 不再依赖canvas
    const graphRenderer = new GraphRenderer(width, height);
    
    // 获取SVG元素并添加到容器中
    const svgElement = graphRenderer.getSVGElement();
    svgContainer.appendChild(svgElement);
    
    // 存储GraphRenderer实例到ref
    graphRendererRef.current = graphRenderer;
    
    // 保存初始节点和边数据
    currentNodesRef.current = [...nodes];
    currentEdgesRef.current = [...edges];
    currentNodesStyleRef.current = { ...nodesStyle };
    currentEdgesStyleRef.current = { ...edgesStyle };
    
    // 初始渲染
    renderGraph();
    
    // Setup the controller interface
    const controller = getController();
    
    // Call the onInit callback with the controller
    if (typeof onInit === 'function') {
      onInit(controller);
    }
    
    // Cleanup function
    return () => {
      // 移除SVG元素
      if (svgElement && svgContainer.contains(svgElement)) {
        svgContainer.removeChild(svgElement);
      }
      
      // 清除所有脉冲动画定时器
      if (typeof indicatorIntervalsRef !== 'undefined' && indicatorIntervalsRef.current) {
        indicatorIntervalsRef.current.forEach(interval => clearInterval(interval));
      }
      
      // 清除动画
      if (graphRendererRef.current) {
        graphRendererRef.current.clearAnimations?.();
      }
    };
  }, []);
  
  // Render the graph on the main canvas - 仅用于重新画整张图
  const renderGraph = () => {
    // 获取GraphRenderer实例
    const graphRenderer = graphRendererRef.current;
    if (!graphRenderer) return;
    
    // 使用GraphRenderer更新图数据并渲染
    graphRenderer.updateGraph(currentNodesRef.current, currentEdgesRef.current);
  };
  
  // 控制器接口函数
  const getController = () => ({
    
    setMode: (newMode) => {
      if (newMode === 'none' || newMode === 'draw') {
        setCurrentMode(newMode);
      }
    },
    
    getMode: () => {
      return currentMode;
    },
    
    setNodes: (newNodes) => {
      // 更新节点
      currentNodesRef.current = [...newNodes];
      
      // 获取GraphRenderer实例
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        // 使用updateGraph方法更新整个图
        graphRenderer.updateGraph(currentNodesRef.current, currentEdgesRef.current);
      }
    },
    
    setEdges: (newEdges) => {
      // 更新边
      currentEdgesRef.current = [...newEdges];
      
      // 获取GraphRenderer实例
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        // 使用updateGraph方法更新整个图
        graphRenderer.updateGraph(currentNodesRef.current, currentEdgesRef.current);
      }
    },
    
    setNodesStyle: (style) => {
      // 更新节点样式
      currentNodesStyleRef.current = { ...style };
      
      // 应用样式到所有节点
      currentNodesRef.current = currentNodesRef.current.map(node => ({
        ...node,
        style: {
          ...node.style,
          ...style
        }
      }));
      
      // 获取GraphRenderer实例
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        // 使用updateGraph方法更新整个图
        graphRenderer.updateGraph(currentNodesRef.current, currentEdgesRef.current);
      }
    },
    
    setEdgesStyle: (style) => {
      // 更新边样式
      currentEdgesStyleRef.current = { ...style };
      
      // 应用样式到所有边
      currentEdgesRef.current = currentEdgesRef.current.map(edge => ({
        ...edge,
        style: {
          ...edge.style,
          ...style
        }
      }));
      
      // 获取GraphRenderer实例
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        // 使用updateGraph方法更新整个图
        graphRenderer.updateGraph(currentNodesRef.current, currentEdgesRef.current);
      }
    },
    
    updateNode: (nodeId, updates) => {
      // 找到节点并更新
      const nodeIndex = currentNodesRef.current.findIndex(n => n.id === nodeId);
      if (nodeIndex !== -1) {
        // 合并样式更新
        if (updates.style) {
          currentNodesRef.current[nodeIndex] = {
            ...currentNodesRef.current[nodeIndex],
            ...updates,
            style: {
              ...currentNodesRef.current[nodeIndex].style,
              ...updates.style
            }
          };
        } else {
          currentNodesRef.current[nodeIndex] = { ...currentNodesRef.current[nodeIndex], ...updates };
        }
        
        // 获取GraphRenderer实例
        const graphRenderer = graphRendererRef.current;
        if (graphRenderer) {
          // 使用updateGraph方法更新整个图
          graphRenderer.updateGraph(currentNodesRef.current, currentEdgesRef.current);
        }
      }
    },
    
    updateEdge: (edgeId, updates) => {
      // 找到边并更新
      const edgeIndex = currentEdgesRef.current.findIndex(e => e.id === edgeId);
      if (edgeIndex !== -1) {
        // 合并样式更新
        if (updates.style) {
          currentEdgesRef.current[edgeIndex] = {
            ...currentEdgesRef.current[edgeIndex],
            ...updates,
            style: {
              ...currentEdgesRef.current[edgeIndex].style,
              ...updates.style
            }
          };
        } else {
          currentEdgesRef.current[edgeIndex] = { ...currentEdgesRef.current[edgeIndex], ...updates };
        }
        
        // 获取GraphRenderer实例
        const graphRenderer = graphRendererRef.current;
        if (graphRenderer) {
          // 使用updateGraph方法更新整个图
          graphRenderer.updateGraph(currentNodesRef.current, currentEdgesRef.current);
        }
      }
    },
    
    addNode: (node) => {
      // 添加新节点
      currentNodesRef.current.push(node);
      
      // 获取GraphRenderer实例
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        // 使用updateGraph方法更新整个图
        graphRenderer.updateGraph(currentNodesRef.current, currentEdgesRef.current);
      }
    },
    
    addEdge: (source, target, properties = {}) => {
      // 添加新边
      const newEdge = {
        id: `edge-${Date.now()}`, // 生成唯一ID
        source,
        target,
        ...properties
      };
      
      currentEdgesRef.current.push(newEdge);
      
      // 获取GraphRenderer实例
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        // 使用updateGraph方法更新整个图
        graphRenderer.updateGraph(currentNodesRef.current, currentEdgesRef.current);
      }
    },
    
    clearIndicators: () => {
      // 清除所有指示器
      const ctx = refIndicator.current.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      indicatorsRef.current.clear();
      
      // 清除所有脉冲动画定时器
      if (typeof indicatorIntervalsRef !== 'undefined' && indicatorIntervalsRef.current) {
        indicatorIntervalsRef.current.forEach(interval => clearInterval(interval));
        indicatorIntervalsRef.current = [];
      }
    },
    
    addIndicator: (type, position, properties = {}) => {
      // 添加指示器
      const ctx = refIndicator.current.getContext('2d');
      const indicatorId = Date.now().toString();
      
      // 保存当前状态
      ctx.save();
      
      // 绘制指示器
      if (type === 'highlight') {
        ctx.beginPath();
        ctx.arc(position.x, position.y, properties.radius || 30, 0, Math.PI * 2);
        ctx.strokeStyle = properties.color || '#ffeb3b';
        ctx.lineWidth = properties.lineWidth || 3;
        ctx.stroke();
      }
      
      // 恢复状态
      ctx.restore();
      
      // 如果需要脉冲动画，这里可以实现
      if (properties.pulseDuration) {
        // 注意：直接在canvas上实现脉冲效果
        const defaults = {
          color: properties.color || '#ffeb3b',
          radius: properties.radius || 30,
          pulseDuration: properties.pulseDuration
        };
        
        const pulseInterval = setInterval(() => {
          // 清除并重新绘制所有指示器和脉冲
          const clearCtx = refIndicator.current.getContext('2d');
          clearCtx.clearRect(0, 0, width, height);
          
          // 重新绘制所有指示器
          indicatorsRef.current.forEach(({ type, position, properties }) => {
            if (type === 'highlight') {
              clearCtx.beginPath();
              clearCtx.arc(position.x, position.y, properties.radius || 30, 0, Math.PI * 2);
              clearCtx.strokeStyle = properties.color || '#ffeb3b';
              clearCtx.lineWidth = properties.lineWidth || 3;
              clearCtx.stroke();
            }
          });
          
          // 绘制脉冲
          clearCtx.fillStyle = defaults.color;
          clearCtx.globalAlpha = 0.3;
          clearCtx.beginPath();
          clearCtx.arc(position.x, position.y, defaults.radius * 1.5, 0, Math.PI * 2);
          clearCtx.fill();
        }, defaults.pulseDuration / 2);
        
        // 保存定时器ID以便后续清除
        indicatorIntervalsRef.current.push(pulseInterval);
        
        // 设置超时后清除脉冲动画
        setTimeout(() => {
          clearInterval(pulseInterval);
          const index = indicatorIntervalsRef.current.indexOf(pulseInterval);
          if (index !== -1) {
            indicatorIntervalsRef.current.splice(index, 1);
          }
          // 重新绘制所有指示器，不包括当前脉冲
          removeIndicator(indicatorId);
        }, defaults.pulseDuration * 3);
      }
      
      // 存储指示器信息
      indicatorsRef.current.set(indicatorId, { type, position, properties });
      
      return indicatorId;
    },
    
    removeIndicator: (indicatorId) => {
      // 移除指示器
      indicatorsRef.current.delete(indicatorId);
      // 重新绘制所有指示器
      const ctx = refIndicator.current.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      
      indicatorsRef.current.forEach(({ type, position, properties }) => {
        if (type === 'highlight') {
          ctx.beginPath();
          ctx.arc(position.x, position.y, properties.radius || 30, 0, Math.PI * 2);
          ctx.strokeStyle = properties.color || '#ffeb3b';
          ctx.lineWidth = properties.lineWidth || 3;
          ctx.stroke();
        }
      });
    },
    
    redrawGraph: () => {
      // 强制重新绘制整个图
      renderGraph();
    }
  });
  
  // 监听模式变化，启用或禁用绘图功能
  useEffect(() => {
    if (annotationToolRef.current) {
      if (currentMode === 'draw') {
        // 根据当前选择的工具启用相应的绘图模式
        if (drawingTool === 'brush') {
          annotationToolRef.current.enableDrawing();
        } else if (drawingTool === 'eraser') {
          annotationToolRef.current.enableErasing();
        }
      } else {
        annotationToolRef.current.disableDrawing();
      }
    }
  }, [currentMode, drawingTool]);

  // 暴露控制器给父组件
  useImperativeHandle(ref, () => getController());
  
  return (
    <div className="relative w-full h-full">
      {/* SVG容器 - 用于放置GraphRenderer生成的SVG元素 */}
      <div
        ref={refSvgContainer}
        className="absolute top-0 left-0 w-full h-full"
        style={{
          zIndex: 0 // 确保SVG容器在最底层
        }}
      />
      
      {/* 指示器图层 - 用于高亮、焦点等临时指示 */}
      <canvas
        ref={refIndicator}
        className="absolute top-0 left-0 w-full h-full"
        style={{
          backgroundColor: 'transparent',
          zIndex: 1 // 指示器图层在SVG容器之上
        }}
      />
      
      {/* 注释工具组件 - 确保在最上层 */}
      <AnnotationTool
        ref={annotationToolRef}
        width={width}
        height={height}
        visible={currentMode === 'draw'}
        style={{
          backgroundColor: 'transparent',
          zIndex: 2// 画图图层在最上方
        }}
      />
      
      {/* 绘图工具栏 - 右下角 */}
      <div className="fixed bottom-4 right-4 flex gap-2" style={{ zIndex: 9999 }}>
        {/* 画笔按钮 */}
        <button
          className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${currentMode === 'draw' && drawingTool === 'brush' ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
          onClick={() => {
            if (currentMode === 'draw') {
              switchDrawingTool('brush');
            }
          }}
          disabled={currentMode !== 'draw'}
          title="画笔工具"
          style={{
            boxShadow: currentMode === 'draw' && drawingTool === 'brush' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : '0 2px 4px rgba(0,0,0,0.2)',
            border: '1px solid',
            opacity: currentMode !== 'draw' ? 0.5 : 1
          }}
        >
          ✏️
        </button>
        
        {/* 橡皮擦按钮 */}
        <button
          className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${currentMode === 'draw' && drawingTool === 'eraser' ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
          onClick={() => {
            if (currentMode === 'draw') {
              switchDrawingTool('eraser');
            }
          }}
          disabled={currentMode !== 'draw'}
          title="橡皮擦工具"
          style={{
            boxShadow: currentMode === 'draw' && drawingTool === 'eraser' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : '0 2px 4px rgba(0,0,0,0.2)',
            border: '1px solid',
            opacity: currentMode !== 'draw' ? 0.5 : 1
          }}
        >
          🧹
        </button>
        
        {/* 清空笔迹按钮 */}
        <button
          className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${currentMode === 'draw' ? 'bg-red-500 text-white border-red-500' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
          onClick={() => {
            if (annotationToolRef.current) {
              annotationToolRef.current.clearAll();
            }
          }}
          disabled={currentMode !== 'draw'}
          title="清空所有笔迹"
          style={{
            boxShadow: currentMode === 'draw' ? '0 4px 12px rgba(239, 68, 68, 0.4)' : '0 2px 4px rgba(0,0,0,0.2)',
            border: '1px solid',
            opacity: currentMode !== 'draw' ? 0.5 : 1
          }}
        >
          ❌
        </button>
        
        {/* 模式切换按钮 */}
        <button
          className="w-10 h-10 rounded-md text-sm transition-colors flex items-center justify-center"
          onClick={toggleMode}
          style={{
            boxShadow: currentMode === 'none' ? '0 4px 8px rgba(0,0,0,0.3)' : '0 4px 12px rgba(37, 99, 235, 0.4)',
            border: currentMode === 'none' ? '1px solid #4b5563' : '1px solid #2563eb',
            backgroundColor: currentMode === 'none' ? '#4b5563' : '#2563eb',
            color: '#ffffff',
            fontSize: '18px'
          }}
          title={currentMode === 'none' ? '启用绘图' : '禁用绘图'}
        >
          ✏️
        </button>
      </div>
    </div>
  );
});

AnimateGraph.displayName = 'AnimateGraph';

export default AnimateGraph;