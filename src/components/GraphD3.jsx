import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function GraphD3({ nodes, edges, directed, highlightIndex, width = 500, height = 400, nodeRadius = 20, arrowSize = 6 }) {
  const ref = useRef();
  const simulationRef = useRef();
  const nodeObjsRef = useRef([]);

  // 只在结构变化时重建 simulation
  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    // 过滤无效点和边，节点结构为 {id, fixed}
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

    // D3 force simulation
    const simulation = d3.forceSimulation(nodeObjs)
      .force('link', d3.forceLink(edgesForD3)
        .id(d => d.id)
        .distance(nodeRadius * 5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(nodeRadius + 8));
    simulationRef.current = simulation;

    // 固定点：设置 fx, fy
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

    // 自环用 path
    const selfLoop = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('path')
      .data(selfEdges)
      .join('path')
      .attr('fill', 'none');

    // 边 label
    const linkLabel = svg.append('g')
      .selectAll('text')
      .data(normalEdges)
      .join('text')
      .attr('font-size', 14)
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .text(d => d.label || '');

    // 自环 label
    const selfLoopLabel = svg.append('g')
      .selectAll('text')
      .data(selfEdges)
      .join('text')
      .attr('font-size', 14)
      .attr('fill', '#333')
      .attr('text-anchor', 'middle')
      .text(d => d.label || '');

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
      .call(d3.drag()
        .filter((event, d) => !d.fixed) // 禁止固定点拖拽
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
          d.fx = null;
          d.fy = null;
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
      .text(d => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', d => limit(d.source.x, nodeRadius + 8, width - nodeRadius - 8))
        .attr('y1', d => limit(d.source.y, nodeRadius + 8, height - nodeRadius - 8))
        .attr('x2', d => limit(d.target.x, nodeRadius + 8, width - nodeRadius - 8))
        .attr('y2', d => limit(d.target.y, nodeRadius + 8, height - nodeRadius - 8));
      selfLoop
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
      node
        .attr('cx', d => limit(d.x, nodeRadius + 8, width - nodeRadius - 8))
        .attr('cy', d => limit(d.y, nodeRadius + 8, height - nodeRadius - 8));
      svg.selectAll('g > text')
        .attr('x', d => limit(d.x, nodeRadius + 8, width - nodeRadius - 8))
        .attr('y', d => limit(d.y, nodeRadius + 8, height - nodeRadius - 8));
      // 边 label 位置
      linkLabel
        .attr('x', d => (limit(d.source.x, nodeRadius + 8, width - nodeRadius - 8) + limit(d.target.x, nodeRadius + 8, width - nodeRadius - 8)) / 2)
        .attr('y', d => (limit(d.source.y, nodeRadius + 8, height - nodeRadius - 8) + limit(d.target.y, nodeRadius + 8, height - nodeRadius - 8)) / 2 - 6);
      // 自环 label 位置
      selfLoopLabel
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
    });

    function limit(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    return () => simulation.stop();
  }, [nodes, edges, directed, width, height, nodeRadius, arrowSize]); // highlightIndex 不触发重建

  // 只在高亮变化时刷新颜色
  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll('circle')
      .attr('fill', (d, i) => highlightIndex === i ? '#ff0' : '#69b3a2');
  }, [highlightIndex]);

  return <svg ref={ref} style={{ border: '1px solid #ccc', margin: '16px 0' }}></svg>;
}
