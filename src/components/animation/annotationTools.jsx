import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import * as fabric from 'fabric';

const AnnotationTool = forwardRef((props, ref) => {
  const {
    width = 800,
    height = 600,
    visible = false,
    onClear,
    style
  } = props;

  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(2);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    enableDrawing: () => {
      setIsDrawing(true);
      setIsErasing(false);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.isDrawingMode = true;
        fabricCanvasRef.current.freeDrawingBrush = new fabric.PencilBrush(fabricCanvasRef.current);
        fabricCanvasRef.current.freeDrawingBrush.color = brushColor;
        fabricCanvasRef.current.freeDrawingBrush.width = brushWidth;
        fabricCanvasRef.current.freeDrawingBrush.shadow = new fabric.Shadow({
          blur: 0,
          offsetX: 0,
          offsetY: 0,
          affectStroke: true,
          color: brushColor
        });
      }
    },
    disableDrawing: () => {
      setIsDrawing(false);
      setIsErasing(false);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.isDrawingMode = false;
      }
    },
    enableErasing: () => {
      setIsErasing(true);
      setIsDrawing(false);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.isDrawingMode = true;
        // 使用背景色覆盖作为擦除效果
        const brush = new fabric.PencilBrush(fabricCanvasRef.current);
        // 设置画笔属性用于擦除，使用更大的宽度获得更好的擦除效果
        brush.color = '#ffffff'; // 假设背景是白色
        brush.width = 15; // 使用固定的较大宽度
        brush.opacity = 1;
        fabricCanvasRef.current.freeDrawingBrush = brush;
        // 添加橡皮擦光标视觉提示
        fabricCanvasRef.current.defaultCursor = 'url("data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23666666\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"%3E%3Cpath d=\"M18 13L5 5\"/%3E%3Cpath d=\"M14.5 5L21 11.5\"/%3E%3Cpath d=\"M9 9L3 3\"/%3E%3C/svg%3E") 12 12, auto';
      }
    },
    clearAll: () => {
      if (fabricCanvasRef.current) {
        const objects = fabricCanvasRef.current.getObjects();
        objects.forEach(obj => {
          if (obj.type === 'path') {
            fabricCanvasRef.current.remove(obj);
          }
        });
        fabricCanvasRef.current.renderAll();
        if (onClear) {
          onClear();
        }
      }
    },
    setBrushColor: (color) => {
      setBrushColor(color);
      if (fabricCanvasRef.current && fabricCanvasRef.current.freeDrawingBrush) {
        fabricCanvasRef.current.freeDrawingBrush.color = color;
        if (fabricCanvasRef.current.freeDrawingBrush.shadow) {
          fabricCanvasRef.current.freeDrawingBrush.shadow.color = color;
        }
      }
    },
    setBrushWidth: (width) => {
      setBrushWidth(width);
      if (fabricCanvasRef.current && fabricCanvasRef.current.freeDrawingBrush) {
        fabricCanvasRef.current.freeDrawingBrush.width = width;
      }
    }
  }));

  // 初始化和销毁画布
  useEffect(() => {
    if (!canvasRef.current || !visible) return;

    // 初始化 Fabric 画布
    fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
      width: width,
      height: height,
      selection: false,
      backgroundColor: 'transparent',
      preserveObjectStacking: true
    });

    // 添加路径创建事件监听
    fabricCanvasRef.current.on('path:created', (e) => {
      console.log('Path created:', e.path);
    });

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [visible, width, height]);

  // 当visible变化时，如果不可见，禁用绘图模式
  useEffect(() => {
    if (!visible && fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = false;
      setIsDrawing(false);
      setIsErasing(false);
    }
  }, [visible]);

  return (
    <div 
      className="relative"
      style={{
        width: width,
        height: height,
        display: visible ? 'block' : 'none',
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        style={{
          cursor: isDrawing || isErasing ? 'crosshair' : 'default',
          pointerEvents: visible ? 'auto' : 'none'
        }}
      />
    </div>
  );
});

AnnotationTool.displayName = 'AnnotationTool';

export default AnnotationTool;
