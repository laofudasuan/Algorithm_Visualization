// 桥边检测算法 - 使用Tarjan算法检测图中的桥边

/**
 * 检测图中的桥边
 * @param {Object} graphDataManager - 图数据管理器实例
 * @returns {Array} 桥边索引数组
 */
export function findBridges(graphDataManager) {
  const nodes = graphDataManager.getAllNodes();
  const edges = graphDataManager.getAllEdges();
  
  // 构建邻接表
  const adjacencyList = new Map();
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });
  
  edges.forEach((edge, index) => {
    adjacencyList.get(edge.source).push({ id: edge.target, edgeIndex: index });
    adjacencyList.get(edge.target).push({ id: edge.source, edgeIndex: index });
  });
  
  // Tarjan算法检测桥边
  const visited = new Set();
  const disc = new Map(); // 发现时间
  const low = new Map(); // 能够回溯到的最早节点的发现时间
  const parent = new Map();
  const bridges = [];
  let time = 0;
  
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      _tarjan(node.id, adjacencyList, visited, disc, low, parent, bridges, time);
    }
  });
  
  return bridges;
}

/**
 * Tarjan算法辅助函数
 * @private
 * @param {string|number} u - 当前节点ID
 * @param {Map} adjacencyList - 邻接表
 * @param {Set} visited - 已访问节点集合
 * @param {Map} disc - 发现时间映射
 * @param {Map} low - 最早可回溯时间映射
 * @param {Map} parent - 父节点映射
 * @param {Array} bridges - 桥边数组
 * @param {number} time - 时间戳
 */
function _tarjan(u, adjacencyList, visited, disc, low, parent, bridges, time) {
  visited.add(u);
  disc.set(u, time);
  low.set(u, time);
  time++;
  
  const neighbors = adjacencyList.get(u);
  neighbors.forEach(neighbor => {
    const v = neighbor.id;
    
    if (!visited.has(v)) {
      parent.set(v, u);
      _tarjan(v, adjacencyList, visited, disc, low, parent, bridges, time);
      
      // 检查u-v是否为桥边
      low.set(u, Math.min(low.get(u), low.get(v)));
      
      if (low.get(v) > disc.get(u)) {
        bridges.push(neighbor.edgeIndex);
      }
    } else if (v !== parent.get(u)) {
      // 更新low值
      low.set(u, Math.min(low.get(u), disc.get(v)));
    }
  });
}