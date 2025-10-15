import React, { useRef } from 'react';
import GraphCanvas from '../components/animation/GraphCanvas';
import '../index.css';

const GraphVisualizationTools = () => {
  // 为GraphCanvas创建一个ref，以便调用其方法
  const graphCanvasRef = useRef(null);

  // 图名称数组，用于加载对应的JSON文件
  const graphNames = [
    'ExampleGraph-1000-600',
    'ExampleGraph-500-300'
  ];

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* 使用GraphCanvas组件 */}
          <div style={{ width: '1200px', height: '600px', margin: '0 auto'}}>
            <GraphCanvas 
              ref={graphCanvasRef}
              width={1000} 
              height={600} 
              graphCount={graphNames.length}
              graphNames={graphNames}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizationTools;