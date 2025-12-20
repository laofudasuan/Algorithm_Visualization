// TreeDataLoader.jsx - 树数据读取模块
import EmptyTree from '../../data/trees/EmptyTree.json';
import { treeApi } from '../../services/apiService';

/**
 * 从后端API获取单个树数据
 * @param {string} treeName - 树的名称/ID
 * @returns {Promise<Object>} 树数据对象
 */
export const loadTreeData = async (treeName) => {
  if (!treeName) {
    console.warn('未提供树名称，返回空树');
    return EmptyTree;
  }

  try {
    // 从后端API获取树数据
    const response = await treeApi.getById(treeName);
    console.log(`成功从API获取树: ${treeName}`);
    // 返回解析后的JSON数据
    return response.dataContent ? JSON.parse(response.dataContent) : EmptyTree;
  } catch (error) {
    console.warn(`无法从API加载树数据: ${treeName}，使用空树代替`, error);
    
    // 降级：尝试从本地JSON文件加载
    try {
      const treeModule = await import(`../../data/trees/${treeName}.json`);
      console.log(`降级：成功从本地读取树: ${treeName}`);
      return treeModule.default;
    } catch (localError) {
      console.warn(`本地也无法加载树数据: ${treeName}，使用空树代替`, localError);
      return EmptyTree;
    }
  }
};

/**
 * 从后端API批量获取多个树数据
 * @param {string[]} treeNames - 树名称/ID数组
 * @returns {Promise<Object[]>} 树数据对象数组
 */
export const loadMultipleTreeData = async (treeNames) => {
  if (!Array.isArray(treeNames)) {
    console.error('treeNames必须是数组类型');
    return [EmptyTree];
  }

  try {
    // 批量从API获取树数据
    const promises = treeNames.map(name => loadTreeData(name));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('批量从API加载树数据失败', error);
    return [EmptyTree];
  }
};

export default {
  loadTreeData,
  loadMultipleTreeData
};