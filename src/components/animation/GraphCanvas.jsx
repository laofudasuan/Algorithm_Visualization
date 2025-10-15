// GraphCanvas.jsx - 支持多图切换的React组件
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import AnimateGraph from './animateGraph.jsx';
// 导入默认图数据
import ExampleGraph from '../../data/graphs/ExampleGraph-500-300.json';

const GraphCanvas = forwardRef(({ width = 1000, height = 600, graphCount = 1, graphNames = [], isLoading: externalIsLoading }, ref) => {
  // 状态
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0);
  const [prevGraphIndex, setPrevGraphIndex] = useState(0); // 跟踪上一个图的索引，用于动画方向
  const [isAnimating, setIsAnimating] = useState(false); // 跟踪动画状态
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
    };
    
    loadGraphData();
    }, []); // 空依赖数组，只在组件挂载时执行一次
    
    // 当graphData更新时，检查是否所有数据都已加载完成
    useEffect(() => {
      if (graphData.length === graphCount && graphData.length > 0) {
        setIsInternalLoading(false);
      }
    }, [graphData, graphCount]);
  
  // 当AnimateGraph组件初始化时，保存其控制器
  const handleGraphInit = (index, controller) => {
    const newControllers = [...graphControllers];
    newControllers[index] = controller;
    setGraphControllers(newControllers);
  };
  
  // 切换当前显示的图索引
  const switchGraphIndex = (index) => {
    if (index >= 0 && index < graphCount && index !== currentGraphIndex) {
      setIsAnimating(true);
      setPrevGraphIndex(currentGraphIndex);
      setCurrentGraphIndex(index);
      
      // 动画完成后重置动画状态
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000); // 与CSS过渡时间匹配，改为1秒
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
        currentController.setNodesStyle(modifications.nodesStyle);
      }
      
      if (modifications.edgesStyle) {
        currentController.setEdgesStyle(modifications.edgesStyle);
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
    getGraphCount: () => graphCount,
    isLoading: () => isLoading
  }), [currentGraphIndex, graphCount, graphControllers, isLoading]);
  
  // 只在数据加载完成后渲染图表内容
  // 当graphData.length > 0时才渲染内容，确保有数据可用
  if (isLoading || graphData.length === 0) {
    return <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}></div>;
  }
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 图切换指示器 */}
      <div style={{
        position: 'absolute',
        top: '5px',
        left: `${width+5}px`, // 根据width计算右侧位置，确保紧贴画布右侧
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
      
      {/* 渲染所有图，添加滑动动画效果 */}
      {Array.from({ length: graphCount }).map((_, index) => {
        // 现在可以安全地使用graphData，因为我们确保只有在数据加载完成后才渲染这部分
        const graph = graphData[index];
        
        // 计算每个图的样式
          let style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transition: 'transform 1s ease-out, opacity 1s ease-out',
            zIndex: 1
          };
        
        // 当前显示的图
        if (index === currentGraphIndex) {
          style.zIndex = 3;
          
          // 如果正在动画中，根据方向设置初始位置
          if (isAnimating) {
            // 新图从上方或下方进入
            if (index > prevGraphIndex) {
              // 向下切换时，新图从上方进入
              style.transform = 'translateY(0)';
              style.opacity = 1;
            } else {
              // 向上切换时，新图从下方进入
              style.transform = 'translateY(0)';
              style.opacity = 1;
            }
          } else {
            style.transform = 'translateY(0)';
            style.opacity = 1;
          }
        }
        // 上一个显示的图（用于动画）
        else if (isAnimating && index === prevGraphIndex) {
          style.zIndex = 2;
          
          // 根据方向设置退出动画
          if (currentGraphIndex > prevGraphIndex) {
            // 向下切换时，旧图向上退出
            style.transform = 'translateY(-100%)';
            style.opacity = 0;
          } else {
            // 向上切换时，旧图向下退出
            style.transform = 'translateY(100%)';
            style.opacity = 0;
          }
        }
        // 其他图
        else {
          // 根据与当前图的位置关系设置初始位置
          if (index > currentGraphIndex) {
            // 下面的图放在画布下方
            style.transform = 'translateY(100%)';
          } else {
            // 上面的图放在画布上方
            style.transform = 'translateY(-100%)';
          }
          style.opacity = 0;
        }
        
        return (
          <div
            key={index}
            style={style}
          >
            <AnimateGraph
              ref={el =>
                 animateGraphRefs.current[index] = el}
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
