import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import GraphCanvas from '../animation/GraphCanvas.jsx';

const ArrayVisualization = forwardRef(({ height, length }, ref) => {
  const graphCanvasRef = useRef(null);
  const width = height * length;
  const arrayData = useRef([]);

  // 初始化数组数据
  useEffect(() => {
    // 初始化空数组
    arrayData.current = new Array(length).fill(null);
  }, [length]);

  // 添加或更新数组元素
  const setElement = (index, value) => {
    if (index >= 0 && index < length) {
      const wasPresent = arrayData.current[index] !== null && arrayData.current[index] !== undefined;
      arrayData.current[index] = value;
      
      // 如果节点已存在则更新，否则添加新节点
      if (graphCanvasRef.current) {
        const nodeId = `element-${index}`;
        
        // 检查节点是否已经存在
        // 如果节点存在，使用updateNode，否则使用addNode
        if (wasPresent) {
          graphCanvasRef.current.dispatchOperation('updateNode', {
            id: nodeId,
            style: {
              fill: '#4CAF50',
              stroke: '#4CAF50',
              strokeWidth: 2
            },
            label: String(value)
          });
        } else {
          graphCanvasRef.current.dispatchOperation('addNode', {
            id: nodeId,
            x: index * height + height / 2,
            y: height / 2,
            size: height,
            type: 'square',
            style: {
              fill: '#4CAF50',
              stroke: '#4CAF50',
              strokeWidth: 2
            },
            label: String(value)
          });
        }
      }
    }
  };

  // 删除数组元素
  const removeElement = (index) => {
    if (index >= 0 && index < length) {
      arrayData.current[index] = null;
      
      if (graphCanvasRef.current) {
        const nodeId = `element-${index}`;
        graphCanvasRef.current.dispatchOperation('deleteNode', nodeId);
      }
    }
  };

  // 高亮某个区域
  const highlightRegion = (id, startIndex, endIndex, color = '#FFD700') => {
    if (startIndex >= 0 && endIndex < length && startIndex <= endIndex) {
      if (graphCanvasRef.current) {
        // 计算高亮区域的中心位置
        const centerX = (startIndex + (endIndex - startIndex) / 2) * height + height / 2;
        const centerY = height / 2;
        
        graphCanvasRef.current.dispatchOperation('addIndicator', {
          id: id,
          type: 'highlight',
          position: { 
            x: centerX,
            y: centerY
          },
          radius: height / 2,
          color: color
        });
      }
    }
  };

  // 取消高亮
  const removeHighlight = (id) => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.dispatchOperation('removeIndicator', id);
    }
  };

  // 清除所有指示器
  const clearAllHighlights = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.dispatchOperation('clearIndicators');
    }
  };

  // 清空数组
  const clearArray = () => {
    // 将数组中所有元素设置为 null
    arrayData.current.fill(null);
    
    // 删除所有节点并清除指示器
    if (graphCanvasRef.current) {
      // 清除所有指示器
      graphCanvasRef.current.dispatchOperation('clearIndicators');
      
      // 调用新添加的clearGraph函数，清空所有节点和边
      graphCanvasRef.current.dispatchOperation('clearGraph');
    }
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    setElement,
    removeElement,
    highlightRegion,
    removeHighlight,
    clearAllHighlights,
    clearArray
  }));

  return (
    <GraphCanvas
      ref={graphCanvasRef}
      width={width}
      height={height}
      isLoading={false}
      enableDrawing = {false}
    />
  );
});

ArrayVisualization.displayName = 'ArrayVisualization';

export default ArrayVisualization;