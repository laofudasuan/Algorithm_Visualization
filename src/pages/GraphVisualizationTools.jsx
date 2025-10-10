import React from 'react';
import GraphCanvas from '../components/animation/GraphCanvas';
import '../index.css';

function GraphVisualizationTools() {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* 使用GraphCanvas组件 */}
          <GraphCanvas 
            width={1000} 
            height={600} 
            graphCount={1}
          />
        </div>
      </div>
    </div>
  );
}

export default GraphVisualizationTools;