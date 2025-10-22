import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import ArrayVisualization from './ArrayVisualization';

const QueueVisualization = forwardRef(({ height, maxSize = 10 }, ref) => {
  const arrayVizRef = useRef(null);
  const queueData = useRef([]);
  const front = useRef(0); // 队首指针
  const rear = useRef(0);  // 队尾指针

  // 入队操作
  const enqueue = (value) => {
    if (queueData.current.length < maxSize && arrayVizRef.current) {
      // 计算实际位置（循环队列）
      const index = (rear.current) % maxSize;
      
      // 如果队列未满但索引位置已有元素，先移除旧元素
      if (queueData.current.length > 0 && index === front.current % maxSize) {
        arrayVizRef.current.removeElement(index);
      }
      
      // 设置新元素
      arrayVizRef.current.setElement(index, value);
      
      // 更新队列数据
      queueData.current.push(value);
      rear.current++;
      
      // 高亮队尾元素（新入队的元素）
      arrayVizRef.current.removeHighlight('front-element');
      arrayVizRef.current.highlightRegion('rear-element', index, index, '#ff0000ff');
      
      // 高亮队首元素
      const frontIndex = front.current % maxSize;
      arrayVizRef.current.highlightRegion('front-element', frontIndex, frontIndex, '#FF9800');
      
      return true; // 入队成功
    }
    return false; // 队列已满
  };

  // 出队操作
  const dequeue = () => {
    if (queueData.current.length > 0 && arrayVizRef.current) {
      const frontIndex = front.current % maxSize;
      const dequeuedValue = queueData.current.shift();
      
      // 移除队首元素
      arrayVizRef.current.removeElement(frontIndex);
      
      // 更新队首指针
      front.current++;
      
      // 更新高亮
      arrayVizRef.current.removeHighlight('front-element');
      arrayVizRef.current.removeHighlight('rear-element');
      
      // 如果队列不为空，重新高亮队首和队尾元素
      if (queueData.current.length > 0) {
        const newFrontIndex = front.current % maxSize;
        const newRearIndex = (rear.current - 1) % maxSize;
        arrayVizRef.current.highlightRegion('front-element', newFrontIndex, newFrontIndex, '#FF9800');
        arrayVizRef.current.highlightRegion('rear-element', newRearIndex, newRearIndex, '#4CAF50');
      }
      
      return dequeuedValue;
    }
    return null; // 队列为空
  };

  // 获取队首元素
  const peek = () => {
    return queueData.current.length > 0 ? queueData.current[0] : null;
  };

  // 清空队列
  const clear = () => {
    if (arrayVizRef.current) {
      // 清除所有高亮
      arrayVizRef.current.removeHighlight('front-element');
      arrayVizRef.current.removeHighlight('rear-element');
      // 清空数组
      arrayVizRef.current.clearArray();
    }
    queueData.current = [];
    front.current = 0;
    rear.current = 0;
  };

  // 设置队列内容（用于直接替换整个队列）
  const setQueue = (newQueue) => {
    if (arrayVizRef.current) {
      // 先清空现有内容
      clear();
      
      // 添加新的队列元素
      const elementsToAdd = newQueue.slice(0, maxSize); // 限制最大大小
      elementsToAdd.forEach(value => {
        enqueue(value);
      });
    }
  };

  // 获取队列的大小
  const size = () => {
    return queueData.current.length;
  };

  // 检查队列是否为空
  const isEmpty = () => {
    return queueData.current.length === 0;
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    enqueue,
    dequeue,
    peek,
    clear,
    setQueue,
    size,
    isEmpty
  }));

  return (
    <div className="queue-visualization">
      <ArrayVisualization 
        ref={arrayVizRef}
        height={height}
        length={maxSize}
      />
      {/* 队列指示器 */}
      {queueData.current.length > 0 && (
        <div className="flex justify-between text-xs mt-1 px-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 mr-1"></div>
            <span>队首</span>
          </div>
          <div className="flex items-center">
            <span>队尾</span>
            <div className="w-3 h-3 bg-green-500 ml-1"></div>
          </div>
        </div>
      )}
    </div>
  );
});

QueueVisualization.displayName = 'QueueVisualization';

export default QueueVisualization;