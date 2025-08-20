import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
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
