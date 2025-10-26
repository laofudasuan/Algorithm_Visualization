import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GraphCanvas from '../animation/GraphCanvas.jsx';
import { loadGraphData } from '../utils/GraphDataLoader.jsx';
import GraphAlgorithmMotion from './GraphAlgorithmMotion.jsx';
import TwoDArrayVisualization from './TwoDArrayVisualization.jsx';

const GraphAlgorithmVisualization = forwardRef(({ 
  graphName = 'dfs-graph',
  enableAnimation = false,
  showAdjacencyMatrix = false
}, ref) => {
  const graphCanvasRef = useRef(null);
  const algorithmMotionRef = useRef(null);
  const adjacencyMatrixRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [graphAdjList, setGraphAdjList] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentAlgorithm, setCurrentAlgorithm] = useState('dfs'); // 当前选中的算法类型
  const [showAnimationModal, setShowAnimationModal] = useState(false); // 控制动画浮动窗口显示的状态
  const [showAlgorithmDropdown, setShowAlgorithmDropdown] = useState(false); // 控制算法选择下拉菜单的显示
  const [adjacencyMatrix, setAdjacencyMatrix] = useState(null);

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
        
        // 构建邻接矩阵
        const matrix = buildAdjacencyMatrix(graphData);
        setAdjacencyMatrix(matrix);
      } catch (error) {
        console.error('加载图数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGraphData();
  }, [graphName]);
  
  // 构建邻接矩阵
  const buildAdjacencyMatrix = (graphData) => {
    const nodes = graphData.nodes;
    const edges = graphData.edges;
    const nodeCount = nodes.length;
    
    // 初始化全为0的邻接矩阵
    const matrix = Array(nodeCount).fill(null).map(() => Array(nodeCount).fill(0));
    
    // 填充邻接矩阵，存在边的位置设为1
    edges.forEach(edge => {
      // 找到节点在数组中的索引位置
      const sourceIndex = nodes.findIndex(node => node.id === edge.source);
      const targetIndex = nodes.findIndex(node => node.id === edge.target);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        matrix[sourceIndex][targetIndex] = 1;
        matrix[targetIndex][sourceIndex] = 1; // 无向图，对称
      }
    });
    
    return matrix;
  };

  // 打开算法选择下拉菜单
  const toggleAlgorithmDropdown = () => {
    if (graphData && !isLoading) {
      setShowAlgorithmDropdown(!showAlgorithmDropdown);
    }
  };

  // 选择算法并打开动画浮动窗口
  const selectAlgorithmAndOpenModal = (algorithm) => {
    setCurrentAlgorithm(algorithm);
    setShowAlgorithmDropdown(false);
    setShowAnimationModal(true);
  };

  // 关闭动画浮动窗口
  const closeAnimationModal = () => {
    setShowAnimationModal(false);
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    isLoading: isLoading,
    graphData: graphData
  }));

  return (
    <div className="relative">
      {/* 初始界面 - 图的展示 */}
      <div className="">
        {isLoading ? (
          <div className="w-full h-[500px] flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-600">加载图数据中...</p>
            </div>
          </div>
        ) : graphData ? (
          <div className="flex items-start">
            <GraphCanvas 
              ref={graphCanvasRef}
              width={showAdjacencyMatrix ? 800 : (graphData.width || 1200)}
              height={graphData.height || 500}
              graphData={graphData}
              isLoading={false}
            />
            {showAdjacencyMatrix && adjacencyMatrix && (
              <div className="ml-4 mt-2">
                <TwoDArrayVisualization
                  ref={adjacencyMatrixRef}
                  width={400}
                  height={400}
                  rows={graphData.nodes.length}
                  cols={graphData.nodes.length}
                  initialData={adjacencyMatrix}
                />
              </div>
            )}
            {(enableAnimation || showAdjacencyMatrix) && (
              <div className="ml-4 mt-2 relative">
                {enableAnimation && (
                  <button 
                    onClick={toggleAlgorithmDropdown}
                    disabled={!graphData || isLoading}
                    className={`px-4 py-2 rounded-md transition-colors ${(
                      !graphData || isLoading
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    )} mb-2 block`}
                  >
                    播放动画
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                
                {/* 算法选择下拉菜单 */}
                {enableAnimation && showAlgorithmDropdown && (
                  <div className="absolute mt-1 right-0 z-10 bg-white shadow-lg rounded-md overflow-hidden w-40">
                    <button
                      onClick={() => selectAlgorithmAndOpenModal('dfs')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      深度优先搜索(DFS)
                    </button>
                    <button
                      onClick={() => selectAlgorithmAndOpenModal('bfs')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      广度优先搜索(BFS)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-[500px] flex items-center justify-center bg-gray-50">
            <p className="text-gray-600">图数据加载失败</p>
          </div>
        )}
      </div>

      {/* 动画浮动窗口 - 使用新的GraphAlgorithmMotion组件 */}
      {enableAnimation && (
        <AnimatePresence>
          {showAnimationModal && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="w-full h-full overflow-hidden"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-full h-full bg-white">
                  <div className="flex justify-end p-4">
                    <button
                      onClick={closeAnimationModal}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none p-2 rounded-full hover:bg-gray-100 z-10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="w-full h-full p-4">
                    <GraphAlgorithmMotion 
                      ref={algorithmMotionRef}
                      graphData={graphData}
                      graphAdjList={graphAdjList}
                      initialAlgorithm={currentAlgorithm}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
});

GraphAlgorithmVisualization.displayName = 'GraphAlgorithmVisualization';

export default GraphAlgorithmVisualization;