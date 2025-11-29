import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import GraphCanvas from '../../animation/GraphCanvas.jsx'
import TwoDArrayVisualization from '../TwoDArrayVisualization.jsx'
import { AdjacencyMatrixAlgorithm } from './AdjacencyMatrixAlgorithm.jsx'

const AdjacencyMatrixMotion = forwardRef(({ graphData }, ref) => {
  const animationCanvasRef = useRef(null)
  const adjacencyMatrixRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [delayMs, setDelayMs] = useState(1000)

  const startExecution = async () => {
    if (isPlaying || !graphData || !graphData.nodes || graphData.nodes.length === 0) return
    setIsPlaying(true)
    if (animationCanvasRef.current) {
      animationCanvasRef.current.dispatchOperation('clearIndicators', {})
    }
    try {
      const algorithmInstance = AdjacencyMatrixAlgorithm({ graphData, graphAdjList: {}, delayMs, animationCanvasRef, adjacencyMatrixRef })
      await algorithmInstance.execute()
    } catch (e) {
      console.error('AdjacencyMatrix执行过程中出错:', e)
    } finally {
      setIsPlaying(false)
    }
  }

  const resetVisualization = () => {
    setIsPlaying(false)
    if (animationCanvasRef.current) {
      animationCanvasRef.current.dispatchOperation('clearIndicators', {})
    }
    if (adjacencyMatrixRef.current) adjacencyMatrixRef.current.clearMatrix()
  }

  useImperativeHandle(ref, () => ({ startExecution, resetVisualization, isPlaying }))

  return (
    <div className="relative min-h-screen">
      <h2 className="fixed top-4 left-4 text-2xl font-bold text-gray-800 z-10">邻接矩阵</h2>
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-auto">
        {graphData ? (
          <div className="flex gap-4 w-full max-w-6xl">
            <div className="flex-1">
              <GraphCanvas ref={animationCanvasRef} width={graphData.width || 800} height={graphData.height || 500} graphData={graphData} isLoading={false} />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700 text-center">邻接矩阵</h3>
                <TwoDArrayVisualization ref={adjacencyMatrixRef} width={graphData.width || 800} height={graphData.height || 500} rows={graphData.nodes ? graphData.nodes.length : 0} cols={graphData.nodes ? graphData.nodes.length : 0} rowLabels={graphData.nodes ? graphData.nodes.map(node => node.id) : 'default'} colLabels={graphData.nodes ? graphData.nodes.map(node => node.id) : 'default'} />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[800px] h-[500px] flex items-center justify-center bg-gray-50">
            <p className="text-gray-600">图数据加载失败</p>
          </div>
        )}
      </div>
      <div className="fixed bottom-4 right-4 flex flex-col items-end gap-3 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">慢</span>
          <input type="range" min="1" max="4" value={[3000, 2000, 1000, 500].indexOf(delayMs) + 1} onChange={(e) => setDelayMs([3000, 2000, 1000, 500][parseInt(e.target.value) - 1])} className="w-40 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" disabled={isPlaying} />
          <span className="text-xs text-gray-500">快</span>
        </div>
        <div className="flex gap-2">
          <button onClick={startExecution} disabled={isPlaying || !graphData} className={`px-4 py-2 rounded-md transition-colors ${isPlaying || !graphData ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </button>
          <button onClick={resetVisualization} disabled={isPlaying} className={`px-4 py-2 rounded-md transition-colors ${isPlaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
})

AdjacencyMatrixMotion.displayName = 'AdjacencyMatrixMotion'

export default AdjacencyMatrixMotion

