import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GraphCanvas from '../components/animation/GraphCanvas';

const GraphVisualizationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visualization, setVisualization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const graphCanvasRef = useRef(null);
  
  // 组件加载时隐藏Navbar
  useEffect(() => {
    document.body.classList.add('hide-navbar');
    
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, []);
  
  useEffect(() => {
    const loadVisualization = async () => {
      try {
        setLoading(true);
        
        // 动态导入对应的JSON配置文件
        const vizModule = await import(`../data/graph_visualizations/${id}.json`);
        
        setVisualization({
          id,
          ...vizModule.default
        });
      } catch (err) {
        console.error('加载可视化配置失败:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadVisualization();
  }, [id]);
  
  // 返回列表页面
  const handleBack = () => {
    navigate('/graph-visualization');
  };
  
  // 执行动画序列
  const runAnimationSequence = (sequenceName) => {
    if (!graphCanvasRef.current || !visualization?.animations) return;
    
    const animation = visualization.animations[sequenceName];
    if (!animation || !animation.sequence || !animation.sequence.length) return;
    
    // 执行动画序列
    animation.sequence.forEach((step, index) => {
      setTimeout(() => {
        if (step.type && step.data) {
          graphCanvasRef.current.dispatchOperation(step.type, step.data);
        } else {
          console.error('无效的动画步骤:', step);
        }
      }, index * 500); // 每个动作间隔500ms
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">正在加载可视化内容...</p>
        </div>
      </div>
    );
  }

  if (error || !visualization) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-32 px-4">
        <div className="text-center max-w-md">
          <svg className="h-24 w-24 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-6">无法加载指定的可视化内容</p>
          <button 
            onClick={handleBack}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 返回按钮 */}
      <div className="fixed top-4 left-4 z-50">
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
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* 标题和描述 */}
            <div className="mb-8 text-center">
              <motion.h1 
                className="text-3xl font-bold mb-4 text-primary"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {visualization.displayName || visualization.title}
              </motion.h1>
              <motion.p 
                className="text-gray-600 max-w-3xl mx-auto"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {visualization.description}
              </motion.p>
            </div>
            
            {/* 图可视化区域 */}
            <div className="bg-transparent overflow-hidden mb-8">
              <div 
                style={{ 
                  width: visualization.width || '100%', 
                  height: visualization.height || '600px', 
                  margin: '0 auto',
                  backgroundColor: 'transparent'
                }}
              >
                <GraphCanvas 
                  ref={graphCanvasRef}
                  width={visualization.width || 1000}
                  height={visualization.height || 600}
                  initialGraph={visualization.initialGraph}
                  graphCount={visualization.graphNames?.length || 1}
                  graphNames={visualization.graphNames}
                />
              </div>
            </div>
            
            {/* 动画控制区域 */}
            {visualization.animations && Object.keys(visualization.animations).length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">动画控制</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(visualization.animations).map(([key, sequence]) => (
                    <button
                      key={key}
                      onClick={() => runAnimationSequence(key)}
                      className="bg-primary/10 hover:bg-primary/20 text-primary py-3 px-4 rounded-lg transition-colors text-left"
                    >
                      <div className="font-medium">{sequence.name || key}</div>
                      <div className="text-sm text-gray-600 mt-1">{sequence.description || '执行动画序列'}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 额外信息 */}
            {visualization.info && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">算法说明</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-600">{visualization.info}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizationDetail;