import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const navStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px 0',
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '0'
  };

  const linkStyle = {
    textDecoration: 'none',
    padding: '12px 24px',
    margin: '0 8px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    border: '2px solid transparent'
  };

  const activeLinkStyle = {
    ...linkStyle,
    background: 'white',
    color: '#1976d2',
    border: '2px solid white'
  };

  const inactiveLinkStyle = {
    ...linkStyle,
    background: 'transparent',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)'
  };

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h1 style={{ 
          margin: 0, 
          color: 'white', 
          fontSize: '24px', 
          marginRight: '32px',
          fontWeight: 'bold'
        }}>
          可视化平台
        </h1>
        
        <Link 
          to="/graph" 
          style={location.pathname === '/graph' ? activeLinkStyle : inactiveLinkStyle}
          onMouseEnter={(e) => {
            if (location.pathname !== '/graph') {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== '/graph') {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          图的可视化
        </Link>
        
        <Link 
          to="/algorithm" 
          style={location.pathname === '/algorithm' ? activeLinkStyle : inactiveLinkStyle}
          onMouseEnter={(e) => {
            if (location.pathname !== '/algorithm') {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== '/algorithm') {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          算法可视化
        </Link>
      </div>
    </nav>
  );
}

export default Navigation;
