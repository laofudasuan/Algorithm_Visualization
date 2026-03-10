import React, { Suspense, useMemo, useState, useEffect } from 'react';
import markdownConfig from '../data/courseware/markdownConfig';

// 使用 import.meta.glob 动态导入所有题目文件
// eager: false 表示懒加载，只有用到时才加载
const problemModules = import.meta.glob('../data/problems/*.mdx');

const Problem = ({ id, ...props }) => {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);

  // 提取markdownConfig中的组件映射
  const mdxComponents = useMemo(() => {
    const { 
      headingComponents, 
      tableComponents, 
      listComponents, 
      boxWithTagComponent,
      CollapsibleComponent,
      CodeBlock,
      Problem: ProblemComponent // 防止循环引用
    } = markdownConfig;

    return {
      ...headingComponents,
      ...tableComponents,
      ...listComponents,
      BoxWithTag: boxWithTagComponent,
      CollapsibleComponent,
      Collapsible: CollapsibleComponent, // 支持别名
      pre: CodeBlock,
      // 注意：这里不应该传入Problem本身，否则会导致递归
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadComponent = async () => {
      // 尝试构建可能的文件路径
      // 1. 直接匹配 id (如 "P3629")
      // 2. 匹配数字开头添加 P 前缀 (如 "3629" -> "P3629")
      
      let targetPath = null;
      const normalizedId = /^\d/.test(id) ? `P${id}` : id;
      
      // 遍历所有可能的路径找到匹配的文件
      for (const path in problemModules) {
        // 获取文件名（不含扩展名）
        const fileName = path.split('/').pop().replace(/\.mdx$/, '');
        
        if (fileName === id || fileName === normalizedId) {
          targetPath = path;
          break;
        }
      }

      if (!targetPath) {
        if (isMounted) setError(`题目 ${id} 未找到`);
        return;
      }

      try {
        const module = await problemModules[targetPath]();
        if (isMounted) {
          setComponent(() => module.default);
          setError(null);
        }
      } catch (err) {
        console.error(`Failed to load problem ${id}:`, err);
        if (isMounted) setError(`加载题目 ${id} 失败`);
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="p-4 my-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (!Component) {
    return <div className="text-gray-500 my-4">加载题目中...</div>;
  }

  return (
    <div className="problem-container my-6" {...props}>
      <Component components={mdxComponents} />
    </div>
  );
};

export default Problem;
