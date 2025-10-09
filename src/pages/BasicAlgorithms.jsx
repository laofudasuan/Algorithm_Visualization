import { motion } from 'framer-motion'

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
          
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center py-16">
              <svg className="h-24 w-24 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-500 mb-2">内容开发中</h2>
              <p className="text-gray-400">此页面的可视化内容正在开发中，敬请期待...</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BasicAlgorithms