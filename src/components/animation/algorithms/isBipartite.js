// 二分图检测算法 - 使用BFS进行图的二分性检测

/**
 * 检测图是否为二分图
 * @param {Object} graphDataManager - 图数据管理器实例
 * @returns {Object} 包含是否为二分图结果和节点颜色映射的对象
 */
export function isBipartite(graphDataManager) {
  const nodes = graphDataManager.getAllNodes();
  const edges = graphDataManager.getAllEdges();
  
  // 构建邻接表
  const adjacencyList = new Map();
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });
  
  edges.forEach(edge => {
    adjacencyList.get(edge.source).push(edge.target);
    adjacencyList.get(edge.target).push(edge.source);
  });
  
  // 二分图着色（BFS）
  const color = new Map(); // 0: 未着色, 1: 颜色1, -1: 颜色2
  nodes.forEach(node => {
    color.set(node.id, 0);
  });
  
  let isBipartiteGraph = true;
  
  nodes.forEach(node => {
    if (color.get(node.id) === 0) {
      const queue = [node.id];
      color.set(node.id, 1);
      
      while (queue.length > 0 && isBipartiteGraph) {
        const u = queue.shift();
        
        const neighbors = adjacencyList.get(u);
        neighbors.forEach(v => {
          if (color.get(v) === 0) {
            color.set(v, -color.get(u));
            queue.push(v);
          } else if (color.get(v) === color.get(u)) {
            isBipartiteGraph = false;
          }
        });
      }
    }
  });
  
  // 转换为颜色映射
  const nodeColors = {};
  nodes.forEach(node => {
    if (color.get(node.id) === 1) {
      nodeColors[node.id] = '#3f51b5';
    } else if (color.get(node.id) === -1) {
      nodeColors[node.id] = '#ff4081';
    }
  });
  
  return { isBipartite: isBipartiteGraph, nodeColors };
}