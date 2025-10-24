// markdown标题渲染配置
// 此文件用于配置Markdown中不同级别的标题渲染格式

export const headingConfig = {
  h1: {
    className: 'text-4xl font-bold text-primary text-center my-6 border-t-2 border-b-2 border-primary pt-4 pb-4',
    center: true
  },
  h2: {
    className: 'text-3xl font-bold mb-6 text-secondary relative pl-6',
    center: false
  },
  h3: {
    className: 'text-2xl font-bold mb-4 text-gray-700 relative',
    center: false
  },
  h4: {
    className: 'text-xl font-semibold mb-3 text-gray-600',
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
        <div className="h-1 bg-secondary w-20 mt-1 rounded-full"></div>
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
  },
  
  h4: (props) => {
    const { className, children } = props;
    const config = headingConfig.h4;
    
    return (
      <div className={`${config.className} ${className || ''}`}>
        <h4 style={{ textAlign: config.center ? 'center' : 'left' }}>
          {children}
        </h4>
      </div>
    );
  }
};