import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'

const Home = ({ menuItems }) => {
  const [showCatalog, setShowCatalog] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const controls = useAnimation()

  useEffect(() => {
    setShowCatalog(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
      transition: { delay: i * 0.1, duration: 0.8 }
    })
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
              animate="visible"
              variants={dotVariants}
              className="dot absolute rounded-full bg-primary/10"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>

        {/* 3D 立方体 —— 已修复重叠 */}
        <div
          className="absolute right-1/4 top-1/2"
          style={{
            width: 256,
            height: 256,
            perspective: 1500,
            transform: `translate3d(0, calc(-50% + ${scrollY * 0.2}px), 0)`
          }}
        >
          <motion.div
            className="w-full h-full relative"
            initial={{ opacity: 0, rotateY: 0, rotateX: 0 }}
            animate={{ opacity: 1, rotateY: 360, rotateX: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}
          >
            {/* 前面 */}
            <div
              className="absolute w-full h-full rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                backgroundColor: 'rgba(37,99,235,.8)',
                transform: 'translateZ(128px)'
              }}
            >
              <div className="text-center">
                <svg className="h-40 w-40 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <p className="mt-4 font-semibold text-white text-2xl">算法可视化</p>
              </div>
            </div>

            {/* 右面 */}
            <div
              className="absolute w-full h-full rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                backgroundColor: 'rgba(20,184,166,.8)',
                transform: 'rotateY(90deg) translateZ(128px)'
              }}
            >
              <div className="text-center">
                <svg className="h-40 w-40 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="mt-4 font-semibold text-white text-2xl">交互式学习</p>
              </div>
            </div>

            {/* 后面 */}
            <div
              className="absolute w-full h-full rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                backgroundColor: 'rgba(167,139,250,.8)',
                transform: 'rotateY(180deg) translateZ(128px)'
              }}
            >
              <div className="text-center">
                <svg className="h-40 w-40 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="mt-4 font-semibold text-white text-2xl">知识图谱</p>
              </div>
            </div>

            {/* 左面 */}
            <div
              className="absolute w-full h-full rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                backgroundColor: 'rgba(75,85,99,.8)',
                transform: 'rotateY(-90deg) translateZ(128px)'
              }}
            >
              <div className="text-center">
                <svg className="h-40 w-40 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <p className="mt-4 font-semibold text-white text-2xl">基础算法</p>
              </div>
            </div>

            {/* 顶面 */}
            <div
              className="absolute w-full h-full rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                backgroundColor: 'rgba(79,70,229,.8)',
                transform: 'rotateX(90deg) translateZ(128px)'
              }}
            >
              <div className="text-center">
                <svg className="h-40 w-40 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 font-semibold text-white text-2xl">深入探索</p>
              </div>
            </div>

            {/* 底面 */}
            <div
              className="absolute w-full h-full rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                backgroundColor: 'rgba(244,63,94,.8)',
                transform: 'rotateX(-90deg) translateZ(128px)'
              }}
            >
              <div className="text-center">
                <svg className="h-40 w-40 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="mt-4 font-semibold text-white text-2xl">动态课件</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 主文案 */}
        <div
          className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          <div className="max-w-3xl">
            <motion.h1
              className="hero-title text-4xl md:text-6xl font-bold text-center leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              通过<span className="text-primary">可视化</span>探索算法的奥秘
            </motion.h1>
            <motion.p
              className="hero-subtitle text-xl text-gray-600 text-center mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              直观理解复杂算法的工作原理，通过交互式动画掌握算法思想
            </motion.p>
            <div className="flex justify-center" />
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