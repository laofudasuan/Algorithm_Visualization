import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import GraphCanvas from '../animation/GraphCanvas.jsx';
import StackVisualization from './StackVisualization.jsx';
import QueueVisualization from './QueueVisualization.jsx';
import TwoDArrayVisualization from './TwoDArrayVisualization.jsx';
import LinkedListVisualization from './LinkedListVisualization.jsx';
import { DFSAlgorithm } from './graphAlgorithms/DFSAlgorithm.jsx';
import { BFSAlgorithm } from './graphAlgorithms/BFSAlgorithm.jsx';
import { AdjacencyMatrixAlgorithm } from './graphAlgorithms/AdjacencyMatrixAlgorithm.jsx';
import { AdjacencyListAlgorithm } from './graphAlgorithms/AdjacencyListAlgorithm.jsx';

const GraphAlgorithmMotion = forwardRef(({ 
  graphData, 
  Algorithm = 'dfs'
}, ref) => {
  const animationCanvasRef = useRef(null);
  const stackVizRef = useRef(null);
  const queueVizRef = useRef(null);
  const adjacencyMatrixRef = useRef(null);
  const adjacencyListRefs = useRef({}); // 存储每个节点的邻接表可视化引用
  const [isPlaying, setIsPlaying] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentAlgorithm, setCurrentAlgorithm] = useState(Algorithm);
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
        // 首先检查边的style中是否有directional属性，如果不存在，则检查全局的edgeStyle
        const isDirected = (edge.style && 'directional' in edge.style ? edge.style.directional : this.edgeStyle?.directional) || (edge.style && edge.style.arrow);
        if (!isDirected) {
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

  // 开始执行算法动画
  const startExecution = async () => {
    if (isPlaying || !graphData || Object.keys(graphAdjList).length === 0 || graphData.nodes.length === 0) return;
    
    setIsPlaying(true);
    setVisitedNodes([]);
    // 移除dataStructure重置
    
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
    } else if (currentAlgorithm === 'adjacencyList') {
      // 清空所有邻接表可视化
      Object.values(adjacencyListRefs.current).forEach(ref => {
        if (ref && ref.clear) {
          ref.clear();
        }
      });
    }
    
    try {
      // 根据当前算法选择并执行对应的算法模块
      let algorithmInstance;
      
      switch (currentAlgorithm) {
        case 'dfs':
          algorithmInstance = DFSAlgorithm({
            graphData,
            graphAdjList,
            delayMs,
            animationCanvasRef,
            stackVizRef,
            setVisitedNodes
          });
          break;
        case 'bfs':
          algorithmInstance = BFSAlgorithm({
            graphData,
            graphAdjList,
            delayMs,
            animationCanvasRef,
            queueVizRef,
            setVisitedNodes
          });
          break;
        case 'adjacencyMatrix':
          algorithmInstance = AdjacencyMatrixAlgorithm({
            graphData,
            graphAdjList,
            delayMs,
            animationCanvasRef,
            adjacencyMatrixRef
          });
          break;
        case 'adjacencyList':
          algorithmInstance = AdjacencyListAlgorithm({
            graphData,
            graphAdjList,
            delayMs,
            animationCanvasRef,
            adjacencyListRefs
          });
          break;
        default:
          console.error('未知算法类型:', currentAlgorithm);
          return;
      }
      
      // 执行算法
      await algorithmInstance.execute();
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
    // 移除dataStructure重置
    
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
    } else if (currentAlgorithm === 'adjacencyList') {
      Object.values(adjacencyListRefs.current).forEach(ref => {
        if (ref && ref.clear) {
          ref.clear();
        }
      });
    }
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    startExecution,
    resetVisualization,
    setCurrentAlgorithm,
    getVisitedNodes: () => visitedNodes,
    // getDataStructure方法已移除
    isPlaying: isPlaying
  }));

  // 获取算法标题和描述
  const getAlgorithmInfo = () => {
    // 创建临时的算法实例来获取信息
    let algorithmInstance;
    
    switch (currentAlgorithm) {
      case 'dfs':
        algorithmInstance = DFSAlgorithm({
          graphData,
          graphAdjList,
          delayMs,
          animationCanvasRef,
          stackVizRef,
          setVisitedNodes
        });
        break;
      case 'bfs':
        algorithmInstance = BFSAlgorithm({
          graphData,
          graphAdjList,
          delayMs,
          animationCanvasRef,
          queueVizRef,
          setVisitedNodes
        });
        break;
      case 'adjacencyMatrix':
          algorithmInstance = AdjacencyMatrixAlgorithm({
            graphData,
            graphAdjList,
            delayMs,
            animationCanvasRef,
            adjacencyMatrixRef
          });
          break;
        case 'adjacencyList':
          algorithmInstance = AdjacencyListAlgorithm({
            graphData,
            graphAdjList,
            delayMs,
            animationCanvasRef,
            adjacencyListRefs
          });
          break;
      default:
        return {
          title: '图算法',
          dataStructureTitle: '数据结构'
        };
    }
    
    return algorithmInstance.getAlgorithmInfo();
  };
  
  // 构造邻接表和邻接矩阵的函数已移至单独的文件中

  const { title, dataStructureTitle } = getAlgorithmInfo();

  return (
    <div className="relative min-h-screen">
      {/* 标题放在页面左上角 */}
      <h2 className="fixed top-4 left-4 text-2xl font-bold text-gray-800 z-10">{title}</h2>

      {/* 栈/队列可视化固定在页面底部，只有dfs和bfs才显示 */}
      {(currentAlgorithm === 'dfs' || currentAlgorithm === 'bfs') && (
        <div className="fixed bottom-4 left-0 right-0 z-8">
          <div className="container mx-auto">
            <h3 className="text-xl font-semibold mb-2 text-gray-700 text-center"><strong>已访问节点:</strong> {visitedNodes.join(', ') || '无'}</h3>
            {dataStructureTitle}
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
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-auto">
        {graphData ? (
          currentAlgorithm === 'adjacencyMatrix' ? (
            // 邻接矩阵布局：左侧GraphCanvas，右侧TwoDArrayVisualization
            <div className="flex gap-4 w-full max-w-6xl">
              <div className="flex-1">
                <GraphCanvas 
                  ref={animationCanvasRef}
                  width={graphData.width || 800}
                  height={graphData.height || 500}
                  graphData={graphData}
                  isLoading={false}
                  backgroundImage={'background'}
                />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700 text-center">{dataStructureTitle}</h3>
                  <TwoDArrayVisualization
                    ref={adjacencyMatrixRef}
                    width={graphData.width || 800}
                    height={graphData.height || 500}
                    rows={graphData.nodes ? graphData.nodes.length : 0}
                    cols={graphData.nodes ? graphData.nodes.length : 0}
                    rowLabels={graphData.nodes ? graphData.nodes.map(node => node.id) : 'default'}
                    colLabels={graphData.nodes ? graphData.nodes.map(node => node.id) : 'default'}
                  />
                </div>
              </div>
            </div>
          ) : currentAlgorithm === 'adjacencyList' ? (
            // 邻接表布局：左侧GraphCanvas，右侧邻接表集合
            <div className="flex gap-4 w-full max-w-6xl">
              <div className="flex-1">
                <GraphCanvas 
                  ref={animationCanvasRef}
                  width={600}
                  height={500}
                  graphData={graphData}
                  isLoading={false}
                  backgroundImage={'background'}
                />
              </div>
              <div className="flex-1 ml-6">
                <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[500px]">
                  {graphData.nodes && graphData.nodes.map(node => (
                    <div key={node.id} className="flex items-center">
                      <div className="font-medium mr-2">点{node.id}</div>
                      <LinkedListVisualization
                        ref={el => adjacencyListRefs.current[node.id] = el}
                        radius={30}
                        maxSize={graphData.nodes?.length || 0}
                      />
                    </div>
                  ))}
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
              backgroundImage={'background'}
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