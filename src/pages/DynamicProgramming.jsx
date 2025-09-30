import { useEffect } from 'react'
import anime from 'animejs'

const DynamicProgramming = () => {
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
            <h1 className="text-4xl font-bold mb-4">动态规划可视化</h1>
            <p className="text-gray-600">直观理解动态规划问题的状态转移和最优子结构</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center py-16">
              <svg className="h-24 w-24 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

export default DynamicProgramming