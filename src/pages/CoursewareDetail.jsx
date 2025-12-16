import React, { useState, useEffect, lazy, Suspense, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import 'katex/dist/katex.min.css';
import { headingComponents, tableComponents, listComponents, boxWithTagComponent, CodeBlock } from '../data/courseware/markdownConfig.jsx';
import ReactFlow, { Background, ReactFlowProvider, useNodesState, useEdgesState, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/reactflow-overrides.css';
import CoursewareNode from '../components/flow/CoursewareNode.jsx';
import LabelNode from '../components/flow/LabelNode.jsx';

const CoursewareDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseware, setCourseware] = useState(null);
  
  // Exit animation variants
  const [exitVariants, setExitVariants] = useState({ opacity: 0 });

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('courseware-exit-rect');
      if (saved) {
        const rect = JSON.parse(saved);
        // Calculate the translation needed to move the center of the screen to the center of the rect
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = centerX - window.innerWidth / 2;
        const y = centerY - window.innerHeight / 2;
        
        setExitVariants({
          opacity: 0,
          scale: 0,
          x,
          y,
          transition: { duration: 0.5, ease: "easeInOut" }
        });
      }
    } catch (e) {
      console.error('Failed to parse exit rect', e);
    }
  }, []);

  const [pageComponents, setPageComponents] = useState([]);
  const [pageAttributes, setPageAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [direction, setDirection] = useState('right'); // 'left' or 'right' to control animation direction
  const [showMainPage, setShowMainPage] = useState(true); // 控制显示主页/地图还是子页面
  const [toc, setToc] = useState([]); // 存储目录信息
  const [showToc, setShowToc] = useState(false); // 控制目录显示/隐藏
  const contentRef = useRef(null);
  const tocRef = useRef(null);
  const [mapMode, setMapMode] = useState(false);
  const [mapNodes, setMapNodes, onNodesChange] = useNodesState([]);
  const [mapEdges, setMapEdges, onEdgesChange] = useEdgesState([]);
  const nodeTypes = useMemo(() => ({ courseware: CoursewareNode, label: LabelNode }), []);
  const [pageIdToIndex, setPageIdToIndex] = useState({});

  // 组件加载时隐藏Navbar
  useEffect(() => {
    // 添加类到body或html来隐藏Navbar
    document.body.classList.add('hide-navbar');
    
    // 组件卸载时移除类
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, []);
  
  // 使用Vite的import.meta.glob预加载可能的文件
  const coursewareFiles = import.meta.glob('../data/courseware/*.mdx', { eager: false });
  const coursewareJsonFiles = import.meta.glob('../data/courseware/*.json', { eager: false });
  const pageFiles = import.meta.glob('../data/courseware/pages/**/*.mdx', { eager: false });

  // 提取页面中的标题信息，构建目录
  const extractHeadingsFromPage = (pageIndex) => {
    // 这里会在页面渲染后通过DOM操作提取标题
    setTimeout(() => {
      const pageContent = contentRef.current;
      if (!pageContent) return;

      const headings = pageContent.querySelectorAll('h1, h2, h3, h4');
      const tocItems = [];

      headings.forEach(heading => {
        // 获取标题级别
        const level = parseInt(heading.tagName.charAt(1));
        
        // 获取标题文本
        const text = heading.textContent.trim();
        
        // 为标题生成ID（如果没有的话）
        if (!heading.id) {
          heading.id = `heading-${pageIndex}-${tocItems.length}`;
        }
        
        tocItems.push({
          id: heading.id,
          text,
          level,
          pageIndex
        });
      });

      // 更新目录状态
      setToc(prevToc => {
        const newToc = [...prevToc];
        newToc[pageIndex] = tocItems;
        return newToc;
      });
    }, 1000); // 增加延迟确保页面渲染完成
  };

  // 滚动到指定标题
  const scrollToHeading = (headingId) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // 切换到指定页面
  const goToPage = (pageIndex) => {
    if (pageIndex === currentPage) return;
    
    // 根据目标页面设置动画方向
    setDirection(pageIndex > currentPage ? 'right' : 'left');
    setCurrentPage(pageIndex);
  };

  // 切换目录显示/隐藏
  const toggleToc = () => {
    setShowToc(!showToc);
  };

  const exportToPDF = () => {
    if (!contentRef.current) return;
    const source = contentRef.current;
    const toggles = Array.from(source.querySelectorAll('[data-collapsible-toggle]'));
    toggles.forEach(t => { if (!t.nextElementSibling) t.click(); });
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    const proceed = async () => {
      await wait(200);
      const clone = source.cloneNode(true);
      Array.from(clone.querySelectorAll('[data-code-block="true"]')).forEach(wrapper => {
        try {
          const grid = wrapper.querySelector('.grid');
          if (!grid) return;
          const children = Array.from(grid.children || []);
          const codeLines = [];
          for (let i = 1; i < children.length; i += 2) {
            const codeCell = children[i];
            const txt = (codeCell && codeCell.textContent) ? codeCell.textContent.replace(/\u200b/g, '') : '';
            codeLines.push(txt);
          }
          const pre = clone.ownerDocument.createElement('pre');
          pre.style.whiteSpace = 'pre-wrap';
          pre.style.wordBreak = 'break-word';
          const code = clone.ownerDocument.createElement('code');
          code.textContent = codeLines.join('\n');
          pre.appendChild(code);
          wrapper.replaceWith(pre);
        } catch {}
      });
      Array.from(clone.querySelectorAll('[data-vis]')).forEach(el => el.remove());
      const htmlContent = clone.innerHTML;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const fileTitle = (pageAttributes[currentPage]?.title || courseware?.title || id) + '.pdf';
      const style = `
        @page { size: A4; margin: 16mm; }
        * { animation: none !important; transition: none !important; }
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Noto Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif; color: #111827; }
        h1 { font-size: 24px; margin: 16px 0; }
        h2 { font-size: 20px; margin: 14px 0; }
        h3 { font-size: 18px; margin: 12px 0; }
        h4 { font-size: 16px; margin: 10px 0; }
        p, li { font-size: 14px; line-height: 1.6; }
        pre, code { white-space: pre-wrap; word-break: break-word; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; }
        .katex { font-size: 1em; }
        [data-vis] { display: none !important; }
      `;
      const doc = printWindow.document;
      doc.open();
      doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${fileTitle}</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"><style>${style}</style></head><body>${htmlContent}</body></html>`);
      doc.close();
      printWindow.focus();
      setTimeout(() => {
        try { printWindow.print(); } catch { /* noop */ }
      }, 500);
      printWindow.onafterprint = () => {
        try { printWindow.close(); } catch { /* noop */ }
      };
    };
    proceed();
  };

  const exportAllPagesToPDF = async () => {
    try {
      const parts = [];
      for (let i = 0; i < pageComponents.length; i++) {
        const temp = document.createElement('div');
        temp.style.position = 'fixed';
        temp.style.left = '-99999px';
        temp.style.top = '0';
        document.body.appendChild(temp);
        const root = createRoot(temp);
        const element = React.createElement(pageComponents[i], {
          components: {
            ...headingComponents,
            ...tableComponents,
            ...listComponents,
            BoxWithTag: boxWithTagComponent
          }
        });
        root.render(React.createElement(Suspense, { fallback: null }, element));
        await new Promise(r => setTimeout(r, 600));
        Array.from(temp.querySelectorAll('[data-collapsible-toggle]')).forEach(t => { if (!t.nextElementSibling) t.click(); });
        await new Promise(r => setTimeout(r, 200));
        const clone = temp.cloneNode(true);
        Array.from(clone.querySelectorAll('[data-vis]')).forEach(el => el.remove());
        const title = pageAttributes[i]?.title || `页面 ${i + 1}`;
        parts.push(`<section><h1>${title}</h1>${clone.innerHTML}</section>`);
        root.unmount();
        document.body.removeChild(temp);
        if (i < pageComponents.length - 1) parts.push('<div class="page-break"></div>');
      }
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const fileTitle = (courseware?.title || id) + '.pdf';
      const style = `
        @page { size: A4; margin: 16mm; }
        * { animation: none !important; transition: none !important; }
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Noto Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif; color: #111827; }
        h1 { font-size: 24px; margin: 16px 0; }
        h2 { font-size: 20px; margin: 14px 0; }
        h3 { font-size: 18px; margin: 12px 0; }
        h4 { font-size: 16px; margin: 10px 0; }
        p, li { font-size: 14px; line-height: 1.6; }
        pre, code { white-space: pre-wrap; word-break: break-word; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; }
        .katex { font-size: 1em; }
        [data-vis] { display: none !important; }
        .page-break { page-break-after: always; }
      `;
      const doc = printWindow.document;
      doc.open();
      doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${fileTitle}</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"><style>${style}</style></head><body>${parts.join('')}</body></html>`);
      doc.close();
      printWindow.focus();
      setTimeout(() => { try { printWindow.print(); } catch {} }, 500);
      printWindow.onafterprint = () => { try { printWindow.close(); } catch {} };
    } catch {}
  };

  useEffect(() => {
    const loadCourseware = async () => {
      try {
        const jsonPath = `../data/courseware/${id}.json`;
        if (coursewareJsonFiles[jsonPath]) {
          const jsonModule = await coursewareJsonFiles[jsonPath]();
          const data = jsonModule.default || jsonModule;
          const meta = {
            title: data.title,
            description: data.description,
            author: data.author,
            createdAt: data.createdAt,
            cover: data.cover
          };
          setCourseware({ id, ...meta });
          const components = [];
          const attributes = [];
          const nodes = [];
          const edges = [];
          const pages = Array.isArray(data.pages) ? data.pages : [];
          const idToIndex = {};
          for (let i = 0; i < pages.length; i++) {
            const pageDef = pages[i];
            let matchedPath = null;
            for (const path in pageFiles) {
              if (pageDef.path && path.endsWith(`/${pageDef.path}`)) {
                matchedPath = path;
                break;
              }
            }
            if (matchedPath && pageFiles[matchedPath]) {
              try {
                const dynamicImport = await pageFiles[matchedPath]();
                components.push(dynamicImport.default);
                const attr = dynamicImport.frontmatter || dynamicImport.attributes || {};
                attributes.push(attr);
              } catch {
                components.push(() => <div className="text-center py-12 bg-red-50 rounded-lg">页面加载失败</div>);
                attributes.push({});
              }
            } else {
              components.push(() => <div className="text-center py-12 bg-red-50 rounded-lg">页面不存在</div>);
              attributes.push({});
            }
            const label = attributes[i]?.title || pageDef.title || pageDef.id || `页面 ${i + 1}`;
            const nodeId = String(pageDef.id || `page-${i}`);
            idToIndex[nodeId] = i;
            nodes.push({
              id: nodeId,
              type: 'courseware',
              position: { x: pageDef.x || 0, y: pageDef.y || 0 },
              data: { label, clickable: !!pageDef.path },
              draggable: false,
              style: { borderRadius: 12, border: '2px solid #e6e6e6ff', color: '#000000', fontWeight: 700, padding: '8px 12px' },
              className: 'courseware-node'
            });
          }
          if (data.metaPositions?.title) {
            nodes.push({
              id: 'meta-title',
              type: 'label',
              position: { x: data.metaPositions.title.x || 0, y: data.metaPositions.title.y || 0 },
              data: { label: meta.title || id, kind: 'title' },
              draggable: false,
              className: 'label-node'
            });
          }
          if (data.metaPositions?.description) {
            nodes.push({
              id: 'meta-description',
              type: 'label',
              position: { x: data.metaPositions.description.x || 0, y: data.metaPositions.description.y || 0 },
              data: { label: meta.description || '', kind: 'description' },
              draggable: false,
              className: 'label-node'
            });
          }
          (Array.isArray(data.edges) ? data.edges : []).forEach((e, idx) => {
            const s = String(e.source);
            const t = String(e.target);
            edges.push({
              id: `${s}-${t}-${idx}`,
              source: s,
              target: t,
              sourceHandle: e.sourceSide || null,
              targetHandle: e.targetSide || null,
              label: e.label || undefined,
              style: { stroke: '#A0AEC0', strokeWidth: 3 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#A0AEC0' }
            });
          });
          setPageComponents(components);
          setPageAttributes(attributes);
          setPageCount(components.length);
          setToc(new Array(components.length));
          setMapNodes(nodes);
          setMapEdges(edges);
          setPageIdToIndex(idToIndex);
          setMapMode(true);
        } else if (coursewareFiles[`../data/courseware/${id}.mdx`]) {
          const coursewareModule = await coursewareFiles[`../data/courseware/${id}.mdx`]();
          const meta = coursewareModule.frontmatter || coursewareModule.attributes || {};
          setCourseware({ id, ...meta });
          if (Array.isArray(meta.pages)) {
            const components = [];
            const attributes = [];
            for (const pageFile of meta.pages) {
              let matchedPath = null;
              for (const path in pageFiles) {
                if (path.endsWith(`/${pageFile}`)) {
                  matchedPath = path;
                  break;
                }
              }
              if (matchedPath && pageFiles[matchedPath]) {
                try {
                  const dynamicImport = await pageFiles[matchedPath]();
                  components.push(dynamicImport.default);
                  attributes.push(dynamicImport.frontmatter || dynamicImport.attributes || {});
                } catch {
                  components.push(() => <div className="text-center py-12 bg-red-50 rounded-lg">页面加载失败</div>);
                  attributes.push({});
                }
              } else {
                components.push(() => <div className="text-center py-12 bg-red-50 rounded-lg">页面不存在</div>);
                attributes.push({});
              }
            }
            setPageComponents(components);
            setPageAttributes(attributes);
            setPageCount(components.length);
            setToc(new Array(components.length));
            setMapMode(false);
          } else {
            setPageComponents([coursewareModule.default]);
            setPageAttributes([meta]);
            setPageCount(1);
            setToc(new Array(1));
            setMapMode(false);
          }
        } else {
          setError(new Error('课件文件不存在'));
        }
      } catch (err) {
        console.error('加载课件失败:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadCourseware();
  }, [id]);

  const onNodeClick = (_e, node) => {
    if (node.id === 'meta-title' || node.id === 'meta-description') return;
    if (!node?.data?.clickable) return;
    const idx = pageIdToIndex[String(node.id)];
    if (idx === undefined) return;
    setShowMainPage(false);
    setDirection(idx > currentPage ? 'right' : 'left');
    setCurrentPage(idx);
  };

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }), []);


  // 当页面改变时提取标题
  useEffect(() => {
    if (!showMainPage && pageComponents[currentPage]) {
      // 总是尝试提取当前页面的标题，确保目录是最新的
      extractHeadingsFromPage(currentPage);
    }
  }, [currentPage, showMainPage, pageComponents]);

  // 处理上一页导航
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setDirection('left'); // 设置动画方向为向左
      setCurrentPage(currentPage - 1);
    }
  };

  // 处理下一页导航
  const goToNextPage = () => {
    if (currentPage < pageCount - 1) {
      setDirection('right'); // 设置动画方向为向右
      setCurrentPage(currentPage + 1);
    }
  };

  // 从主页进入子页面
  const goToFirstPage = () => {
    setShowMainPage(false);
    setCurrentPage(0);
  };

  // 从子页面返回主页
  const goBackToMainPage = () => {
    setShowMainPage(true);
  };

  // 处理进度条点击事件，跳转到对应页面
  const handlePageClick = (index) => {
    if (index === currentPage) return;
    
    // 根据目标页面设置动画方向
    setDirection(index > currentPage ? 'right' : 'left');
    setCurrentPage(index);
  };

  // 返回课件列表页面
  const goBackToCoursewareList = () => {
    navigate('/courseware');
  };

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen pt-32 pb-20 container mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </motion.div>
    );
  }

  if (error || !courseware) {
    return (
      <motion.div 
        className="min-h-screen pt-32 pb-20 container mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-bold mb-4">课件不存在或已被删除</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goBackToCoursewareList}
            className="px-8 py-3 bg-primary text-white rounded-md text-lg font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg"
          >
            返回课件列表
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // 主页/地图视图
  if (showMainPage) {
    return (
      <motion.div 
        className="fixed inset-0 overflow-hidden bg-white z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={exitVariants}
      >
      <div className="w-full h-full">
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-50">
          <button 
            onClick={goBackToCoursewareList}
            className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="返回"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={exportAllPagesToPDF}
            className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="导出所有页面 PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-8m0 8l-3-3m3 3l3-3M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
            </svg>
          </button>
        </div>
        {mapMode ? (
          <motion.div
            className="page-content w-full h-full max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            variants={containerVariants}
          >
            <div className="w-full h-full overflow-hidden relative">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={mapNodes}
                  edges={mapEdges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                  minZoom={0.2}
                  maxZoom={4}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background color="#f3f4f6" variant="dots" gap={16} size={1} />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          </motion.div>
        ) : (
          <div className="min-h-full flex flex-col items-center justify-center container mx-auto px-4 pt-32 pb-32">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl font-bold mb-6">{courseware.title || '未命名课件'}</h1>
              <p className="text-xl text-gray-600 mb-8">{courseware.description || '暂无描述'}</p>
              <div className="flex flex-wrap justify-center gap-6 text-lg text-gray-500 mb-16">
                <span>作者: {courseware.author || '未知'}</span>
                <span>创建时间: {courseware.createdAt || '未知'}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {pageAttributes.map((pageAttr, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowMainPage(false); setDirection(index > currentPage ? 'right' : 'left'); setCurrentPage(index); }}
                    className="px-10 py-4 bg-primary text-white rounded-md text-lg font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg"
                  >
                    {pageAttr.title || `页面 ${index + 1}`}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
      </motion.div>
    );
  }

  // 子页面视图
  return (
    <motion.div 
      className="fixed inset-0 bg-white z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={exitVariants}
    >
      {/* 返回按钮 */}
      <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
        <button 
          onClick={goBackToCoursewareList}
          className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="返回"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          onClick={goBackToMainPage}
          className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="返回地图"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={exportToPDF}
          className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="导出 PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-8m0 8l-3-3m3 3l3-3M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
          </svg>
        </button>
      </div>
      
      {/* 目录切换按钮 */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={toggleToc}
          className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          aria-label={showToc ? "隐藏目录" : "显示目录"}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* 目录面板 */}
      {showToc && (
        <motion.div 
          ref={tocRef}
          className="absolute top-20 left-4 bottom-20 w-64 bg-white rounded-lg shadow-lg z-40 overflow-y-auto hidden lg:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-lg text-gray-800">目录</h3>
          </div>
          <div className="p-2">
            {/* 当前页面的标题导航 */}
            {toc[currentPage] && toc[currentPage].length > 0 ? (
              <ul className="space-y-1">
                {toc[currentPage].map((item, index) => (
                  <li key={index} className={item.level === 1 ? 'pl-3' : item.level === 2 ? 'pl-6' : 'pl-9'}>
                    <button
                      onClick={() => scrollToHeading(item.id)}
                      className={`w-full text-left py-2 rounded hover:bg-gray-100 transition-colors text-sm ${item.level === 1 ? 'text-lg font-bold text-gray-900' : item.level === 2 ? 'font-semibold text-gray-800' : item.level === 3 ? 'text-gray-700' : 'text-gray-600'}`}
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm p-3">暂无目录信息</p>
            )}
          </div>
        </motion.div>
      )}
      
      {/* 课件内容容器 - 左右滑动结构 */}
      <div className="w-full h-full overflow-y-auto pt-20 pb-24">
      <div className="w-[80%] mx-auto relative" style={{ minHeight: '500px' }}>
        <div 
          ref={contentRef}
          className="relative overflow-hidden w-full h-full"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              className="w-full h-full"
              initial={{ opacity: 0, x: direction === 'right' ? '100%' : '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {pageComponents[currentPage] && (
                <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 relative overflow-hidden text-lg md:text-xl font-medium">
                  <Suspense fallback={<div className="text-center py-8">正在渲染内容...</div>}>
                    {React.createElement(pageComponents[currentPage], { 
                      components: { 
                        ...headingComponents, 
                        ...tableComponents, 
                        ...listComponents, 
                        BoxWithTag: boxWithTagComponent,
                        pre: CodeBlock 
                      } 
                    })}
                  </Suspense>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      </div>

      {/* 左右分页导航按钮 - 窗口底部两侧 */}
      {pageCount > 0 && (
        <>
          
          {/* 上一页按钮 - 保持在左下角 */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={goToPrevPage}
            disabled={currentPage <= 0}
            className={`absolute bottom-8 left-8 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-300 ${currentPage <= 0 ? 'cursor-not-allowed' : ''}`}
            aria-label="上一页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          
          {/* 下一页按钮 - 保持在右下角 */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={goToNextPage}
            disabled={currentPage >= pageCount - 1}
            className={`absolute bottom-8 right-8 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-300 ${currentPage >= pageCount - 1 ? 'cursor-not-allowed' : ''}`}
            aria-label="下一页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </>
      )}

      {/* 页面下方横向进度条 */}
      {pageCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 bg-gray-200 h-2 z-30"
        >
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((currentPage + 1) / pageCount) * 100}%` }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default CoursewareDetail;
