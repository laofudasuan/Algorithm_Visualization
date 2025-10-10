import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import 'katex/dist/katex.min.css';
const CoursewareDetail = () => {
  const { id } = useParams();
  const [courseware, setCourseware] = useState(null);
  const [pageComponents, setPageComponents] = useState([]);
  const [pageAttributes, setPageAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [direction, setDirection] = useState('right'); // 'left' or 'right' to control animation direction
  const [showMainPage, setShowMainPage] = useState(true); // 控制显示主页还是子页面
  const contentRef = useRef(null);
  useEffect(() => {
    const loadCourseware = async () => {
      try {
        // 动态导入对应的MDX课件文件
        const coursewareModule = await import(`../data/courseware/${id}.mdx`);
        
        // 提取frontmatter信息
        setCourseware({
          id,
          ...coursewareModule.attributes
        });
        
        // 检查是否有分页配置
        if (coursewareModule.attributes.pages && Array.isArray(coursewareModule.attributes.pages)) {
          const components = [];
          const attributes = [];
          
          // 导入所有页面组件 - 使用@vite-ignore解决动态导入警告
          for (const pageFile of coursewareModule.attributes.pages) {
            try {
              // 添加 @vite-ignore 注释以抑制警告
              const pageModule = await import(/* @vite-ignore */ `../data/courseware/pages/${pageFile}`);
              components.push(pageModule.default);
              attributes.push(pageModule.attributes || {});
            } catch (pageError) {
              console.error(`加载页面 ${pageFile} 失败:`, pageError);
            }
          }
          
          setPageComponents(components);
          setPageAttributes(attributes);
          setPageCount(components.length);
        } else {
          // 兼容旧格式
          setPageComponents([coursewareModule.default]);
          setPageAttributes([coursewareModule.attributes]);
          setPageCount(1);
        }
      } catch (err) {
        console.error('加载课件失败:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadCourseware();
  }, [id]);

  // 处理上一页导航
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setDirection('left'); // 设置动画方向为向左
      setCurrentPage(currentPage - 1);
    }
  };

  // 处理下一页导航
  const goToNextPage = () => {
    if (currentPage < pageCount - 1) {
      setDirection('right'); // 设置动画方向为向右
      setCurrentPage(currentPage + 1);
    }
  };

  // 从主页进入子页面
  const goToFirstPage = () => {
    setShowMainPage(false);
    setCurrentPage(0);
  };

  // 从子页面返回主页
  const goBackToMainPage = () => {
    setShowMainPage(true);
  };

  // 处理进度条点击事件，跳转到对应页面
  const handlePageClick = (index) => {
    if (index === currentPage) return;
    
    // 根据目标页面设置动画方向
    setDirection(index > currentPage ? 'right' : 'left');
    setCurrentPage(index);
  };

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen pt-32 pb-20 container mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </motion.div>
    );
  }

  if (error || !courseware) {
    return (
      <motion.div 
        className="min-h-screen pt-32 pb-20 container mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-bold mb-4">课件不存在或已被删除</h3>
        </div>
      </motion.div>
    );
  }

  // 主页视图
  if (showMainPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center container mx-auto px-4 pt-32 pb-32">

        {/* 课件标题和元信息 */}
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold mb-6">{courseware.title || '未命名课件'}</h1>
          <p className="text-xl text-gray-600 mb-8">{courseware.description || '暂无描述'}</p>
          <div className="flex flex-wrap justify-center gap-6 text-lg text-gray-500 mb-16">
            <span>作者: {courseware.author || '未知'}</span>
            <span>创建时间: {courseware.createdAt || '未知'}</span>
          </div>

          {/* 进入子页面按钮 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToFirstPage}
            className="px-10 py-4 bg-primary text-white rounded-md text-lg font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg"
          >
            Start
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // 子页面视图
  return (
    <motion.div 
      className="min-h-screen pt-12 pb-32 container mx-auto px-4 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 课件内容容器 - 左右滑动结构 */}
      <div className="max-w-3xl mx-auto relative" style={{ minHeight: '500px' }}>
        <div 
          ref={contentRef}
          className="relative overflow-hidden w-full h-full"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              className="w-full h-full"
              // 进入动画：从左右两侧滑入
              initial={{ opacity: 0, x: direction === 'right' ? '100%' : '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              // 退出动画：向中间收缩消失
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {pageComponents[currentPage] && (
                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 relative overflow-hidden text-lg md:text-xl font-medium">
                  <Suspense fallback={<div className="text-center py-8">正在渲染内容...</div>}>
                    {React.createElement(pageComponents[currentPage])}
                  </Suspense>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 左右分页导航按钮 - 窗口底部两侧 */}
      {pageCount > 0 && (
        <>
          {/* 左侧上一页按钮 */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: currentPage > 0 ? 1 : 0.5, x: 0 }}
            onClick={goToPrevPage}
            disabled={currentPage <= 0}
            className={`fixed bottom-8 left-8 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-300 ${currentPage <= 0 ? 'cursor-not-allowed' : ''}`}
            aria-label="上一页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          {/* 返回课件主页按钮 - 使用房子图标，放在右侧下一页按钮的左侧 */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={goBackToMainPage}
            className="fixed bottom-8 right-24 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-300"
            aria-label="返回课件主页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </motion.button>

          {/* 右侧下一页按钮 */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: currentPage < pageCount - 1 ? 1 : 0.5, x: 0 }}
            onClick={goToNextPage}
            disabled={currentPage >= pageCount - 1}
            className={`fixed bottom-8 right-8 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-300 ${currentPage >= pageCount - 1 ? 'cursor-not-allowed' : ''}`}
            aria-label="下一页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </>
      )}

      {/* 页面下方横向进度条 */}
      {pageCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-gray-200 h-2 z-30"
        >
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((currentPage + 1) / pageCount) * 100}%` }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default CoursewareDetail;