import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import './index.css';

// 懒加载组件
const Home = lazy(() => import('./pages/Home'));
const BasicAlgorithms = lazy(() => import('./pages/BasicAlgorithms'));
const StringAlgorithms = lazy(() => import('./pages/StringAlgorithms'));
const DynamicProgramming = lazy(() => import('./pages/DynamicProgramming'));
const GraphVisualization = lazy(() => import('./pages/GraphVisualization'));
const GraphVisualizationTools = lazy(() => import('./pages/GraphVisualizationTools'));
const GraphRender = lazy(() => import('./pages/GraphTest'));
const KnowledgeGraphPage = lazy(() => import('./pages/KnowledgeGraphPage'));
const CoursewareList = lazy(() => import('./pages/CoursewareList'));
const CoursewareDetail = lazy(() => import('./pages/CoursewareDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
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
    { 
      name: '可视化模块', 
      path: '/visualization', // 作为下拉菜单的触发点
      children: [
        { name: '图算法可视化', path: '/graph-visualization' },
        { name: '动态规划可视化', path: '/dynamic-programming' },
        { name: '基础算法可视化', path: '/basic-algorithms' },
        { name: '字符串算法可视化', path: '/string-algorithms' }
      ]
    },
    { name: '课件', path: '/courseware' },
    { name: '知识图谱', path: '/knowledge-graph' }
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
          <Route path="/graph-visualization" element={<GraphVisualization />} />
          <Route path="/graph-visualization-tools" element={<GraphVisualizationTools />} />
          <Route path="/graph-render" element={<GraphRender />} />
          <Route path="/dynamic-programming" element={<DynamicProgramming />} />
          <Route path="/basic-algorithms" element={<BasicAlgorithms />} />
          <Route path="/string-algorithms" element={<StringAlgorithms />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraphPage />} />
          <Route path="/courseware" element={<CoursewareList />} />
          <Route path="/courseware/:id" element={<CoursewareDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App