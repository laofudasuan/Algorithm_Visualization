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

  const algorithmCards = [
    {
      title: '图算法可视化',
      description: '探索最短路径、最小生成树、拓扑排序等图算法的运行过程',
      icon: '<svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>',
      path: '/graph-visualization'
    },
    {
      title: '动态规划可视化',
      description: '直观理解动态规划问题的状态转移和最优子结构',
      icon: '<svg className="h-10 w-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>',
      path: '/dynamic-programming'
    },
    {
      title: '基础算法可视化',
      description: '深入理解排序、搜索等基础算法的工作原理',
      icon: '<svg className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>',
      path: '/basic-algorithms'
    },
    {
      title: '字符串算法可视化',
      description: '探索字符串匹配、编辑距离等算法的执行过程',
      icon: '<svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
      path: '/string-algorithms'
    }
  ]

  const scrollToCatalog = () => {
    try {
      const el = document.querySelector('.py-20')
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset
        window.scrollTo({ top, behavior: 'smooth' })
      } else {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
      }
    } catch {
      window.scrollTo(0, window.innerHeight)
    }
  }

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
                  borderRadius: '0.5rem',
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
                欢迎来到<span className="text-primary">算法动画</span>播放厅
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

        {/* 向下提示 */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* 目录区域 */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">探索算法类别</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">选择一个算法类别开始您的可视化学习之旅</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {algorithmCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }}
              >
                <Link
                  to={card.path}
                  className="block catalog-card bg-white rounded-xl shadow-md overflow-hidden card-hover opacity-100"
                >
                  <div className="p-6">
                    <div className="flex justify-center mb-6">
                      <div dangerouslySetInnerHTML={{ __html: card.icon }} />
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-3">{card.title}</h3>
                    <p className="text-gray-600 text-center">{card.description}</p>
                    <div className="mt-6 flex justify-center">
                      <span className="text-primary font-medium flex items-center group">
                        查看详情
                        <svg className="w-4 h-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home