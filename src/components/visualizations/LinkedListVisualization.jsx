import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import GraphCanvas from '../animation/GraphCanvas';

const LinkedListVisualization = forwardRef(({ radius = 30, maxSize = 10 }, ref) => {
  const graphCanvasRef = useRef(null);
  const listData = useRef([]); // 存储链表节点，每个节点包含value和id两个属性
  const nodeCount = useRef(0); // 当前节点数量
  const totalNodeCounter = useRef(0); // 历史添加过的总节点数，用于生成唯一id
  const isInitialized = useRef(false);
  const canvasWidth = radius * 1.5 * maxSize;
  const canvasHeight = radius * 1.5;

  // 直接使用listData存储链表数据，不需要额外的Node类定义

  // 完全使用listData数组实现链表功能，不需要额外的指针

  // 计算节点位置
  const calculateNodePosition = (index) => {
    const centerOffset = radius*0.75;
    const spacing = radius * 1.5;
    return {
      x: centerOffset + index * spacing,
      y: radius*0.75
    };
  };

  // 创建节点样式
  const createNodeStyle = (isHead = false, isTail = false) => {
    let fillColor = '#3b82f6'; // 蓝色
    
    if (isHead) {
      fillColor = '#10b981'; // 绿色 - 头节点
    } else if (isTail) {
      fillColor = '#f59e0b'; // 琥珀色 - 尾节点
    }
    
    return {
      fill: fillColor,
      stroke: '#1e40af',
      strokeWidth: 2,
      color: '#ffffff',
      fontSize: radius * 0.4,
      fontWeight: 'bold'
    };
  };

  // 创建边样式
  const createEdgeStyle = () => {
    return {
      stroke: '#64748b',
      lineWidth: 2,
    };
  };

  // 添加节点到链表头部
  const addToHead = (value, id = null) => {
    if (nodeCount.current >= maxSize) {
      console.error('链表已满，无法添加节点');
      return false;
    }
      
    if (!graphCanvasRef.current) {
      return false;
    }

    // 使用totalNodeCounter生成唯一id
    const nodeId = id || `node-${totalNodeCounter.current}`;
    // 增加总节点计数器
    totalNodeCounter.current++;
    
    // 创建新节点对象，包含value和id
    const newNode = { value, id: nodeId };
    
    // 调整现有节点位置和ID
    const oldList = [...listData.current];
    listData.current = [newNode, ...oldList];
    nodeCount.current++;
    
    // 更新现有节点的位置和样式
    for (let i = 0; i < oldList.length; i++) {
      const newPosition = calculateNodePosition(i + 1);
      const isTail = i === oldList.length - 1;
      
      // 保持节点ID不变，只更新位置
      const nodeId = oldList[i].id;
      graphCanvasRef.current.dispatchOperation('updateNode', {
        id: nodeId,
        x: newPosition.x,
        y: newPosition.y,
        style: createNodeStyle(false, isTail)
      });
    }
    
    // 计算新节点位置和样式
    const newNodePosition = calculateNodePosition(0);
    const newNodeStyle = createNodeStyle(true, nodeCount.current === 1);

    // 添加新节点
    graphCanvasRef.current.dispatchOperation('addNode', {
      id: nodeId,
      x: newNodePosition.x,
      y: newNodePosition.y,
      style: { ...newNodeStyle, size: radius },
      label: value.toString()
    });
    
    // 添加新边
    if (nodeCount.current >= 2) {
      graphCanvasRef.current.dispatchOperation('addEdge', {
        id: `edge-${listData.current[0].id}-${listData.current[1].id}`,
        source: listData.current[0].id,
        target: listData.current[1].id,
        style: createEdgeStyle()
      });
    }
    
    return true;
  };

  // 添加节点到链表尾部
  const addToTail = (value, id = null) => {
    if (nodeCount.current >= maxSize || !graphCanvasRef.current) {
      return false;
    }

    // 使用totalNodeCounter生成唯一id
    const nodeId = id || `node-${totalNodeCounter.current}`;
    // 增加总节点计数器
    totalNodeCounter.current++;
    
    // 创建新节点对象，包含value和id
    const newNode = { value, id: nodeId };
    
    // 更新数据
    listData.current.push(newNode);
    const newIndex = nodeCount.current;
    nodeCount.current++;
    
    // 计算新节点位置和样式
    const newNodePosition = calculateNodePosition(newIndex);
    const newNodeStyle = createNodeStyle(newIndex === 0, true);
    
    // 添加新节点
    graphCanvasRef.current.dispatchOperation('addNode', {
      id: nodeId,
      x: newNodePosition.x,
      y: newNodePosition.y,
      style: { ...newNodeStyle, size: radius },
      label: value.toString()
    });
    
    // 如果链表原来不为空，更新前一个节点的样式（不再是尾节点）
    if (newIndex > 0) {
      const prevNodeId = listData.current[newIndex - 1].id;
      graphCanvasRef.current.dispatchOperation('updateNode', {
        id: prevNodeId,
        style: createNodeStyle(newIndex - 1 === 0, false)
      });
      
      // 添加新的边
      graphCanvasRef.current.dispatchOperation('addEdge', {
        id: `edge-${prevNodeId}-${nodeId}`,
        source: prevNodeId,
        target: nodeId,
        style: createEdgeStyle()
      });
    }
    
    return true;
  };

  // 从链表头部删除节点
  const removeFromHead = () => {
    if (nodeCount.current === 0 || !graphCanvasRef.current) {
      return null;
    }

    // 获取要删除的节点值和ID
    const removedNode = listData.current[0];
    const removedValue = removedNode.value;
    const removedId = removedNode.id;
    
    // 更新数据
    listData.current.shift();
    const oldCount = nodeCount.current;
    nodeCount.current--;
    
    // 删除头节点
    graphCanvasRef.current.dispatchOperation('deleteNode', removedId);
    
    // 更新剩余节点的位置和样式
    for (let i = 0; i < listData.current.length; i++) {
      const newPosition = calculateNodePosition(i);
      const isHead = i === 0;
      const isTail = i === nodeCount.current - 1;
      
      // 使用updateNode更新节点位置和样式，保持ID不变
      const nodeId = listData.current[i].id;
      graphCanvasRef.current.dispatchOperation('updateNode', {
        id: nodeId,
        x: newPosition.x,
        y: newPosition.y,
        style: createNodeStyle(isHead, isTail)
      });
    }
    // 不需要手动更新边，GraphCanvas会自动调整边的位置
    
    return removedValue;
  };

  // 从链表尾部删除节点
  const removeFromTail = () => {
    if (nodeCount.current === 0 || !graphCanvasRef.current) {
      return null;
    }

    // 获取要删除的节点值和ID
    const removedNode = listData.current[nodeCount.current - 1];
    const removedValue = removedNode.value;
    const removedId = removedNode.id;
    
    // 更新链表结构
    if (nodeCount.current === 1) {
      // 只有一个节点的情况
      // 删除唯一的节点
      graphCanvasRef.current.dispatchOperation('deleteNode', removedId);
    } else {
      // 多个节点的情况
      const tailIndex = nodeCount.current - 1;
      
      // 删除尾节点
      graphCanvasRef.current.dispatchOperation('deleteNode', removedId);
      
      // 删除连接到尾节点的边
      const prevNodeId = listData.current[tailIndex - 1].id;
      
      // 更新倒数第二个节点为尾节点
      graphCanvasRef.current.dispatchOperation('updateNode', {
        id: prevNodeId,
        style: createNodeStyle(false, true)
      });
    }
    
    // 更新数据
    listData.current.pop();
    nodeCount.current--;
    
    return removedValue;
  };

  // 在指定位置插入节点
  const insertAt = (index, value, id = null) => {
    if (index < 0 || index > nodeCount.current || nodeCount.current >= maxSize || !graphCanvasRef.current) {
      return false;
    }

    if (index === 0) {
      return addToHead(value, id);
    }

    if (index === nodeCount.current) {
      return addToTail(value, id);
    }

    // 使用totalNodeCounter生成唯一id
    const nodeId = id || `node-${totalNodeCounter.current}`;
    // 增加总节点计数器
    totalNodeCounter.current++;
    
    // 创建新节点对象，包含value和id
    const newNode = { value, id: nodeId };
    
    // 保存插入位置后的节点值
    const nodesAfterInsert = listData.current.slice(index);
    
    // 更新数据
    listData.current.splice(index, 0, newNode);
    
    nodeCount.current++;
    
    // 计算新节点位置和样式
    const newNodePosition = calculateNodePosition(index);
    const isHead = index === 0;
    const isTail = index === nodeCount.current - 1;
    const newNodeStyle = createNodeStyle(isHead, isTail);
    
    // 添加新节点
    graphCanvasRef.current.dispatchOperation('addNode', {
      id: nodeId,
      x: newNodePosition.x,
      y: newNodePosition.y,
      style: { ...newNodeStyle, size: radius },
      label: value.toString()
    });
    
    // 使用updateNode更新插入位置后节点的位置和样式
    for (let i = 0; i < nodesAfterInsert.length; i++) {
      const nodeIndex = index + i + 1;
      const newPosition = calculateNodePosition(nodeIndex);
      const isHead = nodeIndex === 0;
      const isTail = nodeIndex === nodeCount.current - 1;
      
      const nodeToUpdate = nodesAfterInsert[i];
      graphCanvasRef.current.dispatchOperation('updateNode', {
        id: nodeToUpdate.id,
        x: newPosition.x,
        y: newPosition.y,
        style: createNodeStyle(isHead, isTail)
      });
    }
    // 不需要手动更新边，GraphCanvas会自动调整边的位置
    
    return true;
  };

  // 删除指定位置的节点
  const removeAt = (index) => {
    if (index < 0 || index >= nodeCount.current || nodeCount.current === 0 || !graphCanvasRef.current) {
      return null;
    }

    if (index === 0) {
      return removeFromHead();
    }

    if (index === nodeCount.current - 1) {
      return removeFromTail();
    }

    // 保存删除位置后的节点
    const nodesAfterDelete = listData.current.slice(index + 1);
    
    // 获取要删除的节点
    const removedNode = listData.current[index];
    const removedValue = removedNode.value;
    const removedId = removedNode.id;
    
    // 更新数据
    listData.current.splice(index, 1);
    const oldCount = nodeCount.current;
    nodeCount.current--;
    
    // 删除指定位置的节点
    graphCanvasRef.current.dispatchOperation('deleteNode', removedId);
    
    // 使用updateNode更新删除位置后节点的位置和样式
    for (let i = 0; i < nodesAfterDelete.length; i++) {
      const nodeIndex = index + i;
      const newPosition = calculateNodePosition(nodeIndex);
      const isHead = nodeIndex === 0;
      const isTail = nodeIndex === nodeCount.current - 1;
      
      const nodeToUpdate = nodesAfterDelete[i];
      graphCanvasRef.current.dispatchOperation('updateNode', {
        id: nodeToUpdate.id,
        x: newPosition.x,
        y: newPosition.y,
        style: createNodeStyle(isHead, isTail)
      });
    }
    // 不需要手动更新边，GraphCanvas会自动调整边的位置
    
    return removedValue;
  };

  // 查找节点值
  const search = (value) => {
    return listData.current.findIndex(node => node.value === value);
  };

  // 获取链表头部元素
  const peek = () => {
    return listData.current.length > 0 ? listData.current[0].value : null;
  };

  // 清空链表
  const clear = () => {
    if (graphCanvasRef.current) {
      // 使用专门的清空操作，比循环删除更高效
      graphCanvasRef.current.dispatchOperation('clearGraph');
    }
    listData.current = [];
    nodeCount.current = 0;
  };

  // 设置链表内容
  const setList = (newList) => {
    if (graphCanvasRef.current) {
      // 先清空现有内容
      clear();
      
      // 添加新的链表元素
      const elementsToAdd = newList.slice(0, maxSize); // 限制最大大小
      const nodes = [];
      
      elementsToAdd.forEach((value, index) => {
        // 使用totalNodeCounter生成唯一id
        const nodeId = `node-${totalNodeCounter.current}`;
        // 增加总节点计数器
        totalNodeCounter.current++;
        
        // 创建新节点对象，包含value和id
        const newNode = { value, id: nodeId };
        nodes.push(newNode);
        
        // 直接添加节点，不使用addToTail避免重复的逻辑
        const position = calculateNodePosition(index);
        const isHead = index === 0;
        const isTail = index === elementsToAdd.length - 1;
        const nodeStyle = createNodeStyle(isHead, isTail);
        
        graphCanvasRef.current.dispatchOperation('addNode', {
          id: nodeId,
          x: position.x,
          y: position.y,
          style: { ...nodeStyle, size: radius },
          label: value.toString()
        });
        
        // 添加边
        if (index > 0) {
          const prevNodeId = nodes[index - 1].id;
          graphCanvasRef.current.dispatchOperation('addEdge', {
            id: `edge-${prevNodeId}-${nodeId}`,
            source: prevNodeId,
            target: nodeId,
            style: createEdgeStyle()
          });
        }
      });
      
      // 更新数据
      listData.current = nodes;
      nodeCount.current = nodes.length;
    }
  };

  // 获取链表的大小
  const size = () => {
    return nodeCount.current;
  };

  // 检查链表是否为空
  const isEmpty = () => {
    return nodeCount.current === 0;
  };

  // 手动更新相关边，而不是重新绘制所有边
  
  // 初始化时设置
  useEffect(() => {
    if (!isInitialized.current && graphCanvasRef.current) {
      // 初始化链表为空
      listData.current = [];
      nodeCount.current = 0;
      totalNodeCounter.current = 0; // 初始化总节点计数器
      isInitialized.current = true;
    }
  }, []);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    addToHead,
    addToTail,
    removeFromHead,
    removeFromTail,
    insertAt,
    removeAt,
    search,
    peek,
    clear,
    setList,
    size,
    isEmpty
  }));

  return (
    <div className="linked-list-visualization">
      <GraphCanvas 
        ref={graphCanvasRef}
        width={canvasWidth}
        height={canvasHeight}
        enableDrawing={false}
      />
      {/* 链表指示器 */}
      {listData.current.length > 0 && (
        <div className="flex justify-between text-xs mt-1 px-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 mr-1"></div>
            <span>头节点</span>
          </div>
          {listData.current.length > 1 && (
            <div className="flex items-center">
              <span>尾节点</span>
              <div className="w-3 h-3 bg-amber-500 ml-1"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

LinkedListVisualization.displayName = 'LinkedListVisualization';

export default LinkedListVisualization;