// drawingTools.js - 提供底层的绘图功能，支持多种渲染目标
import anime from 'animejs';

// 定义GraphRenderer接口类
class GraphRenderer {
  constructor() {
    // 存储所有可动画元素
    this.elements = {
      nodes: [],
      edges: []
    };
    this.animations = [];
  }

  // 清除所有动画
  clearAnimations() {
    this.animations.forEach(anim => anim.pause());
    this.animations = [];
  }
  // 绘制线条
  drawLine(ctx, x1, y1, x2, y2, options = {}) {
    throw new Error('Method not implemented');
  }
  
  // 绘制箭头
  drawArrow(ctx, x1, y1, x2, y2, options = {}) {
    throw new Error('Method not implemented');
  }
  
  // 绘制圆
  drawCircle(ctx, x, y, radius, options = {}) {
    throw new Error('Method not implemented');
  }
  
  // 绘制矩形
  drawRect(ctx, x, y, width, height, options = {}) {
    throw new Error('Method not implemented');
  }
  
  // 绘制多边形
  drawPolygon(ctx, points, options = {}) {
    throw new Error('Method not implemented');
  }
  
  // 绘制贝塞尔曲线
  drawBezierCurve(ctx, x1, y1, cx1, cy1, cx2, cy2, x2, y2, options = {}) {
    throw new Error('Method not implemented');
  }
  
  // 绘制文本
  drawText(ctx, text, x, y, options = {}) {
    throw new Error('Method not implemented');
  }

  // 创建点动画
  animateNode(node, properties, duration = 1000, easing = 'easeOutQuart', delay = 0) {
    const animation = anime({
      targets: node,
      ...properties,
      duration,
      easing,
      delay,
      update: () => {
        if (this.onUpdate) this.onUpdate();
      }
    });
    this.animations.push(animation);
    return animation;
  }

  // 创建边动画
  animateEdge(edge, properties, duration = 1000, easing = 'easeOutQuart', delay = 0) {
    const animation = anime({
      targets: edge,
      ...properties,
      duration,
      easing,
      delay,
      update: () => {
        if (this.onUpdate) this.onUpdate();
      }
    });
    this.animations.push(animation);
    return animation;
  }
}

// 点类
class GraphNode {
  constructor(id, x, y, radius = 10, options = {}) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.options = { ...options };
    this.data = {}; // 存储额外数据
    this.visible = true;
  }

  // 更新位置
  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // 更新样式
  updateStyle(options) {
    this.options = { ...this.options, ...options };
  }
}

// 边类
class GraphEdge {
  constructor(id, source, target, options = {}) {
    this.id = id;
    this.source = source;
    this.target = target;
    this.options = { ...options };
    this.data = {}; // 存储额外数据
    this.visible = true;
  }

  // 获取起点坐标
  getSourcePosition() {
    return { x: this.source.x, y: this.source.y };
  }

  // 获取终点坐标
  getTargetPosition() {
    return { x: this.target.x, y: this.target.y };
  }

  // 更新样式
  updateStyle(options) {
    this.options = { ...this.options, ...options };
  }
}

// CanvasRenderer实现，用于HTML Canvas渲染
class CanvasRenderer extends GraphRenderer {
  constructor() {
    super();
    this.onUpdate = null;
  }

  // 创建点
  createNode(id, x, y, radius = 10, options = {}) {
    const node = new GraphNode(id, x, y, radius, options);
    this.elements.nodes.push(node);
    return node;
  }

  // 创建边
  createEdge(id, source, target, options = {}) {
    const edge = new GraphEdge(id, source, target, options);
    this.elements.edges.push(edge);
    return edge;
  }

  // 渲染所有元素
  render(ctx) {
    // 先渲染边
    this.elements.edges.forEach(edge => {
      if (edge.visible) {
        const sourcePos = edge.getSourcePosition();
        const targetPos = edge.getTargetPosition();
        
        if (edge.options.arrow) {
          this.drawArrow(ctx, sourcePos.x, sourcePos.y, targetPos.x, targetPos.y, edge.options);
        } else {
          this.drawLine(ctx, sourcePos.x, sourcePos.y, targetPos.x, targetPos.y, edge.options);
        }
      }
    });

    // 再渲染点
    this.elements.nodes.forEach(node => {
      if (node.visible) {
        this.drawCircle(ctx, node.x, node.y, node.radius, node.options);
        
        // 如果有点标签，渲染标签
        if (node.options.label) {
          this.drawText(ctx, node.options.label, node.x, node.y, {
            ...node.options,
            textAlign: 'center',
            textBaseline: 'middle',
            fill: node.options.labelFill || '#ffffff'
          });
        }
      }
    });
  }

  // 清空画布
  clear(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
  }
  // 绘制线条
  drawLine(ctx, x1, y1, x2, y2, options = {}) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    
    // 设置样式选项
    ctx.strokeStyle = options.stroke || '#000000';
    ctx.lineWidth = options.strokeWidth || 1;
    ctx.globalAlpha = options.alpha !== undefined ? options.alpha : 1;
    
    if (options.dashArray) {
      ctx.setLineDash(options.dashArray);
    }
    
    ctx.stroke();
    
    if (options.dashArray) {
      ctx.setLineDash([]); // 重置虚线设置
    }
  }
  
  // 绘制箭头
  drawArrow(ctx, x1, y1, x2, y2, options = {}) {
    // 绘制主线
    this.drawLine(ctx, x1, y1, x2, y2, options);
    
    // 绘制箭头
    const headLength = options.headLength || 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    
    ctx.strokeStyle = options.stroke || '#000000';
    ctx.lineWidth = options.strokeWidth || 1;
    ctx.stroke();
  }
  
  // 绘制圆
  drawCircle(ctx, x, y, radius, options = {}) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    
    // 填充样式
    if (options.fill) {
      ctx.fillStyle = options.fill;
      ctx.fill();
    }
    
    // 边框样式
    if (options.stroke) {
      ctx.strokeStyle = options.stroke;
      ctx.lineWidth = options.strokeWidth || 1;
      ctx.stroke();
    }
    
    ctx.globalAlpha = options.alpha !== undefined ? options.alpha : 1;
  }
  
  // 绘制矩形
  drawRect(ctx, x, y, width, height, options = {}) {
    ctx.beginPath();
    if (options.radius) {
      const rx = options.radius.x || options.radius;
      const ry = options.radius.y || options.radius;
      ctx.roundRect(x, y, width, height, [rx, ry]);
    } else {
      ctx.rect(x, y, width, height);
    }
    
    // 填充样式
    if (options.fill) {
      ctx.fillStyle = options.fill;
      ctx.fill();
    }
    
    // 边框样式
    if (options.stroke) {
      ctx.strokeStyle = options.stroke;
      ctx.lineWidth = options.strokeWidth || 1;
      ctx.stroke();
    }
    
    ctx.globalAlpha = options.alpha !== undefined ? options.alpha : 1;
  }
  
  // 绘制多边形
  drawPolygon(ctx, points, options = {}) {
    if (points.length < 3) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.closePath();
    
    // 填充样式
    if (options.fill) {
      ctx.fillStyle = options.fill;
      ctx.fill();
    }
    
    // 边框样式
    if (options.stroke) {
      ctx.strokeStyle = options.stroke;
      ctx.lineWidth = options.strokeWidth || 1;
      ctx.stroke();
    }
    
    ctx.globalAlpha = options.alpha !== undefined ? options.alpha : 1;
  }
  
  // 绘制贝塞尔曲线
  drawBezierCurve(ctx, x1, y1, cx1, cy1, cx2, cy2, x2, y2, options = {}) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    
    ctx.strokeStyle = options.stroke || '#000000';
    ctx.lineWidth = options.strokeWidth || 1;
    
    if (options.dashArray) {
      ctx.setLineDash(options.dashArray);
    }
    
    ctx.stroke();
    
    if (options.dashArray) {
      ctx.setLineDash([]); // 重置虚线设置
    }
  }
  
  // 绘制文本
  drawText(ctx, text, x, y, options = {}) {
    ctx.font = options.font || '14px Arial';
    ctx.fillStyle = options.fill || '#000000';
    ctx.textAlign = options.textAlign || 'start';
    ctx.textBaseline = options.textBaseline || 'alphabetic';
    ctx.globalAlpha = options.alpha !== undefined ? options.alpha : 1;
    
    if (options.stroke) {
      ctx.strokeStyle = options.stroke;
      ctx.lineWidth = options.strokeWidth || 1;
      ctx.strokeText(text, x, y);
    } else {
      ctx.fillText(text, x, y);
    }
  }
}

// SVGRenderer实现，用于SVG格式导出
class SVGRenderer extends GraphRenderer {
  constructor(svgElement) {
    super();
    this.svg = svgElement;
    this.onUpdate = null;
    this.domElements = new Map(); // 存储DOM元素映射
  }

  // 创建点
  createNode(id, x, y, radius = 10, options = {}) {
    const node = new GraphNode(id, x, y, radius, options);
    this.elements.nodes.push(node);
    
    // 创建对应的SVG元素
    const circle = this.drawCircle(null, x, y, radius, options);
    this.domElements.set(node, circle);
    
    // 如果有点标签
    if (options.label) {
      const text = this.drawText(null, options.label, x, y, {
        ...options,
        textAlign: 'middle',
        textBaseline: 'middle',
        fill: options.labelFill || '#ffffff'
      });
      // 存储文本元素
      if (!node.domElements) node.domElements = [];
      node.domElements.push(text);
    }
    
    return node;
  }

