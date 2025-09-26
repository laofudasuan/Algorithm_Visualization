// animateGraph.js - 图可视化系统的核心逻辑模块，负责图的布局、动画和算法可视化

// 图数据管理
export class GraphDataManager {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.nodeMap = new Map(); // 用于快速查找节点
  }
  
  // 添加节点
  addNode(node) {
    this.nodes.push(node);
    this.nodeMap.set(node.id, node);
  }
  
  // 添加边
  addEdge(sourceId, targetId) {
    const sourceNode = this.nodeMap.get(sourceId);
    const targetNode = this.nodeMap.get(targetId);
    
    if (sourceNode && targetNode) {
      const edge = { source: sourceId, target: targetId };
      this.edges.push(edge);
      return edge;
    }
    return null;
  }
  
  // 更新节点位置
  updateNodePosition(nodeId, x, y) {
    const node = this.nodeMap.get(nodeId);
    if (node) {
      node.x = x;
      node.y = y;
    }
  }
  
  // 更新节点速度
  updateNodeVelocity(nodeId, vx, vy) {
    const node = this.nodeMap.get(nodeId);
    if (node) {
      node.vx = vx;
      node.vy = vy;
    }
  }
  
  // 获取节点
  getNode(nodeId) {
    return this.nodeMap.get(nodeId);
  }
  
  // 获取所有节点
  getAllNodes() {
    return this.nodes;
  }
  
  // 获取所有边
  getAllEdges() {
    return this.edges;
  }
  
  // 重置图数据
  reset() {
    this.nodes = [];
    this.edges = [];
    this.nodeMap.clear();
  }
}

// 物理引擎 - 力导向布局
export class ForceDirectedLayout {
  constructor(graphDataManager, width, height) {
    this.graphDataManager = graphDataManager;
    this.width = width;
    this.height = height;
    
    // 物理参数
    this.charge = -1000; // 节点间斥力
    this.linkDistance = 100; // 边的理想长度
    this.gravity = 0.05; // 重力参数
    this.friction = 0.8; // 摩擦力（阻尼）
  }
  
  // 更新物理状态
  update() {
    const nodes = this.graphDataManager.getAllNodes();
    const edges = this.graphDataManager.getAllEdges();
    
    // 初始化力向量
    nodes.forEach(node => {
      node.fx = 0;
      node.fy = 0;
    });
    
    // 计算节点间斥力
    this._applyRepulsion(nodes);
    
    // 计算边的引力
    this._applyAttraction(edges, nodes);
    
    // 应用重力
    this._applyGravity(nodes);
    
    // 更新节点位置和速度
    this._updatePositions(nodes);
  }
  
  // 应用斥力
  _applyRepulsion(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        let dx = node2.x - node1.x;
        let dy = node2.y - node1.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // 避免除零错误
        if (distance < 1) distance = 1;
        
        // 库仑力：F = k * q1 * q2 / r^2
        const force = this.charge / (distance * distance);
        
        // 单位向量
        const ux = dx / distance;
        const uy = dy / distance;
        
        // 应用斥力
        node1.fx -= force * ux;
        node1.fy -= force * uy;
        node2.fx += force * ux;
        node2.fy += force * uy;
      }
    }
  }
  
  // 应用引力
  _applyAttraction(edges, nodes) {
    const nodeMap = new Map();
    nodes.forEach(node => nodeMap.set(node.id, node));
    
    edges.forEach(edge => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      
      if (source && target) {
        let dx = target.x - source.x;
        let dy = target.y - source.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // 胡克定律：F = k * |x|
        const force = (distance - this.linkDistance) * 0.1;
        
        // 单位向量
        const ux = dx / distance;
        const uy = dy / distance;
        
        // 应用引力
        source.fx += force * ux;
        source.fy += force * uy;
        target.fx -= force * ux;
        target.fy -= force * uy;
      }
    });
  }
  
  // 应用重力
  _applyGravity(nodes) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    nodes.forEach(node => {
      node.fx += (centerX - node.x) * this.gravity;
      node.fy += (centerY - node.y) * this.gravity;
    });
  }
  
  // 更新位置和速度
  _updatePositions(nodes) {
    nodes.forEach(node => {
      // 更新速度
      node.vx = (node.vx || 0) + node.fx;
      node.vy = (node.vy || 0) + node.fy;
      
      // 应用摩擦力
      node.vx *= this.friction;
      node.vy *= this.friction;
      
      // 更新位置
      node.x += node.vx;
      node.y += node.vy;
      
      // 确保节点保持在画布边界内
      this._constrainNode(node);
    });
  }
  
  // 约束节点在边界内
  _constrainNode(node) {
    const margin = 20;
    
    if (node.x < margin) node.x = margin;
    if (node.x > this.width - margin) node.x = this.width - margin;
    if (node.y < margin) node.y = margin;
    if (node.y > this.height - margin) node.y = this.height - margin;
  }
  
  // 设置物理参数
  setParameters(params) {
    if (params.charge !== undefined) this.charge = params.charge;
    if (params.linkDistance !== undefined) this.linkDistance = params.linkDistance;
    if (params.gravity !== undefined) this.gravity = params.gravity;
    if (params.friction !== undefined) this.friction = params.friction;
  }
}

// 图算法可视化
import { computeConnectedComponents } from './algorithms/connectedComponents';
import { findBridges } from './algorithms/findBridges';
import { computeMinimumSpanningTree } from './algorithms/minimumSpanningTree';
import { isBipartite } from './algorithms/isBipartite';

export class GraphAlgorithmVisualizer {
  constructor(graphDataManager) {
    this.graphDataManager = graphDataManager;
  }
  
  // 计算连通分量
  computeConnectedComponents() {
    return computeConnectedComponents(this.graphDataManager);
  }
  
  // 检测桥边
  findBridges() {
    return findBridges(this.graphDataManager);
  }
  
  // 计算最小生成树（Kruskal算法）
  computeMinimumSpanningTree() {
    return computeMinimumSpanningTree(this.graphDataManager);
  }
  
  // 检测二分图
  isBipartite() {
    return isBipartite(this.graphDataManager);
  }
}

// 动画管理器
export class AnimationManager {
  constructor() {
    this.animationId = null;
    this.isRunning = false;
    this.lastTime = 0;
    this.frameCount = 0;
    this.fps = 60;
    this.updateCallback = null;
  }
  
  // 启动动画循环
  start(updateCallback) {
    if (this.isRunning) return;
    
    this.updateCallback = updateCallback;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    
    const animate = (currentTime) => {
      if (!this.isRunning) return;
      
      // 计算时间差
      const deltaTime = currentTime - this.lastTime;
      
      // 控制帧率
      if (deltaTime >= 1000 / this.fps) {
        this.lastTime = currentTime - (deltaTime % (1000 / this.fps));
        this.frameCount++;
        
        // 调用更新回调
        if (this.updateCallback) {
          this.updateCallback(deltaTime);
        }
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }
  
  // 停止动画循环
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }
  
  // 暂停动画
  pause() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }
  
  // 恢复动画
  resume() {
    if (this.isRunning) return;
    
    this.start(this.updateCallback);
  }
  
  // 设置帧率
  setFPS(fps) {
    this.fps = fps;
  }
  
  // 获取当前帧率
  getCurrentFPS() {
    return this.frameCount;
  }
  
  // 重置帧率计数
  resetFPS() {
    this.frameCount = 0;
  }
}

