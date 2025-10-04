// GraphCanvas.jsx - 支持多图切换的React组件
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import AnimateGraph from './animateGraph.jsx';
import { generateExampleGraph } from './generateExampleGraph';


const GraphCanvas = forwardRef(({ width = 1000, height = 600, graphCount = 1 }, ref) => {
  // 状态
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0);
  const [graphControllers, setGraphControllers] = useState([]);
  const [graphData, setGraphData] = useState([]);
  
  // Refs
  const animateGraphRefs = useRef([]);
  
  // 初始化多个图控制器和数据
  // 创建graphCount个图元素，每个图线初始化为ExampleGraph，所有图初始的宽度和高度与容器一致
  // 初始化当前图索引为0
  useEffect(() => {
    // 初始化控制器数组
    const controllers = [];
    for (let i = 0; i < graphCount; i++) {
      controllers.push(null);
    }
    setGraphControllers(controllers);
    
    // 初始化图数据，为每个图生成样例图数据
    const graphs = [];
    for (let i = 0; i < graphCount; i++) {
      // 使用generateExampleGraph函数生成样例图数据
      const exampleGraph = generateExampleGraph(width, height);
      graphs.push(exampleGraph);
    }
    setGraphData(graphs);
  }, [graphCount, width, height]);
  
  // 当AnimateGraph组件初始化时，保存其控制器
  const handleGraphInit = (index, controller) => {
    const newControllers = [...graphControllers];
    newControllers[index] = controller;
    setGraphControllers(newControllers);
  };
  
  // 切换当前显示的图索引
  const switchGraphIndex = (index) => {
    if (index >= 0 && index < graphCount) {
      setCurrentGraphIndex(index);
    }
  };
  
  // 修改当前图，调用AnimateGraph的主图层修改函数
  const modifyCurrentGraph = (modifications) => {
    const currentController = graphControllers[currentGraphIndex];
    if (currentController) {
      // 根据传入的修改类型调用不同的方法
      if (modifications.nodes) {
        modifications.nodes.forEach(node => {
          if (node.id) {
            currentController.updateNode(node.id, node);
          } else {
            currentController.addNode(node);
          }
        });
      }
      
      if (modifications.edges) {
        modifications.edges.forEach(edge => {
          if (edge.id) {
            currentController.updateEdge(edge.id, edge);
          } else {
            currentController.addEdge(edge.source, edge.target, edge);
          }
        });
      }
      
      if (modifications.layout) {
        currentController.applyLayout(modifications.layout);
      }
      
      // 处理样式修改
      if (modifications.nodesStyle) {
        // 应用节点样式到所有节点
        if (graphData[currentGraphIndex]?.nodes) {
          graphData[currentGraphIndex].nodes.forEach(node => {
            if (node.id) {
              currentController.updateNode(node.id, modifications.nodesStyle);
            }
          });
        }
      }
      
      if (modifications.edgesStyle) {
        // 应用边样式到所有边
        if (currentController.updateEdges) {
          currentController.updateEdges(modifications.edgesStyle);
        }
      }
    }
  };
  
  // 增加指示，调用AnimateGraph的临时指示器修改函数
  const addIndicator = (indicator) => {
    const currentController = graphControllers[currentGraphIndex];
    if (currentController) {
      currentController.addIndicator(indicator);
      
      // 如果设置了持续时间，自动移除
      if (indicator.duration) {
        setTimeout(() => {
          currentController.removeIndicator(indicator.id);
        }, indicator.duration);
      }
    }
  };
  
  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    modifyCurrentGraph,
    addIndicator,
    switchGraphIndex,
    getCurrentGraphIndex: () => currentGraphIndex,
    getGraphCount: () => graphCount
  }), [currentGraphIndex, graphCount, graphControllers, graphData]);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 图切换指示器 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        gap: '5px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '5px',
        borderRadius: '4px'
      }}>
        {Array.from({ length: graphCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => switchGraphIndex(index)}
            style={{
              width: '30px',
              height: '30px',
              border: currentGraphIndex === index ? '2px solid #3f51b5' : '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: currentGraphIndex === index ? '#3f51b5' : 'white',
              color: currentGraphIndex === index ? 'white' : 'black',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
      
      {/* 渲染所有图，但只显示当前索引对应的图 */}
      {Array.from({ length: graphCount }).map((_, index) => {
        const graph = graphData[index];
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: currentGraphIndex === index ? 'block' : 'none'
            }}
          >
            <AnimateGraph
              ref={el => animateGraphRefs.current[index] = el}
              width={width}
              height={height}
              nodes={graph?.nodes || []}
              edges={graph?.edges || []}
              nodesStyle={graph?.nodesStyle || {}}
              edgesStyle={graph?.edgesStyle || {}}
              onInit={(controller) => handleGraphInit(index, controller)}
            />
          </div>
        );
      })}
    </div>
  );
});

GraphCanvas.displayName = 'GraphCanvas';

export default GraphCanvas;
