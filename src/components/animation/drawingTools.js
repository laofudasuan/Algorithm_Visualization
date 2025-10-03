// drawingTools.js - 负责图的绘制和动画实现，使用animejs库
import anime from 'animejs';

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
      
      if (style.dashed) {
        this.ctx.setLineDash(style.dashArray || [5, 5]);
      }
      
      this.ctx.stroke();
      
      // 重置虚线设置
      if (style.dashed) {
        this.ctx.setLineDash([]);
      }
    }
  }
  
  /**
   * 绘制箭头
   */
  drawArrow(x1, y1, x2, y2, style = {}) {
    // 绘制线段
    this.drawLine(x1, y1, x2, y2, style);
    
    // 绘制箭头头部
    const headLength = style.arrowHeadLength || 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
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
  drawBezier(x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2, style = {}) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
    
    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style.lineWidth || 1;
      
      if (style.dashed) {
        this.ctx.setLineDash(style.dashArray || [5, 5]);
      }
      
      this.ctx.stroke();
      
      // 重置虚线设置
      if (style.dashed) {
        this.ctx.setLineDash([]);
      }
    }
  }
  
  /**
   * 绘制文本
   */
  drawText(text, x, y, style = {}) {
    this.ctx.font = `${style.fontWeight || 'normal'} ${style.fontSize || 14}px ${style.fontFamily || 'Arial'}`;
    this.ctx.fillStyle = style.fill || '#000000';
    this.ctx.textAlign = style.textAlign || 'left';
    this.ctx.textBaseline = style.textBaseline || 'alphabetic';
    
    if (style.stroke) {
      this.ctx.strokeStyle = style.stroke;
      this.ctx.lineWidth = style.strokeWidth || 1;
      this.ctx.strokeText(text, x, y);
    }
    
    this.ctx.fillText(text, x, y);
  }
  
  /**
   * 创建节点动画
   */
  animateNode(id, initialProps, targetProps, duration = 500, easing = 'easeOutQuad') {
    // 检查是否有正在进行的动画，如果有则取消
    if (this.animations.has(id)) {
      const currentAnim = this.animations.get(id);
      currentAnim.pause();
    }
    
    // 创建动画对象
    const animTarget = { ...initialProps };
    
    // 创建anime动画
    const animation = anime({
      targets: animTarget,
      ...targetProps,
      duration,
      easing,
      update: () => {
        // 更新后需要在调用方重新绘制
      },
      complete: () => {
        // 动画完成后从映射中移除
        this.animations.delete(id);
      }
    });
    
    // 存储动画引用
    this.animations.set(id, animation);
    
    // 返回动画对象，以便调用方可以获取当前值
    return animTarget;
  }
  
  /**
   * 创建边动画
   */
  animateEdge(id, initialProps, targetProps, duration = 500, easing = 'easeOutQuad') {
    // 边动画实现与节点类似，但可能需要特殊处理
    return this.animateNode(id, initialProps, targetProps, duration, easing);
  }
  
  /**
   * 创建批注动画
   */
  animateAnnotation(id, initialProps, targetProps, duration = 300, easing = 'easeOutQuad') {
    // 批注动画可能需要更短的持续时间
    return this.animateNode(id, initialProps, targetProps, duration, easing);
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
   * 清除所有动画
   */
  clearAnimations() {
    this.animations.forEach(anim => anim.pause());
    this.animations.clear();
  }
  
  /**
   * 获取动画进度
   */
  getAnimationProgress(id) {
    const anim = this.animations.get(id);
    return anim ? anim.progress : 0;
  }
  
  /**
   * 设置动画速度
   */
  setAnimationSpeed(speed) {
    this.animations.forEach(anim => {
      anim.speed = speed;
    });
  }
}

/**
 * SVG渲染器类
 * 负责将图形渲染为SVG格式，用于导出
 */
export class SVGRenderer {
  constructor() {
    this.svgNS = 'http://www.w3.org/2000/svg';
  }
  
  /**
   * 创建SVG元素
   */
  createSVGElement(tagName) {
    return document.createElementNS(this.svgNS, tagName);
  }
  