  // 创建边
  createEdge(id, source, target, options = {}) {
    const edge = new GraphEdge(id, source, target, options);
    this.elements.edges.push(edge);
    
    // 创建对应的SVG元素
    const line = options.arrow 
      ? this.drawArrow(null, source.x, source.y, target.x, target.y, options)
      : this.drawLine(null, source.x, source.y, target.x, target.y, options);
    this.domElements.set(edge, line);
    
    return edge;
  }

  // 更新元素位置和样式
  updateElement(element) {
    const domElement = this.domElements.get(element);
    if (!domElement) return;

    if (element instanceof GraphNode) {
      // 更新节点位置
      domElement.setAttribute('cx', element.x);
      domElement.setAttribute('cy', element.y);
      
      // 更新节点半径
      domElement.setAttribute('r', element.radius);
      
      // 更新样式
      if (element.options.fill) domElement.setAttribute('fill', element.options.fill);
      if (element.options.stroke) domElement.setAttribute('stroke', element.options.stroke);
      if (element.options.strokeWidth) domElement.setAttribute('stroke-width', element.options.strokeWidth);
      if (element.options.alpha !== undefined) domElement.setAttribute('opacity', element.options.alpha);
      
      // 更新标签位置
      if (element.domElements && element.domElements.length > 0) {
        element.domElements.forEach(textEl => {
          textEl.setAttribute('x', element.x);
          textEl.setAttribute('y', element.y);
        });
      }
    } 
    else if (element instanceof GraphEdge) {
      // 更新边的位置
      const sourcePos = element.getSourcePosition();
      const targetPos = element.getTargetPosition();
      
      domElement.setAttribute('x1', sourcePos.x);
      domElement.setAttribute('y1', sourcePos.y);
      domElement.setAttribute('x2', targetPos.x);
      domElement.setAttribute('y2', targetPos.y);
      
      // 更新样式
      if (element.options.stroke) domElement.setAttribute('stroke', element.options.stroke);
      if (element.options.strokeWidth) domElement.setAttribute('stroke-width', element.options.strokeWidth);
      if (element.options.alpha !== undefined) domElement.setAttribute('opacity', element.options.alpha);
    }
  }

  // 重写动画方法，增加DOM更新
  animateNode(node, properties, duration = 1000, easing = 'easeOutQuart', delay = 0) {
    const animation = anime({
      targets: node,
      ...properties,
      duration,
      easing,
      delay,
      update: () => {
        this.updateElement(node);
        if (this.onUpdate) this.onUpdate();
      }
    });
    this.animations.push(animation);
    return animation;
  }

  animateEdge(edge, properties, duration = 1000, easing = 'easeOutQuart', delay = 0) {
    const animation = anime({
      targets: edge,
      ...properties,
      duration,
      easing,
      delay,
      update: () => {
        this.updateElement(edge);
        if (this.onUpdate) this.onUpdate();
      }
    });
    this.animations.push(animation);
    return animation;
  }

  // 绘制线条
  drawLine(ctx, x1, y1, x2, y2, options = {}) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', options.stroke || '#000000');
    line.setAttribute('stroke-width', options.strokeWidth || 1);
    
    if (options.alpha !== undefined && options.alpha < 1) {
      line.setAttribute('opacity', options.alpha);
    }
    
    if (options.dashArray) {
      line.setAttribute('stroke-dasharray', options.dashArray.join(' '));
    }
    
