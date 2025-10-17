import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GraphVisualizationList = () => {
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 使用动态导入来获取目录中的JSON文件信息
    const loadVisualizations = async () => {
      try {
        setLoading(true);
        
        // 使用Vite的import.meta.globEager来静态分析和导入所有json文件
        const jsonFiles = import.meta.glob('/src/data/graph_visualizations/*.json', { eager: true });
        
        // 处理每个json文件，提取配置信息
        const visualizationData = Object.entries(jsonFiles).map(([filepath, module]) => {
          // 从文件路径中提取ID
          const id = filepath.split('/').pop().replace('.json', '');
          
          return {
            id,
            ...module.default
          };
        });
        
        // 模拟加载延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setVisualizations(visualizationData);
      } catch (error) {
        console.error('加载可视化文件失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVisualizations();
  }, []);
  
  // 导航到详情页面
  const navigateToVisualization = (id) => {
    navigate(`/graph-visualization/${id}`);
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
            className="page-content max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">图算法可视化</h1>
            <p className="text-gray-600">探索各种图算法的运行过程和原理</p>
          </div>
          
          {/* 加载中的占位组件 */}
          {loading && (
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600 ml-4">正在加载图算法可视化模块...</p>
              </div>
            </div>
          )}
          
          {/* 动态显示找到的可视化模块 */}
          <AnimatePresence>
            {!loading && visualizations.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {visualizations.map((viz, index) => (
                  <motion.div
                    key={viz.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    onClick={() => navigateToVisualization(viz.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-8 flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-shrink-0">
                        <svg className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-grow text-left">
                        <h2 className="text-2xl font-bold mb-2 text-primary">{viz.displayName || viz.title}</h2>
                        <p className="text-gray-600 mb-4">
                          {viz.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {viz.tags && viz.tags.map((tag, tagIndex) => {
                            // 根据标签索引选择不同的背景色
                            const colors = ['blue', 'green', 'purple', 'yellow']
                            const colorIndex = tagIndex % colors.length
                            return (
                              <span key={tagIndex} className={`bg-${colors[colorIndex]}-100 text-${colors[colorIndex]}-800 text-xs px-2 py-1 rounded`}>
                                {tag}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {/* 当没有找到可视化模块时显示的内容 */}
            {!loading && visualizations.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-md p-8"
              >
                <div className="text-center py-16">
                  <svg className="h-24 w-24 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-2xl font-semibold text-gray-500 mb-2">未找到可视化模块</h2>
                  <p className="text-gray-400">在src/data/graph_visualizations目录下未找到任何可视化模块文件。</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default GraphVisualizationList;