import { Link } from 'react-router-dom';

function BasicAlgorithmsVisualization() {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2' }}>基础算法可视化</h1>
      
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
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2>基础算法</h2>
            <p>基础算法是计算机科学中的核心概念，它们是解决各种计算问题的基本方法。本可视化工具包含了几种经典的基础算法实现，帮助您更好地理解它们的工作原理。</p>
          </div>

          <Link to="/basic/sorting" style={{ 
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bbdefb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}>
              <h3>排序算法</h3>
              <p>多种经典排序算法的可视化演示，包括冒泡排序、选择排序和插入排序等</p>
            </div>
          </Link>

          <Link to="/basic/binary-search" style={{ 
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#e8f5e9',
              border: '1px solid #4caf50',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c8e6c9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e8f5e9'}>
              <h3>二分查找</h3>
              <p>在有序数组中查找特定元素的高效算法，时间复杂度为O(log n)</p>
            </div>
          </Link>

          <Link to="/basic/divide-conquer" style={{ 
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#fff3e0',
              border: '1px solid #ff9800',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe0b2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff3e0'}>
              <h3>分治算法</h3>
              <p>将复杂问题分解为更小的子问题来解决的经典算法思想</p>
            </div>
          </Link>

          <Link to="/basic/doubling" style={{ 
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f3e5f5',
              border: '1px solid #9c27b0',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e1bee7'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3e5f5'}>
              <h3>倍增算法</h3>
              <p>通过逐步扩大规模来优化算法效率的技术，常用于快速幂等场景</p>
            </div>
          </Link>
        </div>

        <div style={{ 
          maxWidth: '800px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          width: '100%'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>基础算法简介</h3>
          <p>基础算法是计算机科学中的重要概念，它们构成了更复杂算法和数据结构的基础。掌握这些基础算法对于理解计算机程序的工作原理和提高编程能力至关重要。</p>
          <p>通过可视化的方式，我们可以更直观地理解这些算法的执行过程和原理，这对于学习和教学都非常有帮助。</p>
        </div>
      </div>
    </div>
  );
}

export default BasicAlgorithmsVisualization;