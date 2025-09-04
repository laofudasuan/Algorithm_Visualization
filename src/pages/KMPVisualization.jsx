import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

function KMPVisualization() {
  const [text, setText] = useState('ABABDABACDABABCABCABCABCABC');
  const [pattern, setPattern] = useState('ABABCABCABC');
  const [lps, setLps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [steps, setSteps] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // 计算LPS数组
  const computeLPS = (pattern) => {
    const lpsArray = new Array(pattern.length).fill(0);
    let len = 0;
    let i = 1;

    while (i < pattern.length) {
      if (pattern[i] === pattern[len]) {
        len++;
        lpsArray[i] = len;
        i++;
      } else {
        if (len !== 0) {
          len = lpsArray[len - 1];
        } else {
          lpsArray[i] = 0;
          i++;
        }
      }
    }

    return lpsArray;
  };

  // 初始化KMP算法步骤
  const initializeKMP = () => {
    const lpsArray = computeLPS(pattern);
    setLps(lpsArray);

    const algorithmSteps = [];
    let textIndex = 0;
    let patternIndex = 0;

    while (textIndex < text.length) {
      if (patternIndex < pattern.length && text[textIndex] === pattern[patternIndex]) {
        algorithmSteps.push({
          textIndex,
          patternIndex,
          action: 'match',
          description: `字符匹配: text[${textIndex}] = pattern[${patternIndex}] = '${text[textIndex]}'`
        });
        textIndex++;
        patternIndex++;
      } else {
        if (patternIndex < pattern.length && patternIndex > 0) {
          algorithmSteps.push({
            textIndex,
            patternIndex,
            action: 'mismatch',
            description: `字符不匹配: text[${textIndex}] = '${text[textIndex]}' != pattern[${patternIndex}] = '${pattern[patternIndex]}'`
          });
          patternIndex = lpsArray[patternIndex - 1];
        } else {
          algorithmSteps.push({
            textIndex,
            patternIndex,
            action: 'mismatch',
            description: `字符不匹配: text[${textIndex}] = '${text[textIndex]}' != pattern[${patternIndex}] = '${pattern[patternIndex]}'`
          });
          textIndex++;
          patternIndex = 0;
        }
      }

      if (patternIndex === pattern.length) {
        algorithmSteps.push({
          textIndex: textIndex - pattern.length,
          patternIndex: pattern.length - 1,
          action: 'found',
          description: `在位置 ${textIndex - pattern.length} 找到匹配`
        });
        patternIndex = lpsArray[patternIndex - 1];
      }
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
      }, 1000);
    }
  };

  // 渲染文本和模式的可视化
  const renderVisualization = () => {
    if (steps.length === 0 || currentStep < 0) return null;

    const step = steps[currentStep];
    const textChars = text.split('');
    const patternChars = pattern.split('');

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          文本串匹配过程
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
                  backgroundColor:
                    index === step.textIndex
                      ? step.action === 'match'
                        ? '#4caf50'
                        : step.action === 'mismatch'
                        ? '#f44336'
                        : '#2196f3'
                      : step.action === 'found' && index >= step.textIndex && index <= step.textIndex + pattern.length - 1
                      ? '#ffeb3b'
                      : 'transparent',
                  fontWeight: 'bold',
                  color: '#000'
                }}
              >
                {char}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {patternChars.map((char, index) => (
              <Box
                key={index}
                sx={{
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ccc',
                  backgroundColor:
                    index === step.patternIndex && step.textIndex - index >= 0
                      ? step.action === 'match'
                        ? '#4caf50'
                        : step.action === 'mismatch'
                        ? '#f44336'
                        : 'transparent'
                      : 'transparent',
                  fontWeight: 'bold',
                  color: '#000',
                  ml: index === 0 ? step.textIndex : 0
                }}
              >
                {char}
              </Box>
            ))}
          </Box>
        </Paper>

        <Typography variant="h6" gutterBottom>
          LPS数组 (最长相等前后缀长度)
        </Typography>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {patternChars.map((char, index) => (
              <Box
                key={index}
                sx={{
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ccc',
                  fontWeight: 'bold'
                }}
              >
                {char}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {lps.map((value, index) => (
              <Box
                key={index}
                sx={{
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ccc',
                  backgroundColor: step.patternIndex === index ? '#2196f3' : 'transparent'
                }}
              >
                {value}
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        KMP算法可视化
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          算法介绍
        </Typography>
        <Typography paragraph>
          KMP算法（Knuth-Morris-Pratt算法）是一种改进的字符串匹配算法，用于在一个文本串中查找一个模式串的所有出现位置。
          与朴素的字符串匹配算法相比，KMP算法的时间复杂度为O(n+m)，其中n是文本串长度，m是模式串长度。
        </Typography>
        <Typography paragraph>
          KMP算法的核心思想是当出现字符不匹配时，可以利用已匹配字符的信息，避免模式串的回溯，从而提高匹配效率。
          通过预处理模式串，构造LPS（最长相等前后缀）数组，可以在匹配失败时确定模式串应该向右滑动的距离。
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          算法演示
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="文本串"
            value={text}
            onChange={(e) => setText(e.target.value)}
            fullWidth
          />
          <TextField
            label="模式串"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            fullWidth
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={initializeKMP}>
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

      {renderVisualization()}

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
                  <TableCell>文本索引</TableCell>
                  <TableCell>模式索引</TableCell>
                  <TableCell>动作</TableCell>
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
                    <TableCell>{step.textIndex}</TableCell>
                    <TableCell>{step.patternIndex}</TableCell>
                    <TableCell>{step.action}</TableCell>
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

export default KMPVisualization;