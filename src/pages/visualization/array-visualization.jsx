import React, { useState, useRef } from 'react';
import ArrayVisualization from '../../components/visualizations/ArrayVisualization.jsx';

const ArrayVisualizationPage = () => {
  const arrayVizRef = useRef(null);
  const [currentAction, setCurrentAction] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // 演示数组操作
  const demonstrateArrayOperations = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentAction('初始化数组');
    
    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 添加元素
    setCurrentAction('添加元素: 在索引2处插入值42');
    arrayVizRef.current?.setElement(2, 42);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCurrentAction('添加元素: 在索引5处插入值18');
    arrayVizRef.current?.setElement(5, 18);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCurrentAction('添加元素: 在索引0处插入值73');
    arrayVizRef.current?.setElement(0, 73);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 修改元素
    setCurrentAction('修改元素: 将索引2的值改为99');
    arrayVizRef.current?.setElement(2, 99);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 删除元素
    setCurrentAction('删除元素: 移除索引5的值');
    arrayVizRef.current?.removeElement(5);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCurrentAction('删除元素: 移除索引0的值');
    arrayVizRef.current?.removeElement(0);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCurrentAction('演示完成');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsAnimating(false);
  };

  // 重置演示
  const resetDemo = () => {
    // 清除所有元素
    for (let i = 0; i < 10; i++) {
      arrayVizRef.current?.removeElement(i);
    }
    setCurrentAction('');
    setIsAnimating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">数组可视化演示</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">操作演示</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <button 
              onClick={demonstrateArrayOperations}
              disabled={isAnimating}
              className={`px-4 py-2 rounded-md transition-colors ${
                isAnimating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isAnimating ? '演示中...' : '开始演示'}
            </button>
            
            <button 
              onClick={resetDemo}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              重置
            </button>
          </div>
          
          <div className="text-lg font-medium text-gray-700">
            当前操作: <span className="text-blue-600">{currentAction || '等待开始'}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">数组可视化</h2>
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            <ArrayVisualization 
              ref={arrayVizRef}
              height={80}
              length={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 添加静态属性供列表页面读取
ArrayVisualizationPage.title = '数组可视化';
ArrayVisualizationPage.description = '动态展示数组';

export default ArrayVisualizationPage;