// animateGraph.jsx - 图的动画组件
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { drawingTools } from './drawingTools';

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
  
  // 存储当前节点和边状态
  const currentNodesRef = useRef([]);
  const currentEdgesRef = useRef([]);
  const currentNodesStyleRef = useRef({});
  const currentEdgesStyleRef = useRef({});
  
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
  
  // Render the graph on the main canvas - 仅用于重新画整张图
  const renderGraph = () => {
    const renderer = mainRendererRef.current;
    if (!renderer) return;
    
    // Clear the canvas
    renderer.clear();
    
    // Set default styles
    const defaultNodeStyle = { ...currentNodesStyleRef.current };
    const defaultEdgeStyle = { ...currentEdgesStyleRef.current };
    
    // Draw edges first
    currentEdgesRef.current.forEach(edge => {
      const sourceNode = currentNodesRef.current.find(n => n.id === edge.source);
      const targetNode = currentNodesRef.current.find(n => n.id === edge.target);
      
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
    currentNodesRef.current.forEach(node => {
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
      // 更新节点
      currentNodesRef.current = [...newNodes];
      
      // 获取GraphRenderer实例
      const graphRenderer = refMain.current?.[Symbol('graphRenderer')];
      if (graphRenderer) {
        graphRenderer.nodes = newNodes;
        graphRenderer.recordCurrentState();
      }
      
      // 重新渲染
      renderGraph();
    },
    
    setEdges: (newEdges) => {
      // 更新边
      currentEdgesRef.current = [...newEdges];
      
      // 获取GraphRenderer实例
      const graphRenderer = refMain.current?.[Symbol('graphRenderer')];
      if (graphRenderer) {
        graphRenderer.edges = newEdges;
        graphRenderer.recordCurrentState();
      }
      
      // 重新渲染
      renderGraph();
    },
    
    setNodesStyle: (style) => {
      // 更新节点样式
      currentNodesStyleRef.current = { ...style };
      
      // 重新渲染
      renderGraph();
    },
    
    setEdgesStyle: (style) => {
      // 更新边样式
      currentEdgesStyleRef.current = { ...style };
      
      // 重新渲染
      renderGraph();
    },
    
    updateNode: (nodeId, updates) => {
      // 找到节点并更新
      const nodeIndex = currentNodesRef.current.findIndex(n => n.id === nodeId);
      if (nodeIndex !== -1) {
        currentNodesRef.current[nodeIndex] = { ...currentNodesRef.current[nodeIndex], ...updates };
        
        // 获取GraphRenderer实例
        const graphRenderer = refMain.current?.[Symbol('graphRenderer')];
        if (graphRenderer) {
          graphRenderer.nodes = currentNodesRef.current;
          graphRenderer.recordCurrentState();
        }
        
        // 重新渲染
        renderGraph();
      }
    },
    
    updateEdge: (edgeId, updates) => {
      // 找到边并更新
      const edgeIndex = currentEdgesRef.current.findIndex(e => e.id === edgeId);
      if (edgeIndex !== -1) {
        currentEdgesRef.current[edgeIndex] = { ...currentEdgesRef.current[edgeIndex], ...updates };
        
        // 获取GraphRenderer实例
        const graphRenderer = refMain.current?.[Symbol('graphRenderer')];
        if (graphRenderer) {
          graphRenderer.edges = currentEdgesRef.current;
          graphRenderer.recordCurrentState();
        }
        
        // 重新渲染
        renderGraph();
      }
    },
    
    addNode: (node) => {
      // 添加新节点
      currentNodesRef.current.push(node);
      
      // 获取GraphRenderer实例
      const graphRenderer = refMain.current?.[Symbol('graphRenderer')];
      if (graphRenderer) {
        graphRenderer.nodes = currentNodesRef.current;
        graphRenderer.recordCurrentState();
      }
      
      // 重新渲染
      renderGraph();
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
      const graphRenderer = refMain.current?.[Symbol('graphRenderer')];
      if (graphRenderer) {
        graphRenderer.edges = currentEdgesRef.current;
        graphRenderer.recordCurrentState();
      }
      
      // 重新渲染
      renderGraph();
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