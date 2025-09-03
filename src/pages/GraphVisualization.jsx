import { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import GraphInput from '../components/GraphInput';
import GraphD3 from '../components/GraphD3';
import '../styles/modal.css';

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
  const [directed, setDirected] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [animating, setAnimating] = useState(false);
  // 新增参数
  const [canvasWidth, setCanvasWidth] = useState(500);
  const [canvasHeight, setCanvasHeight] = useState(500);
  const [nodeRadius, setNodeRadius] = useState(20);
  const [arrowSize, setArrowSize] = useState(5);
  const [edgeWidth, setEdgeWidth] = useState(2);
  const [chargeStrength, setChargeStrength] = useState(-100);
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
  
  // 折叠面板状态
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // 拖动调整大小相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

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

  // 拖动调整大小的处理函数
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      width: canvasWidth,
      height: canvasHeight
    });
  };

  const handleResizeMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const newWidth = Math.max(200, Math.min(1200, dragStart.width + deltaX));
    const newHeight = Math.max(200, Math.min(1000, dragStart.height + deltaY));
    
    setCanvasWidth(newWidth);
    setCanvasHeight(newHeight);
  };

  const handleResizeMouseUp = () => {
    setIsDragging(false);
  };

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
      document.body.style.cursor = 'nw-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart]);

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
  
  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
  };
  // 随机生成图
  const randomGenerate = async () => {
    // 创建统一配置弹窗
    const config = await new Promise((resolve) => {
      const modalContainer = document.createElement('div');
      modalContainer.className = 'modal-overlay';

      const modal = document.createElement('div');
      modal.className = 'modal-container';

      const title = document.createElement('h3');
      title.textContent = '随机图生成配置';
      title.className = 'modal-title';

      // 节点数量配置
      const nodeCountContainer = document.createElement('div');
      nodeCountContainer.className = 'modal-section';
      
      const nodeCountLabel = document.createElement('label');
      nodeCountLabel.textContent = '节点数量 (3-20):';
      nodeCountLabel.className = 'modal-label';
      
      const nodeCountInput = document.createElement('input');
      nodeCountInput.type = 'number';
      nodeCountInput.min = '3';
      nodeCountInput.max = '20';
      nodeCountInput.value = '6';
      nodeCountInput.className = 'modal-input';

      // 图类型选择
      const graphTypeContainer = document.createElement('div');
      graphTypeContainer.className = 'modal-section';
      
      const graphTypeLabel = document.createElement('label');
      graphTypeLabel.textContent = '生成类型:';
      graphTypeLabel.className = 'modal-label';

      const graphTypeOptions = document.createElement('div');
      graphTypeOptions.className = 'modal-radio-group';

      const treeRadio = document.createElement('input');
      treeRadio.type = 'radio';
      treeRadio.name = 'graphType';
      treeRadio.value = 'tree';
      treeRadio.checked = true;
      treeRadio.id = 'tree';

      const treeLabel = document.createElement('label');
      treeLabel.htmlFor = 'tree';
      treeLabel.textContent = '生成树';
      treeLabel.className = 'modal-radio-label';

      const graphRadio = document.createElement('input');
      graphRadio.type = 'radio';
      graphRadio.name = 'graphType';
      graphRadio.value = 'graph';
      graphRadio.id = 'graph';

      const graphLabel = document.createElement('label');
      graphLabel.htmlFor = 'graph';
      graphLabel.textContent = '生成图';
      graphLabel.className = 'modal-radio-label';

      treeLabel.insertBefore(treeRadio, treeLabel.firstChild);
      graphLabel.insertBefore(graphRadio, graphLabel.firstChild);
      
      graphTypeOptions.appendChild(treeLabel);
      graphTypeOptions.appendChild(graphLabel);

      // 树类型选择（默认显示）
      const treeTypeContainer = document.createElement('div');
      treeTypeContainer.className = 'modal-section';
      treeTypeContainer.id = 'treeTypeContainer';
      
      const treeTypeLabel = document.createElement('label');
      treeTypeLabel.textContent = '树类型:';
      treeTypeLabel.className = 'modal-label';

      const treeTypeSelect = document.createElement('select');
      treeTypeSelect.className = 'modal-input';
      treeTypeSelect.innerHTML = `
        <option value="random">任意随机树</option>
        <option value="binary">二叉树</option>
        <option value="complete">完全二叉树</option>
      `;

      // 边数配置（默认隐藏）
      const edgeCountContainer = document.createElement('div');
      edgeCountContainer.className = 'modal-section';
      edgeCountContainer.id = 'edgeCountContainer';
      edgeCountContainer.style.display = 'none';
      
      const edgeCountLabel = document.createElement('label');
      edgeCountLabel.textContent = '边数:';
      edgeCountLabel.className = 'modal-label';
      
      const edgeCountInput = document.createElement('input');
      edgeCountInput.type = 'number';
      edgeCountInput.min = '0';
      edgeCountInput.value = '8';
      edgeCountInput.className = 'modal-input';

      const edgeCountHint = document.createElement('div');
      edgeCountHint.textContent = '将根据节点数动态计算最大边数和连通最小边数';
      edgeCountHint.className = 'modal-hint';

      // 动态更新最大边数提示
      const updateEdgeHint = () => {
        const nodeCount = parseInt(nodeCountInput.value) || 6;
        const maxEdges = directed ? nodeCount * (nodeCount - 1) : nodeCount * (nodeCount - 1) / 2;
        const minEdgesForConnected = nodeCount - 1;
        edgeCountHint.textContent = `最大边数: ${maxEdges}，连通最少需要: ${minEdgesForConnected}`;
        edgeCountInput.max = maxEdges.toString();
      };

      nodeCountInput.addEventListener('input', updateEdgeHint);
      updateEdgeHint(); // 初始化

      // 实时验证边数（当连通性选项改变时）
      const validateEdgeCount = () => {
        const nodeCount = parseInt(nodeCountInput.value) || 6;
        const edgeCount = parseInt(edgeCountInput.value) || 0;
        const requireConnected = document.querySelector('input[name="connectivity"]:checked')?.value === 'true';
        const minEdgesForConnected = nodeCount - 1;
        
        if (requireConnected && edgeCount < minEdgesForConnected && edgeCount > 0) {
          edgeCountInput.style.borderColor = '#ff5722';
          edgeCountHint.style.color = '#ff5722';
          edgeCountHint.textContent = `警告：连通图至少需要 ${minEdgesForConnected} 条边，当前 ${edgeCount} 条边无法保证连通`;
        } else {
          edgeCountInput.style.borderColor = '#ddd';
          edgeCountHint.style.color = '#666';
          updateEdgeHint();
        }
      };

      edgeCountInput.addEventListener('input', validateEdgeCount);

      // 点标签配置
      const nodeLabelContainer = document.createElement('div');
      nodeLabelContainer.className = 'modal-section';
      
      const nodeLabelCheckbox = document.createElement('input');
      nodeLabelCheckbox.type = 'checkbox';
      nodeLabelCheckbox.id = 'nodeLabels';
      
      const nodeLabelLabel = document.createElement('label');
      nodeLabelLabel.htmlFor = 'nodeLabels';
      nodeLabelLabel.textContent = '生成点标签';
      nodeLabelLabel.className = 'modal-checkbox-label';
      nodeLabelLabel.insertBefore(nodeLabelCheckbox, nodeLabelLabel.firstChild);

      const nodeLabelRangeContainer = document.createElement('div');
      nodeLabelRangeContainer.className = 'modal-subsection';
      nodeLabelRangeContainer.style.display = 'none';
      nodeLabelRangeContainer.style.marginLeft = '20px';
      nodeLabelRangeContainer.style.marginTop = '8px';

      const nodeLabelMinLabel = document.createElement('label');
      nodeLabelMinLabel.textContent = '最小值:';
      nodeLabelMinLabel.className = 'modal-label modal-label-inline';
      
      const nodeLabelMinInput = document.createElement('input');
      nodeLabelMinInput.type = 'number';
      nodeLabelMinInput.value = '1';
      nodeLabelMinInput.className = 'modal-input modal-input-inline';
      
      const nodeLabelMaxLabel = document.createElement('label');
      nodeLabelMaxLabel.textContent = '最大值:';
      nodeLabelMaxLabel.className = 'modal-label modal-label-inline';
      nodeLabelMaxLabel.style.marginLeft = '10px';
      
      const nodeLabelMaxInput = document.createElement('input');
      nodeLabelMaxInput.type = 'number';
      nodeLabelMaxInput.value = '100';
      nodeLabelMaxInput.className = 'modal-input modal-input-inline';

      nodeLabelRangeContainer.appendChild(nodeLabelMinLabel);
      nodeLabelRangeContainer.appendChild(nodeLabelMinInput);
      nodeLabelRangeContainer.appendChild(nodeLabelMaxLabel);
      nodeLabelRangeContainer.appendChild(nodeLabelMaxInput);

      // 边标签配置
      const edgeLabelContainer = document.createElement('div');
      edgeLabelContainer.className = 'modal-section';
      
      const edgeLabelCheckbox = document.createElement('input');
      edgeLabelCheckbox.type = 'checkbox';
      edgeLabelCheckbox.id = 'edgeLabels';
      
      const edgeLabelLabel = document.createElement('label');
      edgeLabelLabel.htmlFor = 'edgeLabels';
      edgeLabelLabel.textContent = '生成边标签';
      edgeLabelLabel.className = 'modal-checkbox-label';
      edgeLabelLabel.insertBefore(edgeLabelCheckbox, edgeLabelLabel.firstChild);

      const edgeLabelRangeContainer = document.createElement('div');
      edgeLabelRangeContainer.className = 'modal-subsection';
      edgeLabelRangeContainer.style.display = 'none';
      edgeLabelRangeContainer.style.marginLeft = '20px';
      edgeLabelRangeContainer.style.marginTop = '8px';

      const edgeLabelMinLabel = document.createElement('label');
      edgeLabelMinLabel.textContent = '最小值:';
      edgeLabelMinLabel.className = 'modal-label modal-label-inline';
      
      const edgeLabelMinInput = document.createElement('input');
      edgeLabelMinInput.type = 'number';
      edgeLabelMinInput.value = '1';
      edgeLabelMinInput.className = 'modal-input modal-input-inline';
      
      const edgeLabelMaxLabel = document.createElement('label');
      edgeLabelMaxLabel.textContent = '最大值:';
      edgeLabelMaxLabel.className = 'modal-label modal-label-inline';
      edgeLabelMaxLabel.style.marginLeft = '10px';
      
      const edgeLabelMaxInput = document.createElement('input');
      edgeLabelMaxInput.type = 'number';
      edgeLabelMaxInput.value = '100';
      edgeLabelMaxInput.className = 'modal-input modal-input-inline';

      edgeLabelRangeContainer.appendChild(edgeLabelMinLabel);
      edgeLabelRangeContainer.appendChild(edgeLabelMinInput);
      edgeLabelRangeContainer.appendChild(edgeLabelMaxLabel);
      edgeLabelRangeContainer.appendChild(edgeLabelMaxInput);

      // 标签范围显示/隐藏控制
      nodeLabelCheckbox.addEventListener('change', () => {
        nodeLabelRangeContainer.style.display = nodeLabelCheckbox.checked ? 'block' : 'none';
      });

      edgeLabelCheckbox.addEventListener('change', () => {
        edgeLabelRangeContainer.style.display = edgeLabelCheckbox.checked ? 'block' : 'none';
      });

      // 连通性配置（仅图模式显示）
      const connectivityContainer = document.createElement('div');
      connectivityContainer.className = 'modal-section';
      connectivityContainer.id = 'connectivityContainer';
      connectivityContainer.style.display = 'none';
      
      const connectivityLabel = document.createElement('label');
      connectivityLabel.textContent = '连通性要求:';
      connectivityLabel.className = 'modal-label';

      const connectivityOptions = document.createElement('div');
      connectivityOptions.className = 'modal-radio-group';

      const connectedRadio = document.createElement('input');
      connectedRadio.type = 'radio';
      connectedRadio.name = 'connectivity';
      connectedRadio.value = 'true';
      connectedRadio.checked = true;
      connectedRadio.id = 'connected';

      const connectedLabel = document.createElement('label');
      connectedLabel.htmlFor = 'connected';
      connectedLabel.textContent = '要求连通';
      connectedLabel.className = 'modal-radio-label';

      const disconnectedRadio = document.createElement('input');
      disconnectedRadio.type = 'radio';
      disconnectedRadio.name = 'connectivity';
      disconnectedRadio.value = 'false';
      disconnectedRadio.id = 'disconnected';

      const disconnectedLabel = document.createElement('label');
      disconnectedLabel.htmlFor = 'disconnected';
      disconnectedLabel.textContent = '允许非连通';
      disconnectedLabel.className = 'modal-radio-label';

      connectedRadio.addEventListener('change', validateEdgeCount);
      disconnectedRadio.addEventListener('change', validateEdgeCount);

      connectedLabel.insertBefore(connectedRadio, connectedLabel.firstChild);
      disconnectedLabel.insertBefore(disconnectedRadio, disconnectedLabel.firstChild);
      
      connectivityOptions.appendChild(connectedLabel);
      connectivityOptions.appendChild(disconnectedLabel);

      // 图类型切换事件
      const toggleGraphType = () => {
        const selectedType = document.querySelector('input[name="graphType"]:checked').value;
        if (selectedType === 'tree') {
          treeTypeContainer.style.display = 'block';
          edgeCountContainer.style.display = 'none';
          connectivityContainer.style.display = 'none';
        } else {
          treeTypeContainer.style.display = 'none';
          edgeCountContainer.style.display = 'block';
          connectivityContainer.style.display = 'block';
          updateEdgeHint(); // 更新边数提示
        }
      };

      treeRadio.addEventListener('change', toggleGraphType);
      graphRadio.addEventListener('change', toggleGraphType);

      // 按钮区域
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'modal-buttons';

      const cancelButton = document.createElement('button');
      cancelButton.textContent = '取消';
      cancelButton.className = 'modal-button modal-button-cancel';
      cancelButton.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        resolve(null);
      });

      const confirmButton = document.createElement('button');
      confirmButton.textContent = '生成';
      confirmButton.className = 'modal-button modal-button-confirm';
      confirmButton.addEventListener('click', () => {
        const nodeCount = parseInt(nodeCountInput.value);
        const graphType = document.querySelector('input[name="graphType"]:checked').value;
        
        // 验证输入
        if (isNaN(nodeCount) || nodeCount < 3 || nodeCount > 20) {
          alert('节点数量必须在 3-20 之间');
          return;
        }

        let config = { nodeCount, graphType };

        // 收集标签配置
        if (nodeLabelCheckbox.checked) {
          const minVal = parseInt(nodeLabelMinInput.value);
          const maxVal = parseInt(nodeLabelMaxInput.value);
          if (isNaN(minVal) || isNaN(maxVal) || minVal > maxVal) {
            alert('点标签范围输入有误，请检查最小值和最大值');
            return;
          }
          config.nodeLabels = { min: minVal, max: maxVal };
        }

        if (edgeLabelCheckbox.checked) {
          const minVal = parseInt(edgeLabelMinInput.value);
          const maxVal = parseInt(edgeLabelMaxInput.value);
          if (isNaN(minVal) || isNaN(maxVal) || minVal > maxVal) {
            alert('边标签范围输入有误，请检查最小值和最大值');
            return;
          }
          config.edgeLabels = { min: minVal, max: maxVal };
        }

        if (graphType === 'tree') {
          config.treeType = treeTypeSelect.value;
        } else {
          const edgeCount = parseInt(edgeCountInput.value);
          const maxEdges = directed ? nodeCount * (nodeCount - 1) : nodeCount * (nodeCount - 1) / 2;
          const requireConnected = document.querySelector('input[name="connectivity"]:checked').value === 'true';
          const minEdgesForConnected = nodeCount - 1;
          
          if (isNaN(edgeCount) || edgeCount < 0 || edgeCount > maxEdges) {
            alert(`边数必须在 0-${maxEdges} 之间`);
            return;
          }
          
          if (requireConnected && edgeCount < minEdgesForConnected) {
            alert(`要求连通的图至少需要 ${minEdgesForConnected} 条边（节点数-1），请重新输入边数`);
            edgeCountInput.focus();
            edgeCountInput.select();
            return;
          }
          
          config.edgeCount = edgeCount;
          config.requireConnected = requireConnected;
        }

        document.body.removeChild(modalContainer);
        resolve(config);
      });

      // 组装弹窗
      nodeCountContainer.appendChild(nodeCountLabel);
      nodeCountContainer.appendChild(nodeCountInput);
      
      graphTypeContainer.appendChild(graphTypeLabel);
      graphTypeContainer.appendChild(graphTypeOptions);
      
      treeTypeContainer.appendChild(treeTypeLabel);
      treeTypeContainer.appendChild(treeTypeSelect);
      
      edgeCountContainer.appendChild(edgeCountLabel);
      edgeCountContainer.appendChild(edgeCountInput);
      edgeCountContainer.appendChild(edgeCountHint);
      
      nodeCountContainer.appendChild(nodeCountLabel);
      nodeCountContainer.appendChild(nodeCountInput);
      
      graphTypeContainer.appendChild(graphTypeLabel);
      graphTypeContainer.appendChild(graphTypeOptions);
      
      treeTypeContainer.appendChild(treeTypeLabel);
      treeTypeContainer.appendChild(treeTypeSelect);
      
      edgeCountContainer.appendChild(edgeCountLabel);
      edgeCountContainer.appendChild(edgeCountInput);
      edgeCountContainer.appendChild(edgeCountHint);
      
      nodeLabelContainer.appendChild(nodeLabelLabel);
      nodeLabelContainer.appendChild(nodeLabelRangeContainer);
      
      edgeLabelContainer.appendChild(edgeLabelLabel);
      edgeLabelContainer.appendChild(edgeLabelRangeContainer);
      
      connectivityContainer.appendChild(connectivityLabel);
      connectivityContainer.appendChild(connectivityOptions);
      
      buttonContainer.appendChild(cancelButton);
      buttonContainer.appendChild(confirmButton);

      modal.appendChild(title);
      modal.appendChild(nodeCountContainer);
      modal.appendChild(graphTypeContainer);
      modal.appendChild(treeTypeContainer);
      modal.appendChild(edgeCountContainer);
      modal.appendChild(nodeLabelContainer);
      modal.appendChild(edgeLabelContainer);
      modal.appendChild(connectivityContainer);
      modal.appendChild(buttonContainer);
      modalContainer.appendChild(modal);
      document.body.appendChild(modalContainer);

      // 回车确认
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          confirmButton.click();
        }
      });
    });

    // 如果用户取消了操作
    if (config === null) return;

    clearGraph();

    const { nodeCount, graphType } = config;

    // 生成随机节点
    const newNodes = [];
    for (let i = 0; i < nodeCount; i++) {
      let label = '';
      if (config.nodeLabels) {
        const min = config.nodeLabels.min;
        const max = config.nodeLabels.max;
        label = String(Math.floor(Math.random() * (max - min + 1)) + min);
      }
      
      newNodes.push({
        id: String(i),
        fixed: false,
        label: label,
        color: '#69b3a2'
      });
    }

    let newEdges = [];

    if (graphType === 'tree') {
      // 生成树
      const { treeType } = config;
      newEdges = generateTree(nodeCount, treeType, config.edgeLabels);
    } else {
      // 生成图
      const { edgeCount, requireConnected } = config;
      newEdges = generateGraph(nodeCount, edgeCount, requireConnected, config.edgeLabels);
    }

    // 更新状态
    setNodes(newNodes);
    setEdges(newEdges);
  };

  // 生成树的函数
  const generateTree = (nodeCount, treeType, edgeLabelConfig = null) => {
    const edges = [];
    
    if (nodeCount <= 1) return edges;

    // 辅助函数：生成边标签
    const generateEdgeLabel = () => {
      if (edgeLabelConfig) {
        const min = edgeLabelConfig.min;
        const max = edgeLabelConfig.max;
        return String(Math.floor(Math.random() * (max - min + 1)) + min);
      }
      return '';
    };

    switch (treeType) {
      case 'complete':
        // 完全二叉树
        for (let i = 0; i < Math.floor(nodeCount / 2); i++) {
          const leftChild = 2 * i + 1;
          const rightChild = 2 * i + 2;
          
          if (leftChild < nodeCount) {
            edges.push({
              from: String(i),
              to: String(leftChild),
              label: generateEdgeLabel(),
              color: '#000000'
            });
          }
          
          if (rightChild < nodeCount) {
            edges.push({
              from: String(i),
              to: String(rightChild),
              label: generateEdgeLabel(),
              color: '#000000'
            });
          }
        }
        break;
        
      case 'binary':
        // 随机二叉树
        const used = new Set([0]);
        const available = [];
        for (let i = 1; i < nodeCount; i++) {
          available.push(i);
        }
        
        // 随机打乱可用节点
        for (let i = available.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [available[i], available[j]] = [available[j], available[i]];
        }
        
        const nodeChildren = {}; // 记录每个节点的子节点数
        for (let i = 0; i < nodeCount; i++) {
          nodeChildren[i] = 0;
        }
        
        for (const child of available) {
          // 找到可以添加子节点的父节点（子节点数 < 2）
          const eligibleParents = Array.from(used).filter(parent => nodeChildren[parent] < 2);
          if (eligibleParents.length > 0) {
            const parent = eligibleParents[Math.floor(Math.random() * eligibleParents.length)];
            edges.push({
              from: String(parent),
              to: String(child),
              label: generateEdgeLabel(),
              color: '#000000'
            });
            nodeChildren[parent]++;
            used.add(child);
          }
        }
        break;
        
      case 'random':
      default:
        // 任意随机树
        const visited = new Set([0]);
        const unvisited = new Set();
        for (let i = 1; i < nodeCount; i++) {
          unvisited.add(i);
        }
        
        while (unvisited.size > 0) {
          const fromNode = Array.from(visited)[Math.floor(Math.random() * visited.size)];
          const toNode = Array.from(unvisited)[Math.floor(Math.random() * unvisited.size)];
          
          edges.push({
            from: String(fromNode),
            to: String(toNode),
            label: generateEdgeLabel(),
            color: '#000000'
          });
          
          visited.add(toNode);
          unvisited.delete(toNode);
        }
        break;
    }
    
    return edges;
  };

  // 生成图的函数
  const generateGraph = (nodeCount, edgeCount, requireConnected, edgeLabelConfig = null) => {
    const newEdges = [];
    
    // 辅助函数：生成边标签
    const generateEdgeLabel = () => {
      if (edgeLabelConfig) {
        const min = edgeLabelConfig.min;
        const max = edgeLabelConfig.max;
        return String(Math.floor(Math.random() * (max - min + 1)) + min);
      }
      return '';
    };
    
    if (requireConnected && nodeCount > 1) {
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
          label: generateEdgeLabel(),
          color: '#000000'
        });
        
        visited.add(toNode);
        unvisited.delete(toNode);
      }

      // 如果需要的边数少于连通所需的边数，只返回部分连通边
      if (edgeCount < connectedEdges.length) {
        return connectedEdges.slice(0, edgeCount);
      }

      // 添加额外的随机边
      const edgeSet = new Set(connectedEdges.map(e => `${e.from}-${e.to}`));
      while (newEdges.length + connectedEdges.length < edgeCount) {
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
          label: generateEdgeLabel(),
          color: '#000000'
        });
      }

      return [...connectedEdges, ...newEdges];
    } else {
      // 生成可能非连通的随机图
      const edgeSet = new Set();
      
      while (newEdges.length < edgeCount) {
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
          label: generateEdgeLabel(),
          color: '#000000'
        });
      }

      return newEdges;
    }
  };

  // 层次布局函数
  const arrangeNodesByLevels = async () => {
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

      const LeafNodes = nodes.filter(node => Degree[node.id] === 1);
      if (LeafNodes.length > 0) {
        defaultRoot = LeafNodes[0].id;
      }
    }
    
    // 弹出选择框让用户选择根节点
    const selectedRoots = await new Promise((resolve) => {
      // 创建一个模态对话框
      const modalContainer = document.createElement('div');
      modalContainer.className = 'modal-overlay';

      const modal = document.createElement('div');
      modal.className = 'modal-container';

      const title = document.createElement('h3');
      title.textContent = '选择第一层节点（可多选）';
      title.className = 'modal-title';

      const instruction = document.createElement('p');
      instruction.textContent = '点击节点可选择/取消选择，可以选择多个节点作为第一层';
      instruction.className = 'modal-hint';

      const defaultInfo = document.createElement('p');
      defaultInfo.textContent = `推荐默认根节点: ${defaultRoot}`;
      defaultInfo.className = 'modal-hint';

      const nodeContainer = document.createElement('div');
      nodeContainer.className = 'node-selection-grid';

      //const selectedNodeIds = new Set([defaultRoot]); // 使用Set存储多个选中的节点
      const selectedNodeIds = new Set(); // 使用Set存储多个选中的节点

      // 为每个节点创建按钮
      nodes.forEach(node => {
        const nodeButton = document.createElement('button');
        nodeButton.textContent = node.id;
        //nodeButton.className = `node-button ${node.id === defaultRoot ? 'selected' : ''}`;
        nodeButton.className = `node-button ${''}`;

        nodeButton.addEventListener('click', () => {
          // 切换选中状态
          if (selectedNodeIds.has(node.id)) {
            selectedNodeIds.delete(node.id);
            nodeButton.classList.remove('selected');
          } else {
            selectedNodeIds.add(node.id);
            nodeButton.classList.add('selected');
          }
        });

        nodeContainer.appendChild(nodeButton);
      });

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'modal-buttons';

      const cancelButton = document.createElement('button');
      cancelButton.textContent = '取消';
      cancelButton.className = 'modal-button modal-button-cancel';
      cancelButton.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
        resolve(null);
      });

      const confirmButton = document.createElement('button');
      confirmButton.textContent = '确认';
      confirmButton.className = 'modal-button modal-button-success';
      confirmButton.addEventListener('click', () => {
        if (selectedNodeIds.size === 0) {
          alert('请至少选择一个节点作为第一层');
          return;
        }
        document.body.removeChild(modalContainer);
        resolve(Array.from(selectedNodeIds));
      });

      buttonContainer.appendChild(cancelButton);
      buttonContainer.appendChild(confirmButton);

      modal.appendChild(title);
      modal.appendChild(instruction);
      modal.appendChild(defaultInfo);
      modal.appendChild(nodeContainer);
      modal.appendChild(buttonContainer);
      modalContainer.appendChild(modal);
      document.body.appendChild(modalContainer);
    });

    // 如果用户取消了操作
    if (selectedRoots === null) {
      return;
    }

    const rootIds = selectedRoots;
    
    // BFS构建层级结构，支持多个根节点
    const levels = [];
    const visited = new Set();
    
    // 第一层：所有选中的根节点
    levels[0] = [...rootIds];
    rootIds.forEach(rootId => visited.add(rootId));
    
    // 从第一层开始BFS
    let currentLevel = 0;
    while (currentLevel < levels.length) {
      const nextLevelNodes = [];
      
      levels[currentLevel].forEach(nodeId => {
        // 添加子节点到下一层
        if (adjList[nodeId]) {
          adjList[nodeId].forEach(childId => {
            if (!visited.has(childId)) {
              visited.add(childId);
              nextLevelNodes.push(childId);
            }
          });
        }
      });
      
      if (nextLevelNodes.length > 0) {
        levels[currentLevel + 1] = nextLevelNodes;
      }
      currentLevel++;
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
    <div style={{ height: '100vh', minHeight: '100vh', position: 'relative', width: '100vw', maxWidth: '100vw', overflowX: 'hidden', margin: 0, padding: 0, marginLeft: 0 }}>
      {/* 主图区域 */}
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '20px'
      }}>
        <div style={{ position: 'relative' }}>
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
          
          {/* 右下角拖动调整大小控制 */}
          <div 
            style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              width: '20px',
              height: '20px',
              cursor: 'nw-resize',
              backgroundColor: isDragging ? 'rgba(0, 123, 255, 0.3)' : 'rgba(200, 200, 200, 0.5)',
              border: '2px solid',
              borderColor: isDragging ? '#007bff' : '#999',
              borderRadius: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: isDragging ? 'none' : 'all 0.2s',
              zIndex: 5 // 降低按钮的显示优先级
            }}
            onMouseDown={handleResizeMouseDown}
            title="拖动调整画布大小"
          >
            {/* 调整大小图标 - 使用带箭头的图标 */}
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path 
                d="M 4 0 L 4 4 L 0 4 L 0 6 L 4 6 L 4 12 L 6 12 L 6 6 L 12 6 L 12 4 L 6 4 L 6 0 Z" 
                fill={isDragging ? '#007bff' : '#666'}
                transform="rotate(-45 6 6)"
              />
            </svg>
          </div>
        </div>
        {/* BFS队列可视化 */}
        {bfsAnimating && (
          <div style={{ 
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '10px 0',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
          }}>
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
      
      {/* 左侧面板：点/边列表 */}
      <div style={{ 
        position: 'absolute',
        top: '20px',
        width: leftPanelCollapsed ? '40px' : '340px',
        maxHeight: 'calc(100vh - 40px)',
        background: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        zIndex: 10,
        transition: 'width 0.3s ease-in-out'
      }}>
        {/* 折叠/展开按钮 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: leftPanelCollapsed ? 'center' : 'space-between',
          padding: '12px 16px',
          background: '#e3f2fd',
          borderBottom: '1px solid #ddd',
          cursor: 'pointer'
        }}
        onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}>
          {!leftPanelCollapsed && <span style={{ fontWeight: '600', color: '#1976d2' }}>点/边列表</span>}
          <span style={{ 
            color: '#1976d2', 
            fontSize: '18px',
            transform: leftPanelCollapsed ? 'rotate(0deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            {leftPanelCollapsed ? '▶' : '◀'}
          </span>
        </div>
        {/* 面板内容 */}
        {!leftPanelCollapsed && (
          <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
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
              clearGraph={clearGraph}
              // 新增颜色选项
              nodeColorOptions={["#69b3a2", "#1976d2", "#ff9800", "#e91e63", "#FFB6C1", "#ffff00"]}
              edgeColorOptions={["#000000", "#1976d2", "#ff9800", "#e91e63", "#69b3a2", "#ffff00"]}
            />
          </div>
        )}
      </div>
      
      {/* 右侧面板：配置&动画 */}
      <div style={{ 
        position: 'absolute',
        top: '20px',
        right: '120px',
        width: rightPanelCollapsed ? '40px' : '260px',
        maxHeight: 'calc(100vh - 40px)',
        background: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        zIndex: 10,
        transition: 'width 0.3s ease-in-out'
      }}>
        {/* 折叠/展开按钮 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: rightPanelCollapsed ? 'center' : 'space-between',
          padding: '12px 16px',
          background: '#e8f5e8',
          borderBottom: '1px solid #ddd',
          cursor: 'pointer'
        }}
        onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}>
          <span style={{ 
            color: '#4caf50', 
            fontSize: '18px',
            transform: rightPanelCollapsed ? 'rotate(0deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            {rightPanelCollapsed ? '◀' : '▶'}
          </span>
          {!rightPanelCollapsed && <span style={{ fontWeight: '600', color: '#4caf50' }}>配置&动画</span>}
        </div>
        {/* 面板内容 */}
        {!rightPanelCollapsed && (
          <div style={{ 
            padding: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'left', 
            justifyContent: 'flex-start', 
            gap: 10,
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 100px)'
          }}>
            {/* 选项卡切换 */}
            <div style={{ display: 'flex', width: '100%', marginBottom: 0 }}>
              <button onClick={() => setRightTab('config')} style={{ flex: 1, padding: 8, fontWeight: rightTab === 'config' ? 700 : 400, background: rightTab === 'config' ? '#e3f2fd' : '#f5f5f5', border: '1px solid #90caf9', borderBottom: rightTab === 'config' ? '2px solid #1976d2' : '1px solid #90caf9', color: '#1976d2', cursor: 'pointer' }}>基本配置</button>
              <button onClick={() => setRightTab('anim')} style={{ flex: 1, padding: 8, fontWeight: rightTab === 'anim' ? 700 : 400, background: rightTab === 'anim' ? '#e3f2fd' : '#f5f5f5', border: '1px solid #90caf9', borderBottom: rightTab === 'anim' ? '2px solid #1976d2' : '1px solid #90caf9', color: '#1976d2', cursor: 'pointer' }}>播放动画</button>
            </div>
            
            {/* 基本配置 */}
            {rightTab === 'config' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                <label style={{ marginBottom: 8 }}>点半径: <input type="number" min={8} max={100} value={nodeRadius} onChange={e => setNodeRadius(Number(e.target.value))} style={{ width: 40 }} /></label>
                <label style={{ marginBottom: 8 }}>箭头大小: <input type="number" min={2} max={30} value={arrowSize} onChange={e => setArrowSize(Number(e.target.value))} style={{ width: 40 }} /></label>
                <label style={{ marginBottom: 8 }}>边的粗细: <input type="number" min={1} max={20} value={edgeWidth} onChange={e => setEdgeWidth(Number(e.target.value))} style={{ width: 40 }} /></label>
                <label style={{ marginBottom: 8 }}>
                  斥力强度: 
                  <select 
                    value={chargeStrength} 
                    onChange={e => setChargeStrength(Number(e.target.value))}
                    style={{ width: 80, marginLeft: 8 }}
                  >
                    <option value={300}>小</option>
                    <option value={-100}>中</option>
                    <option value={-300}>大</option>
                    <option value={-1000}>特大</option>
                    <option value={-3000}>特大+</option>
                  </select>
                </label>
                <div style={{ marginTop: 0, textAlign: 'left', width: '100%' }}>
                  <label>
                    <input
                      type="radio"
                      name="graphType"
                      checked={!directed}
                      onChange={() => setDirected(false)}
                    />
                    无向图
                  </label>
                  <label style={{ marginLeft: 16 }}>
                    <input
                      type="radio"
                      name="graphType"
                      checked={directed}
                      onChange={() => setDirected(true)}
                    />
                    有向图
                  </label>
                </div>
                <button 
                  onClick={arrangeNodesByLevels} 
                  className="action-button action-button-warning"
                  style={{ marginTop: 8 }}
                >
                  自动排列节点
                </button>
              </div>
            )}
            
            {/* 动画播放 */}
            {rightTab === 'anim' && (
              <>
                {/* DFS可视化 */}
                {dfsAnimating && (
                  <div style={{ 
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    zIndex: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '10px 0',
                    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 8 }}>DFS栈</div>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 12, minHeight: 48 }}>
                      {dfsStack.length === 0 ? (
                        <span style={{ color: '#aaa' }}>空</span>
                      ) : (
                        dfsStack.map((val, i) => (
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
                              fontSize: 18,
                              fontWeight: 600
                            }}
                          >
                            {val || '空'}
                          </div>
                        ))
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
        )}
      </div>
    </div>
  );
}

export default GraphVisualization;
