import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Navigation from './components/navigation/Navigation';
import Home from './pages/Home';
import GraphVisualization from './pages/GraphVisualization';
import SortingVisualization from './pages/SortingVisualization';
import SearchVisualization from './pages/SearchVisualization';
import DynamicProgrammingVisualization from './pages/DynamicProgrammingVisualization';
import LinkedListVisualization from './pages/LinkedListVisualization';
import PriorityQueueVisualization from './pages/PriorityQueueVisualization';
import SegmentTreeVisualization from './pages/SegmentTreeVisualization';
import BalancedTreeVisualization from './pages/BalancedTreeVisualization';
import BinaryIndexedTreeVisualization from './pages/BinaryIndexedTreeVisualization';
import LocalJupyterNotebook from './pages/LocalJupyterNotebook';
import KMPVisualization from './pages/KMPVisualization';
import ACAutomationVisualization from './pages/ACAutomationVisualization';
import theme from './theme';
import './App.css';
import Header from './components/Header';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          width: '100vw', 
          maxWidth: '100vw', 
          overflowX: 'hidden', 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default'
        }}>
          <Header />
          
          {/* Navigation will be absolutely positioned, so it doesn't affect the flow */}
          <Navigation />
          
          <Box 
            component="main" 
            sx={{ 
              flex: 1,
              px: { xs: 1, sm: 2, md: 3 },
              py: 2,
              width: '100%',
              maxWidth: '100vw',
              // Add left margin to account for navigation width when expanded
              ml: '80px', // Default to collapsed width
              transition: 'margin 0.3s ease',
              // Add top margin to account for fixed header
              mt: '64px' // Approximately the height of the header
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/graph" element={<GraphVisualization />} />
              <Route path="/algorithm" element={<SortingVisualization />} />
              <Route path="/search" element={<SearchVisualization />} />
              <Route path="/dp" element={<DynamicProgrammingVisualization />} />
              <Route path="/linkedlist" element={<LinkedListVisualization />} />
              <Route path="/priorityqueue" element={<PriorityQueueVisualization />} />
              <Route path="/segmenttree" element={<SegmentTreeVisualization />} />
              <Route path="/balancedtree" element={<BalancedTreeVisualization />} />
              <Route path="/binarytree" element={<BinaryIndexedTreeVisualization />} />
              <Route path="/local-jupyter" element={<LocalJupyterNotebook />} />
              <Route path="/kmp" element={<KMPVisualization />} />
              <Route path="/ac-automation" element={<ACAutomationVisualization />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;