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

export const imageComponents = {
  img: (props) => {
    const { title, alt, style, ...rest } = props;
    const parseSize = (raw) => {
      if (!raw) return null;
      const trimmed = String(raw).trim();
      const m =
        trimmed.match(/(?:^|\s)(?:w|width)\s*=\s*([0-9.]+)(px|%|rem|vw|vh)?(?:\s|$)/i) ||
        trimmed.match(/^(?:w|width)\s*:\s*([0-9.]+)(px|%|rem|vw|vh)?$/i) ||
        trimmed.match(/^([0-9.]+)(px|%|rem|vw|vh)$/i) ||
        trimmed.match(/^([0-9.]+)$/);
      if (!m) return null;
      const value = m[1];
      const unit = m[2] || (trimmed.includes('%') ? '%' : 'px');
      return `${value}${unit}`;
    };

    const width = parseSize(title);

    return (
      <img
        {...rest}
        alt={alt || ''}
        loading="lazy"
        style={{
          display: 'block',
          margin: '16px auto',
          maxWidth: '100%',
          height: 'auto',
          width: width || undefined,
          ...style,
        }}
      />
    );
  },
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
      return `(${num})`;
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
        data-collapsible-toggle="true"
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

// 简易代码高亮与行号组件（覆盖 MDX 的 <pre> 渲染）
export const CodeBlock = (props) => {
  const child = props.children;
  const className = child?.props?.className || '';
  const language = (className.match(/language-([\w+#-]+)/) || [])[1] || 'text';
  const raw = (child?.props?.children || '').toString();
  const lines = raw.split('\n');
  const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const kw = [
    'auto','break','case','char','const','continue','default','do','double','else','enum','extern','float','for','goto','if','inline','int','long','register','restrict','return','short','signed','sizeof','static','struct','switch','typedef','union','unsigned','void','volatile','while','class','namespace','using','new','delete','public','private','protected','template','typename','this','virtual','operator','friend','bool'
  ];
  const kwRegex = new RegExp(`\\b(${kw.join('|')})\\b`, 'g');
  const numRegex = /(?<![\w])(?:0x[0-9a-fA-F]+|\d+(?:\.\d+)?)(?![\w])/g;
  const strRegex = /"(?:\\.|[^"])*"|'(?:\\.|[^'])*'/g;
  const oneLineCommentRegex = /\/\/.*$/;
  const blockStartRegex = /\/\*/;
  const blockEndRegex = /\*\//;
  let inBlockComment = false;
  
  const renderLine = (line) => {
    let html = escapeHtml(line);
    const placeholders = [];
    const addPlaceholder = (content) => {
      placeholders.push(content);
      return `___PH_${placeholders.length - 1}___`;
    };
    const restorePlaceholders = (text) => {
      return text.replace(/___PH_(\d+)___/g, (match, id) => placeholders[parseInt(id)]);
    };

    // handle block comments across lines
    if (inBlockComment) {
      const endIdx = html.search(blockEndRegex);
      if (endIdx >= 0) {
        const before = html.slice(0, endIdx + 2);
        const after = html.slice(endIdx + 2);
        html = addPlaceholder(`<span class="text-gray-500">${before}</span>`) + after;
        inBlockComment = false;
      } else {
        return `<span class="text-gray-500">${html}</span>`;
      }
    }
    
    // start of block comment
    if (!inBlockComment) {
      const startIdx = html.search(blockStartRegex);
      if (startIdx >= 0) {
        const endIdx = html.search(blockEndRegex);
        if (endIdx >= 0 && endIdx > startIdx) {
          const before = html.slice(0, startIdx);
          const middle = html.slice(startIdx, endIdx + 2);
          const after = html.slice(endIdx + 2);
          html = before + addPlaceholder(`<span class="text-gray-500">${middle}</span>`) + after;
        } else {
          const before = html.slice(0, startIdx);
          const middle = html.slice(startIdx);
          html = before + addPlaceholder(`<span class="text-gray-500">${middle}</span>`);
          inBlockComment = true;
          return restorePlaceholders(html);
        }
      }
    }
    
    // one-line comments
    const olc = html.match(oneLineCommentRegex);
    if (olc) {
      const idx = html.indexOf(olc[0]);
      const prefix = html.slice(0, idx);
      const comment = html.slice(idx);
      html = prefix + addPlaceholder(`<span class="text-gray-500">${comment}</span>`);
    }
    
    // strings
    html = html.replace(strRegex, (m) => addPlaceholder(`<span class="text-green-700">${m}</span>`));
    
    // numbers
    html = html.replace(numRegex, (m) => addPlaceholder(`<span class="text-blue-600">${m}</span>`));
    
    // keywords (only for C/C++)
    if (language.toLowerCase().includes('c')) {
      html = html.replace(kwRegex, (m) => addPlaceholder(`<span class="text-purple-700 font-semibold">${m}</span>`));
    }
    
    return restorePlaceholders(html);
  };
  
  return (
    <div className="my-4 rounded-lg border border-gray-300 overflow-hidden" data-code-block="true">
      <div className="bg-gray-100 text-gray-700 px-3 py-2 text-xs font-mono uppercase tracking-wide">{language}</div>
      <div className="font-mono text-sm">
        <div className="grid grid-cols-[48px_1fr]">
          {lines.map((line, idx) => (
            <React.Fragment key={idx}>
              <div className="px-3 py-0.5 text-right text-gray-400 bg-gray-50 select-none">{idx + 1}</div>
              <div className="px-3 py-0.5 whitespace-pre">
                <span dangerouslySetInnerHTML={{ __html: renderLine(line) }} />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
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
  CollapsibleComponent,
  // 代码块
  CodeBlock
};
