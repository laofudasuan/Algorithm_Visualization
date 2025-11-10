// markdown标题渲染配置
// 此文件用于配置Markdown中不同级别的标题渲染格式
import React from 'react';

// H3标题计数器
let h3Counter = 0;

// H4标题计数器
let h4Counter = 0;

// 表格样式配置
export const tableConfig = {
  className: 'w-full border-collapse my-6',
  th: {
    className: 'bg-gray-100 px-4 py-2 border border-gray-300 text-left font-semibold'
  },
  td: {
    className: 'px-4 py-2 border border-gray-300'
  }
};

// 列表样式配置
export const listConfig = {
  ul: {
    className: 'list-disc pl-6 my-4 space-y-2',
  },
  ol: {
    className: 'list-decimal pl-6 my-4 space-y-2',
  },
  li: {
    className: 'text-gray-800',
  }
};

// 列表组件配置
export const listComponents = {
  ul: (props) => {
    const { className, children } = props;
    const config = listConfig.ul;
    
    return (
      <ul className={`${config.className} ${className || ''}`}>
        {children}
      </ul>
    );
  },
  ol: (props) => {
    const { className, children } = props;
    const config = listConfig.ol;
    
    return (
      <ol className={`${config.className} ${className || ''}`}>
        {children}
      </ol>
    );
  },
  li: (props) => {
    const { className, children } = props;
    const config = listConfig.li;
    
    return (
      <li className={`${config.className} ${className || ''}`}>
        {children}
      </li>
    );
  }
};
export const headingConfig = {
  h1: {
    className: 'text-4xl font-bold text-primary text-center my-6 border-t-2 border-b-2 border-primary pt-4 pb-4',
    center: true
  },
  h2: {
    className: 'text-3xl font-bold my-6 text-secondary relative pl-6',
    center: false
  },
  h3: {
    className: 'text-2xl font-bold my-4 text-black-700 relative',
    center: false
  },
  h4: {
    className: 'text-xl font-semibold my-3 text-black-700',
    center: false
  },
  h5: {
    className: 'text-lg font-bold my-4 text-black bg-blue-100 border-l-4 border-blue-500 p-2 rounded-r-md',
    center: false
  },
  h6: {
    className: 'text-base font-medium my-2 inline-block text-black bg-purple-100 border border-purple-500 px-3 py-1 rounded-xl',
    center: false
  }
};

// 配置React组件替换默认标题渲染
export const headingComponents = {
  h1: (props) => {
    const { className, children } = props;
    const config = headingConfig.h1;
    
    h3Counter = 0;
    h4Counter = 0;
    return (
      <div className={`${config.className} ${className || ''}`}>
        <h1 style={{ textAlign: config.center ? 'center' : 'left' }}>
          {children}
        </h1>
      </div>
    );
  },
  
  h2: (props) => {
    const { className, children } = props;
    const config = headingConfig.h2;
    
    h3Counter = 0;
    h4Counter = 0;
    return (
      <div className={`${config.className} ${className || ''}`}>
        <h2 style={{ textAlign: config.center ? 'center' : 'left' }}>
          {children}
        </h2>
        <div className="h-1 bg-secondary w-20 mt-1 rounded-full"></div>
      </div>
    );
  },
  
  h3: (props) => {
    const { className, children } = props;
    const config = headingConfig.h3;
    
    // 递增H3计数器，重置H4计数器
    h3Counter++;
    h4Counter = 0;
    
    // 获取带圈数字
    const getCircledNumber = (num) => {
      // 使用Unicode带圈数字，支持1-10
      const circledNumbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
      if (num <= 10) {
        return circledNumbers[num - 1];
      }
      return `(${num})`; // 对于10以上的数字使用括号
    };
    
    return (
      <div className={`${config.className} ${className || ''}`}>
        <h3 style={{ textAlign: config.center ? 'center' : 'left' }}>
          <span className="mr-2 text-primary font-bold">{getCircledNumber(h3Counter)}</span>
          {children}
        </h3>
      </div>
    );
  },
  
  h4: (props) => {
    const { className, children } = props;
    const config = headingConfig.h4;
    
    // 递增H4计数器
    h4Counter++;
    
    // 生成H4标题序号 (x.y 格式)
    const h4Number = `${h3Counter}-${h4Counter}`;
    
    return (
      <div className={`${config.className} ${className || ''}`}>
        <h4 style={{ textAlign: config.center ? 'center' : 'left' }}>
          <span className="mr-2 font-mono text-primary font-bold">{h4Number}</span>
          {children}
        </h4>
      </div>
    );
  },
  
  h5: (props) => {
    const { className, children } = props;
    const config = headingConfig.h5;
    
    return (
      <div className={`${config.className} ${className || ''}`}>
        <h5 style={{ textAlign: config.center ? 'center' : 'left' }}>
          {children}
        </h5>
      </div>
    );
  },
  
  h6: (props) => {
    const { className, children } = props;
    const config = headingConfig.h6;
    
    return (
      <div className="my-2">
        <h6 style={{ textAlign: config.center ? 'center' : 'left' }} className={`${config.className} ${className || ''}`}>
          {children}
        </h6>
      </div>
    );
  }
};

