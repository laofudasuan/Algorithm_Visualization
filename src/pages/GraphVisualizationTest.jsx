import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GraphCanvas from '../components/animation/GraphCanvas';

const GraphVisualizationTest = () => {
  const graphCanvasRef = useRef(null);
  const [currentAction, setCurrentAction] = useState(0);

  // 示例图数据
  const testGraphNames = ['ExampleGraph-500-300', 'ExampleGraph-1000-600'];

  // 操作序列
  const actions = [
    {
      name: '添加节点',
      description: '添加一个新节点到图中',
      action: () => {
        if (graphCanvasRef.current) {
          graphCanvasRef.current.modifyCurrentGraph({
            addNode: [{
              id: 'test-node-1',
              x: 300,
              y: 200,
              label: 'New',
              size: 25,
              style: { fill: '#ff5722' }
            }]
          });
        }
      }
    },
    {
      name: '添加边',
      description: '添加一条连接两个节点的边',
      action: () => {
        if (graphCanvasRef.current) {
          graphCanvasRef.current.modifyCurrentGraph({
            addEdge: [{
              id: 'test-edge-1',
              source: 'test-node-1',
              target: '1',
              label: '新边测试',
              style: { stroke: '#ff5722', strokeWidth: 3 }
            }]
          });
        }
      }
    },
    {
      name: '高亮节点',
      description: '更改特定节点的样式',
      action: () => {
        if (graphCanvasRef.current) {
          graphCanvasRef.current.modifyCurrentGraph({
            updateNode: [{
              id: '1',
              style: { fill: '#000000ff', stroke: '#f4f3f3ff', strokeWidth: 3 }
            }]
          });
        }
      }
    },
    {
      name: '添加指示器',
      description: '在节点上添加脉冲指示器',
      action: () => {
        if (graphCanvasRef.current) {
          graphCanvasRef.current.addIndicator({
            id: 'indicator-1',
            type: 'pulse',
            target: '1',
            color: '#ff00bbff',
            size: 40,
            duration: 3000
          });
        }
      }
    },
    {
      name: '切换图',
      description: '切换到第二张图',
      action: () => {
        if (graphCanvasRef.current) {
          graphCanvasRef.current.switchGraphIndex(1);
        }
      }
    }
  ];

  // 执行当前操作
  const executeAction = (index) => {
    setCurrentAction(index);
    console.log('执行操作：', actions[index]);
    actions[index].action();
  };

  // 在组件挂载时加载初始状态
  useEffect(() => {
    // 初始状态就是显示默认图数据，不需要额外操作
    // 这里可以添加任何需要在初始时执行的代码
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="page-content max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-center mb-2">图可视化测试</h1>
          <p className="text-gray-600 text-center mb-8">测试图可视化功能和动画效果</p>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <GraphCanvas 
              ref={graphCanvasRef} 
              width={800} 
              height={500}
              graphCount={testGraphNames.length}
              graphNames={testGraphNames}
            />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">操作控制</h2>
            <p className="text-gray-600 mb-6">点击下面的按钮执行相应的图操作</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => executeAction(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentAction === index
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {action.name}
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">当前操作: {actions[currentAction]?.name}</h3>
              <p className="text-gray-600">{actions[currentAction]?.description}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GraphVisualizationTest;