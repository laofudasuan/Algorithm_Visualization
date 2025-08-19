import { useState } from 'react';
import GraphInput from '../components/GraphInput';
import GraphD3 from '../components/GraphD3';

function GraphVisualization() {
  // 节点结构改为对象，支持 fixed 属性
  // 1. 新增label属性
  const [nodes, setNodes] = useState([
    { id: '1', fixed: false, label: '', color: '#69b3a2' },
    { id: '2', fixed: false, label: '', color: '#69b3a2' },
    { id: '3', fixed: false, label: '', color: '#69b3a2' },
    { id: '4', fixed: false, label: '', color: '#69b3a2' }
  ]);
  // 边结构增加 label 字段
  const [edges, setEdges] = useState([
    { from: '1', to: '2', label: '5', color: '#000000' },
    { from: '2', to: '3', label: '-1', color: '#000000' },
    { from: '3', to: '4', label: '9', color: '#000000' },
    { from: '4', to: '1', label: '8', color: '#000000' },
    { from: '1', to: '1', label: '12', color: '#000000' }
  ]);
  const [directed, setDirected] = useState(true);
  const [showGraph, setShowGraph] = useState(false);
  const [animating, setAnimating] = useState(false);
  // 新增参数
  const [canvasWidth, setCanvasWidth] = useState(500);
  const [canvasHeight, setCanvasHeight] = useState(500);
  const [nodeRadius, setNodeRadius] = useState(20);
  const [arrowSize, setArrowSize] = useState(5);
  const [edgeWidth, setEdgeWidth] = useState(2);
  const [chargeStrength, setChargeStrength] = useState(-300);
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
    
    // 备份原始颜色
    const originalColors = {};
    nodes.forEach(n => {
      originalColors[n.id] = n.color;
    });
    
    for (let i = 0; i < nodes.length; i++) {
      setNodes(nodes => nodes.map((n, idx) => 
        idx === i ? { ...n, color: '#ffff00' } : { ...n, color: '#69b3a2' }
      ));
      await new Promise(res => setTimeout(res, 1000));
    }
    
    // 还原原始颜色
    setNodes(nodes => nodes.map(n => ({ ...n, color: originalColors[n.id] || '#69b3a2' })));
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
    
    // 备份原始颜色
    const originalColors = {};
    setNodes(currentNodes => {
      currentNodes.forEach(n => {
        originalColors[n.id] = n.color;
      });
      return currentNodes.map(n => ({ ...n, color: '#69b3a2' }));
    });
    
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
      setNodes(nodes => nodes.map(n => 
        n.id === u ? { ...n, color: '#ff0' } : { ...n, color: '#69b3a2' }
      ));
      await new Promise(res => setTimeout(res, dfsAnimatingSpeed));
      for (const v of (edgeMap[u] || [])) {
        if (!visited.has(v)) {
          await dfs(v, stack.concat(u));
        }
        setNodes(nodes => nodes.map(n => 
          n.id === u ? { ...n, color: '#ff0' } : { ...n, color: '#69b3a2' }
        ));
        await new Promise(res => setTimeout(res, dfsAnimatingSpeed));
      }
      setDfsStack(stack); // 回溯时弹栈
    }
    await dfs(dfsStart, []);
    
    // 还原原始颜色
    setNodes(nodes => nodes.map(n => ({ ...n, color: originalColors[n.id] || '#69b3a2' })));
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
    
    // 备份原始颜色
    const originalColors = {};
    setNodes(currentNodes => {
      currentNodes.forEach(n => {
        originalColors[n.id] = n.color;
      });
      return currentNodes.map(n => ({ ...n, color: '#69b3a2' }));
    });
    
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
      setNodes(nodes => nodes.map(n => 
        n.id === u ? { ...n, color: '#ff0' } : { ...n, color: '#69b3a2' }
      ));
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
    
    // 还原原始颜色
    setNodes(nodes => nodes.map(n => ({ ...n, color: originalColors[n.id] || '#69b3a2' })));
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

  // 随机生成图
  const randomGenerate = () => {
    // 弹出配置对话框
    const nodeCountInput = prompt('请输入节点数量 (3-20):', '6');
    if (nodeCountInput === null) return;
    
    const nodeCount = parseInt(nodeCountInput);
    if (isNaN(nodeCount) || nodeCount < 3 || nodeCount > 20) {
      alert('节点数量必须在 3-20 之间');
      return;
    }

    const edgeDensityInput = prompt('请输入边密度 (0.1-1.0，0.3表示30%的可能边):', '0.3');
    if (edgeDensityInput === null) return;
    
    const edgeDensity = parseFloat(edgeDensityInput);
    if (isNaN(edgeDensity) || edgeDensity < 0.1 || edgeDensity > 1.0) {
      alert('边密度必须在 0.1-1.0 之间');
      return;
    }

    // 生成随机节点
    const newNodes = [];
    for (let i = 0; i < nodeCount; i++) {
      newNodes.push({
        id: String(i),
        fixed: false,
        label: '',
        color: '#69b3a2'
      });
    }

    // 生成随机边
    const newEdges = [];
    const maxEdges = directed ? nodeCount * (nodeCount - 1) : nodeCount * (nodeCount - 1) / 2;
    const targetEdgeCount = Math.floor(maxEdges * edgeDensity);
    
    // 确保图连通 - 先生成一个生成树
    const connectedEdges = [];
    const visited = new Set([0]);
    const unvisited = new Set();
    for (let i = 1; i < nodeCount; i++) {
      unvisited.add(i);
    }
    
    while (unvisited.size > 0) {
      const fromNode = Array.from(visited)[Math.floor(Math.random() * visited.size)];
      const toNode = Array.from(unvisited)[Math.floor(Math.random() * unvisited.size)];
      
      connectedEdges.push({
        from: String(fromNode),
        to: String(toNode),
        label: Math.floor(Math.random() * 20 - 5).toString(), // -5 到 14 的随机权重
        color: '#000000'
      });
      
      visited.add(toNode);
      unvisited.delete(toNode);
    }

    // 添加额外的随机边
    const edgeSet = new Set(connectedEdges.map(e => `${e.from}-${e.to}`));
    while (newEdges.length + connectedEdges.length < targetEdgeCount) {
      const from = Math.floor(Math.random() * nodeCount);
      const to = Math.floor(Math.random() * nodeCount);
      
      // 避免自环和重复边
      if (from === to) continue;
      
      const edgeKey1 = `${from}-${to}`;
      const edgeKey2 = `${to}-${from}`;
      
      if (directed) {
        if (edgeSet.has(edgeKey1)) continue;
        edgeSet.add(edgeKey1);
      } else {
        if (edgeSet.has(edgeKey1) || edgeSet.has(edgeKey2)) continue;
        edgeSet.add(edgeKey1);
        edgeSet.add(edgeKey2);
      }
      
      newEdges.push({
        from: String(from),
        to: String(to),
        label: Math.floor(Math.random() * 20 - 5).toString(),
        color: '#000000'
      });
    }

    // 更新状态
    setNodes(newNodes);
    setEdges([...connectedEdges, ...newEdges]);
  };

  // 层次布局函数
  const arrangeAsTree = async () => {
    if (nodes.length === 0) return;
    
    // 构建邻接表
    const adjList = {};
    nodes.forEach(node => {
      adjList[node.id] = [];
    });
    
    edges.forEach(edge => {
      if (adjList[edge.from]) {
        adjList[edge.from].push(edge.to);
      }
      if (!directed && adjList[edge.to]) {
        adjList[edge.to].push(edge.from);
      }
    });
    
    // 默认根节点为0
    let defaultRoot = nodes[0].id;
    
    if (directed) {
      // 有向图找到入度为0的节点作为默认根节点候选
      const inDegree = {};
      nodes.forEach(node => {
        inDegree[node.id] = 0;
      });
      
      edges.forEach(edge => {
        if (inDegree[edge.to] !== undefined) {
          inDegree[edge.to]++;
        }
      });
      
      const zeroInDegreeNodes = nodes.filter(node => inDegree[node.id] === 0);
      if (zeroInDegreeNodes.length > 0) {
        defaultRoot = zeroInDegreeNodes[0].id;
      }
    } else {
      // 无向图找到度为1的节点作为默认根节点候选
      const Degree = {}
      nodes.forEach(node => {
        Degree[node.id] = 0;
      });
      edges.forEach(edge => {
        if (Degree[edge.from] !== undefined) {
          Degree[edge.from]++;
        }
        if (Degree[edge.to] !== undefined) {
          Degree[edge.to]++;
        }
      });

      const LeavfNodes = nodes.filter(node => Degree[node.id] === 1);
      if (LeavfNodes.length > 1) {
        defaultRoot = LeavfNodes[0].id;
      }
    }
    
    // 弹出选择框让用户选择根节点
    const selectedRoot = await new Promise((resolve) => {
      // 创建一个模态对话框
      const modalContainer = document.createElement('div');
      modalContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      `;

      const modal = document.createElement('div');
      modal.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 24px;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `;

      const title = document.createElement('h3');
      title.textContent = '选择根节点 (第一层的点)';
      title.style.cssText = `
        margin: 0 0 16px 0;
        color: #333;
        font-size: 18px;
      `;

      const defaultInfo = document.createElement('p');
      defaultInfo.textContent = `推荐默认根节点: ${defaultRoot}`;
      defaultInfo.style.cssText = `
        margin: 0 0 16px 0;
        color: #666;
        font-size: 14px;
      `;

      const nodeContainer = document.createElement('div');
      nodeContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 20px;
        max-height: 200px;
        overflow-y: auto;
      `;

      let selectedNodeId = defaultRoot;

      // 为每个节点创建按钮
      nodes.forEach(node => {
        const nodeButton = document.createElement('button');
        nodeButton.textContent = node.id;
        nodeButton.style.cssText = `
          padding: 8px 16px;
          border: 2px solid #1976d2;
          border-radius: 20px;
          background: ${node.id === defaultRoot ? '#1976d2' : 'white'};
          color: ${node.id === defaultRoot ? 'white' : '#1976d2'};
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        `;

        nodeButton.addEventListener('click', () => {
          // 重置所有按钮样式
          nodeContainer.querySelectorAll('button').forEach(btn => {
            btn.style.background = 'white';
            btn.style.color = '#1976d2';
          });
          // 设置当前按钮为选中状态
          nodeButton.style.background = '#1976d2';
          nodeButton.style.color = 'white';
          selectedNodeId = node.id;
        });

        nodeContainer.appendChild(nodeButton);
      });

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      `;

      const cancelButton = document.createElement('button');
      cancelButton.textContent = '取消';
      cancelButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: white;
        color: #666;
        cursor: pointer;
      `;
      cancelButton.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        resolve(null);
      });

      const confirmButton = document.createElement('button');
      confirmButton.textContent = '确认';
      confirmButton.style.cssText = `
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background: #4caf50;
        color: white;
        cursor: pointer;
        font-weight: 500;
      `;
      confirmButton.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        resolve(selectedNodeId);
      });

      buttonContainer.appendChild(cancelButton);
      buttonContainer.appendChild(confirmButton);

      modal.appendChild(title);
      modal.appendChild(defaultInfo);
      modal.appendChild(nodeContainer);
      modal.appendChild(buttonContainer);
      modalContainer.appendChild(modal);
      document.body.appendChild(modalContainer);

      // 点击背景关闭
      modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
          document.body.removeChild(modalContainer);
          resolve(null);
        }
      });
    });

    // 如果用户取消了操作
    if (selectedRoot === null) {
      return;
    }

    const rootId = selectedRoot;
    
    // BFS构建层级结构
    const levels = [];
    const visited = new Set();
    const queue = [{ id: rootId, level: 0 }];
    visited.add(rootId);
    
    while (queue.length > 0) {
      const { id, level } = queue.shift();
      
      if (!levels[level]) {
        levels[level] = [];
      }
      levels[level].push(id);
      
      // 添加子节点到下一层
      if (adjList[id]) {
        adjList[id].forEach(childId => {
          if (!visited.has(childId)) {
            visited.add(childId);
            queue.push({ id: childId, level: level + 1 });
          }
        });
      }
    }
    
    // 添加未访问的节点到最后一层
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        if (levels.length === 0) {
          levels.push([]);
        }
        levels[levels.length - 1].push(node.id);
      }
    });
    
    // 计算位置并更新节点
    const levelHeight = canvasHeight / Math.max(1, levels.length);
    
    // 先取消所有节点的固定状态
    setNodes(currentNodes => currentNodes.map(node => ({
      ...node,
      fixed: false,
      fx: null,
      fy: null
    })));

    // 使用 setTimeout 确保先取消固定状态的更新生效
    setTimeout(() => {
      setNodes(currentNodes => currentNodes.map(node => {
        // 找到节点所在的层级
        let nodeLevel = 0;
        let nodeIndex = 0;
        
        for (let i = 0; i < levels.length; i++) {
          const index = levels[i].indexOf(node.id);
          if (index !== -1) {
            nodeLevel = i;
            nodeIndex = index;
            break;
          }
        }
        
        // 计算位置
        const levelWidth = canvasWidth / Math.max(1, levels[nodeLevel].length);
        const x = levelWidth * (nodeIndex + 0.5);
        const y = levelHeight * (nodeLevel + 0.5);
        
        return {
          ...node,
          x: x,
          y: y,
          fixed: true,
          fx: x,
          fy: y
        };
      }));
    }, 100); // 100ms 延迟
  };

  return (
    <div style={{ height: '100vh', minHeight: '100vh' }}>
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
            onRandomGenerate={randomGenerate}
            // 新增颜色选项
            nodeColorOptions={["#69b3a2", "#1976d2", "#ff9800", "#e91e63", "#FFB6C1", "#ffff00"]}
            edgeColorOptions={["#000000", "#1976d2", "#ff9800", "#e91e63", "#69b3a2", "#ffff00"]}
          />
        </div>
        {/* 中列：图 */}
        <div style={{ flex: '1 1 0', minWidth: 400, margin: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <GraphD3
            nodes={nodes}
            edges={edges}
            directed={directed}
            width={canvasWidth}
            height={canvasHeight}
            nodeRadius={nodeRadius}
            arrowSize={arrowSize}
            edgeWidth={edgeWidth}
            chargeStrength={chargeStrength}
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
              <label style={{ marginBottom: 8 }}>边的粗细: <input type="number" min={1} max={20} value={edgeWidth} onChange={e => setEdgeWidth(Number(e.target.value))} style={{ width: 40 }} /></label>
              <label style={{ marginBottom: 8 }}>斥力强度: <input type="number" min={-10000} max={10000} step={10} value={chargeStrength} onChange={e => setChargeStrength(Number(e.target.value))} style={{ width: 60 }} /></label>
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
              <div style={{ marginTop: 16, width: '100%' }}>
                <button 
                  onClick={arrangeAsTree}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  title="将所有节点按BFS层次结构排列并固定"
                >
                  层次布局
                </button>
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

export default GraphVisualization;
