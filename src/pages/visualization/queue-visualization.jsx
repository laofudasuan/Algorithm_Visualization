import React, { useRef, useState } from 'react';
import QueueVisualization from '../../components/visualizations/QueueVisualization.jsx';

const QueueVisualizationPage = () => {
  const queueVizRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [queueStatus, setQueueStatus] = useState({
    size: 0,
    front: null,
    isEmpty: true
  });

  // 更新队列状态显示
  const updateQueueStatus = () => {
    if (queueVizRef.current) {
      setQueueStatus({
        size: queueVizRef.current.size(),
        front: queueVizRef.current.peek(),
        isEmpty: queueVizRef.current.isEmpty()
      });
    }
  };

  // 处理入队操作
  const handleEnqueue = () => {
    if (inputValue.trim() !== '' && queueVizRef.current) {
      const success = queueVizRef.current.enqueue(inputValue.trim());
      if (success) {
        setInputValue('');
        updateQueueStatus();
      } else {
        alert('队列已满，无法添加更多元素！');
      }
    }
  };

  // 处理出队操作
  const handleDequeue = () => {
    if (queueVizRef.current && !queueVizRef.current.isEmpty()) {
      queueVizRef.current.dequeue();
      updateQueueStatus();
    } else {
      alert('队列为空，无法出队！');
    }
  };

  // 处理清空队列
  const handleClear = () => {
    if (queueVizRef.current) {
      queueVizRef.current.clear();
      updateQueueStatus();
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEnqueue();
    }
  };

  // 预设队列示例
  const handlePresetExample = (type) => {
    if (queueVizRef.current) {
      let exampleQueue = [];
      
      switch(type) {
        case 'numbers':
          exampleQueue = [1, 2, 3, 4, 5];
          break;
        case 'letters':
          exampleQueue = ['A', 'B', 'C', 'D', 'E'];
          break;
        case 'mixed':
          exampleQueue = [10, 'X', 20, 'Y', 30];
          break;
        default:
          exampleQueue = [];
      }
      
      queueVizRef.current.setQueue(exampleQueue);
      updateQueueStatus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">队列(Queue)可视化</h1>
        
        {/* 队列状态和操作区域 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">队列操作</h2>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-grow max-w-md">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入元素值"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleEnqueue}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={inputValue.trim() === ''}
            >
              入队 (Enqueue)
            </button>
            <button
              onClick={handleDequeue}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              disabled={queueStatus.isEmpty}
            >
              出队 (Dequeue)
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              清空 (Clear)
            </button>
          </div>
          
          {/* 预设示例 */}
          <div className="mb-4">
            <p className="text-gray-700 mb-2">预设示例：</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePresetExample('numbers')}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                数字序列
              </button>
              <button
                onClick={() => handlePresetExample('letters')}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                字母序列
              </button>
              <button
                onClick={() => handlePresetExample('mixed')}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                混合序列
              </button>
            </div>
          </div>
          
          {/* 队列状态信息 */}
          <div className="text-gray-700">
            <p>队列大小: {queueStatus.size}</p>
            <p>队首元素: {queueStatus.front !== null ? queueStatus.front : '队列为空'}</p>
            <p>队列状态: {queueStatus.isEmpty ? '空' : '非空'}</p>
          </div>
        </div>
        
        {/* 队列可视化组件 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">队列可视化</h2>
          <QueueVisualization 
            ref={queueVizRef}
            height={100}
            maxSize={10}
          />
        </div>
        
        {/* 队列说明 */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">队列说明</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>队列是一种先进先出(FIFO)的数据结构</li>
            <li>元素从队尾(rear)入队，从队首(front)出队</li>
            <li>橙色标记表示队首元素，绿色标记表示队尾元素</li>
            <li>入队操作：将新元素添加到队尾</li>
            <li>出队操作：移除并返回队首元素</li>
            <li>队列满时无法继续入队，队列为空时无法出队</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// 添加静态属性供列表页面读取
QueueVisualizationPage.title = '队列可视化';
QueueVisualizationPage.description = '可视化展示队列的先进先出(FIFO)特性和基本操作';

export default QueueVisualizationPage;