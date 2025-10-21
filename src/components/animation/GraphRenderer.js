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
          // 边淡出动画
          edgeObject.animate('opacity', 0, {
            duration: 1000,
            easing: fabric.util.ease.easeOutQuad,
            onChange: () => {
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
            labelObject.animate('opacity', 0, {
              duration: 1000,
              easing: fabric.util.ease.easeOutQuad,
              onChange: () => {
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
    } else {
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
    
    // 创建路径数据
    const pathData = this.createPathData(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y);
    
    // 创建路径对象
    const edgeObject = new fabric.Path(pathData, {
      fill: 'none',
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
   * 更新节点元素
   */
  updateNodeElement(nodeId, node) {
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
    
    // 使用Fabric.js动画
    nodeObject.animate({
      left: node.x,
      top: node.y
    }, {
      duration: 1000,
      easing: fabric.util.ease.easeOutQuad,
      onChange: () => {
        this.canvas.renderAll();
      }
    });
    
    // 更新或创建节点标签
    if (node.label) {
      const labelObject = this.nodeLabelObjects.get(nodeId);
      if (labelObject) {
        // 更新标签位置和内容
        labelObject.set({
          text: node.label,
          fill: nodeStyle?.labelFill || '#ffffff',
          fontSize: nodeStyle?.labelFontSize || 12
        });
        
        // 同步标签动画
        labelObject.animate({
          left: node.x,
          top: node.y
        }, {
          duration: 1000,
          easing: fabric.util.ease.easeOutQuad,
          onChange: () => {
            this.canvas.renderAll();
          }
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
  }
  
  /**
   * 更新边位置
   */
  updateEdgePosition(edgeId, sourceNode, targetNode, label) {
    // 直接获取边对象，与其他方法保持一致
    const edgeObject = this.edgeObjects.get(edgeId);
    if (!edgeObject) return;
    
    const labelObject = this.edgeLabelObjects.get(edgeId);
    
    // 创建新的路径数据
    const newPathData = this.createPathData(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y);
    
    // 使用Fabric.js动画更新路径
    const oldPath = edgeObject.path;
    const newPathObj = new fabric.Path(newPathData);
    const newPath = newPathObj.path;
    
    // 使用自定义动画来平滑过渡路径
    this.animatePath(edgeObject, oldPath, newPath, 1000);
    
    // 更新或创建边标签
    if (label) {
      if (labelObject) {
        // 更新标签内容
        labelObject.set('text', label);
        labelObject.set('opacity', 1);
        
        // 移动标签到新位置
        labelObject.animate({
          left: (sourceNode.x + targetNode.x) / 2,
          top: (sourceNode.y + targetNode.y) / 2
        }, {
          duration: 1000,
          easing: fabric.util.ease.easeOutQuad,
          onChange: () => {
            this.canvas.renderAll();
          }
        });
      } else {
        // 使用默认样式创建新标签
        const defaultStyle = { ...this.defaultEdgeStyle };
        this.createEdgeLabelElement(edgeId, sourceNode, targetNode, label, defaultStyle);
        // 淡入新标签
        const newLabelObject = this.edgeLabelObjects.get(edgeId);
        newLabelObject.animate('opacity', 1, {
          duration: 300,
          onChange: () => {
            this.canvas.renderAll();
          }
        });
      }
    } else if (labelObject) {
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
  }
  
  /**
   * 路径动画辅助方法
   */
  animatePath(pathObject, fromPath, toPath, duration) {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeProgress = fabric.util.ease.easeOutQuad(progress);
      
      // 计算插值路径
      const interpolatedPath = fromPath.map((segment, i) => {
        if (!toPath[i]) return segment;
        const type = segment[0];
        const interpolatedPoints = segment.slice(1).map((point, j) => {
          const toPoint = toPath[i][j + 1] || 0;
          return point + (toPoint - point) * easeProgress;
        });
        return [type, ...interpolatedPoints];
      });
      
      // 更新路径
      pathObject.set('path', interpolatedPath);
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
    
    // 保存原始路径数据，用于动画完成后恢复
    const originalPath = edgeObject.path;
    
    // 分析路径数据，提取起点和终点坐标
    // 假设路径是从一个点到另一个点的简单路径
    const pathCommands = originalPath;
    if (!pathCommands || pathCommands.length < 2) return;
    
    // 获取起点坐标（假设是M命令的坐标）
    const startCommand = pathCommands[0];
    if (!startCommand || startCommand[0] !== 'M') return;
    const startX = startCommand[1];
    const startY = startCommand[2];
    
    // 获取终点坐标（假设是L命令的坐标）
    const endCommand = pathCommands[pathCommands.length - 1];
    if (!endCommand || endCommand[0] !== 'L') return;
    const targetEndX = endCommand[1];
    const targetEndY = endCommand[2];
    
    // 创建初始路径：从起点到起点（长度为0）
    const initialPath = [
      ['M', startX, startY],
      ['L', startX, startY]
    ];
    
    // 设置初始状态
    edgeObject.set('opacity', 1);
    edgeObject.set('path', initialPath);
    edgeObject.set('strokeDashArray', null); // 确保没有虚线效果
    edgeObject.set('strokeDashOffset', 0);
    
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
      
      // 更新路径
      const currentPath = [
        ['M', startX, startY],
        ['L', currentEndX, currentEndY]
      ];
      
      edgeObject.set('path', currentPath);
      
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
        // 动画完成，恢复原始路径以确保精确匹配
        edgeObject.set('path', originalPath);
        
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
   * 计算路径长度
   */
  getPathLength(path) {
    // 简化的路径长度计算
    let length = 0;
    let prevX, prevY;
    
    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      const type = segment[0];
      
      switch (type) {
        case 'M': // Move to
          prevX = segment[1];
          prevY = segment[2];
          break;
        case 'L': // Line to
          const dx = segment[1] - prevX;
          const dy = segment[2] - prevY;
          length += Math.sqrt(dx * dx + dy * dy);
          prevX = segment[1];
          prevY = segment[2];
          break;
        // 可以添加其他路径类型的处理
      }
    }
    
    return length;
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
   * 创建路径数据
   */
  createPathData(x1, y1, x2, y2) {
    // 简单的直线路径
    return `M ${x1} ${y1} L ${x2} ${y2}`;
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
    } else if (labelObject) {
      // 单独处理标签
      labelObject.animate('opacity', 0, {
        duration: 800,
        easing: fabric.util.ease.easeOutQuad,
        onChange: () => {
          this.canvas.renderAll();
        },
        onComplete: () => {
          this.canvas.remove(labelObject);
          this.nodeLabelObjects.delete(nodeId);
          
          // 从existingNodeIds集合中删除节点ID
          this.existingNodeIds.delete(nodeId);
          
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
    
    if (edgeObject) {
      // 边淡出动画
      edgeObject.animate('opacity', 0, {
        duration: 1000,
        easing: fabric.util.ease.easeOutQuad,
        onChange: () => {
          this.canvas.renderAll();
        },
        onComplete: () => {
          // 动画完成后移除边元素
          this.canvas.remove(edgeObject);
          this.edgeObjects.delete(edgeId);
          
          // 从existingEdgeIds集合中删除边ID
          this.existingEdgeIds.delete(edgeId);
          
          // 如果有标签，也移除标签
          if (labelObject) {
            this.canvas.remove(labelObject);
            this.edgeLabelObjects.delete(edgeId);
          }
          
          if (onComplete) onComplete();
        }
      });
    } else if (labelObject) {
      // 单独处理标签
      labelObject.animate('opacity', 0, {
        duration: 1000,
        easing: fabric.util.ease.easeOutQuad,
        onChange: () => {
          this.canvas.renderAll();
        },
        onComplete: () => {
          this.canvas.remove(labelObject);
          this.edgeLabelObjects.delete(edgeId);
          
          // 从existingEdgeIds集合中删除边ID
          this.existingEdgeIds.delete(edgeId);
          
          if (onComplete) onComplete();
        }
      });
    }
  }
}

export default GraphRenderer;