// animateGraph.jsx - 图的动画组件
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { drawingTools } from './drawingTools';
import { generateExampleGraph } from './generateExampleGraph';

const AnimateGraph = forwardRef(({
  width = 800,
  height = 600,
  nodes = [],
  edges = [],
  nodesStyle = {},
  edgesStyle = {},
  mode = 'none',
  onInit
}, ref) => {
  // Refs for the three canvas layers
  const refMain = useRef(null);
  const refAnnotation = useRef(null);
  const refIndicator = useRef(null);
  
  // State for drawing annotations
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  // Store the drawing tools instances
  const mainRendererRef = useRef(null);
  const annotationRendererRef = useRef(null);
  const indicatorRendererRef = useRef(null);
  
  // Store annotations data
  const annotationsRef = useRef([]);
  
  // Store indicators data
  const indicatorsRef = useRef(new Map());
  
  // 存储之前的节点和边状态，用于变化检测
  const prevNodesRef = useRef([]);
  const prevEdgesRef = useRef([]);
  const prevNodesStyleRef = useRef({});
  const prevEdgesStyleRef = useRef({});
  
  // Resize canvas to support high DPI displays
  const resizeCanvas = (canvas, w, h) => {
    const dpr = window.devicePixelRatio || 1;
    
    // Set CSS size
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    
    // Set actual size (accounting for device pixel ratio)
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    
    // Scale context
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    return ctx;
  };
  
  // Initialize the renderers
  useEffect(() => {
    const mainCanvas = refMain.current;
    const annotationCanvas = refAnnotation.current;
    const indicatorCanvas = refIndicator.current;
    
    if (!mainCanvas || !annotationCanvas || !indicatorCanvas) return;
    
    // Resize all canvases
    const mainCtx = resizeCanvas(mainCanvas, width, height);
    const annotationCtx = resizeCanvas(annotationCanvas, width, height);
    const indicatorCtx = resizeCanvas(indicatorCanvas, width, height);
    
    // Initialize renderers
    mainRendererRef.current = new drawingTools.CanvasRenderer(mainCtx, width, height);
    annotationRendererRef.current = new drawingTools.CanvasRenderer(annotationCtx, width, height);
    indicatorRendererRef.current = new drawingTools.CanvasRenderer(indicatorCtx, width, height);
    
    // 初始化GraphRenderer用于动画控制
    const graphRenderer = new drawingTools.GraphRenderer(mainCanvas, {
      width,
      height
    });
    
    // 存储GraphRenderer实例
    const rendererKey = Symbol('graphRenderer');
    mainCanvas[rendererKey] = graphRenderer;
    
    // 初始渲染
    renderGraph();
    
    // 记录初始状态
    if (graphRenderer) {
      graphRenderer.nodes = nodes;
      graphRenderer.edges = edges;
      graphRenderer.recordCurrentState();
    }
    
    // Setup the controller interface
    const controller = getController();
    
    // Call the onInit callback with the controller
    if (typeof onInit === 'function') {
      onInit(controller);
    }
    
    // Cleanup function
    return () => {
      // Stop any animations
      if (mainRendererRef.current) {
        mainRendererRef.current.clearAnimations();
      }
    };
  }, [width, height]);
  
  // 当nodes、edges、nodesStyle、edgesStyle发生变化时，检测变化并应用相应的动画
  useEffect(() => {
    const graphRenderer = refMain.current?.[Symbol('graphRenderer')];
    if (!graphRenderer) return;
    
    // 更新图数据
    graphRenderer.nodes = nodes;
    graphRenderer.edges = edges;
    
    // 获取之前的状态
    const prevNodes = prevNodesRef.current;
    const prevEdges = prevEdgesRef.current;
    const prevNStyle = prevNodesStyleRef.current;
    const prevEStyle = prevEdgesStyleRef.current;
    
    // 检测节点变化
    const currentNodeIds = new Set(nodes.map(n => n.id));
    const prevNodeIds = new Set(prevNodes.map(n => n.id));
    
    // 新节点 - 应用出现动画
    const newNodeIds = [...currentNodeIds].filter(id => !prevNodeIds.has(id));
    newNodeIds.forEach(id => {
      const node = nodes.find(n => n.id === id);
      if (node) {
        graphRenderer.animateNodeAppearance(id, { ...node });
      }
    });
    
    // 删除节点 - 应用消失动画
    const removedNodeIds = [...prevNodeIds].filter(id => !currentNodeIds.has(id));
    removedNodeIds.forEach(id => {
      const prevNode = prevNodes.find(n => n.id === id);
      if (prevNode) {
        // 临时添加回节点以便执行消失动画
        graphRenderer.nodes.push(prevNode);
        graphRenderer.animateNodeDisappearance(id, 500, 'easeInQuad', () => {
          // 动画完成后从节点数组中移除
          graphRenderer.nodes = graphRenderer.nodes.filter(n => n.id !== id);
        });
      }
    });
    
    // 已存在节点 - 检查属性变化
    const existingNodeIds = [...currentNodeIds].filter(id => prevNodeIds.has(id));
    existingNodeIds.forEach(id => {
      const currentNode = nodes.find(n => n.id === id);
      const prevNode = prevNodes.find(n => n.id === id);
      
      if (currentNode && prevNode) {
        // 检查位置、大小、样式等属性是否发生变化
        const hasChanged = 
          currentNode.x !== prevNode.x ||
          currentNode.y !== prevNode.y ||
          currentNode.size !== prevNode.size ||
          JSON.stringify(currentNode.style) !== JSON.stringify(prevNode.style);
          
        // 检查全局节点样式是否发生变化
        const styleHasChanged = JSON.stringify(nodesStyle) !== JSON.stringify(prevNStyle);
        
        if (hasChanged || styleHasChanged) {
          // 应用变化动画
          const targetProps = { ...currentNode };
          if (currentNode.style) {
            targetProps.fill = currentNode.style.fill;
            targetProps.stroke = currentNode.style.stroke;
          }
          graphRenderer.animateNodeChange(id, targetProps);
        }
      }
    });
    
    // 检测边变化
    const currentEdgeIds = new Set(edges.map(e => e.id));
    const prevEdgeIds = new Set(prevEdges.map(e => e.id));
    
    // 新边 - 应用出现动画
    const newEdgeIds = [...currentEdgeIds].filter(id => !prevEdgeIds.has(id));
    newEdgeIds.forEach(id => {
      const edge = edges.find(e => e.id === id);
      if (edge) {
        graphRenderer.animateEdgeAppearance(id, { ...edge });
      }
    });
    
    // 删除边 - 应用消失动画
    const removedEdgeIds = [...prevEdgeIds].filter(id => !currentEdgeIds.has(id));
    removedEdgeIds.forEach(id => {
      const prevEdge = prevEdges.find(e => e.id === id);
      if (prevEdge) {
        // 临时添加回边以便执行消失动画
        graphRenderer.edges.push(prevEdge);
        graphRenderer.animateEdgeDisappearance(id, 500, 'easeInQuad', () => {
          // 动画完成后从边数组中移除
          graphRenderer.edges = graphRenderer.edges.filter(e => e.id !== id);
        });
      }
    });
    
    // 已存在边 - 检查属性变化
    const existingEdgeIds = [...currentEdgeIds].filter(id => prevEdgeIds.has(id));
    existingEdgeIds.forEach(id => {
      const currentEdge = edges.find(e => e.id === id);
      const prevEdge = prevEdges.find(e => e.id === id);
      
      if (currentEdge && prevEdge) {
        // 检查源节点、目标节点、样式等属性是否发生变化
        const hasChanged = 
          currentEdge.source !== prevEdge.source ||
          currentEdge.target !== prevEdge.target ||
          JSON.stringify(currentEdge.style) !== JSON.stringify(prevEdge.style);
          
        // 检查连接的节点位置是否变化
        const sourceNodeChanged = existingNodeIds.includes(currentEdge.source) &&
          nodes.find(n => n.id === currentEdge.source) &&
          prevNodes.find(n => n.id === currentEdge.source) &&
          (nodes.find(n => n.id === currentEdge.source).x !== prevNodes.find(n => n.id === currentEdge.source).x ||
           nodes.find(n => n.id === currentEdge.source).y !== prevNodes.find(n => n.id === currentEdge.source).y);
          
        const targetNodeChanged = existingNodeIds.includes(currentEdge.target) &&
          nodes.find(n => n.id === currentEdge.target) &&
          prevNodes.find(n => n.id === currentEdge.target) &&
          (nodes.find(n => n.id === currentEdge.target).x !== prevNodes.find(n => n.id === currentEdge.target).x ||
           nodes.find(n => n.id === currentEdge.target).y !== prevNodes.find(n => n.id === currentEdge.target).y);
          
        // 检查全局边样式是否发生变化
        const styleHasChanged = JSON.stringify(edgesStyle) !== JSON.stringify(prevEStyle);
        
        if (hasChanged || sourceNodeChanged || targetNodeChanged || styleHasChanged) {
          // 获取源节点和目标节点的位置
          const sourceNode = nodes.find(n => n.id === currentEdge.source);
          const targetNode = nodes.find(n => n.id === currentEdge.target);
          
          if (sourceNode && targetNode) {
            // 应用变化动画
            const targetProps = {
              sourceX: sourceNode.x,
              sourceY: sourceNode.y,
              targetX: targetNode.x,
              targetY: targetNode.y
            };
            
            if (currentEdge.style) {
              targetProps.stroke = currentEdge.style.stroke;
              targetProps.lineWidth = currentEdge.style.lineWidth;
            }
            
            graphRenderer.animateEdgeChange(id, targetProps);
          }
        }
      }
    });
    
    // 更新之前的状态引用
    prevNodesRef.current = [...nodes];
    prevEdgesRef.current = [...edges];
    prevNodesStyleRef.current = { ...nodesStyle };
    prevEdgesStyleRef.current = { ...edgesStyle };
    
  }, [nodes, edges, nodesStyle, edgesStyle]);
  
  // Render the graph on the main canvas - 仅用于重新画整张图
  const renderGraph = () => {
    const renderer = mainRendererRef.current;
    if (!renderer) return;
    
    // Clear the canvas
    renderer.clear();
    
    // Set default styles
    const defaultNodeStyle = { ...nodesStyle };
    const defaultEdgeStyle = { ...edgesStyle };
    
    // Draw edges first
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const edgeStyle = { ...defaultEdgeStyle, ...edge.style };
        
        if (edgeStyle.arrow) {
          renderer.drawArrow(
            sourceNode.x, sourceNode.y, 
            targetNode.x, targetNode.y, 
            edgeStyle
          );
        } else {
          renderer.drawLine(
            sourceNode.x, sourceNode.y, 
            targetNode.x, targetNode.y, 
            edgeStyle
          );
        }
      }
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const nodeStyle = { ...defaultNodeStyle, ...node.style };
      
      if (node.type === 'circle' || !node.type) {
        renderer.drawCircle(node.x, node.y, node.size || 20, nodeStyle);
      } else if (node.type === 'square') {
        const size = node.size || 20;
        renderer.drawRect(node.x - size, node.y - size, size * 2, size * 2, {
          ...nodeStyle,
          radius: nodeStyle.radius || 0
        });
      }
      
      // Draw label if present
      if (node.label) {
        renderer.drawText(node.label, node.x, node.y, {
          fill: nodeStyle.labelFill || '#ffffff',
          fontSize: nodeStyle.labelFontSize || 14,
          textAlign: 'center',
          textBaseline: 'middle'
        });
      }
    });
  };
  
  // Handle mouse down for annotation
  const handleAnnotationMouseDown = (e) => {
    if (mode === 'none') return;
    
    setIsDrawing(true);
    const rect = refAnnotation.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLastMousePos({ x, y });
  };
  
  // Handle mouse move for annotation
  const handleAnnotationMouseMove = (e) => {
    if (!isDrawing || mode === 'none') return;
    
    const rect = refAnnotation.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = refAnnotation.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(lastMousePos.x, lastMousePos.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#ff5722';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    setLastMousePos({ x, y });
    
    // Store the annotation path for future reference
    annotationsRef.current.push({
      from: { ...lastMousePos },
      to: { x, y }
    });
  };
  
  // Handle mouse up for annotation
  const handleAnnotationMouseUp = () => {
    setIsDrawing(false);
  };
  
  // Handle mouse leave for annotation
  const handleAnnotationMouseLeave = () => {
    setIsDrawing(false);
  };
  
  // 控制器接口函数
  const getController = () => ({
    setSize: (w, h) => {
      // Resize the canvas and redraw
      if (refMain.current && refAnnotation.current && refIndicator.current) {
        resizeCanvas(refMain.current, w, h);
        resizeCanvas(refAnnotation.current, w, h);
        resizeCanvas(refIndicator.current, w, h);
        renderGraph();
      }
    },
    
    setNodes: (newNodes) => {
      // 节点更新由外部props变化触发动画
      // 这里可以添加额外的控制逻辑
    },
    
    setEdges: (newEdges) => {
      // 边更新由外部props变化触发动画
      // 这里可以添加额外的控制逻辑
    },
    
    updateNode: (nodeId, updates) => {
      // 找到节点并更新
      const nodeIndex = nodes.findIndex(n => n.id === nodeId);
      if (nodeIndex !== -1) {
        const updatedNodes = [...nodes];
        updatedNodes[nodeIndex] = { ...updatedNodes[nodeIndex], ...updates };
        // 这里应该由父组件更新props
      }
    },
    
    updateEdge: (edgeId, updates) => {
      // 找到边并更新
      const edgeIndex = edges.findIndex(e => e.id === edgeId);
      if (edgeIndex !== -1) {
        const updatedEdges = [...edges];
        updatedEdges[edgeIndex] = { ...updatedEdges[edgeIndex], ...updates };
        // 这里应该由父组件更新props
      }
    },
    
    addNode: (node) => {
      // 添加新节点，由父组件更新props
    },
    
    addEdge: (source, target, properties = {}) => {
      // 添加新边，由父组件更新props
    },
    
    setNodesStyle: (style) => {
      // 设置所有节点的样式，由父组件更新props
    },
    
    setEdgesStyle: (style) => {
      // 设置所有边的样式，由父组件更新props
    },
    
    clearAnnotations: () => {
      // 清除所有注释
      const ctx = refAnnotation.current.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      annotationsRef.current = [];
    },
    
    clearIndicators: () => {
      // 清除所有指示器
      const ctx = refIndicator.current.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      indicatorsRef.current.clear();
    },
    
    addIndicator: (type, position, properties = {}) => {
      // 添加指示器
      const ctx = refIndicator.current.getContext('2d');
      const indicatorId = Date.now().toString();
      
      // 绘制指示器
      if (type === 'highlight') {
        ctx.beginPath();
        ctx.arc(position.x, position.y, properties.radius || 30, 0, Math.PI * 2);
        ctx.strokeStyle = properties.color || '#ffeb3b';
        ctx.lineWidth = properties.lineWidth || 3;
        ctx.stroke();
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
  
  // 暴露控制器给父组件
  useImperativeHandle(ref, () => getController());
  
  return (
    <div className="relative w-full h-full">
      {/* 主图层 - 绘制图的主要内容 */}
      <canvas
        ref={refMain}
        className="absolute top-0 left-0 w-full h-full"
      />
      
      {/* 注释图层 - 用于用户手绘注释 */}
      <canvas
        ref={refAnnotation}
        className="absolute top-0 left-0 w-full h-full cursor-crosshair"
        onMouseDown={handleAnnotationMouseDown}
        onMouseMove={handleAnnotationMouseMove}
        onMouseUp={handleAnnotationMouseUp}
        onMouseLeave={handleAnnotationMouseLeave}
      />
      
      {/* 指示器图层 - 用于高亮、焦点等临时指示 */}
      <canvas
        ref={refIndicator}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
});

AnimateGraph.displayName = 'AnimateGraph';

export default AnimateGraph;