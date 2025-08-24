import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = 5001;

// 中间件
app.use(cors());
app.use(express.json());

// 执行Python代码的端点
app.post('/execute', (req, res) => {
  const { code } = req.body;
  
  // 创建临时Python文件
  const pythonProcess = spawn('python3', ['-c', code]);
  
  let output = '';
  let errorOutput = '';
  
  // 捕获标准输出
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  // 捕获错误输出
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });
  
  // 处理执行结束
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      res.json({ 
        success: true, 
        output: output,
        executionTime: new Date().toISOString()
      });
    } else {
      res.json({ 
        success: false, 
        error: errorOutput || '执行出错',
        executionTime: new Date().toISOString()
      });
    }
  });
  
  // 设置超时处理 (10秒)
  const timeout = setTimeout(() => {
    pythonProcess.kill();
    res.status(408).json({ 
      success: false, 
      error: '代码执行超时 (超过10秒)',
      executionTime: new Date().toISOString()
    });
  }, 10000);
  
  pythonProcess.on('close', () => {
    clearTimeout(timeout);
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'Python执行服务运行中', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Python执行服务运行在端口 ${PORT}`);
});

export default app;