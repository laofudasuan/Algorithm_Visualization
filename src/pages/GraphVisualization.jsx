import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const GraphVisualization = () => {

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
          
          {/* 图可视化工具模块介绍 */}
          <Link 
            to="/graph-visualization-tools" 
            className="block bg-white rounded-xl shadow-md overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <svg className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-grow text-left">
                <h2 className="text-2xl font-bold mb-2 text-primary">图可视化工具</h2>
                <p className="text-gray-600 mb-4">
                  使用交互式图可视化工具创建和探索图形数据。支持自定义节点大小、物理仿真参数调整、导出为PNG和SVG等功能。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">交互式绘图</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">物理仿真</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">多种导出格式</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">全屏模式</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* 图可视化测试模块介绍 */}
          <Link 
            to="/graph-visualization-test" 
            className="block bg-white rounded-xl shadow-md overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <svg className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-grow text-left">
                <h2 className="text-2xl font-bold mb-2 text-primary">图可视化测试</h2>
                <p className="text-gray-600 mb-4">
                  测试图可视化组件的各种功能，包括动态添加节点、边、修改样式和添加视觉指示器等。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">功能测试</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">动态更新</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">交互演示</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
          
          {/* 图算法模块介绍可以添加更多内容 */}
          
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center py-16">
              <svg className="h-24 w-24 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-500 mb-2">内容开发中</h2>
              <p className="text-gray-400">此页面的其他可视化内容正在开发中，敬请期待...</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default GraphVisualization