// animateGraph.jsx - 图的动画组件
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { PixiGraphRenderer } from './PixiGraphRenderer';
import { IndicatorRenderer } from './IndicatorRenderer';
import AnnotationTool from './annotationTools';

const AnimateGraph = forwardRef(({
  width = 800,
  height = 600,
  initialMode = 'none',
  onInit,
  enableDrawing = true,
  backgroundImage = null
}, ref) => {
  // 本地状态管理绘图模式
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [drawingTool, setDrawingTool] = useState('brush'); // 'brush' 或 'eraser'
  const [showTools, setShowTools] = useState(false);// 工具栏是否展开
  
  // 切换模式函数 - 添加动画控制
  const toggleMode = () => {
    if (currentMode === 'none') {
      setShowTools(true);
      setCurrentMode('draw');
    } else {
      setShowTools(false);
      setCurrentMode('none');
    }
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
  const refSvgContainer = useRef(null);
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
    
    // 初始化IndicatorRenderer用于指示器图层
      indicatorRendererRef.current = new IndicatorRenderer(indicatorCanvas, width, height);
      
      // 创建PixiGraphRenderer实例，并传入回调函数替代setTimeout初始化
      const graphRenderer = new PixiGraphRenderer(width, height, backgroundImage, (renderer) => {
        // 获取SVG元素并添加到容器中
        const svgElement = renderer.getSVGElement();
        if (svgElement && svgContainer) {
          svgContainer.appendChild(svgElement);
        }
        
        // 存储PixiGraphRenderer实例到ref
        graphRendererRef.current = renderer;
        
        // 初始化空的节点和边数据
        currentNodesRef.current = [];
        currentEdgesRef.current = [];
        currentNodesStyleRef.current = {};
        currentEdgesStyleRef.current = {};
        
        // 初始渲染空图
        renderGraph();
        
        const controller = getController();
        
        // 调用外部onInit回调
        if (typeof onInit === 'function') {
          onInit(controller);
        }
      });
    
    // Cleanup function
    return () => {
      // 移除SVG元素
      const svgElement = graphRendererRef.current?.getSVGElement();
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
      
      // 销毁实例，释放资源
      if (indicatorRendererRef.current) {
        indicatorRendererRef.current.dispose();
        indicatorRendererRef.current = null;
      }
    };
  }, []);
  
  // 重新画整张图
  const renderGraph = () => {
    // 获取PixiGraphRenderer实例
    const graphRenderer = graphRendererRef.current;
    if (!graphRenderer) return;
    
    // 使用PixiGraphRenderer分别渲染节点和边
    renderNodes();
    renderEdges();
    
  };
  
  // 渲染所有节点
  const renderNodes = () => {
    // 获取PixiGraphRenderer实例
    const graphRenderer = graphRendererRef.current;
    if (!graphRenderer) return;
    
    graphRenderer.clearAllNodes();
    
    // 创建或更新节点
    currentNodesRef.current.forEach(node => {
        graphRenderer.createNodeElement(node.id, node);
    });
  };
  
  // 渲染所有边
  const renderEdges = () => {
    // 获取PixiGraphRenderer实例
    const graphRenderer = graphRendererRef.current;
    if (!graphRenderer) return;
    
    graphRenderer.clearAllEdges();
    
    // 创建或更新边
    currentEdgesRef.current.forEach(edge => {
      const sourceNode = currentNodesRef.current.find(n => n.id === edge.source);
      const targetNode = currentNodesRef.current.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        graphRenderer.createEdgeElement(edge.id, sourceNode, targetNode, edge.style, edge.label);
      }
    });
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
    
    updateNode: (node) => {
      // 找到节点并更新
      const nodeIndex = currentNodesRef.current.findIndex(n => n.id === node.id);
      if (nodeIndex === -1) {
        console.warn(`Warning: Cannot update node with id ${node.id}, node not found.`);
        return;
      }
      
      // 获取旧节点
      const oldNode = currentNodesRef.current[nodeIndex];
      // 合并属性，只有传入的节点中存在的属性才会更新
      const updatedNode = {...oldNode, ...node};
      // 特殊处理style属性，确保嵌套合并
      if (node.style && oldNode.style) {
        updatedNode.style = {...oldNode.style, ...node.style};
      }
      
      // 检查位置是否发生变化
      const positionChanged = node.x !== undefined && node.x !== oldNode.x || 
                              node.y !== undefined && node.y !== oldNode.y;
      
      // 检查样式是否发生变化
      const styleChanged = node.style !== undefined || node.size !== undefined || node.label !== undefined;
      
      // 更新节点引用
      currentNodesRef.current[nodeIndex] = updatedNode;
      
      // 获取PixiGraphRenderer实例
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        // 如果样式发生变化，调用updateNodeStyle
        if (styleChanged) {
          graphRenderer.updateNodeStyle(node.id, updatedNode);
        }
        
        // 如果位置发生变化，调用updateNodePosition并传递相关边
        if (positionChanged) {
          // 获取所有相邻边的信息
          const connectedEdges = currentEdgesRef.current
            .filter(edge => edge.source === node.id || edge.target === node.id)
            .map(edge => {
              const sourceNode = currentNodesRef.current.find(n => n.id === edge.source);
              const targetNode = currentNodesRef.current.find(n => n.id === edge.target);
              return {
                edgeId: edge.id,
                sourceNode: sourceNode,
                targetNode: targetNode
              };
            })
            .filter(edgeInfo => edgeInfo.sourceNode && edgeInfo.targetNode); // 确保节点存在
          
          // 调用updateNodePosition，传递节点和相关边信息
          graphRenderer.updateNodePosition(node.id, updatedNode, connectedEdges);
        }
      }
    },
    
    updateEdge: (edge) => {
      // 找到边并更新
      const edgeIndex = currentEdgesRef.current.findIndex(e => e.id === edge.id);
      if (edgeIndex === -1) {
        console.warn(`Warning: Cannot update edge with id ${edge.id}, edge not found.`);
        return;
      }
      
      // 获取旧边
      const oldEdge = currentEdgesRef.current[edgeIndex];
      // 合并属性，只有传入的边中存在的属性才会更新
      const updatedEdge = {...oldEdge, ...edge};
      // 特殊处理style属性，确保嵌套合并
      if (edge.style && oldEdge.style) {
        updatedEdge.style = {...oldEdge.style, ...edge.style};
      }
      
      // 更新边引用
      currentEdgesRef.current[edgeIndex] = updatedEdge;
      
      // 获取PixiGraphRenderer实例
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        // 只处理边的样式修改，不处理位置修改
        graphRenderer.updateEdgeStyle(updatedEdge.id, updatedEdge.style, updatedEdge.label);
      }
    },
    
    addNode: (node) => {
      // 检查节点ID是否已存在
      if (currentNodesRef.current.some(n => n.id === node.id)) {
        alert(`节点 ID "${node.id}" 已存在`);
        return;
      }
      
      currentNodesRef.current.push(node);
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        graphRenderer.createNodeElement(node.id, node);
      }
    },
    
    addEdge: (edge) => {
      // 添加新边
      const newEdge = {
        id: edge.id || `edge-${Date.now()}`, // 使用提供的ID或生成唯一ID
        source: edge.source,
        target: edge.target,
        ...edge
      };
      
      // 检查边ID是否已存在
      if (currentEdgesRef.current.some(e => e.id === newEdge.id)) {
        alert(`边 ID "${newEdge.id}" 已存在`);
        return;
      }
      
      // 获取PixiGraphRenderer实例
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        // 添加单个边
        const sourceNode = currentNodesRef.current.find(n => n.id === edge.source);
        const targetNode = currentNodesRef.current.find(n => n.id === edge.target);
        
        if (sourceNode && targetNode) {
          currentEdgesRef.current.push(newEdge);
          graphRenderer.createEdgeElement(newEdge.id, sourceNode, targetNode, newEdge.style, newEdge.label);
        } else {
          console.warn(`Warning: Cannot create edge with id ${newEdge.id}, source or target node not found.`);
        }
      }
    },
    
    deleteNode: (nodeId) => {
      // 检查节点是否存在
      const nodeExists = currentNodesRef.current.some(n => n.id === nodeId);
      if (!nodeExists) {
        console.warn(`Warning: Cannot delete node with id ${nodeId}, node not found.`);
        return;
      }
      
      // 找出所有与要删除节点相连的边
      const edgesToDelete = currentEdgesRef.current.filter(
        edge => edge.source === nodeId || edge.target === nodeId
      );
      
      // 从边数组中移除这些边
      currentEdgesRef.current = currentEdgesRef.current.filter(
        edge => edge.source !== nodeId && edge.target !== nodeId
      );
      
      // 从节点数组中移除节点
      currentNodesRef.current = currentNodesRef.current.filter(n => n.id !== nodeId);
      
      // 获取PixiGraphRenderer实例
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        // 删除单个节点
        graphRenderer.removeNodeElement(nodeId);
        
        // 删除所有相关边
        edgesToDelete.forEach(edge => {
          graphRenderer.removeEdgeElement(edge.id);
        });
      }
    },
    
    deleteEdge: (edgeId) => {
      // 检查边是否存在
      const edgeExists = currentEdgesRef.current.some(e => e.id === edgeId);
      if (!edgeExists) {
        console.warn(`Warning: Cannot delete edge with id ${edgeId}, edge not found.`);
        return;
      }
      
      // 从边数组中移除边
      currentEdgesRef.current = currentEdgesRef.current.filter(e => e.id !== edgeId);
      
      // 获取PixiGraphRenderer实例
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        // 删除单个边
        graphRenderer.removeEdgeElement(edgeId);
      }
    },
    
    // 清除整个图
    clearGraph: () => {
      // 清空节点和边的引用数据
      currentNodesRef.current = [];
      currentEdgesRef.current = [];
      
      // 获取PixiGraphRenderer实例
      const graphRenderer = graphRendererRef.current;
      if (graphRenderer) {
        // 调用graphRenderer的方法清除所有节点和边
        graphRenderer.clearAllNodes();
        graphRenderer.clearAllEdges();
      }
    },
    
    clearIndicators: () => {
      if (indicatorRendererRef.current) {
        indicatorRendererRef.current.clearIndicators();
      }
      
      // 清除指示器信息
      indicatorsRef.current.clear();
    },
    
    addIndicator: (options) => {
      // 支持格式：{id, type, target, position, color, size, duration}
      
      // 如果没有id，则生成一个
      const indicatorId = options.id || Date.now().toString();
      
      // 获取位置信息
      let position;
      if (options.position) {
        // 如果直接提供了位置
        position = options.position;
      } else if (options.target) {
        // 如果提供了目标节点ID，则查找该节点的位置
        const targetNode = currentNodesRef.current.find(node => node.id === options.target);
        if (!targetNode) {
          console.warn(`Warning: Target node with id ${options.target} not found.`);
          return;
        }
        position = { x: targetNode.x, y: targetNode.y };
      } else {
        console.warn('Warning: No position or target provided for indicator.');
        return;
      }
      
      const radius = options.size || options.radius || 30;
      const color = options.color || '#ff0000ff';
      
      if (indicatorRendererRef.current) {
        if (options.type === 'highlight') {
          indicatorRendererRef.current.addHighlightIndicator(
            indicatorId, 
            position.x, 
            position.y, 
            radius, 
            color, 
            options.lineWidth || 3
          );
        } else if (options.type === 'pulse') {
          const duration = options.duration || 3000;
          const repeatCount = options.repeatCount !== undefined ? options.repeatCount : 3;
          indicatorRendererRef.current.addPulseIndicator(
            indicatorId, 
            position.x, 
            position.y, 
            radius, 
            color, 
            duration,
            repeatCount
          );
        } else if (options.type === 'edge-pulse') {
          // 边脉冲动画，需要source和target节点
          const sourceNode = currentNodesRef.current.find(node => node.id === options.source);
          const targetNode = currentNodesRef.current.find(node => node.id === options.target);
          
          if (sourceNode && targetNode) {
            const duration = options.duration || 1000;
            indicatorRendererRef.current.addEdgePulseIndicator(
              indicatorId,
              sourceNode.x,
              sourceNode.y,
              targetNode.x,
              targetNode.y,
              color,
              duration
            );
          }
        }
      }
      
      // 存储指示器信息
      indicatorsRef.current.set(indicatorId, {
        id: indicatorId,
        type: options.type,
        target: options.target,
        position: position,
        properties: {
          color: color,
          radius: radius,
          duration: options.duration
        }
      });
      
      return indicatorId;
    },
    
    removeIndicator: (indicatorId) => {
      if (indicatorRendererRef.current) {
        indicatorRendererRef.current.removeIndicator(indicatorId);
      }
      
      // 移除指示器信息
      indicatorsRef.current.delete(indicatorId);
    },
    
    redrawGraph: () => {
      // 强制重新绘制整个图
      renderGraph();
    },
    
    handleAddNode: (node) => {
      // 修改为单个节点操作
      getController().addNode(node);
    },
    
    handleUpdateNode: (node) => {
      // 修改为单个节点操作
      getController().updateNode(node);
    },
    
    handleDeleteNode: (nodeId) => {
      // 修改为单个节点操作
      getController().deleteNode(nodeId);
    },
    
    handleAddEdge: (edge) => {
      // 修改为单个边操作
      getController().addEdge(edge);
    },
    
    handleUpdateEdge: (edge) => {
      // 修改为单个边操作
      getController().updateEdge(edge);
    },
    
    handleDeleteEdge: (edgeId) => {
      // 修改为单个边操作
      getController().deleteEdge(edgeId);
    },
    
    // 处理指示器操作
    handleAddIndicator: (indicator) => {
      if (indicator) {
        const indicatorId = getController().addIndicator(indicator);
        
        // 如果设置了持续时间，自动移除
        if (indicator.duration && indicatorId) {
          setTimeout(() => {
            getController().removeIndicator(indicatorId);
          }, indicator.duration);
        }
      }
    },
    
    handleRemoveIndicator: (indicatorId) => {
      if (indicatorId) {
        getController().removeIndicator(indicatorId);
      }
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
      {/* SVG容器 - 用于放置PixiGraphRenderer生成的SVG元素 */}
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
      
      {/* 注释工具组件 - 确保在合适的层级，不覆盖工具栏 */}
      <AnnotationTool
        ref={annotationToolRef}
        width={width}
        height={height}
        visible={currentMode === 'draw'}
        style={{
          backgroundColor: 'transparent',
          zIndex: 2, // 画图图层在图和指示器之上，但低于工具栏
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: currentMode === 'draw' ? 'auto' : 'none'
        }}
      />
      
      {/* 绘图工具栏 - 画布做上角 - 仅当enableDrawing为true时显示 */}
      {enableDrawing && (
        <div style={{
          position: 'absolute',
          left: '5px',
          top: '5px',
          display: 'flex',
          gap: showTools ? '5px' : '0px',
          zIndex: 9999
        }}>
          {/* 模式切换按钮 */}
          <button
            className="w-8 h-8 rounded-md text-sm transition-colors flex items-center justify-center"
            onClick={toggleMode}
            style={{
              boxShadow: currentMode === 'none' ? '0 4px 8px rgba(0,0,0,0.3)' : '0 4px 12px rgba(37, 99, 235, 0.4)',
              border: currentMode === 'none' ? '1px solid #4b5563' : '1px solid #2563eb',
              backgroundColor: currentMode === 'none' ? '#4b5563' : '#2563eb',
              color: '#ffffff',
              fontSize: '18px',
              position: 'relative',
              zIndex: 2
            }}
            title={currentMode === 'none' ? '启用绘图' : '禁用绘图'}
          >
            {currentMode === 'none' ? '→' : '←'}
          </button>
          
          {/* 工具按钮容器 - 实现拉窗帘式动画 */}
          <div 
            style={{
              display: 'flex',
              gap: showTools ? '5px' : '0px', // 展开时有间距，收起时无间距
              transition: 'all 1s ease-in-out',
              position: 'relative'
            }}
          >
            {/* 画笔按钮 */}
            <button
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${currentMode === 'draw' && drawingTool === 'brush' ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
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
                opacity: currentMode !== 'draw' ? 0.5 : 1,
                transform: showTools ? 'translateX(0)' : 'translateX(-100%)', // 展开时不偏移，收起时向左偏移
                transition: 'transform 1s ease-in-out',
                position: 'relative',
                zIndex: 1
              }}
            >
              ✏️
            </button>
            
            {/* 橡皮擦按钮 */}
            <button
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${currentMode === 'draw' && drawingTool === 'eraser' ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
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
                opacity: currentMode !== 'draw' ? 0.5 : 1,
                transform: showTools ? 'translateX(0)' : 'translateX(-200%)', // 展开时不偏移，收起时向左偏移更多
                transition: 'transform 1s ease-in-out 0.1s', // 延迟一点开始动画，形成序列效果
                position: 'relative',
                zIndex: 1
              }}
            >
              🧹
            </button>
            
            {/* 清空笔迹按钮 */}
            <button
              className="w-8 h-8 rounded-md flex items-center justify-center transition-colors bg-gray-200 text-gray-700 border-gray-300"
              onClick={() => {
                if (annotationToolRef.current) {
                  annotationToolRef.current.clearAll();
                }
              }}
              disabled={currentMode !== 'draw'}
              title="清空所有笔迹"
              style={{
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                border: '1px solid',
                opacity: currentMode !== 'draw' ? 0.5 : 1,
                transform: showTools ? 'translateX(0)' : 'translateX(-300%)', // 展开时不偏移，收起时向左偏移最多
                transition: 'transform 1s ease-in-out 0.2s', // 再延迟一点开始动画，形成序列效果
                position: 'relative',
                zIndex: 1
              }}
            >
              ❌
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

AnimateGraph.displayName = 'AnimateGraph';

export default AnimateGraph;