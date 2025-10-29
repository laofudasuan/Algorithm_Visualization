import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import GraphCanvas from '../animation/GraphCanvas.jsx';
import StackVisualization from './StackVisualization.jsx';
import QueueVisualization from './QueueVisualization.jsx';
import TwoDArrayVisualization from './TwoDArrayVisualization.jsx';

const GraphAlgorithmMotion = forwardRef(({ 
  graphData, 
  initialAlgorithm = 'dfs'
}, ref) => {
  const animationCanvasRef = useRef(null);
  const stackVizRef = useRef(null);
  const queueVizRef = useRef(null);
  const adjacencyMatrixRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [dataStructure, setDataStructure] = useState([]); // 用于跟踪栈或队列内容
  const [currentAlgorithm, setCurrentAlgorithm] = useState(initialAlgorithm);
  const [delayMs, setDelayMs] = useState(1000); // 播放速度，默认值为1000ms
  const [graphAdjList, setGraphAdjList] = useState({}); // 邻接表状态
  
  // 当graphData变化时，计算邻接表
  useEffect(() => {
    if (graphData && graphData.edges) {
      const adjList = {};
      
      // 初始化每个节点的邻接列表
      if (graphData.nodes) {
        graphData.nodes.forEach(node => {
          adjList[node.id] = [];
        });
      }
      
      // 填充邻接表
      graphData.edges.forEach(edge => {
        const { source, target } = edge;
        
        // 添加边到邻接表
        if (adjList[source]) {
          adjList[source].push(target);
        } else {
          adjList[source] = [target];
        }
        
        // 对于无向图，也添加反向边
        if (!edge.directed) {
          if (adjList[target]) {
            adjList[target].push(source);
          } else {
            adjList[target] = [source];
          }
        }
      });
      
      setGraphAdjList(adjList);
    }
  }, []);

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
      
      // 使用指示器高亮递归栈中的点
      if (animationCanvasRef.current) {
        animationCanvasRef.current.dispatchOperation('addIndicator', {
          id: `visited-${node}`,
          type: 'highlight',
          target: node,
          color: '#29a0dcff', // 蓝色表示正在递归中
          radius: 35,
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
      setDataStructure([...currentStack]);
      
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
    setDataStructure([...queue]);
    
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
      setDataStructure([...queue]);
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
          
          // 更新状态
          setVisitedNodes(prev => [...prev, neighbor]);
          setDataStructure([...queue]);
            
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

      // 退出节点时移除脉冲指示器
      if (animationCanvasRef.current) {
        animationCanvasRef.current.dispatchOperation('removeIndicator', `pulseNode`);
      }
      await delay(delayMs / 2);
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
    if (animationCanvasRef.current) {
      animationCanvasRef.current.dispatchOperation('clearIndicators', {});
    }
    
    // 重置数据结构可视化
    if (currentAlgorithm === 'dfs' && stackVizRef.current) {
      stackVizRef.current.clear();
    } else if (currentAlgorithm === 'bfs' && queueVizRef.current) {
      queueVizRef.current.clear();
    } else if (currentAlgorithm === 'adjacencyMatrix' && adjacencyMatrixRef.current) {
      // 邻接矩阵特殊处理
    }
    
    try {
      // 执行算法
      if (currentAlgorithm === 'dfs') {
        const startNode = graphData.nodes[0].id;
        await asyncDFS(startNode, delayMs);
      } else if (currentAlgorithm === 'bfs') {
        const startNode = graphData.nodes[0].id;
        await asyncBFS(startNode, delayMs);
      } else if (currentAlgorithm === 'adjacencyMatrix') {
        await constructAdjacencyMatrix();
      }
    } catch (error) {
      console.error(`${currentAlgorithm.toUpperCase()}执行过程中出错:`, error);
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
    
    // 重置画布的视觉状态 - 清除所有指示器
    if (animationCanvasRef.current) {
      animationCanvasRef.current.dispatchOperation('clearIndicators', {});
    }
    
    // 重置数据结构可视化
    if (currentAlgorithm === 'dfs' && stackVizRef.current) {
      stackVizRef.current.clear();
    } else if (currentAlgorithm === 'bfs' && queueVizRef.current) {
      queueVizRef.current.clear();
    } else if (currentAlgorithm === 'adjacencyMatrix' && adjacencyMatrixRef.current) {
      adjacencyMatrixRef.current.clearMatrix();
    }
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    startExecution,
    resetVisualization,
    setCurrentAlgorithm,
    getVisitedNodes: () => visitedNodes,
    getDataStructure: () => dataStructure,
    isPlaying: isPlaying
  }));

  // 获取算法标题和描述
  const getAlgorithmInfo = () => {
    if (currentAlgorithm === 'dfs') {
      return {
        title: '深度优先搜索(DFS)算法',
        dataStructureTitle: '递归栈可视化',
        dataStructureName: '递归栈'
      };
    } else if (currentAlgorithm === 'bfs') {
      return {
        title: '广度优先搜索(BFS)算法',
        dataStructureTitle: '队列可视化',
        dataStructureName: '队列'
      };
    } else if (currentAlgorithm === 'adjacencyMatrix') {
      return {
        title: '邻接矩阵构造',
        dataStructureTitle: '邻接矩阵',
        dataStructureName: '邻接矩阵'
      };
    }
    return {
      title: '图算法',
      dataStructureTitle: '数据结构可视化',
      dataStructureName: '数据结构'
    };
  };
  
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

  const { title, dataStructureTitle, dataStructureName } = getAlgorithmInfo();

  return (
    <div className="relative min-h-screen">
      {/* 标题放在页面左上角 */}
      <h2 className="fixed top-4 left-4 text-2xl font-bold text-gray-800 z-10">{title}</h2>

      {/* 栈/队列可视化固定在页面底部，只有dfs和bfs才显示 */}
      {(currentAlgorithm === 'dfs' || currentAlgorithm === 'bfs') && (
        <div className="fixed bottom-4 left-0 right-0 z-8">
          <div className="container mx-auto">
            <h3 className="text-xl font-semibold mb-2 text-gray-700 text-center"><strong>已访问节点:</strong> {visitedNodes.join(', ') || '无'}</h3>
            <h3 className="text-xl font-semibold mb-2 text-gray-700 text-center"><strong>{dataStructureName}:</strong> {dataStructure.join(', ') || '空'}</h3>
            <div className="flex justify-center">
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
        </div>
      )}

      {/* 主要内容区域 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {graphData ? (
          currentAlgorithm === 'adjacencyMatrix' ? (
            // 邻接矩阵布局：左侧GraphCanvas，右侧TwoDArrayVisualization
            <div className="flex gap-4 w-full max-w-6xl">
              <div className="flex-1">
                <GraphCanvas 
                  ref={animationCanvasRef}
                  width={600}
                  height={500}
                  graphData={graphData}
                  isLoading={false}
                />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700 text-center">{dataStructureTitle}</h3>
                  <TwoDArrayVisualization
                    ref={adjacencyMatrixRef}
                    width={400}
                    height={400}
                    rows={graphData.nodes ? graphData.nodes.length : 0}
                    cols={graphData.nodes ? graphData.nodes.length : 0}
                    rowLabels={graphData.nodes ? graphData.nodes.map(node => node.id) : 'default'}
                    colLabels={graphData.nodes ? graphData.nodes.map(node => node.id) : 'default'}
                  />
                </div>
              </div>
            </div>
          ) : (
            // 常规算法布局
            <GraphCanvas 
              ref={animationCanvasRef}
              width={graphData.width || 800}
              height={graphData.height || 500}
              graphData={graphData}
              isLoading={false}
            />
          )
        ) : (
          <div className="w-full max-w-[800px] h-[500px] flex items-center justify-center bg-gray-50">
            <p className="text-gray-600">图数据加载失败</p>
          </div>
        )}
      </div>

      {/* 播放速度调节滑块和按钮固定在页面右下角 */}
      <div className="fixed bottom-4 right-4 flex flex-col items-end gap-3 z-10">
        {/* 播放速度调节滑块 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">慢</span>
            <input
              type="range"
              min="1"
              max="4"
              value={[3000, 2000, 1000, 500].indexOf(delayMs) + 1}
              onChange={(e) => setDelayMs([3000, 2000, 1000, 500][parseInt(e.target.value) - 1])}
              className="w-40 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              disabled={isPlaying}
            />
            <span className="text-xs text-gray-500">快</span>
          </div>
        <div className="flex gap-2">
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
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          
          {/* 重置按钮 - 正在播放时禁用 */}
          <button 
            onClick={resetVisualization}
            disabled={isPlaying}
            className={`px-4 py-2 rounded-md transition-colors ${
              isPlaying
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

GraphAlgorithmMotion.displayName = 'GraphAlgorithmMotion';

export default GraphAlgorithmMotion;