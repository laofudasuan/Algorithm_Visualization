import React, { useEffect, useMemo, useRef, useState } from 'react';
import FunctionPlot from './FunctionPlot';
import { HULL_CASES, HULL_DEFINITION, cross, hullTrace, monotoneHull, pointLocation, polygonArea } from './convexHullModel';
import './ConvexHullVisualization.css';

const BLUE = '#2563eb';
const GREEN = '#059669';
const ORANGE = '#d97706';
const RED = '#dc2626';
const GRAY = '#64748b';
const ids = points => points.map(p => p.id).join(' → ') || '空';
const line = (points, color = BLUE, options = {}) => ({ type: 'points', points, connect: 'line', showPoints: false, stroke: color, strokeWidth: 3, ...options });
const dots = points => ({ type: 'points', points: points.map(p => ({ ...p, label: p.id, labelDx: -7, labelDy: -12 })), connect: 'none', pointRadius: 5, labelFontSize: 16 });

function Panel({ title, children }) {
  return <section className="hull-vis" data-vis="convex-hull" aria-label={title}>
    <header>{title}</header><div className="hull-content">{children}</div>
  </section>;
}

function Plot({ series, domain = [-1, 5], caption }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState(480);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setSize(Math.floor(entry.contentRect.width));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={containerRef} className="hull-plot-container"><FunctionPlot width={size} height={size} padding={size < 320 ? 28 : 38} xDomain={domain} yDomain={domain}
    equalAspect responsiveHeight series={series} caption={caption} ariaLabel="凸包演示，x 轴向右、y 轴向上" className="hull-plot" /></div>;
}

export function ConvexHullDefinitionVisualization() {
  const [mode, setMode] = useState('hull');
  const [bx, setBx] = useState(2);
  const points = HULL_DEFINITION.points.map(p => p.id === 'B' ? { ...p, x: bx } : p);
  const hull = monotoneHull(points);
  const labels = { dots: '只看点集', concave: '有凹陷的包围', loose: '凸但不够紧', hull: '最小凸包' };
  const outlines = {
    ...HULL_DEFINITION.outlines,
    hull,
  };
  const descriptions = {
    dots: '点集不是一条已有顺序的折线。我们要找的是它们共同的最外层凸边界。',
    concave: '虽然包住了全部点，但顶部有凹陷。U、V 都在区域中，线段 UV 却有一部分跑到区域外，所以不是凸集。',
    loose: '这个更大的六边形是凸的，也包含全部点，但还能继续缩小。因此“凸 + 包含”还不够，必须是最小的那个凸集。',
    hull: '初始凸包是一个不规则六边形，六条边都不与坐标轴平行。蓝色边界连同浅蓝内部才是凸包。H 在边上却不是拐角；初始的 B、C、D 在内部。移动 B 试试。',
  };
  const series = mode === 'dots' ? [] : [line(outlines[mode], mode === 'hull' ? BLUE : GRAY, { closed: true, fill: mode === 'hull' ? '#dbeafe' : '#e2e8f0', fillOpacity: 0.55 })];
  if (mode === 'concave') {
    series.push(line(HULL_DEFINITION.witnesses, RED, { strokeDasharray: '6 4' }));
    series.push(dots(HULL_DEFINITION.witnesses.map(p => ({ ...p, color: RED }))));
  }
  series.push(dots(points.map(p => ({ ...p, color: p.id === 'B' ? ORANGE : hull.includes(p) ? BLUE : GRAY }))));
  return <Panel title="看图理解：包住点，还必须凸、还必须最小">
    <div className="hull-buttons">{Object.entries(labels).map(([key, label]) => <button type="button" key={key} aria-pressed={mode === key} onClick={() => setMode(key)}>{label}</button>)}</div>
    <div className="hull-two-columns"><Plot series={series} domain={[-3, 9]} />
      <div className="hull-notes"><p>{descriptions[mode]}</p>
        <label>移动橙色点 B：x = {bx}，y = 2<input aria-label="点 B 的横坐标" type="range" min="-1" max="7" step="0.5" value={bx} onChange={event => setBx(Number(event.target.value))} /></label>
        <button type="button" onClick={() => setBx(2)}>恢复原点集</button>
        <div className="hull-callout"><b>真实凸包（与显示模式无关）</b><span>顶点：{ids(hull)}</span><span>面积：{polygonArea(hull)}</span><span>B 位于：{pointLocation(points.find(p => p.id === 'B'), hull)}</span><span>H 位于：{pointLocation(points.find(p => p.id === 'H'), hull)}</span></div>
        <small>先让 B 在内部移动；移到 x = 5 时，它恰好落在斜边 FG 上；再移到 x = 6，它就会撑出一个新顶点。H 始终在斜边 AE 上，不是拐角。</small>
      </div>
    </div>
  </Panel>;
}

