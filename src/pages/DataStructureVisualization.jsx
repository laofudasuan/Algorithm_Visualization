import { Link } from 'react-router-dom';

function DataStructureVisualization() {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2' }}>数据结构可视化</h1>
      
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
          <Link to="/data-structure/linkedlist" style={{ 
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
                链表
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#666',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                链表是一种线性数据结构，其中元素不是在内存中连续存储的，而是通过指针链接在一起。
              </p>
            </div>
          </Link>

          <Link to="/data-structure/priorityqueue" style={{ 
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
                优先队列
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#666',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                优先队列是一种特殊的队列，其中每个元素都有一个优先级，优先级高的元素先出队。
              </p>
            </div>
          </Link>

          <Link to="/data-structure/segmenttree" style={{ 
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
                线段树
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#666',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                线段树是一种用于处理区间查询和更新操作的数据结构，特别适用于需要频繁修改和查询区间信息的场景。
              </p>
            </div>
          </Link>

          <Link to="/data-structure/balancedtree" style={{ 
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
                平衡树
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#666',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                平衡树是一种二叉搜索树，通过自动保持树的高度平衡来确保操作的时间复杂度为O(log n)。
              </p>
            </div>
          </Link>

          <Link to="/data-structure/binarytree" style={{ 
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
                树状数组
              </h2>
              <p style={{ 
                margin: 0, 
                color: '#666',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                树状数组（Binary Indexed Tree）是一种高效处理前缀和查询与单点更新的数据结构。
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DataStructureVisualization;