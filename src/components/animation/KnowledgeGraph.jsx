import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { knowledgeGraphApi } from '../../services/apiService';
import { knowledgeGraphData } from '../../data/knowledge-graph/mockData';

const KnowledgeGraph = () => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  
  // 场景相关引用
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  
  // 节点和链接的引用
  const nodeObjectsRef = useRef({});
  const linkObjectsRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // 1. 初始化基础3D场景
    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();
    
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.set(1000, 1000, 1000);
    cameraRef.current = camera;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // 创建控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;
    
    // 创建光线投射器用于交互
    const raycaster = new THREE.Raycaster();
    raycasterRef.current = raycaster;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);
    
    // 2. 加载和渲染知识图谱数据
    const loadData = async () => {
      await loadGraphData(scene);
      setIsLoading(false);
    };
    
    loadData();
    
    // 3. 开始动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      
      // 更新控制器
      controls.update();
      
      // 渲染场景
      renderer.render(scene, camera);
    };
    
    animate();
    
    // 4. 设置事件监听
    const handleWindowResize = () => {
      const { width, height } = container.getBoundingClientRect();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    const handleMouseMove = (event) => {
      // 计算鼠标在规范化设备坐标中的位置 (-1 to +1)
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;
      
      // 检查悬停
      checkHover();
    };
    
    const handleClick = (event) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;
      
      // 处理点击
      handleNodeSelection();
    };
    
    window.addEventListener('resize', handleWindowResize);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);
    
    // 设置加载完成
    setIsLoading(false);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      
      // 清理场景资源
      if (renderer && container) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
      
      // 清理几何体和材质
      Object.values(nodeObjectsRef.current).forEach(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      
      linkObjectsRef.current.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
      });
    };
  }, []);
  
  // 加载图谱数据并创建3D对象
  const loadGraphData = async (scene) => {
    let graphData = knowledgeGraphData;
    
    try {
      // 从后端API获取知识图谱数据
      const response = await knowledgeGraphApi.getAll();
      if (response && response.length > 0) {
        // 假设后端返回的是包含nodes和links的对象数组
        const latestData = response[0];
        graphData = JSON.parse(latestData.dataContent);
      }
    } catch (error) {
      console.error('获取知识图谱数据失败，使用本地模拟数据:', error);
    }
    
    // 应用力导向布局
    const positionedData = applyForceLayout(graphData);
    
    // 创建节点材质
    const nodeMaterials = {};
    
    // 创建节点
    positionedData.nodes.forEach(node => {
      // 创建材质
      if (!nodeMaterials[node.color]) {
        nodeMaterials[node.color] = new THREE.MeshStandardMaterial({
          color: node.color || 0x6366f1,
          transparent: true,
          opacity: 0.9
        });
      }
      
      // 创建几何体
      const size = node.size || 20;
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      
      // 创建网格
      const nodeMesh = new THREE.Mesh(geometry, nodeMaterials[node.color]);
      nodeMesh.position.set(node.x, node.y, node.z);
      nodeMesh.userData = { ...node };
      nodeMesh.name = `node-${node.id}`;
      
      // 添加到场景
      scene.add(nodeMesh);
      nodeObjectsRef.current[node.id] = nodeMesh;
    });
    
    // 创建链接
    positionedData.links.forEach(link => {
      const sourceNode = nodeObjectsRef.current[link.source];
      const targetNode = nodeObjectsRef.current[link.target];
      
      if (sourceNode && targetNode) {
        // 创建线条材质
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.3,
          linewidth: 2
        });
        
        // 创建线条几何体
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(sourceNode.position.x, sourceNode.position.y, sourceNode.position.z),
          new THREE.Vector3(targetNode.position.x, targetNode.position.y, targetNode.position.z)
        ]);
        
        // 创建线条
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.userData = { link };
        line.name = `link-${link.source}-${link.target}`;
        
        // 添加到场景
        scene.add(line);
        linkObjectsRef.current.push(line);
      }
    });
  };
  
  // 应用简单的力导向布局
  const applyForceLayout = (graphData) => {
    const nodes = [...graphData.nodes];
    const links = [...graphData.links];
    
    // 初始化位置
    nodes.forEach(node => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 500;
      node.x = Math.cos(angle) * radius;
      node.y = (Math.random() - 0.5) * 200;
      node.z = Math.sin(angle) * radius;
    });
    
    // 简单的力导向布局模拟
    // 1. 对每个链接，让源节点和目标节点相互吸引
    links.forEach(link => {
      const source = nodes.find(n => n.id === link.source);
      const target = nodes.find(n => n.id === link.target);
      
      if (source && target) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dz = target.z - source.z;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz) || 0.1;
        
        // 吸引力
        const force = (distance - 100) * 0.01;
        
        source.x += dx / distance * force;
        source.y += dy / distance * force;
        source.z += dz / distance * force;
        
        target.x -= dx / distance * force;
        target.y -= dy / distance * force;
        target.z -= dz / distance * force;
      }
    });
    
    return { nodes, links };
  };
  
  // 检查节点悬停
  const checkHover = () => {
    if (!raycasterRef.current || !cameraRef.current || !sceneRef.current) return;
    
    // 更新光线投射器
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    // 获取所有节点对象
    const nodeObjects = Object.values(nodeObjectsRef.current);
    
    // 计算交点
    const intersects = raycasterRef.current.intersectObjects(nodeObjects);
    
    if (intersects.length > 0) {
      const hovered = intersects[0].object;
      if (hoveredNode && hoveredNode.id !== hovered.userData.id) {
        // 恢复之前的节点大小
        const prevNode = nodeObjectsRef.current[hoveredNode.id];
        if (prevNode) {
          const originalSize = hoveredNode.size || 20;
          prevNode.scale.set(1, 1, 1);
          prevNode.material.opacity = 0.9;
        }
      }
      
      // 高亮当前悬停节点
      hovered.scale.set(1.2, 1.2, 1.2);
      hovered.material.opacity = 1;
      
      setHoveredNode(hovered.userData);
    } else if (hoveredNode) {
      // 没有悬停时恢复
      const prevNode = nodeObjectsRef.current[hoveredNode.id];
      if (prevNode) {
        prevNode.scale.set(1, 1, 1);
        prevNode.material.opacity = 0.9;
      }
      setHoveredNode(null);
    }
  };
  
  // 处理节点选择和空间穿梭
  const handleNodeSelection = () => {
    if (!raycasterRef.current || !cameraRef.current || !sceneRef.current || !controlsRef.current) return;
    
    // 更新光线投射器
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    // 获取所有节点对象
    const nodeObjects = Object.values(nodeObjectsRef.current);
    
    // 计算交点
    const intersects = raycasterRef.current.intersectObjects(nodeObjects);
    
    if (intersects.length > 0) {
      const clickedNode = intersects[0].object.userData;
      setSelectedNode(clickedNode);
      
      // 空间穿梭 - 相机飞到节点位置
      const nodePosition = nodeObjectsRef.current[clickedNode.id].position;
      
      // 平滑动画移动相机
      const startPosition = { ...cameraRef.current.position };
      const targetPosition = {
        x: nodePosition.x * 3,
        y: nodePosition.y * 3,
        z: nodePosition.z * 3
      };
      
      const duration = 1500;
      const startTime = performance.now();
      
      const animateCamera = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // 缓动函数
        const easeProgress = 0.5 * (1 - Math.cos(Math.PI * progress));
        
        // 更新相机位置
        cameraRef.current.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeProgress;
        cameraRef.current.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeProgress;
        cameraRef.current.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeProgress;
        
        // 看向节点
        cameraRef.current.lookAt(nodePosition);
        
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        } else {
          // 动画结束后更新控制器的目标
          controlsRef.current.target.copy(nodePosition);
        }
      };
      
      requestAnimationFrame(animateCamera);
    }
  };
  
  // 重置视图
  const resetView = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const startPosition = { ...cameraRef.current.position };
    const targetPosition = { x: 1000, y: 1000, z: 1000 };
    const targetLookAt = new THREE.Vector3(0, 0, 0);
    
    const duration = 1500;
    const startTime = performance.now();
    
    const animateReset = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // 缓动函数
      const easeProgress = 0.5 * (1 - Math.cos(Math.PI * progress));
      
      // 更新相机位置
      cameraRef.current.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeProgress;
      cameraRef.current.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeProgress;
      cameraRef.current.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeProgress;
      
      // 看向中心
      cameraRef.current.lookAt(targetLookAt);
      
      if (progress < 1) {
        requestAnimationFrame(animateReset);
      } else {
        // 动画结束后更新控制器的目标
        controlsRef.current.target.copy(targetLookAt);
        setSelectedNode(null);
      }
    };
    
    requestAnimationFrame(animateReset);
  };
  
  // 获取节点类型中文标签
  const getTypeLabel = (type) => {
    const typeMap = {
      'concept': '概念',
      'algorithm': '算法',
      'dataStructure': '数据结构',
      'application': '应用场景',
      'resource': '资源'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* 加载覆盖层 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-10 bg-gray-900 bg-opacity-90">
          <div className="text-xl">加载3D知识图谱中...</div>
        </div>
      )}
      
      {/* 3D场景容器 */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* 选中节点信息面板 */}
      {selectedNode && (
        <div className="absolute top-4 right-4 p-4 bg-gray-800 bg-opacity-90 rounded-lg shadow-lg z-20 max-w-xs">
          <h3 className="text-xl font-bold mb-2" style={{ color: selectedNode.color }}>
            {selectedNode.label}
          </h3>
          <p className="text-gray-300 mb-2">
            <strong>类型：</strong>{getTypeLabel(selectedNode.type)}
          </p>
          <button 
            className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
            onClick={resetView}
          >
            返回全局视图
          </button>
        </div>
      )}
      
      {/* 悬停节点信息提示 */}
      {hoveredNode && (
        <div className="absolute pointer-events-none z-20 px-3 py-2 bg-gray-800 bg-opacity-90 rounded text-white text-sm shadow-lg">
          {hoveredNode.label}
        </div>
      )}
      
      {/* 控制按钮 */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button 
          className="p-3 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-opacity"
          onClick={resetView}
          title="重置视图"
        >
          🔄
        </button>
      </div>
      
      {/* 使用说明 */}
      <div className="absolute bottom-4 left-4 p-3 bg-gray-800 bg-opacity-80 rounded-lg shadow-lg z-10 text-sm text-gray-300 max-w-sm">
        <p>💡 点击任意节点进行空间穿梭</p>
        <p>🕹️ 可拖动旋转视图，滚轮缩放</p>
        <p>🔄 点击重置按钮返回全局视图</p>
        <p>👆 悬停节点查看标签</p>
      </div>
    </div>
  );
};

export default KnowledgeGraph;