  /**
   * 设置SVG元素属性
   */
  setAttributes(element, attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      if (value !== undefined && value !== null) {
        element.setAttribute(key, value);
      }
    }
  }
  
  /**
   * 创建SVG根元素
   */
  createSVG(width, height) {
    const svg = this.createSVGElement('svg');
    this.setAttributes(svg, {
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      xmlns: this.svgNS
    });
    return svg;
  }
  
  /**
   * 创建节点元素
   */
  createNodeElement(node) {
    let element;
    
    if (node.type === 'circle' || !node.type) {
      element = this.createSVGElement('circle');
      this.setAttributes(element, {
        cx: node.x,
        cy: node.y,
        r: node.size || 20,
        fill: node.style?.fill || '#3f51b5',
        stroke: node.style?.stroke || '#ffffff',
        strokeWidth: node.style?.lineWidth || 2
      });
    } else if (node.type === 'square') {
      const size = node.size || 20;
      element = this.createSVGElement('rect');
      this.setAttributes(element, {
        x: node.x - size,
        y: node.y - size,
        width: size * 2,
        height: size * 2,
        rx: node.style?.radius || 0,
        ry: node.style?.radius || 0,
        fill: node.style?.fill || '#ff4081',
        stroke: node.style?.stroke || '#ffffff',
        strokeWidth: node.style?.lineWidth || 2
      });
    }
    
    // 如果有标签，添加文本元素
    if (element && node.label) {
      const textElement = this.createSVGElement('text');
      this.setAttributes(textElement, {
        x: node.x,
        y: node.y,
        textAnchor: 'middle',
        dominantBaseline: 'middle',
        fill: node.style?.labelFill || '#ffffff',
        fontSize: node.style?.labelFontSize || '14px',
        fontWeight: node.style?.labelFontWeight || 'bold'
      });
      textElement.textContent = node.label;
      element.appendChild(textElement);
    }
    
    return element;
  }
  
  /**
   * 创建边元素
   */
  createEdgeElement(edge, sourceNode, targetNode) {
    const element = this.createSVGElement('path');
    
    // 计算路径
    let d = `M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`;
    
    // 设置边的样式
    this.setAttributes(element, {
      d,
      fill: 'none',
      stroke: edge.style?.stroke || '#999999',
      strokeWidth: edge.style?.lineWidth || 2
    });
    
    // 如果需要箭头，添加标记引用
    if (edge.style?.arrow) {
      // 箭头标记需要预先定义在defs中
      this.setAttributes(element, {
        markerEnd: 'url(#arrowhead)'
      });
    }
    
    return element;
  }
  
  /**
   * 创建箭头标记定义
   */
  createArrowheadMarker() {
    const defs = this.createSVGElement('defs');
    const marker = this.createSVGElement('marker');
    
    this.setAttributes(marker, {
      id: 'arrowhead',
      markerWidth: 10,
      markerHeight: 7,
      refX: 9,
      refY: 3.5,
      orient: 'auto'
    });
    
    const polygon = this.createSVGElement('polygon');
    this.setAttributes(polygon, {
      points: '0 0, 10 3.5, 0 7',
      fill: '#999999'
    });
    
    marker.appendChild(polygon);
    defs.appendChild(marker);
    
    return defs;
  }
  
  /**
   * 将图数据转换为SVG
   */
  graphToSVG(nodes, edges, width, height) {
    const svg = this.createSVG(width, height);
    
    // 添加箭头标记定义
    svg.appendChild(this.createArrowheadMarker());
    
    // 首先创建边元素，因为它们应该在节点下面
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const edgeElement = this.createEdgeElement(edge, sourceNode, targetNode);
        svg.appendChild(edgeElement);
      }
    });
    
    // 然后创建节点元素
    nodes.forEach(node => {
      const nodeElement = this.createNodeElement(node);
      if (nodeElement) {
        svg.appendChild(nodeElement);
      }
    });
    
    return svg;
  }
  
  /**
   * 将SVG转换为字符串
   */
  svgToString(svgElement) {
    return new XMLSerializer().serializeToString(svgElement);
  }
}

/**
 * 几何工具函数
 */
export const geometry = {
  /**
   * 计算两点间距离
   */
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
  
  /**
   * 计算两点间的角度
   */
  angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },
  
  /**
   * 将极坐标转换为笛卡尔坐标
   */
  polarToCartesian(centerX, centerY, radius, angleInRadians) {
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  },
  
  /**
   * 检查点是否在矩形内
   */
  pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  },
  
  /**
   * 检查点是否在圆内
   */
  pointInCircle(px, py, cx, cy, radius) {
    return this.distance(px, py, cx, cy) <= radius;
  },
  
  /**
   * 计算线段与点的最近距离
   */
  distancePointToLine(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
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
    
    return this.distance(px, py, xx, yy);
  }
};

/**
 * 导出图形对象
 */
