import React, { useState, useEffect, lazy, Suspense } from 'react';
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

      {/* 课件内容 */}
      <motion.div 
        className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Suspense fallback={<div className="text-center py-8">正在渲染内容...</div>}>
          <CoursewareContent />
        </Suspense>
      </motion.div>
    </div>
  );
};

export default CoursewareDetail;