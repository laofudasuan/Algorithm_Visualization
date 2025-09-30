// 最小生成树算法 - 使用Kruskal算法计算图的最小生成树

/**
 * 计算图的最小生成树（使用Kruskal算法）
 * @param {Object} graphDataManager - 图数据管理器实例
 * @returns {Array} 最小生成树的边索引数组
 */
export function computeMinimumSpanningTree(graphDataManager) {
  const nodes = graphDataManager.getAllNodes();
  const edges = graphDataManager.getAllEdges();
  
  // 为每条边计算权重（距离）
  const weightedEdges = edges.map((edge, index) => {
    const sourceNode = graphDataManager.getNode(edge.source);
    const targetNode = graphDataManager.getNode(edge.target);
    
    const dx = sourceNode.x - targetNode.x;
    const dy = sourceNode.y - targetNode.y;
    const weight = Math.sqrt(dx * dx + dy * dy);
    
    return { ...edge, weight, index };
  });
  
  // 按权重排序
  weightedEdges.sort((a, b) => a.weight - b.weight);
  
  // 并查集用于检测环
  const parent = new Map();
  nodes.forEach(node => {
    parent.set(node.id, node.id);
  });
  
  // 查找根节点
  function find(id) {
    if (parent.get(id) !== id) {
      parent.set(id, find(parent.get(id)));
    }
    return parent.get(id);
  }
  
  // 合并两个集合
  function union(id1, id2) {
    parent.set(find(id1), find(id2));
  }
  
  // Kruskal算法主逻辑
  const mstEdges = [];
  
  weightedEdges.forEach(edge => {
    if (find(edge.source) !== find(edge.target)) {
      mstEdges.push(edge.index);
      union(edge.source, edge.target);
    }
  });
  
  return mstEdges;
}