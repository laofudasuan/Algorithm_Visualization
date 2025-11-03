// GraphRenderer.js - 使用Fabric.js渲染图并实现动画效果
import * as fabric from 'fabric';

/**
 * GraphRenderer类
 * 使用Fabric.js渲染图并实现动画效果
 */
export class GraphRenderer {
  constructor(width, height) {
    // 创建canvas元素
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.setAttribute('width', width);
    this.canvasElement.setAttribute('height', height);
    this.canvasElement.setAttribute('style', 'position: relative; ');
    
    // 初始化Fabric.js画布
    this.canvas = new fabric.Canvas(this.canvasElement, {
      width: width,
      height: height,
      selection: false, // 禁用默认选择功能
      preserveObjectStacking: true, // 保持对象堆叠顺序
      backgroundColor: '#f5f5f5' // 设置稍微浅一点的灰色背景
    });

    this.canvas.renderAll();
    
    // 为每个节点和边创建Fabric对象引用
    this.nodeObjects = new Map(); // 存储节点Fabric对象
    this.edgeObjects = new Map(); // 存储边Fabric对象
    this.nodeLabelObjects = new Map(); // 存储节点标签对象
    this.edgeLabelObjects = new Map(); // 存储边标签对象
    
    // 存储已存在的节点和边的ID，用于检测新增元素
    this.existingNodeIds = new Set();
    this.existingEdgeIds = new Set();
    
    // 默认样式
    this.defaultNodeStyle = {
      fill: '#3f51b5',
      stroke: '#ffffff',
      strokeWidth: 2
    };
    
    this.defaultEdgeStyle = {
      stroke: '#999999',
      strokeWidth: 2
    };
  }
  
  /**
   * 获取DOM元素，用于在React组件中渲染
   */
  getSVGElement() {
    // 虽然名字是getSVGElement，但现在返回canvas元素以保持API兼容性
    return this.canvasElement;
  }

  
  /**
   * 清空所有节点元素
   */
  clearAllNodes() {
    // 遍历所有现有节点并执行删除动画
    for (const nodeId of this.existingNodeIds) {
      this.removeNodeElement(nodeId);
    }
    
    // 清空节点相关集合
    this.existingNodeIds.clear();
    this.nodeObjects.clear();
    this.nodeLabelObjects.clear();
  }
  
  /**
   * 清空所有边元素
   */
  clearAllEdges() {
    // 遍历所有现有边并执行删除动画
    for (const edgeId of this.existingEdgeIds) {
      this.removeEdgeElement(edgeId);
    }
    
    // 清空边相关集合
    this.existingEdgeIds.clear();
    this.edgeObjects.clear();
    this.edgeLabelObjects.clear();
  }

  /**
   * 清理不再使用的节点元素
   */
  cleanupRemovedNodes() {
    // 清理节点
    const currentNodeIds = new Set(this.nodes.map(n => n.id));
    for (const nodeId of this.existingNodeIds) {
      if (!currentNodeIds.has(nodeId)) {
        const nodeObject = this.nodeObjects.get(nodeId);
        const labelObject = this.nodeLabelObjects.get(nodeId);
        
        if (nodeObject) {
          // 节点消失动画
          nodeObject.animate({
            opacity: 0,
            scaleX: 0,
            scaleY: 0
          }, {
            duration: 1000,
            easing: fabric.util.ease.easeOutQuad,
            onChange: () => {
              this.canvas.renderAll();
            },
            onComplete: () => {
              // 动画完成后移除元素
              this.canvas.remove(nodeObject);
              this.nodeObjects.delete(nodeId);
            }
          });
        }
        
        // 同时移除标签
        if (labelObject) {
          labelObject.animate('opacity', 0, {
            duration: 800,
            easing: fabric.util.ease.easeOutQuad,
            onChange: () => {
              this.canvas.renderAll();
            },
            onComplete: () => {
              this.canvas.remove(labelObject);
              this.nodeLabelObjects.delete(nodeId);
            }
          });
        }
        
        this.existingNodeIds.delete(nodeId);
      }
    }
  }
  
