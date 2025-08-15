import { Link } from 'react-router-dom';

function Home() {
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px',
    textAlign: 'center'
  };

  const heroStyle = {
    marginBottom: '60px'
  };

  const titleStyle = {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: '20px'
  };

  const subtitleStyle = {
    fontSize: '20px',
    color: '#666',
    marginBottom: '40px',
    lineHeight: '1.6'
  };

  const cardsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginTop: '40px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    textDecoration: 'none',
    color: 'inherit'
  };

  const cardHoverStyle = {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  };

  const cardIconStyle = {
    fontSize: '48px',
    marginBottom: '20px',
    display: 'block'
  };

  const cardTitleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#1976d2'
  };

  const cardDescriptionStyle = {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6'
  };

  return (
    <div style={containerStyle}>
      <div style={heroStyle}>
        <h1 style={titleStyle}>算法可视化学习平台</h1>
        <p style={subtitleStyle}>
          通过交互式可视化学习图论算法和经典算法<br/>
          让复杂的算法概念变得直观易懂
        </p>
      </div>

      <div style={cardsContainerStyle}>
        <Link 
          to="/graph" 
          style={cardStyle}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, cardHoverStyle);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <span style={{...cardIconStyle, color: '#1976d2'}}>🕸️</span>
          <h3 style={cardTitleStyle}>图的可视化</h3>
          <p style={cardDescriptionStyle}>
            创建和编辑图结构，观看DFS和BFS算法的执行过程。
            支持有向图和无向图，可自定义节点和边的属性。
          </p>
        </Link>

        <Link 
          to="/algorithm" 
          style={cardStyle}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, cardHoverStyle);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <span style={{...cardIconStyle, color: '#ff9800'}}>⚡</span>
          <h3 style={cardTitleStyle}>算法可视化</h3>
          <p style={cardDescriptionStyle}>
            学习经典算法如排序和搜索。通过动画演示理解算法的执行步骤，
            包含时间复杂度和空间复杂度分析。
          </p>
        </Link>
      </div>

      <div style={{ marginTop: '60px', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
        <h2 style={{ color: '#1976d2', marginBottom: '20px' }}>平台特色</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', textAlign: 'left' }}>
          <div>
            <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>🎯 交互式学习</h4>
            <p style={{ color: '#666' }}>通过可视化动画和交互操作，让抽象的算法概念变得具体可感知。</p>
          </div>
          <div>
            <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>🎮 自定义参数</h4>
            <p style={{ color: '#666' }}>调整动画速度、数据规模等参数，按自己的节奏学习算法。</p>
          </div>
          <div>
            <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>📊 实时反馈</h4>
            <p style={{ color: '#666' }}>观察算法执行的每一步，理解数据结构的变化过程。</p>
          </div>
          <div>
            <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>📚 详细说明</h4>
            <p style={{ color: '#666' }}>每个算法都配有详细的原理说明和复杂度分析。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
