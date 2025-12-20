// GraphDataLoader.jsx - 图数据读取模块
import EmptyGraph from '../../data/graphs/EmptyGraph.json';
import { graphApi } from '../../services/apiService';

/**
 * 从后端API获取单个图数据
 * @param {string} graphName - 图的名称/ID
 * @returns {Promise<Object>} 图数据对象
 */
export const loadGraphData = async (graphName) => {
  if (!graphName) {
    console.warn('未提供图名称，返回空图');
    return EmptyGraph;
  }

  try {
    // 从后端API获取图数据
    const response = await graphApi.getById(graphName);
    console.log(`成功从API获取图: ${graphName}`);
    // 返回解析后的JSON数据
    return response.dataContent ? JSON.parse(response.dataContent) : EmptyGraph;
  } catch (error) {
    console.warn(`无法从API加载图数据: ${graphName}，使用空图代替`, error);
    
    // 降级：尝试从本地JSON文件加载
    try {
      const graphModule = await import(`../../data/graphs/${graphName}.json`);
      console.log(`降级：成功从本地读取图: ${graphName}`);
      return graphModule.default;
    } catch (localError) {
      console.warn(`本地也无法加载图数据: ${graphName}，使用空图代替`, localError);
      return EmptyGraph;
    }
  }
};

/**
 * 从后端API批量获取多个图数据
 * @param {string[]} graphNames - 图名称/ID数组
 * @returns {Promise<Object[]>} 图数据对象数组
 */
export const loadMultipleGraphData = async (graphNames) => {
  if (!Array.isArray(graphNames)) {
    console.error('graphNames必须是数组类型');
    return [EmptyGraph];
  }

  try {
    // 批量从API获取图数据
    const promises = graphNames.map(name => loadGraphData(name));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('批量从API加载图数据失败', error);
    return [EmptyGraph];
  }
};

export default {
  loadGraphData,
  loadMultipleGraphData
};