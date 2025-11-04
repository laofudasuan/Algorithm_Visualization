// PixiGraphRenderer.js - 使用PixiJS渲染图并实现动画效果
import * as PIXI from 'pixi.js';
import { SVGScene } from '@pixi-essentials/svg';   // ← 新增

/**
 * PixiGraphRenderer类
 * 使用PixiJS渲染图并实现动画效果
 */
export class PixiGraphRenderer {
  static preloadedIcons = {};
  
  constructor(width, height) {
    // 创建canvas元素
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.canvasElement.style.display = 'block';
    
    // 初始化容器
    this.initContainers();
    
    // 初始化PIXI应用 - PixiJS v8 使用异步初始化
    this.app = new PIXI.Application();
    
    // 初始化应用
    this.initApp(width, height);
  }

  /**
   * 初始化容器和状态
   */
  initContainers() {
    // 为每个节点和边创建PIXI对象引用
    this.nodeObjects = new Map(); // 存储节点PIXI对象
    this.edgeObjects = new Map(); // 存储边PIXI对象
    this.nodeLabelObjects = new Map(); // 存储节点标签对象
    this.edgeLabelObjects = new Map(); // 存储边标签对象

    // 存储已存在的节点和边的ID，用于检测新增元素
    this.existingNodeIds = new Set();
    this.existingEdgeIds = new Set();

    // 默认样式
    this.defaultNodeStyle = {
      fill: 0x3f51b5,
      stroke: 0xffffff,
      strokeWidth: 2
    };

    this.defaultEdgeStyle = {
      stroke: 0x999999,
      strokeWidth: 2
    };
  }

  /**
   * 异步初始化PIXI应用
   */
  async initApp(width, height) {
    await this.app.init({
      width: width,
      height: height,
      backgroundColor: 0xf5f5f5,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      canvas: this.canvasElement
    });

    // 创建容器用于分层渲染
    this.edgeContainer = new PIXI.Container();
    this.nodeContainer = new PIXI.Container();
    this.labelContainer = new PIXI.Container();
    this.edgeLabelContainer = new PIXI.Container();

    // 将容器添加到舞台
    this.app.stage.addChild(this.edgeContainer);
    this.app.stage.addChild(this.edgeLabelContainer);
    this.app.stage.addChild(this.nodeContainer);
    this.app.stage.addChild(this.labelContainer);
  }

  /**
   * 获取DOM元素，用于在React组件中渲染
   */
  getSVGElement() {
    // 返回canvas元素
    return this.canvasElement;
  }

  /**
   * 清空所有节点元素
   */
  clearAllNodes() {
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage || !this.nodeContainer) return;
    
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
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage || !this.edgeContainer) return;
    
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
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage) return;
    
    // 清理节点
    const currentNodeIds = new Set(this.nodes?.map(n => n.id) || []);
    for (const nodeId of this.existingNodeIds) {
      if (!currentNodeIds.has(nodeId)) {
        const nodeObject = this.nodeObjects.get(nodeId);
        const labelObject = this.nodeLabelObjects.get(nodeId);

        if (nodeObject) {
          // 节点消失动画
          this.animate({
            target: nodeObject,
            properties: {
              alpha: 0,
              scale: { x: 0, y: 0 }
            },
            duration: 1000,
            easing: this.easeOutQuad,
            onUpdate: () => {
              // 更新渲染
            },
            onComplete: () => {
              // 动画完成后移除元素
              this.nodeContainer.removeChild(nodeObject);
              this.nodeObjects.delete(nodeId);
            }
          });
        }

        // 同时移除标签
        if (labelObject) {
          this.animate({
            target: labelObject,
            properties: {
              alpha: 0
            },
            duration: 800,
            easing: this.easeOutQuad,
            onUpdate: () => {
              // 更新渲染
            },
            onComplete: () => {
              this.labelContainer.removeChild(labelObject);
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
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage) return;
    
    // 清理边
    const currentEdgeIds = new Set(this.edges?.map(e => e.id) || []);
    for (const edgeId of this.existingEdgeIds) {
      if (!currentEdgeIds.has(edgeId)) {
        const edgeObject = this.edgeObjects.get(edgeId);
        const labelObject = this.edgeLabelObjects.get(edgeId);

        if (edgeObject) {
          // 边淡出动画
          this.animate({
            target: edgeObject,
            properties: {
              alpha: 0
            },
            duration: 1000,
            easing: this.easeOutQuad,
            onUpdate: () => {
              // 更新渲染
            },
            onComplete: () => {
              // 动画完成后移除边元素
              this.edgeContainer.removeChild(edgeObject);
              this.edgeObjects.delete(edgeId);
            }
          });

          // 如果有标签，也添加淡出动画
          if (labelObject) {
            this.animate({
              target: labelObject,
              properties: {
                alpha: 0
              },
              duration: 1000,
              easing: this.easeOutQuad,
              onUpdate: () => {
                // 更新渲染
              },
              onComplete: () => {
                // 动画完成后移除标签元素
                this.edgeLabelContainer.removeChild(labelObject);
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
   * 创建节点PIXI对象
   */
  createNodeElement(nodeId, node) {
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage || !this.nodeContainer) return;
    
    const size = node.size || 20;
    const nodeStyle = { ...this.defaultNodeStyle, ...node.style };
    
    let nodeObject;

    // 根据节点类型创建不同的PIXI对象
    if (node.type === 'square') {
      // 创建矩形节点
      nodeObject = new PIXI.Graphics();
      nodeObject.rect(-size/2, -size/2, size, size);
      nodeObject.fill({color: nodeStyle.fill});
      nodeObject.stroke({width: nodeStyle.strokeWidth, color: nodeStyle.stroke});
      nodeObject.x = node.x;
      nodeObject.y = node.y;
    } else if (node.type === 'circle') {
      // 创建圆形节点
      nodeObject = new PIXI.Graphics();
      nodeObject.circle(0, 0, size/2);
      nodeObject.fill({color: nodeStyle.fill});
      nodeObject.stroke({width: nodeStyle.strokeWidth, color: nodeStyle.stroke});
      nodeObject.x = node.x;
      nodeObject.y = node.y;
    } else {
      // PIXI v8 正确写法：先加载纹理，再创建 Sprite
      console.log('node type = ',node.type);
      PIXI.Assets.load(`/icons/`+node.type+`.png`).then((texture) => {
        // 纹理加载完成后，创建 Sprite
        const nodeObject = new PIXI.Sprite(texture);

        // 1. 获取图片原始尺寸（从纹理获取，准确且可靠）
        const originalWidth = texture.width;

        // 2. 设置中心点（基于原始尺寸）
        nodeObject.anchor.set(0.5);
        nodeObject.position.set(node.x, node.y);

        // 添加到容器
        this.nodeContainer.addChild(nodeObject);
        this.nodeObjects.set(nodeId, nodeObject);
        this.existingNodeIds.add(nodeId);

        // 初始状态（透明 + 极小缩放）
        nodeObject.alpha = 0;
        nodeObject.scale.set(0.01);

        // 3. 计算目标缩放比例
        const scaleRatio = size / originalWidth;

        // 4. 执行淡入放大动画（保持原逻辑）
        this.animate({
          target: nodeObject,
          properties: {
            alpha: 1,
            scale: {
              x: scaleRatio,
              y: scaleRatio
            }
          },
          duration: 1000,
          easing: this.easeOutElastic,
          onUpdate: () => {}
        });
        // 添加节点标签
        if (node.label) {
          this.createNodeLabelElement(nodeId, node);
        }
      });
      return;   // 异步加载，后续逻辑已放在 then 里
    }

    // 设置初始透明度为0
    nodeObject.alpha = 0;
    nodeObject.scale.set(0.01);

    // 添加到节点容器
    this.nodeContainer.addChild(nodeObject);

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
   * 创建边PIXI对象
   */
  createEdgeElement(edgeId, sourceNode, targetNode, style, label) {
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage || !this.edgeContainer) return;
    
    const edgeStyle = { ...this.defaultEdgeStyle, ...style };

    // 创建线条对象
    const edgeObject = new PIXI.Graphics();
    edgeObject.moveTo(sourceNode.x, sourceNode.y);
    edgeObject.lineTo(targetNode.x, targetNode.y);
    edgeObject.stroke({width: edgeStyle.strokeWidth, color: edgeStyle.stroke});
    edgeObject.alpha = 1; // 确保边默认可见

    // 记录坐标
    edgeObject.startX = sourceNode.x;
    edgeObject.startY = sourceNode.y;
    edgeObject.endX = targetNode.x;
    edgeObject.endY = targetNode.y;

    // 添加到边容器
    this.edgeContainer.addChild(edgeObject);

    // 存储边对象引用
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
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage || !this.nodeContainer) return;
    
    const nodeObject = this.nodeObjects.get(nodeId);
    if (!nodeObject) return;

    const size = node.size || 20;
    const nodeStyle = { ...this.defaultNodeStyle, ...node.style };

    // 重新绘制节点
    nodeObject.clear();
    
    if (node.type === 'square') {
      nodeObject.rect(-size/2, -size/2, size, size);
    } else {
      nodeObject.circle(0, 0, size/2);
    }
    
    nodeObject.fill({color: nodeStyle.fill});
    nodeObject.stroke({width: nodeStyle.strokeWidth, color: nodeStyle.stroke});

    // 更新或创建节点标签
    if (node.label) {
      const labelObject = this.nodeLabelObjects.get(nodeId);
      if (labelObject) {
        // 更新标签内容和样式
        labelObject.text = node.label;
        labelObject.style.fill = nodeStyle?.labelFill || 0xffffff;
        labelObject.style.fontSize = nodeStyle?.labelFontSize || 14;
      } else {
        this.createNodeLabelElement(nodeId, node);
      }
    } else if (this.nodeLabelObjects.has(nodeId)) {
      const labelObject = this.nodeLabelObjects.get(nodeId);
      // 移除标签
      this.animate({
        target: labelObject,
        properties: {
          alpha: 0
        },
        duration: 300,
        onUpdate: () => {
          // 更新渲染
        },
        onComplete: () => {
          this.labelContainer.removeChild(labelObject);
          this.nodeLabelObjects.delete(nodeId);
        }
      });
    }

    this.app.renderer.render(this.app.stage);
  }

  /**
   * 更新节点位置，并同时更新相邻的边位置
   */
  updateNodePosition(nodeId, node, connectedEdges = [], easing = (progress) => progress) {
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage) return;
    
    const nodeObject = this.nodeObjects.get(nodeId);
    if (!nodeObject) return;

    // 记录开始时间，用于所有动画同步
    const startTime = Date.now();
    const duration = 1000;

    // 节点当前位置
    const startX = nodeObject.x;
    const startY = nodeObject.y;

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

      nodeObject.x = currentX;
      nodeObject.y = currentY;

      // 更新标签位置
      if (labelObject) {
        labelObject.x = currentX;
        labelObject.y = currentY;
      }

      // 更新相关边的位置
      connectedEdges.forEach(({ edgeId, sourceNode, targetNode }) => {
        const edgeObject = this.edgeObjects.get(edgeId);
        if (!edgeObject) return;

        const isSource = sourceNode.id === nodeId;
        const isTarget = targetNode.id === nodeId;

        // 重新绘制边
        edgeObject.clear();
        const edgeStyle = { ...this.defaultEdgeStyle, ...(edgeObject.style || {}) };
        edgeObject.moveTo(isSource ? currentX : (edgeObject.startX || 0), isSource ? currentY : (edgeObject.startY || 0));
        edgeObject.lineTo(isTarget ? currentX : (edgeObject.endX || 0), isTarget ? currentY : (edgeObject.endY || 0));
        edgeObject.stroke({width: edgeStyle.strokeWidth, color: edgeStyle.stroke});
        
        // 更新坐标记录
        if (isSource) {
          edgeObject.startX = currentX;
          edgeObject.startY = currentY;
        }
        if (isTarget) {
          edgeObject.endX = currentX;
          edgeObject.endY = currentY;
        }

        // 更新边标签位置
        const edgeLabelObject = this.edgeLabelObjects.get(edgeId);
        if (edgeLabelObject) {
          // 计算新的边中点
          const midX = (edgeObject.startX + edgeObject.endX) / 2;
          const midY = (edgeObject.startY + edgeObject.endY) / 2;
          edgeLabelObject.x = midX;
          edgeLabelObject.y = midY;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    // 初始化边的坐标记录
    connectedEdges.forEach(({ edgeId, sourceNode, targetNode }) => {
      const edgeObject = this.edgeObjects.get(edgeId);
      if (edgeObject) {
        edgeObject.startX = sourceNode.x;
        edgeObject.startY = sourceNode.y;
        edgeObject.endX = targetNode.x;
        edgeObject.endY = targetNode.y;
      }
    });

    requestAnimationFrame(animate);
  }

  /**
   * 更新边样式
   */
  updateEdgeStyle(edgeId, style, label) {
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage) return;
    
    const edgeObject = this.edgeObjects.get(edgeId);
    if (!edgeObject) return;

    const edgeStyle = { ...this.defaultEdgeStyle, ...style };

    // 重新绘制边
    edgeObject.clear();
    if (edgeObject.startX !== undefined) {
      edgeObject.moveTo(edgeObject.startX, edgeObject.startY);
      edgeObject.lineTo(edgeObject.endX, edgeObject.endY);
    }
    edgeObject.stroke({width: edgeStyle.strokeWidth, color: edgeStyle.stroke});
    edgeObject.alpha = 1; // 确保边可见

    // 更新或创建边标签
    if (label) {
      const labelObject = this.edgeLabelObjects.get(edgeId);
      if (labelObject) {
        // 更新标签内容和样式
        labelObject.text = label;
        labelObject.style.fill = edgeStyle?.labelFill || 0x000000;
        labelObject.style.fontSize = edgeStyle?.labelFontSize || 14;
        labelObject.alpha = 1;
      } else {
        // 如果标签不存在，但有边和节点信息，创建新标签
        console.warn('Cannot create edge label without node information');
      }
    } else if (this.edgeLabelObjects.has(edgeId)) {
      const labelObject = this.edgeLabelObjects.get(edgeId);
      // 淡出并移除标签
      this.animate({
        target: labelObject,
        properties: {
          alpha: 0
        },
        duration: 300,
        onUpdate: () => {
          // 更新渲染
        },
        onComplete: () => {
          if (this.edgeLabelContainer) {
            this.edgeLabelContainer.removeChild(labelObject);
          }
          this.edgeLabelObjects.delete(edgeId);
        }
      });
    }

    this.app.renderer.render(this.app.stage);
  }

  /**
   * 使用坐标插值方式实现边位置移动动画
   */
  animateEdgePosition(edgeId, sourceNode, targetNode, duration = 1000, easing = (progress) => progress, onComplete) {
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage || !this.edgeContainer) return;
    
    // 获取边对象
    const edgeObject = this.edgeObjects.get(edgeId);
    if (!edgeObject) return;

    // 直接获取各个坐标属性
    const currentStartX = edgeObject.startX || edgeObject.x;
    const currentStartY = edgeObject.startY || edgeObject.y;
    const currentEndX = edgeObject.endX || edgeObject.x;
    const currentEndY = edgeObject.endY || edgeObject.y;

    // 目标坐标
    const targetStartX = sourceNode.x;
    const targetStartY = sourceNode.y;
    const targetEndX = targetNode.x;
    const targetEndY = targetNode.y;

    // 确保边可见
    edgeObject.alpha = 1;

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
      edgeObject.clear();
      const edgeStyle = { ...this.defaultEdgeStyle, ...(edgeObject.style || {}) };
      edgeObject.moveTo(newStartX, newStartY);
      edgeObject.lineTo(newEndX, newEndY);
      edgeObject.stroke({width: edgeStyle.strokeWidth, color: edgeStyle.stroke});
      
      // 更新坐标记录
      edgeObject.startX = newStartX;
      edgeObject.startY = newStartY;
      edgeObject.endX = newEndX;
      edgeObject.endY = newEndY;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 动画完成，确保精确设置最终坐标
        edgeObject.clear();
        edgeObject.moveTo(targetStartX, targetStartY);
        edgeObject.lineTo(targetEndX, targetEndY);
        edgeObject.stroke({width: edgeStyle.strokeWidth, color: edgeStyle.stroke});
        
        edgeObject.startX = targetStartX;
        edgeObject.startY = targetStartY;
        edgeObject.endX = targetEndX;
        edgeObject.endY = targetEndY;

        if (onComplete) onComplete();
      }
    };
    requestAnimationFrame(animate);
  }

  /**
   * 更新边位置（保留此方法以保持兼容性，但主要功能已移至updateNodePosition）
   */
  updateEdgePosition(edgeId, sourceNode, targetNode, label) {
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage) return;
    
    // 直接获取边对象
    const edgeObject = this.edgeObjects.get(edgeId);
    if (!edgeObject) return;

    // 重新绘制边
    edgeObject.clear();
    const edgeStyle = { ...this.defaultEdgeStyle, ...(edgeObject.style || {}) };
    edgeObject.moveTo(sourceNode.x, sourceNode.y);
    edgeObject.lineTo(targetNode.x, targetNode.y);
    edgeObject.stroke({width: edgeStyle.strokeWidth, color: edgeStyle.stroke});
    
    // 更新坐标记录
    edgeObject.startX = sourceNode.x;
    edgeObject.startY = sourceNode.y;
    edgeObject.endX = targetNode.x;
    edgeObject.endY = targetNode.y;
    edgeObject.alpha = 1; // 确保边可见

    // 更新或创建边标签
    if (label) {
      const labelObject = this.edgeLabelObjects.get(edgeId);
      if (labelObject) {
        // 更新标签内容
        labelObject.text = label;
        labelObject.alpha = 1;

        // 计算中点位置
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;

        labelObject.x = midX;
        labelObject.y = midY;
      } else {
        // 使用默认样式创建新标签
        const defaultStyle = { ...this.defaultEdgeStyle };
        this.createEdgeLabelElement(edgeId, sourceNode, targetNode, label, defaultStyle);
        // 淡入新标签
        const newLabelObject = this.edgeLabelObjects.get(edgeId);
        if (newLabelObject) {
          this.animate({
            target: newLabelObject,
            properties: {
              alpha: 1
            },
            duration: 300,
            onUpdate: () => {
              // 更新渲染
            }
          });
        }
      }
    } else if (this.edgeLabelObjects.has(edgeId)) {
      const labelObject = this.edgeLabelObjects.get(edgeId);
      // 淡出并移除标签
      this.animate({
        target: labelObject,
        properties: {
          alpha: 0
        },
        duration: 300,
        onUpdate: () => {
          // 更新渲染
        },
        onComplete: () => {
          if (this.edgeLabelContainer) {
            this.edgeLabelContainer.removeChild(labelObject);
          }
          this.edgeLabelObjects.delete(edgeId);
        }
      });
    }

    this.app.renderer.render(this.app.stage);
  }

  /**
   * 节点出现动画
   */
  animateNodeAppearance(nodeId, duration = 1000, easing = this.easeOutElastic, onComplete) {
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage || !this.nodeContainer) return;
    
    // 获取节点对象
    const nodeObject = this.nodeObjects.get(nodeId);
    if (!nodeObject) return;

    // 设置初始状态
    nodeObject.alpha = 0;
    nodeObject.scale.set(0.01);

    // 执行动画
    this.animate({
      target: nodeObject,
      properties: {
        alpha: 1,
        scale: { x: 1, y: 1 }
      },
      duration: duration,
      easing: easing,
      onUpdate: () => {
        // 更新渲染
      },
      onComplete: onComplete
    });
  }

  /**
   * 边出现动画 - 从起点线性扩展到终点（使用坐标插值方式）
   */
  animateEdgeAppearance(edgeId, duration = 1000, easing = (progress) => progress, onComplete) {
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage) return;
    
    // 获取边对象
    const edgeObject = this.edgeObjects.get(edgeId);
    if (!edgeObject) return;

    // 获取起点和终点坐标
    const startX = edgeObject.startX || 0;
    const startY = edgeObject.startY || 0;
    const targetEndX = edgeObject.endX || 0;
    const targetEndY = edgeObject.endY || 0;

    // 设置初始状态：从起点到起点（长度为0），但确保边可见
    edgeObject.alpha = 1;
    edgeObject.clear();
    const edgeStyle = { ...this.defaultEdgeStyle, ...(edgeObject.style || {}) };
    edgeObject.moveTo(startX, startY);
    edgeObject.lineTo(startX, startY);
    edgeObject.stroke({width: edgeStyle.strokeWidth, color: edgeStyle.stroke});

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
      edgeObject.clear();
      edgeObject.moveTo(startX, startY);
      edgeObject.lineTo(currentEndX, currentEndY);
      edgeObject.stroke({width: edgeStyle.strokeWidth, color: edgeStyle.stroke});

      // 当进度达到70%时开始显示标签
      if (progress >= 0.7) {
        const labelObject = this.edgeLabelObjects.get(edgeId);
        if (labelObject) {
          // 从0到1的线性过渡，在剩余30%的进度内完成标签显示
          const labelOpacity = Math.min(1, (progress - 0.7) / 0.3);
          labelObject.alpha = labelOpacity;
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 动画完成，确保精确设置最终坐标
        edgeObject.clear();
        edgeObject.moveTo(startX, startY);
        edgeObject.lineTo(targetEndX, targetEndY);
        edgeObject.stroke({width: edgeStyle.strokeWidth, color: edgeStyle.stroke});

        // 确保动画结束时标签完全显示
        const labelObject = this.edgeLabelObjects.get(edgeId);
        if (labelObject) {
          labelObject.alpha = 1;
        }

        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * 创建节点标签PIXI对象
   */
  createNodeLabelElement(nodeId, node) {
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage || !this.labelContainer) return;
    
    const nodeStyle = { ...this.defaultNodeStyle, ...node.style };
    
    const labelObject = new PIXI.Text({
      text: node.label,
      style: {
        fontSize: nodeStyle?.labelFontSize || 15,
        fill: nodeStyle?.labelFill || 0x000000,
        align: 'center'
      }
    });

    labelObject.x = node.x;
    labelObject.y = node.y;
    labelObject.anchor.set(0.5);

    // 添加到标签容器
    this.labelContainer.addChild(labelObject);

    // 存储标签对象引用
    this.nodeLabelObjects.set(nodeId, labelObject);
  }

  /**
   * 创建边标签PIXI对象
   */
  createEdgeLabelElement(edgeId, sourceNode, targetNode, label, style) {
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage || !this.edgeLabelContainer) return;
    
    const midX = (sourceNode.x + targetNode.x) / 2;
    const midY = (sourceNode.y + targetNode.y) / 2;

    const labelObject = new PIXI.Text({
      text: label,
      style: {
        fontSize: style?.labelFontSize || 14,
        fill: style?.labelFill || 0x000000,
        align: 'center'
      }
    });

    labelObject.x = midX;
    labelObject.y = midY;
    labelObject.anchor.set(0.5);
    labelObject.alpha = 0; // 初始透明度为0，等待边动画进行到70%时再显示

    // 添加到边标签容器
    this.edgeLabelContainer.addChild(labelObject);

    // 存储边标签对象引用
    this.edgeLabelObjects.set(edgeId, labelObject);
  }

  /**
   * 删除节点动画
   */
  removeNodeElement(nodeId, onComplete) {
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage || !this.nodeContainer) return;
    
    const nodeObject = this.nodeObjects.get(nodeId);
    const labelObject = this.nodeLabelObjects.get(nodeId);

    if (nodeObject) {
      // 节点消失动画
      this.animate({
        target: nodeObject,
        properties: {
          alpha: 0,
          scale: { x: 0, y: 0 }
        },
        duration: 1000,
        easing: this.easeOutQuad,
        onUpdate: () => {
          // 更新渲染
        },
        onComplete: () => {
          // 动画完成后移除元素
          this.nodeContainer.removeChild(nodeObject);
          this.nodeObjects.delete(nodeId);

          // 从existingNodeIds集合中删除节点ID
          this.existingNodeIds.delete(nodeId);

          // 如果有标签，也移除标签
          if (labelObject) {
            this.labelContainer.removeChild(labelObject);
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
    // 检查应用是否已初始化
    if (!this.app || !this.app.stage || !this.edgeContainer) return;
    
    const edgeObject = this.edgeObjects.get(edgeId);
    const labelObject = this.edgeLabelObjects.get(edgeId);

    if (!edgeObject) return;

    this.animate({
      target: edgeObject,
      properties: {
        alpha: 0
      },
      duration: 1000,
      easing: this.easeOutQuad,
      onUpdate: () => {
        // 更新渲染
      },
      onComplete: () => {
        this.edgeContainer.removeChild(edgeObject);
        this.edgeObjects.delete(edgeId);
        this.existingEdgeIds.delete(edgeId);

        if (labelObject) {
          this.edgeLabelContainer.removeChild(labelObject);
          this.edgeLabelObjects.delete(edgeId);
        }
        if (onComplete) onComplete();
      }
    });
  }

  /**
   * 通用动画函数
   */
  animate(options) {
    const {
      target,
      properties,
      duration,
      easing = (t) => t,
      onUpdate,
      onComplete
    } = options;

    const startTime = Date.now();
    const initialValues = {};

    // 记录初始值
    for (const prop in properties) {
      if (prop === 'scale') {
        initialValues.scale = { x: target.scale.x, y: target.scale.y };
      } else {
        initialValues[prop] = target[prop];
      }
    }

    const animateFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easing(progress);

      // 更新属性
      for (const prop in properties) {
        if (prop === 'scale') {
          target.scale.x = initialValues.scale.x + (properties.scale.x - initialValues.scale.x) * easeProgress;
          target.scale.y = initialValues.scale.y + (properties.scale.y - initialValues.scale.y) * easeProgress;
        } else {
          target[prop] = initialValues[prop] + (properties[prop] - initialValues[prop]) * easeProgress;
        }
      }

      if (onUpdate) onUpdate();

      // 强制重新渲染
      if (this.app && this.app.renderer && this.app.stage) {
        this.app.renderer.render(this.app.stage);
      }

      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animateFrame);
  }

  /**
   * 缓动函数
   */
  easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  easeOutElastic(t) {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  }

  /**
   * 导出为图像
   */
  exportAsImage() {
    // 检查应用是否已初始化
    if (!this.app || !this.app.renderer) return null;
    
    // 返回canvas的base64数据
    try {
      return this.app.renderer.extract.base64(this.app.stage);
    } catch (e) {
      console.warn('无法导出图像:', e);
      return null;
    }
  }
}

export default PixiGraphRenderer;