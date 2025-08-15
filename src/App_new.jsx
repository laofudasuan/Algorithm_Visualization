import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import GraphVisualization from './pages/GraphVisualization';
import AlgorithmVisualization from './pages/AlgorithmVisualization';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/graph" replace />} />
          <Route path="/graph" element={<GraphVisualization />} />
          <Route path="/algorithm" element={<AlgorithmVisualization />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