  /**
   * 清理不再使用的边元素
   */
  cleanupRemovedEdges() {
    // 清理边
    const currentEdgeIds = new Set(this.edges.map(e => e.id));
    for (const edgeId of this.existingEdgeIds) {
      if (!currentEdgeIds.has(edgeId)) {
        const edgeObject = this.edgeObjects.get(edgeId);
        const labelObject = this.edgeLabelObjects.get(edgeId);
        
        if (edgeObject) {
          // 边淡出动画 - 使用fabric.util.animate确保与fabric.Line兼容
          fabric.util.animate({
            startValue: 1,
            endValue: 0,
            duration: 1000,
            easing: fabric.util.ease.easeOutQuad,
            onChange: (val) => {
              edgeObject.set('opacity', val);
              this.canvas.renderAll();
            },
            onComplete: () => {
              // 动画完成后移除边元素
              this.canvas.remove(edgeObject);
              this.edgeObjects.delete(edgeId);
            }
          });
          
          // 如果有标签，也添加淡出动画
          if (labelObject) {
            fabric.util.animate({
              startValue: 1,
              endValue: 0,
              duration: 1000,
              easing: fabric.util.ease.easeOutQuad,
              onChange: (val) => {
                labelObject.set('opacity', val);
                this.canvas.renderAll();
              },
              onComplete: () => {
                // 动画完成后移除标签元素
                this.canvas.remove(labelObject);
                this.edgeLabelObjects.delete(edgeId);
              }
            });
          }
        }
        
        this.existingEdgeIds.delete(edgeId);
      }
    }
  }
  
  /**
   * 创建节点Fabric对象
   */
  createNodeElement(nodeId, node) {
    const size = node.size || 20;
    const nodeStyle = { ...this.defaultNodeStyle, ...node.style };
    let nodeObject;
    
    // 根据节点类型创建不同的Fabric对象
    if (node.type === 'square') {
      // 创建矩形节点
      nodeObject = new fabric.Rect({
        left: node.x,
        top: node.y,
        width: size,
        height: size,
        fill: nodeStyle.fill,
        stroke: nodeStyle.stroke,
        strokeWidth: nodeStyle.strokeWidth,
        selectable: false,
        hoverCursor: 'default',
        opacity: 0, // 初始透明度为0
        scaleX: 0.01, // 使用非常小的值代替0，避免渲染错误
        scaleY: 0.01,
        originX: 'center', // 设置原点为中心
        originY: 'center'  // 设置原点为中心
      });
    } else if (node.type == 'circle') {
      // 创建圆形节点
      nodeObject = new fabric.Circle({
        left: node.x,
        top: node.y,
        radius: size / 2,
        fill: nodeStyle.fill,
        stroke: nodeStyle.stroke,
        strokeWidth: nodeStyle.strokeWidth,
        selectable: false,
        hoverCursor: 'default',
        opacity: 0, // 初始透明度为0
        scaleX: 0.01, // 使用非常小的值代替0，避免渲染错误
        scaleY: 0.01,
        originX: 'center', // 设置原点为中心
        originY: 'center'  // 设置原点为中心
      });
    } else {
      
      return;
    }
    
    // 添加到画布
    this.canvas.add(nodeObject);
    // 将节点移动到顶层，确保它显示在边的上层
    this.canvas.moveObjectTo(nodeObject, 10000);
    
    // 存储节点对象引用
    this.nodeObjects.set(nodeId, nodeObject);
    
    // 添加节点ID到existingNodeIds集合
    this.existingNodeIds.add(nodeId);
    
    // 添加节点标签
    if (node.label) {
      this.createNodeLabelElement(nodeId, node);
    }
    
    // 添加节点出现动画
    this.animateNodeAppearance(nodeId);
  }
  
  /**
   * 创建边Fabric对象
   */
  createEdgeElement(edgeId, sourceNode, targetNode, style, label) {
    const edgeStyle = { ...this.defaultEdgeStyle, ...style };
    
    // 创建线条对象
    const edgeObject = new fabric.Line([sourceNode.x, sourceNode.y, targetNode.x, targetNode.y], {
      stroke: edgeStyle.stroke,
      strokeWidth: edgeStyle.strokeWidth,
      selectable: false,
      hoverCursor: 'default',
      opacity: 0 // 初始透明度为0
    });
    
    // 添加到画布
    this.canvas.add(edgeObject);
    // 将边移动到底层，确保它显示在节点和标签的下方
    this.canvas.moveObjectTo(edgeObject, 0);
    
    // 直接存储边对象引用，与节点对象存储方式一致
    this.edgeObjects.set(edgeId, edgeObject);
    
    // 添加边ID到existingEdgeIds集合
    this.existingEdgeIds.add(edgeId);
    
    // 创建边标签
    if (label) {
      this.createEdgeLabelElement(edgeId, sourceNode, targetNode, label, style);
    }
    
    // 添加边出现动画
    this.animateEdgeAppearance(edgeId);
  }
  
