import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GraphCanvas from '../animation/GraphCanvas.jsx';
import { loadTreeData } from '../utils/TreeDataLoader.jsx';
import { rearrangeTreeNodes } from '../utils/TreeLayoutUtils.jsx';
import GraphAlgorithmMotion from './GraphAlgorithmMotion.jsx';

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
                      },
                      {
                        id: 'adjacencyList',
                        label: '邻接表',
                        colorClass: 'bg-purple-600 hover:bg-purple-700 text-white',
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                          disabled={!treeData || isLoading}
                          className={`px-4 py-2 rounded-md transition-colors w-full ${(
                            (!treeData || isLoading)
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
                    <GraphAlgorithmMotion 
                      ref={algorithmMotionRef}
                      graphData={treeData}
                      Algorithm={currentAlgorithm}
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

TreeAlgorithmVisualization.displayName = 'TreeAlgorithmVisualization';

export default TreeAlgorithmVisualization;