import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const navStyle = {
    backgroundColor: '#1976d2',
    padding: '16px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 20px'
  };

  const logoStyle = {
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    textDecoration: 'none'
  };

  const navLinksStyle = {
    display: 'flex',
    gap: '30px',
    alignItems: 'center'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease',
    fontWeight: '500'
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    fontWeight: 'bold'
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <div style={navLinksStyle}>
          <Link 
            to="/graph" 
            style={location.pathname === '/graph' ? activeLinkStyle : linkStyle}
            onMouseEnter={(e) => {
              if (location.pathname !== '/graph') {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/graph') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            图
          </Link>
          
          <Link 
            to="/algorithm" 
            style={location.pathname === '/algorithm' ? activeLinkStyle : linkStyle}
            onMouseEnter={(e) => {
              if (location.pathname !== '/algorithm') {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/algorithm') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            排序
          </Link>
          
          <Link 
            to="/search" 
            style={location.pathname === '/search' ? activeLinkStyle : linkStyle}
            onMouseEnter={(e) => {
              if (location.pathname !== '/search') {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/search') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            搜索
          </Link>
          
          <Link 
            to="/dp" 
            style={location.pathname === '/dp' ? activeLinkStyle : linkStyle}
            onMouseEnter={(e) => {
              if (location.pathname !== '/dp') {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/dp') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            动态规划
          </Link>
          
          <Link 
            to="/linkedlist" 
            style={location.pathname === '/linkedlist' ? activeLinkStyle : linkStyle}
            onMouseEnter={(e) => {
              if (location.pathname !== '/linkedlist') {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/linkedlist') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            链表
          </Link>
          
          <Link 
            to="/priorityqueue" 
            style={location.pathname === '/priorityqueue' ? activeLinkStyle : linkStyle}
            onMouseEnter={(e) => {
              if (location.pathname !== '/priorityqueue') {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/priorityqueue') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            优先队列
          </Link>
          
          <Link 
            to="/segmenttree" 
            style={location.pathname === '/segmenttree' ? activeLinkStyle : linkStyle}
            onMouseEnter={(e) => {
              if (location.pathname !== '/segmenttree') {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/segmenttree') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            线段树
          </Link>
          
          <Link 
            to="/balancedtree" 
            style={location.pathname === '/balancedtree' ? activeLinkStyle : linkStyle}
            onMouseEnter={(e) => {
              if (location.pathname !== '/balancedtree') {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/balancedtree') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            平衡树
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
