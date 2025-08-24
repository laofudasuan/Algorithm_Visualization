import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const navItems = [
    { name: '首页', path: '/' },
    { name: '图结构', path: '/graph' },
    { name: '算法', path: '/algorithm' },
    { name: '查找', path: '/search' },
    { name: '动态规划', path: '/dp' },
    { name: '链表', path: '/linkedlist' },
    { name: '优先队列', path: '/priorityqueue' },
    { name: '线段树', path: '/segmenttree' },
    { name: '平衡树', path: '/balancedtree' },
    { name: '树状数组', path: '/binarytree' },
    // { name: 'Python编程', path: '/local-python' },
    { name: 'Jupyter Notebook', path: '/local-jupyter' }
  ];

  const navStyle = {
    backgroundColor: '#1976d2',
    padding: '0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const ulStyle = {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'center',
    margin: '0',
    padding: '0',
    flexWrap: 'wrap'
  };

  const liStyle = {
    margin: '0'
  };

  const linkStyle = {
    display: 'block',
    color: 'white',
    textDecoration: 'none',
    padding: '15px 20px',
    transition: 'background-color 0.3s ease',
    fontWeight: '500'
  };

  const linkHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    fontWeight: 'bold'
  };

  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        {navItems.map((item) => (
          <li key={item.path} style={liStyle}>
            <Link
              to={item.path}
              style={location.pathname === item.path ? activeLinkStyle : linkStyle}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  Object.assign(e.target.style, linkHoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  Object.assign(e.target.style, linkStyle);
                }
              }}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navigation;