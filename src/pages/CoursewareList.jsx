import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, { MiniMap, Controls, Background, ReactFlowProvider, useNodesState, useEdgesState, useViewport, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import CoursewareNode from '../components/flow/CoursewareNode.jsx';
import '../styles/reactflow-overrides.css';
import { CATEGORY_COLORS } from '../constants/categories.js';

const nodeTypes = { courseware: CoursewareNode };

const OverlayCards = ({ cards, onNavigate, onClose }) => {
  const { x, y, zoom } = useViewport();
  return (
    <AnimatePresence>
      {cards.map((card) => (
        <motion.div
          key={card.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="absolute z-50"
          style={{ left: (card.nodeX || 0) * zoom + (x || 0) - 180, top: (card.nodeY || 0) * zoom + (y || 0) - 100 }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-[360px] border">
            <div className="p-4">
              <h3 className="text-xl font-bold mb-1">{card.data.title}</h3>
              <p className="text-gray-700 mb-3">{card.data.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>作者：{card.data.author}</span>
                <span>时间：{card.data.createdAt}</span>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => onNavigate(card.id)}
                  className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                  title="打开"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => onClose(card.id)}
                  className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  title="关闭"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

const CoursewareList = () => {
  const [coursewares, setCoursewares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapConfig, setMapConfig] = useState(null);
  const [openCards, setOpenCards] = useState([]);
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const loadCoursewares = async () => {
      try {
        const jsonFiles = import.meta.glob('/src/data/courseware/*.json', { eager: true });
        const mdxFiles = import.meta.glob('/src/data/courseware/*.mdx', { eager: true });
        const mapById = {};
        Object.entries(jsonFiles).forEach(([filepath, module]) => {
          const id = filepath.split('/').pop().replace('.json', '');
          const data = module.default || module;
          const title = data?.title || '未知标题';
          const description = data?.description || '暂无描述';
          const author = data?.author || '未知作者';
          const createdAt = data?.createdAt || '未知时间';
          const cover = data?.cover;
          mapById[id] = { id, title, description, author, createdAt, cover };
        });
        Object.entries(mdxFiles).forEach(([filepath, module]) => {
          const id = filepath.split('/').pop().replace('.mdx', '');
          if (mapById[id]) return;
          const title = module.attributes?.title || module.frontmatter?.title || '未知标题';
          const description = module.attributes?.description || module.frontmatter?.description || '暂无描述';
          const author = module.attributes?.author || module.frontmatter?.author || '未知作者';
          const createdAt = module.attributes?.createdAt || module.frontmatter?.createdAt || '未知时间';
          const cover = module.attributes?.cover || module.frontmatter?.cover;
          mapById[id] = { id, title, description, author, createdAt, cover };
        });
        setCoursewares(Object.values(mapById));
        const mapModule = await import('../data/courseware/courseware-map.json');
        setMapConfig(mapModule.default || mapModule);
      } catch (error) {
        console.error('加载内容数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCoursewares();
  }, []);

  useEffect(() => {
    if (!mapConfig) return;
    const nextNodes = (mapConfig.nodes || []).map((n) => {
      const label = (coursewares.find((c) => c.id === n.id)?.title) || n.id;
      return {
        id: n.id,
        type: 'courseware',
        position: { x: n.x, y: n.y },
        data: { label, category: n.category },
        draggable: false,
        style: { borderRadius: 12, border: '2px solid #e6e6e6ff', color: '#000000', fontWeight: 700, padding: '8px 12px' },
        className: 'courseware-node',
      };
    });
    const nextEdges = (mapConfig.edges || []).map((e, idx) => ({
      id: `${e.source}-${e.target}-${idx}`,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceSide || null,
      targetHandle: e.targetSide || null,
      label: e.label || undefined,
      style: { stroke: '#A0AEC0', strokeWidth: 3 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#A0AEC0' },
    }));
    setNodes(nextNodes);
    setEdges(nextEdges);
  }, [mapConfig, coursewares, setNodes, setEdges]);

  const onNodeClick = (_e, node) => {
    const data = coursewares.find((c) => c.id === node.id);
    if (!data) return;
    setOpenCards((prev) => {
      const exists = prev.find((c) => c.id === data.id);
      if (exists) {
        return prev.map((c) => (c.id === data.id ? { ...c, nodeX: node.position.x, nodeY: node.position.y } : c));
      }
      return [...prev, { id: data.id, data, nodeX: node.position.x, nodeY: node.position.y }];
    });
  };

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }), []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="w-full h-full px-0">
        <motion.div
          className="page-content w-full h-full max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          variants={containerVariants}
        >
          {loading ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="w-full h-full overflow-hidden relative">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                  minZoom={0.2}
                  maxZoom={4}
                  proOptions={{ hideAttribution: true }}
                >
                  <MiniMap pannable zoomable style={{ right: 0, bottom: 0, width: 180, height: 120 }} />
                  <Controls position="bottom-right" showInteractive={false} showZoom={true} showFitView={true} style={{ right: 16, bottom: 116 }} />
                  <Background color="#f3f4f6" variant="dots" gap={16} size={1} />
                  <div
                    style={{
                      position: 'absolute',
                      left: 4,
                      top: 4,
                      background: '#ffffff',
                      borderRadius: 8,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                      border: '1px solid #e5e7eb',
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 8,
                      alignItems: 'flex-start',
                      zIndex: 10,
                    }}
                  >
                    {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
                      <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: color,
                            display: 'inline-block',
                          }}
                        />
                        <span style={{ fontSize: 12, color: '#374151' }}>{name}</span>
                      </div>
                    ))}
                  </div>
                </ReactFlow>
                <OverlayCards
                  cards={openCards}
                  onNavigate={(id) => navigate(`/courseware/${id}`)}
                  onClose={(id) => setOpenCards((prev) => prev.filter((c) => c.id !== id))}
                />
              </ReactFlowProvider>
            </div>
          )}

          {!loading && coursewares.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="text-center py-12">
                <p className="text-gray-500">暂无可用内容</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CoursewareList;
