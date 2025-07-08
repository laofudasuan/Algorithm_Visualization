import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function GraphD3({ nodes, edges, directed, highlightIndex, width = 500, height = 400, nodeRadius = 20, arrowSize = 6, onNodeClick }) {
  const ref = useRef();
  const simulationRef = useRef();
  const nodeObjsRef = useRef([]);
  const edgesRef = useRef([]);
  const linkRef = useRef(null);
  const selfLoopRef = useRef(null);
  const linkLabelRef = useRef(null);
  const selfLoopLabelRef = useRef(null);

  // 只在结构变化时重建 simulation（不包含点fixed和label状态变化）
  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    // 过滤无效点和边，节点结构为 {id, fixed, label, x,y, idx}
    const nodeObjs = nodes
      .map((n, i) => ({ ...n, idx: i }))
      .filter(n => n.id)
      .map((n, i, arr) => ({
        ...n,
        x: n.x ?? width / 2 + (nodeRadius * 2 + 10) * Math.cos((2 * Math.PI * i) / Math.max(1, arr.length)),
        y: n.y ?? height / 2 + (nodeRadius * 2 + 10) * Math.sin((2 * Math.PI * i) / Math.max(1, arr.length)),
      }));
    nodeObjsRef.current = nodeObjs;
    const nodeIdSet = new Set(nodeObjs.map(n => n.id));
    // 边结构带 label
    const edgesForD3 = edges
      .map(e => ({ source: e.from.trim(), target: e.to.trim(), label: e.label }))
      .filter(e => e.source && e.target && nodeIdSet.has(e.source) && nodeIdSet.has(e.target));
    edgesRef.current = edgesForD3;

    // D3 force simulation
    const simulation = d3.forceSimulation(nodeObjs)
      .force('link', d3.forceLink(edgesForD3)
        .id(d => d.id)
        .distance(nodeRadius * 5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(nodeRadius + 8));
    simulationRef.current = simulation;

    // 初始固定点：设置 fx, fy
    nodeObjs.forEach(n => {
      if (n.fixed) {
        n.fx = n.x;
        n.fy = n.y;
      } else {
        n.fx = null;
        n.fy = null;
      }
    });

    // Draw links（分自环和普通边）
    const normalEdges = edgesForD3.filter(e => e.source !== e.target);
    const selfEdges = edgesForD3.filter(e => e.source === e.target);

    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(normalEdges)
      .join('line');
    linkRef.current = link;

    // 自环用 path
    const selfLoop = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('path')
      .data(selfEdges)
      .join('path')
      .attr('fill', 'none');
    selfLoopRef.current = selfLoop;

    // 边 label
    const linkLabel = svg.append('g')
      .selectAll('text')
      .data(normalEdges)
      .join('text')
      .attr('font-size', 14)
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => d.label || '');
    linkLabelRef.current = linkLabel;

    // 自环 label
    const selfLoopLabel = svg.append('g')
      .selectAll('text')
      .data(selfEdges)
      .join('text')
      .attr('font-size', 14)
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => d.label || '');
    selfLoopLabelRef.current = selfLoopLabel;

    // 移除旧的 defs，防止 marker 冲突
    svg.select('defs').remove();
    let markerId = `arrowhead-${Math.random().toString(36).slice(2, 10)}`;
    // Arrowhead marker for directed graph
    if (directed) {
      svg.append('defs').append('marker')
        .attr('id', markerId)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', nodeRadius + arrowSize + 2)
        .attr('refY', 0)
        .attr('markerWidth', arrowSize)
        .attr('markerHeight', arrowSize)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#999');
    }
    // 每次都刷新 marker-end，使用唯一 id
    const markerUrl = directed ? `url(#${markerId})` : null;
    link.attr('marker-end', markerUrl);
    selfLoop.attr('marker-end', markerUrl);

    // Draw nodes
    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodeObjs)
      .join('circle')
      .attr('r', nodeRadius)
      .attr('fill', (d, i) => highlightIndex === i ? '#ff0' : '#69b3a2')
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .on('click', (event, d) => {
        // 阻止事件冒泡，防止触发文本选择
        event.stopPropagation();
        console.log('Node clicked:', d.id);
        
        // 调用父组件的回调函数来切换固定状态
        if (onNodeClick) {
          onNodeClick(d.id);
        }
      })
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          // 固定节点拖拽结束后保持固定状态，非固定节点释放
          if (!d.fixed) {
            d.fx = null;
            d.fy = null;
          }
        })
      );

    // Draw labels
    svg.append('g')
      .selectAll('text')
      .data(nodeObjs)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', Math.max(12, nodeRadius))
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => d.id);

    // Draw node labels (自定义label)
    svg.append('g')
      .selectAll('text')
      .data(nodeObjs)
      .join('text')
      .attr('text-anchor', 'start')
      .attr('dx', nodeRadius + 8)
      .attr('dy', 5)
      .attr('font-size', Math.max(12, nodeRadius - 2))
      .attr('fill', '#1976d2')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => d.label || '');

    simulation.on('tick', () => {
      // 使用ref中保存的边元素
      if (linkRef.current) {
        linkRef.current
          .attr('x1', d => limit(d.source.x, nodeRadius + 8, width - nodeRadius - 8))
          .attr('y1', d => limit(d.source.y, nodeRadius + 8, height - nodeRadius - 8))
          .attr('x2', d => limit(d.target.x, nodeRadius + 8, width - nodeRadius - 8))
          .attr('y2', d => limit(d.target.y, nodeRadius + 8, height - nodeRadius - 8));
      }
      
      if (selfLoopRef.current) {
        selfLoopRef.current
          .attr('d', d => {
            // 自环圆，右上方
            const n = nodeObjs.find(n => n.id === d.source.id || n.id === d.source);
            if (!n) return '';
            const r = nodeRadius;
            const x = limit(n.x, r + 8, width - r - 8);
            const y = limit(n.y, r + 8, height - r - 8);
            // 圆心在节点右上，半径与节点半径相关
            const loopR = r * 0.9 + 10;
            const cx = x + r * 0.7;
            const cy = y - r * 0.7;
            // 圆的起点（3点钟方向），终点（2点钟方向），箭头指向节点
            // 画一整圆，marker-end 会自动加在终点
            return `M${cx + loopR},${cy} A${loopR},${loopR} 0 1,1 ${cx + loopR - 0.01},${cy}`;
          });
      }
      node
        .attr('cx', d => limit(d.x, nodeRadius + 8, width - nodeRadius - 8))
        .attr('cy', d => limit(d.y, nodeRadius + 8, height - nodeRadius - 8));
      svg.selectAll('g > text')
        .attr('x', d => limit(d.x, nodeRadius + 8, width - nodeRadius - 8))
        .attr('y', d => limit(d.y, nodeRadius + 8, height - nodeRadius - 8));
      
      // 边 label 位置
      if (linkLabelRef.current) {
        linkLabelRef.current
          .attr('x', d => (limit(d.source.x, nodeRadius + 8, width - nodeRadius - 8) + limit(d.target.x, nodeRadius + 8, width - nodeRadius - 8)) / 2)
          .attr('y', d => (limit(d.source.y, nodeRadius + 8, height - nodeRadius - 8) + limit(d.target.y, nodeRadius + 8, height - nodeRadius - 8)) / 2 - 6);
      }
      
      // 自环 label 位置
      if (selfLoopLabelRef.current) {
        selfLoopLabelRef.current
          .attr('x', d => {
            const n = nodeObjs.find(n => n.id === d.source.id || n.id === d.source);
            if (!n) return 0;
            const r = nodeRadius;
            const x = limit(n.x, r + 8, width - r - 8);
            return x + r * 0.7 + (r * 0.9 + 10);
          })
          .attr('y', d => {
            const n = nodeObjs.find(n => n.id === d.source.id || n.id === d.source);
            if (!n) return 0;
            const r = nodeRadius;
            const y = limit(n.y, r + 8, height - r - 8);
            return y - r * 0.7 - (r * 0.9) + 10;
          });
      }
    });

    function limit(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    return () => simulation.stop();
  }, [width, height, nodeRadius, arrowSize, nodes.length, nodes.map(n => n.id).join(',')]); // 只在节点数量或ID变化时重建，移除edges依赖

  // 专门处理节点固定状态和标签变化，不重建整个图形
  useEffect(() => {
    if (simulationRef.current && nodeObjsRef.current.length > 0) {
      const svg = d3.select(ref.current);
      
      // 更新现有节点的固定状态和标签
      nodeObjsRef.current.forEach(nodeObj => {
        const currentNode = nodes.find(n => n.id === nodeObj.id);
        if (currentNode) {
          // 更新固定状态
          if (currentNode.fixed && !nodeObj.fixed) {
            // 从非固定变为固定
            nodeObj.fx = nodeObj.x;
            nodeObj.fy = nodeObj.y;
            nodeObj.fixed = true;
          } else if (!currentNode.fixed && nodeObj.fixed) {
            // 从固定变为非固定
            nodeObj.fx = null;
            nodeObj.fy = null;
            nodeObj.fixed = false;
            // 重启仿真以便节点可以重新移动
            simulationRef.current.alpha(0.3).restart();
          }
          
          // 更新标签
          nodeObj.label = currentNode.label;
        }
      });
      
      // 更新DOM中的标签文本
      svg.selectAll('g:last-child text')
        .data(nodeObjsRef.current)
        .text(d => d.label || '');
      
      // 更新节点边框样式：固定节点用黑色粗边框
      svg.selectAll('circle')
        .attr('stroke', d => d.fixed ? '#000' : '#fff')
        .attr('stroke-width', d => d.fixed ? 3 : 1.5);
    }
  }, [nodes.map(n => `${n.id}:${n.fixed}:${n.label || ''}`).join(',')]); // 在固定状态或标签变化时触发

  // 专门处理边变化，不重建整个图形
  useEffect(() => {
    if (simulationRef.current && nodeObjsRef.current.length > 0) {
      const svg = d3.select(ref.current);
      const nodeIdSet = new Set(nodeObjsRef.current.map(n => n.id));
      
      // 处理边数据
      const newEdgesForD3 = edges
        .map(e => ({ source: e.from.trim(), target: e.to.trim(), label: e.label }))
        .filter(e => e.source && e.target && nodeIdSet.has(e.source) && nodeIdSet.has(e.target));
      
      const normalEdges = newEdgesForD3.filter(e => e.source !== e.target);
      const selfEdges = newEdgesForD3.filter(e => e.source === e.target);
      
      // 更新普通边
      if (linkRef.current) {
        linkRef.current = linkRef.current
          .data(normalEdges, d => `${d.source}-${d.target}`)
          .join('line');
        
        // 重新应用箭头标记
        const markerId = svg.select('defs marker').attr('id');
        if (markerId && directed) {
          linkRef.current.attr('marker-end', `url(#${markerId})`);
        }
      }
      
      // 更新自环
      if (selfLoopRef.current) {
        selfLoopRef.current = selfLoopRef.current
          .data(selfEdges, d => `${d.source}-${d.target}`)
          .join('path')
          .attr('fill', 'none');
        
        // 重新应用箭头标记
        const markerId = svg.select('defs marker').attr('id');
        if (markerId && directed) {
          selfLoopRef.current.attr('marker-end', `url(#${markerId})`);
        }
      }
      
      // 更新边标签
      if (linkLabelRef.current) {
        linkLabelRef.current = linkLabelRef.current
          .data(normalEdges, d => `${d.source}-${d.target}`)
          .join('text')
          .attr('font-size', 14)
          .attr('fill', '#333')
          .attr('text-anchor', 'middle')
          .style('pointer-events', 'none')
          .style('user-select', 'none')
          .text(d => d.label || '');
      }
      
      // 更新自环标签
      if (selfLoopLabelRef.current) {
        selfLoopLabelRef.current = selfLoopLabelRef.current
          .data(selfEdges, d => `${d.source}-${d.target}`)
          .join('text')
          .attr('font-size', 14)
          .attr('fill', '#333')
          .attr('text-anchor', 'middle')
          .style('pointer-events', 'none')
          .style('user-select', 'none')
          .text(d => d.label || '');
      }
      
      // 更新仿真的边数据
      if (simulationRef.current.force('link')) {
        simulationRef.current.force('link').links(newEdgesForD3);
        simulationRef.current.alpha(0.3).restart();
      }
      
      // 保存当前边数据以供后续比较
      edgesRef.current = newEdgesForD3;
    }
  }, [edges.map(e => `${e.from}-${e.to}-${e.label || ''}`).join(','), directed]); // 在边或方向性变化时触发

  // 只在高亮变化时刷新颜色
  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll('circle')
      .attr('fill', (d, i) => highlightIndex === i ? '#ff0' : '#69b3a2');
  }, [highlightIndex]);

  return <svg ref={ref} style={{ border: '1px solid #ccc', margin: '16px 0', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}></svg>;
}
