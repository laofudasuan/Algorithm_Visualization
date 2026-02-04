import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { headingComponents, tableComponents, listComponents, imageComponents, boxWithTagComponent, CodeBlock } from '../data/courseware/markdownConfig.jsx';
import 'katex/dist/katex.min.css';

const LogList = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');
  const [allTags, setAllTags] = useState(['All']);

  // Load all MDX files from ../data/logs
  const logFiles = import.meta.glob('../data/logs/*.mdx');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const loadedLogs = [];
        for (const path in logFiles) {
          const mod = await logFiles[path]();
          const meta = mod.frontmatter || mod.attributes || {};
          // Use filename as ID if no other ID exists
          const filename = path.split('/').pop().replace('.mdx', '');
          
          loadedLogs.push({
            id: filename,
            path: path,
            component: mod.default,
            ...meta,
            pinned: meta.pinned === true || meta.pinned === 'true' || meta.pinned === 1 || meta.pinned === '1'
          });
        }

        // Filter out hidden logs
        const visibleLogs = loadedLogs.filter(log => !log.hidden);

        // Collect all unique tags
        const tags = new Set(['All']);
        visibleLogs.forEach(log => {
          if (Array.isArray(log.tags)) {
            log.tags.forEach(tag => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags));

        // Sort pinned first, then by date and time descending
        visibleLogs.sort((a, b) => {
          if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
          const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
          const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
          return dateB - dateA;
        });

        setLogs(visibleLogs);
      } catch (error) {
        console.error('Failed to load logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const openLog = (log) => {
    setSelectedLog(log);
  };

  const closeLog = () => {
    setSelectedLog(null);
  };

  const filteredLogs = useMemo(() => {
    if (selectedTag === 'All') return logs;
    return logs.filter(log => Array.isArray(log.tags) && log.tags.includes(selectedTag));
  }, [logs, selectedTag]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 container mx-auto px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 container mx-auto px-4">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-3xl font-bold mb-8 text-gray-800">个人随笔</h1>
        
        {/* Tags Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <motion.div
              key={log.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all border border-gray-100"
              onClick={() => openLog(log)}
            >
              {log.pinned && (
                <div className="absolute top-0 left-0 px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 border border-amber-200">
                  置顶
                </div>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{log.title || '无标题'}</h2>
                  <p className="text-gray-600 line-clamp-2 mb-3">{log.description || '暂无描述'}</p>
                  {/* Tags in card */}
                  {Array.isArray(log.tags) && log.tags.length > 0 && (
                    <div className="flex gap-2">
                      {log.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div className="font-medium">{log.date}</div>
                  <div>{log.time}</div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              暂无文章
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={closeLog}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedLog.title}</h2>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{selectedLog.date}</span>
                    <span>{selectedLog.time}</span>
                  </div>
                </div>
                <button
                  onClick={closeLog}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <div className="prose prose-lg max-w-none">
                  <Suspense fallback={<div className="text-center py-8">正在渲染内容...</div>}>
                    {React.createElement(selectedLog.component, {
                      components: {
                        ...headingComponents,
                        ...tableComponents,
                        ...listComponents,
                        ...imageComponents,
                        BoxWithTag: boxWithTagComponent,
                        pre: CodeBlock
                      }
                    })}
                  </Suspense>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogList;
