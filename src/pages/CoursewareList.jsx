import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as PIXI from 'pixi.js';
// 页面加载时立即执行的console.log，验证组件是否正常加载
console.log('CoursewareList组件已加载');

const CoursewareList = () => {
  const [coursewares, setCoursewares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapConfig, setMapConfig] = useState(null);
  const [openCards, setOpenCards] = useState([]);
  const pixiContainerRef = useRef(null);
  const pixiCanvasHostRef = useRef(null);
  const pixiAppRef = useRef(null);
  const sphereCacheRef = useRef(new Map());
  const shadowCacheRef = useRef(new Map());
  const navigate = useNavigate();

  useEffect(() => {
    // 立即打印加载开始信息
    console.log('开始加载内容数据');
    
    // 模拟加载内容数据
    const loadCoursewares = async () => {
      try {
        // 动态导入目录中的所有.mdx文件
        // 使用Vite的import.meta.globEager来静态分析和导入所有mdx文件
        const mdxFiles = import.meta.glob('/src/data/courseware/*.mdx', { eager: true });
        
        console.log('发现的MDX文件:', Object.keys(mdxFiles));
        
        // 处理每个mdx文件，提取frontmatter信息
        const coursewaresData = Object.entries(mdxFiles).map(([filepath, module]) => {
          // 从文件路径中提取ID (例如从'/src/data/courseware/courseware-001.mdx'提取'courseware-001')
          const id = filepath.split('/').pop().replace('.mdx', '');
          
          // 提取frontmatter数据，同时检查attributes和frontmatter属性
          const title = module.attributes?.title || module.frontmatter?.title || '未知标题';
          const description = module.attributes?.description || module.frontmatter?.description || '暂无描述';
          const author = module.attributes?.author || module.frontmatter?.author || '未知作者';
          const createdAt = module.attributes?.createdAt || module.frontmatter?.createdAt || '未知时间';
          const cover = module.attributes?.cover || module.frontmatter?.cover;
          
          console.log(`处理文件 ${filepath}:`, { id, title, description });
          
          return {
            id,
            title,
            description,
            author,
            createdAt,
            cover
          };
        });
        
        setCoursewares(coursewaresData);
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
    if (loading) return;
    if (!mapConfig) return;
    const container = pixiContainerRef.current;
    if (!container) return;

    const app = new PIXI.Application();
    pixiAppRef.current = app;
    const { width, height } = mapConfig;
    app.init({
      width: width,
      height: height,
      antialias: true,
      // 修改背景颜色为透明，以便显示页面背景
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    }).then(() => {
      const host = pixiCanvasHostRef.current || container;
      host.innerHTML = '';
      host.appendChild(app.canvas);

      const edgeLayer = new PIXI.Container();
      const nodeLayer = new PIXI.Container();
      app.stage.addChild(edgeLayer);
      app.stage.addChild(nodeLayer);

      if (Array.isArray(mapConfig.edges)) {
        mapConfig.edges.forEach(edge => {
          const src = mapConfig.nodes.find(n => n.id === edge.source);
          const dst = mapConfig.nodes.find(n => n.id === edge.target);
          if (!src || !dst) return;
          const g = new PIXI.Graphics();
          g.moveTo(src.x, src.y);
          g.lineTo(dst.x, dst.y);
          g.stroke({ width: 8, color: 0xA0AEC0, alpha: 1 });
          edgeLayer.addChild(g);
        });
      }

      function toRGB(hex) {
        const v = Number(hex);
        const r = (v >> 16) & 255;
        const g = (v >> 8) & 255;
        const b = v & 255;
        return [r, g, b];
      }

      function adjustColor(hex, amount) {
        const [r0, g0, b0] = toRGB(hex);
        const r = Math.max(0, Math.min(255, r0 + amount));
        const g = Math.max(0, Math.min(255, g0 + amount));
        const b = Math.max(0, Math.min(255, b0 + amount));
        return `rgb(${r},${g},${b})`;
      }

      function getSphereTexture(radius, cfg) {
        const color = cfg.color;
        const lf = cfg.lightCenter || [0.7, 0.6];
        const hf = cfg.highlightCenter || [0.55, 0.45];
        const ha = cfg.highlightAlpha ?? 0.6;
        const key = `${radius}-${color}-${lf[0]}-${lf[1]}-${hf[0]}-${hf[1]}-${ha}`;
        if (sphereCacheRef.current.has(key)) return sphereCacheRef.current.get(key);
        const d = radius * 2;
        const c = document.createElement('canvas');
        c.width = d;
        c.height = d;
        const ctx = c.getContext('2d');
        const cx = radius * lf[0];
        const cy = radius * lf[1];
        const grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
        grad.addColorStop(0, adjustColor(color, 60));
        grad.addColorStop(0.6, adjustColor(color, 0));
        grad.addColorStop(1, adjustColor(color, -60));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, Math.PI * 2);
        ctx.fill();
        const hx = radius * hf[0];
        const hy = radius * hf[1];
        const hgrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, radius * 0.7);
        hgrad.addColorStop(0, `rgba(255,255,255,${ha})`);
        hgrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hgrad;
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, Math.PI * 2);
        ctx.fill();
        const tex = PIXI.Texture.from(c);
        sphereCacheRef.current.set(key, tex);
        return tex;
      }

      function getShadowTexture(radius) {
        const key = `shadow-${radius}`;
        if (shadowCacheRef.current.has(key)) return shadowCacheRef.current.get(key);
        const d = Math.ceil(radius * 2.2);
        const c = document.createElement('canvas');
        c.width = d;
        c.height = d;
        const ctx = c.getContext('2d');
        const cx = d * 0.6;
        const cy = d * 0.6;
        const grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
        grad.addColorStop(0, 'rgba(0,0,0,0.25)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        const tex = PIXI.Texture.from(c);
        shadowCacheRef.current.set(key, tex);
        return tex;
      }

      if (Array.isArray(mapConfig.nodes)) {
        mapConfig.nodes.forEach(node => {
          const radius = node.radius || 28;
          const style = node.style || {};
          const baseColor = Number(style.color ?? 0x4F46E5);
          const shadowTex = getShadowTexture(radius);
          const shadow = new PIXI.Sprite(shadowTex);
          shadow.anchor.set(0.5);
          const so = style.shadowOffset || [0.25, 0.25];
          shadow.x = node.x + radius * (so[0] || 0);
          shadow.y = node.y + radius * (so[1] || 0);
          shadow.alpha = style.shadowAlpha ?? 0.8;

          const sphereTex = getSphereTexture(radius, {
            color: baseColor,
            lightCenter: style.lightCenter,
            highlightCenter: style.highlightCenter,
            highlightAlpha: style.highlightAlpha,
          });
          const ball = new PIXI.Sprite(sphereTex);
          ball.anchor.set(0.5);
          ball.x = node.x;
          ball.y = node.y;
          ball.cursor = 'pointer';
          ball.eventMode = 'static';

          const label = new PIXI.Text({
            text: (coursewares.find(c => c.id === node.id)?.title) || node.id,
            style: { fontSize: 18, fill: 0x111827, align: 'center', fontWeight: '500' }
          });
          label.anchor.set(0.5);
          label.x = node.x;
          label.y = node.y - (radius + 18);

          ball.on('pointertap', () => {
            const data = coursewares.find(c => c.id === node.id);
            if (data) {
              setOpenCards(prev => {
                const exists = prev.find(c => c.id === data.id);
                if (exists) {
                  return prev.map(c => c.id === data.id ? { ...c, nodeX: node.x, nodeY: node.y } : c);
                }
                return [...prev, { id: data.id, data, nodeX: node.x, nodeY: node.y }];
              });
            }
          });

          nodeLayer.addChild(shadow);
          nodeLayer.addChild(ball);
          nodeLayer.addChild(label);
        });
      }
    });

    return () => {
      try {
        if (pixiAppRef.current) {
          pixiAppRef.current.destroy(true);
          pixiAppRef.current = null;
        }
      } catch {}
    };
  }, [loading, mapConfig, coursewares]);

  // 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="w-screen px-0">
        <motion.div 
          className="page-content w-screen max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >

          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            </div>
          ) : (
            <div ref={pixiContainerRef} className="w-full overflow-auto relative" style={{ height: mapConfig.height, width: mapConfig.width }}>
                <div ref={pixiCanvasHostRef} />
                <AnimatePresence>
                  {openCards.map(card => (
                    <motion.div
                      key={card.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                      className="absolute z-50"
                      style={{ left: (card.nodeX || 0) - 180, top: (card.nodeY || 0) - 100 }}
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
                              onClick={() => navigate(`/courseware/${card.id}`)}
                              className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                              title="打开"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setOpenCards(prev => prev.filter(c => c.id !== card.id))}
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