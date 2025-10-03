// animateGraph.js - 图可视化 + 手绘批注二合一的React容器组件
import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { drawingTools } from './drawingTools';

const AnimateGraph = forwardRef(({ 
  width = 1000, 
  height = 600, 
  nodes = [], 
  edges = [], 
  nodesStyle = {}, 
  edgesStyle = {}, 
  mode = 'all',
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
    
    // Initial rendering with provided nodes and edges
    if (nodes.length > 0 && edges.length > 0) {
      renderGraph();
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
  
  // Update graph when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 && edges.length > 0) {
      renderGraph();
    }
  }, [nodes, edges, nodesStyle, edgesStyle]);
  
  // Render the graph on the main canvas
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
  
  // Handle mouse move for indicators
  const handleMouseMove = (e) => {
    if (mode === 'none') return;
    
    const rect = refIndicator.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Clear indicator canvas
    const ctx = refIndicator.current.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, width * dpr, height * dpr);
    
    // Check if mouse is over a node
    const nodeUnderMouse = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      return distance <= (node.size || 20);
    });
    
    // Draw hover indicator if over a node
    if (nodeUnderMouse) {
      ctx.beginPath();
      ctx.arc(x, y, (nodeUnderMouse.size || 20) + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = '#3f51b5';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };
  
  // Get the controller interface that will be exposed
  const getController = () => ({
    // Main layer modification functions
    setSize: (newWidth, newHeight) => {
      const mainCanvas = refMain.current;
      const annotationCanvas = refAnnotation.current;
      const indicatorCanvas = refIndicator.current;
      
      if (mainCanvas && annotationCanvas && indicatorCanvas) {
        resizeCanvas(mainCanvas, newWidth, newHeight);
        resizeCanvas(annotationCanvas, newWidth, newHeight);
        resizeCanvas(indicatorCanvas, newWidth, newHeight);
        renderGraph();
      }
    },
    
    setNodes: (newNodes) => {
      // This will trigger the useEffect to re-render
      // In a real implementation, you might want to update state here
    },
    
    setEdges: (newEdges) => {
      // This will trigger the useEffect to re-render
      // In a real implementation, you might want to update state here
    },
    
    updateNode: (nodeId, updates) => {
      // Update a specific node
      const nodeIndex = nodes.findIndex(n => n.id === nodeId);
      if (nodeIndex !== -1) {
        // In a real implementation, you would update the state
        // and trigger a re-render
      }
    },
    
    updateEdge: (edgeId, updates) => {
      // Update a specific edge
      const edgeIndex = edges.findIndex(e => e.id === edgeId);
      if (edgeIndex !== -1) {
        // In a real implementation, you would update the state
        // and trigger a re-render
      }
    },
    
    addNode: (node) => {
      // Add a new node
      // In a real implementation, you would update the state
      // and trigger a re-render
    },
    
    addEdge: (source, target, edgeData = {}) => {
      // Add a new edge
      // In a real implementation, you would update the state
      // and trigger a re-render
    },
    
    setNodesStyle: (style) => {
      // Update default node styles
      // In a real implementation, you would update the state
      // and trigger a re-render
    },
    
    setEdgesStyle: (style) => {
      // Update default edge styles
      // In a real implementation, you would update the state
      // and trigger a re-render
    },
    
    applyLayout: (layoutType, options = {}) => {
      // Apply different layout algorithms
      // This would use the layout functions from drawingTools
    },
    
    updateForceLayout: () => {
      // Update force-directed layout
      // This would use the force layout functions from drawingTools
    },
    
    // Annotation layer modification functions
    clearAnnotations: () => {
      const ctx = refAnnotation.current.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, width * dpr, height * dpr);
      annotationsRef.current = [];
    },
    
    // Indicator layer modification functions
    addIndicator: (indicator) => {
      // Add a temporary indicator
      const id = indicator.id || Date.now().toString();
      indicatorsRef.current.set(id, indicator);
      renderIndicators();
    },
    
    removeIndicator: (id) => {
      // Remove a specific indicator
      indicatorsRef.current.delete(id);
      renderIndicators();
    },
    
    clearIndicators: () => {
      // Clear all indicators
      indicatorsRef.current.clear();
      const ctx = refIndicator.current.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, width * dpr, height * dpr);
    },
    
    // Export functions
    exportAsPNG: () => {
      // Implementation to export the combined canvas as PNG
    },
    
    exportAsSVG: () => {
      // Implementation to export as SVG
    }
  });
  
  // Render all indicators
  const renderIndicators = () => {
    const ctx = refIndicator.current.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, width * dpr, height * dpr);
    
    // Draw all indicators
    indicatorsRef.current.forEach(indicator => {
      if (indicator.type === 'circle') {
        ctx.beginPath();
        ctx.arc(indicator.x, indicator.y, indicator.radius, 0, 2 * Math.PI);
        ctx.fillStyle = indicator.fill || 'rgba(63, 81, 181, 0.3)';
        ctx.strokeStyle = indicator.stroke || '#3f51b5';
        ctx.lineWidth = indicator.strokeWidth || 2;
        ctx.fill();
        ctx.stroke();
      } else if (indicator.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(indicator.x1, indicator.y1);
        ctx.lineTo(indicator.x2, indicator.y2);
        ctx.strokeStyle = indicator.stroke || '#3f51b5';
        ctx.lineWidth = indicator.strokeWidth || 2;
        if (indicator.dashed) {
          ctx.setLineDash([5, 5]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (indicator.type === 'text') {
        ctx.font = `${indicator.fontSize || 14}px ${indicator.fontFamily || 'Arial'}`;
        ctx.fillStyle = indicator.fill || '#000000';
        ctx.textAlign = indicator.textAlign || 'center';
        ctx.textBaseline = indicator.textBaseline || 'middle';
        ctx.fillText(indicator.text, indicator.x, indicator.y);
      }
    });
  };
  
  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => getController());
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Main canvas for nodes, edges and layout animations */}
      <canvas
        ref={refMain}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
        onMouseMove={handleMouseMove}
      />
      
      {/* Annotation canvas for freehand drawing and eraser */}
      <canvas
        ref={refAnnotation}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          cursor: mode === 'none' ? 'default' : 'crosshair'
        }}
        onMouseDown={handleAnnotationMouseDown}
        onMouseMove={handleAnnotationMouseMove}
        onMouseUp={handleAnnotationMouseUp}
        onMouseLeave={handleAnnotationMouseLeave}
      />
      
      {/* Indicator canvas for temporary indicators (mouse pointer, hover effects) */}
      <canvas
        ref={refIndicator}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 3
        }}
      />
    </div>
  );
});

AnimateGraph.displayName = 'AnimateGraph';

export default AnimateGraph;