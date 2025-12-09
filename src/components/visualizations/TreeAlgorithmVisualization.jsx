import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GraphCanvas from '../animation/GraphCanvas.jsx';
import { loadTreeData } from '../utils/TreeDataLoader.jsx';
import { rearrangeTreeNodes } from '../utils/TreeLayoutUtils.jsx';
import DfsMotion from './graphAlgorithms/DfsMotion.jsx';
import BfsMotion from './graphAlgorithms/BfsMotion.jsx';
import AdjacencyMatrixMotion from './graphAlgorithms/AdjacencyMatrixMotion.jsx';
import AdjacencyListMotion from './graphAlgorithms/AdjacencyListMotion.jsx';

const TreeAlgorithmVisualization = forwardRef(({ 
  treeName = 'binary-tree',
  animationList = [],
  enableRootChange = false
}, ref) => {
  const graphCanvasRef = useRef(null);
  const algorithmMotionRef = useRef(null);
  const [treeData, setTreeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAlgorithm, setCurrentAlgorithm] = useState('dfs'); // 当前选中的算法类型
  const [showAnimationModal, setShowAnimationModal] = useState(false); // 控制动画浮动窗口显示的状态
  const [selectedRootNode, setSelectedRootNode] = useState(''); // 用于存储用户选择的根节点
  const [clickedButtons, setClickedButtons] = useState(new Set());

  // 从JSON文件加载树数据
  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setIsLoading(true);
        // 使用TreeDataLoader加载树数据
        const treeData = await loadTreeData(treeName);
        
        // 如果初始有根节点，先重新排列节点位置
        if (treeData && treeData.rootNode) {
          const rearrangedData = rearrangeTreeNodes(treeData, treeData.rootNode);
          setTreeData(rearrangedData || treeData);
        } else {
          setTreeData(treeData);
        }
      } catch (error) {
        console.error('加载树数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTreeData();
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



  // 设置新的根节点并重排树
  const setRootNode = (newRootId) => {
    try {
      // 检查新根节点是否存在
      const nodeExists = treeData?.nodes.some(node => node.id === newRootId);
      if (!nodeExists) {
        console.error('指定的根节点不存在');
        return false;
      }
      
      // 重新排列树
      const rearrangedData = rearrangeTreeNodes(treeData, newRootId);
      if (rearrangedData) {
        setTreeData(rearrangedData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('设置根节点失败:', error);
      return false;
    }
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    isLoading: isLoading,
    treeData: treeData,
    setRootNode: setRootNode
  }));

  // 当树数据加载完成后，设置默认选中的根节点
  useEffect(() => {
    if (treeData && treeData.rootNode) {
      setSelectedRootNode(treeData.rootNode);
    }
  }, [treeData]);

  // 处理换根操作
  const handleRootChange = () => {
    if (selectedRootNode) {
      setRootNode(selectedRootNode);
    }
  };

  return (
    <div className="relative">
      {/* 初始界面 - 树的展示 */}
      <div className="">
        {isLoading ? (
          <div className="w-full h-[500px] flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-600">加载树数据中...</p>
            </div>
          </div>
        ) : treeData ? (
          <div className="flex flex-col items-start">
            <div className="flex items-start">
              <GraphCanvas 
                ref={graphCanvasRef}
                key={`graph-${treeData.rootNode}`}
                width={treeData.width || 1200}
                height={treeData.height || 500}
                graphData={treeData}
                isLoading={false}
                backgroundImage={null}
              />
            {animationList && animationList.length > 0 && (
              <div className="ml-4 mt-2">
                <div className="space-y-2">
                  {/* 统一渲染按钮配置 */}
                  {(() => {
                    const buttonConfigs = [
                      { id: 'dfs', label: '深度优先搜索(DFS)', type: 'modal', icon: null },
                      { id: 'bfs', label: '广度优先搜索(BFS)', type: 'modal', icon: null },
                      {
                        id: 'adjacencyMatrix',
                        label: '邻接矩阵',
                        type: 'modal',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        )
                      },
                      {
                        id: 'adjacencyList',
                        label: '邻接表',
                        type: 'modal',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )
                      },
                      {
                        id: 'ShowScc',
                        label: '展示强连通分量',
                        type: 'canvas',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        )
                      },
                      {
                        id: 'ShowBcc',
                        label: '展示边双连通分量',
                        type: 'canvas',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        )
                      },
                      {
                        id: 'ShowPbcc',
                        label: '展示点双连通分量',
                        type: 'canvas',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        )
                      },
                      {
                        id: 'BuildRST',
                        label: '构建圆方树',
                        type: 'canvas',
                        isOneTime: true,
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        )
                      },
                      {
                        id: 'ShowAugmentingPath',
                        label: '展示增广路径',
                        type: 'canvas',
                        isOneTime: true,
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        )
                      },
                      {
                        id: 'ShowDfnRange',
                        label: '展示dfn范围',
                        type: 'canvas',
                        isOneTime: true,
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h12M4 18h8" />
                          </svg>
                        )
                      }
                    ];

                    const handleButtonClick = (config) => {
                      if (config.isOneTime && clickedButtons.has(config.id)) return;
                      if (config.type === 'modal') {
                        selectAlgorithmAndOpenModal(config.id);
                      } else if (config.type === 'canvas') {
                        if (config.id === 'ShowScc' || config.id === 'ShowPbcc' || config.id === 'ShowBcc') {
                          if (treeData?.Indicators && graphCanvasRef.current?.dispatchOperation) {
                            const indicatorsToAdd = [...treeData.Indicators];
                            indicatorsToAdd.forEach(indicator => {
                              graphCanvasRef.current.dispatchOperation('addIndicator', indicator);
                            });
                            setTimeout(() => {
                              indicatorsToAdd.forEach(indicator => {
                                graphCanvasRef.current.dispatchOperation('removeIndicator', indicator.id);
                              });
                            }, 10000);
                          }
                        } else if (config.id === 'BuildRST') {
                          if (graphCanvasRef.current?.dispatchOperation) {
                            const nodesToAdd = [...(treeData?.PbccAddNodes || [])];
                            nodesToAdd.forEach(node => {
                              graphCanvasRef.current.dispatchOperation('addNode', node);
                            });
                            const edgesToDelete = [...(treeData?.PbccDeleteEdges || [])];
                            setTimeout(() => {
                              edgesToDelete.forEach(edge => {
                                graphCanvasRef.current.dispatchOperation('deleteEdge', edge.data);
                              });
                              const edgesToAdd = [...(treeData?.PbccAddEdges || [])];
                              setTimeout(() => {
                                edgesToAdd.forEach(edge => {
                                  graphCanvasRef.current.dispatchOperation('addEdge', edge);
                                });
                              }, 3000);
                            }, 3000);
                          }
                        } else if (config.id === 'ShowAugmentingPath') {
                          if (graphCanvasRef.current?.dispatchOperation && treeData) {
                            (treeData.OldIndicators || []).forEach(indicator => {
                              graphCanvasRef.current.dispatchOperation('addIndicator', indicator);
                            });
                            setTimeout(() => {
                              (treeData.AugmentingPathEdges || []).forEach((edge, index) => {
                                setTimeout(() => {
                                  graphCanvasRef.current.dispatchOperation('addIndicator', edge);
                                }, index * 500);
                              });
                              setTimeout(() => {
                                (treeData.NewIndicators || []).forEach(indicator => {
                                  graphCanvasRef.current.dispatchOperation('addIndicator', indicator);
                                });
                                (treeData.OldIndicators || []).forEach(indicator => {
                                  graphCanvasRef.current.dispatchOperation('removeIndicator', indicator.id);
                                });
                              }, 500 * (treeData.AugmentingPathEdges || []).length);
                            }, 3000);
                          }
                        } else if (config.id === 'ShowDfnRange') {
                          if (graphCanvasRef.current?.dispatchOperation && treeData) {
                            (treeData.DfnRangeIndicators || []).forEach(indicator => {
                              graphCanvasRef.current.dispatchOperation('addIndicator', indicator);
                            });
                          }
                        }
                      }
                      if (config.isOneTime) {
                        setClickedButtons(prev => new Set(prev).add(config.id));
                      }
                    };

                    return buttonConfigs
                      .filter(config => animationList.includes(config.id))
                      .map(config => (
                        <button
                          key={config.id}
                          onClick={() => handleButtonClick(config)}
                          disabled={!treeData || isLoading || (config.isOneTime && clickedButtons.has(config.id))}
                          className={`px-4 py-2 rounded-md transition-colors w-full ${(
                            (!treeData || isLoading)
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
            
            {/* 换根选项框 */}
            {enableRootChange && (
              <div className="mt-4">
                <div className="flex items-center space-x-4">
                  <label htmlFor="rootNodeSelect" className="text-gray-700 font-medium">选择根节点：</label>
                  <select
                    id="rootNodeSelect"
                    value={selectedRootNode}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setSelectedRootNode(newValue);
                      if (!isLoading && newValue) {
                        setRootNode(newValue); // 直接调用setRootNode而不是通过handleRootChange
                      }
                    }}
                    disabled={isLoading}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {treeData.nodes.map(node => (
                      <option key={node.id} value={node.id}>
                        {node.label || node.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-[500px] flex items-center justify-center bg-gray-50">
            <p className="text-gray-600">树数据加载失败</p>
          </div>
        )}
      </div>

      {/* 动画浮动窗口 - 使用GraphAlgorithmMotion组件 */}
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
                      <DfsMotion ref={algorithmMotionRef} graphData={treeData} />
                    )}
                    {currentAlgorithm === 'bfs' && (
                      <BfsMotion ref={algorithmMotionRef} graphData={treeData} />
                    )}
                    {currentAlgorithm === 'adjacencyMatrix' && (
                      <AdjacencyMatrixMotion ref={algorithmMotionRef} graphData={treeData} />
                    )}
                    {currentAlgorithm === 'adjacencyList' && (
                      <AdjacencyListMotion ref={algorithmMotionRef} graphData={treeData} />
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

TreeAlgorithmVisualization.displayName = 'TreeAlgorithmVisualization';

export default TreeAlgorithmVisualization;
