import { useState, useEffect } from 'react'
import anime from 'animejs'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      const newVisibility = window.pageYOffset > 300
      if (newVisibility !== isVisible) {
        setIsVisible(newVisibility)
        
        // 添加动画效果
        if (newVisibility) {
          anime({
            targets: '.scroll-to-top',
            opacity: 1,
            scale: 1,
            duration: 300,
            easing: 'easeOutQuad'
          })
        } else {
          anime({
            targets: '.scroll-to-top',
            opacity: 0,
            scale: 0.8,
            duration: 200,
            easing: 'easeInQuad'
          })
        }
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [isVisible])

  const scrollToTop = () => {
    anime({
      targets: window,
      scrollTop: 0,
      duration: 800,
      easing: 'easeInOutQuad',
      complete: () => {
        setIsVisible(false)
      }
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`scroll-to-top fixed bottom-6 right-6 p-3 rounded-full bg-primary text-white shadow-lg opacity-0 scale-0 z-40 transition-all duration-300 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
      aria-label="滚动到顶部"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  )
}

export default ScrollToTop