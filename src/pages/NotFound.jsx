import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const NotFound = () => {
  // 使用Framer Motion的动画变体
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  const numberVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: "backOut"
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        className="not-found-content max-w-md w-full text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="error-number text-9xl font-bold text-gray-100 mb-6"
          variants={numberVariants}
        >404</motion.div>
        <h1 className="text-3xl font-bold mb-4">页面未找到</h1>
        <p className="text-gray-600 mb-8">抱歉，您访问的页面不存在或已被移除</p>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md shadow-md hover:bg-primary/90 transition-colors duration-300"
        >
          返回首页
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound