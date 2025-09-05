import { useState, useEffect, useRef } from 'react';

function TreeDP() {
  const [nodes, setNodes] = useState([
    { id: 1, val: 1, x: 400, y: 50 },
    { id: 2, val: 2, x: 250, y: 150 },
    { id: 3, val: 3, x: 550, y: 150 },
    { id: 4, val: 4, x: 150, y: 250 },
    { id: 5, val: 5, x: 350, y: 250 },
    { id: 6, val: 6, x: 450, y: 250 },
    { id: 7, val: 7, x: 650, y: 250 }
  ]);
  
  const [links, setLinks] = useState([
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 2, target: 4 },
    { source: 2, target: 5 },
    { source: 3, target: 6 },
    { source: 3, target: 7 }
  ]);
  
  const [dpValues, setDpValues] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [currentNode, setCurrentNode] = useState(null);
  const [calculatedNodes, setCalculatedNodes] = useState(new Set());
  const canvasRef = useRef(null);

  // 树形动态规划算法：计算子树大小
  const treeDP = async () => {
    setIsAnimating(true);
    setDpValues({});
    setCalculatedNodes(new Set());
    setCurrentNode(null);

    // 构建邻接表
    const graph = {};
    nodes.forEach(node => {
      graph[node.id] = [];
    });
    
    links.forEach(link => {
      if (!graph[link.source]) graph[link.source] = [];
      if (!graph[link.target]) graph[link.target] = [];
      graph[link.source].push(link.target);
      graph[link.target].push(link.source);
    });

    // 执行DFS计算子树大小
    await dfs(1, -1, graph);
    
    setIsAnimating(false);
  };

  const dfs = async (nodeId, parentId, graph) => {
    setCurrentNode(nodeId);
    
    // 等待动画时间
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    let subtreeSize = 1; // 节点本身
    
    // 遍历所有子节点
    for (const neighbor of graph[nodeId]) {
      if (neighbor !== parentId) {
        subtreeSize += await dfs(neighbor, nodeId, graph);
      }
    }
    
    // 设置当前节点的DP值
    setDpValues(prev => ({
      ...prev,
      [nodeId]: subtreeSize
    }));
    
    setCalculatedNodes(prev => new Set([...prev, nodeId]));
    return subtreeSize;
  };

  const reset = () => {
    setIsAnimating(false);
    setDpValues({});
    setCurrentNode(null);
    setCalculatedNodes(new Set());
  };

  const getNodeColor = (nodeId) => {
    if (currentNode === nodeId) return '#ff9800'; // 当前处理节点
    if (calculatedNodes.has(nodeId)) return '#4caf50'; // 已计算节点
    return '#2196f3'; // 默认节点
  };

  // 绘制连接线
  const drawLines = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制连接线
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      
      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();
      }
    });
  };

  // 在canvas上绘制树结构
  useEffect(() => {
    drawLines();
  }, [nodes, links]);

  return (
    <div style={{ padding: '20px', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2' }}>树形动态规划可视化</h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* 控制面板 */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 16, 
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          width: '100%'
        }}>
          <div>
            <label style={{ marginRight: 8 }}>动画速度:</label>
            <input 
              type="range" 
              min="500" 
              max="2000" 
              value={animationSpeed}
              onChange={e => setAnimationSpeed(Number(e.target.value))}
              disabled={isAnimating}
              style={{ width: 100 }}
            />
            <span style={{ marginLeft: 8 }}>{animationSpeed}ms</span>
          </div>
          
          <button 
            onClick={treeDP} 
            disabled={isAnimating}
            style={{ 
              padding: '8px 16px', 
              background: '#1976d2', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: isAnimating ? 'not-allowed' : 'pointer' 
            }}
          >
            {isAnimating ? '计算中...' : '开始计算子树大小'}
          </button>
          
          <button 
            onClick={reset} 
            disabled={isAnimating}
            style={{ 
              padding: '8px 16px', 
              background: '#666', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4,
              cursor: isAnimating ? 'not-allowed' : 'pointer'
            }}
          >
            重置
          </button>
        </div>

        {/* 树形结构可视化 */}
        <div style={{ 
          position: 'relative',
          width: '100%', 
          height: 400, 
          border: '2px solid #1976d2',
          borderRadius: '8px',
          background: 'white',
          overflow: 'hidden'
        }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
          
          {nodes.map(node => (
            <div
              key={node.id}
              className={`node node-${node.id}`}
              style={{
                position: 'absolute',
                left: node.x - 20,
                top: node.y - 20,
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: getNodeColor(node.id),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                zIndex: 10,
                transform: currentNode === node.id ? 'scale(1.2)' : 'scale(1)',
                transition: `all ${animationSpeed/2}ms ease-in-out`,
                userSelect: 'none'
              }}
            >
              {node.val}
              {dpValues[node.id] !== undefined && (
                <div style={{ 
                  position: 'absolute', 
                  top: -20, 
                  fontSize: '12px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap'
                }}>
                  {dpValues[node.id]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* DP值显示 */}
        <div style={{ 
          width: '100%',
          maxWidth: '800px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <h3>动态规划值 (子树大小):</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {nodes.map(node => (
              <div 
                key={node.id}
                style={{
                  padding: '10px',
                  backgroundColor: calculatedNodes.has(node.id) ? '#4caf50' : '#e0e0e0',
                  borderRadius: '4px',
                  color: calculatedNodes.has(node.id) ? 'white' : 'black',
                  minWidth: '80px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <div>节点 {node.val}</div>
                <div>{dpValues[node.id] !== undefined ? dpValues[node.id] : '?'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 算法说明 */}
        <div style={{ 
          maxWidth: 800, 
          padding: 20, 
          border: '1px solid #ddd', 
          borderRadius: 8, 
          background: '#f5f5f5' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>树形动态规划说明</h3>
          <div style={{ color: '#666' }}>
            <p><strong>基本思想:</strong> 树形动态规划是动态规划的一种特殊形式，适用于树结构上的问题。通过深度优先搜索(DFS)遍历树，自底向上计算每个节点的状态值。</p>
            
            <p><strong>算法步骤:</strong></p>
            <ol>
              <li>选择一个根节点（通常选择节点1）</li>
              <li>通过DFS遍历树的每个节点</li>
              <li>在回溯过程中计算当前节点的DP值</li>
              <li>利用子节点的DP值更新父节点的DP值</li>
            </ol>
            
            <p><strong>示例问题 - 计算子树大小:</strong></p>
            <p>状态定义: dp[u] 表示以节点u为根的子树的节点数量</p>
            <p>状态转移方程: dp[u] = 1 + Σ(dp[v])，其中v是u的子节点</p>
            
            <p><strong>时间复杂度:</strong> O(N)，其中N是树中节点的数量</p>
            <p><strong>空间复杂度:</strong> O(N)</p>
            
            <p><strong>颜色说明:</strong></p>
            <ul>
              <li>🔵 蓝色 = 未处理节点</li>
              <li>🟠 橙色 = 当前正在处理的节点</li>
              <li>🟢 绿色 = 已完成计算的节点</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TreeDP;