  /**
   * 更新节点样式
   */
  updateNodeStyle(nodeId, node) {
    const nodeObject = this.nodeObjects.get(nodeId);
    if (!nodeObject) return;
    
    const size = node.size || 20;
    const nodeStyle = { ...this.defaultNodeStyle, ...node.style };
    
    // 更新节点样式
    nodeObject.set({
      fill: nodeStyle.fill,
      stroke: nodeStyle.stroke,
      strokeWidth: nodeStyle.strokeWidth
    });
    
    if (nodeObject.type === 'circle') {
      // 更新圆形
      nodeObject.set('radius', size / 2);
    } else {
      // 更新矩形
      nodeObject.set({
        width: size,
        height: size
      });
    }
    
    // 更新或创建节点标签
    if (node.label) {
      const labelObject = this.nodeLabelObjects.get(nodeId);
      if (labelObject) {
        // 更新标签内容和样式
        labelObject.set({
          text: node.label,
          fill: nodeStyle?.labelFill || '#ffffff',
          fontSize: nodeStyle?.labelFontSize || 14
        });
      } else {
        this.createNodeLabelElement(nodeId, node);
      }
    } else if (this.nodeLabelObjects.has(nodeId)) {
      const labelObject = this.nodeLabelObjects.get(nodeId);
      // 移除标签
      labelObject.animate('opacity', 0, {
        duration: 300,
        onChange: () => {
          this.canvas.renderAll();
        },
        onComplete: () => {
          this.canvas.remove(labelObject);
          this.nodeLabelObjects.delete(nodeId);
        }
      });
    }
    
    this.canvas.renderAll();
  }
  
