// drawingTools.js - 负责图的绘制和动画实现，使用animejs库
import { animate, createTimeline, stagger, utils, spring } from 'animejs';
/**
 * Canvas渲染器类
 * 负责在Canvas上绘制各种图形元素
 */
export class CanvasRenderer {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.animations = new Map(); // 存储所有活动的动画
  }
  
  /**
   * 清空画布
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  /**
   * 绘制圆形
   */
  drawCircle(x, y, radius, style = {}) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    if (style.fill) {
      this.ctx.fillStyle = style.fill;
      this.ctx.fill();
    }
    
    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style.lineWidth || 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * 绘制矩形
   */
  drawRect(x, y, width, height, style = {}) {
    this.ctx.beginPath();
    
    // 支持圆角矩形
    if (style.radius && style.radius > 0) {
      const radius = style.radius;
      this.ctx.moveTo(x + radius, y);
      this.ctx.lineTo(x + width - radius, y);
      this.ctx.arcTo(x + width, y, x + width, y + radius, radius);
      this.ctx.lineTo(x + width, y + height - radius);
      this.ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
      this.ctx.lineTo(x + radius, y + height);
      this.ctx.arcTo(x, y + height, x, y + height - radius, radius);
      this.ctx.lineTo(x, y + radius);
      this.ctx.arcTo(x, y, x + radius, y, radius);
    } else {
      this.ctx.rect(x, y, width, height);
    }
    
    if (style.fill) {
      this.ctx.fillStyle = style.fill;
      this.ctx.fill();
    }
    
    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style.lineWidth || 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * 绘制多边形
   */
  drawPolygon(points, style = {}) {
    if (!points || points.length < 3) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    this.ctx.closePath();
    
    if (style.fill) {
      this.ctx.fillStyle = style.fill;
      this.ctx.fill();
    }
    
    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style.lineWidth || 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * 绘制线段
   */
  drawLine(x1, y1, x2, y2, style = {}) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    
    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style.lineWidth || 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * 绘制箭头
   */
  drawArrow(x1, y1, x2, y2, style = {}) {
    const headLength = 10;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    
    // 绘制主线
    this.drawLine(x1, y1, x2, y2, style);
    
    // 绘制箭头
    this.ctx.beginPath();
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    
    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style.lineWidth || 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * 绘制贝塞尔曲线
   */
  drawBezierCurve(x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2, style = {}) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
    
    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style.lineWidth || 1;
      this.ctx.stroke();
    }
  }
  
  /**
   * 绘制文本
   */
  drawText(text, x, y, style = {}) {
    if (style.fontSize) {
      this.ctx.font = `${style.fontSize}px ${style.fontFamily || 'Arial, sans-serif'}`;
    }
    
    if (style.fill) {
      this.ctx.fillStyle = style.fill;
    }
    
    this.ctx.textAlign = style.textAlign || 'start';
    this.ctx.textBaseline = style.textBaseline || 'alphabetic';
    
    if (style.fill) {
      this.ctx.fillText(text, x, y);
    }
    
    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style.lineWidth || 1;
      this.ctx.strokeText(text, x, y);
    }
  }
  
  /**
   * 创建通用动画
   */
  createAnimation(id, initialProps, targetProps, duration = 500, easing = 'easeOutQuad', onComplete) {
    // 检查是否有正在进行的动画，如果有则取消
    if (this.animations.has(id)) {
      const currentAnim = this.animations.get(id);
      currentAnim.pause();
    }
    
    // 创建动画对象
    const animTarget = { ...initialProps };
    
    // 创建anime动画 - 使用v4.0的animate API
    const animation = animate(animTarget, {
      ...targetProps,
      duration,
      easing,
      update: () => {
        // 更新后需要在调用方重新绘制
      },
      complete: () => {
        // 动画完成后从映射中移除
        this.animations.delete(id);
        if (onComplete) {
          onComplete();
        }
      }
    });
    
    // 存储动画引用
    this.animations.set(id, animation);
    
    // 返回动画对象，以便调用方可以获取当前值
    return animTarget;
  }
  
  /**
   * 暂停所有动画
   */
  pauseAnimations() {
    this.animations.forEach(anim => anim.pause());
  }
  
  /**
   * 恢复所有动画
   */
  resumeAnimations() {
    this.animations.forEach(anim => anim.play());
  }
  
  /**
   * 停止所有动画
   */
  stopAnimations() {
    this.animations.forEach(anim => anim.pause());
    this.animations.clear();
  }
}

/**
 * SVG渲染器类
 * 负责将图导出为SVG格式
 */
export class SVGRenderer {
  constructor() {
    this.svgns = 'http://www.w3.org/2000/svg';
  }
  
  /**
   * 将图数据转换为SVG元素
   */
  graphToSVG(nodes, edges, width, height) {
    // 创建SVG元素
    const svg = document.createElementNS(this.svgns, 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('xmlns', this.svgns);
    
    // 添加边
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const line = document.createElementNS(this.svgns, 'line');
        line.setAttribute('x1', sourceNode.x);
        line.setAttribute('y1', sourceNode.y);
        line.setAttribute('x2', targetNode.x);
        line.setAttribute('y2', targetNode.y);
        line.setAttribute('stroke', edge.style?.stroke || '#999999');
        line.setAttribute('stroke-width', edge.style?.lineWidth || 2);
        
        svg.appendChild(line);
      }
    });
    
    // 添加节点
    nodes.forEach(node => {
      const size = node.size || 20;
      let element;
      
      if (node.type === 'square') {
        // 创建矩形节点
        element = document.createElementNS(this.svgns, 'rect');
        element.setAttribute('x', node.x - size / 2);
        element.setAttribute('y', node.y - size / 2);
        element.setAttribute('width', size);
        element.setAttribute('height', size);
      } else {
        // 创建圆形节点
        element = document.createElementNS(this.svgns, 'circle');
        element.setAttribute('cx', node.x);
        element.setAttribute('cy', node.y);
        element.setAttribute('r', size / 2);
      }
      
      // 设置节点样式
      element.setAttribute('fill', node.style?.fill || '#3f51b5');
      element.setAttribute('stroke', node.style?.stroke || '#ffffff');
      element.setAttribute('stroke-width', node.style?.lineWidth || 2);
      
      svg.appendChild(element);
      
      // 添加节点标签
      if (node.label) {
        const text = document.createElementNS(this.svgns, 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', node.style?.labelFill || '#ffffff');
        text.setAttribute('font-size', node.style?.labelFontSize || 12);
        text.textContent = node.label;
        
        svg.appendChild(text);
      }
    });
    
    return svg;
  }
  
  /**
   * 将SVG元素转换为字符串
   */
  svgToString(svg) {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);
  }
}

/**
 * 几何工具
 */
export const geometry = {
  /**
   * 计算两点之间的距离
   */
  distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  },
  
  /**
   * 计算点到线段的最短距离
   */
  distanceToLine(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  }
};

/**
 * GraphRenderer类
 * 使用DOM元素和CSS样式渲染图，并使用animejs v4.0进行动画
 */
export class GraphRenderer {
  constructor(canvas, options = {}) {
    // 创建一个容器元素来放置节点和边
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = `${canvas.width}px`;
    this.container.style.height = `${canvas.height}px`;
    this.container.style.pointerEvents = 'none'; // 确保容器不阻止事件传递
    
    // 如果传入的是canvas元素，将容器放在canvas的上层
    if (canvas) {
      canvas.parentNode.appendChild(this.container);
    }
    
    // 存储当前的图状态
    this.nodes = [];
    this.edges = [];
    
    // 为每个节点和边创建DOM元素引用
    this.nodeElements = new Map(); // 存储节点DOM元素
    this.edgeElements = new Map(); // 存储边DOM元素
    
    // 存储已存在的节点和边的ID，用于检测新增元素
    this.existingNodeIds = new Set();
    this.existingEdgeIds = new Set();
    
    // 默认样式
    this.defaultNodeStyle = {
      fill: '#3f51b5',
      stroke: '#ffffff',
      lineWidth: 2
    };
    
    this.defaultEdgeStyle = {
      stroke: '#999999',
      lineWidth: 2
    };
    
    // 添加CSS样式到页面
    this.addCSSStyles();
  }
  