export class GraphRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvasRenderer = new CanvasRenderer(this.ctx, canvas.width, canvas.height);
    this.svgRenderer = new SVGRenderer();
    
    // 存储当前的图状态
    this.nodes = [];
    this.edges = [];
    
    // 存储动画中的元素
    this.animatedNodes = new Map();
    this.animatedEdges = new Map();
    
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
    this.render();
  }
  
  /**
   * 渲染完整的图
   */
  render() {
    // 清空画布
    this.canvasRenderer.clear();
    
    // 绘制边
    this.edges.forEach(edge => {
      const sourceNode = this.nodes.find(n => n.id === edge.source);
      const targetNode = this.nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        // 检查是否有动画中的边
        const animatedEdge = this.animatedEdges.get(edge.id);
        if (animatedEdge) {
          // 使用动画中的属性
          const edgeStyle = { 
            ...this.defaultEdgeStyle, 
            ...edge.style, 
            ...animatedEdge 
          };
          
          if (edgeStyle.arrow) {
            this.canvasRenderer.drawArrow(
              animatedEdge.sourceX || sourceNode.x,
              animatedEdge.sourceY || sourceNode.y,
              animatedEdge.targetX || targetNode.x,
              animatedEdge.targetY || targetNode.y,
              edgeStyle
            );
          } else {
            this.canvasRenderer.drawLine(
              animatedEdge.sourceX || sourceNode.x,
              animatedEdge.sourceY || sourceNode.y,
              animatedEdge.targetX || targetNode.x,
              animatedEdge.targetY || targetNode.y,
              edgeStyle
            );
          }
        } else {
          // 使用原始属性
          const edgeStyle = { ...this.defaultEdgeStyle, ...edge.style };
          
          if (edgeStyle.arrow) {
            this.canvasRenderer.drawArrow(
              sourceNode.x,
              sourceNode.y,
              targetNode.x,
              targetNode.y,
              edgeStyle
            );
          } else {
            this.canvasRenderer.drawLine(
              sourceNode.x,
              sourceNode.y,
              targetNode.x,
              targetNode.y,
              edgeStyle
            );
          }
        }
      }
    });
    
    // 绘制节点
    this.nodes.forEach(node => {
      // 检查是否有动画中的节点
      const animatedNode = this.animatedNodes.get(node.id);
      if (animatedNode) {
        // 使用动画中的属性
        const nodeStyle = { 
          ...this.defaultNodeStyle, 
          ...node.style, 
          ...animatedNode 
        };
        
        if (node.type === 'circle' || !node.type) {
          this.canvasRenderer.drawCircle(
            animatedNode.x || node.x,
            animatedNode.y || node.y,
            animatedNode.size || node.size || 20,
            nodeStyle
          );
        } else if (node.type === 'square') {
          const size = animatedNode.size || node.size || 20;
          this.canvasRenderer.drawRect(
            (animatedNode.x || node.x) - size,
            (animatedNode.y || node.y) - size,
            size * 2,
            size * 2,
            {
              ...nodeStyle,
              radius: nodeStyle.radius || 0
            }
          );
        }
        
        // 绘制标签
        if (node.label) {
          this.canvasRenderer.drawText(
            node.label,
            animatedNode.x || node.x,
            animatedNode.y || node.y,
            {
              fill: nodeStyle.labelFill || '#ffffff',
              fontSize: nodeStyle.labelFontSize || 14,
              textAlign: 'center',
              textBaseline: 'middle'
            }
          );
        }
      } else {
        // 使用原始属性
        const nodeStyle = { ...this.defaultNodeStyle, ...node.style };
        
        if (node.type === 'circle' || !node.type) {
          this.canvasRenderer.drawCircle(
            node.x,
            node.y,
            node.size || 20,
            nodeStyle
          );
        } else if (node.type === 'square') {
          const size = node.size || 20;
          this.canvasRenderer.drawRect(
            node.x - size,
            node.y - size,
            size * 2,
            size * 2,
            {
              ...nodeStyle,
              radius: nodeStyle.radius || 0
            }
          );
        }
        
        // 绘制标签
        if (node.label) {
          this.canvasRenderer.drawText(
            node.label,
            node.x,
            node.y,
            {
              fill: nodeStyle.labelFill || '#ffffff',
              fontSize: nodeStyle.labelFontSize || 14,
              textAlign: 'center',
              textBaseline: 'middle'
            }
          );
        }
      }
    });
  }
  
  /**
   * 添加节点动画
   */
  animateNode(nodeId, targetProps, duration = 500, easing = 'easeOutQuad', onComplete) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // 初始属性
    const initialProps = {
      x: node.x,
      y: node.y,
      size: node.size,
      fill: node.style?.fill,
      stroke: node.style?.stroke,
      opacity: 1
    };
    
    // 创建动画
    const animTarget = this.canvasRenderer.animateNode(
      `node_${nodeId}`,
      initialProps,
      targetProps,
      duration,
      easing
    );
    
    // 存储动画目标
    this.animatedNodes.set(nodeId, animTarget);
    
    // 当动画完成时的回调
    if (onComplete) {
      setTimeout(() => {
        this.animatedNodes.delete(nodeId);
        onComplete();
      }, duration);
    } else {
      setTimeout(() => {
        this.animatedNodes.delete(nodeId);
      }, duration);
    }
    
    // 启动动画循环
    this.startAnimationLoop();
  }
  
  /**
   * 添加边动画
   */
  animateEdge(edgeId, targetProps, duration = 500, easing = 'easeOutQuad', onComplete) {
    const edge = this.edges.find(e => e.id === edgeId);
    if (!edge) return;
    
    const sourceNode = this.nodes.find(n => n.id === edge.source);
    const targetNode = this.nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return;
    
    // 初始属性
    const initialProps = {
      sourceX: sourceNode.x,
      sourceY: sourceNode.y,
      targetX: targetNode.x,
      targetY: targetNode.y,
      stroke: edge.style?.stroke,
      lineWidth: edge.style?.lineWidth,
      opacity: 1
    };
    
    // 创建动画
    const animTarget = this.canvasRenderer.animateEdge(
      `edge_${edgeId}`,
      initialProps,
      targetProps,
      duration,
      easing
    );
    
    // 存储动画目标
    this.animatedEdges.set(edgeId, animTarget);
    
    // 当动画完成时的回调
    if (onComplete) {
      setTimeout(() => {
        this.animatedEdges.delete(edgeId);
        onComplete();
      }, duration);
    } else {
      setTimeout(() => {
        this.animatedEdges.delete(edgeId);
      }, duration);
    }
    
    // 启动动画循环
    this.startAnimationLoop();
  }
  
  /**
   * 开始动画循环
   */
  startAnimationLoop() {
    // 简单实现：使用requestAnimationFrame持续渲染，直到没有活动的动画
    const animate = () => {
      this.render();
      
      if (this.animatedNodes.size > 0 || this.animatedEdges.size > 0) {
        requestAnimationFrame(animate);
      }
    };
    
    // 只有在没有活动循环时才启动新的循环
    if (!this.isAnimating) {
      this.isAnimating = true;
      animate();
      
      // 设置一个检查点，确保即使没有动画也能停止循环
      setTimeout(() => {
        if (this.animatedNodes.size === 0 && this.animatedEdges.size === 0) {
          this.isAnimating = false;
        }
      }, 1000);
    }
  }
  
  /**
   * 导出为SVG字符串
   */
  exportAsSVG() {
    const svg = this.svgRenderer.graphToSVG(
      this.nodes,
      this.edges,
      this.canvas.width,
      this.canvas.height
    );
    
    return this.svgRenderer.svgToString(svg);
  }
}

