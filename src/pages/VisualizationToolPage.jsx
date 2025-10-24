import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const VisualizationToolPage = () => {
  const { toolName } = useParams();
  const navigate = useNavigate();
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 组件加载时隐藏Navbar
  useEffect(() => {
    document.body.classList.add('hide-navbar');
    
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, []);

  useEffect(() => {
    const loadComponent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 动态导入目录中的所有可视化工具组件
        const jsxFiles = import.meta.glob('./visualization/*.jsx');
        
        // 根据工具名称查找对应的组件
        const modulePath = `./visualization/${toolName}.jsx`;
        const moduleLoader = jsxFiles[modulePath];
        
        if (!moduleLoader) {
          throw new Error(`未知的可视化工具: ${toolName}`);
        }
        
        // 动态加载组件
        const module = await moduleLoader();
        setComponent(() => module.default);
      } catch (err) {
        console.error(`加载可视化工具失败: ${toolName}`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [toolName]);

  // 返回可视化工具列表
  const handleBack = () => {
    navigate('/visualization-tools');
  };

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full">
          <motion.div 
            className="text-center py-12"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-red-600 mb-4">加载失败</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              返回可视化工具
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (!Component) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full">
          <motion.div 
            className="text-center py-12"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">未找到组件</h2>
            <p className="text-gray-600">无法加载可视化工具组件</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // 包装组件以添加返回按钮和动画效果
  const WrappedComponent = () => {
    const OriginalComponent = Component;
    return (
      <div className="min-h-screen">
        {/* 返回按钮 */}
        <div className="fixed top-4 right-4 z-50">
          <button 
            onClick={handleBack}
            className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="返回"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* 主内容区 */}
        <div className="pt-20 pb-12 px-4">
          <div className="container mx-auto">
            <motion.div 
              className="max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <OriginalComponent />
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Suspense fallback={
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </motion.div>
    }>
      <WrappedComponent />
    </Suspense>
  );
};

export default VisualizationToolPage;