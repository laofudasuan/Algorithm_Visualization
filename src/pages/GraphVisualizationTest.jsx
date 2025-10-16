import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GraphCanvas from '../components/animation/GraphCanvas';

const GraphVisualizationTest = () => {
  const graphCanvasRef = useRef(null);
  const [currentAction, setCurrentAction] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 示例图数据
  const testGraphNames = ['ExampleGraph-500-300', 'ExampleGraph-1000-600'];

  // 操作序列
  const actions = [
    {
      name: '初始状态',
      description: '显示默认图数据',
      action: () => {}
    },
    {
      name: '添加节点',
      description: '添加一个新节点到图中',
      action: () => {
        if (graphCanvasRef.current) {
          graphCanvasRef.current.modifyCurrentGraph({
            nodes: [{
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
            edges: [{
              id: 'test-edge-1',
              source: 'test-node-1',
              target: '0',
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
            nodes: [{
              id: '0',
              style: { fill: '#4caf50', stroke: '#ffffff', strokeWidth: 3 }
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
            target: '0',
            color: '#4caf50',
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
    },
    {
      name: '重置',
      description: '回到初始状态',
      action: () => {
        if (graphCanvasRef.current) {
          graphCanvasRef.current.switchGraphIndex(0);
        }
      }
    }
  ];

  // 执行当前操作
  const executeAction = (index) => {
    setCurrentAction(index);
    actions[index].action();
  };

  // 自动播放操作
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentAction(prev => {
          const next = (prev + 1) % actions.length;
          executeAction(next);
          return next;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="page-content max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">图可视化测试</h1>
            <p className="text-gray-600">测试 GraphCanvas 组件的各种功能</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 控制面板 */}
              <div className="lg:w-1/4">
                <h2 className="text-xl font-bold mb-4">测试控制</h2>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">手动控制</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => executeAction(index)}
                        className={`py-2 px-3 rounded text-sm transition-colors ${
                          currentAction === index
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {action.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">自动播放</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`flex-1 py-2 px-4 rounded ${
                        isPlaying
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {isPlaying ? '停止' : '开始'}
                    </button>
                    <button
                      onClick={() => {
                        setIsPlaying(false);
                        executeAction(0);
                      }}
                      className="flex-1 py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded"
                    >
                      重置
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold mb-2">当前操作</h3>
                  <p className="font-medium">{actions[currentAction].name}</p>
                  <p className="text-gray-600 text-sm">{actions[currentAction].description}</p>
                </div>
              </div>

              {/* 图可视化区域 */}
              <div className="lg:w-3/4">
                <h2 className="text-xl font-bold mb-4">图可视化展示</h2>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="h-[500px] w-full">
                    <GraphCanvas
                      ref={graphCanvasRef}
                      width={800}
                      height={500}
                      graphCount={2}
                      graphNames={testGraphNames}
                    />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>此测试展示了 GraphCanvas 组件的功能，包括：</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>加载和显示多个图数据</li>
                    <li>动态添加节点和边</li>
                    <li>修改现有节点和边的样式</li>
                    <li>添加视觉指示器</li>
                    <li>在多个图之间切换</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GraphVisualizationTest;