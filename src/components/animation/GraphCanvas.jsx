// GraphCanvas.jsx - 支持多图切换的React组件
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import AnimateGraph from './animateGraph.jsx';
// 导入默认图数据
import ExampleGraph from '../../data/graphs/ExampleGraph-500-300.json';

const GraphCanvas = forwardRef(({ width = 1000, height = 600, graphCount = 1, graphNames = [], isLoading: externalIsLoading }, ref) => {
  // 状态
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0);
  const [graphControllers, setGraphControllers] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [isInternalLoading, setIsInternalLoading] = useState(true); // 内部数据加载状态
  
  // 合并外部和内部的加载状态
  // 只有当外部传入了isLoading且为true，或者内部仍然在加载时，才认为组件处于加载状态
  const isLoading = (externalIsLoading === true) || isInternalLoading;
  
  // Refs
  const animateGraphRefs = useRef([]);
  
  // 初始化图数据 - 只在组件挂载时执行一次
  useEffect(() => {
    // 准备图数据数组
    const loadGraphData = async () => {
      const data = [];
      
      for (let i = 0; i < graphCount; i++) {
        // 如果提供了graphNames数组且有对应的名称，则尝试导入对应的JSON文件
        if (graphNames[i]) {
          try {
            // 动态导入JSON文件
            const graphModule = await import(`../../data/graphs/${graphNames[i]}.json`);
            console.log(`图(${i})：成功读取: ${graphNames[i]}`);
            data.push(graphModule.default);
          } catch (error) {
            console.warn(`无法加载图数据: ${graphNames[i]}，使用默认图代替`, error);
            data.push(ExampleGraph);
          }
        } else {
          // 没有提供名称或名称不足，使用默认图
          data.push(ExampleGraph);
        }
      }
      
      setGraphData(data);
      setIsInternalLoading(false); // 数据加载完成
    };
    
    loadGraphData();
  }, []); // 空依赖数组，只在组件挂载时执行一次
  
  // 当graphData更新时，检查是否所有数据都已加载完成
  useEffect(() => {
    // 只有当所有图数据都已加载（graphData数组长度等于graphCount）
    // 并且组件已经不再处于内部加载状态时，才将isInternalLoading设置为false
    if (graphData.length === graphCount && isInternalLoading) {
      setIsInternalLoading(false);
    }
  }, [graphData, graphCount, isInternalLoading]);

  // 处理图的初始化
  const handleGraphInit = (index, controller) => {
    // 使用函数式状态更新，确保基于最新的状态进行操作，避免异步更新导致的数据覆盖
    setGraphControllers(prevControllers => {
      // 创建一个新的控制器数组副本，避免直接修改状态
      const newControllers = [...prevControllers];
      // 更新指定索引处的控制器
      newControllers[index] = controller;
      // 返回更新后的新数组
      return newControllers;
    });
  };
  
  // 切换图索引
  const switchGraphIndex = (index) => {
    if (index >= 0 && index < graphCount) {
      setCurrentGraphIndex(index);
    }
  };
  
  // 调度函数 - 根据操作类型调用相应的处理函数
  const dispatchOperation = (operationType, operationData) => {
    const currentController = graphControllers[currentGraphIndex];
    if (!currentController) return;

    // 映射操作类型到相应的处理方法
    const operationHandlers = {
      'addNode': 'handleAddNode',
      'updateNode': 'handleUpdateNode',
      'deleteNode': 'handleDeleteNode',
      'addEdge': 'handleAddEdge',
      'updateEdge': 'handleUpdateEdge',
      'deleteEdge': 'handleDeleteEdge',
      'nodesStyle': 'handleNodesStyle',
      'edgesStyle': 'handleEdgesStyle',
      'highlight': 'handleHighlight',
      'addIndicator': 'handleAddIndicator',
      'removeIndicator': 'handleRemoveIndicator'
    };

    const handlerMethod = operationHandlers[operationType];
    if (handlerMethod && typeof currentController[handlerMethod] === 'function') {
      currentController[handlerMethod](operationData);
    } else {
      console.warn(`Unsupported operation type: ${operationType}`);
    }
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    dispatchOperation,
    switchGraphIndex,
    getCurrentGraphIndex: () => currentGraphIndex,
    getGraphCount: () => graphCount,
    isLoading: () => isLoading
  }), [currentGraphIndex, graphCount, graphControllers, isLoading]);
  
  // 只在数据加载完成后渲染图表内容
  // 如果组件仍在加载状态，则不渲染图表内容
  if (isLoading || graphData.length === 0) {
    // 可以返回一个加载中的提示
    return <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }
  
  return (
    <div 
      style={{ 
        width, 
        height, 
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #ccc' 
      }}
    >
      {/* 图切换指示器 */}
      <div style={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '0px',
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
      {graphData.map((graph, index) => {
        // 计算图的样式
        const style = {
          position: 'absolute',
          width: '100%',
          height: '100%',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          opacity: index === currentGraphIndex ? 1 : 0,
          zIndex: index === currentGraphIndex ? 1 : 0
        };
        
        // 如果不是当前显示的图，将其移动到画布外
        if (index !== currentGraphIndex) {
          if (index > currentGraphIndex) {
            // 下面的图放在画布下方
            style.transform = 'translateY(100%)';
          } else {
            // 上面的图放在画布上方
            style.transform = 'translateY(-100%)';
          }
        }
        
        return (
          <div
            key={index}
            style={style}
          >
            <AnimateGraph
              ref={el => animateGraphRefs.current[index] = el}
              width={width}
              height={height}
              nodes={graph.nodes}
              edges={graph.edges}
              nodesStyle={graph.nodesStyle}
              edgesStyle={graph.edgesStyle}
              initialMode="none"
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
