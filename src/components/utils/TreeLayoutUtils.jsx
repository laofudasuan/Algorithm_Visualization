// TreeLayoutUtils.jsx
// 负责计算和排列树的节点位置

/**
 * 重新排列树的节点位置
 * @param {Object} treeData - 树数据对象，包含nodes和edges数组
 * @param {string} newRootId - 新的根节点ID
 * @returns {Object} - 包含更新后节点位置的树数据对象
 */
export const rearrangeTreeNodes = (treeData, newRootId) => {
  if (!treeData) return null;
  
  // 创建邻接表表示树
  const adjacencyList = {};
  treeData.nodes.forEach(node => {
    adjacencyList[node.id] = [];
  });
  
  treeData.edges.forEach(edge => {
    adjacencyList[edge.source].push(edge.target);
    adjacencyList[edge.target].push(edge.source); // 添加双向连接用于遍历
  });
  
  // BFS遍历计算层次
  const levelMap = {}; // 存储节点的层级
  const parentMap = {}; // 存储节点的父节点，用于避免回环
  const queue = [newRootId];
  levelMap[newRootId] = 0;
  parentMap[newRootId] = null;
  
  // 找出每一层的节点
  const levelNodes = {};
  levelNodes[0] = [newRootId];
  
  while (queue.length > 0) {
    const current = queue.shift();
    const currentLevel = levelMap[current];
    
    // 获取所有相邻节点，排除父节点
    const neighbors = adjacencyList[current].filter(nodeId => nodeId !== parentMap[current]);
    
    neighbors.forEach(neighbor => {
      levelMap[neighbor] = currentLevel + 1;
      parentMap[neighbor] = current;
      queue.push(neighbor);
      
      // 将节点添加到对应层级
      if (!levelNodes[currentLevel + 1]) {
        levelNodes[currentLevel + 1] = [];
      }
      levelNodes[currentLevel + 1].push(neighbor);
    });
  }
  
  // 计算新的节点位置
  const newNodes = treeData.nodes.map(node => {
    const level = levelMap[node.id];
    const nodesInLevel = levelNodes[level].length;
    const indexInLevel = levelNodes[level].indexOf(node.id);
    
    // 计算节点的新位置
    const width = treeData.width || 1200;
    const height = treeData.height || 500;
    const totalLevels = Object.keys(levelNodes).length;
    
    // 根据每行k个点，相邻距离为width/(k+1)的规则计算
    const horizontalSpacing = width / (nodesInLevel + 1);
    // 根据有k层，相邻两层距离为height/(k+1)的规则计算
    const verticalSpacing = height / (totalLevels + 1);
    
    return {
      ...node,
      x: horizontalSpacing * (indexInLevel + 1), // 第i个点的位置是(i+1)*spacing
      y: verticalSpacing * (level + 1) // 第l层的位置是(l+1)*spacing
    };
  });
  
  // 更新根节点和节点位置
  return {
    ...treeData,
    rootNode: newRootId,
    nodes: newNodes
  };
};

export default {
  rearrangeTreeNodes
};