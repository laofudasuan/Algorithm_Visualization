import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// 页面加载时立即执行的console.log，验证组件是否正常加载
console.log('CoursewareList组件已加载');

const CoursewareList = () => {
  const [coursewares, setCoursewares] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 立即打印加载开始信息
    console.log('开始加载内容数据');
    
    // 模拟加载内容数据
    const loadCoursewares = async () => {
      try {
        // 动态导入目录中的所有.mdx文件
        // 使用Vite的import.meta.globEager来静态分析和导入所有mdx文件
        const mdxFiles = import.meta.glob('/src/data/courseware/*.mdx', { eager: true });
        
        console.log('发现的MDX文件:', Object.keys(mdxFiles));
        
        // 处理每个mdx文件，提取frontmatter信息
        const coursewaresData = Object.entries(mdxFiles).map(([filepath, module]) => {
          // 从文件路径中提取ID (例如从'/src/data/courseware/courseware-001.mdx'提取'courseware-001')
          const id = filepath.split('/').pop().replace('.mdx', '');
          
          // 提取frontmatter数据，同时检查attributes和frontmatter属性
          const title = module.attributes?.title || module.frontmatter?.title || '未知标题';
          const description = module.attributes?.description || module.frontmatter?.description || '暂无描述';
          const author = module.attributes?.author || module.frontmatter?.author || '未知作者';
          const createdAt = module.attributes?.createdAt || module.frontmatter?.createdAt || '未知时间';
          const cover = module.attributes?.cover || module.frontmatter?.cover;
          
          console.log(`处理文件 ${filepath}:`, { id, title, description });
          
          return {
            id,
            title,
            description,
            author,
            createdAt,
            cover
          };
        });
        
        setCoursewares(coursewaresData);
      } catch (error) {
        console.error('加载内容数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCoursewares();
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
            <h1 className="text-4xl font-bold mb-4">内容区</h1>
            <p className="text-gray-600">
              探索算法世界的精彩内容，包含详细的概念讲解、数学公式和实例演示

              提示：目前网站架构的复杂度还比较高，打开页面需要加载一定时间，请耐心等待。（图比较多的内容可能要加载几分钟，刚开始打开是空的）
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
              {coursewares.map((courseware) => (
                <motion.div
                  key={courseware.id}
                  variants={itemVariants}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/courseware/${courseware.id}`)}
                >
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    // 先不加载图片，速度太慢
                    {false || courseware.cover ? (
                      <img 
                        src={courseware.cover} 
                        alt={courseware.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {(() => {
                            // 安全地获取标题首字母，如果没有标题则使用默认字母
                            const title = courseware.title || 'A';
                            return title.charAt(0) || 'A';
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{courseware.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{courseware.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{courseware.author}</span>
                      <span>{courseware.createdAt}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && coursewares.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="text-center py-12">
                <p className="text-gray-500">暂无可用内容</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CoursewareList;