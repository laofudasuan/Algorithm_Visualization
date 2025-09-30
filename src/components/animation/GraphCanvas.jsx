// GraphCanvas.jsx - 整个图可视化系统的核心渲染组件

import React, { useRef, useEffect, useState } from 'react';
import { SVGRenderer } from './drawingTools';
import { animateGraph } from './animateGraph';

function GraphCanvas({ 
  width = 1000, 
  height = 600, 
  nodes = [], 
  edges = [], 
  options = {} 
}) {
  // Canvas引用
  const refMain = useRef(null);
  const refAnnotation = useRef(null);
  const refIndicator = useRef(null);
  
  // 状态
  const [drawingMode, setDrawingMode] = useState('node'); // 'node', 'brush', 'eraser'
  const [isExpanded, setIsExpanded] = useState(false);
  const [graphController, setGraphController] = useState(null);
  
  // 获取设备像素比
  const getDevicePixelRatio = () => {
    return window.devicePixelRatio || 1;
  };
  
  // 调整Canvas大小以支持高分辨率
  const resizeCanvas = (canvas, width, height) => {
    const dpr = getDevicePixelRatio();
    
    // 设置CSS大小
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // 设置实际大小（考虑设备像素比）
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // 获取绘图上下文并缩放
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  };
  
  // 初始化Canvas
  // 初始化canvas和控制器（只在组件挂载时执行一次）
  useEffect(() => {
    const mainCanvas = refMain.current;
    const annotationCanvas = refAnnotation.current;
    const indicatorCanvas = refIndicator.current;
    
    if (!mainCanvas || !annotationCanvas || !indicatorCanvas) return;
    
    // 初始化动画控制器
    const controller = animateGraph(mainCanvas, {
      nodes: nodes.map(node => ({ ...node, size: options.nodeSize || 20 })),
      edges: edges,
      physicalParameters: options.physicalParameters || {},
      ...options
    });
    
    setGraphController(controller);
    
    // 清理函数
    return () => {
      if (controller) {
        controller.stop();
      }
    };
  }, []); // 空依赖数组，只在组件挂载时执行
  
  // 处理尺寸变化（width, height, isExpanded）
  useEffect(() => {
    const mainCanvas = refMain.current;
    const annotationCanvas = refAnnotation.current;
    const indicatorCanvas = refIndicator.current;
    
    if (!mainCanvas || !annotationCanvas || !indicatorCanvas) return;
    
    // 调整Canvas大小
    const currentWidth = isExpanded ? window.innerWidth - 40 : width;
    const currentHeight = isExpanded ? window.innerHeight - 40 : height;
    
    resizeCanvas(mainCanvas, currentWidth, currentHeight);
    resizeCanvas(annotationCanvas, currentWidth, currentHeight);
    resizeCanvas(indicatorCanvas, currentWidth, currentHeight);
    
    // 如果控制器已初始化，重新渲染
    if (graphController) {
      graphController.render();
    }
  }, [width, height, isExpanded, graphController]);
  
  // 处理数据更新（nodes, edges, options）
  useEffect(() => {
    // 当节点、边或选项发生变化时的处理逻辑
    // 注意：这里可能需要实现graphController的update方法来更新数据
    // 如果graphController没有提供更新方法，可以考虑添加这个功能
  }, [nodes, edges, options, graphController]);
  
  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (!isExpanded) return;
      
      const mainCanvas = refMain.current;
      const annotationCanvas = refAnnotation.current;
      const indicatorCanvas = refIndicator.current;
      
      if (!mainCanvas || !annotationCanvas || !indicatorCanvas) return;
      
      const newWidth = window.innerWidth - 40;
      const newHeight = window.innerHeight - 40;
      
      resizeCanvas(mainCanvas, newWidth, newHeight);
      resizeCanvas(annotationCanvas, newWidth, newHeight);
      resizeCanvas(indicatorCanvas, newWidth, newHeight);
      
      // 如果有控制器，重新渲染
      if (graphController) {
        graphController.render();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isExpanded, graphController]);
  
  // 清除注释
  const clearAnnotations = () => {
    const annotationCanvas = refAnnotation.current;
    if (!annotationCanvas) return;
    
    const ctx = annotationCanvas.getContext('2d');
    const dpr = getDevicePixelRatio();
    ctx.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);
  };
  
  // 导出为PNG
  const exportAsPNG = () => {
    const mainCanvas = refMain.current;
    if (!mainCanvas) return;
    
    // 创建一个临时Canvas来合并所有图层
    const tempCanvas = document.createElement('canvas');
    const currentWidth = isExpanded ? window.innerWidth - 40 : width;
    const currentHeight = isExpanded ? window.innerHeight - 40 : height;
    
    const dpr = getDevicePixelRatio();
    tempCanvas.width = currentWidth * dpr;
    tempCanvas.height = currentHeight * dpr;
    
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.scale(dpr, dpr);
    
    // 绘制主画布
    tempCtx.drawImage(mainCanvas, 0, 0);
    
    // 绘制注释画布
    const annotationCanvas = refAnnotation.current;
    if (annotationCanvas) {
      tempCtx.drawImage(annotationCanvas, 0, 0);
    }
    
    // 绘制指示器画布
    const indicatorCanvas = refIndicator.current;
    if (indicatorCanvas) {
      tempCtx.drawImage(indicatorCanvas, 0, 0);
    }
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = 'graph-visualization.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };
  
  // 导出为SVG
  const exportAsSVG = () => {
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const currentWidth = isExpanded ? window.innerWidth - 40 : width;
    const currentHeight = isExpanded ? window.innerHeight - 40 : height;
    
    svg.setAttribute('width', currentWidth);
    svg.setAttribute('height', currentHeight);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // 创建样式
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      .node circle {
        fill: #3f51b5;
        stroke: #ffffff;
        stroke-width: 2;
      }
      .node rect {
        fill: #ff4081;
        stroke: #ffffff;
        stroke-width: 2;
        rx: 5;
        ry: 5;
      }
      .node text {
        fill: #ffffff;
        font-size: 14px;
        font-weight: bold;
        text-anchor: middle;
        dominant-baseline: middle;
      }
      .edge {
        stroke: #999999;
        stroke-width: 2;
      }
    `;
    svg.appendChild(style);
    
    // 创建defs用于嵌入字体
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // 尝试嵌入默认字体（这只是一个示例，实际应用中可能需要更复杂的字体处理）
    const fontFace = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    fontFace.setAttribute('type', 'text/css');
    fontFace.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Arial&display=swap');
      text { font-family: 'Arial', sans-serif; }
    `;
    defs.appendChild(fontFace);
    svg.appendChild(defs);
    
    // 使用SVGRenderer绘制图形
    const renderer = new SVGRenderer(svg);
    
    // 绘制背景
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', '#f8f8f8');
    svg.appendChild(background);
    
    // 绘制边
    edges.forEach((edge, index) => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      
      if (sourceNode && targetNode) {
        renderer.drawLine(null, sourceNode.x, sourceNode.y, targetNode.x, targetNode.y, {
          stroke: '#999999',
          strokeWidth: 2
        });
      }
    });
    
    // 绘制节点
    nodes.forEach(node => {
      const nodeSize = options.nodeSize || 20;
      
      if (node.type === 'circle') {
        renderer.drawCircle(null, node.x, node.y, nodeSize, {
          fill: '#3f51b5',
          stroke: '#ffffff',
          strokeWidth: 2
        });
      } else if (node.type === 'square') {
        renderer.drawRect(null, node.x - nodeSize, node.y - nodeSize, nodeSize * 2, nodeSize * 2, {
          fill: '#ff4081',
          stroke: '#ffffff',
          strokeWidth: 2,
          radius: 5
        });
      }
      
      // 绘制标签
      if (node.label) {
        renderer.drawText(null, node.label, node.x, node.y, {
          fill: '#ffffff',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'middle',
          textBaseline: 'middle'
        });
      }
    });
    
    // 创建下载链接
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = 'graph-visualization.svg';
    link.href = url;
    link.click();
    
    // 释放URL对象
    URL.revokeObjectURL(url);
  };
  
  // 处理鼠标点击
  const handleCanvasClick = (event) => {
    const canvas = refMain.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 根据绘图模式执行不同操作
    switch (drawingMode) {
      case 'node':
        // 添加节点的逻辑（这里需要与graphController交互）
        if (graphController) {
          const newNode = {
            id: Date.now(),
            x: x,
            y: y,
            type: Math.random() > 0.5 ? 'circle' : 'square',
            label: String.fromCharCode(65 + (nodes.length % 26)),
            size: options.nodeSize || 20
          };
          graphController.addNode(newNode);
        }
        break;
      case 'brush':
        // 绘制注释的逻辑
        const annotationCtx = refAnnotation.current?.getContext('2d');
        if (annotationCtx) {
          annotationCtx.beginPath();
          annotationCtx.arc(x, y, 5, 0, 2 * Math.PI);
          annotationCtx.fillStyle = '#ff5722';
          annotationCtx.fill();
        }
        break;
      case 'eraser':
        // 擦除注释的逻辑
        const eraserCtx = refAnnotation.current?.getContext('2d');
        if (eraserCtx) {
          eraserCtx.clearRect(x - 10, y - 10, 20, 20);
        }
        break;
    }
  };
  
  // 切换展开/收缩
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div style={{
      position: 'relative',
      width: isExpanded ? '100%' : `${width}px`,
      height: isExpanded ? '100vh' : `${height}px`,
      margin: '0 auto'
    }}>
      {/* Canvas层 */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* 主画布 */}
        <canvas
          ref={refMain}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
          }}
          onClick={handleCanvasClick}
        />
        
        {/* 注释画布 */}
        <canvas
          ref={refAnnotation}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2
          }}
        />
        
        {/* 指示器画布 */}
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
      
      {/* 控制工具栏 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '10px 20px',
        borderRadius: '25px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        display: 'flex',
        gap: '15px',
        alignItems: 'center'
      }}>
        {/* 绘图模式切换 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setDrawingMode('node')}
            style={{
              padding: '8px 12px',
              border: drawingMode === 'node' ? '2px solid #3f51b5' : '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: drawingMode === 'node' ? '#3f51b5' : 'white',
              color: drawingMode === 'node' ? 'white' : 'black',
              cursor: 'pointer'
            }}
          >
            添加节点
          </button>
          
          <button
            onClick={() => setDrawingMode('brush')}
            style={{
              padding: '8px 12px',
              border: drawingMode === 'brush' ? '2px solid #ff5722' : '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: drawingMode === 'brush' ? '#ff5722' : 'white',
              color: drawingMode === 'brush' ? 'white' : 'black',
              cursor: 'pointer'
            }}
          >
            画笔
          </button>
          
          <button
            onClick={() => setDrawingMode('eraser')}
            style={{
              padding: '8px 12px',
              border: drawingMode === 'eraser' ? '2px solid #4caf50' : '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: drawingMode === 'eraser' ? '#4caf50' : 'white',
              color: drawingMode === 'eraser' ? 'white' : 'black',
              cursor: 'pointer'
            }}
          >
            橡皮擦
          </button>
        </div>
        
        {/* 清除注释 */}
        <button
          onClick={clearAnnotations}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            color: 'black',
            cursor: 'pointer'
          }}
        >
          清除注释
        </button>
        
        {/* 展开/收缩 */}
        <button
          onClick={toggleExpanded}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            color: 'black',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? '收缩' : '展开'}
        </button>
        
        {/* 导出功能 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={exportAsPNG}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: 'black',
              cursor: 'pointer'
            }}
          >
            导出PNG
          </button>
          
          <button
            onClick={exportAsSVG}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: 'black',
              cursor: 'pointer'
            }}
          >
            导出SVG
          </button>
        </div>
      </div>
    </div>
  );
}

export default GraphCanvas;