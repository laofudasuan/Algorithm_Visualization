import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'

const Home = ({ menuItems }) => {
  const [showCatalog, setShowCatalog] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [randomPosition, setRandomPosition] = useState({ x: 0, y: 0 })
  const controls = useAnimation()

  useEffect(() => {
    setShowCatalog(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    
    // 生成随机位置的函数 - 在整个视口范围内
    const generateRandomPosition = () => {
      if (typeof window !== 'undefined') {
        // 获取整个视口的尺寸
        const maxX = window.innerWidth - 32 // 减去立方体宽度
        const maxY = window.innerHeight - 32 // 减去立方体高度
        // 生成随机位置
        const x = Math.random() * maxX
        const y = Math.random() * maxY
        return { x, y }
      }
      // 降级方案：默认位置
      return { x: 100, y: 100 }
    }
    
    // 初始设置随机位置
    setRandomPosition(generateRandomPosition())
    
    // 设置定时器，定期更新随机位置
    const interval = setInterval(() => {
      setRandomPosition(generateRandomPosition())
    }, 3000) // 每3秒更换一次位置
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.2 }
    })
  }, [controls])

  const dotVariants = {
    hidden: { opacity: 0 },
    visible: i => ({
      opacity: Math.random() * 0.5 + 0.2,
      transition: {
        delay: i * 0.1,
        duration: 1.2
      }
    }),
    fadeOut: {
      opacity: 0,
      transition: {
        duration: 1.2
      }
    },
    fadeIn: {
      opacity: Math.random() * 0.5 + 0.2,
      transition: {
        duration: 1.2
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-light to-gray-100"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />

        {/* 装饰点 */}
        <div className="animated-dots absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              variants={dotVariants}
              className="dot absolute rounded-full bg-primary/50"
              animate={{ 
                opacity: [0, Math.random() * 0.5 + 0.5, 0],
                scale: [0, 1, 0],
              }}
              transition={{ 
                duration: 3 + Math.random() * 5,
                repeat: Infinity,
                repeatType: "loop",
                delay: i * 0.5,
                times: [0, 0.5, 1],
              }}
              style={(() => {
                  // 使用同一个随机值确保宽高相同
                  const size = Math.random() * 30 + 10
                  return {
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }
                })()}
            />
          ))}
        </div>

        {/* 3D 立方体 - 在整个视口范围内随机移动 */}
        <motion.div 
          className="absolute w-32 h-32 pointer-events-none"
          style={{ perspective: '1200px' }}
          animate={{ 
            left: randomPosition.x,
            top: randomPosition.y,
            transition: { duration: 1.5, ease: 'easeInOut' } // 平滑过渡到新位置
          }}
        >
          <motion.div 
            className="w-full h-full relative"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ 
              rotateX: 360, 
              rotateY: 360 
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear"
            }}
          >
            {/* 3D立方体 - 使用数据驱动的方式渲染六个面 */}
            {[
              // 前面 - 动态规划
              { text: '动态规划', bgColor: 'rgba(59, 130, 246, 0.85)', transform: 'translateZ(64px)' },
              // 后面 - 图论
              { text: '图论', bgColor: 'rgba(139, 92, 246, 0.85)', transform: 'rotateY(180deg) translateZ(64px)' },
              // 上面 - 数据结构
              { text: '数据结构', bgColor: 'rgba(16, 185, 129, 0.85)', transform: 'rotateX(90deg) translateZ(64px)' },
              // 下面 - 字符串
              { text: '字符串', bgColor: 'rgba(245, 158, 11, 0.85)', transform: 'rotateX(-90deg) translateZ(64px)' },
              // 左面 - 数学
              { text: '数学', bgColor: 'rgba(236, 72, 153, 0.85)', transform: 'rotateY(-90deg) translateZ(64px)' },
              // 右面 - 基础算法
              { text: '基础算法', bgColor: 'rgba(8, 145, 178, 0.85)', transform: 'rotateY(90deg) translateZ(64px)' }
            ].map((face, index) => (
              <div 
                key={index}
                className="absolute w-full h-full flex items-center justify-center text-white text-lg md:text-xl font-bold text-center"
                style={{ 
                  backgroundColor: face.bgColor,
                  backfaceVisibility: 'hidden',
                  transform: face.transform
                }}
              >
                <div className="break-words p-2 md:p-4">{face.text}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

          {/* 主文案 */}
        <div
          className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto">
            {/* 左侧文本内容 */}
            <div className="text-center md:text-left md:w-1/2 mb-8 md:mb-0">
              <motion.h1
                className="hero-title text-4xl md:text-6xl font-bold leading-tight mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                欢迎来到<span className="text-primary">算法世界</span>
              </motion.h1>
              <motion.p
                className="hero-subtitle text-xl text-gray-600 mb-10 max-w-md mx-auto md:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                QQ群：251998253
              </motion.p>
              <div className="flex justify-center md:justify-start" />
            </div>
            
            {/* 右侧图片 */}
            <div className="md:w-1/2 flex justify-center">
              <motion.img
                src="/images/teng10.png"
                alt="算法动画"
                className="w-full max-w-xs h-auto"
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: 1, scale: 0.8 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </div>
          </div>
        </div>

      </section>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          湘ICP备2025147087号
        </div>
      </footer>
    </div>
  )
}

export default Home
