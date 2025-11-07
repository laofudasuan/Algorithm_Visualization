// markdown标题渲染配置
// 此文件用于配置Markdown中不同级别的标题渲染格式

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
  }
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