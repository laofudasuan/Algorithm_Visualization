import React from 'react';
import GraphCanvas from '../components/animation/GraphCanvas';
import '../index.css';

function GraphVisualizationTools() {
  return (
    <div>
      {/* 使用GraphCanvas组件 */}
      <GraphCanvas 
        width={1000} 
        height={600} 
        graphCount={2} // 显示两个图
      />
    </div>
  );
}

export default GraphVisualizationTools;