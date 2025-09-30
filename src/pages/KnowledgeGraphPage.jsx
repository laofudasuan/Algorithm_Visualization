import React, { useEffect } from 'react';
import KnowledgeGraph from '../components/animation/KnowledgeGraph';
import anime from 'animejs';

function KnowledgeGraphPage() {
  useEffect(() => {
    // 页面进入动画
    anime.timeline({
      easing: 'easeOutExpo',
      duration: 750
    })
      .add({
        targets: '.page-content',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: 100
      })
      .add({
        targets: '.section-title',
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: 200
      })
      .add({
        targets: '.section-description',
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: 300
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white page-content">
      {/* 页面标题区域 */}
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 section-title">
          3D 知识图谱可视化
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl section-description">
          交互式探索算法与数据结构的关联关系，通过空间穿梭体验知识的层次结构。
        </p>
      </div>

      {/* 知识图谱区域 */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2 text-blue-400">算法知识网络</h2>
            <p className="text-gray-300">
              这个3D知识图谱展示了不同算法类别、具体算法、数据结构以及它们之间的关联关系。
              点击任意节点可以进行空间穿梭，聚焦查看相关知识。
            </p>
          </div>
          
          {/* 3D知识图谱组件 */}
          <div className="h-[70vh] w-full">
            <KnowledgeGraph />
          </div>
        </div>
      </div>

      {/* 功能说明区域 */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 bg-opacity-30 p-6 rounded-lg hover:bg-opacity-50 transition-all">
            <div className="text-blue-400 text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">空间穿梭</h3>
            <p className="text-gray-300">
              点击任意节点，相机将平滑过渡到该节点，突出显示其相关连接，让您聚焦于特定知识领域。
            </p>
          </div>
          
          <div className="bg-gray-800 bg-opacity-30 p-6 rounded-lg hover:bg-opacity-50 transition-all">
            <div className="text-blue-400 text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">力导向布局</h3>
            <p className="text-gray-300">
              使用3D力导向算法自动布局，关联节点相互靠近，形成层次清晰的空间结构，便于理解知识关联。
            </p>
          </div>
          
          <div className="bg-gray-800 bg-opacity-30 p-6 rounded-lg hover:bg-opacity-50 transition-all">
            <div className="text-blue-400 text-3xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">分类可视化</h3>
            <p className="text-gray-300">
              不同类型的节点使用不同颜色标识，直观区分概念、算法、数据结构、应用场景等知识类型。
            </p>
          </div>
        </div>
      </div>

      {/* 数据来源说明 */}
      <div className="container mx-auto px-4 py-8 mb-16">
        <div className="bg-gray-800 bg-opacity-20 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">
            <strong>数据说明：</strong>当前知识图谱使用模拟数据展示。在实际应用中，数据将从Neo4j图数据库获取，
            支持更复杂的查询和动态数据更新。
          </p>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeGraphPage;