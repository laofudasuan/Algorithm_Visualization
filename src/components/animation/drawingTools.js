// drawingTools.js - 负责图的绘制和动画实现，使用animejs库
import { animate } from 'animejs';
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
 * 使用SVG元素渲染图，并使用animejs v4.0进行动画
 */
export class GraphRenderer {
  constructor(canvas, options = {}) {
    this.svgns = 'http://www.w3.org/2000/svg';
    
    // 创建SVG容器元素
    this.container = document.createElementNS(this.svgns, 'svg');
    this.container.setAttribute('width', canvas.width);
    this.container.setAttribute('height', canvas.height);
    this.container.setAttribute('style', 'position: absolute; top: 0; left: 0; z-index: 1;');
    
    // 如果传入的是canvas元素，将SVG容器放在canvas的上层
    if (canvas) {
      canvas.parentNode.appendChild(this.container);
    }
    
    // 创建分组来管理不同类型的元素
    this.edgesGroup = document.createElementNS(this.svgns, 'g');
    this.nodesGroup = document.createElementNS(this.svgns, 'g');
    this.labelsGroup = document.createElementNS(this.svgns, 'g');
    
    // 将分组添加到SVG容器
    this.container.appendChild(this.edgesGroup);
    this.container.appendChild(this.nodesGroup);
    this.container.appendChild(this.labelsGroup);
    
    // 存储当前的图状态
    this.nodes = [];
    this.edges = [];
    
    // 为每个节点和边创建SVG元素引用
    this.nodeElements = new Map(); // 存储节点SVG元素
    this.edgeElements = new Map(); // 存储边SVG元素
    this.nodeLabelElements = new Map(); // 存储节点标签元素
    this.edgeLabelElements = new Map(); // 存储边标签元素
    
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
    // 清理不再使用的元素
    this.cleanupRemovedElements();
    
    // 更新或创建边
    this.edges.forEach(edge => {
      const sourceNode = this.nodes.find(n => n.id === edge.source);
      const targetNode = this.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        if (this.isEdgeNew(edge.id)) {
          // 新增边，添加出现动画
          this.createEdgeElement(edge.id, sourceNode, targetNode, edge.style, edge.label);
          this.animateEdgeAppearance(edge.id);
          this.existingEdgeIds.add(edge.id);
        } else {
          // 更新现有边的位置
          this.updateEdgePosition(edge.id, sourceNode, targetNode, edge.label);
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
   * 创建节点SVG元素
   */
  createNodeElement(nodeId, node) {
    const size = node.size || 20;
    const nodeStyle = { ...this.defaultNodeStyle, ...node.style };
    let nodeElement;
    
    // 根据节点类型创建不同的SVG元素
    if (node.type === 'square') {
      // 创建矩形节点
      nodeElement = document.createElementNS(this.svgns, 'rect');
      nodeElement.setAttribute('x', node.x - size / 2);
      nodeElement.setAttribute('y', node.y - size / 2);
      nodeElement.setAttribute('width', size);
      nodeElement.setAttribute('height', size);
    } else {
      // 创建圆形节点
      nodeElement = document.createElementNS(this.svgns, 'circle');
      nodeElement.setAttribute('cx', node.x);
      nodeElement.setAttribute('cy', node.y);
      nodeElement.setAttribute('r', size / 2);
    }
    
    // 设置节点样式
    nodeElement.setAttribute('fill', nodeStyle.fill);
    nodeElement.setAttribute('stroke', nodeStyle.stroke);
    nodeElement.setAttribute('stroke-width', nodeStyle.lineWidth);
    nodeElement.setAttribute('opacity', '0');
    nodeElement.setAttribute('transform', 'scale(0.8)');
    
    // 添加到节点分组
    this.nodesGroup.appendChild(nodeElement);
    
    // 存储节点元素引用
    this.nodeElements.set(nodeId, nodeElement);
    
    // 添加节点标签
    if (node.label) {
      this.createNodeLabelElement(nodeId, node);
    }
  }
  
  /**
   * 创建节点标签SVG元素
   */
  createNodeLabelElement(nodeId, node) {
    const labelElement = document.createElementNS(this.svgns, 'text');
    labelElement.setAttribute('x', node.x);
    labelElement.setAttribute('y', node.y);
    labelElement.setAttribute('text-anchor', 'middle');
    labelElement.setAttribute('dominant-baseline', 'middle');
    labelElement.setAttribute('fill', node.style?.labelFill || '#ffffff');
    labelElement.setAttribute('font-size', node.style?.labelFontSize || 12);
    labelElement.setAttribute('opacity', '0');
    labelElement.textContent = node.label;
    
    // 添加到标签分组
    this.labelsGroup.appendChild(labelElement);
    
    // 存储标签元素引用
    this.nodeLabelElements.set(nodeId, labelElement);
  }
  
  /**
   * 创建边SVG元素
   */
  createEdgeElement(edgeId, sourceNode, targetNode, style, label) {
    const edgeStyle = { ...this.defaultEdgeStyle, ...style };
    
    // 创建path元素作为边
    const edgeElement = document.createElementNS(this.svgns, 'path');
    
    // 创建路径数据
    const pathData = this.createPathData(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y);
    edgeElement.setAttribute('d', pathData);
    
    // 设置边样式
    edgeElement.setAttribute('stroke', edgeStyle.stroke);
    edgeElement.setAttribute('stroke-width', edgeStyle.lineWidth);
    edgeElement.setAttribute('fill', 'none');
    edgeElement.setAttribute('opacity', '0');
    
    // 添加到边分组
    this.edgesGroup.appendChild(edgeElement);
    
    // 存储边元素引用
    this.edgeElements.set(edgeId, {
      element: edgeElement,
      sourceNode,
      targetNode,
      style: edgeStyle
    });
    
    // 创建边标签
    if (label) {
      this.createEdgeLabelElement(edgeId, sourceNode, targetNode, label, style);
    }
  }
  
  /**
   * 创建边标签SVG元素
   */
  createEdgeLabelElement(edgeId, sourceNode, targetNode, label, style) {
    const midX = (sourceNode.x + targetNode.x) / 2;
    const midY = (sourceNode.y + targetNode.y) / 2;
    
    const labelElement = document.createElementNS(this.svgns, 'text');
    labelElement.setAttribute('x', midX);
    labelElement.setAttribute('y', midY);
    labelElement.setAttribute('text-anchor', 'middle');
    labelElement.setAttribute('dominant-baseline', 'middle');
    labelElement.setAttribute('fill', style?.labelFill || '#333333');
    labelElement.setAttribute('font-size', style?.labelFontSize || 12);
    labelElement.setAttribute('opacity', '0');
    labelElement.textContent = label;
    
    // 添加到标签分组
    this.labelsGroup.appendChild(labelElement);
    
    // 存储边标签元素引用
    this.edgeLabelElements.set(edgeId, labelElement);
  }
  
  /**
   * 创建路径数据
   */
  createPathData(x1, y1, x2, y2) {
    // 简单的直线路径，也可以根据需要实现更复杂的路径
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  
  /**
   * 更新节点元素
   */
  updateNodeElement(nodeId, node) {
    const nodeElement = this.nodeElements.get(nodeId);
    if (!nodeElement) return;
    
    const size = node.size || 20;
    const nodeStyle = { ...this.defaultNodeStyle, ...node.style };
    
    // 更新节点样式
    nodeElement.setAttribute('fill', nodeStyle.fill);
    nodeElement.setAttribute('stroke', nodeStyle.stroke);
    nodeElement.setAttribute('stroke-width', nodeStyle.lineWidth);
    
    // 更新节点位置和大小
    if (nodeElement.tagName === 'circle') {
      // 更新圆形
      nodeElement.setAttribute('cx', node.x);
      nodeElement.setAttribute('cy', node.y);
      nodeElement.setAttribute('r', size / 2);
    } else {
      // 更新矩形
      nodeElement.setAttribute('x', node.x - size / 2);
      nodeElement.setAttribute('y', node.y - size / 2);
      nodeElement.setAttribute('width', size);
      nodeElement.setAttribute('height', size);
    }
    
    // 更新或创建节点标签
    if (node.label) {
      const labelElement = this.nodeLabelElements.get(nodeId);
      if (labelElement) {
        labelElement.setAttribute('x', node.x);
        labelElement.setAttribute('y', node.y);
        labelElement.setAttribute('fill', nodeStyle?.labelFill || '#ffffff');
        labelElement.setAttribute('font-size', nodeStyle?.labelFontSize || 12);
        labelElement.textContent = node.label;
      } else {
        this.createNodeLabelElement(nodeId, node);
      }
    } else if (this.nodeLabelElements.has(nodeId)) {
      const labelElement = this.nodeLabelElements.get(nodeId);
      if (labelElement.parentNode) {
        labelElement.parentNode.removeChild(labelElement);
      }
      this.nodeLabelElements.delete(nodeId);
    }
    
    // 使用animejs创建节点动画
    animate({ cx: parseFloat(nodeElement.getAttribute('cx') || node.x), cy: parseFloat(nodeElement.getAttribute('cy') || node.y) }, {
      cx: node.x,
      cy: node.y,
      duration: 1000,
      easing: 'easeOutQuad',
      update: (anim) => {
        if (nodeElement.tagName === 'circle') {
          nodeElement.setAttribute('cx', anim.cx);
          nodeElement.setAttribute('cy', anim.cy);
        } else {
          nodeElement.setAttribute('x', anim.cx - size / 2);
          nodeElement.setAttribute('y', anim.cy - size / 2);
        }
        
        // 同时更新标签位置
        const labelElement = this.nodeLabelElements.get(nodeId);
        if (labelElement) {
          labelElement.setAttribute('x', anim.cx);
          labelElement.setAttribute('y', anim.cy);
        }
      }
    });
  }
  
  /**
   * 更新边位置
   */
  updateEdgePosition(edgeId, sourceNode, targetNode, label) {
    const edgeData = this.edgeElements.get(edgeId);
    if (!edgeData) return;
    
    const edgeElement = edgeData.element;
    const labelElement = this.edgeLabelElements.get(edgeId);
    
    // 创建新的路径数据
    const newPathData = this.createPathData(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y);
    
    // 使用animejs创建边动画
    const animTarget = {
      progress: 0,
      startX: edgeData.sourceNode.x,
      startY: edgeData.sourceNode.y,
      endX: edgeData.targetNode.x,
      endY: edgeData.targetNode.y
    };
    
    animate(animTarget, {
      progress: 100,
      startX: sourceNode.x,
      startY: sourceNode.y,
      endX: targetNode.x,
      endY: targetNode.y,
      duration: 1000,
      easing: 'easeOutQuad',
      update: (anim) => {
        // 更新路径数据
        const currentPathData = this.createPathData(anim.startX, anim.startY, anim.endX, anim.endY);
        edgeElement.setAttribute('d', currentPathData);
        
        // 更新边标签位置
        if (labelElement) {
          const midX = (anim.startX + anim.endX) / 2;
          const midY = (anim.startY + anim.endY) / 2;
          labelElement.setAttribute('x', midX);
          labelElement.setAttribute('y', midY);
        }
      },
      complete: () => {
        // 更新边数据
        edgeData.sourceNode = sourceNode;
        edgeData.targetNode = targetNode;
      }
    });
    
    // 更新或创建边标签
    if (label) {
      if (labelElement) {
        labelElement.textContent = label;
        labelElement.setAttribute('opacity', '1');
      } else {
        this.createEdgeLabelElement(edgeId, sourceNode, targetNode, label, edgeData.style);
        // 触发标签出现动画
        const newLabelElement = this.edgeLabelElements.get(edgeId);
        animate(newLabelElement, {
          opacity: [0, 1],
          duration: 300,
          easing: 'easeOutQuad'
        });
      }
    } else if (labelElement) {
      animate(labelElement, {
        opacity: [1, 0],
        duration: 300,
        easing: 'easeOutQuad',
        complete: () => {
          if (labelElement.parentNode) {
            labelElement.parentNode.removeChild(labelElement);
          }
          this.edgeLabelElements.delete(edgeId);
        }
      });
    }
  }
  
  /**
   * 节点出现动画
   */
  animateNodeAppearance(nodeId, duration = 1000, easing = 'easeOutElastic(1, .5)', onComplete) {
    const nodeElement = this.nodeElements.get(nodeId);
    const labelElement = this.nodeLabelElements.get(nodeId);
    
    if (!nodeElement) return;
    
    // 重置样式
    nodeElement.setAttribute('opacity', '0');
    nodeElement.setAttribute('transform', 'scale(0.8)');
    
    // 使用animejs创建节点动画
    animate(nodeElement, {
      opacity: [0, 1],
      scale: [0.8, 1],
      duration,
      easing,
      complete: onComplete
    });
    
    // 如果有标签，也添加动画
    if (labelElement) {
      labelElement.setAttribute('opacity', '0');
      // 标签动画稍微延迟一点开始
      setTimeout(() => {
        animate(labelElement, {
          opacity: [0, 1],
          duration: duration * 0.7
        });
      }, duration * 0.3);
    }
  }
  
  /**
   * 边出现动画
   */
  animateEdgeAppearance(edgeId, duration = 1000, easing = 'easeOutQuad', onComplete) {
    const edgeData = this.edgeElements.get(edgeId);
    if (!edgeData) return;
    
    const edgeElement = edgeData.element;
    const labelElement = this.edgeLabelElements.get(edgeId);
    const sourceNode = edgeData.sourceNode;
    const targetNode = edgeData.targetNode;
    
    // 获取原始路径数据
    const pathData = this.createPathData(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y);
    
    // 重置样式并设置路径数据
    edgeElement.setAttribute('d', pathData);
    edgeElement.setAttribute('opacity', '1');
    
    // 获取路径长度并设置初始stroke-dashoffset为路径长度
    edgeElement.setAttribute('stroke-dasharray', edgeElement.getTotalLength());
    edgeElement.setAttribute('stroke-dashoffset', edgeElement.getTotalLength());
    
    // 使用animejs创建边动画 - 模拟绘制效果
    animate(edgeElement, {
      strokeDashoffset: [edgeElement.getTotalLength(), 0],
      opacity: [0, 1],
      duration,
      easing,
      begin: () => {
        // 如果有标签，在动画进行到一定比例时淡入
        if (labelElement) {
          setTimeout(() => {
            animate(labelElement, {
              opacity: [0, 1],
              duration: duration * 0.3
            });
          }, duration * 0.7);
        }
      },
      complete: onComplete
    });
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
        const labelElement = this.nodeLabelElements.get(nodeId);
        
        if (nodeElement) {
          // 使用animejs创建节点消失动画
          animate(nodeElement, {
            opacity: [1, 0],
            scale: [1, 0],
            duration: 1000,
            easing: 'easeOutQuad',
            complete: () => {
              // 动画完成后移除元素
              if (nodeElement.parentNode) {
                nodeElement.parentNode.removeChild(nodeElement);
              }
              this.nodeElements.delete(nodeId);
            }
          });
        }
        
        // 同时移除标签
        if (labelElement) {
          animate(labelElement, {
            opacity: [1, 0],
            duration: 800,
            easing: 'easeOutQuad',
            complete: () => {
              if (labelElement.parentNode) {
                labelElement.parentNode.removeChild(labelElement);
              }
              this.nodeLabelElements.delete(nodeId);
            }
          });
        }
        
        this.existingNodeIds.delete(nodeId);
      }
    }
    
    // 清理边
    const currentEdgeIds = new Set(this.edges.map(e => e.id));
    for (const edgeId of this.existingEdgeIds) {
      if (!currentEdgeIds.has(edgeId)) {
        const edgeData = this.edgeElements.get(edgeId);
        const labelElement = this.edgeLabelElements.get(edgeId);
        
        if (edgeData) {
          const edgeElement = edgeData.element;
          
          // 边淡出动画
          animate(edgeElement, {
            opacity: [1, 0],
            duration: 1000,
            easing: 'easeOutQuad',
            complete: () => {
              // 动画完成后移除边元素
              if (edgeElement.parentNode) {
                edgeElement.parentNode.removeChild(edgeElement);
              }
              
              this.edgeElements.delete(edgeId);
            }
          });
          
          // 如果有标签，也添加淡出动画
          if (labelElement) {
            animate(labelElement, {
              opacity: [1, 0],
              duration: 1000,
              easing: 'easeOutQuad',
              complete: () => {
                // 动画完成后移除标签元素
                if (labelElement.parentNode) {
                  labelElement.parentNode.removeChild(labelElement);
                }
                this.edgeLabelElements.delete(edgeId);
              }
            });
          }
        }
        
        this.existingEdgeIds.delete(edgeId);
      }
    }
  }
  
  /**
   * 导出为SVG字符串
   */
  exportAsSVG() {
    // 直接返回当前SVG元素的序列化字符串
    const serializer = new XMLSerializer();
    return serializer.serializeToString(this.container);
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