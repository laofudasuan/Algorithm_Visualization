import { useState, useEffect } from 'react';

function BalancedTreeVisualization() {
  // 通用节点结构
  class TreeNode {
    constructor(value, type = 'avl') {
      this.value = value;
      this.left = null;
      this.right = null;
      this.x = 0;
      this.y = 0;
      this.id = Math.random().toString(36).substr(2, 9);
      
      // AVL特有属性
      if (type === 'avl') {
        this.height = 1;
      }
      
      // Treap特有属性
      if (type === 'treap') {
        this.priority = Math.floor(Math.random() * 100) + 1;
      }
      
      // Splay树不需要额外属性，但我们记录访问次数用于展示
      if (type === 'splay') {
        this.accessCount = 0;
      }
    }
  }

  // 状态管理
  const [treeType, setTreeType] = useState('avl'); // 'avl', 'treap', 'splay'
  const [root, setRoot] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [currentOperation, setCurrentOperation] = useState('');
  const [insertValue, setInsertValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [deleteValue, setDeleteValue] = useState('');
  const [operationLog, setOperationLog] = useState([]);
  const [searchResult, setSearchResult] = useState(null);

  // 计算节点高度
  const getHeight = (node) => {
    return node ? node.height : 0;
  };

  // 计算平衡因子
  const getBalance = (node) => {
    return node ? getHeight(node.left) - getHeight(node.right) : 0;
  };

  // 更新节点高度
  const updateHeight = (node) => {
    if (node) {
      node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
    }
  };

  // 右旋转
  const rotateRight = async (y) => {
    if (isAnimating) {
      await addLog(`执行右旋转，以节点 ${y.value} 为轴`);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    
    const x = y.left;
    const T2 = x.right;

    // 执行旋转
    x.right = y;
    y.left = T2;

    // 更新高度
    updateHeight(y);
    updateHeight(x);

    return x;
  };

  // 左旋转
  const rotateLeft = async (x) => {
    if (isAnimating) {
      await addLog(`执行左旋转，以节点 ${x.value} 为轴`);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    
    const y = x.right;
    const T2 = y.left;

    // 执行旋转
    y.left = x;
    x.right = T2;

    // 更新高度
    updateHeight(x);
    updateHeight(y);

    return y;
  };

  // 插入节点
  const insertNode = async (node, value) => {
    // 1. 执行标准BST插入
    if (!node) {
      const newNode = new AVLNode(value);
      if (isAnimating) {
        await addLog(`插入节点 ${value}`);
        setHighlightedNodes([newNode.id]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
      }
      return newNode;
    }

    if (isAnimating) {
      setHighlightedNodes([node.id]);
      await addLog(`访问节点 ${node.value}，比较与 ${value}`);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }

    if (value < node.value) {
      node.left = await insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = await insertNode(node.right, value);
    } else {
      // 相等的值不插入
      if (isAnimating) {
        await addLog(`节点 ${value} 已存在，跳过插入`);
      }
      return node;
    }

    // 2. 更新节点高度
    updateHeight(node);

    // 3. 获取平衡因子
    const balance = getBalance(node);

    if (isAnimating) {
      await addLog(`节点 ${node.value} 的平衡因子: ${balance}`);
    }

    // 4. 如果节点不平衡，进行旋转
    // Left Left Case
    if (balance > 1 && value < node.left.value) {
      if (isAnimating) {
        await addLog(`检测到LL不平衡，执行右旋转`);
      }
      return await rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && value > node.right.value) {
      if (isAnimating) {
        await addLog(`检测到RR不平衡，执行左旋转`);
      }
      return await rotateLeft(node);
    }

    // Left Right Case
    if (balance > 1 && value > node.left.value) {
      if (isAnimating) {
        await addLog(`检测到LR不平衡，先左旋转后右旋转`);
      }
      node.left = await rotateLeft(node.left);
      return await rotateRight(node);
    }

    // Right Left Case
    if (balance < -1 && value < node.right.value) {
      if (isAnimating) {
        await addLog(`检测到RL不平衡，先右旋转后左旋转`);
      }
      node.right = await rotateRight(node.right);
      return await rotateLeft(node);
    }

    return node;
  };

  // 查找最小值节点
  const findMinNode = (node) => {
    while (node.left) {
      node = node.left;
    }
    return node;
  };

  // 删除节点
  const deleteNode = async (node, value) => {
    if (!node) {
      if (isAnimating) {
        await addLog(`节点 ${value} 不存在`);
      }
      return node;
    }

    if (isAnimating) {
      setHighlightedNodes([node.id]);
      await addLog(`访问节点 ${node.value}，查找要删除的 ${value}`);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }

    if (value < node.value) {
      node.left = await deleteNode(node.left, value);
    } else if (value > node.value) {
      node.right = await deleteNode(node.right, value);
    } else {
      // 找到要删除的节点
      if (isAnimating) {
        await addLog(`找到要删除的节点 ${value}`);
      }

      // 只有一个子节点或没有子节点
      if (!node.left || !node.right) {
        const temp = node.left || node.right;
        
        if (!temp) {
          // 没有子节点
          if (isAnimating) {
            await addLog(`节点 ${value} 没有子节点，直接删除`);
          }
          node = null;
        } else {
          // 一个子节点
          if (isAnimating) {
            await addLog(`节点 ${value} 有一个子节点，用子节点替换`);
          }
          node = temp;
        }
      } else {
        // 有两个子节点
        if (isAnimating) {
          await addLog(`节点 ${value} 有两个子节点，找到右子树最小值`);
        }
        
        const temp = findMinNode(node.right);
        if (isAnimating) {
          await addLog(`用节点 ${temp.value} 替换节点 ${value}`);
        }
        
        node.value = temp.value;
        node.right = await deleteNode(node.right, temp.value);
      }
    }

    if (!node) return node;

    // 更新高度
    updateHeight(node);

    // 获取平衡因子
    const balance = getBalance(node);

    if (isAnimating) {
      await addLog(`节点 ${node.value} 的平衡因子: ${balance}`);
    }

    // 旋转以保持平衡
    // Left Left Case
    if (balance > 1 && getBalance(node.left) >= 0) {
      if (isAnimating) {
        await addLog(`检测到LL不平衡，执行右旋转`);
      }
      return await rotateRight(node);
    }

    // Left Right Case
    if (balance > 1 && getBalance(node.left) < 0) {
      if (isAnimating) {
        await addLog(`检测到LR不平衡，先左旋转后右旋转`);
      }
      node.left = await rotateLeft(node.left);
      return await rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && getBalance(node.right) <= 0) {
      if (isAnimating) {
        await addLog(`检测到RR不平衡，执行左旋转`);
      }
      return await rotateLeft(node);
    }

    // Right Left Case
    if (balance < -1 && getBalance(node.right) > 0) {
      if (isAnimating) {
        await addLog(`检测到RL不平衡，先右旋转后左旋转`);
      }
      node.right = await rotateRight(node.right);
      return await rotateLeft(node);
    }

    return node;
  };

  // 搜索节点
  const searchNode = async (node, value) => {
    const path = [];
    
    while (node) {
      path.push(node.id);
      if (isAnimating) {
        setHighlightedNodes([...path]);
        await addLog(`访问节点 ${node.value}，比较与 ${value}`);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
      }

      if (value === node.value) {
        if (isAnimating) {
          await addLog(`找到节点 ${value}！`);
        }
        return { found: true, path };
      } else if (value < node.value) {
        if (isAnimating) {
          await addLog(`${value} < ${node.value}，向左子树搜索`);
        }
        node = node.left;
      } else {
        if (isAnimating) {
          await addLog(`${value} > ${node.value}，向右子树搜索`);
        }
        node = node.right;
      }
    }

    if (isAnimating) {
      await addLog(`节点 ${value} 不存在`);
    }
    return { found: false, path };
  };

  // 添加操作日志
  const addLog = async (message) => {
    setOperationLog(prev => [...prev, message]);
    return Promise.resolve();
  };

  // ==================== TREAP 算法 ====================
  
  // Treap右旋转
  const treapRotateRight = async (y) => {
    if (isAnimating) {
      await addLog(`Treap右旋转，以节点 ${y.value}(优先级:${y.priority}) 为轴`);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    
    const x = y.left;
    y.left = x.right;
    x.right = y;
    return x;
  };

  // Treap左旋转
  const treapRotateLeft = async (x) => {
    if (isAnimating) {
      await addLog(`Treap左旋转，以节点 ${x.value}(优先级:${x.priority}) 为轴`);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    
    const y = x.right;
    x.right = y.left;
    y.left = x;
    return y;
  };

  // Treap插入
  const treapInsert = async (node, value) => {
    if (!node) {
      const newNode = new TreeNode(value, 'treap');
      if (isAnimating) {
        await addLog(`插入节点 ${value}，优先级: ${newNode.priority}`);
        setHighlightedNodes([newNode.id]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
      }
      return newNode;
    }

    if (isAnimating) {
      setHighlightedNodes([node.id]);
      await addLog(`访问节点 ${node.value}(优先级:${node.priority})，比较与 ${value}`);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }

    if (value < node.value) {
      node.left = await treapInsert(node.left, value);
      // 检查堆性质
      if (node.left && node.left.priority > node.priority) {
        if (isAnimating) {
          await addLog(`违反堆性质，执行右旋转`);
        }
        node = await treapRotateRight(node);
      }
    } else if (value > node.value) {
      node.right = await treapInsert(node.right, value);
      // 检查堆性质
      if (node.right && node.right.priority > node.priority) {
        if (isAnimating) {
          await addLog(`违反堆性质，执行左旋转`);
        }
        node = await treapRotateLeft(node);
      }
    } else {
      if (isAnimating) {
        await addLog(`节点 ${value} 已存在，跳过插入`);
      }
    }

    return node;
  };

  // Treap删除
  const treapDelete = async (node, value) => {
    if (!node) {
      if (isAnimating) {
        await addLog(`节点 ${value} 不存在`);
      }
      return null;
    }

    if (isAnimating) {
      setHighlightedNodes([node.id]);
      await addLog(`访问节点 ${node.value}(优先级:${node.priority})，查找要删除的 ${value}`);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }

    if (value < node.value) {
      node.left = await treapDelete(node.left, value);
    } else if (value > node.value) {
      node.right = await treapDelete(node.right, value);
    } else {
      // 找到要删除的节点
      if (isAnimating) {
        await addLog(`找到要删除的节点 ${value}`);
      }

      if (!node.left) {
        return node.right;
      } else if (!node.right) {
        return node.left;
      } else {
        // 有两个子节点，旋转优先级更高的子节点到根
        if (node.left.priority > node.right.priority) {
          if (isAnimating) {
            await addLog(`左子节点优先级更高，右旋转后继续删除`);
          }
          node = await treapRotateRight(node);
          node.right = await treapDelete(node.right, value);
        } else {
          if (isAnimating) {
            await addLog(`右子节点优先级更高，左旋转后继续删除`);
          }
          node = await treapRotateLeft(node);
          node.left = await treapDelete(node.left, value);
        }
      }
    }

    return node;
  };

  // ==================== SPLAY 算法 ====================
  
  // Splay右旋转（Zig）
  const splayRotateRight = async (y) => {
    if (isAnimating) {
      await addLog(`Splay右旋转(Zig)，将节点 ${y.left.value} 旋转到根`);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    
    const x = y.left;
    y.left = x.right;
    x.right = y;
    return x;
  };

  // Splay左旋转（Zag）
  const splayRotateLeft = async (x) => {
    if (isAnimating) {
      await addLog(`Splay左旋转(Zag)，将节点 ${x.right.value} 旋转到根`);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    
    const y = x.right;
    x.right = y.left;
    y.left = x;
    return y;
  };

  // Splay操作
  const splay = async (node, value) => {
    if (!node || node.value === value) {
      return node;
    }

    // 值在左子树
    if (value < node.value) {
      if (!node.left) return node;

      // Zig-Zig (左-左)
      if (value < node.left.value) {
        if (isAnimating) {
          await addLog(`执行Zig-Zig操作`);
        }
        node.left.left = await splay(node.left.left, value);
        node = await splayRotateRight(node);
        if (node.left) {
          node = await splayRotateRight(node);
        }
      }
      // Zig-Zag (左-右)
      else if (value > node.left.value) {
        if (isAnimating) {
          await addLog(`执行Zig-Zag操作`);
        }
        node.left.right = await splay(node.left.right, value);
        if (node.left.right) {
          node.left = await splayRotateLeft(node.left);
        }
        if (node.left) {
          node = await splayRotateRight(node);
        }
      }
      // Zig
      else {
        if (isAnimating) {
          await addLog(`执行Zig操作`);
        }
        node = await splayRotateRight(node);
      }
    }
    // 值在右子树
    else {
      if (!node.right) return node;

      // Zag-Zag (右-右)
      if (value > node.right.value) {
        if (isAnimating) {
          await addLog(`执行Zag-Zag操作`);
        }
        node.right.right = await splay(node.right.right, value);
        node = await splayRotateLeft(node);
        if (node.right) {
          node = await splayRotateLeft(node);
        }
      }
      // Zag-Zig (右-左)
      else if (value < node.right.value) {
        if (isAnimating) {
          await addLog(`执行Zag-Zig操作`);
        }
        node.right.left = await splay(node.right.left, value);
        if (node.right.left) {
          node.right = await splayRotateRight(node.right);
        }
        if (node.right) {
          node = await splayRotateLeft(node);
        }
      }
      // Zag
      else {
        if (isAnimating) {
          await addLog(`执行Zag操作`);
        }
        node = await splayRotateLeft(node);
      }
    }

    return node;
  };

  // Splay插入
  const splayInsert = async (node, value) => {
    if (!node) {
      const newNode = new TreeNode(value, 'splay');
      if (isAnimating) {
        await addLog(`插入节点 ${value}，并splay到根`);
        setHighlightedNodes([newNode.id]);
        await new Promise(resolve => setTimeout(resolve, animationSpeed));
      }
      return newNode;
    }

    node = await splay(node, value);

    if (node.value === value) {
      if (isAnimating) {
        await addLog(`节点 ${value} 已存在，splay到根`);
      }
      return node;
    }

    const newNode = new TreeNode(value, 'splay');
    
    if (value < node.value) {
      newNode.right = node;
      newNode.left = node.left;
      node.left = null;
      if (isAnimating) {
        await addLog(`插入节点 ${value} 作为新根，原根作为右子树`);
      }
    } else {
      newNode.left = node;
      newNode.right = node.right;
      node.right = null;
      if (isAnimating) {
        await addLog(`插入节点 ${value} 作为新根，原根作为左子树`);
      }
    }

    return newNode;
  };

  // Splay删除
  const splayDelete = async (node, value) => {
    if (!node) {
      if (isAnimating) {
        await addLog(`节点 ${value} 不存在`);
      }
      return null;
    }

    node = await splay(node, value);

    if (node.value !== value) {
      if (isAnimating) {
        await addLog(`节点 ${value} 不存在`);
      }
      return node;
    }

    if (isAnimating) {
      await addLog(`删除根节点 ${value}`);
    }

    if (!node.left) {
      return node.right;
    } else {
      const leftSubtree = await splay(node.left, value); // Splay左子树的最大值
      leftSubtree.right = node.right;
      return leftSubtree;
    }
  };

  // Splay搜索
  const splaySearch = async (node, value) => {
    if (!node) {
      return { found: false, newRoot: null };
    }

    const newRoot = await splay(node, value);
    const found = newRoot.value === value;
    
    if (isAnimating) {
      if (found) {
        await addLog(`找到节点 ${value}，已splay到根`);
      } else {
        await addLog(`未找到节点 ${value}，最接近的节点 ${newRoot.value} 已splay到根`);
      }
    }

    return { found, newRoot };
  };

  // 计算节点位置
  const calculatePositions = (node, x = 400, y = 50, level = 0) => {
    if (!node) return;
    
    const horizontalSpacing = Math.max(200 / (level + 1), 80);
    
    node.x = x;
    node.y = y;
    
    if (node.left) {
      calculatePositions(node.left, x - horizontalSpacing, y + 80, level + 1);
    }
    if (node.right) {
      calculatePositions(node.right, x + horizontalSpacing, y + 80, level + 1);
    }
  };

  // 渲染树
  const renderTree = () => {
    if (!root) return null;
    
    calculatePositions(root);
    
    const nodes = [];
    const edges = [];

    const traverse = (node) => {
      if (!node) return;
      
      // 渲染连线
      if (node.left) {
        edges.push(
          <line
            key={`edge-${node.id}-${node.left.id}`}
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            stroke="#666"
            strokeWidth="2"
          />
        );
        traverse(node.left);
      }
      
      if (node.right) {
        edges.push(
          <line
            key={`edge-${node.id}-${node.right.id}`}
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            stroke="#666"
            strokeWidth="2"
          />
        );
        traverse(node.right);
      }

      // 渲染节点
      const isHighlighted = highlightedNodes.includes(node.id);
      
      // 根据树类型显示不同信息
      let nodeInfo = '';
      if (treeType === 'avl') {
        const balance = getBalance(node);
        nodeInfo = `h:${node.height} b:${balance}`;
      } else if (treeType === 'treap') {
        nodeInfo = `p:${node.priority}`;
      } else if (treeType === 'splay') {
        nodeInfo = `访问:${node.accessCount}`;
      }
      
      nodes.push(
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r="25"
            fill={isHighlighted ? "#ff9800" : 
                  treeType === 'avl' ? "#2196f3" : 
                  treeType === 'treap' ? "#4caf50" : "#9c27b0"}
            stroke="#fff"
            strokeWidth="3"
          />
          <text
            x={node.x}
            y={node.y + 5}
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
          >
            {node.value}
          </text>
          <text
            x={node.x}
            y={node.y - 35}
            textAnchor="middle"
            fill="#666"
            fontSize="12"
          >
            {nodeInfo}
          </text>
        </g>
      );
    };

    traverse(root);
    
    return [...edges, ...nodes];
  };

  // 插入操作
  const handleInsert = async () => {
    const value = parseInt(insertValue);
    if (isNaN(value)) return;
    
    setIsAnimating(true);
    setHighlightedNodes([]);
    setOperationLog([]);
    setCurrentOperation(`插入节点 ${value}`);
    
    let newRoot;
    if (treeType === 'avl') {
      newRoot = await insertNode(root, value);
    } else if (treeType === 'treap') {
      newRoot = await treapInsert(root, value);
    } else if (treeType === 'splay') {
      newRoot = await splayInsert(root, value);
    }
    
    setRoot(newRoot);
    setCurrentOperation('');
    setInsertValue('');
    setIsAnimating(false);
  };

  // 删除操作
  const handleDelete = async () => {
    const value = parseInt(deleteValue);
    if (isNaN(value) || !root) return;
    
    setIsAnimating(true);
    setHighlightedNodes([]);
    setOperationLog([]);
    setCurrentOperation(`删除节点 ${value}`);
    
    let newRoot;
    if (treeType === 'avl') {
      newRoot = await deleteNode(root, value);
    } else if (treeType === 'treap') {
      newRoot = await treapDelete(root, value);
    } else if (treeType === 'splay') {
      newRoot = await splayDelete(root, value);
    }
    
    setRoot(newRoot);
    setCurrentOperation('');
    setDeleteValue('');
    setIsAnimating(false);
  };

  // 搜索操作
  const handleSearch = async () => {
    const value = parseInt(searchValue);
    if (isNaN(value) || !root) return;
    
    setIsAnimating(true);
    setHighlightedNodes([]);
    setOperationLog([]);
    setCurrentOperation(`搜索节点 ${value}`);
    
    let result;
    if (treeType === 'splay') {
      // Splay树搜索会改变树结构
      const splayResult = await splaySearch(root, value);
      setRoot(splayResult.newRoot);
      result = { found: splayResult.found };
      // 增加访问计数
      if (splayResult.newRoot) {
        splayResult.newRoot.accessCount = (splayResult.newRoot.accessCount || 0) + 1;
      }
    } else {
      result = await searchNode(root, value);
    }
    
    setSearchResult(result);
    setCurrentOperation('');
    setSearchValue('');
    setIsAnimating(false);
  };

  // 清空树
  const clearTree = () => {
    setRoot(null);
    setHighlightedNodes([]);
    setOperationLog([]);
    setSearchResult(null);
    setCurrentOperation('');
  };

  // 预设示例
  const loadExample = async () => {
    setIsAnimating(true);
    clearTree();
    
    const values = [10, 20, 30, 40, 50, 25];
    let currentRoot = null;
    
    for (const value of values) {
      setCurrentOperation(`插入节点 ${value}`);
      
      if (treeType === 'avl') {
        currentRoot = await insertNode(currentRoot, value);
      } else if (treeType === 'treap') {
        currentRoot = await treapInsert(currentRoot, value);
      } else if (treeType === 'splay') {
        currentRoot = await splayInsert(currentRoot, value);
      }
      
      setRoot({...currentRoot});
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }
    
    setCurrentOperation('');
    setIsAnimating(false);
  };

  // 切换树类型时清空树
  const handleTreeTypeChange = (newType) => {
    if (newType !== treeType) {
      setTreeType(newType);
      clearTree();
    }
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, marginLeft: 0 }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2' }}>平衡树可视化</h1>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '30px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* 树类型选择器 */}
        <div style={{ 
          display: 'flex', 
          gap: 10, 
          padding: '10px 20px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 'bold', color: '#666' }}>选择树类型:</span>
          {['avl', 'treap', 'splay'].map((type) => (
            <button
              key={type}
              onClick={() => handleTreeTypeChange(type)}
              disabled={isAnimating}
              style={{
                padding: '8px 16px',
                backgroundColor: treeType === type ? '#2196f3' : '#fff',
                color: treeType === type ? 'white' : '#666',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                fontWeight: treeType === type ? 'bold' : 'normal',
                transition: 'all 0.3s'
              }}
            >
              {type === 'avl' ? 'AVL树' : type === 'treap' ? 'Treap树' : 'Splay树'}
            </button>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
          当前操作: <strong style={{ color: '#1976d2' }}>{currentOperation || '无'}</strong>
          {searchResult && (
            <>
              <span style={{ margin: '0 20px' }}>|</span>
              搜索结果: <strong style={{ color: searchResult.found ? '#4caf50' : '#f44336' }}>
                {searchResult.found ? '找到' : '未找到'}
              </strong>
            </>
          )}
        </div>

        {/* 树可视化区域 */}
        <div style={{ 
          width: '100%', 
          height: '400px', 
          border: '2px solid #e0e0e0', 
          borderRadius: '8px',
          backgroundColor: '#fafafa',
          overflow: 'auto'
        }}>
          <svg width="800" height="400" style={{ minWidth: '800px' }}>
            {renderTree()}
          </svg>
          {!root && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              color: '#999',
              fontSize: '18px'
            }}>
              树为空，请插入节点
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 20, width: '100%' }}>
          {/* 控制面板 */}
          <div style={{ 
            flex: 1,
            display: 'flex', 
            flexDirection: 'column',
            gap: 16, 
            padding: 20, 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>操作控制</h3>
            
            {/* 插入操作 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: '#f8f9fa' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>插入节点</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="number" 
                  placeholder="插入值" 
                  value={insertValue} 
                  onChange={(e) => setInsertValue(e.target.value)}
                  disabled={isAnimating}
                  style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                  onClick={handleInsert}
                  disabled={isAnimating || !insertValue}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isAnimating || !insertValue ? '#ccc' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating || !insertValue ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  插入
                </button>
              </div>
            </div>

            {/* 删除操作 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: '#f8f9fa' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>删除节点</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="number" 
                  placeholder="删除值" 
                  value={deleteValue} 
                  onChange={(e) => setDeleteValue(e.target.value)}
                  disabled={isAnimating}
                  style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                  onClick={handleDelete}
                  disabled={isAnimating || !deleteValue || !root}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isAnimating || !deleteValue || !root ? '#ccc' : '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating || !deleteValue || !root ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  删除
                </button>
              </div>
            </div>

            {/* 搜索操作 */}
            <div style={{ 
              padding: '16px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              backgroundColor: '#f8f9fa' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>搜索节点</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="number" 
                  placeholder="搜索值" 
                  value={searchValue} 
                  onChange={(e) => setSearchValue(e.target.value)}
                  disabled={isAnimating}
                  style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                  onClick={handleSearch}
                  disabled={isAnimating || !searchValue || !root}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isAnimating || !searchValue || !root ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isAnimating || !searchValue || !root ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  搜索
                </button>
              </div>
            </div>

            {/* 其他操作 */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={loadExample}
                disabled={isAnimating}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: isAnimating ? '#ccc' : '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isAnimating ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                加载示例
              </button>
              <button 
                onClick={clearTree}
                disabled={isAnimating}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: isAnimating ? '#ccc' : '#9e9e9e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isAnimating ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                清空树
              </button>
            </div>

            {/* 动画速度控制 */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                动画速度: {animationSpeed}ms
              </label>
              <input 
                type="range" 
                min="200" 
                max="2000" 
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                disabled={isAnimating}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* 操作日志 */}
          <div style={{ 
            flex: 1,
            padding: 20, 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1976d2' }}>操作日志</h3>
            <div style={{ 
              height: '300px', 
              overflowY: 'auto', 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {operationLog.length === 0 ? (
                <div style={{ color: '#999', textAlign: 'center', marginTop: '50px' }}>
                  暂无操作记录
                </div>
              ) : (
                operationLog.map((log, index) => (
                  <div key={index} style={{ marginBottom: '4px', color: '#666' }}>
                    {index + 1}. {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 算法说明 */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          width: '100%'
        }}>
          {treeType === 'avl' && (
            <>
              <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>AVL平衡树说明</h3>
              <div style={{ color: '#666' }}>
                <p><strong>AVL树</strong>是一种自平衡的二叉搜索树，由G.M. Adelson-Velsky和E.M. Landis在1962年发明。它保证了树的高度始终为O(log n)。</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  <div>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>平衡条件</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><strong>平衡因子:</strong> 左子树高度 - 右子树高度</li>
                      <li><strong>平衡范围:</strong> -1, 0, 1</li>
                      <li><strong>失衡检测:</strong> 平衡因子 &gt; 1 或 &lt; -1</li>
                      <li><strong>自动调整:</strong> 通过旋转操作恢复平衡</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>旋转操作</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><strong>LL旋转:</strong> 右单旋转</li>
                      <li><strong>RR旋转:</strong> 左单旋转</li>
                      <li><strong>LR旋转:</strong> 先左旋转，再右旋转</li>
                      <li><strong>RL旋转:</strong> 先右旋转，再左旋转</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>时间复杂度</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><strong>搜索:</strong> O(log n)</li>
                      <li><strong>插入:</strong> O(log n)</li>
                      <li><strong>删除:</strong> O(log n)</li>
                      <li><strong>空间复杂度:</strong> O(n)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>节点标记说明</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><span style={{color: '#2196f3'}}>🔵 蓝色:</span> 普通节点</li>
                      <li><span style={{color: '#ff9800'}}>🟠 橙色:</span> 当前访问的节点</li>
                      <li><strong>h:</strong> 节点高度</li>
                      <li><strong>b:</strong> 平衡因子</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {treeType === 'treap' && (
            <>
              <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>Treap树说明</h3>
              <div style={{ color: '#666' }}>
                <p><strong>Treap</strong>是Tree + Heap的组合，每个节点既满足二叉搜索树的性质，又满足堆的性质。通过随机优先级实现平衡。</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  <div>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>核心性质</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><strong>BST性质:</strong> 左子树值 &lt; 根值 &lt; 右子树值</li>
                      <li><strong>堆性质:</strong> 父节点优先级 &gt; 子节点优先级</li>
                      <li><strong>随机优先级:</strong> 自动生成随机优先级</li>
                      <li><strong>期望平衡:</strong> 期望高度O(log n)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>旋转策略</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><strong>插入后:</strong> 向上调整维护堆性质</li>
                      <li><strong>删除时:</strong> 将节点旋转到叶子后删除</li>
                      <li><strong>旋转条件:</strong> 违反堆性质时旋转</li>
                      <li><strong>简单实现:</strong> 只需要单旋转</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>时间复杂度</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><strong>搜索:</strong> 期望O(log n)</li>
                      <li><strong>插入:</strong> 期望O(log n)</li>
                      <li><strong>删除:</strong> 期望O(log n)</li>
                      <li><strong>空间复杂度:</strong> O(n)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>节点标记说明</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><span style={{color: '#4caf50'}}>🟢 绿色:</span> 普通节点</li>
                      <li><span style={{color: '#ff9800'}}>🟠 橙色:</span> 当前访问的节点</li>
                      <li><strong>p:</strong> 随机优先级</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {treeType === 'splay' && (
            <>
              <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>Splay树说明</h3>
              <div style={{ color: '#666' }}>
                <p><strong>Splay树</strong>是一种自适应的二叉搜索树，每次访问节点后都会将该节点旋转到根部，具有很好的局部性。</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  <div>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>Splay操作</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><strong>Zig:</strong> 目标节点是根的直接子节点</li>
                      <li><strong>Zig-Zig:</strong> 目标节点和父节点在同一侧</li>
                      <li><strong>Zig-Zag:</strong> 目标节点和父节点在不同侧</li>
                      <li><strong>自适应性:</strong> 频繁访问的节点靠近根部</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>核心特点</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><strong>自调整:</strong> 每次访问后自动调整结构</li>
                      <li><strong>局部性:</strong> 最近访问的元素更容易访问</li>
                      <li><strong>无额外存储:</strong> 不需要存储平衡信息</li>
                      <li><strong>简单实现:</strong> 实现相对简单</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>时间复杂度</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><strong>单次操作:</strong> 最坏O(n)</li>
                      <li><strong>摊还分析:</strong> O(log n)</li>
                      <li><strong>连续m次操作:</strong> O(m log n)</li>
                      <li><strong>空间复杂度:</strong> O(n)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>节点标记说明</h4>
                    <ul style={{ paddingLeft: '20px' }}>
                      <li><span style={{color: '#9c27b0'}}>🟣 紫色:</span> 普通节点</li>
                      <li><span style={{color: '#ff9800'}}>🟠 橙色:</span> 当前访问的节点</li>
                      <li><strong>访问:</strong> 节点被访问的次数</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
            <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>应用场景</h4>
            <p>平衡树广泛应用于需要高效查找和动态维护的场景：</p>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              <li>数据库索引结构</li>
              <li>文件系统组织</li>
              <li>编译器符号表</li>
              <li>缓存管理系统</li>
            </ul>
          </div>
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
            <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>使用提示</h4>
            <p>选择不同的平衡树类型来了解它们的特点和适用场景。观察不同操作对树结构的影响。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalancedTreeVisualization;






