import React, { useRef, useState, useEffect } from 'react';
import GraphCanvas from '../../components/animation/GraphCanvas.jsx';
import ArrayVisualization from '../../components/visualizations/ArrayVisualization.jsx';

const DFSVisualizationPage = () => {
  const graphCanvasRef = useRef(null);
  const arrayVizRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [callStack, setCallStack] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [graphAdjList, setGraphAdjList] = useState({});
  
  // 从JSON文件加载图数据
  useEffect(() => {
    const loadGraphData = async () => {
      try {
        const graphModule = await import('../../data/graphs/dfs-graph.json');
        setGraphData(graphModule.default);
        
        // 从节点和边数据构建邻接表
        const adjList = {};
        
        // 初始化每个节点的邻接表
        graphModule.default.nodes.forEach(node => {
          adjList[node.id] = [];
        });
        
        // 填充邻接表
        graphModule.default.edges.forEach(edge => {
          if (!adjList[edge.source]) adjList[edge.source] = [];
          if (!adjList[edge.target]) adjList[edge.target] = [];
          
          // 添加无向图的连接关系
          if (!adjList[edge.source].includes(edge.target)) {
            adjList[edge.source].push(edge.target);
          }
          if (!adjList[edge.target].includes(edge.source)) {
            adjList[edge.target].push(edge.source);
          }
        });
        
        setGraphAdjList(adjList);
      } catch (error) {
        console.error('加载图数据失败:', error);
      }
    };
    
    loadGraphData();
  }, []);
  
  // DFS算法实现
  const dfsAlgorithm = {
    // 深度优先搜索
    dfs: function(startNode) {
      const visited = new Set();
      const stack = [];
      const traversalSteps = [];
      
      const dfsHelper = (node) => {
        // 标记节点为已访问
        visited.add(node);
        stack.push(node);
        traversalSteps.push({
          type: 'visit',
          node: node,
          stack: [...stack]
        });
        
        // 更新调用栈可视化
        if (arrayVizRef.current) {
          stack.forEach((stackNode, index) => {
            arrayVizRef.current.setElement(index, stackNode);
          });
          // 清除栈外的元素
          for (let i = stack.length; i < 10; i++) {
            arrayVizRef.current.removeElement(i);
          }
        }
        
        // 访问所有未访问的邻居节点
        const neighbors = graphAdjList[node] || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            traversalSteps.push({
              type: 'explore',
              from: node,
              to: neighbor
            });
            dfsHelper(neighbor);
          }
        }
        
        // 回溯
        stack.pop();
        traversalSteps.push({
          type: 'backtrack',
          node: node,
          stack: [...stack]
        });
        
        // 更新调用栈可视化
        if (arrayVizRef.current) {
          stack.forEach((stackNode, index) => {
            arrayVizRef.current.setElement(index, stackNode);
          });
          // 清除栈外的元素
          for (let i = stack.length; i < 10; i++) {
            arrayVizRef.current.removeElement(i);
          }
        }
      };
      
      dfsHelper(startNode);
      return traversalSteps;
    }
  };
  
  // 开始执行DFS动画
  const startExecution = async () => {
    if (isPlaying || !graphData || Object.keys(graphAdjList).length === 0) return;
    
    setIsPlaying(true);
    setVisitedNodes([]);
    setCallStack([]);
    
    // 重置图的视觉状态
    if (graphCanvasRef.current) {
      graphData.nodes.forEach(node => {
        graphCanvasRef.current.dispatchOperation('updateNode', {
          id: node.id,
          style: { fill: '#CCCCCC' }
        });
      });
    }
    
    // 重置数组可视化
    if (arrayVizRef.current) {
      for (let i = 0; i < 10; i++) {
        arrayVizRef.current.removeElement(i);
      }
    }
    
    // 获取起始节点（第一个节点）
    const startNode = graphData.nodes.length > 0 ? graphData.nodes[0].id : 'A';
    
    // 执行DFS算法
    const steps = dfsAlgorithm.dfs(startNode);
    
    // 动画演示每个步骤
    for (const step of steps) {
      if (!isPlaying) break; // 如果用户停止了执行，则中断
      
      switch (step.type) {
        case 'visit':
          setVisitedNodes(prev => [...prev, step.node]);
          setCallStack(step.stack);
          
          // 高亮访问的节点
          if (graphCanvasRef.current) {
            graphCanvasRef.current.dispatchOperation('updateNode', {
              id: step.node,
              style: { fill: '#4CAF50' } // 绿色表示已访问
            });
          }
          break;
          
        case 'explore':
          // 高亮正在探索的边
          if (graphCanvasRef.current) {
            // 尝试不同的边ID格式
            const edgeIds = [
              `edge-${step.from}-${step.to}`,
              `edge-${step.to}-${step.from}`,
              `${step.from}-${step.to}`,
              `${step.to}-${step.from}`
            ];
            
            // 查找正确的边ID
            for (const edgeId of edgeIds) {
              try {
                graphCanvasRef.current.dispatchOperation('updateEdge', {
                  id: edgeId,
                  style: { stroke: '#FFC107', lineWidth: 3 } // 黄色表示正在探索
                });
                break; // 找到后退出循环
              } catch (e) {
                // 如果这个ID不正确，继续尝试下一个
                continue;
              }
            }
          }
          break;
          
        case 'backtrack':
          setCallStack(step.stack);
          
          // 更新调用栈可视化
          if (arrayVizRef.current) {
            step.stack.forEach((stackNode, index) => {
              arrayVizRef.current.setElement(index, stackNode);
            });
            // 清除栈外的元素
            for (let i = step.stack.length; i < 10; i++) {
              arrayVizRef.current.removeElement(i);
            }
          }
          break;
      }
      
      // 添加延迟以创建动画效果
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsPlaying(false);
  };
  
  // 重置可视化
  const resetVisualization = () => {
    setIsPlaying(false);
    setVisitedNodes([]);
    setCallStack([]);
    
    // 重置图的视觉状态
    if (graphCanvasRef.current && graphData) {
      graphData.nodes.forEach(node => {
        graphCanvasRef.current.dispatchOperation('updateNode', {
          id: node.id,
          style: node.style || { fill: '#CCCCCC' }
        });
      });
      
      graphData.edges.forEach(edge => {
        graphCanvasRef.current.dispatchOperation('updateEdge', {
          id: edge.id,
          style: edge.style || { stroke: '#333', lineWidth: 2 }
        });
      });
    }
    
    // 重置数组可视化
    if (arrayVizRef.current) {
      for (let i = 0; i < 10; i++) {
        arrayVizRef.current.removeElement(i);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">深度优先搜索(DFS)可视化</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">DFS算法演示</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              <button 
                onClick={startExecution}
                disabled={isPlaying || !graphData}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isPlaying || !graphData
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isPlaying ? '执行中...' : '开始执行DFS'}
              </button>
              
              <button 
                onClick={resetVisualization}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                重置
              </button>
            </div>
            
            <div className="text-gray-700 space-y-2">
              <p><strong>已访问节点:</strong> {visitedNodes.join(', ') || '无'}</p>
              <p><strong>调用栈:</strong> {callStack.join(', ') || '空'}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">调用栈可视化</h2>
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <ArrayVisualization 
                ref={arrayVizRef}
                height={60}
                length={10}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">图结构可视化</h2>
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            <GraphCanvas 
              ref={graphCanvasRef}
              width={600}
              height={500}
              graphData={graphData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 添加静态属性供列表页面读取
DFSVisualizationPage.title = '深度优先搜索';
DFSVisualizationPage.description = '可视化展示图的深度优先搜索算法执行过程';

export default DFSVisualizationPage;