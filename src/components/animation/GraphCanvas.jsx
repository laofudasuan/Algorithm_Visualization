// GraphCanvas.jsx - 支持多图切换的React组件
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import AnimateGraph from './animateGraph.jsx';
import EmptyGraph from '../../data/graphs/EmptyGraph.json';

const GraphCanvas = forwardRef(({ width = 1000, height = 600, graphData = null, isLoading: externalIsLoading, enableDrawing = true, onInit, backgroundImage = null }, ref) => {
  // 状态
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0);
  const [previousGraphIndex, setPreviousGraphIndex] = useState(0); // 上一个图的索引
  const [graphControllers, setGraphControllers] = useState([]);
  const [graphDataList, setGraphDataList] = useState([]);
  const [isInternalLoading, setIsInternalLoading] = useState(true); // 内部数据加载状态
  const [isAnimating, setIsAnimating] = useState(false); // 是否正在动画中
  const [animationDirection, setAnimationDirection] = useState('right'); // 动画方向：'left' 或 'right'
  
  // 合并外部和内部的加载状态
  // 只有当外部传入了isLoading且为true，或者内部仍然在加载时，才认为组件处于加载状态
  const isLoading = (externalIsLoading === true) || isInternalLoading;
  
  // Refs
  const animateGraphRefs = useRef([]);
  const isInitialized = useRef(false); // 用于跟踪是否已经初始化
  const hasCalledOnInit = useRef(false); // 用于跟踪是否已经调用过onInit
  
  useEffect(() => {
    // 使用ref来跟踪初始化状态，避免在依赖数组中添加graphDataList
    if (isInitialized.current) {
      console.log('GraphDataList已加载，跳过初始化');
      return;
    }
    // 如果提供了graphData属性，检查它是否为数组
    if (graphData) {
      if (Array.isArray(graphData)) {
        setGraphDataList(graphData);
      } else {
        setGraphDataList([graphData]);
      }
      setIsInternalLoading(false);
    } else {
      // 未提供数据，使用空图
      setGraphDataList([EmptyGraph]);
      setIsInternalLoading(false);
    }
    
    // 标记为已初始化
    isInitialized.current = true;
  }, []); // 空依赖数组，只在组件初始化时调用一次
  
  // 当graphDataList更新时，初始化所有图组件和控制器
  useEffect(() => {
    if (graphDataList.length > 0) {
      // 初始化所有图控制器
      const controllers = new Array(graphDataList.length).fill(null);
      setGraphControllers(controllers);
      
      // 确保refs数组足够长
      while (animateGraphRefs.current.length < graphDataList.length) {
        animateGraphRefs.current.push(null);
      }
    }
  }, [graphDataList]);
  
  // 初始化AnimateGraph控制器
  const initController = (index, controller) => {
    if (index >= 0) {
      setGraphControllers(prev => {
        // 确保数组足够长以容纳新的控制器
        const newGraphControllers = [...prev];
        while (newGraphControllers.length <= index) {
          newGraphControllers.push(null);
        }
        
        // 设置指定索引的控制器
        newGraphControllers[index] = controller;
        return newGraphControllers;
      });
      
      // 加载图数据到控制器，无论是否是当前显示的图
      if (graphDataList[index]) {
        loadGraphDataToController(controller, graphDataList[index]);
      }
      
      // 如果是第一个控制器且提供了onInit回调，则调用它
      if (index === 0 && typeof onInit === 'function' && !hasCalledOnInit.current) {
        console.log('调用onInit回调');
        hasCalledOnInit.current = true;
        onInit(controller);
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

    // 添加指示器
    if (data.indicators && Array.isArray(data.indicators)) {
      data.indicators.forEach(indicator => {
        controller.addIndicator(indicator);
      });
    }

  };
  
  // 切换到指定索引的图
  const switchToGraph = (index) => {
    if (index >= 0 && index < graphDataList.length && index !== currentGraphIndex && !isAnimating) {
      // 保存当前索引作为上一个索引
      setPreviousGraphIndex(currentGraphIndex);
      
      // 设置动画方向
      const direction = index > currentGraphIndex ? 'right' : 'left';
      setAnimationDirection(direction);
      
      // 开始动画
      setIsAnimating(true);
      
      // 更新当前索引
      setCurrentGraphIndex(index);
      
      // 动画结束后重置状态
      setTimeout(() => {
        setIsAnimating(false);
      }, 500); // 与CSS transition duration一致
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
    return Array.from({ length: graphDataList.length }).map((_, index) => {
      // 确定图的位置和动画样式
      let position = 'absolute';
      let left = 0;
      let transition = 'left 0.5s linear';
      let zIndex = 0;
      
      // 动画期间的特殊处理
      if (isAnimating) {
        // 当前显示的图（新图）
        if (index === currentGraphIndex) {
          left = 0;
          zIndex = 2;
        }
        // 上一个显示的图（旧图）
        else if (index === previousGraphIndex) {
          left = animationDirection === 'right' ? '-100%' : '100%';
          zIndex = 1;
        }
        // 将要显示但还未显示的图
        else if ((animationDirection === 'right' && index > currentGraphIndex) || 
                 (animationDirection === 'left' && index < currentGraphIndex)) {
          left = animationDirection === 'right' ? '100%' : '-100%';
        }
        // 其他图
        else {
          left = index > currentGraphIndex ? '100%' : '-100%';
          transition = 'none';
        }
      }
      // 非动画期间的常规处理
      else {
        // 当前显示的图
        if (index === currentGraphIndex) {
          left = 0;
          zIndex = 1;
        }
        // 其他图
        else {
          left = index > currentGraphIndex ? '100%' : '-100%';
          transition = 'none';
        }
      }
      
      return (
        <div 
          key={index}
          style={{ 
            position: position,
            left: left,
            top: 0,
            width: '100%',
            height: '100%',
            transition: transition,
            zIndex: zIndex
          }}
        >
          <AnimateGraph
            ref={el => {
              if (el) {
                animateGraphRefs.current[index] = el;
              }
            }}
            width={width}
            height={height}
            onInit={(controller) => initController(index, controller)}
            enableDrawing={enableDrawing}
            backgroundImage={backgroundImage}
            nodesStyle={graphData?.nodesStyle}
            edgesStyle={graphData?.edgesStyle}
          />
        </div>
      );
    });
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
  
  // 渲染图
  return (
    <div style={{ width, height, position: 'relative', overflow: 'hidden' }} className="bg-white rounded-lg border-2 border-gray-300">
      {
        renderGraphs()
      }
      
      {/* 图切换按钮 */}
      {graphDataList.length > 1 && (
        <div 
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '10px 15px',
            borderRadius: '25px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
        >
          {Array.from({ length: graphDataList.length }).map((_, index) => (
            <button
              key={index}
              onClick={() => switchToGraph(index)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: index === currentGraphIndex ? '3px solid #2196F3' : '1px solid #ddd',
                backgroundColor: index === currentGraphIndex ? '#2196F3' : 'white',
                color: index === currentGraphIndex ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.5s linear',
                boxShadow: index === currentGraphIndex ? '0 2px 8px rgba(33, 150, 243, 0.4)' : 'none'
              }}
              title={`切换到图 ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

GraphCanvas.displayName = 'GraphCanvas';

export default GraphCanvas;