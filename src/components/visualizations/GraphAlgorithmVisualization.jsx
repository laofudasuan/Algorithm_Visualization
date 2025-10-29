import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GraphCanvas from '../animation/GraphCanvas.jsx';
import { loadGraphData } from '../utils/GraphDataLoader.jsx';
import GraphAlgorithmMotion from './GraphAlgorithmMotion.jsx';

const GraphAlgorithmVisualization = forwardRef(({ 
  graphName = 'dfs-graph',
  animationList = []
}, ref) => {
  const graphCanvasRef = useRef(null);
  const algorithmMotionRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAlgorithm, setCurrentAlgorithm] = useState('dfs'); // 当前选中的算法类型
  const [showAnimationModal, setShowAnimationModal] = useState(false); // 控制动画浮动窗口显示的状态
  // 移除下拉菜单相关状态

  // 从JSON文件加载图数据
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setIsLoading(true);
        // 使用GraphDataLoader加载图数据
        const graphData = await loadGraphData(graphName);
        setGraphData(graphData);
      } catch (error) {
        console.error('加载图数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGraphData();
  }, []);
    // 选择算法并打开动画浮动窗口
  const selectAlgorithmAndOpenModal = (algorithm) => {
    setCurrentAlgorithm(algorithm);
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
              width={graphData.width || 1200}
              height={graphData.height || 500}
              graphData={graphData}
              isLoading={false}
            />
            {animationList && animationList.length > 0 && (
              <div className="ml-4 mt-2">
                <div className="space-y-2">
                  {/* 统一渲染按钮配置 */}
                  {(() => {
                    // 按钮配置数组
                    const buttonConfigs = [
                      {
                        id: 'dfs',
                        label: '深度优先搜索(DFS)',
                        colorClass: 'bg-green-600 hover:bg-green-700 text-white',
                        icon: null
                      },
                      {
                        id: 'bfs',
                        label: '广度优先搜索(BFS)',
                        colorClass: 'bg-green-600 hover:bg-green-700 text-white',
                        icon: null
                      },
                      {
                        id: 'adjacencyMatrix',
                        label: '邻接矩阵',
                        colorClass: 'bg-blue-600 hover:bg-blue-700 text-white',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        )
                      }
                    ];

                    // 过滤并渲染配置的按钮
                    return buttonConfigs
                      .filter(config => animationList.includes(config.id))
                      .map(config => (
                        <button
                          key={config.id}
                          onClick={() => selectAlgorithmAndOpenModal(config.id)}
                          disabled={!graphData || isLoading}
                          className={`px-4 py-2 rounded-md transition-colors w-full ${(
                            (!graphData || isLoading)
                              ? 'bg-gray-400 cursor-not-allowed'
                              : config.colorClass
                          )} block`}
                        >
                          {config.label}
                          {config.icon}
                        </button>
                      ));
                  })()}
                </div>
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
      {animationList && animationList.length > 0 && (
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