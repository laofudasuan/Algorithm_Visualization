import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { DP_TRANSITIONS } from './mouseHoleDPTable.js';
import useMouseHoleTween from './useMouseHoleTween.js';

export const dpDisplay = x => x === null ? '·' : Number.isFinite(x) ? String(x) : '+∞';
export default function MouseHoleDPMatrix({ table, state, cue, progress, running, paused, speed, inspected, onInspect }) {
  const marker = useId().replace(/:/g, ''), [history, setHistory] = useState(true);
  const viewport = useRef(null), activeCell = useRef(null);
  const selected = inspected ?? cue?.cell, edge = cue?.edge;
  const left = 154, top = 62, dx = 90, dy = 94;
  const width = left + table.columns.length * dx, height = top + (table.rows.length - 1) * dy + 42;
  const x = col => left + table.columns.indexOf(col) * dx + 38, y = row => top + row * dy;
  const kinds = Object.keys(DP_TRANSITIONS).filter(type => table.edges.some(e => e.type === type));
  const target = useMemo(() => ({
    rows: table.rows.map((_, i) => ({ fill: i === selected?.row ? '#fff8cb' : i % 2 ? '#f8fafc' : '#ffffff' })),
    edges: table.edges.map(e => {
      const current = e.id === edge?.id, focused = e.row === selected?.row && e.to === selected?.col;
      const best = state.settled.includes(`${e.row}:${e.to}`) && e.candidate === state.values[e.row][table.columns.indexOf(e.to)];
      return { width: current ? 4 : best ? 2.5 : 1.5, opacity: state.seen.includes(e.id) && (history || focused) ? current ? 1 : focused ? .8 : best ? .5 : .2 : 0 };
    }),
    cells: table.rows.flatMap((_, row) => table.columns.map((col, k) => {
      const value = state.values[row][k], known = value !== null, focus = row === selected?.row && col === selected?.col;
      const source = edge?.row === row + 1 && edge.from === col;
      const outcome = focus && ['compare', 'commit'].includes(cue?.kind) ? cue.outcome : null;
      return { value: dpDisplay(value), fill: outcome === 'accept' ? '#d1fae5' : outcome === 'reject' ? '#ffe4ee' : outcome === 'tie' ? '#fef3c7' : focus ? '#ede9fe' : source ? '#dff3ff' : known ? '#ffffff' : '#f8fafc', stroke: focus ? '#8b5cf6' : source ? '#0ea5e9' : row === table.rows.length - 1 && col === table.target ? '#10b981' : '#cbd5e1', width: focus || source ? 3 : 1, dash: known ? 0 : 4, text: known ? '#1e293b' : '#94a3b8' };
    })),
  }), [table, state, cue, selected, edge, history]);
  const { display, from, amount } = useMouseHoleTween(target, { paused: paused && !inspected, speed });
  useEffect(() => {
    const box = viewport.current, cell = activeCell.current;
    if (!box || !cell) return;
    const reveal = () => {
    const b = box.getBoundingClientRect(), c = cell.getBoundingClientRect();
    if (c.bottom > b.bottom - 25) box.scrollTop += c.bottom - b.bottom + 40;
    if (c.top < b.top + 25) box.scrollTop -= b.top - c.top + 40;
    if (c.right > b.right - 20) box.scrollLeft += c.right - b.right + 40;
    if (c.left < b.left + 20) box.scrollLeft -= b.left - c.left + 40;
    };
    reveal();
    const resize = new ResizeObserver(reveal); resize.observe(box);
    return () => resize.disconnect();
  }, [selected?.row, selected?.col]);
  useEffect(() => { if (!state.seen.length && !state.logical) { viewport.current.scrollTop = 0; viewport.current.scrollLeft = 0; } }, [state]);
  const geometry = e => {
    const sx = x(e.from), sy = y(e.row - 1) + 21, tx = x(e.to), ty = y(e.row) - 21, gap = (ty - sy) * .45;
    const t = progress, z = 1 - t;
    return { d: `M${sx},${sy} C${sx},${sy + gap} ${tx},${ty - gap} ${tx},${ty}`,
      px: z ** 3 * sx + 3 * z * z * t * sx + 3 * z * t * t * tx + t ** 3 * tx,
      py: z ** 3 * sy + 3 * z * z * t * (sy + gap) + 3 * z * t * t * (ty - gap) + t ** 3 * ty };
  };
  const token = edge ? geometry(edge) : null;
  return <div className="mh-dp">
    <div className="mh-dp-legend">{kinds.map(type => <span key={type}><i style={{ borderColor: DP_TRANSITIONS[type].color, borderTopStyle: type === 'skip' ? 'dashed' : 'solid' }} />{DP_TRANSITIONS[type].label}</span>)}</div>
    <div ref={viewport} className="mh-dp-scroll" role="region" aria-label="DP 二维状态矩阵" tabIndex={0}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="行是处理进度，列是状态参数；候选值沿箭头进入目标格">
        <defs>{kinds.map(type => <marker key={type} id={`${marker}-${type}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 Z" fill={DP_TRANSITIONS[type].color} /></marker>)}</defs>
        <text x="12" y="25" className="mh-dp-axis">{table.rowVariable} ↓　{table.columnVariable} →</text>
        {table.columns.map(col => <text key={col} x={x(col)} y="25" textAnchor="middle" className="mh-dp-axis">{table.columnVariable}={col}</text>)}
        {table.rows.map((r, i) => <g key={i}>
          <rect x="4" y={y(i) - 27} width={width - 8} height="54" rx="10" fill={display.rows[i].fill} />
          <text x="12" y={y(i) - 4} className="mh-dp-row">{table.rowVariable}={i} · {r.label}</text>
          {r.note && <text x="12" y={y(i) + 13} className="mh-dp-note">{r.note}</text>}
        </g>)}
        {table.edges.map((e, i) => {
          const visual = display.edges[i];
          return <path key={e.id} d={geometry(e).d} fill="none" stroke={DP_TRANSITIONS[e.type].color} strokeWidth={visual.width} opacity={visual.opacity} style={{ pointerEvents: visual.opacity > 0 ? 'auto' : 'none' }} aria-hidden={visual.opacity === 0} strokeDasharray={DP_TRANSITIONS[e.type].dash} markerEnd={`url(#${marker}-${e.type})`}>{state.seen.includes(e.id) && <title>{DP_TRANSITIONS[e.type].label}：增量 {e.delta}，候选值 {e.candidate}</title>}</path>;
        })}
        {table.rows.flatMap((r, row) => table.columns.map((col, k) => {
          const value = state.values[row][k], known = value !== null, focus = row === selected?.row && col === selected?.col;
          const choose = () => { if (known && !running) onInspect({ row, col }); };
          const outcome = focus && ['compare', 'commit'].includes(cue?.kind) ? cue.outcome : null;
          const index = row * table.columns.length + k, visual = display.cells[index], old = from.cells[index];
          const changed = old.value !== visual.value;
          return <g key={`${row}:${col}`} ref={focus ? activeCell : undefined} role="button" tabIndex={known && !running ? 0 : -1} aria-disabled={!known || running} aria-pressed={focus} aria-label={`${table.symbol}(${row},${col})：${dpDisplay(value)}`} onClick={choose} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } }} className="mh-dp-cell">
            <rect x={x(col) - 32} y={y(row) - 21} width="64" height="42" rx="11" fill={visual.fill} stroke={visual.stroke} strokeWidth={visual.width} strokeDasharray={`${visual.dash} ${visual.dash * .75}`} />
            {changed && <text aria-hidden="true" x={x(col)} y={y(row) + 5 - amount * 9} textAnchor="middle" className="mh-dp-value" fill={visual.text} opacity={1 - amount}>{old.value}</text>}
            <text x={x(col)} y={y(row) + 5 + (changed ? (1 - amount) * 9 : 0)} textAnchor="middle" className="mh-dp-value" fill={visual.text} opacity={changed ? amount : 1}>{visual.value}</text>
            {focus && cue?.kind === 'commit' && <rect x={x(col) - 34 - progress * 6} y={y(row) - 23 - progress * 6} width={68 + progress * 12} height={46 + progress * 12} rx="12" fill="none" stroke={outcome === 'reject' ? '#f43f7c' : '#10b981'} strokeWidth="2" opacity={1 - progress} />}
          </g>;
        }))}
        {edge && cue.kind === 'travel' && <g><rect x={token.px - 24} y={token.py - 14} width="48" height="28" rx="12" fill={DP_TRANSITIONS[edge.type].color} stroke="white" strokeWidth="3" /><text x={token.px} y={token.py + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="white">{edge.candidate}</text></g>}
      </svg>
    </div>
    <label className="mh-dp-toggle"><input type="checkbox" checked={history} onChange={e => setHistory(e.target.checked)} />保留已走过的转移</label>
    <small>· 待计算　+∞ 不可达　紫框：目标　蓝框：来源。暂停后可点格子核对；矩阵内可滚动。</small>
  </div>;
}
