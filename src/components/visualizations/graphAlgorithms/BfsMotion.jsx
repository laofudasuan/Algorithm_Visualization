import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import GraphCanvas from '../../animation/GraphCanvas.jsx'
import QueueVisualization from '../QueueVisualization.jsx'
import { BFSAlgorithm } from './BFSAlgorithm.jsx'

const BfsMotion = forwardRef(({ graphData }, ref) => {
  const animationCanvasRef = useRef(null)
  const queueVizRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [visitedNodes, setVisitedNodes] = useState([])
  const [delayMs, setDelayMs] = useState(1000)
  const [graphAdjList, setGraphAdjList] = useState({})

  useEffect(() => {
    if (graphData && graphData.edges) {
      const adjList = {}
      if (graphData.nodes) {
        graphData.nodes.forEach(node => { adjList[node.id] = [] })
      }
      graphData.edges.forEach(edge => {
        const { source, target } = edge
        if (adjList[source]) adjList[source].push(target)
        else adjList[source] = [target]
        const isDirected = (edge.style && 'directional' in edge.style ? edge.style.directional : graphData.edgeStyle?.directional)
        if (!isDirected) {
          if (adjList[target]) adjList[target].push(source)
          else adjList[target] = [source]
        }
      })
      setGraphAdjList(adjList)
    }
  }, [graphData])

  const startExecution = async () => {
    if (isPlaying || !graphData || Object.keys(graphAdjList).length === 0 || graphData.nodes.length === 0) return
    setIsPlaying(true)
    setVisitedNodes([])
    if (animationCanvasRef.current) {
      animationCanvasRef.current.dispatchOperation('clearIndicators', {})
    }
    if (queueVizRef.current) queueVizRef.current.clear()
    try {
      const algorithmInstance = BFSAlgorithm({ graphData, graphAdjList, delayMs, animationCanvasRef, queueVizRef, setVisitedNodes })
      await algorithmInstance.execute()
    } catch (e) {
      console.error('BFS执行过程中出错:', e)
    } finally {
      setIsPlaying(false)
    }
  }

  const resetVisualization = () => {
    setIsPlaying(false)
    setVisitedNodes([])
    if (animationCanvasRef.current) {
      animationCanvasRef.current.dispatchOperation('clearIndicators', {})
    }
    if (queueVizRef.current) queueVizRef.current.clear()
  }

  useImperativeHandle(ref, () => ({ startExecution, resetVisualization, isPlaying }))

  return (
    <div className="relative min-h-screen">
      <h2 className="fixed top-4 left-4 text-2xl font-bold text-gray-800 z-10">广度优先搜索(BFS)</h2>
      <div className="fixed bottom-4 left-0 right-0 z-8">
        <div className="container mx-auto">
          <h3 className="text-xl font-semibold mb-2 text-gray-700 text-center"><strong>已访问节点:</strong> {visitedNodes.join(', ') || '无'}</h3>
          <div className="flex justify-center">
            <QueueVisualization ref={queueVizRef} height={50} maxSize={10} />
          </div>
        </div>
      </div>
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-auto">
        {graphData ? (
          <GraphCanvas ref={animationCanvasRef} width={graphData.width || 800} height={graphData.height || 500} graphData={graphData} isLoading={false} />
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

BfsMotion.displayName = 'BfsMotion'

export default BfsMotion

