import React, { useRef, useState } from 'react';
import GraphAlgorithmVisualization from '../../components/visualizations/GraphAlgorithmVisualization.jsx';

const BFSDFSVisualization = () => {
  const visualizationRef = useRef(null);
  const [selectedCase, setSelectedCase] = useState('default');

  // 案例配置
  const cases = [
    {
      id: 'default',
      name: '默认图',
      graphName: 'dfs-graph'
    },
    {
      id: 'complex',
      name: '复杂图结构',
      graphName: 'complex-dfs-graph'
    }
  ];

  // 案例切换处理
  const handleCaseChange = (e) => {
    setSelectedCase(e.target.value);
    // 重置可视化 - 通过ref调用子组件方法
    if (visualizationRef.current) {
      visualizationRef.current.resetVisualization();
    }
  };

  // 获取当前选中的案例配置
  const getCurrentCase = () => {
    return cases.find(c => c.id === selectedCase) || cases[0];
  };

  return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">图遍历算法可视化 (DFS & BFS)</h1>
          <p className="text-gray-600">
            本页面可视化展示深度优先搜索(DFS)和广度优先搜索(BFS)算法的执行过程，
            帮助理解两种经典图遍历算法的工作原理和差异。
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div>
                <label htmlFor="case-selector" className="block text-sm font-medium text-gray-700 mb-1">
                  选择案例
                </label>
                <select
                  id="case-selector"
                  value={selectedCase}
                  onChange={handleCaseChange}
                  className="block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 min-h-[500px]">
              <GraphAlgorithmVisualization
                ref={visualizationRef}
                graphName={getCurrentCase().graphName}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* BFS算法说明 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">广度优先搜索 (BFS) 算法</h2>
              <div className="prose max-w-none">
                <p>
                  广度优先搜索（BFS）是一种图遍历算法，其核心思想是从起始节点出发，
                  优先访问其所有直接相邻的节点，然后再访问这些相邻节点的相邻节点，
                  以此类推，按照距离起始节点由近及远的顺序遍历图中的所有节点。
                </p>
                <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">算法步骤：</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>将起始节点加入队列，并标记为已访问。</li>
                  <li>当队列不为空时，执行以下操作：</li>
                  <li className="pl-4">a. 从队列头部取出一个节点。</li>
                  <li className="pl-4">b. 访问该节点（处理节点数据）。</li>
                  <li className="pl-4">c. 将该节点的所有未访问过的相邻节点加入队列尾部，并标记为已访问。</li>
                  <li>重复步骤2，直到队列为空。</li>
                </ol>
                <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">时间复杂度：</h3>
                <p>
                  假设图中有V个顶点和E条边，BFS算法的时间复杂度为O(V+E)，
                  其中V是顶点数，E是边数。这是因为在最坏情况下，
                  算法需要访问所有顶点和所有边各一次。
                </p>
                <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">空间复杂度：</h3>
                <p>
                  BFS算法的空间复杂度为O(V)，主要用于存储队列和访问标记数组。
                  在最坏情况下，队列可能需要存储所有顶点（例如，在一个完全二叉树的最后一层）。
                </p>
              </div>
            </div>
          </div>

          {/* DFS算法说明 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">深度优先搜索 (DFS) 算法</h2>
              <div className="prose max-w-none">
                <p>
                  深度优先搜索（DFS）是一种图遍历算法，其核心思想是从起始节点出发，
                  尽可能深地沿着一条路径前进，直到无法继续前进时，才回溯到前一个节点，
                  然后尝试另一条路径，直到所有节点都被访问。
                </p>
                <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">算法步骤：</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>将起始节点标记为已访问，并将其压入栈中。</li>
                  <li>当栈不为空时，执行以下操作：</li>
                  <li className="pl-4">a. 查看栈顶节点。</li>
                  <li className="pl-4">b. 如果该节点有未访问的相邻节点，选择其中一个，将其标记为已访问，并压入栈中。</li>
                  <li className="pl-4">c. 如果该节点的所有相邻节点都已访问，则将其从栈中弹出（回溯）。</li>
                  <li>重复步骤2，直到栈为空。</li>
                </ol>
                <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">时间复杂度：</h3>
                <p>
                  假设图中有V个顶点和E条边，DFS算法的时间复杂度为O(V+E)，
                  其中V是顶点数，E是边数。这是因为在最坏情况下，
                  算法需要访问所有顶点和所有边各一次。
                </p>
                <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">空间复杂度：</h3>
                <p>
                  DFS算法的空间复杂度为O(V)，主要用于存储递归调用栈或显式栈，
                  以及访问标记数组。在最坏情况下（例如，一个线性图），栈的深度可能达到V。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

// 添加静态属性以便在列表页面中显示
BFSDFSVisualization.title = '图遍历算法 (DFS & BFS)';
BFSDFSVisualization.description = '可视化展示图的深度优先搜索和广度优先搜索算法执行过程';

export default BFSDFSVisualization;