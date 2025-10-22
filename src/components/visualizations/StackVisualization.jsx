import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import ArrayVisualization from './ArrayVisualization';

const StackVisualization = forwardRef(({ height, maxSize = 10 }, ref) => {
  const arrayVizRef = useRef(null);
  const stackData = useRef([]);

  // 入栈操作
  const push = (value) => {
    if (stackData.current.length < maxSize && arrayVizRef.current) {
      const index = stackData.current.length;
      stackData.current.push(value);
      
      // 使用ArrayVisualization的setElement方法添加元素
      arrayVizRef.current.setElement(index, value);
      
      // 高亮新入栈的元素
      arrayVizRef.current.highlightRegion('top-element', index, index, '#FF6B6B');
      
      return true; // 入栈成功
    }
    return false; // 栈已满
  };

  // 出栈操作
  const pop = () => {
    if (stackData.current.length > 0 && arrayVizRef.current) {
      const index = stackData.current.length - 1;
      const poppedValue = stackData.current.pop();
      
      // 使用ArrayVisualization的removeElement方法移除元素
      arrayVizRef.current.removeElement(index);
      
      // 如果栈不为空，高亮新的栈顶元素
      if (stackData.current.length > 0) {
        arrayVizRef.current.highlightRegion('top-element', index - 1, index - 1, '#FF6B6B');
      } else {
        arrayVizRef.current.removeHighlight('top-element');
      }
      
      return poppedValue;
    }
    return null; // 栈为空
  };

  // 获取栈顶元素
  const peek = () => {
    return stackData.current.length > 0 ? stackData.current[stackData.current.length - 1] : null;
  };

  // 清空栈
  const clear = () => {
    if (arrayVizRef.current) {
      // 清除所有高亮
      arrayVizRef.current.removeHighlight('top-element');
      // 清空数组
      arrayVizRef.current.clearArray();
    }
    stackData.current = [];
  };

  // 设置栈内容（用于直接替换整个栈）
  const setStack = (newStack) => {
    if (arrayVizRef.current) {
      // 先清空现有内容
      clear();
      
      // 添加新的栈元素
      const elementsToAdd = newStack.slice(0, maxSize); // 限制最大大小
      elementsToAdd.forEach((value, index) => {
        arrayVizRef.current.setElement(index, value);
      });
      
      // 更新内部状态
      stackData.current = [...elementsToAdd];
      
      // 如果栈不为空，高亮栈顶元素
      if (stackData.current.length > 0) {
        arrayVizRef.current.highlightRegion('top-element', stackData.current.length - 1, stackData.current.length - 1, '#FF6B6B');
      }
    }
  };

  // 获取栈的大小
  const size = () => {
    return stackData.current.length;
  };

  // 检查栈是否为空
  const isEmpty = () => {
    return stackData.current.length === 0;
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    push,
    pop,
    peek,
    clear,
    setStack,
    size,
    isEmpty
  }));

  return (
    <div className="stack-visualization">
      <ArrayVisualization 
        ref={arrayVizRef}
        height={height}
        length={maxSize}
      />
    </div>
  );
});

StackVisualization.displayName = 'StackVisualization';

export default StackVisualization;