export function ConvexHullTurnVisualization() {
  const [cy, setCy] = useState(2);
  const a = { id: 'A', x: 0, y: 0, color: BLUE };
  const b = { id: 'B', x: 3, y: 0, color: BLUE };
  const c = { id: 'C', x: 2, y: cy, color: ORANGE };
  const value = cross(a, b, c);
  const color = value > 0 ? GREEN : value < 0 ? RED : ORANGE;
  return <Panel title="叉积判定：走 A → B → C 时，向哪边转？">
    <div className="hull-buttons">{[[2, '左转'], [0, '共线'], [-2, '右转']].map(([y, label]) => <button type="button" key={y} aria-pressed={cy === y} onClick={() => setCy(y)}>{label}</button>)}</div>
    <div className="hull-two-columns"><Plot domain={[-3, 5]} series={[
      line([a, b, c], color, { closed: true, fill: color, fillOpacity: 0.1, strokeWidth: 1 }),
      line([a, b], BLUE, { arrowEnd: true }), line([b, c], color, { arrowEnd: true }), dots([a, b, c])
    ]} /><div className="hull-notes">
      <label>C 的纵坐标：{cy}<input type="range" aria-label="点 C 的纵坐标" min="-2" max="3" step="1" value={cy} onChange={event => setCy(Number(event.target.value))} /></label>
      <div className="hull-callout"><span>AB = (3, 0)，AC = (2, {cy})</span><b>cross(A, B, C) = 3 × {cy} − 0 × 2 = {value}</b><strong style={{ color }}>{value > 0 ? '正数：左转（逆时针）' : value < 0 ? '负数：右转（顺时针）' : '零：三点共线'}</strong></div>
      <p>图中坐标按数学习惯：x 向右，y 向上。以下两种扫描都沿着凸包逆时针走，只保留左转；在“只输出拐角”的约定下，右转和共线都要弹栈。</p>
    </div></div>
  </Panel>;
}

