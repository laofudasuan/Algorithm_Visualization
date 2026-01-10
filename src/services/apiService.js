// apiService.js - 纯前端数据服务层 (无后端版本)

// 模拟延迟，使体验更真实
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ----------------------------------------------------------------------
// 图数据API
// ----------------------------------------------------------------------
export const graphApi = {
  getAll: async () => {
    await delay(200);
    // 动态获取 src/data/graphs 下的所有 json 文件
    // import.meta.glob 返回一个对象 { path: importFunc }
    const modules = import.meta.glob('../data/graphs/*.json');
    const results = [];
    
    for (const path in modules) {
        const name = path.split('/').pop().replace('.json', '');
        results.push({
            id: name,
            dataKey: name,
            dataType: 'graphs',
            // 注意：这里我们只返回列表，不加载具体内容，除非 eager=true
            // 为了模拟后端列表接口，只返回元数据
        });
    }
    return results;
  },
  
  getById: async (id) => {
    await delay(100);
    try {
        // 使用动态导入加载特定文件
        // Vite 支持在 import 中使用变量，只要它能被静态分析为相对于当前文件的路径
        const data = await import(`../data/graphs/${id}.json`);
        return {
            id: id,
            dataKey: id,
            dataType: 'graphs',
            dataContent: JSON.stringify(data.default || data)
        };
    } catch (e) {
        console.warn(`Graph not found: ${id}`, e);
        throw new Error(`Graph not found: ${id}`);
    }
  },
  
  createOrUpdate: async (data) => { 
      console.log('Mock save graph (local only):', data); 
      return data; 
  },
  
  delete: async (id) => { 
      console.log('Mock delete graph (local only):', id); 
      return { success: true }; 
  },
};

// ----------------------------------------------------------------------
// 树数据API
// ----------------------------------------------------------------------
export const treeApi = {
  getAll: async () => {
    await delay(200);
    const modules = import.meta.glob('../data/trees/*.json');
    const results = [];
    for (const path in modules) {
        const name = path.split('/').pop().replace('.json', '');
        results.push({ id: name, dataKey: name, dataType: 'trees' });
    }
    return results;
  },
  
  getById: async (id) => {
    await delay(100);
    try {
        const data = await import(`../data/trees/${id}.json`);
        return {
            id: id,
            dataKey: id,
            dataType: 'trees',
            dataContent: JSON.stringify(data.default || data)
        };
    } catch (e) {
        console.warn(`Tree not found: ${id}`, e);
        throw new Error(`Tree not found: ${id}`);
    }
  },
  
  createOrUpdate: async (data) => { 
      console.log('Mock save tree (local only):', data); 
      return data; 
  },
  
  delete: async (id) => { 
      console.log('Mock delete tree (local only):', id); 
      return { success: true }; 
  },
};

// ----------------------------------------------------------------------
// 知识图谱API
// ----------------------------------------------------------------------
export const knowledgeGraphApi = {
  getAll: async () => {
      await delay(200);
      try {
          const { knowledgeGraphData } = await import('../data/knowledge-graph/mockData.js');
          return [{
              id: 'knowledge-graph-main',
              dataKey: 'main',
              dataType: 'knowledge-graph',
              dataContent: JSON.stringify(knowledgeGraphData)
          }];
      } catch (e) {
          console.error('Failed to load knowledge graph data', e);
          return [];
      }
  },
  
  getById: async (id) => {
      try {
          const { knowledgeGraphData } = await import('../data/knowledge-graph/mockData.js');
          return {
              id: id,
              dataKey: id,
              dataType: 'knowledge-graph',
              dataContent: JSON.stringify(knowledgeGraphData)
          };
      } catch (e) {
          throw new Error('Knowledge graph data not found');
      }
  },
  
  createOrUpdate: async (data) => { console.log('Mock save KG:', data); return data; },
  delete: async (id) => { console.log('Mock delete KG:', id); return { success: true }; },
};

// ----------------------------------------------------------------------
// 课件API
// ----------------------------------------------------------------------
export const coursewareApi = {
    getAll: async () => {
        // CoursewareList.jsx 已经实现了自己的加载逻辑
        return []; 
    },
    getById: async (id) => {
         return { id, content: 'Mock content' };
    },
    createOrUpdate: async () => {},
    delete: async () => {}
};