    this.svg.appendChild(line);
    return line;
  }
  
  // 绘制箭头
  drawArrow(ctx, x1, y1, x2, y2, options = {}) {
    // 创建箭头标记定义
    const markerId = 'arrowhead';
    let marker = this.svg.querySelector(`marker#${markerId}`);
    
    if (!marker) {
      marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', markerId);
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '7');
      marker.setAttribute('refX', '9');
      marker.setAttribute('refY', '3.5');
      marker.setAttribute('orient', 'auto');
      
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
      polygon.setAttribute('fill', options.stroke || '#000000');
      marker.appendChild(polygon);
      
      const defs = this.svg.querySelector('defs') || 
        document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.appendChild(marker);
      
      if (!this.svg.querySelector('defs')) {
        this.svg.insertBefore(defs, this.svg.firstChild);
      }
    }
    
    // 绘制带箭头的线
    const line = this.drawLine(ctx, x1, y1, x2, y2, options);
    line.setAttribute('marker-end', `url(#${markerId})`);
    
    return line;
  }
  
  // 绘制圆
  drawCircle(ctx, x, y, radius, options = {}) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', radius);
    
    if (options.fill) {
      circle.setAttribute('fill', options.fill);
    }
    
    if (options.stroke) {
      circle.setAttribute('stroke', options.stroke);
      circle.setAttribute('stroke-width', options.strokeWidth || 1);
    }
    
    if (options.alpha !== undefined && options.alpha < 1) {
      circle.setAttribute('opacity', options.alpha);
    }
    
    if (ctx) {
      this.svg.appendChild(circle);
    }
    return circle;
  }
  
  // 绘制矩形
  drawRect(ctx, x, y, width, height, options = {}) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    
    if (options.radius) {
      const rx = options.radius.x || options.radius;
      const ry = options.radius.y || options.radius;
      rect.setAttribute('rx', rx);
      rect.setAttribute('ry', ry);
    }
    
    if (options.fill) {
      rect.setAttribute('fill', options.fill);
    }
    
    if (options.stroke) {
      rect.setAttribute('stroke', options.stroke);
      rect.setAttribute('stroke-width', options.strokeWidth || 1);
    }
    
    if (options.alpha !== undefined && options.alpha < 1) {
      rect.setAttribute('opacity', options.alpha);
    }
    
    if (ctx) {
      this.svg.appendChild(rect);
    }
    return rect;
  }
  
  // 绘制多边形
  drawPolygon(ctx, points, options = {}) {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
    polygon.setAttribute('points', pointsStr);
    
    if (options.fill) {
      polygon.setAttribute('fill', options.fill);
    }
    
    if (options.stroke) {
      polygon.setAttribute('stroke', options.stroke);
      polygon.setAttribute('stroke-width', options.strokeWidth || 1);
    }
    
    if (options.alpha !== undefined && options.alpha < 1) {
      polygon.setAttribute('opacity', options.alpha);
    }
    
    if (ctx) {
      this.svg.appendChild(polygon);
    }
    return polygon;
  }
  
  // 绘制贝塞尔曲线
  drawBezierCurve(ctx, x1, y1, cx1, cy1, cx2, cy2, x2, y2, options = {}) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', options.stroke || '#000000');
    path.setAttribute('stroke-width', options.strokeWidth || 1);
    
    if (options.dashArray) {
      path.setAttribute('stroke-dasharray', options.dashArray.join(' '));
    }
    
    if (options.alpha !== undefined && options.alpha < 1) {
      path.setAttribute('opacity', options.alpha);
    }
    
    if (ctx) {
      this.svg.appendChild(path);
    }
    return path;
  }
  
  // 绘制文本
  drawText(ctx, text, x, y, options = {}) {
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', x);
    textEl.setAttribute('y', y);
    textEl.setAttribute('fill', options.fill || '#000000');
    textEl.setAttribute('font-family', options.font ? options.font.split(' ')[1] : 'Arial');
    textEl.setAttribute('font-size', options.font ? options.font.split(' ')[0] : '14px');
    textEl.setAttribute('text-anchor', options.textAlign || 'start');
    textEl.setAttribute('dominant-baseline', options.textBaseline || 'alphabetic');
    
    if (options.alpha !== undefined && options.alpha < 1) {
      textEl.setAttribute('opacity', options.alpha);
    }
    
    if (options.stroke) {
      textEl.setAttribute('stroke', options.stroke);
      textEl.setAttribute('stroke-width', options.strokeWidth || 1);
    }
    
    textEl.textContent = text;
    
    if (ctx) {
      this.svg.appendChild(textEl);
    }
    return textEl;
  }
}

// 几何工具函数
const geometry = {
  // 计算点到线段的距离
  pointToLineDistance: (px, py, x1, y1, x2, y2) => {
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
  },
  
  // 判断点是否在线段上
  isPointOnLine: (px, py, x1, y1, x2, y2, tolerance = 5) => {
    const d1 = Math.sqrt(Math.pow(px - x1, 2) + Math.pow(py - y1, 2));
    const d2 = Math.sqrt(Math.pow(px - x2, 2) + Math.pow(py - y2, 2));
    const lineLen = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    // 点到线段两端点的距离之和近似等于线段长度
    return Math.abs(d1 + d2 - lineLen) < tolerance;
  },
  
  // 判断点是否在圆内
  isPointInCircle: (px, py, cx, cy, radius) => {
    return Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2)) <= radius;
  },
  
  // 判断点是否在矩形内
  isPointInRect: (px, py, x, y, width, height) => {
    return px >= x && px <= x + width && py >= y && py <= y + height;
  }
};

// 导出类和工具函数
export {
  GraphRenderer,
  GraphNode,
  GraphEdge,
  // CanvasRenderer 不再导出，因为它未在主应用中使用
  SVGRenderer,
  geometry
};