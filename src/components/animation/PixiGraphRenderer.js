// PixiGraphRenderer.js - 使用PixiJS渲染图并实现动画效果
import * as PIXI from 'pixi.js';

/**
 * PixiGraphRenderer类
 * 使用PixiJS渲染图并实现动画效果
 */
export class PixiGraphRenderer {
  static preloadedIcons = {};
  
  constructor(width, height, backgroundImage = null, nodesStyle = {}, edgesStyle = {}, onInit = null) {
    // 创建canvas元素
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.canvasElement.style.display = 'block';
    
    // 保存背景图片参数
    this.backgroundImage = backgroundImage;
    // 保存回调函数
    this.onInitCallback = onInit;
    // 保存全局样式参数
    this.globalNodesStyle = nodesStyle || {};
    this.globalEdgesStyle = edgesStyle || {};
    // 初始化容器
    this.initContainers();
    
    // 初始化PIXI应用 - PixiJS v8 使用异步初始化
    this.app = new PIXI.Application();
    
    // 初始化应用
    this.initApp(width, height).then(() => {
      // 初始化完成后调用回调函数
      if (this.onInitCallback) {
        this.onInitCallback(this);
      }
    });
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
      type: 'circle',
      fill: 0x3f51b5,
      stroke: 0x000000,
      lineWidth: 2
    };

    this.defaultEdgeStyle = {
      stroke: 0x999999,
      lineWidth: 2
    };
    
    // 合并全局样式到默认样式
    if (this.globalNodesStyle) {
      this.defaultNodeStyle = { ...this.defaultNodeStyle, ...this.globalNodesStyle };
    }
    
