import React from 'react';

// BFS算法实现
export const BFSAlgorithm = ({
  graphData,
  graphAdjList,
  delayMs,
  animationCanvasRef,
  queueVizRef,
  setVisitedNodes
}) => {
  // 延迟函数
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 异步BFS算法实现
  const asyncBFS = async (startNode, delayMs = 1000) => {
    const visited = new Set();
    const queue = [startNode];
    visited.add(startNode);
    
    // 使用queueVizRef进行入队操作
    if (queueVizRef.current) {
      queueVizRef.current.enqueue(startNode);
    }
    
    // 更新状态
    setVisitedNodes(prev => [...prev, startNode]);
    // 移除dataStructure更新
    
    // 使用指示器高亮访问的节点
    if (animationCanvasRef.current) {
      animationCanvasRef.current.dispatchOperation('addIndicator', {
        id: `visited-${startNode}`,
        type: 'highlight',
        target: startNode,
        color: '#4CAF50', // 绿色表示已访问
        radius: 35,
        lineWidth: 4
      });
    }
    
    await delay(delayMs);
    
    while (queue.length > 0) {
      // 出队
      const currentNode = queue.shift();
      
      // 使用queueVizRef进行出队操作
      if (queueVizRef.current) {
        queueVizRef.current.dequeue();
      }

      animationCanvasRef.current.dispatchOperation('addIndicator', {
        id: `pulseNode`,
        type: 'pulse',
        target: currentNode,
        color: '#29a0dcff',
        duration: delayMs/2,
        repeatCount: Infinity
      });
      
      await delay(delayMs/2);
      // 移除dataStructure更新
      await delay(delayMs/2);
      
      // 访问所有未访问的邻居节点
      const neighbors = graphAdjList[currentNode] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          
          // 为正在探索的边添加指示器
          if (animationCanvasRef.current) {
            animationCanvasRef.current.dispatchOperation('addIndicator', {
              id: `explore-${currentNode}-${neighbor}`,
              type: 'edge-pulse',
              source: currentNode,
              target: neighbor,
              color: '#ff0000ff',
              duration: delayMs
            });
          }
          
          await delay(delayMs);

          // 标记为已访问
          visited.add(neighbor);
          queue.push(neighbor);
          
          // 使用queueVizRef进行入队操作
          if (queueVizRef.current) {
            queueVizRef.current.enqueue(neighbor);
          }
          
          setVisitedNodes(prev => [...prev, neighbor]);
            
          // 高亮新访问的节点
          if (animationCanvasRef.current) {
            animationCanvasRef.current.dispatchOperation('addIndicator', {
              id: `visited-${neighbor}`,
              type: 'highlight',
              target: neighbor,
              color: '#4CAF50',
              radius: 35,
              lineWidth: 4
            });
          }

          await delay(delayMs/2);
        }
      }

      if (animationCanvasRef.current) {
        animationCanvasRef.current.dispatchOperation('removeIndicator', `pulseNode`);
      }
      await delay(delayMs / 2);
    }
    
    return visited;
  };

  const execute = async () => {
    if (!graphData || Object.keys(graphAdjList).length === 0 || graphData.nodes.length === 0) return;
    
    const startNode = graphData.nodes[0].id;
    return await asyncBFS(startNode, delayMs);
  };

  const getAlgorithmInfo = () => {
    return {
      title: '广度优先搜索(BFS)算法',
      dataStructureTitle: '队列'
    };
  };

  return {
    execute,
    getAlgorithmInfo
  };
};