  /**
   * 添加必要的CSS样式
   */
  addCSSStyles() {
    // 检查是否已经添加过样式
    if (document.getElementById('graph-renderer-styles')) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'graph-renderer-styles';
    styleElement.textContent = `
      .graph-node {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s ease;
      }
      .graph-node.circle {
        border-radius: 50%;
      }
      .graph-node.square {
        border-radius: 4px;
      }
      .graph-node-label {
        color: white;
        font-size: 12px;
        font-weight: bold;
        pointer-events: none;
      }
      .graph-edge {
        position: absolute;
        background-color: #999999;
        transform-origin: 0 0;
        pointer-events: none;
        z-index: 1;
      }
    `;
    
    document.head.appendChild(styleElement);
  }
  
  /**
   * 更新图数据
   */
  updateGraph(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
    this.rebuild();
  }
  
  /**
   * 渲染完整的图
   */
  rebuild() {
    // 清理不再使用的DOM元素
    this.cleanupRemovedElements();
    
    // 更新或创建边
    this.edges.forEach(edge => {
      const sourceNode = this.nodes.find(n => n.id === edge.source);
      const targetNode = this.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        if (this.isEdgeNew(edge.id)) {
          // 新增边，添加出现动画
          this.createEdgeElement(edge.id, sourceNode, targetNode, edge.style);
          this.animateEdgeAppearance(edge.id);
          this.existingEdgeIds.add(edge.id);
        } else {
          // 更新现有边的位置
          this.updateEdgePosition(edge.id, sourceNode, targetNode);
        }
      }
    });
    
