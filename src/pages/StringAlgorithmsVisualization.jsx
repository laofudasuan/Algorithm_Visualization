import { Link } from 'react-router-dom';

function StringAlgorithmsVisualization() {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2' }}>字符串算法可视化</h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '30px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
          maxWidth: '800px'
        }}>
          <Link to="/string-algorithms/kmp" style={{ 
            textDecoration: 'none', 
            color: 'inherit' 
          }}>
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <h2 style={{ 
                margin: '0 0 10px 0', 
                color: '#333',
                fontSize: '1.5rem'
              }}>
                KMP算法
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#666',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                KMP（Knuth-Morris-Pratt）算法是一种高效的字符串匹配算法，用于在一个文本串中查找模式串的出现位置。
              </p>
            </div>
          </Link>

          <Link to="/string-algorithms/ac-automation" style={{ 
            textDecoration: 'none', 
            color: 'inherit' 
          }}>
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <h2 style={{ 
                margin: '0 0 10px 0', 
                color: '#333',
                fontSize: '1.5rem'
              }}>
                AC自动机
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#666',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                AC自动机（Aho-Corasick Automation）是一种用于多模式字符串匹配的算法，可以同时在文本中查找多个模式串。
              </p>
            </div>
          </Link>
          
          <Link to="/string-algorithms/suffix-automaton" style={{ 
            textDecoration: 'none', 
            color: 'inherit' 
          }}>
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <h2 style={{ 
                margin: '0 0 10px 0', 
                color: '#333',
                fontSize: '1.5rem'
              }}>
                后缀自动机
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#666',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                后缀自动机（Suffix Automaton）是一种强大的字符串处理数据结构，能够高效地处理与字符串相关的各种问题。
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StringAlgorithmsVisualization;