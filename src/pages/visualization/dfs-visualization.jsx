import React, { useRef, useState } from 'react';
import DFSVisualization from '../../components/visualizations/DFSVisualization.jsx';

const DFSVisualizationPage = () => {
  const dfsVizRef = useRef(null);

  // 案例配置 - 可以在这里添加不同的图配置案例
  const cases = [
    {
      id: 'default',
      name: '默认DFS图',
      graphName: 'dfs-graph'
    },
    // 可以在这里添加更多案例
    {
      id: 'complex',
      name: '复杂图结构',
      graphName: 'complex-dfs-graph'
    }
  ];

  const [currentCase, setCurrentCase] = useState(cases[0]); // 默认使用第一个案例
  
  // 处理案例切换
  const handleCaseChange = (caseItem) => {
    setCurrentCase(caseItem);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">深度优先搜索(DFS)可视化</h1>
        
        {/* 案例选择区域 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">案例选择</h2>
          <div className="flex flex-wrap gap-3">
            {cases.map(caseItem => (
              <button
                key={caseItem.id}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentCase.id === caseItem.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => handleCaseChange(caseItem)}
              >
                {caseItem.name}
              </button>
            ))}
          </div>
          
          <div className="mt-4 text-gray-600">
            <p>当前案例: {currentCase.name}</p>
          </div>
        </div>
        
        {/* DFS可视化组件 */}
        <DFSVisualization 
          ref={dfsVizRef}
          graphName={currentCase.graphName}
        />
      </div>
    </div>
  );
};

// 添加静态属性供列表页面读取
DFSVisualizationPage.title = '深度优先搜索';
DFSVisualizationPage.description = '可视化展示图的深度优先搜索算法执行过程';

export default DFSVisualizationPage;