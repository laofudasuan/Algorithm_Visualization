// 连通分量算法 - 计算图的连通分量

/**
 * 计算图的连通分量
 * @param {Object} graphDataManager - 图数据管理器实例
 * @returns {Object} 包含连通分量和节点颜色映射的对象
 */
export function computeConnectedComponents(graphDataManager) {
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
  
  // 深度优先搜索计算连通分量
  const visited = new Set();
  const components = [];
  
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const component = [];
      _dfs(node.id, adjacencyList, visited, component);
      components.push(component);
    }
  });
  
  // 为节点分配颜色
  const colors = ['#3f51b5', '#ff4081', '#00bcd4', '#ffc107', '#4caf50', '#9c27b0'];
  const nodeColors = {};
  
  components.forEach((component, index) => {
    const color = colors[index % colors.length];
    component.forEach(nodeId => {
      nodeColors[nodeId] = color;
    });
  });
  
  return { components, nodeColors };
}

/**
 * 深度优先搜索辅助函数
 * @private
 * @param {string|number} nodeId - 当前节点ID
 * @param {Map} adjacencyList - 邻接表
 * @param {Set} visited - 已访问节点集合
 * @param {Array} component - 当前连通分量
 */
function _dfs(nodeId, adjacencyList, visited, component) {
  visited.add(nodeId);
  component.push(nodeId);
  
  const neighbors = adjacencyList.get(nodeId);
  neighbors.forEach(neighborId => {
    if (!visited.has(neighborId)) {
      _dfs(neighborId, adjacencyList, visited, component);
    }
  });
}