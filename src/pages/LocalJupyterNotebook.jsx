import { useState, useEffect } from 'react';
import '../styles/modal.css';

function LocalJupyterNotebook() {
  const [jupyterUrl, setJupyterUrl] = useState('http://localhost:8888');
  const [embeddedUrl, setEmbeddedUrl] = useState('');
  const [serverStatus, setServerStatus] = useState('未知');
  const [token, setToken] = useState('');

  // 检查Jupyter服务器状态
  const checkServerStatus = async () => {
    try {
      // 构建检查URL
      let checkUrl = `${jupyterUrl}/api`;
      if (token) {
        checkUrl += `?token=${token}`;
      }
      
      const response = await fetch(checkUrl, {
        method: 'GET',
        mode: 'no-cors' // 使用no-cors模式避免跨域问题
      });
      
      // 由于使用了no-cors模式，我们无法直接读取响应内容
      // 但可以通过其他方式判断连接是否成功
      setServerStatus('在线');
    } catch (error) {
      console.log('服务器状态检查失败:', error);
      setServerStatus('离线');
    }
  };

  // 连接到Jupyter服务器
  const connectToServer = () => {
    // 如果URL包含token，提取出来
    try {
      const url = new URL(jupyterUrl);
      const urlToken = url.searchParams.get('token');
      if (urlToken) {
        setToken(urlToken);
        // 清理URL中的token
        url.searchParams.delete('token');
        setJupyterUrl(url.origin + url.pathname + url.hash);
      }
    } catch (e) {
      console.error('URL解析错误:', e);
    }
    
    setEmbeddedUrl(jupyterUrl);
    checkServerStatus();
  };

  // 组件加载时检查服务器状态
  useEffect(() => {
    // 从URL中提取token（如果有的话）
    try {
      const url = new URL(jupyterUrl, window.location);
      const urlToken = url.searchParams.get('token');
      if (urlToken) {
        setToken(urlToken);
      }
    } catch (e) {
      console.error('URL解析错误:', e);
    }
  }, [jupyterUrl]);

  // 创建新Notebook
  const createNewNotebook = () => {
    let newNotebookUrl = `${jupyterUrl}/tree`;
    if (token) {
      newNotebookUrl += `?token=${token}`;
    }
    setEmbeddedUrl(newNotebookUrl);
  };

  // 打开主界面
  const openMain = () => {
    let mainUrl = jupyterUrl;
    if (token) {
      mainUrl += `?token=${token}`;
    }
    setEmbeddedUrl(mainUrl);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#1976d2', marginBottom: '20px' }}>
        本地Jupyter Notebook
      </h1>
      
      <div style={{
        backgroundColor: '#e3f2fd',
        padding: '15px',
        borderRadius: '4px',
        border: '1px solid #bbdefb',
        marginBottom: '20px'
      }}>
        <h3>服务状态: 
          <span style={{ 
            marginLeft: '10px',
            padding: '4px 8px',
            backgroundColor: serverStatus === '在线' ? '#388e3c' : '#f50057',
            color: 'white',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {serverStatus}
          </span>
        </h3>
        <p>
          本地Jupyter服务器地址: <code>{jupyterUrl}</code>
          <br/>
          {serverStatus === '离线' && (
            <span>
              请确保本地Jupyter Notebook服务器正在运行。启动命令：<code>jupyter notebook --port=8888 --no-browser</code>
            </span>
          )}
        </p>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={jupyterUrl}
            onChange={(e) => setJupyterUrl(e.target.value)}
            placeholder="输入Jupyter服务器地址 (例如: http://localhost:8888)"
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              minWidth: '300px'
            }}
          />
          <button
            onClick={connectToServer}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            连接服务器
          </button>
          <button
            onClick={openMain}
            style={{
              padding: '10px 20px',
              backgroundColor: '#7b1fa2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            打开主界面
          </button>
          <button
            onClick={createNewNotebook}
            style={{
              padding: '10px 20px',
              backgroundColor: '#388e3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            新建Notebook
          </button>
        </div>
        
        <div style={{
          height: '700px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {embeddedUrl ? (
            <iframe
              src={embeddedUrl}
              title="Jupyter Notebook"
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
            />
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              backgroundColor: '#f5f5f5',
              color: '#666'
            }}>
              <div>
                <h3>欢迎使用本地Jupyter Notebook</h3>
                <p>{serverStatus === '在线' ? '请点击按钮打开Jupyter界面' : '请连接到本地Jupyter服务器'}</p>
              </div>
            </div>
          )}
        </div>
        
        <div style={{
          backgroundColor: '#fff3e0',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #ffcc80'
        }}>
          <h3>使用说明：</h3>
          <ul>
            <li>确保本地已安装Jupyter Notebook: <code>pip install jupyter</code></li>
            <li>启动Jupyter服务器: <code>jupyter notebook --port=8888 --no-browser</code></li>
            <li>在上方输入服务器地址并点击"连接服务器"</li>
            <li>连接成功后，可以使用以下功能：
              <ul>
                <li>"打开主界面" - 打开Jupyter主界面</li>
                <li>"新建Notebook" - 创建新的Notebook</li>
              </ul>
            </li>
          </ul>
          <h3>功能特点：</h3>
          <ul>
            <li>完全本地运行，无需网络连接</li>
            <li>支持完整的Jupyter Notebook功能</li>
            <li>可以创建、编辑和运行Notebooks</li>
            <li>支持所有Python库和本地文件访问</li>
            <li>通过iframe嵌入方式无缝集成</li>
          </ul>
          <h3>技术说明：</h3>
          <ul>
            <li>已通过配置禁用Jupyter的认证和跨域限制</li>
            <li>可以直接通过API获取服务器状态</li>
            <li>iframe嵌入方式提供完整的Jupyter体验</li>
          </ul>
          <h3>常见问题及解决方案：</h3>
          <ul>
            <li><strong>Content Security Policy错误</strong>：
              <ul>
                <li>确保Jupyter配置文件(/home/laofu/.jupyter/jupyter_notebook_config.py)包含正确的CSP设置</li>
                <li>配置文件中应包含以下内容：
                  <pre>{`c.NotebookApp.allow_origin = '*'
c.NotebookApp.token = ''
c.NotebookApp.password = ''
c.NotebookApp.ip = '0.0.0.0'
c.NotebookApp.disable_check_xsrf = True
c.NotebookApp.tornado_settings = {'headers': {'Content-Security-Policy': "frame-ancestors 'self' *"}}`}</pre>
                </li>
                <li>修改配置文件后，需要重启Jupyter服务器使配置生效</li>
                <li>确认Jupyter服务器是使用配置文件启动的: <code>jupyter notebook --port=8888 --no-browser --config=/home/laofu/.jupyter/jupyter_notebook_config.py</code></li>
              </ul>
            </li>
            <li><strong>连接被拒绝</strong>：
              <ul>
                <li>检查Jupyter服务器是否正在运行</li>
                <li>确认端口(默认8888)没有被其他程序占用</li>
                <li>检查防火墙设置</li>
              </ul>
            </li>
            <li><strong>'_xsrf' argument missing from POST错误</strong>：
              <ul>
                <li>这是由于Jupyter的XSRF保护机制导致的</li>
                <li>在配置文件中添加<code>c.NotebookApp.disable_check_xsrf = True</code>可以解决此问题</li>
                <li>修改配置后需要重启Jupyter服务器</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LocalJupyterNotebook;