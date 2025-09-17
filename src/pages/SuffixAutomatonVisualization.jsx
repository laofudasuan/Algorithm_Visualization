import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { PlayArrow, Pause, SkipNext, SkipPrevious, Refresh } from '@mui/icons-material';
import GraphD3 from '../components/GraphD3';

function SuffixAutomatonVisualization() {
  const [inputString, setInputString] = useState('ababc');
  const [samStates, setSamStates] = useState([]);
  const [samTransitions, setSamTransitions] = useState([]);
  const [samNodes, setSamNodes] = useState([]);
  const [samEdges, setSamEdges] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [showGraph, setShowGraph] = useState(false);
  const [directed, setDirected] = useState(true);
  
  const timerRef = useRef(null);
  
  // SAM构建过程中的状态
  const [samConstructionSteps, setSamConstructionSteps] = useState([]);
  
  // 构建后缀自动机
  const buildSuffixAutomaton = (str) => {
    const steps = [];
    let states = [{id: 0, len: 0, link: -1, cloned: false, trans: {}}]; // 初始状态
    let last = 0;
    
    steps.push({
      action: 'init',
      description: '初始化后缀自动机，创建初始状态',
      states: JSON.parse(JSON.stringify(states)),
      last: last,
      edges: []
    });
    
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      let cur = states.length;
      states.push({id: cur, len: i+1, link: -1, cloned: false, trans: {}});
      
      steps.push({
        action: 'add_state',
        description: `添加新状态 ${cur}，对应字符 '${c}'`,
        states: JSON.parse(JSON.stringify(states)),
        last: last,
        current: cur,
        character: c,
        edges: []
      });
      
      let p = last;
      while (p !== -1 && states[p].trans[c] === undefined) {
        states[p].trans[c] = cur;
        
        steps.push({
          action: 'add_transition',
          description: `添加转移: 状态 ${p} --${c}--> 状态 ${cur}`,
          states: JSON.parse(JSON.stringify(states)),
          last: last,
          current: cur,
          from: p,
          to: cur,
          character: c,
          edges: []
        });
        
        p = states[p].link;
      }
      
      if (p === -1) {
        states[cur].link = 0;
        
        steps.push({
          action: 'set_link',
          description: `设置后缀链接: 状态 ${cur} --> 状态 0`,
          states: JSON.parse(JSON.stringify(states)),
          last: last,
          current: cur,
          linkFrom: cur,
          linkTo: 0,
          edges: []
        });
      } else {
        let q = states[p].trans[c];
        if (states[p].len + 1 === states[q].len) {
          states[cur].link = q;
          
          steps.push({
            action: 'set_link',
            description: `设置后缀链接: 状态 ${cur} --> 状态 ${q}`,
            states: JSON.parse(JSON.stringify(states)),
            last: last,
            current: cur,
            linkFrom: cur,
            linkTo: q,
            edges: []
          });
        } else {
          let clone = states.length;
          states.push({
            id: clone,
            len: states[p].len + 1,
            link: states[q].link,
            cloned: true,
            trans: JSON.parse(JSON.stringify(states[q].trans))
          });
          
          steps.push({
            action: 'clone_state',
            description: `克隆状态: 克隆状态 ${q} 为状态 ${clone}`,
            states: JSON.parse(JSON.stringify(states)),
            last: last,
            current: cur,
            cloned: clone,
            clonedFrom: q,
            edges: []
          });
          
          while (p !== -1 && states[p].trans[c] === q) {
            states[p].trans[c] = clone;
            
            steps.push({
              action: 'redirect_transition',
              description: `重定向转移: 状态 ${p} --${c}--> 状态 ${clone}`,
              states: JSON.parse(JSON.stringify(states)),
              last: last,
              current: cur,
              from: p,
              to: clone,
              character: c,
              edges: []
            });
            
            p = states[p].link;
          }
          
          states[q].link = clone;
          states[cur].link = clone;
          
          steps.push({
            action: 'set_links',
            description: `设置后缀链接: 状态 ${q} --> 状态 ${clone}, 状态 ${cur} --> 状态 ${clone}`,
            states: JSON.parse(JSON.stringify(states)),
            last: last,
            current: cur,
            link1From: q,
            link1To: clone,
            link2From: cur,
            link2To: clone,
            edges: []
          });
        }
      }
      
      last = cur;
      
      steps.push({
        action: 'update_last',
        description: `更新当前最后状态为 ${cur}`,
        states: JSON.parse(JSON.stringify(states)),
        last: last,
        edges: []
      });
    }
    
    // 为每个步骤生成边信息
    const stepsWithEdges = steps.map(step => {
      const edges = [];
      const nodes = step.states.map(state => ({
        id: state.id.toString(),
        label: state.id.toString() + (state.cloned ? "'" : ""),
        color: state.cloned ? '#ff9999' : '#69b3a2',
        fixed: false
      }));
      
      // 添加转移边
      step.states.forEach(state => {
        Object.entries(state.trans).forEach(([char, to]) => {
          edges.push({
            from: state.id.toString(),
            to: to.toString(),
            label: char,
            color: '#000000'
          });
        });
      });
      
      // 添加后缀链接边
      step.states.forEach(state => {
        if (state.link !== -1) {
          edges.push({
            from: state.id.toString(),
            to: state.link.toString(),
            label: '',
            color: '#ff0000'
          });
        }
      });
      
      return {
        ...step,
        edges: edges,
        nodes: nodes
      };
    });
    
    setSamConstructionSteps(stepsWithEdges);
    setSamStates(stepsWithEdges[0]?.states || []);
    setSamNodes(stepsWithEdges[0]?.nodes || []);
    setSamEdges(stepsWithEdges[0]?.edges || []);
    setShowGraph(true);
  };
  
  // 初始化
  useEffect(() => {
    buildSuffixAutomaton(inputString);
  }, [inputString]);
  
  // 更新当前步骤
  useEffect(() => {
    if (samConstructionSteps.length > 0 && currentStep >= 0) {
      const step = samConstructionSteps[currentStep];
      setSamStates(step.states);
      setSamNodes(step.nodes);
      setSamEdges(step.edges);
    } else if (samConstructionSteps.length > 0) {
      setSamStates(samConstructionSteps[0].states);
      setSamNodes(samConstructionSteps[0].nodes);
      setSamEdges(samConstructionSteps[0].edges);
    }
  }, [currentStep, samConstructionSteps]);
  
  // 自动播放
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= samConstructionSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => clearInterval(timerRef.current);
  }, [isPlaying, speed, samConstructionSteps.length]);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleNext = () => {
    if (currentStep < samConstructionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
  };
  
  const handleSpeedChange = (event, newValue) => {
    setSpeed(2000 - newValue);
  };
  
  const getCurrentDescription = () => {
    if (currentStep === -1) {
      return "初始状态: 后缀自动机构造开始";
    }
    return samConstructionSteps[currentStep]?.description || "";
  };

  return (
    <Container maxWidth={false} style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        后缀自动机 (Suffix Automaton) 可视化
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="输入字符串"
          variant="outlined"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Button variant="contained" onClick={() => buildSuffixAutomaton(inputString)}>
          重新构建
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <IconButton onClick={handlePrev} disabled={currentStep <= 0 || isPlaying}>
          <SkipPrevious />
        </IconButton>
        <IconButton onClick={handlePlayPause} disabled={samConstructionSteps.length === 0}>
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        <IconButton onClick={handleNext} disabled={currentStep >= samConstructionSteps.length - 1 || isPlaying}>
          <SkipNext />
        </IconButton>
        <IconButton onClick={handleReset}>
          <Refresh />
        </IconButton>
        
        <Box sx={{ width: 200, ml: 2 }}>
          <Typography variant="caption">播放速度</Typography>
          <Slider
            value={2000 - speed}
            onChange={handleSpeedChange}
            min={100}
            max={1900}
            step={100}
          />
        </Box>
        
        <Box sx={{ ml: 2 }}>
          <Typography variant="body1">
            步骤: {currentStep === -1 ? 0 : currentStep + 1} / {samConstructionSteps.length}
          </Typography>
        </Box>
      </Box>
      
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          当前步骤描述:
        </Typography>
        <Typography variant="body1">
          {getCurrentDescription()}
        </Typography>
      </Paper>
      
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2 }}>
        <Box sx={{ width: '50%', height: '100%' }}>
          {showGraph && (
            <GraphD3
              nodes={samNodes}
              edges={samEdges}
              directed={directed}
              width={600}
              height={500}
              nodeRadius={25}
              arrowSize={6}
              edgeWidth={2}
              chargeStrength={-200}
            />
          )}
        </Box>
        
        <Box sx={{ width: '50%', height: '100%', overflow: 'auto' }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>步骤</TableCell>
                  <TableCell>动作</TableCell>
                  <TableCell>描述</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow key="init" selected={currentStep === -1}>
                  <TableCell>0</TableCell>
                  <TableCell>初始化</TableCell>
                  <TableCell>初始化后缀自动机，创建初始状态</TableCell>
                </TableRow>
                {samConstructionSteps.map((step, index) => (
                  <TableRow 
                    key={index} 
                    selected={currentStep === index}
                    onClick={() => setCurrentStep(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{step.action}</TableCell>
                    <TableCell>{step.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Container>
  );
}

export default SuffixAutomatonVisualization;