/**
 * 生成示例图数据
 * 返回包含nodes和edges的对象，可直接用于初始化AnimateGraph组件
 */
const generateExampleGraph = (width = 800, height = 600) => {
  // 创建节点
  const nodes = [
    { id: '1', label: '节点1', x: width * 0.3, y: height * 0.3, size: 30, type: 'circle', style: { fill: '#4CAF50' } },
    { id: '2', label: '节点2', x: width * 0.7, y: height * 0.3, size: 25, type: 'circle', style: { fill: '#2196F3' } },
    { id: '3', label: '节点3', x: width * 0.3, y: height * 0.7, size: 35, type: 'square', style: { fill: '#FF9800' } },
    { id: '4', label: '节点4', x: width * 0.7, y: height * 0.7, size: 28, type: 'circle', style: { fill: '#9C27B0' } },
    { id: '5', label: '节点5', x: width * 0.5, y: height * 0.5, size: 32, type: 'square', style: { fill: '#F44336' } },
  ];
  
  // 创建边
  const edges = [
    { id: 'e1', source: '1', target: '2', style: { stroke: '#333', lineWidth: 2, arrow: true } },
    { id: 'e2', source: '2', target: '4', style: { stroke: '#555', lineWidth: 1.5, arrow: true } },
    { id: 'e3', source: '4', target: '3', style: { stroke: '#777', lineWidth: 1.5, arrow: true } },
    { id: 'e4', source: '3', target: '1', style: { stroke: '#999', lineWidth: 1.5, arrow: true } },
    { id: 'e5', source: '1', target: '5', style: { stroke: '#000', lineWidth: 2, arrow: true } },
    { id: 'e6', source: '2', target: '5', style: { stroke: '#000', lineWidth: 2, arrow: true } },
    { id: 'e7', source: '5', target: '3', style: { stroke: '#000', lineWidth: 2, arrow: true } },
    { id: 'e8', source: '5', target: '4', style: { stroke: '#000', lineWidth: 2, arrow: true } },
  ];
  
  // 默认样式
  const nodesStyle = {
    stroke: '#000000',
    lineWidth: 2,
    labelFill: '#ffffff',
    labelFontSize: 14
  };
  
  const edgesStyle = {
    stroke: '#666666',
    lineWidth: 2,
    arrow: true
  };
  
  return { nodes, edges, nodesStyle, edgesStyle };
};

/**
 * 导出组件和工具
 */
export const drawingTools = {
  CanvasRenderer,
  SVGRenderer,
  GraphRenderer,
  geometry,
  generateExampleGraph
};

export default drawingTools;