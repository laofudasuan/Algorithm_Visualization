// GraphCanvas.jsx - 支持多图切换的React组件
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import AnimateGraph from './animateGraph.jsx';
import EmptyGraph from '../../data/graphs/EmptyGraph.json';

const GraphCanvas = forwardRef(({ width = 1000, height = 600, graphCount = 1, graphNames = [], graphData = null, isLoading: externalIsLoading }, ref) => {
  // 状态
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0);
  const [graphControllers, setGraphControllers] = useState([]);
  const [graphDataList, setGraphDataList] = useState([]);
  const [isInternalLoading, setIsInternalLoading] = useState(true); // 内部数据加载状态
  
  // 合并外部和内部的加载状态
  // 只有当外部传入了isLoading且为true，或者内部仍然在加载时，才认为组件处于加载状态
  const isLoading = (externalIsLoading === true) || isInternalLoading;
  
  // Refs
  const animateGraphRefs = useRef([]);
  
  // 初始化图数据 - 只在组件挂载时执行一次
  useEffect(() => {
    // 如果提供了graphData属性，则直接使用它
    if (graphData) {
      setGraphDataList([graphData]);
      setIsInternalLoading(false);
      return;
    }
    
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
            console.warn(`无法加载图数据: ${graphNames[i]}，使用空图代替`, error);
            data.push(EmptyGraph);
          }
        } else {
          // 没有提供名称或名称不足，使用空图
          data.push(EmptyGraph);
        }
      }
      
      setGraphDataList(data);
      setIsInternalLoading(false); // 数据加载完成
    };
    
    loadGraphData();
  }, []); // 空依赖数组，只在组件挂载时执行一次
  
  // 当graphDataList更新时，检查是否所有数据都已加载完成
  useEffect(() => {
    if (graphDataList.length > 0) {
      // 初始化所有图控制器
      const controllers = [];
      for (let i = 0; i < graphDataList.length; i++) {
        controllers.push(null);
      }
      setGraphControllers(controllers);
    }
  }, [graphDataList]);
  
  // 初始化AnimateGraph控制器
  const initController = (index, controller) => {
    if (index >= 0 && index < graphControllers.length) {
      setGraphControllers(prev => {
        const newControllers = [...prev];
        newControllers[index] = controller;
        return newControllers;
      });
      
      // 如果这是当前显示的图，加载图数据
      if (index === currentGraphIndex && graphDataList[index]) {
        loadGraphDataToController(controller, graphDataList[index]);
      }
    }
  };
  
  // 将图数据加载到控制器
  const loadGraphDataToController = (controller, data) => {
    if (!controller || !data) return;
    
    // 添加节点
    if (data.nodes && Array.isArray(data.nodes)) {
      data.nodes.forEach(node => {
        controller.addNode({
          id: node.id,
          x: node.x,
          y: node.y,
          size: node.size,
          type: node.type,
          style: node.style,
          label: node.label
        });
      });
    }
    
    // 添加边
    if (data.edges && Array.isArray(data.edges)) {
      data.edges.forEach(edge => {
        controller.addEdge({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          style: edge.style,
          label: edge.label
        });
      });
    }
  };
  
  // 当当前图索引或图控制器发生变化时，加载图数据
  useEffect(() => {
    if (graphControllers[currentGraphIndex] && graphDataList[currentGraphIndex]) {
      loadGraphDataToController(graphControllers[currentGraphIndex], graphDataList[currentGraphIndex]);
    }
  }, [currentGraphIndex, graphControllers, graphDataList]);
  
  // 切换到指定索引的图
  const switchToGraph = (index) => {
    if (index >= 0 && index < graphCount) {
      setCurrentGraphIndex(index);
    }
  };
  
  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    // 转发控制器方法
    dispatchOperation: (operation, ...args) => {
      const controller = graphControllers[currentGraphIndex];
      if (controller && controller[operation]) {
        return controller[operation](...args);
      } else if (controller) {
        console.warn(`控制器不存在方法: ${operation}`);
      }
    },
    
    // 切换图的方法
    switchToGraph,
    
    // 获取当前图索引
    getCurrentGraphIndex: () => currentGraphIndex,
    
    // 获取所有图控制器
    getGraphControllers: () => graphControllers
  }));
  
  // 渲染图列表
  const renderGraphs = () => {
    return graphDataList.map((_, index) => (
      <AnimateGraph
        key={index}
        ref={el => animateGraphRefs.current[index] = el}
        width={width}
        height={height}
        onControllerReady={(controller) => initController(index, controller)}
        style={{ display: index === currentGraphIndex ? 'block' : 'none' }}
      />
    ));
  };
  
  // 渲染加载状态
  if (isLoading) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ width, height }} className="bg-white rounded-lg overflow-hidden">
      {renderGraphs()}
    </div>
  );
});

GraphCanvas.displayName = 'GraphCanvas';

export default GraphCanvas;