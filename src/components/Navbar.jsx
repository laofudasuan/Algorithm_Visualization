import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import anime from 'animejs'

const Navbar = ({ menuItems, isMenuOpen, setIsMenuOpen, hasScrolled, currentPath }) => {
  // 菜单项动画效果
  useEffect(() => {
    if (isMenuOpen) {
      anime({
        targets: '.mobile-menu-item',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 300,
        delay: (el, i) => i * 50,
        easing: 'easeOutQuad'
      })
    }
  }, [isMenuOpen])

  // 导航栏滚动动画
  useEffect(() => {
    const navElement = document.getElementById('navbar')
    if (navElement) {
      anime({
        targets: navElement,
        backgroundColor: hasScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        boxShadow: hasScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
        paddingTop: hasScrolled ? '0.75rem' : '1.5rem',
        paddingBottom: hasScrolled ? '0.75rem' : '1.5rem',
        duration: 300,
        easing: 'easeInOutQuad'
      })
    }
  }, [hasScrolled])

  return (
    <nav 
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${hasScrolled ? 'nav-scrolled' : ''}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight">算法可视化</span>
            </Link>
          </div>
          
          {/* 桌面导航 */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item, index) => (
              <NavLink 
                key={index} 
                to={item.path}
                isActive={currentPath === item.path}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
          
          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-primary focus:outline-none"
              aria-label="菜单"
            >
              <svg 
                className={`h-6 w-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`mobile-menu-item block px-3 py-2 rounded-md text-base font-medium ${currentPath === item.path ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

// 导航链接组件，带有动画效果
const NavLink = ({ to, children, isActive, onClick }) => {
  const [hovered, setHovered] = useState(false)
  
  return (
    <Link
      to={to}
      className={`relative inline-flex items-center px-1 pt-1 text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <span 
        className={`absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${hovered || isActive ? 'w-full' : 'w-0'}`}
      />
    </Link>
  )
}

export default Navbar