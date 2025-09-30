import { useEffect } from 'react'
import anime from 'animejs'

const StringAlgorithms = () => {
  useEffect(() => {
    // 页面进入动画
    anime({
      targets: '.page-content',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      easing: 'easeOutQuad'
    })
  }, [])

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="page-content max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">字符串算法可视化</h1>
            <p className="text-gray-600">探索字符串匹配、编辑距离等算法的执行过程</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center py-16">
              <svg className="h-24 w-24 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-500 mb-2">内容开发中</h2>
              <p className="text-gray-400">此页面的可视化内容正在开发中，敬请期待...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StringAlgorithms