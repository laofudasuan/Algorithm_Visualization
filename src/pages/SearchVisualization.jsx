import { useState, useRef } from 'react';

function SearchVisualization() {
  const [grid, setGrid] = useState(Array(20).fill().map(() => Array(20).fill(0)));
  const [distances, setDistances] = useState(Array(20).fill().map(() => Array(20).fill(-1)));
  const [algorithm, setAlgorithm] = useState('bfs');
  const [isRunning, setIsRunning] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [startNode, setStartNode] = useState({ row: 5, col: 5 });
  const [endNode, setEndNode] = useState({ row: 15, col: 15 });
  const [mousePressed, setMousePressed] = useState(false);
  const [drawMode, setDrawMode] = useState('wall'); // wall, start, end
  const animationRef = useRef(null);

  // 网格状态: 0=空, 1=墙, 2=起点, 3=终点, 4=访问过, 5=路径, 6=当前访问
  const CELL_TYPES = {
    EMPTY: 0,
    WALL: 1,
    START: 2,
    END: 3,
    VISITED: 4,
    PATH: 5,
    CURRENT: 6
  };

  // 获取单元格颜色
  const getCellColor = (cellType) => {
    switch (cellType) {
      case CELL_TYPES.EMPTY: return '#ffffff';
      case CELL_TYPES.WALL: return '#333333';
      case CELL_TYPES.START: return '#00ff00';
      case CELL_TYPES.END: return '#ff0000';
      case CELL_TYPES.VISITED: return '#87ceeb';
      case CELL_TYPES.PATH: return '#ffff00';
      case CELL_TYPES.CURRENT: return '#ff69b4';
      default: return '#ffffff';
    }
  };

  // 重置网格
  const resetGrid = () => {
    const newGrid = Array(20).fill().map(() => Array(20).fill(0));
    const newDistances = Array(20).fill().map(() => Array(20).fill(-1));
    newGrid[startNode.row][startNode.col] = CELL_TYPES.START;
    newGrid[endNode.row][endNode.col] = CELL_TYPES.END;
    newDistances[startNode.row][startNode.col] = 0;
    setGrid(newGrid);
    setDistances(newDistances);
  };

  // 清除路径和访问痕迹
  const clearPath = () => {
    const newGrid = grid.map(row => 
      row.map(cell => 
        cell === CELL_TYPES.VISITED || cell === CELL_TYPES.PATH || cell === CELL_TYPES.CURRENT 
          ? CELL_TYPES.EMPTY 
          : cell
      )
    );
    const newDistances = Array(20).fill().map(() => Array(20).fill(-1));
    newDistances[startNode.row][startNode.col] = 0;
    setGrid(newGrid);
    setDistances(newDistances);
  };

  // 处理鼠标点击
  const handleMouseDown = (row, col) => {
    if (isRunning) return;
    setMousePressed(true);
    handleCellClick(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (!mousePressed || isRunning) return;
    handleCellClick(row, col);
  };

  const handleMouseUp = () => {
    setMousePressed(false);
  };

  const handleCellClick = (row, col) => {
    const newGrid = [...grid];
    const newDistances = [...distances];
    
    if (drawMode === 'start') {
      // 清除旧起点
      newGrid[startNode.row][startNode.col] = CELL_TYPES.EMPTY;
      newDistances[startNode.row][startNode.col] = -1;
      newGrid[row][col] = CELL_TYPES.START;
      newDistances[row][col] = 0;
      setStartNode({ row, col });
    } else if (drawMode === 'end') {
      // 清除旧终点
      newGrid[endNode.row][endNode.col] = CELL_TYPES.EMPTY;
      newGrid[row][col] = CELL_TYPES.END;
      setEndNode({ row, col });
    } else if (drawMode === 'wall') {
      if (newGrid[row][col] === CELL_TYPES.EMPTY) {
        newGrid[row][col] = CELL_TYPES.WALL;
        newDistances[row][col] = -1;
      } else if (newGrid[row][col] === CELL_TYPES.WALL) {
        newGrid[row][col] = CELL_TYPES.EMPTY;
        newDistances[row][col] = -1;
      }
    }
    
    setGrid(newGrid);
    setDistances(newDistances);
  };

  // 获取邻居节点
  const getNeighbors = (row, col) => {
    const neighbors = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (newRow >= 0 && newRow < 20 && newCol >= 0 && newCol < 20) {
        neighbors.push({ row: newRow, col: newCol });
      }
    }
    
    return neighbors;
  };

  // BFS算法
  const bfsSearch = async () => {
    const visited = new Set();
    const queue = [{ ...startNode, path: [startNode], distance: 0 }];
    const newGrid = [...grid];
    const newDistances = [...distances];
    
    while (queue.length > 0) {
      const current = queue.shift();
      const { row, col, path, distance } = current;
      const key = `${row}-${col}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      // 更新距离
      newDistances[row][col] = distance;
      
      // 标记当前访问的节点
      if (!(row === startNode.row && col === startNode.col) && 
          !(row === endNode.row && col === endNode.col)) {
        newGrid[row][col] = CELL_TYPES.CURRENT;
        setGrid([...newGrid]);
        setDistances([...newDistances]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        newGrid[row][col] = CELL_TYPES.VISITED;
      }
      
      // 找到终点
      if (row === endNode.row && col === endNode.col) {
        // 绘制路径
        for (const pathNode of path) {
          if (!(pathNode.row === startNode.row && pathNode.col === startNode.col) &&
              !(pathNode.row === endNode.row && pathNode.col === endNode.col)) {
            newGrid[pathNode.row][pathNode.col] = CELL_TYPES.PATH;
          }
        }
        setGrid([...newGrid]);
        setDistances([...newDistances]);
        return true;
      }
      
      // 添加邻居到队列
      for (const neighbor of getNeighbors(row, col)) {
        const neighborKey = `${neighbor.row}-${neighbor.col}`;
        if (!visited.has(neighborKey) && 
            newGrid[neighbor.row][neighbor.col] !== CELL_TYPES.WALL) {
          queue.push({
            ...neighbor,
            path: [...path, neighbor],
            distance: distance + 1
          });
        }
      }
      
      setGrid([...newGrid]);
      setDistances([...newDistances]);
    }
    
    return false; // 未找到路径
  };

  // DFS算法
  const dfsSearch = async () => {
    const visited = new Set();
    const stack = [{ ...startNode, path: [startNode], distance: 0 }];
    const newGrid = [...grid];
    const newDistances = [...distances];
    
    while (stack.length > 0) {
      const current = stack.pop();
      const { row, col, path, distance } = current;
      const key = `${row}-${col}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      // 更新距离
      newDistances[row][col] = distance;
      
      // 标记当前访问的节点
      if (!(row === startNode.row && col === startNode.col) && 
          !(row === endNode.row && col === endNode.col)) {
        newGrid[row][col] = CELL_TYPES.CURRENT;
        setGrid([...newGrid]);
        setDistances([...newDistances]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        newGrid[row][col] = CELL_TYPES.VISITED;
      }
      
      // 找到终点
      if (row === endNode.row && col === endNode.col) {
        // 绘制路径
        for (const pathNode of path) {
          if (!(pathNode.row === startNode.row && pathNode.col === startNode.col) &&
              !(pathNode.row === endNode.row && pathNode.col === endNode.col)) {
            newGrid[pathNode.row][pathNode.col] = CELL_TYPES.PATH;
          }
        }
        setGrid([...newGrid]);
        setDistances([...newDistances]);
        return true;
      }
      
      // 添加邻居到栈
      const neighbors = getNeighbors(row, col);
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i];
        const neighborKey = `${neighbor.row}-${neighbor.col}`;
        if (!visited.has(neighborKey) && 
            newGrid[neighbor.row][neighbor.col] !== CELL_TYPES.WALL) {
          stack.push({
            ...neighbor,
            path: [...path, neighbor],
            distance: distance + 1
          });
        }
      }
      
      setGrid([...newGrid]);
      setDistances([...newDistances]);
    }
    
    return false; // 未找到路径
  };

  // A*算法
  const astarSearch = async () => {
    const visited = new Set();
    const openSet = [{ ...startNode, g: 0, h: 0, f: 0, path: [startNode] }];
    const newGrid = [...grid];
    const newDistances = [...distances];
    
    // 曼哈顿距离启发函数
    const heuristic = (node) => {
      return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
    };
    
    while (openSet.length > 0) {
      // 选择f值最小的节点
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();
      const { row, col, g, path } = current;
      const key = `${row}-${col}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      // 更新距离（使用g值，即从起点的实际距离）
      newDistances[row][col] = g;
      
      // 标记当前访问的节点
      if (!(row === startNode.row && col === startNode.col) && 
          !(row === endNode.row && col === endNode.col)) {
        newGrid[row][col] = CELL_TYPES.CURRENT;
        setGrid([...newGrid]);
        setDistances([...newDistances]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
        newGrid[row][col] = CELL_TYPES.VISITED;
      }
      
      // 找到终点
      if (row === endNode.row && col === endNode.col) {
        // 绘制路径
        for (const pathNode of path) {
          if (!(pathNode.row === startNode.row && pathNode.col === startNode.col) &&
              !(pathNode.row === endNode.row && pathNode.col === endNode.col)) {
            newGrid[pathNode.row][pathNode.col] = CELL_TYPES.PATH;
          }
        }
        setGrid([...newGrid]);
        setDistances([...newDistances]);
        return true;
      }
      
      // 添加邻居到开放集合
      for (const neighbor of getNeighbors(row, col)) {
        const neighborKey = `${neighbor.row}-${neighbor.col}`;
        if (!visited.has(neighborKey) && 
            newGrid[neighbor.row][neighbor.col] !== CELL_TYPES.WALL) {
          const newG = g + 1;
          const newH = heuristic(neighbor);
          const newF = newG + newH;
          
          openSet.push({
            ...neighbor,
            g: newG,
            h: newH,
            f: newF,
            path: [...path, neighbor]
          });
        }
      }
      
      setGrid([...newGrid]);
      setDistances([...newDistances]);
    }
    
    return false; // 未找到路径
  };

  // 开始搜索
  const startSearch = async () => {
    if (isRunning) return;
    
    clearPath();
    setIsRunning(true);
    
    let found = false;
    try {
      switch (algorithm) {
        case 'bfs':
          found = await bfsSearch();
          break;
        case 'dfs':
          found = await dfsSearch();
          break;
        case 'astar':
          found = await astarSearch();
          break;
        default:
          break;
      }
      
      if (!found) {
        alert('未找到路径！');
      }
    } catch (error) {
      console.error('搜索过程中出错:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // 初始化网格
  useState(() => {
    resetGrid();
  }, []);

  return (
    <div style={{ padding: '20px 0 20px 0', width: '100vw', margin: '0 auto', maxWidth: '100vw', overflowX: 'hidden', marginLeft: 0, marginRight: 0 }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#1976d2' }}>路径搜索可视化</h1>
      
      {/* 控制面板 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>算法:</label>
          <select 
            value={algorithm} 
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={isRunning}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="bfs">广度优先搜索 (BFS)</option>
            <option value="dfs">深度优先搜索 (DFS)</option>
            <option value="astar">A*搜索</option>
          </select>
        </div>
        
        <div>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>绘制模式:</label>
          <select 
            value={drawMode} 
            onChange={(e) => setDrawMode(e.target.value)}
            disabled={isRunning}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="wall">墙壁</option>
            <option value="start">起点</option>
            <option value="end">终点</option>
          </select>
        </div>
        
        <div>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>速度:</label>
          <input 
            type="range" 
            min="10" 
            max="200" 
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(Number(e.target.value))}
            disabled={isRunning}
            style={{ marginRight: '10px' }}
          />
          <span>{animationSpeed}ms</span>
        </div>
        
        <button 
          onClick={startSearch}
          disabled={isRunning}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#1976d2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1
          }}
        >
          {isRunning ? '搜索中...' : '开始搜索'}
        </button>
        
        <button 
          onClick={clearPath}
          disabled={isRunning}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#ff9800', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1
          }}
        >
          清除路径
        </button>
        
        <button 
          onClick={resetGrid}
          disabled={isRunning}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#f44336', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1
          }}
        >
          重置网格
        </button>
      </div>

      {/* 图例 */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#ffffff', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        flexWrap: 'wrap'
      }}>
        {[
          { type: CELL_TYPES.START, label: '起点' },
          { type: CELL_TYPES.END, label: '终点' },
          { type: CELL_TYPES.WALL, label: '墙壁' },
          { type: CELL_TYPES.VISITED, label: '已访问' },
          { type: CELL_TYPES.CURRENT, label: '当前访问' },
          { type: CELL_TYPES.PATH, label: '最短路径' }
        ].map(({ type, label }) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: getCellColor(type),
              border: '1px solid #ccc',
              borderRadius: '2px'
            }}></div>
            <span style={{ fontSize: '14px' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* 网格 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(20, 25px)',
            gap: '1px',
            backgroundColor: '#ccc',
            padding: '1px',
            borderRadius: '4px'
          }}
          onMouseLeave={handleMouseUp}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: '25px',
                  height: '25px',
                  backgroundColor: getCellColor(cell),
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: distances[rowIndex][colIndex] >= 0 ? 
                    (cell === CELL_TYPES.VISITED || cell === CELL_TYPES.PATH || cell === CELL_TYPES.CURRENT ? '#fff' : '#333') : 
                    'transparent'
                }}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                onMouseUp={handleMouseUp}
              >
                {distances[rowIndex][colIndex] >= 0 ? distances[rowIndex][colIndex] : ''}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 算法说明 */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>算法说明</h3>
        {algorithm === 'bfs' && (
          <div>
            <p><strong>广度优先搜索 (BFS):</strong> 从起点开始，逐层向外搜索，保证找到的第一条路径就是最短路径。</p>
            <p><strong>特点:</strong> 保证找到最短路径，但可能需要更多内存。</p>
            <p><strong>时间复杂度:</strong> O(V + E)，其中V是顶点数，E是边数。</p>
          </div>
        )}
        {algorithm === 'dfs' && (
          <div>
            <p><strong>深度优先搜索 (DFS):</strong> 从起点开始，沿着一个方向深入搜索，直到无法继续，然后回溯。</p>
            <p><strong>特点:</strong> 不保证找到最短路径，但内存使用较少。</p>
            <p><strong>时间复杂度:</strong> O(V + E)，其中V是顶点数，E是边数。</p>
          </div>
        )}
        {algorithm === 'astar' && (
          <div>
            <p><strong>A*搜索:</strong> 结合了实际距离和启发式距离的搜索算法，通常能更快找到最短路径。</p>
            <p><strong>特点:</strong> 使用启发式函数（这里是曼哈顿距离）指导搜索方向，既保证最优解又提高效率。</p>
            <p><strong>时间复杂度:</strong> O(b^d)，其中b是分支因子，d是解的深度。</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchVisualization;
