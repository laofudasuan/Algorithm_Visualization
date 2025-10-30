import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import GraphCanvas from '../animation/GraphCanvas';

const LinkedListVisualization = forwardRef(({ radius = 30, maxSize = 10 }, ref) => {
  const graphCanvasRef = useRef(null);
  const listData = useRef([]); // 存储链表节点值
  const nodeCount = useRef(0); // 当前节点数量
  const totalNodeCounter = useRef(0); // 历史添加过的总节点数，用于生成唯一id
  const isInitialized = useRef(false);
  const canvasWidth = radius * 1.5 * maxSize;
  const canvasHeight = radius * 1.5;

  // 节点类定义
  class Node {
    constructor(value, id = null) {
      this.value = value;
      this.next = null;
      // 如果没有传入id，默认为null，将在添加到链表时设置
      this.id = id;
    }
  }

  // 链表头指针
  const head = useRef(null);

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

    // 创建新节点，使用totalNodeCounter生成唯一id
    const nodeId = id || `node-${totalNodeCounter.current}`;
    const newNode = new Node(value, nodeId);
    // 增加总节点计数器
    totalNodeCounter.current++;
    
    // 更新链表结构
    newNode.next = head.current;
    head.current = newNode;
    
    // 调整现有节点位置和ID
    const oldList = [...listData.current];
    listData.current = [value, ...oldList];
    nodeCount.current++;
    
    // 计算新节点位置和样式
    const newNodePosition = calculateNodePosition(0);
    const newNodeStyle = createNodeStyle(true, nodeCount.current === 1);
    
    // 添加新节点
    graphCanvasRef.current.dispatchOperation('addNode', {
      id: nodeId,
      x: newNodePosition.x,
      y: newNodePosition.y,
      size: radius,
      style: newNodeStyle,
      label: value.toString()
    });
    
    // 更新现有节点的位置和样式
    for (let i = 0; i < oldList.length; i++) {
      const newPosition = calculateNodePosition(i + 1);
      const isTail = i === oldList.length - 1;
      
      // 更新节点ID和位置
      const oldNodeId = `node-${i}`;
      const newNodeId = `node-${i + 1}`;
      graphCanvasRef.current.dispatchOperation('deleteNode', oldNodeId);
      graphCanvasRef.current.dispatchOperation('addNode', {
        id: newNodeId,
        x: newPosition.x,
        y: newPosition.y,
        size: radius,
        style: createNodeStyle(false, isTail),
        label: oldList[i].toString()
      });
    }
    
    // 更新边
    updateEdges();
    
    return true;
  };

  // 添加节点到链表尾部
  const addToTail = (value, id = null) => {
    if (nodeCount.current >= maxSize || !graphCanvasRef.current) {
      return false;
    }

    // 创建新节点，使用totalNodeCounter生成唯一id
    const nodeId = id || `node-${totalNodeCounter.current}`;
    const newNode = new Node(value, nodeId);
    // 增加总节点计数器
    totalNodeCounter.current++;
    
    // 更新链表结构
    if (!head.current) {
      head.current = newNode;
    } else {
      let current = head.current;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    
    // 更新数据
    listData.current.push(value);
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
      size: radius,
      style: newNodeStyle,
      label: value.toString()
    });
    
    // 如果链表原来不为空，更新前一个节点的样式（不再是尾节点）
    if (newIndex > 0) {
      const prevNodeId = `node-${newIndex - 1}`;
      graphCanvasRef.current.dispatchOperation('updateNode', {
        id: prevNodeId,
        style: createNodeStyle(newIndex - 1 === 0, false)
      });
      
      // 添加新的边
      graphCanvasRef.current.dispatchOperation('addEdge', {
        id: `edge-${newIndex - 1}-${newIndex}`,
        source: prevNodeId,
        target: nodeId,
        style: createEdgeStyle()
      });
    }
    
    return true;
  };

  // 从链表头部删除节点
  const removeFromHead = () => {
    if (!head.current || !graphCanvasRef.current) {
      return null;
    }

    // 获取要删除的节点值和ID
    const removedValue = head.current.value;
    const removedId = head.current.id || 'node-0';
    
    // 更新链表结构
    head.current = head.current.next;
    
    // 更新数据
    listData.current.shift();
    const oldCount = nodeCount.current;
    nodeCount.current--;
    
    // 删除头节点
    graphCanvasRef.current.dispatchOperation('deleteNode', removedId);
    
    // 更新剩余节点的位置和ID
    for (let i = 1; i < oldCount; i++) {
      const newPosition = calculateNodePosition(i - 1);
      const isHead = i - 1 === 0;
      const isTail = i - 1 === nodeCount.current - 1;
      
      // 删除旧节点
      const oldNodeId = `node-${i}`;
      graphCanvasRef.current.dispatchOperation('deleteNode', oldNodeId);
      
      // 添加更新位置后的节点
      const newNodeId = `node-${i - 1}`;
      graphCanvasRef.current.dispatchOperation('addNode', {
        id: newNodeId,
        x: newPosition.x,
        y: newPosition.y,
        size: radius,
        style: createNodeStyle(isHead, isTail),
        label: listData.current[i - 1].toString()
      });
    }
    
    // 更新边
    updateEdges();
    
    return removedValue;
  };

  // 从链表尾部删除节点
  const removeFromTail = () => {
    if (!head.current || !graphCanvasRef.current) {
      return null;
    }

    // 获取要删除的节点值
    let removedValue;
    
    // 更新链表结构
    if (!head.current.next) {
      // 只有一个节点的情况
      removedValue = head.current.value;
      const removedId = head.current.id || 'node-0';
      head.current = null;
      
      // 删除唯一的节点
      graphCanvasRef.current.dispatchOperation('deleteNode', removedId);
    } else {
      // 多个节点的情况，找到倒数第二个节点
      let current = head.current;
      while (current.next && current.next.next) {
        current = current.next;
      }
      removedValue = current.next.value;
      const removedId = current.next.id || `node-${nodeCount.current - 1}`;
      current.next = null;
      
      // 删除尾节点
      const tailIndex = nodeCount.current - 1;
      graphCanvasRef.current.dispatchOperation('deleteNode', removedId);
      
      // 删除连接到尾节点的边
      graphCanvasRef.current.dispatchOperation('deleteEdge', `edge-${tailIndex - 1}-${tailIndex}`);
      
      // 更新倒数第二个节点为尾节点
      const prevNodeId = `node-${tailIndex - 1}`;
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

    // 创建新节点，使用totalNodeCounter生成唯一id
    const nodeId = id || `node-${totalNodeCounter.current}`;
    const newNode = new Node(value, nodeId);
    // 增加总节点计数器
    totalNodeCounter.current++;
    
    // 保存插入位置后的节点值
    const nodesAfterInsert = listData.current.slice(index);
    
    // 更新数据
    listData.current.splice(index, 0, value);
    
    // 更新链表结构
    let current = head.current;
    let prev = null;
    let currentIndex = 0;
    
    while (current && currentIndex < index) {
      prev = current;
      current = current.next;
      currentIndex++;
    }
    
    if (prev) {
      prev.next = newNode;
      newNode.next = current;
    }
    
    nodeCount.current++;
    
    // 计算新节点位置和样式
    const newNodePosition = calculateNodePosition(index);
    const isHead = index === 0;
    const isTail = index === nodeCount.current - 1;
    const newNodeStyle = createNodeStyle(isHead, isTail);
    
    // 删除插入位置及之后的节点和边
    for (let i = index; i < nodeCount.current - 1; i++) {
      graphCanvasRef.current.dispatchOperation('deleteEdge', `edge-${i}-${i + 1}`);
    }
    
    for (let i = index; i < nodeCount.current - 1; i++) {
      graphCanvasRef.current.dispatchOperation('deleteNode', `node-${i}`);
    }
    
    // 添加新节点
    graphCanvasRef.current.dispatchOperation('addNode', {
      id: nodeId,
      x: newNodePosition.x,
      y: newNodePosition.y,
      size: radius,
      style: newNodeStyle,
      label: value.toString()
    });
    
    // 重新添加插入位置后的节点
    for (let i = 0; i < nodesAfterInsert.length; i++) {
      const newPosition = calculateNodePosition(index + i + 1);
      const nodeIsTail = index + i + 1 === nodeCount.current - 1;
      const newNodeId = `node-${index + i + 1}`;
      graphCanvasRef.current.dispatchOperation('addNode', {
        id: newNodeId,
        x: newPosition.x,
        y: newPosition.y,
        size: radius,
        style: createNodeStyle(false, nodeIsTail),
        label: nodesAfterInsert[i].toString()
      });
    }
    
    // 更新边
    updateEdges();
    
    return true;
  };

  // 删除指定位置的节点
  const removeAt = (index) => {
    if (index < 0 || index >= nodeCount.current || !head.current || !graphCanvasRef.current) {
      return null;
    }

    if (index === 0) {
      return removeFromHead();
    }

    if (index === nodeCount.current - 1) {
      return removeFromTail();
    }

    // 保存删除位置后的节点值
    const nodesAfterDelete = listData.current.slice(index + 1);
    
    // 更新链表结构
    let current = head.current;
    let prev = null;
    let currentIndex = 0;
    
    while (current && currentIndex < index) {
      prev = current;
      current = current.next;
      currentIndex++;
    }
    
    const removedValue = current.value;
    const removedId = current.id || `node-${index}`;
    if (prev) {
      prev.next = current.next;
    }
    
    // 更新数据
    listData.current.splice(index, 1);
    const oldCount = nodeCount.current;
    nodeCount.current--;
    
    // 删除指定位置的节点和相关边
    graphCanvasRef.current.dispatchOperation('deleteEdge', `edge-${index - 1}-${index}`);
    graphCanvasRef.current.dispatchOperation('deleteEdge', `edge-${index}-${index + 1}`);
    graphCanvasRef.current.dispatchOperation('deleteNode', removedId);
    
    // 删除删除位置之后的节点
    for (let i = index + 1; i < oldCount; i++) {
      graphCanvasRef.current.dispatchOperation('deleteNode', `node-${i}`);
      if (i < oldCount - 1) {
        graphCanvasRef.current.dispatchOperation('deleteEdge', `edge-${i}-${i + 1}`);
      }
    }
    
    // 重新添加删除位置之后的节点，更新位置
    for (let i = 0; i < nodesAfterDelete.length; i++) {
      const newPosition = calculateNodePosition(index + i);
      const isHead = index + i === 0;
      const isTail = index + i === nodeCount.current - 1;
      const newNodeId = `node-${index + i}`;
      graphCanvasRef.current.dispatchOperation('addNode', {
        id: newNodeId,
        x: newPosition.x,
        y: newPosition.y,
        size: radius,
        style: createNodeStyle(isHead, isTail),
        label: nodesAfterDelete[i].toString()
      });
    }
    
    // 更新边
    updateEdges();
    
    return removedValue;
  };

  // 查找节点值
  const search = (value) => {
    return listData.current.indexOf(value);
  };

  // 获取链表头部元素
  const peek = () => {
    return head.current ? head.current.value : null;
  };

  // 清空链表
  const clear = () => {
    if (graphCanvasRef.current) {
      // 删除所有节点和边
      for (let i = 0; i < nodeCount.current - 1; i++) {
        graphCanvasRef.current.dispatchOperation('deleteEdge', `edge-${i}-${i + 1}`);
      }
      // 遍历链表删除所有节点，确保使用正确的id
      let current = head.current;
      while (current) {
        const next = current.next;
        graphCanvasRef.current.dispatchOperation('deleteNode', current.id || `node-${i}`);
        current = next;
      }
    }
    listData.current = [];
    head.current = null;
    nodeCount.current = 0;
  };

  // 设置链表内容
  const setList = (newList) => {
    if (graphCanvasRef.current) {
      // 先清空现有内容
      clear();
      
      // 重新初始化链表结构
      head.current = null;
      let current = null;
      
      // 添加新的链表元素
      const elementsToAdd = newList.slice(0, maxSize); // 限制最大大小
      elementsToAdd.forEach((value, index) => {
        // 使用totalNodeCounter生成唯一id
        const nodeId = `node-${totalNodeCounter.current}`;
        const newNode = new Node(value, nodeId);
        // 增加总节点计数器
        totalNodeCounter.current++;
        
        if (!head.current) {
          head.current = newNode;
          current = head.current;
        } else {
          current.next = newNode;
          current = current.next;
        }
        
        // 直接添加节点，不使用addToTail避免重复的逻辑
        const position = calculateNodePosition(index);
        const isHead = index === 0;
        const isTail = index === elementsToAdd.length - 1;
        const nodeStyle = createNodeStyle(isHead, isTail);
        
        graphCanvasRef.current.dispatchOperation('addNode', {
          id: nodeId,
          x: position.x,
          y: position.y,
          size: radius,
          style: nodeStyle,
          label: value.toString()
        });
        
        // 添加边
        if (index > 0) {
          const prevNodeId = `node-${nodeCount.current - 1}`;
          graphCanvasRef.current.dispatchOperation('addEdge', {
            id: `edge-${index - 1}-${index}`,
            source: prevNodeId,
            target: nodeId,
            style: createEdgeStyle()
          });
        }
        

      });
      
      // 更新数据
      listData.current = [...elementsToAdd];
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

  // 更新所有边
  const updateEdges = () => {
    if (!graphCanvasRef.current || nodeCount.current < 2) return;
    
    // 删除所有现有边
    for (let i = 0; i < nodeCount.current - 1; i++) {
      graphCanvasRef.current.dispatchOperation('deleteEdge', `edge-${i}-${i + 1}`);
    }
    
    // 重新添加所有边
    for (let i = 0; i < nodeCount.current - 1; i++) {
      graphCanvasRef.current.dispatchOperation('addEdge', {
        id: `edge-${i}-${i + 1}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
        style: createEdgeStyle()
      });
    }
  };
  
  // 初始化链表可视化
  const initializeVisualization = () => {
    if (graphCanvasRef.current && listData.current.length > 0) {
      // 直接使用setList初始化
      setList([...listData.current]);
    }
  };

  // 初始化时设置
  useEffect(() => {
    if (!isInitialized.current && graphCanvasRef.current) {
      // 初始化链表为空
      listData.current = [];
      head.current = null;
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