  /**
   * 更新节点位置，并同时更新相邻的边位置
   */
  updateNodePosition(nodeId, node, connectedEdges = [],easing = (progress) => progress) {
    const nodeObject = this.nodeObjects.get(nodeId);
    if (!nodeObject) return;
    
    // 记录开始时间，用于所有动画同步
    const startTime = Date.now();
    const duration = 1000;
    
    // 节点当前位置
    const startX = nodeObject.left;
    const startY = nodeObject.top;
    
    // 目标位置
    const targetX = node.x;
    const targetY = node.y;
    
    // 更新节点标签位置
    const labelObject = this.nodeLabelObjects.get(nodeId);
    
    // 执行动画
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easing(progress);
      
      // 更新节点位置
      const currentX = startX + (targetX - startX) * easeProgress;
      const currentY = startY + (targetY - startY) * easeProgress;
      
      nodeObject.set({
        left: currentX,
        top: currentY
      });
      
      // 更新标签位置
      if (labelObject) {
        labelObject.set({
          left: currentX,
          top: currentY
        });
      }
      
      // 更新相关边的位置
      connectedEdges.forEach(({ edgeId, sourceNode, targetNode }) => {
        const edgeObject = this.edgeObjects.get(edgeId);
        if (!edgeObject) return;
        
        const isSource = sourceNode.id === nodeId;
        const isTarget = targetNode.id === nodeId;

        edgeObject.set({
          x1: isSource ? currentX : edgeObject.x1,
          y1: isSource ? currentY : edgeObject.y1,
          x2: isTarget ? currentX : edgeObject.x2,
          y2: isTarget ? currentY : edgeObject.y2
        });
        edgeObject.setCoords();
        
        // 更新边标签位置
        const edgeLabelObject = this.edgeLabelObjects.get(edgeId);
        if (edgeLabelObject) {
          // 计算新的边中点
          const midX = (edgeObject.x1 + edgeObject.x2) / 2;
          const midY = (edgeObject.y1 + edgeObject.y2) / 2;
          edgeLabelObject.set({
            left: midX,
            top: midY
          });
          edgeLabelObject.setCoords();
        }
      });
      
      // 确保在渲染前所有对象都有有效的尺寸
      this.canvas.requestRenderAll();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * 更新边样式
   */
  updateEdgeStyle(edgeId, style, label) {
    const edgeObject = this.edgeObjects.get(edgeId);
    if (!edgeObject) return;
    
    const edgeStyle = { ...this.defaultEdgeStyle, ...style };
    
    // 更新边样式
    edgeObject.set({
      stroke: edgeStyle.stroke,
      strokeWidth: edgeStyle.strokeWidth
    });
    
    // 更新或创建边标签
    if (label) {
      const labelObject = this.edgeLabelObjects.get(edgeId);
      if (labelObject) {
        // 更新标签内容和样式
        labelObject.set({
          text: label,
          fill: edgeStyle?.labelFill || '#000000',
          fontSize: edgeStyle?.labelFontSize || 14,
          opacity: 1
        });
      } else {
        // 如果标签不存在，但有边和节点信息，创建新标签
        // 注意：这里需要节点信息才能创建标签，可能需要在调用时传入
        console.warn('Cannot create edge label without node information');
      }
    } else if (this.edgeLabelObjects.has(edgeId)) {
      const labelObject = this.edgeLabelObjects.get(edgeId);
      // 淡出并移除标签
      labelObject.animate('opacity', 0, {
        duration: 300,
        onChange: () => {
          this.canvas.renderAll();
        },
        onComplete: () => {
          this.canvas.remove(labelObject);
          this.edgeLabelObjects.delete(edgeId);
        }
      });
    }
    
    this.canvas.renderAll();
  }
  
  /**
   * 使用坐标插值方式实现边位置移动动画
   */
  animateEdgePosition(edgeId, sourceNode, targetNode, duration = 1000, easing = (progress) => progress, onComplete) {
    // 获取边对象
    const edgeObject = this.edgeObjects.get(edgeId);
    if (!edgeObject) return;
    
    // 直接获取各个坐标属性
    const currentStartX = edgeObject.x1;
    const currentStartY = edgeObject.y1;
    const currentEndX = edgeObject.x2;
    const currentEndY = edgeObject.y2;
    
    // 目标坐标
    const targetStartX = sourceNode.x;
    const targetStartY = sourceNode.y;
    const targetEndX = targetNode.x;
    const targetEndY = targetNode.y;
    
    // 确保边可见
    edgeObject.set('opacity', 1);
    
    // 使用自定义动画来插值坐标
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeProgress = easing(progress);
      
      // 计算当前起点和终点坐标
      const newStartX = currentStartX + (targetStartX - currentStartX) * easeProgress;
      const newStartY = currentStartY + (targetStartY - currentStartY) * easeProgress;
      const newEndX = currentEndX + (targetEndX - currentEndX) * easeProgress;
      const newEndY = currentEndY + (targetEndY - currentEndY) * easeProgress;
     
      // 更新线条坐标
      edgeObject.set({
        x1: newStartX,
        y1: newStartY,
        x2: newEndX,
        y2: newEndY
      });
      
      this.canvas.renderAll();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 动画完成，确保精确设置最终坐标
        edgeObject.set({
          x1: targetStartX,
          y1: targetStartY,
          x2: targetEndX,
          y2: targetEndY
        });
        
        this.canvas.renderAll();
        
        if (onComplete) onComplete();
      }
    };
    requestAnimationFrame(animate);
  }

  /**
   * 更新边位置（保留此方法以保持兼容性，但主要功能已移至updateNodePosition）
   */
  updateEdgePosition(edgeId, sourceNode, targetNode, label) {
    // 直接获取边对象
    const edgeObject = this.edgeObjects.get(edgeId);
    if (!edgeObject) return;
    
    // 安全地设置边的位置 - 使用points数组
    const points = [sourceNode.x, sourceNode.y, targetNode.x, targetNode.y];
    edgeObject.set('points', points);
    edgeObject.setCoords(); // 确保坐标缓存正确更新
    
    // 更新或创建边标签
    if (label) {
      const labelObject = this.edgeLabelObjects.get(edgeId);
      if (labelObject) {
        // 更新标签内容
        labelObject.set('text', label);
        labelObject.set('opacity', 1);
        
        // 计算中点位置
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        
        labelObject.set({
          left: midX,
          top: midY
        });
        labelObject.setCoords(); // 确保坐标缓存正确更新
      } else {
        // 使用默认样式创建新标签
        const defaultStyle = { ...this.defaultEdgeStyle };
        this.createEdgeLabelElement(edgeId, sourceNode, targetNode, label, defaultStyle);
        // 淡入新标签
        const newLabelObject = this.edgeLabelObjects.get(edgeId);
        if (newLabelObject) {
          newLabelObject.animate('opacity', 1, {
            duration: 300,
            onChange: () => {
              this.canvas.requestRenderAll();
            }
          });
        }
      }
    } else if (this.edgeLabelObjects.has(edgeId)) {
      const labelObject = this.edgeLabelObjects.get(edgeId);
      // 淡出并移除标签
      labelObject.animate('opacity', 0, {
        duration: 300,
        onChange: () => {
          this.canvas.requestRenderAll();
        },
        onComplete: () => {
          this.canvas.remove(labelObject);
          this.edgeLabelObjects.delete(edgeId);
        }
      });
    }
    
    // 确保在渲染前所有对象都有有效的尺寸
    this.canvas.requestRenderAll();
  }
  
  /**
   * 线条动画辅助方法
   */
  animateLine(lineObject, fromPoints, toPoints, duration) {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeProgress = fabric.util.ease.easeOutQuad(progress);
      
      // 计算插值坐标
      const interpolatedPoints = {
        x1: fromPoints.x1 + (toPoints.x1 - fromPoints.x1) * easeProgress,
        y1: fromPoints.y1 + (toPoints.y1 - fromPoints.y1) * easeProgress,
        x2: fromPoints.x2 + (toPoints.x2 - fromPoints.x2) * easeProgress,
        y2: fromPoints.y2 + (toPoints.y2 - fromPoints.y2) * easeProgress
      };
      
      // 更新线条坐标
      lineObject.set(interpolatedPoints);
      this.canvas.renderAll();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * 节点出现动画
   */
  animateNodeAppearance(nodeId, duration = 1000, easing = fabric.util.ease.easeOutElastic, onComplete) {
    // 获取节点对象 - 直接从nodeObjects获取，而不是通过nodeData.object
    const nodeObject = this.nodeObjects.get(nodeId);
    if (!nodeObject) return;
    
    // 设置原点为中心，确保从中心放大
    nodeObject.set({
      originX: 'center',
      originY: 'center'
    });
    
    // 确保初始属性正确设置
    nodeObject.opacity = 0;
    nodeObject.scaleX = 0.01;
    nodeObject.scaleY = 0.01;
    
    // 设置动画参数
    const animOptions = {
      duration: duration,
      easing: easing,
      onChange: () => {
        this.canvas.renderAll();
      },
      onComplete: onComplete
    };
    
    // 同时动画opacity和scale
    nodeObject.animate({
      opacity: 1,
      scaleX: 1,
      scaleY: 1
    }, animOptions);
    
    // 不再为标签添加动画，因为标签已经直接显示
  }
  
  /**
   * 边出现动画 - 从起点线性扩展到终点（使用坐标插值方式）
   */
  animateEdgeAppearance(edgeId, duration = 1000, easing = (progress) => progress, onComplete) {
    // 获取边对象 - 与nodeObjects一致，直接从edgeObjects获取
    const edgeObject = this.edgeObjects.get(edgeId);
    if (!edgeObject) return;
    
    // 获取起点和终点坐标
    const startX = edgeObject.x1;
    const startY = edgeObject.y1;
    const targetEndX = edgeObject.x2;
    const targetEndY = edgeObject.y2;
    
    // 设置初始状态：从起点到起点（长度为0）
    edgeObject.set({
      opacity: 1,
      x2: startX,
      y2: startY
    });
    
    // 强制渲染一次以应用初始状态
    this.canvas.renderAll();
    
    // 使用自定义动画来插值终点坐标
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeProgress = easing(progress);
      
      // 计算当前终点坐标
      const currentEndX = startX + (targetEndX - startX) * easeProgress;
      const currentEndY = startY + (targetEndY - startY) * easeProgress;
      
      // 更新线条终点坐标
      edgeObject.set({
        x2: currentEndX,
        y2: currentEndY
      });
      
      // 当进度达到70%时开始显示标签
      if (progress >= 0.7) {
        const labelObject = this.edgeLabelObjects.get(edgeId);
        if (labelObject) {
          // 从0到1的线性过渡，在剩余30%的进度内完成标签显示
          const labelOpacity = Math.min(1, (progress - 0.7) / 0.3);
          labelObject.set({ opacity: labelOpacity });
        }
      }
      
      this.canvas.renderAll();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 动画完成，确保精确设置最终坐标
        edgeObject.set({
          x2: targetEndX,
          y2: targetEndY
        });
        
        // 确保动画结束时标签完全显示
        const labelObject = this.edgeLabelObjects.get(edgeId);
        if (labelObject) {
          labelObject.set({ opacity: 1 });
        }
        
        this.canvas.renderAll();
        
        if (onComplete) onComplete();
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * 计算线条长度
   */
  getLineLength(line) {
    // 计算两点之间的距离
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * 创建节点标签Fabric对象
   */
  createNodeLabelElement(nodeId, node) {
    const nodeStyle = { ...this.defaultNodeStyle, ...node.style };
    
    const labelObject = new fabric.Text(node.label, {
      left: node.x,
      top: node.y,
      fontSize: nodeStyle?.labelFontSize || 14, // 稍大一些以便更容易看到
      fill: nodeStyle?.labelFill || '#ffffff',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      selectable: false,
      hoverCursor: 'default',
      opacity: 1 // 直接显示，不需要初始透明度为0
    });
    
    // 添加到画布
    this.canvas.add(labelObject);
    // 将标签移动到顶层，确保它显示在所有元素上层
    this.canvas.moveObjectTo(labelObject, 10000);
    
    // 存储标签对象引用
    this.nodeLabelObjects.set(nodeId, labelObject);
  }
  
  /**
   * 创建边标签Fabric对象
   */
  createEdgeLabelElement(edgeId, sourceNode, targetNode, label, style) {
    const midX = (sourceNode.x + targetNode.x) / 2;
    const midY = (sourceNode.y + targetNode.y) / 2;
    
    const labelObject = new fabric.Text(label, {
      left: midX,
      top: midY,
      fontSize: style?.labelFontSize || 14, // 稍大一些以便更容易看到
      fill: style?.labelFill || '#000000', // 使用黑色更容易在各种背景下看到
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      selectable: false,
      hoverCursor: 'default',
      opacity: 0 // 初始透明度为0，等待边动画进行到70%时再显示
    });
    
    // 添加到画布
    this.canvas.add(labelObject);
    // 将标签移动到顶层，确保它显示在所有元素上层
    this.canvas.moveObjectTo(labelObject, 10000);
    
    // 存储边标签对象引用
    this.edgeLabelObjects.set(edgeId, labelObject);
  }
  
  /**
   * 计算两点之间的距离
   */
  getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * 导出为SVG字符串
   */
  exportAsSVG() {
    // 使用Fabric.js的toSVG方法
    return this.canvas.toSVG();
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
   * 删除节点动画
   */
  removeNodeElement(nodeId, onComplete) {
    const nodeObject = this.nodeObjects.get(nodeId);
    const labelObject = this.nodeLabelObjects.get(nodeId);
    
    if (nodeObject) {
      // 节点消失动画
      nodeObject.animate({
        opacity: 0,
        scaleX: 0,
        scaleY: 0
      }, {
        duration: 1000,
        easing: fabric.util.ease.easeOutQuad,
        onChange: () => {
          this.canvas.renderAll();
        },
        onComplete: () => {
          // 动画完成后移除元素
          this.canvas.remove(nodeObject);
          this.nodeObjects.delete(nodeId);
          
          // 从existingNodeIds集合中删除节点ID
          this.existingNodeIds.delete(nodeId);
          
          // 如果有标签，也移除标签
          if (labelObject) {
            this.canvas.remove(labelObject);
            this.nodeLabelObjects.delete(nodeId);
          }
          
          if (onComplete) onComplete();
        }
      });
    } 
  }
  
  /**
   * 删除边动画
   */
  removeEdgeElement(edgeId, onComplete) {
  const edgeObject = this.edgeObjects.get(edgeId);
  const labelObject = this.edgeLabelObjects.get(edgeId);

  if (!edgeObject) return;

  console.log('Removing edge via fabric.util.animate...');

  fabric.util.animate({
    startValue: 1,
    endValue: 0,
    duration: 1000,
    easing: fabric.util.ease.easeOutQuad,
    onChange: (val) => {
      edgeObject.set('opacity', val);
      this.canvas.requestRenderAll();
    },
    onComplete: () => {
      this.canvas.remove(edgeObject);
      this.edgeObjects.delete(edgeId);
      this.existingEdgeIds.delete(edgeId);

      if (labelObject) {
        this.canvas.remove(labelObject);
        this.edgeLabelObjects.delete(edgeId);
      }
      if (onComplete) onComplete();
    }
  });
}
}

export default GraphRenderer;