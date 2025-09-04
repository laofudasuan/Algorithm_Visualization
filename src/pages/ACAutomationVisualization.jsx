import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

function ACAutomationVisualization() {
  const [patterns, setPatterns] = useState(['he', 'she', 'his', 'hers']);
  const [text, setText] = useState('ushers');
  const [trie, setTrie] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [steps, setSteps] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Trie节点类
  class TrieNode {
    constructor(char = '') {
      this.char = char;
      this.children = {};
      this.isEndOfWord = false;
      this.fail = null;
      this.output = [];
    }
  }

  // 构建Trie树
  const buildTrie = (patterns) => {
    const root = new TrieNode();
    
    // 插入所有模式串
    for (const pattern of patterns) {
      let node = root;
      for (const char of pattern) {
        if (!node.children[char]) {
          node.children[char] = new TrieNode(char);
        }
        node = node.children[char];
      }
      node.isEndOfWord = true;
      node.output.push(pattern);
    }
    
    return root;
  };

  // 构建失败指针
  const buildFailureLinks = (root) => {
    const queue = [];
    
    // 初始化根节点的子节点的失败指针
    for (const childKey in root.children) {
      const child = root.children[childKey];
      child.fail = root;
      queue.push(child);
    }
    
    // BFS构建失败指针
    while (queue.length > 0) {
      const node = queue.shift();
      
      for (const childKey in node.children) {
        const child = node.children[childKey];
        queue.push(child);
        
        let failNode = node.fail;
        while (failNode !== null && !failNode.children[childKey]) {
          failNode = failNode.fail;
        }
        
        child.fail = failNode ? failNode.children[childKey] : root;
        
        // 合并输出
        if (child.fail.output.length > 0) {
          child.output = [...child.output, ...child.fail.output];
        }
      }
    }
  };

  // 初始化AC自动机
  const initializeAC = () => {
    const patternList = patterns.filter(p => p.trim() !== '');
    if (patternList.length === 0) return;
    
    const root = buildTrie(patternList);
    buildFailureLinks(root);
    setTrie(root);
    
    // 模拟匹配过程
    const algorithmSteps = [];
    let currentNode = root;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // 根据失败指针移动
      while (currentNode !== root && !currentNode.children[char]) {
        currentNode = currentNode.fail;
      }
      
      if (currentNode.children[char]) {
        currentNode = currentNode.children[char];
      }
      
      // 记录步骤
      algorithmSteps.push({
        position: i,
        char: char,
        node: currentNode,
        matches: [...currentNode.output],
        description: `处理字符 '${char}'，当前节点: ${currentNode.char || 'root'}，匹配: [${currentNode.output.join(', ')}]`
      });
    }
    
    setSteps(algorithmSteps);
    setCurrentStep(-1);
  };

  // 执行下一步
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 执行上一步
  const prevStep = () => {
    if (currentStep > -1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 重置
  const reset = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  // 自动播放
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (currentStep >= steps.length - 1) {
        setCurrentStep(-1);
      }
      const interval = setInterval(() => {
        setCurrentStep(prevStep => {
          if (prevStep >= steps.length - 1) {
            setIsPlaying(false);
            clearInterval(interval);
            return prevStep;
          }
          return prevStep + 1;
        });
      }, 1500);
    }
  };

  // 渲染Trie树结构（简化版）
  const renderTrieVisualization = () => {
    if (!trie) return null;
    
    // 简化的Trie树可视化
    const renderNode = (node, level = 0) => {
      const indent = '  '.repeat(level);
      const hasChildren = Object.keys(node.children).length > 0;
      
      return (
        <Box key={Math.random()} sx={{ fontFamily: 'monospace' }}>
          {indent}
          <span style={{ fontWeight: node.isEndOfWord ? 'bold' : 'normal' }}>
            {node.char || 'root'}
          </span>
          {node.fail && ` (fail: ${node.fail.char || 'root'})`}
          {node.output.length > 0 && ` [${node.output.join(', ')}]`}
          {hasChildren && (
            <Box sx={{ ml: 2 }}>
              {Object.values(node.children).map(child => renderNode(child, level + 1))}
            </Box>
          )}
        </Box>
      );
    };
    
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Trie树结构 (包含失败指针)
        </Typography>
        <Paper elevation={3} sx={{ p: 2, fontFamily: 'monospace' }}>
          {renderNode(trie)}
        </Paper>
      </Box>
    );
  };

  // 渲染匹配过程
  const renderMatchingProcess = () => {
    if (steps.length === 0 || currentStep < 0) return null;
    
    const step = steps[currentStep];
    const textChars = text.split('');
    
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          匹配过程
        </Typography>
        <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {textChars.map((char, index) => (
              <Box
                key={index}
                sx={{
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ccc',
                  backgroundColor: index === step.position ? '#2196f3' : 'transparent',
                  fontWeight: 'bold',
                  color: '#000'
                }}
              >
                {char}
              </Box>
            ))}
          </Box>
          <Typography>
            当前处理字符: '{step.char}' (位置 {step.position})
          </Typography>
          <Typography>
            当前节点: {step.node.char || 'root'}
          </Typography>
          <Typography>
            匹配到的模式: [{step.matches.join(', ')}]
          </Typography>
        </Paper>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        AC自动机可视化
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          算法介绍
        </Typography>
        <Typography paragraph>
          AC自动机（Aho-Corasick Algorithm）是一种用于多模式字符串匹配的算法，可以在一个文本串中同时查找多个模式串。
          它是KMP算法的多模式扩展，时间复杂度为O(n + z + m)，其中n是文本长度，z是匹配次数，m是所有模式串的总长度。
        </Typography>
        <Typography paragraph>
          AC自动机的核心思想是构建一个Trie树来存储所有模式串，然后为Trie树中的每个节点添加失败指针（fail pointer）。
          失败指针指向当前节点失配时应该跳转到的节点，使得匹配过程可以持续进行而不需要回溯文本。
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          算法演示
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <TextField
            label="模式串列表 (用逗号分隔)"
            value={patterns.join(', ')}
            onChange={(e) => setPatterns(e.target.value.split(',').map(p => p.trim()))}
            fullWidth
          />
          <TextField
            label="文本串"
            value={text}
            onChange={(e) => setText(e.target.value)}
            fullWidth
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={initializeAC}>
            初始化算法
          </Button>
          <Button variant="contained" onClick={prevStep} disabled={currentStep <= -1 || isPlaying}>
            上一步
          </Button>
          <Button variant="contained" onClick={nextStep} disabled={currentStep >= steps.length - 1 || isPlaying}>
            下一步
          </Button>
          <Button variant="contained" onClick={togglePlay} disabled={steps.length === 0}>
            {isPlaying ? '暂停' : '自动播放'}
          </Button>
          <Button variant="outlined" onClick={reset}>
            重置
          </Button>
        </Box>
        
        {steps.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">
              当前步骤: {currentStep + 1} / {steps.length}
            </Typography>
            {currentStep >= 0 && (
              <Typography>
                {steps[currentStep].description}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {renderTrieVisualization()}
      {renderMatchingProcess()}

      {steps.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            算法步骤
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>步骤</TableCell>
                  <TableCell>位置</TableCell>
                  <TableCell>字符</TableCell>
                  <TableCell>当前节点</TableCell>
                  <TableCell>匹配模式</TableCell>
                  <TableCell>描述</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {steps.map((step, index) => (
                  <TableRow 
                    key={index} 
                    sx={{ 
                      backgroundColor: index === currentStep ? '#e3f2fd' : 'transparent'
                    }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{step.position}</TableCell>
                    <TableCell>{step.char}</TableCell>
                    <TableCell>{step.node.char || 'root'}</TableCell>
                    <TableCell>[{step.matches.join(', ')}]</TableCell>
                    <TableCell>{step.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
}

export default ACAutomationVisualization;