// TreeDataLoader.jsx - 树数据读取模块
import EmptyTree from '../../data/trees/EmptyTree.json';

/**
 * 从trees文件夹中读取单个树数据
 * @param {string} treeName - 树的名称（不包含.json后缀）
 * @returns {Promise<Object>} 树数据对象
 */
export const loadTreeData = async (treeName) => {
  if (!treeName) {
    console.warn('未提供树名称，返回空树');
    return EmptyTree;
  }

  try {
    // 动态导入JSON文件
    const treeModule = await import(`../../data/trees/${treeName}.json`);
    console.log(`成功读取树: ${treeName}`);
    return treeModule.default;
  } catch (error) {
    console.warn(`无法加载树数据: ${treeName}，使用空树代替`, error);
    return EmptyTree;
  }
};

/**
 * 从trees文件夹中批量读取多个树数据
 * @param {string[]} treeNames - 树名称数组（不包含.json后缀）
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