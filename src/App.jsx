import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navigation from './components/navigation/Navigation';
import Home from './pages/Home';
import GraphVisualization from './pages/GraphVisualization';
import AlgorithmVisualization from './pages/AlgorithmVisualization';
import SearchVisualization from './pages/SearchVisualization';
import DynamicProgrammingVisualization from './pages/DynamicProgrammingVisualization';
import LinkedListVisualization from './pages/LinkedListVisualization';
import PriorityQueueVisualization from './pages/PriorityQueueVisualization';
import SegmentTreeVisualization from './pages/SegmentTreeVisualization';
import BalancedTreeVisualization from './pages/BalancedTreeVisualization';
import BinaryIndexedTreeVisualization from './pages/BinaryIndexedTreeVisualization';
import QQImage from './assets/QQ.jpg';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* 页面顶部标题 */}
        <header style={{
          backgroundColor: '#0d47a1',
          color: 'white',
          padding: '20px 0',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <Link to="/" style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'inline-block',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}>
            <h1 style={{
              margin: '0',
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              cursor: 'pointer'
            }}>
              算法可视化平台
            </h1>
          </Link>

          {/* 内测说明 */}
          <div style={{
            marginTop: '20px',
            padding: '15px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            maxWidth: '800px',
            margin: '20px auto 0',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              lineHeight: '1.5',
              textAlign: 'left',
              flex: '1',
              minWidth: '300px'
            }}>
              <strong>注：</strong>本平台现由老虎大蒜(laofudasuan)开发中，目前还在内测阶段，功能和界面都在持续完善中，欢迎感兴趣的用户加入QQ群：<strong>251998253</strong>
            </div>
            <div style={{ flexShrink: 0 }}>
              <img 
                src={QQImage} 
                alt="QQ群二维码" 
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer'
                }}
                title="扫码加入QQ群：251998253"
              />
            </div>
          </div>
        </header>
        
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/graph" element={<GraphVisualization />} />
          <Route path="/algorithm" element={<AlgorithmVisualization />} />
          <Route path="/search" element={<SearchVisualization />} />
          <Route path="/dp" element={<DynamicProgrammingVisualization />} />
          <Route path="/linkedlist" element={<LinkedListVisualization />} />
          <Route path="/priorityqueue" element={<PriorityQueueVisualization />} />
          <Route path="/segmenttree" element={<SegmentTreeVisualization />} />
          <Route path="/balancedtree" element={<BalancedTreeVisualization />} />
          <Route path="/binarytree" element={<BinaryIndexedTreeVisualization />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
