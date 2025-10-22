import React, { useRef, useState, useEffect } from 'react';
import GraphCanvas from '../../components/animation/GraphCanvas.jsx';
import StackVisualization from '../../components/visualizations/StackVisualization.jsx';
import { loadGraphData } from '../../components/utils/GraphDataLoader.jsx';

const DFSVisualizationPage = () => {
  const graphCanvasRef = useRef(null);
  const stackVizRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [callStack, setCallStack] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [graphAdjList, setGraphAdjList] = useState({});
  
  // 从JSON文件加载图数据
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        // 使用GraphDataLoader加载图数据
        const graphData = await loadGraphData('dfs-graph');
        setGraphData(graphData);
        
        // 从节点和边数据构建邻接表
        const adjList = {};
        
        // 初始化每个节点的邻接表
        graphData.nodes.forEach(node => {
          adjList[node.id] = [];
        });
        
        // 填充邻接表
        graphData.edges.forEach(edge => {
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
    
    fetchGraphData();
  }, []);
  
  // 延迟函数
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 异步DFS算法实现 - 直接进行可视化操作
  const asyncDFS = async (startNode, delayMs = 1000) => {
    const visited = new Set();
    const currentStack = []; // 用于跟踪当前栈内容
    
    const dfsHelper = async (node) => {
      
      // 标记节点为已访问
      visited.add(node);
      
      // 直接使用stackVizRef进行入栈操作
      if (stackVizRef.current) {
        await delay(100);
        stackVizRef.current.push(node);
      }
      
      // 更新内部栈状态
      currentStack.push(node);
      
      // 更新状态
      setVisitedNodes(prev => [...prev, node]);
      setCallStack([...currentStack]);
      
      // 使用指示器高亮访问的节点
      if (graphCanvasRef.current) {
        graphCanvasRef.current.dispatchOperation('addIndicator', {
          id: `visited-${node}`,
          type: 'highlight',
          target: node,
          color: '#29a0dcff', // 绿色表示正在递归中
          radius: 35,
          lineWidth: 4
        });
      }
      
      // 添加延迟以创建动画效果
      await delay(delayMs);
      
      // 访问所有未访问的邻居节点
      const neighbors = graphAdjList[node] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          
          // 为正在探索的边添加指示器
          if (graphCanvasRef.current) {
            graphCanvasRef.current.dispatchOperation('addIndicator', {
              id: `explore-${node}`,
              type: 'pulse', // 使用边脉冲动画
              target: node,
              color: '#ff0000ff',  // 黄色表示正在探索
              duration: 500,
              repeatCount: 1
            });
            graphCanvasRef.current.dispatchOperation('addIndicator', {
              id: `explore-${node}-${neighbor}`,
              type: 'edge-pulse', // 使用边脉冲动画
              source: node,      // 源节点
              target: neighbor,  // 目标节点
              color: '#ff0000ff',  // 黄色表示正在探索
              duration: 1000
            });
          }
          
          // 添加延迟以创建动画效果
          await delay(delayMs / 2);
          
          // 递归调用DFS
          await dfsHelper(neighbor);
        }
      }
      
      // 回溯
      const currentNode = currentStack.pop();
      
      // 直接使用stackVizRef进行出栈操作
      if (stackVizRef.current) {
        stackVizRef.current.pop();
      }
      
      // 更新状态
      setCallStack([...currentStack]);
      
      // 删除节点的访问指示器
      if (graphCanvasRef.current && currentNode) {
        graphCanvasRef.current.dispatchOperation('removeIndicator', `visited-${currentNode}`);
      }
      
      // 添加延迟以创建动画效果
      await delay(delayMs / 2);
    };
    
    await dfsHelper(startNode);
    return visited;
  };
  
  // 开始执行DFS动画
  const startExecution = async () => {
    if (isPlaying || !graphData || Object.keys(graphAdjList).length === 0 || graphData.nodes.length === 0) return;
    
    setIsPlaying(true);
    setVisitedNodes([]);
    setCallStack([]);
    
    // 重置图的视觉状态 - 清除所有指示器
    if (graphCanvasRef.current) {
      graphCanvasRef.current.dispatchOperation('clearIndicators', {});
    }
    
    // 重置栈可视化 - 直接调用clear方法
    if (stackVizRef.current) {
      stackVizRef.current.clear();
    }
    
    // 获取起始节点（第一个节点）
    const startNode = graphData.nodes[0].id;
    
    try {
      // 直接执行异步DFS，在执行过程中实时更新可视化
      await asyncDFS(startNode, 1000); // 1000ms延迟用于动画效果
    } catch (error) {
      console.error('DFS执行过程中出错:', error);
    } finally {
      // 确保执行状态被重置
      setIsPlaying(false);
    }
  };
  
  // 重置可视化
  const resetVisualization = () => {
    setIsPlaying(false);
    setVisitedNodes([]);
    setCallStack([]);
    
    // 重置图的视觉状态 - 清除所有指示器
    if (graphCanvasRef.current) {
      graphCanvasRef.current.dispatchOperation('clearIndicators', {});
    }
    
    // 重置栈可视化 - 直接调用clear方法
    if (stackVizRef.current) {
      stackVizRef.current.clear();
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
              <StackVisualization 
                ref={stackVizRef}
                height={50}
                maxSize={10}
              />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">图结构可视化</h2>
            {graphData ? (
              <GraphCanvas 
                ref={graphCanvasRef}
                width={600}
                height={500}
                graphData={graphData}
                isLoading={false}
              />
            ) : (
              <div className="w-full h-[500px] flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                  <p className="text-gray-600">加载图数据中...</p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// 添加静态属性供列表页面读取
DFSVisualizationPage.title = '深度优先搜索';
DFSVisualizationPage.description = '可视化展示图的深度优先搜索算法执行过程';

export default DFSVisualizationPage;