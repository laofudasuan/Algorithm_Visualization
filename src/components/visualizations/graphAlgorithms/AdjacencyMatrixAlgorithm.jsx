import React from 'react';

// 邻接矩阵算法实现
export const AdjacencyMatrixAlgorithm = ({
  graphData,
  graphAdjList,
  delayMs,
  animationCanvasRef,
  adjacencyMatrixRef
}) => {
  // 延迟函数
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 构造邻接矩阵的动画函数
  const constructAdjacencyMatrix = async () => {
    if (!graphData || !graphAdjList) return;
    
    const nodes = graphData.nodes;
    const nodeCount = nodes.length;
    const matrix = Array(nodeCount).fill().map(() => Array(nodeCount).fill(0));
    
    // 初始化邻接矩阵可视化
    if (adjacencyMatrixRef.current) {
      adjacencyMatrixRef.current.clearMatrix(); // 先清空现有内容
    }
    
    // 为每个节点创建索引映射
    const nodeIndexMap = {};
    nodes.forEach((node, index) => {
      nodeIndexMap[node.id] = index;
    });
    
    // 逐个构造邻接矩阵元素
    for (let i = 0; i < nodeCount; i++) {
      const currentNode = nodes[i].id;
      
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
      
      // 处理当前节点的所有邻居
      const neighbors = graphAdjList[currentNode] || [];
      for (const neighbor of neighbors) {
        const j = nodeIndexMap[neighbor];
        if (j !== undefined) {
          matrix[i][j] = 1;
          
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
          
          // 在邻接矩阵中显示当前元素
          if (adjacencyMatrixRef.current) {
            adjacencyMatrixRef.current.setElement(i, j, 1);
          }

          await delay(delayMs / 2);
        }
      }
      
      // 移除节点的脉冲效果
      if (animationCanvasRef.current) {
        animationCanvasRef.current.dispatchOperation('removeIndicator', `pulse-${currentNode}`);
      }
      await delay(delayMs / 2);
    }
    
    return matrix;
  };

  // 执行邻接矩阵构造算法
  const execute = async () => {
    if (!graphData || Object.keys(graphAdjList).length === 0 || graphData.nodes.length === 0) return;
    
    return await constructAdjacencyMatrix();
  };

  // 获取算法信息
  const getAlgorithmInfo = () => {
    return {
      title: '邻接矩阵构造',
      dataStructureTitle: '邻接矩阵'
    };
  };

  return {
    execute,
    getAlgorithmInfo
  };
};