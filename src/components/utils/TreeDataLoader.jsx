// TreeDataLoader.jsx - 树数据读取模块
import EmptyTree from '../../data/trees/EmptyTree.json';
import { treeApi } from '../../services/apiService';

/**
 * 获取单个树数据
 * @param {string} treeName - 树的名称/ID
 * @returns {Promise<Object>} 树数据对象
 */
export const loadTreeData = async (treeName) => {
  if (!treeName) {
    console.warn('未提供树名称，返回空树');
    return EmptyTree;
  }

  try {
    // 从服务层获取树数据 (现在服务层直接读取本地文件)
    const response = await treeApi.getById(treeName);
    console.log(`成功加载树: ${treeName}`);
    // 返回解析后的JSON数据
    return response.dataContent ? JSON.parse(response.dataContent) : EmptyTree;
  } catch (error) {
    console.warn(`无法加载树数据: ${treeName}，使用空树代替`, error);
    return EmptyTree;
  }
};

/**
 * 批量获取多个树数据
 * @param {string[]} treeNames - 树名称/ID数组
 * @returns {Promise<Object[]>} 树数据对象数组
 */
export const loadMultipleTreeData = async (treeNames) => {
  if (!Array.isArray(treeNames)) {
    console.error('treeNames必须是数组类型');
    return [EmptyTree];
  }

  try {
    const promises = treeNames.map(name => loadTreeData(name));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('批量加载树数据失败', error);
    return [EmptyTree];
  }
};

export default {
  loadTreeData,
  loadMultipleTreeData
};
