// annotationTools.jsx - React组件，使用Fabric.js实现绘图注释功能
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import * as fabric from 'fabric';

/**
 * AnnotationTool React组件
 * 使用Fabric.js实现绘图、擦除等注释功能，并包含清除按钮
 */
const AnnotationTool = forwardRef(({
  width = 800,
  height = 600,
  visible = false,
  onClear
}, ref) => {
  // Refs
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  
  // 初始化Fabric.js画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 显式设置canvas元素的width和height属性
    canvas.width = width;
    canvas.height = height;
    
    // 创建Fabric.js画布实例 - 确保使用正确的配置
    const fabricCanvas = new fabric.Canvas(canvas, {
      width: width,
      height: height,
      selection: false,
      preserveObjectStacking: true,
      backgroundColor: 'transparent',
      // 确保触摸和鼠标事件都能正常工作
      enableRetinaScaling: false,
      skipOffscreen: false
    });
    
    // 创建并配置画笔
    const pencilBrush = new fabric.PencilBrush(fabricCanvas);
    pencilBrush.color = '#ff5722';
    pencilBrush.width = 3; // 稍微增加画笔宽度使其更明显
    pencilBrush.shadow = new fabric.Shadow({
      blur: 0,
      offsetX: 0,
      offsetY: 0,
      color: '#ff5722'
    });
    
    // 设置画笔
    fabricCanvas.freeDrawingBrush = pencilBrush;
    
    // 存储Fabric.js画布实例
    fabricCanvasRef.current = fabricCanvas;
    
    // 添加调试日志
    console.log('Fabric.js canvas initialized with width:', width, 'height:', height);
    
    // 清理函数
    return () => {
      fabricCanvas.dispose();
      console.log('Fabric.js canvas disposed');
    };
  }, [width, height]);
  
  // 根据visible属性控制画布显示/隐藏和绘图模式
  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;
    
    if (visible) {
      enableDrawing();
    } else {
      disableDrawing();
    }
  }, [visible]);
  
  // 启用绘图模式
  const enableDrawing = () => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) {
      console.log('Fabric canvas not initialized, cannot enable drawing');
      return;
    }
    
    console.log('Enabling drawing mode');
    setIsDrawingEnabled(true);
    
    // 创建并配置画笔 - 与初始化部分保持一致
    const pencilBrush = new fabric.PencilBrush(fabricCanvas);
    pencilBrush.color = '#ff5722';
    pencilBrush.width = 3;
    pencilBrush.shadow = new fabric.Shadow({
      blur: 0,
      offsetX: 0,
      offsetY: 0,
      color: '#ff5722'
    });
    
    // 设置画笔
    fabricCanvas.freeDrawingBrush = pencilBrush;
    
    // 启用绘图模式
    fabricCanvas.isDrawingMode = true;
    
    // 添加调试事件监听
    const logBrushEvents = () => {
      console.log('Brush event: path created');
    };
    
    // 监听路径创建事件
    fabricCanvas.on('path:created', logBrushEvents);
    
    // 清理函数 - 在disableDrawing中移除监听器
    return () => {
      fabricCanvas.off('path:created', logBrushEvents);
    };
  };
  
  // 禁用绘图/擦除模式
  const disableDrawing = () => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;
    
    setIsDrawingEnabled(false);
    fabricCanvas.isDrawingMode = false;
  };
  
  // 启用擦除模式
  const enableErasing = () => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;
    
    fabricCanvas.isDrawingMode = true;
    const eraserBrush = new fabric.EraserBrush(fabricCanvas);
    eraserBrush.width = 10;
    fabricCanvas.freeDrawingBrush = eraserBrush;
  };
  
  // 清除所有注释
  const clearAll = () => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;
    
    // 获取所有路径对象并移除
    fabricCanvas.getObjects().forEach(obj => {
      if (obj.type === 'path') {
        fabricCanvas.remove(obj);
      }
    });
    
    // 重新渲染画布
    fabricCanvas.renderAll();
    
    // 触发清除回调
    if (typeof onClear === 'function') {
      onClear();
    }
  };
  
  // 设置画笔颜色
  const setBrushColor = (color) => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;
    
    fabricCanvas.freeDrawingBrush.color = color;
  };
  
  // 设置画笔宽度
  const setBrushWidth = (width) => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;
    
    fabricCanvas.freeDrawingBrush.width = width;
  };
  
  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    enableDrawing,
    disableDrawing,
    enableErasing,
    clearAll,
    setBrushColor,
    setBrushWidth
  }));
  
  return (
    <div className="relative w-full h-full">
      {/* 注释画布 */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{
          cursor: isDrawingEnabled ? 'crosshair' : 'default',
          backgroundColor: 'transparent',
          zIndex: 10, // 确保在所有图层之上
          display: visible ? 'block' : 'none',
          pointerEvents: isDrawingEnabled ? 'auto' : 'none' // 确保在绘图模式下能接收鼠标事件
        }}
      />
      
      {/* 清除注释按钮 - 仅在绘图模式下显示 */}
      {visible && (
        <button
          className="fixed bottom-4 right-36 w-10 h-10 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors z-50 flex items-center justify-center"
          onClick={clearAll}
          style={{
            zIndex: 9999,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            border: '1px solid #dc2626',
            fontSize: '18px'
          }}
          title="清除绘图"
        >
          ✖️
        </button>
      )}
    </div>
  );
});

AnnotationTool.displayName = 'AnnotationTool';

export default AnnotationTool;