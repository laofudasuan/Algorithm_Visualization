import { useState } from 'react';
import GraphInput from './components/GraphInput';
import GraphD3 from './components/GraphD3';
import './App.css';

function App() {
  // 节点结构改为对象，支持 fixed 属性
  const [nodes, setNodes] = useState([
    { id: 'A', fixed: false },
    { id: 'B', fixed: false },
    { id: 'C', fixed: false },
    { id: 'D', fixed: false }
  ]);
  // 边结构增加 label 字段
  const [edges, setEdges] = useState([
    { from: 'A', to: 'B', label: '1' },
    { from: 'B', to: 'C', label: '2' },
    { from: 'C', to: 'D', label: '3' },
    { from: 'D', to: 'A', label: '4' },
    { from: 'A', to: 'A', label: '5' }
  ]);
  const [directed, setDirected] = useState(true);
  const [showGraph, setShowGraph] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [animating, setAnimating] = useState(false);
  // 新增参数
  const [canvasWidth, setCanvasWidth] = useState(1000);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [nodeRadius, setNodeRadius] = useState(20);
  const [arrowSize, setArrowSize] = useState(10);
  const [ordAnimating, setordAnimating] = useState(false);
  const [dfsStart, setDfsStart] = useState(nodes[0]?.id || '');
  const [dfsAnimating, setDfsAnimating] = useState(false);
  const [dfsStack, setDfsStack] = useState([]);

  // Animation: highlight nodes in order
  const playAnimation = async () => {
    setordAnimating(true);
    setAnimating(true);
    for (let i = 0; i < nodes.length; i++) {
      setHighlightIndex(i);
      await new Promise(res => setTimeout(res, 1000));
    }
    setHighlightIndex(-1);
    setAnimating(false);
    setordAnimating(false);
  };

  // 辅助函数：设置某个点的 fixed
  const setNodeFixed = (idx, fixed) => {
    setNodes(nodes => nodes.map((n, i) => i === idx ? { ...n, fixed } : n));
  };

  // DFS
  const playDFS = async () => {
    if (!dfsStart) return;
      setDfsAnimating(true);
      setAnimating(true);
      setDfsStack([]);
      const visited = new Set();
      const edgeMap = {};
      edges.forEach(e => {
        if (!edgeMap[e.from]) edgeMap[e.from] = [];
        edgeMap[e.from].push(e.to);
        if (!directed) {
          if (!edgeMap[e.to]) edgeMap[e.to] = [];
          edgeMap[e.to].push(e.from);
        }
      });
      async function dfs(u, stack) {
        visited.add(u);
        setDfsStack(stack.concat(u));
        setHighlightIndex(nodes.findIndex(n => n.id === u));
        await new Promise(res => setTimeout(res, 800));
        for (const v of (edgeMap[u] || [])) {
          if (!visited.has(v)) {
            await dfs(v, stack.concat(u));
          }
          setHighlightIndex(nodes.findIndex(n => n.id === u));
          await new Promise(res => setTimeout(res, 800));
        }
        setDfsStack(stack); // 回溯时弹栈
      }
      await dfs(dfsStart, []);
      setHighlightIndex(-1);
      setDfsAnimating(false);
      setAnimating(false);
      setDfsStack([]);
    };

  return (
    <div className="App">
      <h1>图结构可视化与动画</h1>
      <div style={{marginBottom: 16}}>
        <label>画布宽度: <input type="number" min={200} max={1200} value={canvasWidth} onChange={e => setCanvasWidth(Number(e.target.value))} style={{width: 60}} /></label>
        <label style={{marginLeft: 12}}>画布高度: <input type="number" min={200} max={1000} value={canvasHeight} onChange={e => setCanvasHeight(Number(e.target.value))} style={{width: 60}} /></label>
        <label style={{marginLeft: 12}}>点半径: <input type="number" min={8} max={100} value={nodeRadius} onChange={e => setNodeRadius(Number(e.target.value))} style={{width: 40}} /></label>
        <label style={{marginLeft: 12}}>箭头大小: <input type="number" min={2} max={30} value={arrowSize} onChange={e => setArrowSize(Number(e.target.value))} style={{width: 40}} /></label>
      </div>
      <GraphInput
        nodes={nodes}
        setNodes={setNodes}
        setNodeFixed={setNodeFixed}
        edges={edges}
        setEdges={setEdges}
        directed={directed}
        setDirected={setDirected}
      />
      <button style={{ margin: '16px 0' }} onClick={() => setShowGraph(true)}>
        一键生成
      </button>
      {showGraph && (
        <>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 32 }}>
      <div style={{ margin: '24px 0' }}>
        <GraphD3
          nodes={nodes}
          edges={edges}
          directed={directed}
          highlightIndex={highlightIndex}
          width={canvasWidth}
          height={canvasHeight}
          nodeRadius={nodeRadius}
          arrowSize={arrowSize}
        />
      </div>
      {/* DFS递归栈可视化 */}
      {dfsAnimating && (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      minHeight: canvasHeight
    }}
  >
    {dfsStack.length === 0 ? (
      <span style={{ color: '#aaa' }}>空</span>
    ) : (
      <>
        <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 28 }}>递归栈</div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '2px solid #1976d2',
            borderRadius: 12,
            padding: '12px 0',
            width: 60,
            height: 480,
            boxSizing: 'border-box',
            background: '#f9fafd'
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => {
            // i=0是最上面（栈顶），i=9是最下面（栈底）
            const val = dfsStack[i] || null;
            return (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  border: '2px solid #1976d2',
                  background: val ? '#1976d2' : 'transparent',
                  color: val ? '#fff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '4px 0',
                  fontSize: 18,
                  transition: 'background 0.2s'
                }}
              >
                {val || '空'}
              </div>
            );
          })}
        </div>
      </>
    )}
  </div>
)}
    </div>
        <button onClick={playAnimation} disabled={animating} style={{ marginTop: 16 }}>
          {ordAnimating ? '播放中...' : '播放点亮动画'}
        </button>
        <div style={{ marginTop: 16 }}>
         <label>DFS起点: </label>
         <select value={dfsStart} onChange={e => setDfsStart(e.target.value)} disabled={dfsAnimating || animating}>
          {nodes.map(n => (
            <option key={n.id} value={n.id}>{n.id}</option>
          ))}
          </select>
          <button onClick={playDFS} disabled={dfsAnimating || animating || !dfsStart} style={{ marginLeft: 8 }}>
            {dfsAnimating ? 'DFS中...' : '播放DFS'}
          </button>
        </div>
      </>
      )}
    </div>
  );
}

export default App;
