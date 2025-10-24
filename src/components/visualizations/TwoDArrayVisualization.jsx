import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import GraphCanvas from '../animation/GraphCanvas.jsx';

const TwoDArrayVisualization = forwardRef(({ width, height, rows, cols }, ref) => {
  const graphCanvasRef = useRef(null);
  const arrayData = useRef([]);
  const cellHeight = height / rows;
  const cellWidth = width / cols;
  
  // 初始化二维数组数据
  useEffect(() => {
    // 初始化空二维数组
    arrayData.current = Array(rows).fill(null).map(() => Array(cols).fill(null));
    
    // 确保在组件加载时清除任何现有内容
    if (graphCanvasRef.current) {
      clearMatrix();
    }
  }, [rows, cols]);

  // 设置二维数组元素
  const setElement = (row, col, value) => {
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      const wasPresent = arrayData.current[row][col] !== null && arrayData.current[row][col] !== undefined;
      arrayData.current[row][col] = value;
      
      // 如果节点已存在则更新，否则添加新节点
      if (graphCanvasRef.current) {
        const nodeId = `element-${row}-${col}`;
        
        // 确定单元格的样式（根据值来设置颜色）
        let fillColor = '#ffffff';
        let strokeColor = '#cccccc';
        
        if (value === 1) {
          fillColor = '#e3f2fd'; // 蓝色背景表示有边
          strokeColor = '#2196f3';
        } else if (value === 0) {
          fillColor = '#ffffff'; // 白色背景表示无边
          strokeColor = '#cccccc';
        }
        
        // 检查节点是否已经存在
        if (wasPresent) {
          graphCanvasRef.current.dispatchOperation('updateNode', {
            id: nodeId,
            style: {
              fill: fillColor,
              stroke: strokeColor,
              strokeWidth: 2
            },
            label: String(value)
          });
        } else {
          graphCanvasRef.current.dispatchOperation('addNode', {
            id: nodeId,
            x: col * cellWidth + cellWidth / 2,
          y: row * cellHeight + cellHeight / 2,
          size: Math.min(cellWidth, cellHeight) * 0.8,
            type: 'square',
            style: {
              fill: fillColor,
              stroke: strokeColor,
              strokeWidth: 2
            },
            label: String(value)
          });
        }
      }
    }
  };

  // 从二维数组数据中加载整个矩阵
  const loadMatrix = (matrix) => {
    console.log('Loading matrix data:', matrix);
    if (graphCanvasRef.current && matrix && matrix.length === rows && matrix[0].length === cols) {
      // 先清除当前内容
      clearMatrix();
      
      // 加载新的矩阵数据
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          setElement(i, j, matrix[i][j]);
        }
      }
    } else {
      console.error('Matrix data invalid or canvas ref not available:', { matrix, rows, cols, canvasRefAvailable: !!graphCanvasRef.current });
    }
  };

  // 高亮某个单元格
  const highlightCell = (row, col, color = '#FFD700') => {
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      if (graphCanvasRef.current) {
        const nodeId = `highlight-${row}-${col}`;
        const centerX = col * cellWidth + cellWidth / 2;
        const centerY = row * cellHeight + cellHeight / 2;
        
        graphCanvasRef.current.dispatchOperation('addIndicator', {
          id: nodeId,
          type: 'highlight',
          position: { 
            x: centerX,
            y: centerY
          },
          radius: Math.min(cellWidth, cellHeight) / 2,
          color: color
        });
      }
    }
  };

  // 移除单元格高亮
  const removeHighlight = (row, col) => {
    if (graphCanvasRef.current) {
      const nodeId = `highlight-${row}-${col}`;
      graphCanvasRef.current.dispatchOperation('removeIndicator', nodeId);
    }
  };

  // 清除所有高亮
  const clearAllHighlights = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.dispatchOperation('clearIndicators');
    }
  };

  // 清空矩阵
  const clearMatrix = () => {
    // 将矩阵中所有元素设置为 null
    for (let i = 0; i < rows; i++) {
      arrayData.current[i].fill(null);
    }
    
    // 删除所有节点并清除指示器
    if (graphCanvasRef.current) {
      // 清除所有指示器
      graphCanvasRef.current.dispatchOperation('clearIndicators');
      
      // 删除每个矩阵元素对应的节点
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const nodeId = `element-${i}-${j}`;
          // 尝试删除节点（如果存在）
          try {
            graphCanvasRef.current.dispatchOperation('deleteNode', nodeId);
          } catch (error) {
            // 如果节点不存在，忽略错误
            continue;
          }
        }
      }
    }
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    setElement,
    loadMatrix,
    highlightCell,
    removeHighlight,
    clearAllHighlights,
    clearMatrix
  }));

  return (
    <div className="relative">
      <GraphCanvas
        ref={graphCanvasRef}
        width={width}
        height={height}
        isLoading={false}
        enableDrawing={false}
      />
      {/* 行标签 */}
      <div className="absolute left-0 top-0 h-full pointer-events-none">
        {Array.from({ length: rows }, (_, i) => (
          <div 
            key={`row-label-${i}`} 
            className="text-xs font-medium text-gray-600" 
            style={{
              position: 'absolute',
              left: '0',
              top: `${i * cellHeight + cellHeight / 2}px`,
              transform: 'translate(-100%, -50%)',
              width: '25px',
              textAlign: 'right',
              paddingRight: '5px'
            }}
          >
            {i}
          </div>
        ))}
      </div>
      {/* 列标签 */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        {Array.from({ length: cols }, (_, i) => (
          <div 
            key={`col-label-${i}`} 
            className="text-xs font-medium text-gray-600" 
            style={{
              position: 'absolute',
              top: '0',
              left: `${i * cellWidth + cellWidth / 2}px`,
              transform: 'translate(-50%, 0)',
              width: '20px',
              textAlign: 'center'
            }}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
});

TwoDArrayVisualization.displayName = 'TwoDArrayVisualization';

export default TwoDArrayVisualization;