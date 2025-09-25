import { animate, createScope, createSpring, createDraggable } from 'animejs';
import { useEffect, useRef, useState } from 'react';
import reactLogo from '../assets/react.svg';
import '../App.css';

function AnimationTest() {
  const root = useRef(null);
  const scope = useRef(null);
  const [ rotations, setRotations ] = useState(0);
  const [nodeSize, setNodeSize] = useState(20); // 默认节点大小为20

  useEffect(() => {
  
    scope.current = createScope({ root }).add( self => {

      // Animate circle nodes by targeting their transform attribute
      animate('.node-circle', {
        scale: 1.1,
        duration: 1000,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine'
      });
      
      // Animate square nodes by targeting their transform attribute
      animate('.node-square', {
        scale: 1.1,
        duration: 1000,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine'
      });

      // Animate the text
      animate('.animated-text', {
        scale: 1.2,
        fill: '#ff4081',
        duration: 1500,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutQuad'
      });

    });

    // Properly cleanup all anime.js instances declared inside the scope
    return () => scope.current.revert()

  }, []);

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

  return (
    <div ref={root}>
      {/* 控制面板 */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 1000, 
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

      {/* SVG Graph Visualization Canvas */}
      <div className="medium row">
        <svg width="1000" height="600" className="svg-canvas" viewBox="0 0 400 300">
          {/* Background */}
          <rect width="100%" height="100%" fill="#f8f8f8" />
          
          {/* Edges (lines connecting nodes) */}
          {edges.map((edge, index) => {
            // Find source and target nodes
            const sourceNode = nodes.find(node => node.id === edge.source);
            const targetNode = nodes.find(node => node.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;
            
            return (
              <line
                key={index}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke="#999"
                strokeWidth="2"
                className="edge"
              />
            );
          })}
          
          {/* Nodes (circles and squares) */}
          {nodes.map(node => {
            if (node.type === 'circle') {
              return (
                <g key={node.id} className="node" transform={`translate(${node.x},${node.y})`}>
                  <circle
                    r={nodeSize}
                    fill="#3f51b5"
                    stroke="#fff"
                    strokeWidth="2"
                    className="node-circle"
                  />
                  <text
                    y="5"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="14"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            } else {
              return (
                <g key={node.id} className="node" transform={`translate(${node.x},${node.y})`}>
                  <rect
                    x={-nodeSize}
                    y={-nodeSize}
                    width={nodeSize * 2}
                    height={nodeSize * 2}
                    fill="#ff4081"
                    stroke="#fff"
                    strokeWidth="2"
                    rx="5"
                    ry="5"
                    className="node-square"
                  />
                  <text
                    y="5"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="14"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            }
          })}
          
          
        </svg>
      </div>
    </div>
  )
}

export default AnimationTest;