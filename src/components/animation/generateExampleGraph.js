// generateExampleGraph.js - 生成示例图数据

/**
 * 生成示例图数据
 * @param {number} width - 画布宽度，默认800
 * @param {number} height - 画布高度，默认600
 * @returns {Object} 包含nodes和edges的对象，可直接用于初始化AnimateGraph组件
 */
export const generateExampleGraph = (width = 800, height = 600) => {
  // 创建节点
  const nodes = [
    { id: '1', label: '节点1', x: width * 0.3, y: height * 0.3, size: 60, type: 'circle', style: { fill: '#4CAF50' } },
    { id: '2', label: '节点2', x: width * 0.7, y: height * 0.3, size: 50, type: 'circle', style: { fill: '#2196F3' } },
    { id: '3', label: '节点3', x: width * 0.3, y: height * 0.7, size: 70, type: 'square', style: { fill: '#FF9800' } },
    { id: '4', label: '节点4', x: width * 0.7, y: height * 0.7, size: 56, type: 'circle', style: { fill: '#9C27B0' } },
    { id: '5', label: '节点5', x: width * 0.5, y: height * 0.5, size: 64, type: 'square', style: { fill: '#F44336' } },
  ];
  
  // 创建边
  const edges = [
    { id: 'e1', source: '1', target: '2', style: { stroke: '#333', lineWidth: 2, arrow: true } },
    { id: 'e2', label: '边2', source: '2', target: '4', style: { stroke: '#555', lineWidth: 1.5, arrow: true } },
    { id: 'e3', source: '4', target: '3', style: { stroke: '#777', lineWidth: 1.5, arrow: true } },
    { id: 'e4', source: '3', target: '1', style: { stroke: '#999', lineWidth: 1.5, arrow: true } },
    { id: 'e5', source: '1', target: '5', style: { stroke: '#000', lineWidth: 2, arrow: true } },
    { id: 'e6', source: '2', target: '5', style: { stroke: '#000', lineWidth: 2, arrow: true } },
    { id: 'e7', source: '5', target: '3', style: { stroke: '#000', lineWidth: 2, arrow: true } },
    { id: 'e8', source: '5', target: '4', style: { stroke: '#000', lineWidth: 2, arrow: true } },
  ];
  
  // 默认样式
  const nodesStyle = {
    stroke: '#000000',
    lineWidth: 2,
    labelFill: '#ffffff',
    labelFontSize: 14
  };
  
  const edgesStyle = {
    stroke: '#666666',
    lineWidth: 2,
    arrow: true
  };
  
  return { nodes, edges, nodesStyle, edgesStyle };
};