export function ConvexHullConstructionVisualization({ method = 'andrew' }) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const example = HULL_CASES[caseIndex];
  const trace = useMemo(() => hullTrace(example.points, method), [example, method]);
  const event = trace.events[step];
  const isUpper = event.chain === '上凸壳';
  const series = [];
  if (showAnswer && event.kind !== 'done') series.push(line(trace.hull, '#94a3b8', { closed: trace.hull.length > 2, strokeDasharray: '5 5', strokeWidth: 1.5 }));
  if (event.kind === 'done') series.push(line(event.hull, BLUE, { closed: event.hull.length > 2, fill: '#dbeafe', fillOpacity: 0.5 }));
  else {
    if (event.fixed.length) series.push(line(event.fixed, BLUE));
    series.push(line(event.stack, isUpper ? GREEN : BLUE));
    if (event.triple) series.push(line(event.triple, event.value > 0 ? GREEN : RED, { strokeDasharray: '5 4', strokeWidth: 3 }));
    else if (event.current && event.stack.length && !event.stack.includes(event.current)) series.push(line([event.stack.at(-1), event.current], ORANGE, { strokeDasharray: '5 4' }));
  }
  series.push(dots(trace.unique.map(p => ({ ...p, color: event.kind === 'done' ? (event.hull.includes(p) ? BLUE : GRAY) : p === event.current ? ORANGE : p === event.removed ? RED : event.stack.includes(p) ? (isUpper ? GREEN : BLUE) : GRAY }))));
  const triple = event.triple;
  return <Panel title={method === 'graham' ? 'Graham：按极角扫描，逐次观察弹栈' : 'Andrew：先下凸壳，再上凸壳，最后拼接'}>
    <label className="hull-select">点集案例<select aria-label="点集案例" value={caseIndex} onChange={e => { setCaseIndex(Number(e.target.value)); setStep(0); }}>{HULL_CASES.map((item, index) => <option value={index} key={item.name}>{item.name}</option>)}</select></label>
    <div className="hull-controls"><button type="button" disabled={step === 0} onClick={() => setStep(0)}>重置</button><button type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>上一步</button><span>{step + 1} / {trace.events.length}</span><button type="button" disabled={step === trace.events.length - 1} onClick={() => setStep(step + 1)}>下一步</button><button type="button" disabled={step === trace.events.length - 1} onClick={() => setStep(trace.events.length - 1)}>看结果</button></div>
    <input type="range" aria-label="构造进度" min="0" max={trace.events.length - 1} value={step} onChange={event => setStep(Number(event.target.value))} />
    <label className="hull-select">跳到具体动作<select aria-label="构造动作" value={step} onChange={e => setStep(Number(e.target.value))}>{trace.events.map((frame, index) => <option key={index} value={index}>{index + 1}. {frame.chain} · {frame.message}</option>)}</select></label>
    <div className="hull-callout" aria-live="polite"><b>{event.chain} · {({ sort: '准备', candidate: '取下一个点', check: '计算叉积', pop: '弹栈', push: '入栈', switch: '切换方向', done: '完成' })[event.kind]}</b><span>{event.message}</span></div>
    <div className="hull-two-columns"><div><Plot series={series} /><label className="hull-check"><input type="checkbox" checked={showAnswer} onChange={e => setShowAnswer(e.target.checked)} />用灰色虚线显示最终凸包作对照</label></div>
      <div className="hull-notes">
        <div><b>当前扫描顺序</b><div className="hull-chips">{event.order.map((p, i) => <span key={p.id} className={p === event.current ? 'hull-active' : ''}>{i + 1}. {p.id}({p.x},{p.y})</span>)}</div></div>
        {method === 'graham' && <p>基点：{trace.pivot.id}。同一射线上的点由近到远，远点到来时替换近点。</p>}
        <div><b>当前栈：栈底 → 栈顶</b><div className="hull-chips">{event.stack.length ? event.stack.map(p => <span className="hull-stack-point" key={p.id}>{p.id}</span>) : <span>空栈</span>}</div></div>
        {event.fixed.length > 0 && <p>已完成的下凸壳：{ids(event.fixed)}</p>}
        {triple && <div className="hull-turn-detail"><b>检查 {ids(triple)}</b>
          <span>A = {triple[0].id}({triple[0].x},{triple[0].y})</span><span>B = {triple[1].id}({triple[1].x},{triple[1].y})（{event.kind === 'pop' ? '刚弹出' : '当前栈顶'}）</span><span>C = {triple[2].id}({triple[2].x},{triple[2].y})（待加入）</span>
          <strong>({triple[1].x} − {triple[0].x}) × ({triple[2].y} − {triple[0].y}) − ({triple[1].y} − {triple[0].y}) × ({triple[2].x} − {triple[0].x}) = {event.value}</strong>
          <span>{event.value > 0 ? '大于 0，保留 B；下一步 C 入栈。' : '小于等于 0，B 不能保留为这条链的拐角。'}</span>
        </div>}
        {event.kind === 'done' && <div className="hull-callout"><b>{event.hull.length <= 2 ? '结果退化为点或线段' : '逆时针顶点序列'}</b><span>{ids(event.hull)}</span><span>面积：{polygonArea(event.hull)}；不重复输出首点。</span></div>}
        <small>蓝色：下凸壳 / Graham 扫描链；绿色：上凸壳或合法转向；橙色：本轮处理点；红色虚线：本次要修正的转向。字母 A、B、C 在公式中表示角色，不一定是同名字母点。</small>
        <small>原始 {example.points.length} 个点 → 去重后 {trace.unique.length} 个；本演示只保留凸包拐角，去掉边上的共线中间点。</small>
      </div>
    </div>
  </Panel>;
}