    // 更新或创建节点
    this.nodes.forEach(node => {
      if (this.isNodeNew(node.id)) {
        // 新增节点，添加出现动画
        this.createNodeElement(node.id, node);
        this.animateNodeAppearance(node.id);
        this.existingNodeIds.add(node.id);
      } else {
        // 更新现有节点的位置和样式
        this.updateNodeElement(node.id, node);
      }
    });
  }
  
  /**
   * 创建节点DOM元素
   */
  createNodeElement(nodeId, node) {
    const size = node.size || 20;
    
    // 创建节点容器
    const nodeElement = document.createElement('div');
    nodeElement.className = `graph-node ${node.type === 'square' ? 'square' : 'circle'}`;
    nodeElement.style.width = `${size}px`;
    nodeElement.style.height = `${size}px`;
    nodeElement.style.backgroundColor = node.style?.fill || this.defaultNodeStyle.fill;
    nodeElement.style.border = `${node.style?.lineWidth || this.defaultNodeStyle.lineWidth}px solid ${node.style?.stroke || this.defaultNodeStyle.stroke}`;
    nodeElement.style.left = `${node.x - size / 2}px`;
    nodeElement.style.top = `${node.y - size / 2}px`;
    nodeElement.style.zIndex = '2';
    nodeElement.style.opacity = '0';
    nodeElement.style.transform = 'scale(0)';
    
    // 添加节点标签
    if (node.label) {
      const labelElement = document.createElement('div');
      labelElement.className = 'graph-node-label';
      labelElement.textContent = node.label;
      labelElement.style.color = node.style?.labelFill || '#ffffff';
      labelElement.style.fontSize = `${node.style?.labelFontSize || 12}px`;
      
      nodeElement.appendChild(labelElement);
    }
    
    // 添加到容器
    this.container.appendChild(nodeElement);
    
    // 存储节点元素引用
    this.nodeElements.set(nodeId, nodeElement);
  }
  
  /**
   * 创建边DOM元素
   */
  createEdgeElement(edgeId, sourceNode, targetNode, style) {
    // 计算边的长度和角度
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // 创建边元素
    const edgeElement = document.createElement('div');
    edgeElement.className = 'graph-edge';
    edgeElement.style.width = `${length}px`;
    edgeElement.style.height = `${style?.lineWidth || this.defaultEdgeStyle.lineWidth}px`;
    edgeElement.style.backgroundColor = style?.stroke || this.defaultEdgeStyle.stroke;
    edgeElement.style.left = `${sourceNode.x}px`;
    edgeElement.style.top = `${sourceNode.y}px`;
    edgeElement.style.transform = `rotate(${angle}deg)`;
    edgeElement.style.opacity = '0';
    
    // 添加到容器
    this.container.appendChild(edgeElement);
    
    // 存储边元素引用
    this.edgeElements.set(edgeId, { element: edgeElement, sourceNode, targetNode });
  }
  
  /**
   * 更新节点元素
   */
  updateNodeElement(nodeId, node) {
    const nodeElement = this.nodeElements.get(nodeId);
    if (!nodeElement) return;
    
    const size = node.size || 20;
    
    // 更新节点样式
    nodeElement.style.width = `${size}px`;
    nodeElement.style.height = `${size}px`;
    nodeElement.style.backgroundColor = node.style?.fill || this.defaultNodeStyle.fill;
    nodeElement.style.border = `${node.style?.lineWidth || this.defaultNodeStyle.lineWidth}px solid ${node.style?.stroke || this.defaultNodeStyle.stroke}`;
    
    // 更新节点标签
    const labelElement = nodeElement.querySelector('.graph-node-label');
    if (node.label) {
      if (labelElement) {
        labelElement.textContent = node.label;
        labelElement.style.color = node.style?.labelFill || '#ffffff';
        labelElement.style.fontSize = `${node.style?.labelFontSize || 12}px`;
      } else {
        const newLabelElement = document.createElement('div');
        newLabelElement.className = 'graph-node-label';
        newLabelElement.textContent = node.label;
        newLabelElement.style.color = node.style?.labelFill || '#ffffff';
        newLabelElement.style.fontSize = `${node.style?.labelFontSize || 12}px`;
        nodeElement.appendChild(newLabelElement);
      }
    } else if (labelElement) {
      nodeElement.removeChild(labelElement);
    }
    
    // 直接设置样式，避免使用animejs动画
    nodeElement.style.transition = 'left 1000ms ease, top 1000ms ease';
    nodeElement.style.left = `${node.x - size / 2}px`;
    nodeElement.style.top = `${node.y - size / 2}px`;
  }
  
  /**
   * 更新边位置
   */
  updateEdgePosition(edgeId, sourceNode, targetNode) {
    const edgeData = this.edgeElements.get(edgeId);
    if (!edgeData) return;
    
    const edgeElement = edgeData.element;
    
    // 计算新的长度和角度
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // 直接设置样式，避免使用animejs的width属性动画
    edgeElement.style.width = `${length}px`;
    edgeElement.style.left = `${sourceNode.x}px`;
    edgeElement.style.top = `${sourceNode.y}px`;
    edgeElement.style.rotate = `${angle}deg`;
    
    // 更新边数据
    edgeData.sourceNode = sourceNode;
    edgeData.targetNode = targetNode;
  }
  
  /**
   * 节点出现动画
   */
  animateNodeAppearance(nodeId, duration = 1000, easing = spring({ bounce: 0.7 }), onComplete) {
    const nodeElement = this.nodeElements.get(nodeId);
    if (!nodeElement) return;
    
    // 使用CSS transitions替代animejs，避免类型错误
    nodeElement.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    nodeElement.style.opacity = '0';
    nodeElement.style.transform = 'scale(0.8)';
    
    // 使用setTimeout确保样式应用后再开始动画
    setTimeout(() => {
      nodeElement.style.opacity = '1';
      nodeElement.style.transform = 'scale(1)';
      
      if (onComplete && typeof onComplete === 'function') {
        // 为了与原动画完成时间保持一致，使用setTimeout延迟调用onComplete
        setTimeout(() => {
          onComplete();
        }, duration);
      }
    }, 10);
  }
  
  /**
   * 边出现动画
   */
  animateEdgeAppearance(edgeId, duration = 1000, easing = spring({ bounce: 0.7 }), onComplete) {
    const edgeData = this.edgeElements.get(edgeId);
    if (!edgeData) return;
    
    const edgeElement = edgeData.element;
    
    // 避免使用width属性，直接使用transition
    // 移除之前的宽度设置
    edgeElement.style.transition = `opacity ${duration}ms ease`;
    edgeElement.style.opacity = '0';
    
    // 使用setTimeout确保样式应用后再开始动画
    setTimeout(() => {
      // 直接修改样式，不使用animejs的width属性动画
      edgeElement.style.opacity = '1';
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    }, 10);
  }
  
  /**
   * 清理不再使用的元素
   */
  cleanupRemovedElements() {
    // 清理节点
    const currentNodeIds = new Set(this.nodes.map(n => n.id));
    for (const nodeId of this.existingNodeIds) {
      if (!currentNodeIds.has(nodeId)) {
        const nodeElement = this.nodeElements.get(nodeId);
        if (nodeElement) {
          // 使用CSS transitions替代animejs动画
          nodeElement.style.transition = 'opacity 1000ms ease, transform 1000ms ease';
          nodeElement.style.opacity = '0';
          nodeElement.style.transform = 'scale(0)';
          
          // 使用setTimeout在动画完成后移除元素
          setTimeout(() => {
            // 动画完成后移除元素
            if (nodeElement.parentNode) {
              nodeElement.parentNode.removeChild(nodeElement);
            }
            this.nodeElements.delete(nodeId);
          }, 1000);
        }
        this.existingNodeIds.delete(nodeId);
      }
    }
    
    // 清理边
    const currentEdgeIds = new Set(this.edges.map(e => e.id));
    for (const edgeId of this.existingEdgeIds) {
      if (!currentEdgeIds.has(edgeId)) {
        const edgeData = this.edgeElements.get(edgeId);
        if (edgeData) {
          // 使用CSS transitions替代animejs动画，避免width属性导致的类型错误
          const edgeElement = edgeData.element;
          edgeElement.style.transition = 'opacity 1000ms ease';
          edgeElement.style.opacity = '0';
          
          // 使用setTimeout在动画完成后移除元素
          setTimeout(() => {
            // 动画完成后移除元素
            if (edgeElement.parentNode) {
              edgeElement.parentNode.removeChild(edgeElement);
            }
            this.edgeElements.delete(edgeId);
          }, 1000);
        }
        this.existingEdgeIds.delete(edgeId);
      }
    }
  }
  
  /**
   * 导出为SVG字符串
   */
  exportAsSVG() {
    const svgRenderer = new SVGRenderer();
    const svg = svgRenderer.graphToSVG(
      this.nodes,
      this.edges,
      parseInt(this.container.style.width),
      parseInt(this.container.style.height)
    );
    
    return svgRenderer.svgToString(svg);
  }
  
  /**
   * 检查节点是否是新增的
   */
  isNodeNew(nodeId) {
    return !this.existingNodeIds.has(nodeId);
  }
  
  /**
   * 检查边是否是新增的
   */
  isEdgeNew(edgeId) {
    return !this.existingEdgeIds.has(edgeId);
  }
  
  /**
   * 记录当前节点和边的状态，用于后续变化检测
   */
  recordCurrentState() {
    this.existingNodeIds = new Set(this.nodes.map(n => n.id));
    this.existingEdgeIds = new Set(this.edges.map(e => e.id));
  }
  
  /**
   * 清除所有动画
   */
  clearAnimations() {
    // animejs v4.0 中，动画实例会自动管理，不需要手动清除
  }
}

/**
 * 导出组件和工具
 */
export const drawingTools = {
  CanvasRenderer,
  SVGRenderer,
  GraphRenderer,
  geometry
};

export default drawingTools;