// 样式管理器
export class StyleManager {
  constructor() {
    this.theme = 'light'; // 'light' or 'dark'
    this.styles = {
      light: {
        backgroundColor: '#f8f8f8',
        node: {
          circle: {
            fill: '#3f51b5',
            stroke: '#ffffff',
            strokeWidth: 2
          },
          square: {
            fill: '#ff4081',
            stroke: '#ffffff',
            strokeWidth: 2,
            radius: 5
          },
          text: {
            fill: '#ffffff',
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        edge: {
          stroke: '#999999',
          strokeWidth: 2
        }
      },
      dark: {
        backgroundColor: '#1a1a1a',
        node: {
          circle: {
            fill: '#5c6bc0',
            stroke: '#ffffff',
            strokeWidth: 2
          },
          square: {
            fill: '#f06292',
            stroke: '#ffffff',
            strokeWidth: 2,
            radius: 5
          },
          text: {
            fill: '#ffffff',
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        edge: {
          stroke: '#666666',
          strokeWidth: 2
        }
      }
    };
  }
  
  // 切换主题
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }
  
  // 设置主题
  setTheme(theme) {
    if (['light', 'dark'].includes(theme)) {
      this.theme = theme;
    }
  }
  
  // 获取当前主题
  getTheme() {
    return this.theme;
  }
  
  // 获取样式
  getStyle(element, type) {
    const currentStyles = this.styles[this.theme];
    
    if (element === 'background') {
      return currentStyles.backgroundColor;
    } else if (element === 'node') {
      if (type && currentStyles.node[type]) {
        return currentStyles.node[type];
      }
      return currentStyles.node;
    } else if (element === 'edge') {
      return currentStyles.edge;
    }
    
    return {};
  }
  
  // 更新样式
  updateStyle(element, type, properties) {
    const currentStyles = this.styles[this.theme];
    
    if (element === 'background' && properties.backgroundColor) {
      currentStyles.backgroundColor = properties.backgroundColor;
    } else if (element === 'node' && type && currentStyles.node[type]) {
      Object.assign(currentStyles.node[type], properties);
    } else if (element === 'edge') {
      Object.assign(currentStyles.edge, properties);
    }
  }
}

// 主动画函数
export function animateGraph(canvas, options = {}) {
  // 初始化渲染器
  const ctx = canvas.getContext('2d');
  
  // 初始化各个管理器
  const graphDataManager = new GraphDataManager();
  const forceLayout = new ForceDirectedLayout(graphDataManager, canvas.width, canvas.height);
  const algorithmVisualizer = new GraphAlgorithmVisualizer(graphDataManager);
  const animationManager = new AnimationManager();
  const styleManager = new StyleManager();
  
  // 设置初始数据（如果提供）
  if (options.nodes) {
    options.nodes.forEach(node => graphDataManager.addNode(node));
  }
  
  if (options.edges) {
    options.edges.forEach(edge => graphDataManager.addEdge(edge.source, edge.target));
  }
  
  // 设置物理参数
  if (options.physicalParameters) {
    forceLayout.setParameters(options.physicalParameters);
  }
  
  // 渲染函数
  const render = () => {
    // 清空画布
    ctx.fillStyle = styleManager.getStyle('background');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const nodes = graphDataManager.getAllNodes();
    const edges = graphDataManager.getAllEdges();
    
    // 绘制边
    edges.forEach(edge => {
      const sourceNode = graphDataManager.getNode(edge.source);
      const targetNode = graphDataManager.getNode(edge.target);
      
      if (sourceNode && targetNode) {
        const edgeStyle = styleManager.getStyle('edge');
        
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = edgeStyle.stroke;
        ctx.lineWidth = edgeStyle.strokeWidth;
        ctx.stroke();
      }
    });
    
    // 绘制节点
    nodes.forEach(node => {
      const nodeStyle = styleManager.getStyle('node', node.type);
      
      if (node.type === 'circle') {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size || 20, 0, 2 * Math.PI);
        ctx.fillStyle = nodeStyle.fill;
        ctx.fill();
        ctx.strokeStyle = nodeStyle.stroke;
        ctx.lineWidth = nodeStyle.strokeWidth;
        ctx.stroke();
      } else if (node.type === 'square') {
        const size = node.size || 20;
        ctx.beginPath();
        ctx.rect(node.x - size, node.y - size, size * 2, size * 2);
        ctx.fillStyle = nodeStyle.fill;
        ctx.fill();
        ctx.strokeStyle = nodeStyle.stroke;
        ctx.lineWidth = nodeStyle.strokeWidth;
        ctx.stroke();
      }
      
      // 绘制节点标签
      if (node.label) {
        const textStyle = styleManager.getStyle('node', 'text');
        ctx.fillStyle = textStyle.fill;
        ctx.font = `${textStyle.fontWeight} ${textStyle.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
      }
    });
  };
  
  // 动画更新函数
  const update = (deltaTime) => {
    // 更新物理布局
    forceLayout.update();
    
    // 渲染
    render();
  };
  
  // 启动动画
  animationManager.start(update);
  
  // 返回控制接口
  return {
    // 图数据操作
    addNode: (node) => graphDataManager.addNode(node),
    addEdge: (sourceId, targetId) => graphDataManager.addEdge(sourceId, targetId),
    updateNodePosition: (nodeId, x, y) => graphDataManager.updateNodePosition(nodeId, x, y),
    getAllNodes: () => graphDataManager.getAllNodes(),
    getAllEdges: () => graphDataManager.getAllEdges(),
    reset: () => graphDataManager.reset(),
    
    // 物理参数控制
    setPhysicalParameters: (params) => forceLayout.setParameters(params),
    
    // 动画控制
    start: () => animationManager.start(update),
    stop: () => animationManager.stop(),
    pause: () => animationManager.pause(),
    resume: () => animationManager.resume(),
    setFPS: (fps) => animationManager.setFPS(fps),
    
    // 样式控制
    toggleTheme: () => styleManager.toggleTheme(),
    setTheme: (theme) => styleManager.setTheme(theme),
    updateStyle: (element, type, properties) => styleManager.updateStyle(element, type, properties),
    
    // 算法可视化
    computeConnectedComponents: () => algorithmVisualizer.computeConnectedComponents(),
    findBridges: () => algorithmVisualizer.findBridges(),
    computeMinimumSpanningTree: () => algorithmVisualizer.computeMinimumSpanningTree(),
    isBipartite: () => algorithmVisualizer.isBipartite(),
    
    // 手动渲染
    render: () => render()
  };
}

export default animateGraph;