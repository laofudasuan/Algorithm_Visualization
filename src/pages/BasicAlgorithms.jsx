import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const BasicAlgorithms = () => {
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
            <h1 className="text-4xl font-bold mb-4">基础算法可视化</h1>
            <p className="text-gray-600">深入理解排序、搜索等基础算法的工作原理</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">数据结构可视化</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/array-visualization" className="block">
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">数组可视化工具</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    交互式数组可视化工具，支持添加、删除、更新元素以及区域高亮显示功能。
                  </p>
                  <div className="text-blue-600 font-medium flex items-center">
                    立即体验
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
              
              <div className="border border-gray-200 rounded-lg p-6 opacity-50">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">链表可视化</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  链表数据结构的可视化演示，包括单向链表、双向链表和循环链表。
                </p>
                <div className="text-gray-400 font-medium">
                  开发中...
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">算法可视化</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 opacity-50">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">排序算法</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  常见排序算法的可视化演示，包括冒泡排序、快速排序、归并排序等。
                </p>
                <div className="text-gray-400 font-medium">
                  开发中...
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 opacity-50">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">搜索算法</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  搜索算法的可视化演示，包括二分搜索、深度优先搜索、广度优先搜索等。
                </p>
                <div className="text-gray-400 font-medium">
                  开发中...
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BasicAlgorithms