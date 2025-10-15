// markdown标题渲染配置
// 此文件用于配置Markdown中不同级别的标题渲染格式

export const headingConfig = {
  // 一级标题配置
  h1: {
    className: 'text-3xl font-bold mb-6 text-primary relative pl-6',
    // 是否居中
    center: false
  },
  // 二级标题配置
  h2: {
    className: 'text-2xl font-bold mb-4 text-secondary relative',
    // 是否居中
    center: false
  },
  // 其他标题级别可以在此继续添加
  h3: {
    className: 'text-xl font-semibold mb-3 text-gray-800',
    center: false
  }
};

// 配置React组件替换默认标题渲染
export const headingComponents = {
  h1: (props) => {
    const { className, children } = props;
    const config = headingConfig.h1;
    
    return (
      <div className={`${config.className} ${className || ''}`}>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full"></div>
        <h1 style={{ textAlign: config.center ? 'center' : 'left' }}>
          {children}
        </h1>
      </div>
    );
  },
  
  h2: (props) => {
    const { className, children } = props;
    const config = headingConfig.h2;
    
    return (
      <div className={`${config.className} ${className || ''}`}>
        <h2 style={{ textAlign: config.center ? 'center' : 'left' }}>
          {children}
        </h2>
        <div className="h-1 bg-secondary/30 w-20 mt-1 rounded-full"></div>
      </div>
    );
  },
  
  h3: (props) => {
    const { className, children } = props;
    const config = headingConfig.h3;
    
    return (
      <div className={`${config.className} ${className || ''}`}>
        <h3 style={{ textAlign: config.center ? 'center' : 'left' }}>
          {children}
        </h3>
      </div>
    );
  }
};