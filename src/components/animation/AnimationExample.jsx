// AnimationExample.jsx - 演示如何使用修改后的drawingTools进行动画
import React, { useRef, useEffect } from 'react';
import { animateGraph } from './animateGraph.jsx';
const AnimationExample = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const graphControllerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    
    // 设置canvas大小
    canvas.width = 800;
    canvas.height = 600;
    
    // 使用animateGraph函数创建控制器
    const graphController = animateGraph(canvas, {
      nodes: [
        { id: 'node1', x: 200, y: 200, type: 'circle', size: 20, label: 'A' },
        { id: 'node2', x: 600, y: 200, type: 'circle', size: 20, label: 'B' },
        { id: 'node3', x: 400, y: 400, type: 'circle', size: 20, label: 'C' }
      ],
      edges: [
        { source: 'node1', target: 'node2' },
        { source: 'node2', target: 'node3' },
        { source: 'node3', target: 'node1' }
      ],
      physicalParameters: {
        charge: -1000,
        linkDistance: 250,
        gravity: 0.01,
        friction: 0.8
      }
    });
    
    graphControllerRef.current = graphController;
    
    // 清理函数
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (graphControllerRef.current) {
        graphControllerRef.current.stop();
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <h2>图形动画示例</h2>
      <canvas 
        ref={canvasRef} 
        style={{ 
          border: '1px solid #ccc',
          backgroundColor: '#f9f9f9'
        }} 
      />
      <div style={{ marginTop: '20px', maxWidth: '600px' }}>
        <p>此示例展示了如何使用animateGraph.js创建和动画化图形元素。</p>
        <p>功能特点：</p>
        <ul>
          <li>使用animateGraph函数管理图形渲染和动画</li>
          <li>支持节点和边的自动布局</li>
          <li>提供物理模拟效果</li>
          <li>自动更新渲染</li>
        </ul>
      </div>
    </div>
  );
};

export default AnimationExample;