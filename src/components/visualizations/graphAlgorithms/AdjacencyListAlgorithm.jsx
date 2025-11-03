import React from 'react';

// 邻接表算法实现
export const AdjacencyListAlgorithm = ({
  graphData,
  graphAdjList,
  delayMs,
  animationCanvasRef,
  adjacencyListRefs
}) => {
  // 延迟函数
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 构造邻接表的动画函数
  const constructAdjacencyList = async () => {
    if (!graphData || !graphAdjList) return;
    
    const nodes = graphData.nodes;
    
    // 逐个处理每个节点的邻接表
    for (const node of nodes) {
      const currentNode = node.id;
      // 在图中为当前节点添加脉冲效果
      if (animationCanvasRef.current) {
        animationCanvasRef.current.dispatchOperation('addIndicator', {
          id: `pulse-${currentNode}`,
          type: 'pulse',
          target: currentNode,
          color: '#ff6b6b',
          duration: delayMs,
        });
      }
      
      await delay(delayMs);
      
      // 获取当前节点的邻居
      const neighbors = graphAdjList[currentNode] || [];
      
      // 获取当前节点的链表可视化引用
      const listRef = adjacencyListRefs.current[currentNode];
      if (listRef) {
        listRef.clear(); // 先清空链表
        
        // 逐个添加邻居节点
        for (const neighbor of neighbors) {
          // 在图中为边添加高亮效果
          if (animationCanvasRef.current) {
            animationCanvasRef.current.dispatchOperation('addIndicator', {
              id: `edge-${currentNode}-${neighbor}`,
              type: 'edge-pulse',
              source: currentNode,
              target: neighbor,
              color: '#ff0000ff',
              duration: delayMs
            });
          }
          
          await delay(delayMs);
          
          // 在链表中插入邻居节点
          listRef.addToHead(neighbor);
          await delay(delayMs / 2);
        }
      }
      
      // 移除节点的脉冲效果
      if (animationCanvasRef.current) {
        animationCanvasRef.current.dispatchOperation('removeIndicator', `pulse-${currentNode}`);
      }
      await delay(delayMs / 2);
    }
    
    return graphAdjList;
  };

  // 执行邻接表构造算法
  const execute = async () => {
    if (!graphData || Object.keys(graphAdjList).length === 0 || graphData.nodes.length === 0) return;
    
    return await constructAdjacencyList();
  };

  // 获取算法信息
  const getAlgorithmInfo = () => {
    return {
      title: '邻接表构造',
      dataStructureTitle: '邻接表'
    };
  };

  return {
    execute,
    getAlgorithmInfo
  };
};