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
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [viewScale, setViewScale] = useState(1);
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
    app.init({
      width: typeof window !== 'undefined' ? window.innerWidth : 1280,
      height: typeof window !== 'undefined' ? window.innerHeight : 720,
      antialias: true,
      // 修改背景颜色为透明，以便显示页面背景
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    }).then(() => {
      const host = pixiCanvasHostRef.current || container;
      host.innerHTML = '';
      host.appendChild(app.canvas);

      const world = new PIXI.Container();
      app.stage.addChild(world);
      const edgeLayer = new PIXI.Container();
      const nodeLayer = new PIXI.Container();
      world.addChild(edgeLayer);
      world.addChild(nodeLayer);

      const dragRect = new PIXI.Graphics();
      dragRect.rect(0, 0, app.renderer.width, app.renderer.height).fill({ color: 0x000000, alpha: 0 });
      dragRect.eventMode = 'static';
      app.stage.addChildAt(dragRect, 0);

      let isDragging = false;
      let dragStart = { x: 0, y: 0 };
      let worldStart = { x: 0, y: 0 };
      let scale = 1;
      const minScale = 0.2;
      const maxScale = 4;
      const pointers = new Map();
      let pinchStartDist = null;
      let pinchStartScale = 1;
      let vx = 0;
      let vy = 0;
      let lastMoveTime = 0;
      let lastMovePos = { x: 0, y: 0 };
      let inertiaActive = false;
      const applyScaleAtPoint = (newScale, px, py) => {
        newScale = Math.max(minScale, Math.min(maxScale, newScale));
        const anchorX = (px - world.position.x) / scale;
        const anchorY = (py - world.position.y) / scale;
        world.position.set(px - anchorX * newScale, py - anchorY * newScale);
        world.scale.set(newScale);
        scale = newScale;
        setViewScale(scale);
        setViewOffset({ x: world.position.x, y: world.position.y });
      };
      app.stage.cursor = 'grab';
      dragRect.on('pointerdown', (e) => {
        isDragging = true;
        app.stage.cursor = 'grabbing';
        dragStart = { x: e.global.x, y: e.global.y };
        worldStart = { x: world.position.x, y: world.position.y };
        pointers.set(e.pointerId, { x: e.global.x, y: e.global.y });
        if (pointers.size === 2) {
          const vals = Array.from(pointers.values());
          const dx = vals[1].x - vals[0].x;
          const dy = vals[1].y - vals[0].y;
          pinchStartDist = Math.hypot(dx, dy);
          pinchStartScale = scale;
          isDragging = false;
        }
        inertiaActive = false;
      });
      dragRect.on('pointermove', (e) => {
        pointers.set(e.pointerId, { x: e.global.x, y: e.global.y });
        if (pointers.size === 2 && pinchStartDist) {
          const vals = Array.from(pointers.values());
          const dx = vals[1].x - vals[0].x;
          const dy = vals[1].y - vals[0].y;
          const dist = Math.hypot(dx, dy);
          const mpx = (vals[0].x + vals[1].x) / 2;
          const mpy = (vals[0].y + vals[1].y) / 2;
          const ns = pinchStartScale * (dist / pinchStartDist);
          applyScaleAtPoint(ns, mpx, mpy);
          return;
        }
        if (!isDragging) return;
        const dx = e.global.x - dragStart.x;
        const dy = e.global.y - dragStart.y;
        world.position.set(worldStart.x + dx, worldStart.y + dy);
        setViewOffset({ x: world.position.x, y: world.position.y });
        const now = performance.now();
        const dt = now - lastMoveTime;
        if (dt > 0) {
          vx = (e.global.x - lastMovePos.x) / dt * 16;
          vy = (e.global.y - lastMovePos.y) / dt * 16;
          lastMoveTime = now;
          lastMovePos = { x: e.global.x, y: e.global.y };
        }
      });
      const endDrag = () => {
        isDragging = false;
        app.stage.cursor = 'grab';
        if (!pinchStartDist) inertiaActive = true;
      };
      dragRect.on('pointerup', endDrag);
      dragRect.on('pointerupoutside', endDrag);
      dragRect.on('pointerup', (e) => {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) pinchStartDist = null;
      });
      dragRect.on('pointerupoutside', (e) => {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) pinchStartDist = null;
      });

      app.ticker.add(() => {
        if (inertiaActive) {
          world.position.x += vx;
          world.position.y += vy;
          vx *= 0.95;
          vy *= 0.95;
          setViewOffset({ x: world.position.x, y: world.position.y });
          if (Math.hypot(vx, vy) < 0.1) inertiaActive = false;
        }
      });

      const rect = app.canvas.getBoundingClientRect();
      app.canvas.addEventListener('wheel', (ev) => {
        ev.preventDefault();
        const px = ev.clientX - rect.left;
        const py = ev.clientY - rect.top;
        const factor = ev.deltaY < 0 ? 1.1 : 0.9;
        applyScaleAtPoint(scale * factor, px, py);
      }, { passive: false });

      let resizeHandler = null;
      let wheelHandler = null;
      resizeHandler = () => {
        if (!app || !app.renderer) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        app.renderer.resize(w, h);
        dragRect.clear();
        dragRect.rect(0, 0, w, h).fill({ color: 0x000000, alpha: 0 });
      };
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', resizeHandler);
      }
      wheelHandler = (ev) => {
        ev.preventDefault();
        if (!app || !app.canvas) return;
        const rectNow = app.canvas.getBoundingClientRect();
        const px = ev.clientX - rectNow.left;
        const py = ev.clientY - rectNow.top;
        const factor = ev.deltaY < 0 ? 1.1 : 0.9;
        applyScaleAtPoint(scale * factor, px, py);
      };
      app.canvas.addEventListener('wheel', wheelHandler, { passive: false });

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
        if (typeof window !== 'undefined' && resizeHandler) {
          window.removeEventListener('resize', resizeHandler);
        }
        if (pixiAppRef.current && pixiAppRef.current.canvas && wheelHandler) {
          pixiAppRef.current.canvas.removeEventListener('wheel', wheelHandler);
        }
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
    <div className="fixed inset-0 overflow-hidden">
      <div className="w-full h-full px-0">
        <motion.div 
          className="page-content w-full h-full max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >

          {loading ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div ref={pixiContainerRef} className="w-full h-full overflow-hidden relative">
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
                      style={{ left: (card.nodeX || 0) * (viewScale || 1) + (viewOffset.x || 0) - 180, top: (card.nodeY || 0) * (viewScale || 1) + (viewOffset.y || 0) - 100 }}
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
