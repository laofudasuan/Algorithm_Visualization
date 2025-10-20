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
    this.canvas = null;
  }
  
  /**
   * 清空画布
   */
  clear() {
    this.fabricCanvas.clear();
    this.fabricCanvas.renderAll();
  }
  
  /**
   * 绘制圆形
   */
  /**
   * 绘制箭头 - 使用Fabric.js的Path对象实现
   */
  drawArrow(x1, y1, x2, y2, style = {}) {
    const headLength = 10;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    
    // 计算箭头点
    const arrowPoint1X = x2 - headLength * Math.cos(angle - Math.PI / 6);
    const arrowPoint1Y = y2 - headLength * Math.sin(angle - Math.PI / 6);
    const arrowPoint2X = x2 - headLength * Math.cos(angle + Math.PI / 6);
    const arrowPoint2Y = y2 - headLength * Math.sin(angle + Math.PI / 6);
    
    // 使用Fabric.js的Path对象创建完整的箭头
    const pathData = [
      ['M', x1, y1],  // 移动到起点
      ['L', x2, y2],  // 绘制主线到终点
      ['M', x2, y2],  // 移动到箭头终点
      ['L', arrowPoint1X, arrowPoint1Y],  // 绘制第一条箭头线
      ['M', x2, y2],  // 移动到箭头终点
      ['L', arrowPoint2X, arrowPoint2Y]   // 绘制第二条箭头线
    ];
    
    const arrow = new fabric.Path(pathData, {
      fill: '',
      stroke: style.stroke || 'black',
      strokeWidth: style.lineWidth || 1
    });
    
    this.fabricCanvas.add(arrow);
    this.fabricCanvas.renderAll();
    
    return arrow;
  }
  
  /**
   * 使用fabric.js添加高亮指示器
   */
  addHighlightIndicator(id, x, y, radius = 30, color = '#ffeb3b', lineWidth = 3) {
    // 如果已存在相同ID的动画，先删除它
    if (this.animations.has(id)) {
      this.removeIndicator(id);
    }
    
    // 创建圆形对象，初始透明度为0
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
      originY: 'center',
      opacity: 0 // 初始透明度为0
    });
    
    // 添加到画布
    this.fabricCanvas.add(circle);
    
    // 保存引用以便后续移除
    this.animations.set(id, { type: 'highlight', object: circle });
    
    // 淡入动画
    circle.animate({
      opacity: 1
    }, {
      duration: 500, // 500毫秒淡入
      onChange: () => {
        this.fabricCanvas.renderAll();
      }
    });
  }
  
  /**
   * 使用fabric.js添加脉冲动画指示器
   */
  addPulseIndicator(id, x, y, radius = 30, color = '#ffeb3b', duration = 3000, repeatCount = 3) {
    // 如果已存在相同ID的动画，先删除它
    if (this.animations.has(id)) {
      this.removeIndicator(id);
    }
    
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
      duration: duration,
      repeatCount: repeatCount,
      currentRepeat: 0
    });
    
    // 开始脉冲动画
    this._animatePulse(id, pulseCircle, radius, duration);
    
    // 如果设置了持续时间和重复次数，自动移除
    if (duration > 0 && duration !== Infinity && repeatCount > 0 && repeatCount !== Infinity) {
      setTimeout(() => {
        this.removeIndicator(id);
      }, duration * repeatCount);
    }
    
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
    
    this.animations.delete(id);
    if (animation.type === 'highlight') {
      // 淡出动画
      animation.object.animate({
        opacity: 0
      }, {
        duration: 500, // 500毫秒淡出
        onChange: () => {
          this.fabricCanvas.renderAll();
        },
        onComplete: () => {
          // 动画完成后移除对象
          this.fabricCanvas.remove(animation.object);
          this.fabricCanvas.renderAll();
        }
      });
    } else if (animation.type === 'pulse' && animation.objects) {
      // 直接移除脉冲指示器
      animation.objects.forEach(obj => {
        this.fabricCanvas.remove(obj);
      });
      this.fabricCanvas.renderAll();
    }
  }
  
  /**
   * 清除所有指示器
   */
  clearIndicators() { 
    const idsToRemove = Array.from(this.animations.keys());
    idsToRemove.forEach(id => {
      this.removeIndicator(id);
    });
  }
  
  /**
   * 重新渲染所有指示器
   */
  renderAllIndicators() {
    this.fabricCanvas.renderAll();
  }
  
}

export default CanvasRenderer;