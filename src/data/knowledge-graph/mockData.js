// 知识图谱模拟数据
// 注意：在实际项目中，这些数据会从Neo4j数据库获取

// 节点类型定义
export const NODE_TYPES = {
  CONCEPT: 'concept',      // 概念节点
  ALGORITHM: 'algorithm',  // 算法节点
  DATA_STRUCTURE: 'dataStructure',  // 数据结构节点
  APPLICATION: 'application',  // 应用场景节点
  RESOURCE: 'resource'     // 资源节点
};

// 关系类型定义
export const RELATION_TYPES = {
  PART_OF: 'partOf',       // 属于
  IMPLEMENTS: 'implements',  // 实现
  USES: 'uses',            // 使用
  APPLIES_TO: 'appliesTo',  // 应用于
  RELATED_TO: 'relatedTo'  // 相关
};

// 知识图谱示例数据
export const knowledgeGraphData = {
  nodes: [
    // 算法分类节点
    { id: 'algorithms', type: NODE_TYPES.CONCEPT, label: '算法', color: '#3b82f6', size: 30 },
    { id: 'search', type: NODE_TYPES.CONCEPT, label: '搜索算法', color: '#60a5fa', size: 25 },
    { id: 'sort', type: NODE_TYPES.CONCEPT, label: '排序算法', color: '#60a5fa', size: 25 },
    { id: 'graph', type: NODE_TYPES.CONCEPT, label: '图算法', color: '#60a5fa', size: 25 },
    { id: 'dp', type: NODE_TYPES.CONCEPT, label: '动态规划', color: '#60a5fa', size: 25 },
    { id: 'ml', type: NODE_TYPES.CONCEPT, label: '机器学习', color: '#60a5fa', size: 25 },
    
    // 具体算法节点
    { id: 'binary_search', type: NODE_TYPES.ALGORITHM, label: '二分查找', color: '#10b981', size: 20 },
    { id: 'bfs', type: NODE_TYPES.ALGORITHM, label: '广度优先搜索', color: '#10b981', size: 20 },
    { id: 'dfs', type: NODE_TYPES.ALGORITHM, label: '深度优先搜索', color: '#10b981', size: 20 },
    { id: 'dijkstra', type: NODE_TYPES.ALGORITHM, label: 'Dijkstra算法', color: '#10b981', size: 20 },
    { id: 'quick_sort', type: NODE_TYPES.ALGORITHM, label: '快速排序', color: '#10b981', size: 20 },
    { id: 'merge_sort', type: NODE_TYPES.ALGORITHM, label: '归并排序', color: '#10b981', size: 20 },
    { id: 'knapsack', type: NODE_TYPES.ALGORITHM, label: '背包问题', color: '#10b981', size: 20 },
    
    // 数据结构节点
    { id: 'array', type: NODE_TYPES.DATA_STRUCTURE, label: '数组', color: '#f59e0b', size: 20 },
    { id: 'linked_list', type: NODE_TYPES.DATA_STRUCTURE, label: '链表', color: '#f59e0b', size: 20 },
    { id: 'tree', type: NODE_TYPES.DATA_STRUCTURE, label: '树', color: '#f59e0b', size: 20 },
    { id: 'graph_structure', type: NODE_TYPES.DATA_STRUCTURE, label: '图', color: '#f59e0b', size: 20 },
    
    // 应用场景节点
    { id: 'path_finding', type: NODE_TYPES.APPLICATION, label: '路径规划', color: '#8b5cf6', size: 20 },
    { id: 'network_analysis', type: NODE_TYPES.APPLICATION, label: '网络分析', color: '#8b5cf6', size: 20 },
    { id: 'data_indexing', type: NODE_TYPES.APPLICATION, label: '数据索引', color: '#8b5cf6', size: 20 },
    
    // 资源节点
    { id: 'luogu', type: NODE_TYPES.RESOURCE, label: '洛谷', color: '#ef4444', size: 15 },
    { id: 'algorithm_books', type: NODE_TYPES.RESOURCE, label: '算法书籍', color: '#ef4444', size: 15 }
  ],
  
  links: [
    // 分类关系
    { source: 'search', target: 'algorithms', type: RELATION_TYPES.PART_OF },
    { source: 'sort', target: 'algorithms', type: RELATION_TYPES.PART_OF },
    { source: 'graph', target: 'algorithms', type: RELATION_TYPES.PART_OF },
    { source: 'dp', target: 'algorithms', type: RELATION_TYPES.PART_OF },
    { source: 'ml', target: 'algorithms', type: RELATION_TYPES.PART_OF },
    
    // 算法属于分类
    { source: 'binary_search', target: 'search', type: RELATION_TYPES.PART_OF },
    { source: 'bfs', target: 'graph', type: RELATION_TYPES.PART_OF },
    { source: 'dfs', target: 'graph', type: RELATION_TYPES.PART_OF },
    { source: 'dijkstra', target: 'graph', type: RELATION_TYPES.PART_OF },
    { source: 'quick_sort', target: 'sort', type: RELATION_TYPES.PART_OF },
    { source: 'merge_sort', target: 'sort', type: RELATION_TYPES.PART_OF },
    { source: 'knapsack', target: 'dp', type: RELATION_TYPES.PART_OF },
    
    // 算法使用数据结构
    { source: 'binary_search', target: 'array', type: RELATION_TYPES.USES },
    { source: 'quick_sort', target: 'array', type: RELATION_TYPES.USES },
    { source: 'merge_sort', target: 'array', type: RELATION_TYPES.USES },
    { source: 'bfs', target: 'graph_structure', type: RELATION_TYPES.USES },
    { source: 'dfs', target: 'graph_structure', type: RELATION_TYPES.USES },
    { source: 'dijkstra', target: 'graph_structure', type: RELATION_TYPES.USES },
    { source: 'bfs', target: 'linked_list', type: RELATION_TYPES.USES },
    { source: 'dfs', target: 'tree', type: RELATION_TYPES.USES },
    
    // 算法应用场景
    { source: 'dijkstra', target: 'path_finding', type: RELATION_TYPES.APPLIES_TO },
    { source: 'bfs', target: 'network_analysis', type: RELATION_TYPES.APPLIES_TO },
    { source: 'binary_search', target: 'data_indexing', type: RELATION_TYPES.APPLIES_TO },
    
    // 资源关联
    { source: 'binary_search', target: 'luogu', type: RELATION_TYPES.RELATED_TO },
    { source: 'quick_sort', target: 'luogu', type: RELATION_TYPES.RELATED_TO },
    { source: 'algorithms', target: 'algorithm_books', type: RELATION_TYPES.RELATED_TO }
  ]
};

// 转换为three-forcegraph所需的数据格式
export const convertToForceGraphData = (graphData) => {
  return {
    nodes: graphData.nodes.map(node => ({
      ...node,
      val: node.size || 1
    })),
    links: graphData.links.map(link => ({
      ...link
    }))
  };
};

// 获取节点类型对应的样式
export const getNodeStyle = (nodeType) => {
  const styles = {
    [NODE_TYPES.CONCEPT]: { color: '#3b82f6', opacity: 0.9 },
    [NODE_TYPES.ALGORITHM]: { color: '#10b981', opacity: 0.8 },
    [NODE_TYPES.DATA_STRUCTURE]: { color: '#f59e0b', opacity: 0.8 },
    [NODE_TYPES.APPLICATION]: { color: '#8b5cf6', opacity: 0.8 },
    [NODE_TYPES.RESOURCE]: { color: '#ef4444', opacity: 0.7 }
  };
  return styles[nodeType] || styles[NODE_TYPES.CONCEPT];
};
