import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const VisualizationList = () => {
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 模拟加载可视化工具数据
    const loadVisualizations = async () => {
      try {
        // 动态导入目录中的所有.jsx文件
        const jsxFiles = import.meta.glob('/src/pages/visualization/*.jsx', { eager: true });
        
        // 处理每个jsx文件，提取基本信息
        const visualizationsData = Object.entries(jsxFiles).map(([filepath, module]) => {
          // 从文件路径中提取ID (例如从'/src/pages/visualization/ArrayVisualizationPage.jsx'提取'ArrayVisualizationPage')
          const id = filepath.split('/').pop().replace('.jsx', '');
          
          // 尝试从组件中提取标题和描述信息
          let title = id;
          let description = '';
          let cover = '';
          
          // 如果组件有默认导出并且有静态属性，则从中提取信息
          if (module.default) {
            if (module.default.title) {
              title = module.default.title;
            }
            if (module.default.description) {
              description = module.default.description;
            }
          }
          
          // 如果仍然没有标题，则根据文件名生成
          if (title === id) {
            title = id.replace(/([A-Z])/g, ' $1').trim();
          }
          
          // 如果没有描述，则生成默认描述
          if (!description) {
            description = `可视化工具: ${title}`;
          }
          
          return {
            id,
            title,
            description,
            cover
          };
        });
        
        setVisualizations(visualizationsData);
      } catch (error) {
        console.error('加载可视化工具数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVisualizations();
  }, []);

  // 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  // 转换ID为路径格式
  const getIdPath = (id) => {
    // 将驼峰命名转换为短横线分隔
    return id.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace('-page', '');
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
            <h1 className="text-4xl font-bold mb-4">可视化工具</h1>
            <p className="text-gray-600">
              探索各种算法和数据结构的可视化工具，帮助您更直观地理解它们的工作原理
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {visualizations.map((visualization) => (
                <motion.div
                  key={visualization.id}
                  variants={itemVariants}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/visualization/${getIdPath(visualization.id)}`)}
                >
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {visualization.cover ? (
                      <img 
                        src={visualization.cover} 
                        alt={visualization.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {(() => {
                            // 获取标题首字母
                            const title = visualization.title || 'V';
                            return title.charAt(0) || 'V';
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{visualization.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{visualization.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && visualizations.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="text-center py-12">
                <p className="text-gray-500">暂无可视化工具</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VisualizationList;