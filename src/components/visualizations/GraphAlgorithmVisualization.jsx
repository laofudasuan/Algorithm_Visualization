import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import GraphCanvas from '../animation/GraphCanvas.jsx';
import StackVisualization from './StackVisualization.jsx';
import QueueVisualization from './QueueVisualization.jsx';
import { loadGraphData } from '../utils/GraphDataLoader.jsx';

const GraphAlgorithmVisualization = forwardRef(({ 
  graphName = 'dfs-graph'
}, ref) => {
  const graphCanvasRef = useRef(null);
  const stackVizRef = useRef(null);
  const queueVizRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [dataStructure, setDataStructure] = useState([]); // 用于跟踪栈或队列内容
  const [graphData, setGraphData] = useState(null);
  const [graphAdjList, setGraphAdjList] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentAlgorithm, setCurrentAlgorithm] = useState('dfs'); // 当前选中的算法类型

  // 从JSON文件加载图数据
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setIsLoading(true);
        // 使用GraphDataLoader加载图数据
        const graphData = await loadGraphData(graphName);
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
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGraphData();
  }, [graphName]);
  
  // 切换算法时重置数据结构和访问状态
  const handleAlgorithmChange = (algorithm) => {
    setCurrentAlgorithm(algorithm);
    resetVisualization();
  };
  
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
      setDataStructure([...currentStack]);
      
      // 使用指示器高亮访问的节点
      if (graphCanvasRef.current) {
        graphCanvasRef.current.dispatchOperation('addIndicator', {
          id: `visited-${node}`,
          type: 'highlight',
          target: node,
          color: '#29a0dcff', // 蓝色表示正在递归中
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
              type: 'pulse',
              target: node,
              color: '#ff0000ff',  // 红色表示正在探索
              duration: 500,
              repeatCount: 1
            });
            graphCanvasRef.current.dispatchOperation('addIndicator', {
              id: `explore-${node}-${neighbor}`,
              type: 'edge-pulse',
              source: node,
              target: neighbor,
              color: '#ff0000ff',
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
      
      // 使用stackVizRef进行出栈操作
      if (stackVizRef.current) {
        stackVizRef.current.pop();
      }
      
      // 更新状态
      setDataStructure([...currentStack]);
      
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
  
  // 异步BFS算法实现
  const asyncBFS = async (startNode, delayMs = 1000) => {
    const visited = new Set();
    const queue = [startNode];
    visited.add(startNode);
    
    // 使用queueVizRef进行入队操作
    if (queueVizRef.current) {
      await delay(100);
      queueVizRef.current.enqueue(startNode);
    }
    
    // 更新状态
    setVisitedNodes(prev => [...prev, startNode]);
    setDataStructure([...queue]);
    
    // 使用指示器高亮访问的节点
    if (graphCanvasRef.current) {
      graphCanvasRef.current.dispatchOperation('addIndicator', {
        id: `visited-${startNode}`,
        type: 'highlight',
        target: startNode,
        color: '#4CAF50', // 绿色表示已访问
        radius: 35,
        lineWidth: 4
      });
    }
    
    // 添加延迟以创建动画效果
    await delay(delayMs);
    
    while (queue.length > 0) {
      // 出队
      const currentNode = queue.shift();
      
      // 使用queueVizRef进行出队操作
      if (queueVizRef.current) {
        queueVizRef.current.dequeue();
      }
      
      // 更新状态
      setDataStructure([...queue]);
      
      // 添加延迟
      await delay(delayMs / 2);
      
      // 访问所有未访问的邻居节点
      const neighbors = graphAdjList[currentNode] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          // 标记为已访问
          visited.add(neighbor);
          queue.push(neighbor);
          
          // 使用queueVizRef进行入队操作
          if (queueVizRef.current) {
            queueVizRef.current.enqueue(neighbor);
          }
          
          // 更新状态
          setVisitedNodes(prev => [...prev, neighbor]);
          setDataStructure([...queue]);
          
          // 为正在探索的边添加指示器
          if (graphCanvasRef.current) {
            graphCanvasRef.current.dispatchOperation('addIndicator', {
              id: `explore-${currentNode}-${neighbor}`,
              type: 'edge-pulse',
              source: currentNode,
              target: neighbor,
              color: '#FF9800', // 橙色表示正在探索
              duration: 1000
            });
            
            // 高亮新访问的节点
            graphCanvasRef.current.dispatchOperation('addIndicator', {
              id: `visited-${neighbor}`,
              type: 'highlight',
              target: neighbor,
              color: '#4CAF50',
              radius: 35,
              lineWidth: 4
            });
          }
          
          // 添加延迟以创建动画效果
          await delay(delayMs / 2);
        }
      }
    }
    
    return visited;
  };
  
  // 开始执行算法动画
  const startExecution = async () => {
    if (isPlaying || !graphData || Object.keys(graphAdjList).length === 0 || graphData.nodes.length === 0) return;
    
    setIsPlaying(true);
    setVisitedNodes([]);
    setDataStructure([]);
    
    // 重置图的视觉状态 - 清除所有指示器
    if (graphCanvasRef.current) {
      graphCanvasRef.current.dispatchOperation('clearIndicators', {});
    }
    
    // 重置数据结构可视化
    if (currentAlgorithm === 'dfs' && stackVizRef.current) {
      stackVizRef.current.clear();
    } else if (currentAlgorithm === 'bfs' && queueVizRef.current) {
      queueVizRef.current.clear();
    }
    
    // 获取起始节点（第一个节点）
    const startNode = graphData.nodes[0].id;
    
    try {
      // 执行相应的算法
      if (currentAlgorithm === 'dfs') {
        await asyncDFS(startNode, 1000);
      } else if (currentAlgorithm === 'bfs') {
        await asyncBFS(startNode, 1000);
      }
    } catch (error) {
      console.error(`${algorithmType.toUpperCase()}执行过程中出错:`, error);
    } finally {
      // 确保执行状态被重置
      setIsPlaying(false);
    }
  };
  
  // 重置可视化
  const resetVisualization = () => {
    setIsPlaying(false);
    setVisitedNodes([]);
    setDataStructure([]);
    
    // 重置图的视觉状态 - 清除所有指示器
    if (graphCanvasRef.current) {
      graphCanvasRef.current.dispatchOperation('clearIndicators', {});
    }
    
    // 重置数据结构可视化
    if (currentAlgorithm === 'dfs' && stackVizRef.current) {
      stackVizRef.current.clear();
    } else if (currentAlgorithm === 'bfs' && queueVizRef.current) {
      queueVizRef.current.clear();
    }
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    startExecution,
    resetVisualization,
    getVisitedNodes: () => visitedNodes,
    getDataStructure: () => dataStructure,
    isPlaying: isPlaying,
    isLoading: isLoading
  }));

  // 获取算法标题和描述
  const getAlgorithmInfo = () => {
    if (currentAlgorithm === 'dfs') {
      return {
        title: '深度优先搜索(DFS)算法',
        dataStructureTitle: '调用栈可视化',
        dataStructureName: '调用栈'
      };
    } else if (currentAlgorithm === 'bfs') {
      return {
        title: '广度优先搜索(BFS)算法',
        dataStructureTitle: '队列可视化',
        dataStructureName: '队列'
      };
    }
    return {
      title: '图算法',
      dataStructureTitle: '数据结构可视化',
      dataStructureName: '数据结构'
    };
  };

  const { title, dataStructureTitle, dataStructureName } = getAlgorithmInfo();

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">图算法演示</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {/* 算法选择按钮 */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => handleAlgorithmChange('dfs')}
                disabled={isPlaying}
                className={`px-4 py-2 transition-colors ${currentAlgorithm === 'dfs' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                DFS
              </button>
              <button
                onClick={() => handleAlgorithmChange('bfs')}
                disabled={isPlaying}
                className={`px-4 py-2 transition-colors ${currentAlgorithm === 'bfs' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                BFS
              </button>
            </div>
            
            {/* 执行按钮 */}
            <button 
              onClick={startExecution}
              disabled={isPlaying || !graphData}
              className={`px-4 py-2 rounded-md transition-colors ${
                isPlaying || !graphData
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isPlaying ? '执行中...' : `开始执行${currentAlgorithm.toUpperCase()}`}
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
            <p><strong>{dataStructureName}:</strong> {dataStructure.join(', ') || '空'}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">{dataStructureTitle}</h2>
          {currentAlgorithm === 'dfs' ? (
            <StackVisualization 
              ref={stackVizRef}
              height={50}
              maxSize={10}
            />
          ) : (
            <QueueVisualization 
              ref={queueVizRef}
              height={50}
              maxSize={10}
            />
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">图结构可视化</h2>
          {isLoading ? (
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-gray-600">加载图数据中...</p>
              </div>
            </div>
          ) : graphData ? (
            <GraphCanvas 
              ref={graphCanvasRef}
              width={600}
              height={500}
              graphData={graphData}
              isLoading={false}
            />
          ) : (
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-50">
              <p className="text-gray-600">图数据加载失败</p>
            </div>
          )}
      </div>
    </div>
  );
});

GraphAlgorithmVisualization.displayName = 'GraphAlgorithmVisualization';

export default GraphAlgorithmVisualization;