import { useState } from 'react';
import GraphInput from './components/GraphInput';
import GraphD3 from './components/GraphD3';
import './App.css';

function App() {
  // 节点结构改为对象，支持 fixed 属性
  // 1. 新增label属性
  const [nodes, setNodes] = useState([
    { id: '1', fixed: false, label: '' },
    { id: '2', fixed: false, label: '' },
    { id: '3', fixed: false, label: '' },
    { id: '4', fixed: false, label: '' }
  ]);
  // 边结构增加 label 字段
  const [edges, setEdges] = useState([
    { from: '1', to: '2', label: '5' },
    { from: '2', to: '3', label: '-1' },
    { from: '3', to: '4', label: '9' },
    { from: '4', to: '1', label: '8' },
    { from: '1', to: '1', label: '12' }
  ]);
  const [directed, setDirected] = useState(true);
  const [showGraph, setShowGraph] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [animating, setAnimating] = useState(false);
  // 新增参数
  const [canvasWidth, setCanvasWidth] = useState(500);
  const [canvasHeight, setCanvasHeight] = useState(500);
  const [nodeRadius, setNodeRadius] = useState(20);
  const [arrowSize, setArrowSize] = useState(10);
  const [ordAnimating, setordAnimating] = useState(false);
  const [dfsStart, setDfsStart] = useState(nodes[0]?.id || '');
  const [dfsAnimating, setDfsAnimating] = useState(false);
  const [dfsStack, setDfsStack] = useState([]);
  const [dfsAnimatingSpeed, setDfsAnimatingSpeed] = useState(1000);
  const [bfsStart, setBfsStart] = useState(nodes[0]?.id || '');
  const [bfsAnimating, setBfsAnimating] = useState(false);
  const [bfsQueue, setBfsQueue] = useState([]);
  const [bfsAnimatingSpeed, setBfsAnimatingSpeed] = useState(1000);
  const [rightTab, setRightTab] = useState('config');
  const [bfsQueuefront, setBfsQueuefront] = useState(-1);

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

  // 通过点击切换节点固定状态
  const toggleNodeFixed = (nodeId) => {
    setNodes(nodes => nodes.map(n => 
      n.id === nodeId ? { ...n, fixed: !n.fixed } : n
    ));
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
        await new Promise(res => setTimeout(res, dfsAnimatingSpeed));
        for (const v of (edgeMap[u] || [])) {
          if (!visited.has(v)) {
            await dfs(v, stack.concat(u));
          }
          setHighlightIndex(nodes.findIndex(n => n.id === u));
          await new Promise(res => setTimeout(res, dfsAnimatingSpeed));
        }
        setDfsStack(stack); // 回溯时弹栈
      }
      await dfs(dfsStart, []);
      setHighlightIndex(-1);
      setDfsAnimating(false);
      setAnimating(false);
      setDfsStack([]);
    };

  // BFS 动画
  const playBFS = async () => {
    if (!bfsStart) return;
    setBfsAnimating(true);
    setAnimating(true);
    setBfsQueue([]);
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
    const queue = [bfsStart];
    visited.add(bfsStart);
    setBfsQueue([bfsStart]);
    let i = 0;
    while (i < queue.length) {
      const u = queue[i];
      setBfsQueuefront(u);
      i++;
      setHighlightIndex(nodes.findIndex(n => n.id === u));
      await new Promise(res => setTimeout(res, bfsAnimatingSpeed));
      for (const v of (edgeMap[u] || [])) {
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
          setBfsQueue([...queue]);
          await new Promise(res => setTimeout(res, bfsAnimatingSpeed));
        }
      }
    }
    setHighlightIndex(-1);
    setBfsQueue([]);
    setBfsAnimating(false);
    setAnimating(false);
  };

  // 获取最小未用数字id
  const getNextNodeId = () => {
    const used = new Set(nodes.map(n => Number(n.id)).filter(n => !isNaN(n)));
    let i = 0;
    while (used.has(i)) i++;
    return String(i);
  };

  return (
    <div className="App" style={{ height: '100vh', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 32, width: '100%', minHeight: canvasHeight + 48 }}>
        {/* 左列：输入 */}
        <div style={{ flex: '0 0 340px', minWidth: 320, maxWidth: 400 }}>
          <GraphInput
            nodes={nodes}
            setNodes={setNodes}
            setNodeFixed={setNodeFixed}
            edges={edges}
            setEdges={setEdges}
            directed={directed}
            setDirected={setDirected}
            getNextNodeId={getNextNodeId}
          />
        </div>
        {/* 中列：图 */}
        <div style={{ flex: '1 1 0', minWidth: 400, margin: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <GraphD3
            nodes={nodes}
            edges={edges}
            directed={directed}
            highlightIndex={highlightIndex}
            width={canvasWidth}
            height={canvasHeight}
            nodeRadius={nodeRadius}
            arrowSize={arrowSize}
            onNodeClick={toggleNodeFixed}
          />
          {/* BFS队列可视化 */}
          {bfsAnimating && (
            <div style={{ marginTop: 24, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 8 }}>BFS队列</div>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 12, minHeight: 48 }}>
                {bfsQueue.length === 0 ? (
                  <span style={{ color: '#aaa' }}>空</span>
                ) : (
                  bfsQueue.map((id, i) => (
                    <div key={i} style={{ 
                      width: 40, height: 40, 
                      borderRadius: 20, 
                      border: '2px solid #1976d2', 
                      background: id == bfsQueuefront ? '#ff0' : '#fff', 
                      color: '#1976d2', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: 18, 
                      fontWeight: 600 }}>
                      {id}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* 右列：配置/动画选项卡 */}
        <div style={{ flex: '0 0 260px', minWidth: 220, maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'left', justifyContent: 'flex-start', gap: 10 }}>
          {/* 选项卡切换 */}
          <div style={{ display: 'flex', width: '100%', marginBottom: 0 }}>
            <button onClick={() => setRightTab('config')} style={{ flex: 1, padding: 8, fontWeight: rightTab === 'config' ? 700 : 400, background: rightTab === 'config' ? '#e3f2fd' : '#f5f5f5', border: '1px solid #90caf9', borderBottom: rightTab === 'config' ? '2px solid #1976d2' : '1px solid #90caf9', color: '#1976d2', cursor: 'pointer' }}>基本配置</button>
            <button onClick={() => setRightTab('anim')} style={{ flex: 1, padding: 8, fontWeight: rightTab === 'anim' ? 700 : 400, background: rightTab === 'anim' ? '#e3f2fd' : '#f5f5f5', border: '1px solid #90caf9', borderBottom: rightTab === 'anim' ? '2px solid #1976d2' : '1px solid #90caf9', color: '#1976d2', cursor: 'pointer' }}>播放动画</button>
          </div>
          {/* 基本配置 */}
          {rightTab === 'config' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
              <label style={{ marginBottom: 8 }}>画布宽度: <input type="number" min={200} max={1200} value={canvasWidth} onChange={e => setCanvasWidth(Number(e.target.value))} style={{ width: 60 }} /></label>
              <label style={{ marginBottom: 8 }}>画布高度: <input type="number" min={200} max={1000} value={canvasHeight} onChange={e => setCanvasHeight(Number(e.target.value))} style={{ width: 60 }} /></label>
              <label style={{ marginBottom: 8 }}>点半径: <input type="number" min={8} max={100} value={nodeRadius} onChange={e => setNodeRadius(Number(e.target.value))} style={{ width: 40 }} /></label>
              <label style={{ marginBottom: 8 }}>箭头大小: <input type="number" min={2} max={30} value={arrowSize} onChange={e => setArrowSize(Number(e.target.value))} style={{ width: 40 }} /></label>
              <div style={{ marginTop: 0, textAlign: 'left', width: '100%' }}>
                <label>
                  <input
                    type="radio"
                    name="graph-type"
                    checked={directed}
                    onChange={() => setDirected(true)}
                  />
                  有向图
                </label>
                <label style={{ marginLeft: 16 }}>
                  <input
                    type="radio"
                    name="graph-type"
                    checked={!directed}
                    onChange={() => setDirected(false)}
                  />
                  无向图
                </label>
              </div>
            </div>
          )}
          {/* 动画与DFS控制 */}
          {rightTab === 'anim' && (
            <>
              {/* DFS递归栈可视化 */}
              {dfsAnimating && (
                <div style={{ width: '100%', marginBottom: 16 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 28, textAlign: 'center' }}>递归栈</div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      border: '2px solid #1976d2',
                      borderRadius: 12,
                      padding: '12px 0',
                      width: 60,
                      height: 440,
                      boxSizing: 'border-box',
                      background: '#f9fafd',
                      margin: '0 auto'
                    }}
                  >
                    {dfsStack.length === 0 ? (
                      <span style={{ color: '#aaa' }}>空</span>
                    ) : (
                      Array.from({ length: 8 }).map((_, i) => {
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
                      })
                    )}
                  </div>
                </div>
              )}
              {/* 动画按钮和DFS/BFS控制 */}
              <button onClick={playAnimation} disabled={animating} style={{marginTop: 0}}>
                {ordAnimating ? '播放中...' : '播放点亮动画'}
              </button>
              <div style={{ marginTop: 0, width: '100%' }}>
                <label>DFS起点: </label>
                <select value={dfsStart} onChange={e => setDfsStart(e.target.value)} disabled={dfsAnimating || animating}>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.id}</option>
                  ))}
                </select>
                <button onClick={playDFS} disabled={dfsAnimating || animating || !dfsStart} style={{ marginLeft: 8 }}>
                  {dfsAnimating ? 'DFS中...' : '播放DFS'}
                </button>
                <label style={{ marginLeft: 12 }}>
                  每步播放时长（秒）:
                  <input
                    type="number"
                    min={0.1}
                    max={10}
                    step={0.1}
                    value={dfsAnimatingSpeed / 1000}
                    onChange={e => setDfsAnimatingSpeed(Number(e.target.value) * 1000)}
                    disabled={dfsAnimating || animating}
                    style={{ width: 50, marginLeft: 4 }}
                  />
                </label>
              </div>
              {/* BFS控制区 */}
              <div style={{ marginTop: 16, width: '100%' }}>
                <label>BFS起点: </label>
                <select value={bfsStart} onChange={e => setBfsStart(e.target.value)} disabled={bfsAnimating || animating}>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.id}</option>
                  ))}
                </select>
                <button onClick={playBFS} disabled={bfsAnimating || animating || !bfsStart} style={{ marginLeft: 8 }}>
                  {bfsAnimating ? 'BFS中...' : '播放BFS'}
                </button>
                <label style={{ marginLeft: 12 }}>
                  每步播放时长（秒）:
                  <input
                    type="number"
                    min={0.1}
                    max={10}
                    step={0.1}
                    value={bfsAnimatingSpeed / 1000}
                    onChange={e => setBfsAnimatingSpeed(Number(e.target.value) * 1000)}
                    disabled={bfsAnimating || animating}
                    style={{ width: 50, marginLeft: 4 }}
                  />
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
