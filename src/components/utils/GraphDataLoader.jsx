// GraphDataLoader.jsx - 图数据读取模块
import EmptyGraph from '../../data/graphs/EmptyGraph.json';
import { graphApi } from '../../services/apiService';

/**
 * 获取单个图数据
 * @param {string} graphName - 图的名称/ID
 * @returns {Promise<Object>} 图数据对象
 */
export const loadGraphData = async (graphName) => {
  if (!graphName) {
    console.warn('未提供图名称，返回空图');
    return EmptyGraph;
  }

  try {
    // 从服务层获取图数据 (现在服务层直接读取本地文件)
    const response = await graphApi.getById(graphName);
    console.log(`成功加载图: ${graphName}`);
    // 返回解析后的JSON数据
    return response.dataContent ? JSON.parse(response.dataContent) : EmptyGraph;
  } catch (error) {
    console.warn(`无法加载图数据: ${graphName}，使用空图代替`, error);
    return EmptyGraph;
  }
};

/**
 * 批量获取多个图数据
 * @param {string[]} graphNames - 图名称/ID数组
 * @returns {Promise<Object[]>} 图数据对象数组
 */
export const loadMultipleGraphData = async (graphNames) => {
  if (!Array.isArray(graphNames)) {
    console.error('graphNames必须是数组类型');
    return [EmptyGraph];
  }

  try {
    const promises = graphNames.map(name => loadGraphData(name));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('批量加载图数据失败', error);
    return [EmptyGraph];
  }
};

export default {
  loadGraphData,
  loadMultipleGraphData
};
