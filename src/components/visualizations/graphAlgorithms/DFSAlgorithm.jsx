import React, { useRef } from 'react';

// DFS算法实现
export const DFSAlgorithm = ({
  graphData,
  graphAdjList,
  delayMs,
  animationCanvasRef,
  stackVizRef,
  setVisitedNodes
}) => {
  // 延迟函数
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 异步DFS算法实现
  const asyncDFS = async (startNode, delayMs = 1000) => {
    const visited = new Set();
    const currentStack = [];
    
    const dfsHelper = async (node) => {
      // 标记节点为已访问
      visited.add(node);
      
      // 使用stackVizRef进行入栈操作
      if (stackVizRef.current) {
        await delay(100);
        stackVizRef.current.push(node);
      }
      
      // 更新内部栈状态
      currentStack.push(node);
      
      // 更新状态
      setVisitedNodes(prev => [...prev, node]);
      // 移除dataStructure更新
      
      // 使用指示器高亮递归栈中的点
      if (animationCanvasRef.current) {
        animationCanvasRef.current.dispatchOperation('addIndicator', {
          id: `visited-${node}`,
          type: 'highlight',
          target: node,
          color: '#29a0dcff',
          lineWidth: 4
        });
        
        animationCanvasRef.current.dispatchOperation('addIndicator', {
          id: `pulseNode`,
          type: 'pulse',
          target: node,
          color: '#29a0dcff',
          duration: delayMs/2,
          repeatCount: Infinity
        });
      }
      
      // 添加延迟以创建动画效果
      await delay(delayMs);
      
      // 访问所有未访问的邻居节点
      const neighbors = graphAdjList[node] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (animationCanvasRef.current) {
            animationCanvasRef.current.dispatchOperation('removeIndicator', `pulseNode`);
          }
          // 为正在探索的边添加指示器
          if (animationCanvasRef.current) {
            animationCanvasRef.current.dispatchOperation('addIndicator', {
              id: `explore-${node}-${neighbor}`,
              type: 'edge-pulse',
              source: node,
              target: neighbor,
              color: '#ff0000ff',
              duration: delayMs
            });
          }
          
          // 添加延迟以创建动画效果
          await delay(delayMs);
          
          // 递归调用DFS
          await dfsHelper(neighbor);

          if (animationCanvasRef.current) {
            animationCanvasRef.current.dispatchOperation('addIndicator', {
              id: `explore-${node}-${neighbor}`,
              type: 'edge-pulse',
              source: neighbor,
              target: node,
              color: '#ff0000ff',
              duration: delayMs
            });
          }
          
          // 添加延迟以创建动画效果
          await delay(delayMs);

          animationCanvasRef.current.dispatchOperation('addIndicator', {
            id: `pulseNode`,
            type: 'pulse',
            target: node,
            color: '#29a0dcff',
            duration: delayMs/2,
            repeatCount: Infinity
          });

          // 添加延迟以创建动画效果
          await delay(delayMs / 2);
        }
      }
      
      // 退出节点时移除脉冲指示器
      if (animationCanvasRef.current) {
        animationCanvasRef.current.dispatchOperation('removeIndicator', `pulseNode`);
      }
      
      // 回溯
      const currentNode = currentStack.pop();
      
      // 使用stackVizRef进行出栈操作
      if (stackVizRef.current) {
        stackVizRef.current.pop();
      }
      
      // 更新状态
      // 移除dataStructure更新
      
      // 删除节点的访问指示器
      if (animationCanvasRef.current && currentNode) {
        animationCanvasRef.current.dispatchOperation('removeIndicator', `visited-${currentNode}`);
      }
      
      // 添加延迟以创建动画效果
      await delay(delayMs / 2);
    };
    
    await dfsHelper(startNode);
    return visited;
  };

  // 执行DFS算法
  const execute = async () => {
    if (!graphData || Object.keys(graphAdjList).length === 0 || graphData.nodes.length === 0) return;
    
    const startNode = graphData.nodes[0].id;
    return await asyncDFS(startNode, delayMs);
  };

  // 获取算法信息
  const getAlgorithmInfo = () => {
    return {
      title: '深度优先搜索(DFS)算法',
      dataStructureTitle: '递归栈'
    };
  };

  return {
    execute,
    getAlgorithmInfo
  };
};