// 带标签的框配置
export const boxWithTagConfig = {
  // 框的默认样式 - 使用inline-block使其只包裹文字，增加更多内边距和更大的上下文间距
  box: {
    className: 'inline-block relative border border-gray-300 rounded-lg p-4 my-4 bg-gray-50 shadow-sm', // 增加上下边距到my-4
  },
  // 标签的默认样式 - 调整定位和大小以适应inline-block
  tag: {
    className: 'absolute -top-2 -left-2 bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded',
    defaultText: '提示'
  }
};

// 带标签的框组件配置
export const boxWithTagComponent = (props) => {
  const { className, children, tag } = props;
  const boxConfig = boxWithTagConfig.box;
  const tagConfig = boxWithTagConfig.tag;
  
  // 使用传入的标签文本或默认文本
  const tagText = tag || tagConfig.defaultText;
  
  return (
    <span className={`${boxConfig.className} ${className || ''}`}>
      <span className={tagConfig.className}>{tagText}</span>
      <span className="pt-1">{children}</span>
    </span>
  );
};

// 表格组件配置
export const tableComponents = {
  table: (props) => {
    const { className, children } = props;
    const config = tableConfig;
    
    return (
      <table className={`${config.className} ${className || ''}`}>
        {children}
      </table>
    );
  },
  th: (props) => {
    const { className, children } = props;
    const config = tableConfig.th;
    
    return (
      <th className={`${config.className} ${className || ''}`}>
        {children}
      </th>
    );
  },
  td: (props) => {
    const { className, children } = props;
    const config = tableConfig.td;
    
    return (
      <td className={`${config.className} ${className || ''}`}>
        {children}
      </td>
    );
  }
};

// 折叠内容组件 - 默认隐藏内容，点击按钮后显示，不使用单独的配置对象
export const CollapsibleComponent = (props) => {
  // 使用React内部状态管理展开/折叠
  const [isOpen, setIsOpen] = React.useState(false);
  const { className, children, title = '点击展开' } = props;
  
  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className={`my-4 ${className || ''}`}>
      <div 
        className="text-base font-medium my-2 inline-block text-black bg-purple-100 border border-purple-500 px-3 py-1 rounded-xl cursor-pointer inline-flex items-center hover:bg-purple-200 transition-colors"
        onClick={toggleCollapse}
      >
        <span>{title}</span>
        <span className={`ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>
      {isOpen && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
};

// 确保React被正确使用
if (typeof React === 'undefined') {
  console.error('React is not available. CollapsibleComponent requires React.');
}

// 导出所有组件，方便在Markdown中使用
export default {
  // 标题相关
  headingConfig,
  headingComponents,
  // 列表相关
  listConfig,
  listComponents,
  // 表格相关
  tableConfig,
  tableComponents,
  // 带标签的框
  boxWithTagConfig,
  boxWithTagComponent,
  // 折叠内容组件
  CollapsibleComponent
};