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
    alignItems: 'center',
    gap: '40px',
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
        <Link to="/" style={logoStyle}>
          算法可视化平台
        </Link>
        
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
            图的可视化
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
            排序可视化
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
            搜索可视化
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
