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
    marginBottom: '20px'
  };

  const cardTitleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px'
  };

  const cardDescriptionStyle = {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6'
  };

  const modules = [
    {
      title: '图结构可视化',
      description: '动态创建和可视化图结构，支持有向图和无向图，提供遍历算法演示',
      path: '/graph',
      icon: '📊'
    },
    {
      title: '查找算法',
      description: '可视化各种查找算法，包括二分查找、插值查找等',
      path: '/search',
      icon: '🔍'
    },
    {
      title: '动态规划',
      description: '展示动态规划问题的求解过程，帮助理解状态转移方程',
      path: '/dp',
      icon: '🧮'
    },
    {
      title: '链表',
      description: '可视化链表结构和操作，包括单链表、双链表等',
      path: '/linkedlist',
      icon: '🔗'
    },
    {
      title: '优先队列',
      description: '展示优先队列的实现和操作过程',
      path: '/priorityqueue',
      icon: '📋'
    },
    {
      title: '线段树',
      description: '可视化线段树的构建和操作过程',
      path: '/segmenttree',
      icon: '🌲'
    },
    {
      title: '平衡树',
      description: '展示平衡树的结构和旋转操作',
      path: '/balancedtree',
      icon: '🌳'
    },
    {
      title: '树状数组',
      description: '可视化树状数组的结构和操作',
      path: '/binarytree',
      icon: '📈'
    },
    {
      title: '本地Python编程',
      description: '连接本地Python环境，在浏览器中编写和运行完整的Python代码',
      path: '/local-python',
      icon: '🐍'
    },
    {
      title: '本地Jupyter Notebook',
      description: '集成本地Jupyter Notebook环境，支持完整的交互式编程体验',
      path: '/local-jupyter',
      icon: '📓'
    }
  ];

  return (
    <div style={containerStyle}>
      <div style={heroStyle}>
        <h1 style={titleStyle}>算法可视化平台</h1>
        <p style={subtitleStyle}>
          一个帮助理解和学习数据结构与算法的交互式可视化平台<br />
          通过动画和交互式演示，让抽象的算法变得直观易懂
        </p>
      </div>

      <div style={cardsContainerStyle}>
        {modules.map((module, index) => (
          <Link
            key={index}
            to={module.path}
            style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, cardHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, cardStyle)}
          >
            <div style={cardIconStyle}>{module.icon}</div>
            <h2 style={cardTitleStyle}>{module.title}</h2>
            <p style={cardDescriptionStyle}>{module.description}</p>
          </Link>
        ))}
      </div>

      <div style={{ 
        marginTop: '60px', 
        padding: '30px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '12px',
        textAlign: 'left'
      }}>
        <h2 style={{ 
          color: '#1976d2', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>平台介绍</h2>
        <p style={{ 
          fontSize: '16px', 
          lineHeight: '1.8',
          color: '#333'
        }}>
          本平台是一个基于React和D3.js开发的算法可视化工具，旨在通过交互式动画帮助用户更好地理解数据结构和算法的工作原理。
          平台提供了多种数据结构的可视化演示，包括图结构、链表、树结构等，以及常见算法的执行过程演示。
          新增的本地Python编程模块允许用户连接本地Python环境，在浏览器中编写和运行完整的Python代码，支持标准库导入和文件操作。
          本地Jupyter Notebook模块集成了本地运行的Jupyter Notebook环境，提供完整的交互式编程体验。
        </p>
        <p style={{ 
          fontSize: '16px', 
          lineHeight: '1.8',
          color: '#333',
          marginTop: '15px'
        }}>
          所有可视化模块都支持实时交互，用户可以通过调整参数来观察算法行为的变化。
          平台还在持续开发中，未来将添加更多算法和数据结构的可视化演示。
        </p>
      </div>
    </div>
  );
}

export default Home;