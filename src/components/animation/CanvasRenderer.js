// CanvasRenderer.js - 负责在Canvas上绘制各种图形元素
import * as fabric from 'fabric';

// 配置Fabric.js以提高动画性能
fabric.Object.prototype.objectCaching = false; // ✅ 全局关闭缓存
fabric.Canvas.prototype.renderOnAddRemove = false; // 禁用添加/删除时的自动渲染

/**
 * Canvas渲染器类
 * 负责在Canvas上绘制各种图形元素
 */
export class CanvasRenderer {
  constructor(canvas, width, height) {
    this.ctx = canvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.animations = new Map(); // 存储所有活动的动画
    this.canvas = canvas;
    
    // 设置canvas尺寸
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width;
    canvas.height = height;
    
    // 初始化fabric画布，如果之前已经初始化则先销毁
    if (this.fabricCanvas) {
      this.fabricCanvas.dispose();
    }
    this.fabricCanvas = new fabric.Canvas(canvas, {
      selection: false, // 禁用默认选择功能
      preserveObjectStacking: true
    });
    this.fabricCanvas.setWidth(width);
    this.fabricCanvas.setHeight(height);
  }
  
  /**
   * 销毁CanvasRenderer实例，清理资源
   */
  dispose() {
    if (this.fabricCanvas) {
      this.fabricCanvas.dispose();
      this.fabricCanvas = null;
    }
    this.animations.clear();
    this.ctx = null;
    this.canvas = null;
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
   * 使用fabric.js添加高亮指示器
   */
  addHighlightIndicator(id, x, y, radius = 30, color = '#ffeb3b', lineWidth = 3) {
    // 创建圆形对象
    const circle = new fabric.Circle({
      left: x,
      top: y,
      radius: radius,
      stroke: color,
      strokeWidth: lineWidth,
      fill: 'transparent',
      selectable: false,
      hoverCursor: 'default',
      originX: 'center',
      originY: 'center'
    });
    
    // 存储指示器
    this.fabricCanvas.add(circle);
    
    // 保存引用以便后续移除
    this.animations.set(id, { type: 'highlight', object: circle });
    
    // 渲染画布
    this.fabricCanvas.renderAll();
  }
  
  /**
   * 使用fabric.js添加脉冲动画指示器
   */
  addPulseIndicator(id, x, y, radius = 30, color = '#ffeb3b', duration = 3000) {
    // 创建基础圆
    const baseCircle = new fabric.Circle({
      left: x,
      top: y,
      radius: radius * 0.8,
      fill: color,
      opacity: 0.6,
      selectable: false,
      hoverCursor: 'default',
      originX: 'center',
      originY: 'center'
    });
    
    // 创建脉冲圆
    const pulseCircle = new fabric.Circle({
      left: x,
      top: y,
      radius: radius * 1.5,
      stroke: color,
      strokeWidth: 2,
      fill: 'transparent',
      opacity: 0.8,
      selectable: false,
      hoverCursor: 'default',
      originX: 'center',
      originY: 'center'
    });
    
    // 添加到画布
    this.fabricCanvas.add(baseCircle);
    this.fabricCanvas.add(pulseCircle);
    
    // 保存引用
    this.animations.set(id, {
      type: 'pulse',
      objects: [baseCircle, pulseCircle],
      x: x,
      y: y,
      radius: radius,
      color: color,
      duration: duration
    });
    
    // 开始脉冲动画
    this._animatePulse(id, pulseCircle, radius, duration);
    
    // 渲染画布
    this.fabricCanvas.renderAll();
  }
  
  /**
   * 脉冲动画的实现
   */
  _animatePulse(id, pulseCircle, baseRadius, duration) {
    // 动画配置
    const startRadius = baseRadius * 1.5;
    const endRadius = baseRadius * 2.5;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 计算当前半径和透明度
      const currentRadius = startRadius + (endRadius - startRadius) * progress;
      const opacity = 0.8 * (1 - progress);
      
      // 更新脉冲圆属性（使用originX: 'center'和originY: 'center'后，不需要调整left和top）
      pulseCircle.set({
        radius: currentRadius,
        opacity: opacity
      });
      
      // 应用更新
      pulseCircle.setCoords();
      this.fabricCanvas.renderAll();
      
      // 继续动画或结束
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 动画结束后检查是否需要重复
        const animation = this.animations.get(id);
        if (animation) {
          // 创建新的脉冲圆
          const newPulseCircle = new fabric.Circle({
            left: animation.x,
            top: animation.y,
            radius: baseRadius * 1.5,
            stroke: animation.color,
            strokeWidth: 2,
            fill: 'transparent',
            opacity: 0.8,
            selectable: false,
            hoverCursor: 'default',
            originX: 'center',
            originY: 'center'
          });
          
          // 移除旧的脉冲圆并添加新的
          this.fabricCanvas.remove(pulseCircle);
          this.fabricCanvas.add(newPulseCircle);
          
          // 更新引用并开始新动画
          animation.objects[1] = newPulseCircle;
          this._animatePulse(id, newPulseCircle, baseRadius, duration);
        }
      }
    };
    
    // 开始动画
    requestAnimationFrame(animate);
  }
  
  /**
   * 移除指示器
   */
  removeIndicator(id) {
    const animation = this.animations.get(id);
    if (!animation) return;
    
    // 移除所有相关的fabric对象
    if (animation.type === 'highlight') {
      this.fabricCanvas.remove(animation.object);
    } else if (animation.type === 'pulse' && animation.objects) {
      animation.objects.forEach(obj => {
        this.fabricCanvas.remove(obj);
      });
    }
    
    // 从动画映射中删除
    this.animations.delete(id);
    
    // 渲染画布
    this.fabricCanvas.renderAll();
  }
  
  /**
   * 清除所有指示器
   */
  clearIndicators() {
    // 移除所有动画对象
    this.animations.forEach((animation, id) => {
      this.removeIndicator(id);
    });
  }
  
  /**
   * 重新渲染所有指示器
   */
  renderAllIndicators() {
    this.fabricCanvas.renderAll();
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

export default CanvasRenderer;