import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import AnimateGraph from '../components/animation/animateGraph'

const GraphTest = () => {
  const animateGraphRef = useRef(null)
  const [selectedFunction, setSelectedFunction] = useState('')
  const [executionResult, setExecutionResult] = useState('')
  const [executionTime, setExecutionTime] = useState(null)

  // 测试用图数据
  const testGraph = {
    nodes: [
      { id: 'node1', x: 200, y: 200, label: '节点1', type: 'square', style: { fill: '#e3f2fd' } },
      { id: 'node2', x: 400, y: 200, label: '节点2', type: 'circle', style: { fill: '#ffebee' } },
      { id: 'node3', x: 300, y: 350, label: '节点3', type: 'square', style: { fill: '#e8f5e9' } },
      { id: 'node4', x: 150, y: 350, label: '节点4', type: 'circle', style: { fill: '#fff3e0' } },
      { id: 'node5', x: 450, y: 350, label: '节点5', type: 'square', style: { fill: '#f3e5f5' } }
    ],
    edges: [
      { source: 'node1', target: 'node2', label: '边1-2' },
      { source: 'node1', target: 'node3', label: '边1-3' },
      { source: 'node2', target: 'node3', label: '边2-3' },
      { source: 'node3', target: 'node4', label: '边3-4' },
      { source: 'node3', target: 'node5', label: '边3-5' }
    ]
  }

  // 执行测试函数
  const executeTestFunction = (funcName) => {
    const controller = animateGraphRef.current
    if (!controller) return

    setSelectedFunction(funcName)
    setExecutionResult('执行中...')
    setExecutionTime(null)

    try {
      const startTime = performance.now()
      let result = ''

      switch (funcName) {
        case 'updateGraph':
          // 更新整个图
          controller.setNodes(testGraph.nodes)
          controller.setEdges(testGraph.edges)
          result = '图更新成功'
          break
        case 'createNodeElement':
          // 创建单个节点
          const newNode = {
            id: `node_${Date.now()}`,
            x: Math.random() * 400 + 100,
            y: Math.random() * 300 + 100,
            label: '新节点',
            type: Math.random() > 0.5 ? 'square' : 'circle',
            style: { fill: '#' + Math.floor(Math.random()*16777215).toString(16) }
          }
          
          // 添加节点到当前图数据中
          const updatedNodes = [...testGraph.nodes, newNode]
          testGraph.nodes = updatedNodes // 更新测试数据
          controller.addNode(newNode) // 使用控制器添加节点
          
          result = `成功添加节点: ${newNode.id}`
          break
        case 'redrawGraph':
          // 重新绘制整个图
          controller.redrawGraph()
          result = '图重新绘制成功'
          break
        default:
          result = `未知函数: ${funcName}`
          break
      }

      const endTime = performance.now()
      setExecutionTime((endTime - startTime).toFixed(2))
      setExecutionResult(result)
    } catch (error) {
      console.error('执行测试函数时出错:', error)
      setExecutionResult(`错误: ${error.message}`)
      setExecutionTime(null)
    }
  }

  // 测试函数列表
  const testFunctions = [
    { name: 'updateGraph', description: '更新/渲染完整图形' },
    { name: 'createNodeElement', description: '添加随机节点并更新图' },
    { name: 'redrawGraph', description: '重新绘制整个图' }
  ]

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">图动画测试模块</h1>
            <p className="text-gray-600">测试所有绘图工具函数的功能和性能</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧控制面板 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 h-full">
                <h2 className="text-xl font-bold mb-6 text-primary">函数测试面板</h2>
                
                <div className="space-y-4">
                  {testFunctions.map((func) => (
                    <button
                      key={func.name}
                      onClick={() => executeTestFunction(func.name)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex justify-between items-center ${
                        selectedFunction === func.name
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div>
                        <span className="font-medium">{func.name}</span>
                        <p className="text-xs text-gray-500 mt-1">{func.description}</p>
                      </div>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  ))}
                </div>

                {/* 执行结果 */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">执行结果</h3>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[100px]">
                    <p className="text-gray-700 whitespace-pre-wrap">{executionResult}</p>
                    {executionTime !== null && (
                      <p className="text-xs text-gray-500 mt-2">执行时间: {executionTime}ms</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧画布区域 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6 h-full">
                <h2 className="text-xl font-bold mb-6 text-primary">渲染画布</h2>
                <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 mx-auto">
                  <AnimateGraph
                    ref={animateGraphRef}
                    width={600}
                    height={400}
                    nodes={testGraph.nodes}
                    edges={testGraph.edges}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-500 text-center">
                  画布区域 - 测试函数执行的视觉效果将在此展示
                </div>
              </div>
            </div>
          </div>

          {/* 测试说明 */}
          <div className="mt-12 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-primary">测试说明</h2>
            <div className="text-gray-700 space-y-3">
              <p>此模块用于全面测试绘图工具的各项功能，包括节点和边的添加、删除、更新，以及各种动画效果。</p>
              <p>点击左侧函数按钮即可执行相应的操作，执行结果会显示在面板下方。</p>
              <p>部分函数（如添加节点/边）会使用随机数据，方便测试多种场景。</p>
              <p>所有函数的执行时间会被记录并显示，可用于性能分析。</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default GraphTest