    if (this.globalEdgesStyle) {
      this.defaultEdgeStyle = { ...this.defaultEdgeStyle, ...this.globalEdgesStyle };
    };
  }

  /**
   * 异步初始化PIXI应用
   * @returns {Promise<void>} 初始化完成的Promise
   */
  async initApp(width, height) {
    // 根据backgroundImage参数决定初始化配置
    const initConfig = {
      width: width,
      height: height,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      canvas: this.canvasElement
    };
    
    if (this.backgroundImage === null) {
      console.log('初始化PixiGraphRenderer时，backgroundImage为null');
      initConfig.backgroundColor = 0xE5E5E5;
    }
    
    await this.app.init(initConfig);
    
    

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
   * 创建背景图像
   */
  async createBackgroundImage() {
      try {
        // 加载指定的背景图片
        const imagePath = `/icons/${this.backgroundImage}.png`;
        
        // 加载背景图像
        const texture = await PIXI.Assets.load(imagePath);
        
        // 创建背景精灵
        this.backgroundSprite = new PIXI.Sprite(texture);
        
        // 设置背景精灵的位置和缩放，使其适应canvas
        this.backgroundSprite.anchor.set(0, 0);
        
        // 计算缩放比例以适应canvas尺寸
        const scaleX = this.app.screen.width / texture.width;
        const scaleY = this.app.screen.height / texture.height;
        const scale = Math.max(scaleX, scaleY); // 选择较大的缩放比例以完全覆盖
        
        this.backgroundSprite.scale.set(scale);
        
        // 将背景精灵添加到舞台的最底层
        this.app.stage.addChildAt(this.backgroundSprite, 0);
      } catch (error) {
        console.error('Failed to load background image:', error);
        // 如果加载失败，使用0x7CFC00背景色
        this.app.renderer.backgroundColor = 0x7CFC00;
      }
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

  getTextureForType(type) {
    const cached = PixiGraphRenderer.preloadedIcons[type];
    if (cached) {
      return Promise.resolve(cached);
    }
    return PIXI.Assets.load(`/icons/${type}.png`).then((texture) => {
      PixiGraphRenderer.preloadedIcons[type] = texture;
      return texture;
    });
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
    
    const nodeStyle = { ...this.defaultNodeStyle, ...node.style };
    const size = nodeStyle.size || 20;
    
    let nodeObject;

    // 根据节点类型创建不同的PIXI对象
    if (nodeStyle.type === 'square') {
      // 创建矩形节点
      nodeObject = new PIXI.Graphics();
      nodeObject.rect(-size/2, -size/2, size, size);
      nodeObject.fill({color: nodeStyle.fill});
      nodeObject.stroke({width: nodeStyle.lineWidth, color: nodeStyle.stroke});
      nodeObject.x = node.x;
      nodeObject.y = node.y;
    } else if (nodeStyle.type === 'circle') {
      // 创建圆形节点
      nodeObject = new PIXI.Graphics();
      nodeObject.circle(0, 0, size/2);
      nodeObject.fill({color: nodeStyle.fill});
      nodeObject.stroke({width: nodeStyle.lineWidth, color: nodeStyle.stroke});
      nodeObject.x = node.x;
      nodeObject.y = node.y;
    } else {
      const typeColor = {
        planet1: 0x99CCFF,
        planet2: 0xB2F1DC,
        planet3: 0xFFE0A3,
        planet4: 0xFFB3B3,
        house: 0xC3C8FF
      };
      const fillColor = typeColor[nodeStyle.type] ?? this.defaultNodeStyle.fill;
      nodeObject = new PIXI.Graphics();
      nodeObject.circle(0, 0, size/2);
      nodeObject.fill({ color: fillColor });
      nodeObject.stroke({ width: nodeStyle.lineWidth, color: nodeStyle.stroke });
      nodeObject.x = node.x;
      nodeObject.y = node.y;
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
    
    // 根据是否有弧度属性决定绘制直线还是曲线
    if (edgeStyle.curvature && edgeStyle.curvature !== 0) {
      // 绘制曲线
      this.drawCurvedLine(edgeObject, sourceNode, targetNode, edgeStyle);
    } else {
      // 绘制直线
      edgeObject.moveTo(sourceNode.x, sourceNode.y);
      edgeObject.lineTo(targetNode.x, targetNode.y);
    }
    
    edgeObject.stroke({width: edgeStyle.lineWidth, color: edgeStyle.stroke});
    edgeObject.alpha = 1;
    edgeObject.style = edgeStyle;

    // 记录坐标
    edgeObject.startX = sourceNode.x;
    edgeObject.startY = sourceNode.y;
    edgeObject.endX = targetNode.x;
    edgeObject.endY = targetNode.y;

    // 添加到边容器
    this.edgeContainer.addChild(edgeObject);

    // 如果是有向边，绘制箭头
    // 首先检查单个边的style中是否有directional属性，然后再使用全局edgesStyle中的值
    const isDirectional = style && 'directional' in style ? style.directional : this.globalEdgesStyle.directional;
    if (isDirectional) {
      this.drawArrow(edgeObject, sourceNode, targetNode, edgeStyle);
    }

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

    const nodeStyle = { ...this.defaultNodeStyle, ...node.style };
    const size = nodeStyle.size || 20;

    // 重新绘制节点
    nodeObject.clear();
    
    if (nodeStyle.type === 'square') {
      nodeObject.rect(-size/2, -size/2, size, size);
    } else {
      nodeObject.circle(0, 0, size/2);
    }
    
    nodeObject.fill({color: nodeStyle.fill});
    nodeObject.stroke({width: nodeStyle.lineWidth, color: nodeStyle.stroke});

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
        edgeObject.stroke({width: edgeStyle.lineWidth, color: edgeStyle.stroke});
        
        // 更新坐标记录
        if (isSource) {
          edgeObject.startX = currentX;
          edgeObject.startY = currentY;
        }
        if (isTarget) {
          edgeObject.endX = currentX;
          edgeObject.endY = currentY;
        }
        
        // 如果是有向边，直接在边对象上绘制箭头（与animateEdgeAppearance保持一致）
        // 首先检查单个边的style中是否有directional属性，然后再使用全局edgesStyle中的值
        const isDirectional = edgeObject.style && 'directional' in edgeObject.style ? edgeObject.style.directional : this.defaultEdgeStyle.directional;
        if (isDirectional) {
          // 创建临时节点对象传递给drawArrow
          const startNode = { x: edgeObject.startX, y: edgeObject.startY };
          const endNode = { x: edgeObject.endX, y: edgeObject.endY };
          this.drawArrow(edgeObject, startNode, endNode, edgeStyle);
        }

        // 更新边标签位置
        const edgeLabelObject = this.edgeLabelObjects.get(edgeId);
        if (edgeLabelObject) {
          const ratio = edgeStyle?.labelPosition !== undefined ? edgeStyle.labelPosition : 0.5;
          // 计算新的边标签位置（考虑曲率）
          if (edgeStyle.curvature && edgeStyle.curvature !== 0) {
            const point = this.getCurvedLinePointAndAngle(
              {x: edgeObject.startX, y: edgeObject.startY}, 
              {x: edgeObject.endX, y: edgeObject.endY}, 
              edgeStyle.curvature, 
              ratio
            );
            edgeLabelObject.x = point.x;
            edgeLabelObject.y = point.y;
          } else {
            // 计算新的边中点
            const midX = edgeObject.startX + (edgeObject.endX - edgeObject.startX) * ratio;
            const midY = edgeObject.startY + (edgeObject.endY - edgeObject.startY) * ratio;
            edgeLabelObject.x = midX;
            edgeLabelObject.y = midY;
          }
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
      // 根据是否有弧度属性决定绘制直线还是曲线
      if (edgeStyle.curvature && edgeStyle.curvature !== 0) {
        // 绘制曲线
        this.drawCurvedLine(edgeObject, 
          {x: edgeObject.startX, y: edgeObject.startY}, 
          {x: edgeObject.endX, y: edgeObject.endY}, 
          edgeStyle);
      } else {
        // 绘制直线
        edgeObject.moveTo(edgeObject.startX, edgeObject.startY);
        edgeObject.lineTo(edgeObject.endX, edgeObject.endY);
      }
    }
    
    edgeObject.stroke({width: edgeStyle.lineWidth, color: edgeStyle.stroke});
    edgeObject.alpha = 1; // 确保边可见

    // 如果是有向边，绘制箭头
    // 首先检查单个边的style中是否有directional属性，然后再使用全局edgesStyle中的值
    const isDirectional = style && 'directional' in style ? style.directional : this.globalEdgesStyle.directional;
    if (isDirectional) {
      // 需要获取节点信息来绘制箭头
      const edgeData = this.edges?.find(e => e.id === edgeId);
      if (edgeData) {
        const sourceNode = this.nodes?.find(n => n.id === edgeData.source);
        const targetNode = this.nodes?.find(n => n.id === edgeData.target);
        if (sourceNode && targetNode) {
          this.drawArrow(edgeObject, sourceNode, targetNode, edgeStyle);
        }
      }
    }

    // 更新或创建边标签
    if (label) {
      const labelObject = this.edgeLabelObjects.get(edgeId);
      if (labelObject) {
        // 更新标签内容和样式
        labelObject.text = label;
        labelObject.style.fill = edgeStyle?.labelFill || 0x000000;
        labelObject.style.fontSize = edgeStyle?.labelFontSize || 14;
        
        // 更新位置
        const ratio = edgeStyle?.labelPosition !== undefined ? edgeStyle.labelPosition : 0.5;
        if (edgeStyle.curvature && edgeStyle.curvature !== 0) {
           const point = this.getCurvedLinePointAndAngle(
             {x: edgeObject.startX, y: edgeObject.startY}, 
             {x: edgeObject.endX, y: edgeObject.endY}, 
             edgeStyle.curvature, 
             ratio
           );
           labelObject.x = point.x;
           labelObject.y = point.y;
        } else {
           labelObject.x = edgeObject.startX + (edgeObject.endX - edgeObject.startX) * ratio;
           labelObject.y = edgeObject.startY + (edgeObject.endY - edgeObject.startY) * ratio;
        }

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
    
    // 根据是否有弧度属性决定绘制直线还是曲线
    if (edgeStyle.curvature && edgeStyle.curvature !== 0) {
      // 绘制曲线
      this.drawCurvedLine(edgeObject, sourceNode, targetNode, edgeStyle);
    } else {
      // 绘制直线
      edgeObject.moveTo(sourceNode.x, sourceNode.y);
      edgeObject.lineTo(targetNode.x, targetNode.y);
    }
    
    edgeObject.stroke({width: edgeStyle.lineWidth, color: edgeStyle.stroke});
    
    // 如果是有向边，绘制箭头
    // 首先检查单个边的style中是否有directional属性，然后再使用全局edgesStyle中的值
    const isDirectional = (edgeObject.style || style) && 'directional' in (edgeObject.style || style) ? (edgeObject.style || style).directional : this.globalEdgesStyle.directional;
    if (isDirectional) {
      this.drawArrow(edgeObject, sourceNode, targetNode, edgeStyle);
    }
    
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
        const ratio = edgeStyle?.labelPosition !== undefined ? edgeStyle.labelPosition : 0.5;
        if (edgeStyle.curvature && edgeStyle.curvature !== 0) {
           const point = this.getCurvedLinePointAndAngle(sourceNode, targetNode, edgeStyle.curvature, ratio);
           labelObject.x = point.x;
           labelObject.y = point.y;
        } else {
           const midX = sourceNode.x + (targetNode.x - sourceNode.x) * ratio;
           const midY = sourceNode.y + (targetNode.y - sourceNode.y) * ratio;
           labelObject.x = midX;
           labelObject.y = midY;
        }
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
      
      // 根据是否有弧度属性决定绘制直线还是曲线
      if (edgeStyle.curvature && edgeStyle.curvature !== 0) {
        // 绘制曲线
        this.drawCurvedLine(edgeObject, 
          {x: newStartX, y: newStartY}, 
          {x: newEndX, y: newEndY}, 
          edgeStyle);
      } else {
        // 绘制直线
        edgeObject.moveTo(newStartX, newStartY);
        edgeObject.lineTo(newEndX, newEndY);
      }
      
      edgeObject.stroke({width: edgeStyle.lineWidth, color: edgeStyle.stroke});
      
      // 如果是有向边，绘制箭头
      // 首先检查单个边的style中是否有directional属性，然后再使用全局edgesStyle中的值
      const isDirectional = edgeObject.style && 'directional' in edgeObject.style ? edgeObject.style.directional : this.defaultEdgeStyle.directional;
      if (isDirectional) {
        const startNode = { x: newStartX, y: newStartY };
        const endNode = { x: newEndX, y: newEndY };
        this.drawArrow(edgeObject, startNode, endNode, edgeStyle);
      }
      
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
        
        // 根据是否有弧度属性决定绘制直线还是曲线
        if (edgeStyle.curvature && edgeStyle.curvature !== 0) {
          // 绘制曲线
          this.drawCurvedLine(edgeObject, sourceNode, targetNode, edgeStyle);
        } else {
          // 绘制直线
          edgeObject.moveTo(targetStartX, targetStartY);
          edgeObject.lineTo(targetEndX, targetEndY);
        }
        
        edgeObject.stroke({width: edgeStyle.lineWidth, color: edgeStyle.stroke});
        
        // 如果是有向边，绘制箭头
        // 首先检查单个边的style中是否有directional属性，然后再使用全局edgesStyle中的值
        const isDirectional = edgeObject.style && 'directional' in edgeObject.style ? edgeObject.style.directional : this.defaultEdgeStyle.directional;
        if (isDirectional) {
          this.drawArrow(edgeObject, sourceNode, targetNode, edgeStyle);
        }
        
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
    
    // 根据是否有弧度属性决定绘制直线还是曲线
    if (edgeStyle.curvature && edgeStyle.curvature !== 0) {
      // 绘制曲线（初始状态为起点到起点）
      this.drawCurvedLine(edgeObject, 
        {x: startX, y: startY}, 
        {x: startX, y: startY}, 
        edgeStyle);
    } else {
      // 绘制直线（初始状态为起点到起点）
      edgeObject.moveTo(startX, startY);
      edgeObject.lineTo(startX, startY);
    }
    
    edgeObject.stroke({width: edgeStyle.lineWidth, color: edgeStyle.stroke});

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
      
      // 根据是否有弧度属性决定绘制直线还是曲线
      if (edgeStyle.curvature && edgeStyle.curvature !== 0) {
        // 绘制曲线
        this.drawCurvedLine(edgeObject, 
          {x: startX, y: startY}, 
          {x: currentEndX, y: currentEndY}, 
          edgeStyle);
      } else {
        // 绘制直线
        edgeObject.moveTo(startX, startY);
        edgeObject.lineTo(currentEndX, currentEndY);
      }
      
      edgeObject.stroke({width: edgeStyle.lineWidth, color: edgeStyle.stroke});

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
        
        // 根据是否有弧度属性决定绘制直线还是曲线
        if (edgeStyle.curvature && edgeStyle.curvature !== 0) {
          // 绘制曲线
          this.drawCurvedLine(edgeObject, 
            {x: startX, y: startY}, 
            {x: targetEndX, y: targetEndY}, 
            edgeStyle);
        } else {
          // 绘制直线
          edgeObject.moveTo(startX, startY);
          edgeObject.lineTo(targetEndX, targetEndY);
        }
        
        edgeObject.stroke({width: edgeStyle.lineWidth, color: edgeStyle.stroke});

        // 如果是有向边，在动画完成后绘制箭头
        // 首先检查单个边的style中是否有directional属性，然后再使用全局edgesStyle中的值
        const isDirectional = edgeObject.style && 'directional' in edgeObject.style ? edgeObject.style.directional : this.defaultEdgeStyle.directional;
        if (isDirectional) {
          const startNode = { x: startX, y: startY };
          const endNode = { x: targetEndX, y: targetEndY };
          this.drawArrow(edgeObject, startNode, endNode, edgeStyle);
        }

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
    
    let midX, midY;
    const ratio = style?.labelPosition !== undefined ? style.labelPosition : 0.5;

    if (style && style.curvature && style.curvature !== 0) {
      const point = this.getCurvedLinePointAndAngle(sourceNode, targetNode, style.curvature, ratio);
      midX = point.x;
      midY = point.y;
    } else {
      midX = sourceNode.x + (targetNode.x - sourceNode.x) * ratio;
      midY = sourceNode.y + (targetNode.y - sourceNode.y) * ratio;
    }

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
   * 计算二次贝塞尔曲线的长度
   * @param {Object} start - 起始点 {x, y}
   * @param {Object} end - 终止点 {x, y}
   * @param {number} curvature - 曲率
   * @returns {number} 曲线长度
   */
  calculateBezierCurveLength(start, end, curvature) {
    // 计算控制点
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const midX = start.x + dx * 0.5;
    const midY = start.y + dy * 0.5;
    
    // 计算垂直方向向量
    const perpX = -dy;
    const perpY = dx;
    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
    
    // 确保不会除以零
    if (perpLength === 0) return Math.sqrt(dx * dx + dy * dy);
    
    // 归一化垂直方向向量
    const normalizedPerpX = perpX / perpLength;
    const normalizedPerpY = perpY / perpLength;
    
    // 计算控制点
    const controlPointX = midX + normalizedPerpX * curvature * Math.sqrt(dx * dx + dy * dy);
    const controlPointY = midY + normalizedPerpY * curvature * Math.sqrt(dx * dx + dy * dy);
    
    // 使用高斯-勒让德积分近似计算曲线长度
    const steps = 100; // 采样点数量
    let length = 0;
    let prevX, prevY;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cX = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * controlPointX + t * t * end.x;
      const cY = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * controlPointY + t * t * end.y;
      
      if (i > 0) {
        const segmentLength = Math.sqrt(
          Math.pow(cX - prevX, 2) + Math.pow(cY - prevY, 2)
        );
        length += segmentLength;
      }
      
      prevX = cX;
      prevY = cY;
    }
    
    return length;
  }

  /**
   * 绘制箭头
   * @param {PIXI.Graphics} graphics - PIXI图形对象
   * @param {Object} startNode - 起始节点 {x, y}
   * @param {Object} endNode - 终止节点 {x, y}
   * @param {Object} style - 边样式
   */
  drawArrow(graphics, startNode, endNode, style) {
    // 获取边的曲率属性
    const curvature = style.curvature || 0;
    
    // 计算边的长度
    const curveLength = this.calculateBezierCurveLength(startNode, endNode, curvature);
      // 根据边的长度动态计算箭头数量
    // 初始化位置数组
    const positions = [];
    
    if (curveLength < 200) {
      positions.push(0.4);
      positions.push(0.7);
    } else {
      const NumArrows = Math.floor((curveLength-100) / 30) ;
      for (let i = 0; i < NumArrows; i++) {
        const position = 0.4 - 0.3 / NumArrows * i;
        positions.push(position);
        positions.push(1-position);
      }
    }
    
    // 对于每个位置计算箭头
    positions.forEach(ratio => {
      let tipX, tipY, angle;
      
      if (curvature !== 0) {
        // 对于曲线边，计算曲线上的点和切线角度
        const point = this.getCurvedLinePointAndAngle(startNode, endNode, curvature, ratio);
        tipX = point.x;
        tipY = point.y;
        angle = point.angle;
      } else {
        // 对于直线边，使用原有的计算方法
        const dx = endNode.x - startNode.x;
        const dy = endNode.y - startNode.y;
        angle = Math.atan2(dy, dx);
        tipX = startNode.x + dx * ratio;
        tipY = startNode.y + dy * ratio;
      }
      
      const headLength = style.lineWidth*2/3 || 10;
      
      // 计算箭头左右两个点
      const leftX = tipX - Math.cos(angle - Math.PI / 6) * headLength;
      const leftY = tipY - Math.sin(angle - Math.PI / 6) * headLength;

      const rightX = tipX - Math.cos(angle + Math.PI / 6) * headLength;
      const rightY = tipY - Math.sin(angle + Math.PI / 6) * headLength;

      // 绘制箭头
      graphics.moveTo(leftX, leftY);
      graphics.lineTo(tipX, tipY);
      graphics.lineTo(rightX, rightY);
    });

    // 设置箭头样式
    graphics.stroke({ width: style.lineWidth/4 || 3, color: style.color || 0x4FC3F7 });
  }

  /**
   * 获取曲线边上的点坐标和切线角度
   * @param {Object} startNode - 起始节点 {x, y}
   * @param {Object} endNode - 终止节点 {x, y}
   * @param {number} curvature - 曲率
   * @param {number} t - 曲线参数 (0-1)
   * @returns {Object} 点坐标和角度 {x, y, angle}
   */
  getCurvedLinePointAndAngle(startNode, endNode, curvature, t) {
    curvature = curvature*Math.sqrt(2);
    const startX = startNode.x;
    const startY = startNode.y;
    const endX = endNode.x;
    const endY = endNode.y;
    
    // 计算控制点
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // 计算垂直方向向量
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 标准化垂直向量
    const perpDx = -dy / distance;
    const perpDy = dx / distance;
    
    // 控制点位置
    const controlX = midX + perpDx * distance * curvature;
    const controlY = midY + perpDy * distance * curvature;
    
    // 使用二次贝塞尔曲线公式计算点坐标
    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;
    
    // 计算切线向量（导数）
    const tangentX = 2 * (1 - t) * (controlX - startX) + 2 * t * (endX - controlX);
    const tangentY = 2 * (1 - t) * (controlY - startY) + 2 * t * (endY - controlY);
    
    // 计算角度
    const angle = Math.atan2(tangentY, tangentX);
    
    return { x, y, angle };
  }
  
  /**
   * 绘制曲线边
   * @param {PIXI.Graphics} graphics - PIXI图形对象
   * @param {Object} startNode - 起始节点 {x, y}
   * @param {Object} endNode - 终止节点 {x, y}
   * @param {Object} style - 边样式，包含curvature属性
   */
  drawCurvedLine(graphics, startNode, endNode, style) {
    const curvature = style.curvature || 0.3;
    const startX = startNode.x;
    const startY = startNode.y;
    const endX = endNode.x;
    const endY = endNode.y;
    
    // 计算控制点
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // 计算垂直方向向量
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 标准化垂直向量
    const perpDx = -dy / distance;
    const perpDy = dx / distance;
    
    // 控制点位置
    const controlX = midX + perpDx * distance * curvature;
    const controlY = midY + perpDy * distance * curvature;
    
    // 绘制二次贝塞尔曲线
    graphics.moveTo(startX, startY);
    graphics.bezierCurveTo(controlX, controlY, controlX, controlY, endX, endY);
    
    // 将控制点信息存储在graphics对象上，供箭头绘制使用
    graphics._bezierInfo = {
      startX, startY,
      controlX, controlY,
      endX, endY
    };
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
