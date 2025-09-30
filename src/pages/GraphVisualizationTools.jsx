import React, { useState } from 'react';
import GraphCanvas from '../components/animation/GraphCanvas';
import '../index.css';

function GraphVisualizationTools() {
  const [nodeSize, setNodeSize] = useState(20); // 默认节点大小为20

  // 定义节点数据
  const nodes = [
    { id: 1, x: 100, y: 80, type: 'circle', label: 'A' },
    { id: 2, x: 250, y: 60, type: 'square', label: 'B' },
    { id: 3, x: 180, y: 180, type: 'circle', label: 'C' },
    { id: 4, x: 320, y: 160, type: 'square', label: 'D' },
    { id: 5, x: 120, y: 250, type: 'circle', label: 'E' },
    { id: 6, x: 280, y: 240, type: 'square', label: 'F' }
  ];

  // 定义边数据
  const edges = [
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 2, target: 4 },
    { source: 3, target: 4 },
    { source: 3, target: 5 },
    { source: 4, target: 6 },
    { source: 5, target: 6 }
  ];

  // 图选项
  const graphOptions = {
    nodeSize: nodeSize,
    physicalParameters: {
      charge: -1000,
      linkDistance: 100,
      gravity: 0.05,
      friction: 0.8
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
              onChange={(e) => setNodeSize(Number(e.target.value))}
              style={{ display: 'block', width: '200px', marginTop: '5px' }}
            />
          </label>
        </div>
      </div>

      {/* 使用GraphCanvas组件 */}
      <GraphCanvas 
        width={1000} 
        height={600} 
        nodes={nodes} 
        edges={edges} 
        options={graphOptions} 
      />
    </div>
  );
}

export default GraphVisualizationTools;