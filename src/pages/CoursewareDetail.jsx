import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import anime from 'animejs/lib/anime.es.js';
import 'katex/dist/katex.min.css';

const CoursewareDetail = () => {
  const { id } = useParams();
  const [courseware, setCourseware] = useState(null);
  const [CoursewareContent, setCoursewareContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 页面进入动画
    anime({
      targets: 'body',
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutQuad'
    });

    const loadCourseware = async () => {
      try {
        // 动态导入对应的MDX课件文件
        const coursewareModule = await import(`../data/courseware/${id}.mdx`);
        
        // 提取frontmatter信息
        setCourseware({
          id,
          ...coursewareModule.attributes
        });
        
        // 设置MDX内容组件
        setCoursewareContent(() => coursewareModule.default);
      } catch (err) {
        console.error('加载课件失败:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadCourseware();
  }, [id]);

  // 处理页面滚动
  const handleScroll = () => {
    if (contentRef.current) {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      const pageElements = contentRef.current.querySelectorAll('[data-page]');
      
      for (let i = 0; i < pageElements.length; i++) {
        const pageElement = pageElements[i];
        const pageTop = pageElement.offsetTop;
        const pageBottom = pageTop + pageElement.offsetHeight;
        
        if (scrollPosition >= pageTop && scrollPosition <= pageBottom) {
          if (currentPage !== i) {
            setCurrentPage(i);
          }
          break;
        }
      }
    }
  };

  // 更新页面计数
  useEffect(() => {
    const updatePageCount = () => {
      if (contentRef.current) {
        const pageElements = contentRef.current.querySelectorAll('[data-page]');
        setPageCount(pageElements.length);
      }
    };

    // 等待内容渲染完成
    setTimeout(updatePageCount, 100);
  }, [CoursewareContent]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 container mx-auto px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !courseware || !CoursewareContent) {
    return (
      <div className="min-h-screen pt-32 pb-20 container mx-auto px-4">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-bold mb-4">课件不存在或已被删除</h3>
          <button 
            onClick={() => navigate('/courseware')}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            返回课件列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 container mx-auto px-4">
      {/* 返回按钮 */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/courseware')}
        className="mb-6 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        返回课件列表
      </motion.button>

      {/* 课件标题和元信息 */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-4">{courseware.title || '未命名课件'}</h1>
        <p className="text-gray-600 mb-4">{courseware.description || '暂无描述'}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>作者: {courseware.author || '未知'}</span>
          <span>创建时间: {courseware.createdAt || '未知'}</span>
        </div>
      </motion.div>

      {/* 分页指示器 */}
      {pageCount > 0 && (
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-2">
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const element = document.querySelector(`[data-page="${index}"]`);
                if (element) {
                  window.scrollTo({
                    top: element.offsetTop - 100,
                    behavior: 'smooth'
                  });
                }
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                currentPage === index ? 'bg-primary scale-125' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* 课件内容 */}
      <motion.div 
        className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-3xl mx-auto relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div ref={contentRef}>
          <Suspense fallback={<div className="text-center py-8">正在渲染内容...</div>}>
            <CoursewareContent />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
};

export default CoursewareDetail;