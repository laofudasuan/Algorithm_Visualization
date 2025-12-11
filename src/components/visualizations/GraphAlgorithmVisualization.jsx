import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GraphCanvas from '../animation/GraphCanvas.jsx';
import { loadGraphData } from '../utils/GraphDataLoader.jsx';
import DfsMotion from './graphAlgorithms/DfsMotion.jsx';
import BfsMotion from './graphAlgorithms/BfsMotion.jsx';
import AdjacencyMatrixMotion from './graphAlgorithms/AdjacencyMatrixMotion.jsx';
import AdjacencyListMotion from './graphAlgorithms/AdjacencyListMotion.jsx';

const GraphAlgorithmVisualization = forwardRef(({ 
  graphName = 'dfs-graph',
  animationList = [],
  enableDrawing = true
}, ref) => {
  const graphCanvasRef = useRef(null);
  const algorithmMotionRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAlgorithm, setCurrentAlgorithm] = useState('dfs'); // 当前选中的算法类型
  const [showAnimationModal, setShowAnimationModal] = useState(false); // 控制动画浮动窗口显示的状态
  const [clickedButtons, setClickedButtons] = useState(new Set()); // 跟踪已点击的一次性按钮
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
    <div className="relative" data-vis="graph">
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
              backgroundImage={null}
              enableDrawing={enableDrawing}
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
                        icon: null,
                        type: 'modal'
                      },
                      {
                        id: 'bfs',
                        label: '广度优先搜索(BFS)',
                        icon: null,
                        type: 'modal'
                      },
                      {
                        id: 'adjacencyMatrix',
                        label: '邻接矩阵',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        ),
                        type: 'modal'
                      },
                      {
                        id: 'adjacencyList',
                        label: '邻接表',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                        type: 'modal'
                      },
                      {
                        id: 'ShowScc',
                        label: '展示强连通分量',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        ),
                        type: 'canvas'
                      },
                      {
                        id: 'ShowBcc',
                        label: '展示边双连通分量',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        ),
                        type: 'canvas'
                      },
                      {
                        id: 'ShowPbcc',
                        label: '展示点双连通分量',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        ),
                        type: 'canvas'
                      },
                      {
                        id: 'BuildRST',
                        label: '构建圆方树',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        ),
                        type: 'canvas',
                        isOneTime: true
                      },
                      {
                        id: 'ShowAugmentingPath',
                        label: '展示增广路径',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        ),
                        type: 'canvas',
                        isOneTime: true
                      }
                    ];

                    // 处理按钮点击事件
                    const handleButtonClick = (config) => {
                      // 如果是一次性按钮且已被点击，则不执行任何操作
                      if (config.isOneTime && clickedButtons.has(config.id)) {
                        return;
                      }

                      if (config.type === 'modal') {
                        selectAlgorithmAndOpenModal(config.id);
                      } else if (config.type === 'canvas') {
                        if (config.id === 'ShowScc' || config.id === 'ShowPbcc' || config.id === 'ShowBcc') {
                          if (graphData.Indicators && Array.isArray(graphData.Indicators) && graphCanvasRef.current && graphCanvasRef.current.dispatchOperation) {
                            // 使用GraphCanvas直接暴露的dispatchOperation方法
                            const indicatorsToAdd = [...graphData.Indicators];
                            indicatorsToAdd.forEach(indicator => {
                              graphCanvasRef.current.dispatchOperation('addIndicator', indicator);
                            });
                            
                            // 等待10秒后移除所有指示器
                            setTimeout(() => {
                              indicatorsToAdd.forEach(indicator => {
                                graphCanvasRef.current.dispatchOperation('removeIndicator', indicator.id);
                              });
                            }, 10000);
                          } else {
                            console.warn('无法访问画布的dispatchOperation方法');
                          }
                        } else if (config.id === 'BuildRST') {
                          if (graphCanvasRef.current && graphCanvasRef.current.dispatchOperation) {
                            const nodesToAdd = [...graphData.PbccAddNodes];
                            nodesToAdd.forEach(node => {
                              graphCanvasRef.current.dispatchOperation('addNode', node);
                            });
                            const edgesToDelete = [...graphData.PbccDeleteEdges];
                            setTimeout(() => {
                              edgesToDelete.forEach(edge => {
                                graphCanvasRef.current.dispatchOperation('deleteEdge', edge.data);
                              });
                              const edgesToAdd = [...graphData.PbccAddEdges];
                              setTimeout(() => {
                                edgesToAdd.forEach(edge => {
                                  graphCanvasRef.current.dispatchOperation('addEdge', edge);
                                });
                              }, 3000); // 可以根据需要调整这个延迟时间
                            }, 3000); 
                        }
                      } else if (config.id === 'ShowAugmentingPath') {
                        if (graphCanvasRef.current && graphCanvasRef.current.dispatchOperation) {
                          graphData.OldIndicators.forEach(indicator => {
                            graphCanvasRef.current.dispatchOperation('addIndicator', indicator);
                          });
                          setTimeout(() => {
                            // 每隔1秒显示一条边
                            graphData.AugmentingPathEdges.forEach((edge, index) => {
                              setTimeout(() => {
                                graphCanvasRef.current.dispatchOperation('addIndicator', edge);
                              }, index * 500); // 每条边延时递增0.5秒
                            });
                            setTimeout(() => {
                              graphData.NewIndicators.forEach(indicator => {
                                graphCanvasRef.current.dispatchOperation('addIndicator', indicator);
                              });
                              graphData.OldIndicators.forEach(indicator => {
                                graphCanvasRef.current.dispatchOperation('removeIndicator', indicator.id);
                              });
                            }, 500 * graphData.AugmentingPathEdges.length);
                          }, 3000);
                        }
                      }
                    }
                      // 如果是一次性按钮，记录已点击
                      if (config.isOneTime) {
                        setClickedButtons(prev => new Set(prev).add(config.id));
                      }
                    };

                    // 过滤并渲染配置的按钮
                    return buttonConfigs
                      .filter(config => animationList.includes(config.id))
                      .map(config => (
                        <button
                          key={config.id}
                          onClick={() => handleButtonClick(config)}
                          disabled={!graphData || isLoading || (config.isOneTime && clickedButtons.has(config.id))}
                          className={`px-4 py-2 rounded-md transition-colors w-full ${(
                            (!graphData || isLoading)
                              ? 'bg-gray-400 cursor-not-allowed'
                              : config.isOneTime && clickedButtons.has(config.id)
                                ? 'bg-gray-900 text-white cursor-not-allowed'
                                : config.type === 'modal' 
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                          )} block relative overflow-hidden group`}
                          title={config.type === 'modal' ? '点击打开模态框' : config.isOneTime ? '一次性操作，点击后变为黑色且不可再点击' : '直接操作当前画布'}
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
                    {currentAlgorithm === 'dfs' && (
                      <DfsMotion ref={algorithmMotionRef} graphData={graphData} />
                    )}
                    {currentAlgorithm === 'bfs' && (
                      <BfsMotion ref={algorithmMotionRef} graphData={graphData} />
                    )}
                    {currentAlgorithm === 'adjacencyMatrix' && (
                      <AdjacencyMatrixMotion ref={algorithmMotionRef} graphData={graphData} />
                    )}
                    {currentAlgorithm === 'adjacencyList' && (
                      <AdjacencyListMotion ref={algorithmMotionRef} graphData={graphData} />
                    )}
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
