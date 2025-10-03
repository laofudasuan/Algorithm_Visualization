import React, { useState, useRef } from 'react';
import GraphCanvas from '../components/animation/GraphCanvas';
import '../index.css';

function GraphVisualizationTools() {
  const [nodeSize, setNodeSize] = useState(20); // 默认节点大小为20
  const graphCanvasRef = useRef(null);

  // 当节点大小变化时，更新图中节点样式
  const handleNodeSizeChange = (size) => {
    setNodeSize(size);
    
    // 如果GraphCanvas实例存在，则调用其modifyCurrentGraph方法更新节点大小
    if (graphCanvasRef.current) {
      graphCanvasRef.current.modifyCurrentGraph({
        nodesStyle: {
          radius: size
        }
      });
    }
  };

  // 保存GraphCanvas实例引用
  const handleCanvasRef = (canvasInstance) => {
    if (canvasInstance) {
      graphCanvasRef.current = canvasInstance;
      
      // 初始化节点大小
      canvasInstance.modifyCurrentGraph({
        nodesStyle: {
          radius: nodeSize
        }
      });
    }
  };

  return (
    <div>
      {/* 控制面板 */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 1001, 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #ddd'
      }}>
        <h3>节点设置</h3>
        <div>
          <label>
            节点大小: {nodeSize}px
            <input 
              type="range" 
              min="10" 
              max="50" 
              value={nodeSize} 
              onChange={(e) => handleNodeSizeChange(Number(e.target.value))}
              style={{ display: 'block', width: '200px', marginTop: '5px' }}
            />
          </label>
        </div>
      </div>

      {/* 使用GraphCanvas组件，不再直接传递nodes、edges和options */}
      <GraphCanvas 
        ref={handleCanvasRef}
        width={1000} 
        height={600} 
        graphCount={1} // 只显示一个图
      />
    </div>
  );
}

export default GraphVisualizationTools;