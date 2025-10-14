import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const Navbar = ({ menuItems, isMenuOpen, setIsMenuOpen, hasScrolled, currentPath }) => {
  // 用于存储哪个下拉菜单是打开的
  const [openDropdown, setOpenDropdown] = useState(null)
  // 用于检测点击外部区域关闭下拉菜单
  const dropdownRefs = useRef({})
  // 引用导航栏元素
  const navRef = useRef(null)

  // 检查是否在课件子页面（不是主页）
  const isCoursewareSubpage = currentPath.startsWith('/courseware/') && currentPath !== '/courseware'

  // 检测点击外部区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 检查是否点击了下拉菜单或其内容区域之外
      const isOutsideAllDropdowns = Object.values(dropdownRefs.current).every(ref => {
        return !ref || !ref.contains(event.target)
      })
      
      if (isOutsideAllDropdowns && openDropdown !== null) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  // 导航栏样式直接通过Tailwind类实现，使用transition-all来保证匀速动画
  const navClass = isCoursewareSubpage ? 
    'bg-white py-0.25 transition-all duration-500 linear' : 
    (hasScrolled ? 'bg-white py-3 transition-all duration-500 linear' : 'bg-transparent py-6 transition-all duration-500 linear')
  const shadowClass = (hasScrolled || isCoursewareSubpage) ? 'shadow-md' : ''

  // 处理下拉菜单的显示/隐藏
  const toggleDropdown = (index, event) => {
    event.preventDefault()
    // 简单的状态切换，不再使用anime动画
    setOpenDropdown(openDropdown === index ? null : index)
  }

  // 检查某个路径是否为当前活动路径或其子路径
  const isActivePath = (path) => {
    return currentPath === path || currentPath.startsWith(path + '/')
  }

  // 在课件子页面中显示最小化导航栏
  if (isCoursewareSubpage) {
    return (
      <nav 
        id="navbar"
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 ${navClass} ${shadowClass}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start items-center py-0.25">
            <Link 
              to="/courseware" 
              className="flex items-center justify-center"
              aria-label="返回课件列表"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav 
      id="navbar"
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 ${navClass} ${shadowClass}`}
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
              <span className="font-bold text-xl tracking-tight">可视化网站</span>
            </Link>
          </div>
          
          {/* 桌面导航 */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item, index) => {
              // 检查菜单项是否有子菜单
              if (item.children && item.children.length > 0) {
                // 有子菜单的菜单项
                return (
                  <div 
                    key={index}
                    className="relative"
                    ref={el => dropdownRefs.current[index] = el}
                  >
                    <button
                      onClick={(e) => toggleDropdown(index, e)}
                      className={`group inline-flex items-center px-1 pt-1 text-sm font-medium ${isActivePath(item.path) ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
                    >
                      <span>{item.name}</span>
                      <svg 
                        className={`ml-1 h-4 w-4 transition-transform duration-300 ${openDropdown === index ? 'transform rotate-180' : ''}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                  {/* 下拉菜单 */}
                      <div 
                        className={`dropdown-menu-${index} absolute right-0 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 md:block overflow-hidden min-w-[240px] transition-all duration-300 transform origin-top-right ${openDropdown === index ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                      >
                        <div className="flex p-1">
                          {item.children.map((childItem, childIndex) => (
                            <Link
                              key={childIndex}
                              to={childItem.path}
                              className={`flex-1 text-center px-4 py-1.5 rounded-md transition-all duration-200 min-w-[100px] text-sm font-medium ${currentPath === childItem.path ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-primary'}`}
                              onClick={() => {
                                setOpenDropdown(null)
                                setIsMenuOpen(false)
                              }}
                            >
                              {childItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                  </div>
                )
              } else {
                // 普通菜单项
                return (
                  <NavLink 
                    key={index} 
                    to={item.path}
                    isActive={currentPath === item.path}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                )
              }
            })}
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
            {menuItems.map((item, index) => {
              // 检查菜单项是否有子菜单
              if (item.children && item.children.length > 0) {
                // 有子菜单的菜单项
                return (
                  <div key={index} className="mobile-menu-item">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        // 简单切换显示/隐藏子菜单
                        const submenu = e.currentTarget.nextElementSibling
                        submenu.classList.toggle('hidden')
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex justify-between items-center ${isActivePath(item.path) ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span>{item.name}</span>
                      <svg 
                        className="h-4 w-4"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* 移动端子菜单 */}
                    <div className="ml-4 mt-1 space-y-1 hidden">
                      {item.children.map((childItem, childIndex) => (
                        <Link
                          key={childIndex}
                          to={childItem.path}
                          className={`block px-3 py-2 rounded-md text-sm font-medium min-w-[200px] ${currentPath === childItem.path ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-primary'}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {childItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              } else {
                // 普通菜单项
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`mobile-menu-item block px-3 py-2 rounded-md text-base font-medium ${currentPath === item.path ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              }
            })}
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