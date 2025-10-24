import React, { useState, useRef } from 'react';
import TwoDArrayVisualization from '../../components/visualizations/TwoDArrayVisualization.jsx';

const TwoDArrayVisualizationPage = () => {
  const matrixVizRef = useRef(null);
  const [currentAction, setCurrentAction] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);

  // 演示二维数组操作
  const demonstrateMatrixOperations = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurrentAction('初始化矩阵');
    
    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 创建一个示例矩阵数据
    const sampleMatrix = Array(rows).fill(null).map(() => Array(cols).fill(0));
    
    // 加载初始矩阵
    setCurrentAction('加载初始矩阵数据');
    matrixVizRef.current?.loadMatrix(sampleMatrix);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 设置特定元素
    setCurrentAction('设置元素: (1, 1) = 1');
    matrixVizRef.current?.setElement(1, 1, 1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentAction('设置元素: (2, 3) = 1');
    matrixVizRef.current?.setElement(2, 3, 1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentAction('设置元素: (4, 0) = 1');
    matrixVizRef.current?.setElement(4, 0, 1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 高亮特定单元格
    setCurrentAction('高亮单元格: (1, 1)');
    matrixVizRef.current?.highlightCell(1, 1, '#FFD700');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentAction('高亮单元格: (2, 3)');
    matrixVizRef.current?.highlightCell(2, 3, '#FFD700');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 构建一个新的矩阵（例如邻接矩阵样式）
    setCurrentAction('构建新的邻接矩阵');
    matrixVizRef.current?.clearAllHighlights();
    const adjacencyMatrix = [
      [0, 1, 0, 1, 0],
      [1, 0, 1, 0, 0],
      [0, 1, 0, 1, 1],
      [1, 0, 1, 0, 1],
      [0, 0, 1, 1, 0]
    ];
    matrixVizRef.current?.loadMatrix(adjacencyMatrix);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 逐步高亮对角线
    setCurrentAction('高亮对角线元素');
    for (let i = 0; i < Math.min(rows, cols); i++) {
      matrixVizRef.current?.highlightCell(i, i, '#4CAF50');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentAction('演示完成');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsAnimating(false);
  };

  // 重置演示
  const resetDemo = () => {
    if (matrixVizRef.current) {
      matrixVizRef.current.clearMatrix();
      matrixVizRef.current.clearAllHighlights();
    }
    setCurrentAction('');
    setIsAnimating(false);
  };

  // 重新渲染矩阵（当行列数改变时）
  const handleSizeChange = () => {
    resetDemo();
    // 重新渲染会自动使用新的rows和cols值
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">二维数组可视化演示</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">操作演示</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <button 
              onClick={demonstrateMatrixOperations}
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
          
          <div className="text-lg font-medium text-gray-700 mb-4">
            当前操作: <span className="text-blue-600">{currentAction || '等待开始'}</span>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-gray-700 mr-2">行数:</label>
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="10"
                className="px-2 py-1 border border-gray-300 rounded w-20"
                disabled={isAnimating}
              />
            </div>
            <div>
              <label className="text-gray-700 mr-2">列数:</label>
              <input
                type="number"
                value={cols}
                onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="10"
                className="px-2 py-1 border border-gray-300 rounded w-20"
                disabled={isAnimating}
              />
            </div>
            <button
              onClick={handleSizeChange}
              disabled={isAnimating}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                isAnimating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              应用大小
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">矩阵可视化</h2>
          <div className="rounded-lg p-4 overflow-auto">
            <TwoDArrayVisualization 
              ref={matrixVizRef}
              width={400}
              height={400}
              rows={rows}
              cols={cols}
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>说明：</p>
            <ul className="list-disc list-inside ml-2">
              <li>蓝色单元格表示值为1的元素</li>
              <li>白色单元格表示值为0的元素</li>
              <li>黄色高亮表示当前操作的单元格</li>
              <li>绿色高亮用于特殊标记（如对角线）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// 添加静态属性供列表页面读取
TwoDArrayVisualizationPage.title = '二维数组可视化';
TwoDArrayVisualizationPage.description = '动态展示二维数组操作';

export default TwoDArrayVisualizationPage;