import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import anime from 'animejs'

const NotFound = () => {
  useEffect(() => {
    // 页面进入动画
    anime({
      targets: '.not-found-content',
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 800,
      easing: 'easeOutQuad'
    })

    // 数字404动画
    anime({
      targets: '.error-number',
      opacity: [0, 1],
      y: [-50, 0],
      duration: 1000,
      easing: 'easeOutBounce'
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="not-found-content max-w-md w-full text-center">
        <div className="error-number text-9xl font-bold text-gray-100 mb-6">404</div>
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
      </div>
    </div>
  )
}

export default NotFound