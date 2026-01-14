import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import './index.css';

// 懒加载组件
const Home = lazy(() => import('./pages/Home'));
 
const KnowledgeGraphPage = lazy(() => import('./pages/KnowledgeGraphPage'));
const CoursewareList = lazy(() => import('./pages/CoursewareList'));
const CoursewareDetail = lazy(() => import('./pages/CoursewareDetail'));
const VisualizationsIndex = lazy(() => import('./pages/VisualizationsIndex'));
const VisualizationsDetail = lazy(() => import('./pages/VisualizationsDetail'));
const LogList = lazy(() => import('./pages/LogList'));
const NotFound = lazy(() => import('./pages/NotFound'));

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // 监听滚动事件，更新导航栏样式
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    { name: '主页', path: '/' },
    { name: '内容', path: '/courseware' },
    { name: '知识图谱', path: '/knowledge-graph' },
    //{ name: '可视化模块', path: '/visualizations' },
    { name: '随笔', path: '/logs' },
  ]

  // 加载中的占位组件
  const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">加载中...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar 
        menuItems={menuItems}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        hasScrolled={hasScrolled}
        currentPath={location.pathname}
      />
      
      <ScrollToTop />
      
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home menuItems={menuItems} />} />
          
          <Route path="/knowledge-graph" element={<KnowledgeGraphPage />} />
          <Route path="/courseware" element={<CoursewareList />} />
          <Route path="/courseware/:id" element={<CoursewareDetail />} />
          <Route path="/visualizations" element={<VisualizationsIndex />} />
          <Route path="/visualizations/:slug" element={<VisualizationsDetail />} />
          <Route path="/logs" element={<LogList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}

// 包装应用
function App() {
  return (
    <AppContent />
  )
}

export default App
