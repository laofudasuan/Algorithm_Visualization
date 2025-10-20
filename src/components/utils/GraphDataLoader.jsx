// GraphDataLoader.jsx - 图数据读取模块
import EmptyGraph from '../../data/graphs/EmptyGraph.json';

/**
 * 从graphs文件夹中读取单个图数据
 * @param {string} graphName - 图的名称（不包含.json后缀）
 * @returns {Promise<Object>} 图数据对象
 */
export const loadGraphData = async (graphName) => {
  if (!graphName) {
    console.warn('未提供图名称，返回空图');
    return EmptyGraph;
  }

  try {
    // 动态导入JSON文件
    const graphModule = await import(`../../data/graphs/${graphName}.json`);
    console.log(`成功读取图: ${graphName}`);
    return graphModule.default;
  } catch (error) {
    console.warn(`无法加载图数据: ${graphName}，使用空图代替`, error);
    return EmptyGraph;
  }
};

/**
 * 从graphs文件夹中批量读取多个图数据
 * @param {string[]} graphNames - 图名称数组（不包含.json后缀）
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