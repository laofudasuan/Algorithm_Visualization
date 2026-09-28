import React, { useMemo, useState } from 'react';
import { EXAMPLES, applySum, band, formatTag, prepareExample } from './equivalenceDivideModel';
import './EquivalenceDivideVisualization.css';

const COLORS = ['#dbeafe', '#d1fae5', '#fef3c7'];
const interval = p => `[${p.lo}, ${p.hi})`;
const membersText = members => members.length ? members.map(id => `P${id}`).join('、') : '空类';
const cellLabel = (id, node) => `C${Math.floor(id / node.y.length)},${id % node.y.length}`;

function CasePicker({ index, onChange }) {
  return <label className="eq-control">选择案例
    <select value={index} onChange={event => onChange(Number(event.target.value))}>
      {EXAMPLES.map((example, i) => <option key={example.id} value={i}>{example.name}</option>)}
    </select>
  </label>;
}

function Shell({ title, subtitle, children }) {
  return <section data-vis className="eq-vis" aria-label={title}>
    <header className="eq-header"><strong>{title}</strong><span>{subtitle}</span></header>
    <div className="eq-content">{children}</div>
  </section>;
}

function Stepper({ value, max, onChange, label }) {
  return <div className="eq-stepper">
    <button type="button" disabled={value === 0} onClick={() => onChange(value - 1)}>上一步</button>
    <label>{label}<input aria-label={label} type="range" min="0" max={max} value={value}
      onChange={event => onChange(Number(event.target.value))} /></label>
    <button type="button" disabled={value === max} onClick={() => onChange(value + 1)}>下一步</button>
  </div>;
}

function AxisStrip({ pieces, n, label, output = false, selected = -1, onSelect }) {
  const order = pieces.map((piece, id) => ({ ...piece, id }))
    .sort((a, b) => (a.lo + (output ? a.shift : 0)) - (b.lo + (output ? b.shift : 0)));
  return <div className="eq-axis"><span>{label}</span><div className="eq-strip">
    {order.map(piece => <button key={piece.id} type="button" disabled={!onSelect}
      aria-label={`区间 ${piece.id}：${interval(piece)}`}
      aria-pressed={selected === piece.id}
      onClick={() => onSelect?.(piece.id)}
      style={{ flex: piece.hi - piece.lo, background: COLORS[piece.id % 3] }}>
      {piece.id}
    </button>)}
  </div><div className="eq-axis-ends"><span>0</span><span>{n}</span></div></div>;
}

function PointPlot({ example, turn, phase, selectedPoint, onSelect }) {
  const op = example.operations[turn.index];
  const points = phase === 0 ? turn.before : phase === 1 ? turn.updated : turn.after;
  const unit = 320 / example.n;
  const coord = v => 30 + (v + 0.5) * unit;
  const edge = v => 30 + v * unit;
  const cutsX = [0, ...op.x, example.n];
  const cutsY = [0, ...op.y, example.n];
  return <svg className="eq-plot" viewBox="0 0 380 375" role="img"
    aria-label={`第 ${turn.index} 次操作的点阵。坐标原点在左上方，x 向右，y 向下；点击下方点编号查看精确值。`}>
    <defs><marker id={`eq-arrow-${example.id}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5" fill="#7c3aed" /></marker></defs>
    {phase !== 2 && [0, 1, 2].flatMap(X => [0, 1, 2].map(Y => <rect key={`${X}${Y}`}
      x={edge(cutsX[X])} y={edge(cutsY[Y])} width={(cutsX[X + 1] - cutsX[X]) * unit}
      height={(cutsY[Y + 1] - cutsY[Y]) * unit} fill={COLORS[(X + Y) % 3]} opacity="0.6" />))}
    {Array.from({ length: example.n + 1 }, (_, i) => <g key={i}>
      <path d={`M${edge(i)},30 V350 M30,${edge(i)} H350`} stroke="#cbd5e1" strokeWidth="0.6" />
      {i < example.n && <><text x={coord(i)} y="21" textAnchor="middle" fontSize="18" fill="#64748b">{i}</text>
        <text x="20" y={coord(i) + 6} textAnchor="end" fontSize="18" fill="#64748b">{i}</text></>}
    </g>)}
    {phase !== 2 && <>{op.x.map(cut => <path key={`x${cut}`} d={`M${edge(cut)},30 V350`} stroke="#475569" strokeWidth="2" strokeDasharray="5 3" />)}
      {op.y.map(cut => <path key={`y${cut}`} d={`M30,${edge(cut)} H350`} stroke="#475569" strokeWidth="2" strokeDasharray="5 3" />)}</>}
    {phase === 2 && (() => {
      const before = turn.before[selectedPoint];
      const after = turn.after[selectedPoint];
      return <g><circle cx={coord(before.x)} cy={coord(before.y)} r="12" fill="none" stroke="#7c3aed" strokeDasharray="3 2" />
        <path d={`M${coord(before.x)},${coord(before.y)} L${coord(after.x)},${coord(after.y)}`} stroke="#7c3aed" strokeWidth="2" markerEnd={`url(#eq-arrow-${example.id})`} /></g>;
    })()}
    {points.map(point => <g key={point.id} onClick={() => onSelect(point.id)} className="eq-svg-point">
      <circle cx={coord(point.x)} cy={coord(point.y)} r={Math.min(15, unit * 0.46)}
        fill={selectedPoint === point.id ? '#7c3aed' : '#2563eb'} stroke="white" strokeWidth="1.5" />
      <text x={coord(point.x)} y={coord(point.y) + 6} textAnchor="middle" fontSize="18" fontWeight="600" fill="white">{point.id}</text>
    </g>)}
    <text x="355" y="21" fontSize="15" fill="#475569">x</text><text x="12" y="368" fontSize="15" fill="#475569">y</text>
  </svg>;
}

export function TB5OperationVisualization() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [selectedPoint, setSelectedPoint] = useState(2);
  const example = EXAMPLES[caseIndex];
  const data = useMemo(() => prepareExample(example), [example]);
  const time = Math.floor(step / 3);
  const phase = step % 3;
  const turn = data.turns[time];
  const currentPoints = phase === 0 ? turn.before : phase === 1 ? turn.updated : turn.after;
  const op = example.operations[time];
  const point = turn.before[selectedPoint];
  const X = band(point.x, op.x);
  const Y = band(point.y, op.y);
  return <Shell title="演示一 · 看清一次操作" subtitle="先查询 → 再修改 → 最后同时移动">
    <CasePicker index={caseIndex} onChange={index => { setCaseIndex(index); setStep(0); setSelectedPoint(0); }} />
    <p className="eq-note">{example.focus}</p>
    <Stepper value={step} max={example.operations.length * 3 - 1} onChange={setStep} label={`第 ${time} 次操作 · ${['查询', '修改', '移动'][phase]}`} />
    <div className="eq-phases">{['① 查询旧权值', '② 修改权值', '③ 同时移动'].map((label, i) => <button type="button" key={label}
      aria-pressed={phase === i} onClick={() => setStep(time * 3 + i)}>{label}</button>)}</div>
    <div className="eq-two-column">
      <div><PointPlot example={example} turn={{ ...turn, index: time }} phase={phase} selectedPoint={selectedPoint} onSelect={setSelectedPoint} />
        <p className="eq-caption">圆内是点编号；原点在左上方。<br />下方显示“点编号 · 当前权值”，点击追踪。</p>
        <div className="eq-point-buttons">{currentPoints.map(({ id, value }) => <button type="button" key={id} aria-label={`查看 P${id}`} aria-pressed={selectedPoint === id} onClick={() => setSelectedPoint(id)}>P{id} · <b>{value}</b></button>)}</div>
      </div>
      <div>
        <div className="eq-note">切分线：x = {op.x.join('、')}；y = {op.y.join('、')}。九格按 x 从左到右、y 从上到下排列。</div>
        <div className="eq-nine">{[0, 1, 2].flatMap(y => [0, 1, 2].map(x => {
          const cell = 3 * x + y;
          return <div key={cell} className={x === X && y === Y ? 'is-selected' : ''}>
            <b>({x},{y})</b><span>{turn.counts[cell]} 点 · 查询 {turn.answers[cell]}</span>
            <span>{formatTag(op.tags[cell])}</span>
            <span>修改后 {applySum(op.tags[cell], turn.answers[cell], turn.counts[cell])}</span>
          </div>;
        }))}</div>
        <div className="eq-focus"><b>P{selectedPoint} 的完整去向</b>
          <strong>当前帧：权值 {currentPoints[selectedPoint].value}，坐标 ({currentPoints[selectedPoint].x},{currentPoints[selectedPoint].y})</strong>
          <div>格子 ({X},{Y})：权值 {point.value} → {turn.updated[selectedPoint].value}</div>
          <div>坐标 ({point.x},{point.y}) → ({turn.after[selectedPoint].x},{turn.after[selectedPoint].y})</div>
          <small>右侧九格始终展示本次移动前的分组；移动阶段的紫色箭头只追踪所选点。</small>
        </div>
      </div>
    </div>
    <div className="eq-two-column">{['x', 'y'].map(axis => <div key={axis} className="eq-axis-example">
      <b>{axis} 轴：A B C → A C B</b>
      <AxisStrip label="移动前（0=A，1=B，2=C）" pieces={data.nodes.find(node => node.l === time && node.r === time)[axis]} n={example.n} />
      <AxisStrip label="移动后（保留原区间编号）" pieces={data.nodes.find(node => node.l === time && node.r === time)[axis]} n={example.n} output />
    </div>)}</div>
  </Shell>;
}

export function TB5GeometryVisualization() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [axis, setAxis] = useState('x');
  const [nodeId, setNodeId] = useState('0-1');
  const [selected, setSelected] = useState(0);
  const example = EXAMPLES[caseIndex];
  const data = useMemo(() => prepareExample(example), [example]);
  const node = data.nodes.find(item => item.id === nodeId) || data.root;
  const pieces = node[axis];
  const piece = pieces[Math.min(selected, pieces.length - 1)];
  return <Shell title="演示二 · 移动以后，边界在哪里？" subtitle="把左段的输出与右段的输入对齐，再拉回父段坐标">
    <div className="eq-controls">
      <CasePicker index={caseIndex} onChange={index => { setCaseIndex(index); setNodeId(`0-${EXAMPLES[index].operations.length - 1}`); setSelected(0); }} />
      <label className="eq-control">观察方向<select value={axis} onChange={event => { setAxis(event.target.value); setSelected(0); }}><option value="x">x 轴</option><option value="y">y 轴</option></select></label>
      <label className="eq-control">时间区间<select value={node.id} onChange={event => { setNodeId(event.target.value); setSelected(0); }}>{data.nodes.map(item => <option key={item.id} value={item.id}>[{item.l},{item.r}]</option>)}</select></label>
    </div>
    {node.left ? <>
      <p className="eq-note">父段 [{node.l},{node.r}] = 左段 [{node.left.l},{node.left.r}] 后接右段 [{node.right.l},{node.right.r}]。下面两条色带都位于“左段结束、右段开始”的同一坐标系。</p>
      <div className="eq-axis-stack">
        <AxisStrip label="左段各区间的输出位置" pieces={node.left[axis]} n={example.n} output selected={piece.left} />
        <AxisStrip label="右段各区间的输入位置" pieces={node.right[axis]} n={example.n} selected={piece.right} />
      </div>
      <div className="eq-focus"><b>选中父区间 {interval(piece)}</b>
        <div className="eq-mapping"><span>{interval(piece)}<small>父段输入</small></span><span>→</span>
          <span>[{piece.middleLo}, {piece.middleHi})<small>左段输出 ∩ 右段输入</small></span><span>→</span>
          <span>[{piece.lo + piece.shift}, {piece.hi + piece.shift})<small>父段输出</small></span></div>
        <div>先属于左区间 {piece.left}，再属于右区间 {piece.right}；总位移 {piece.shift >= 0 ? '+' : ''}{piece.shift}。</div>
      </div>
    </> : <p className="eq-note">叶子只有一次操作，直接按两条切分线得到 3 个区间及各自平移量。</p>}
    <AxisStrip label={`父段输入的细分：共 ${pieces.length} 个连续区间（点击色带或下方行）`} pieces={pieces} n={example.n} selected={selected} onSelect={setSelected} />
    <div className="eq-table-scroll"><table><thead><tr><th>编号</th><th>输入区间</th><th>输出区间</th><th>位移</th>{node.left && <><th>左区间</th><th>右区间</th></>}</tr></thead>
      <tbody>{pieces.map((item, i) => <tr key={i} className={i === selected ? 'is-selected' : ''}>
        <td><button type="button" aria-label={`选择区间 ${i}`} aria-pressed={i === selected} onClick={() => setSelected(i)}>{i}</button></td>
        <td>{interval(item)}</td><td>[{item.lo + item.shift}, {item.hi + item.shift})</td><td>{item.shift}</td>
        {node.left && <><td>{item.left}</td><td>{item.right}</td></>}
      </tr>)}</tbody></table></div>
    <p className="eq-caption">编号属于各自的时间结点，不同层的同号区间不代表同一组。保留“经历过哪些区间”的边界，不能只凭最终位移相等就合并。</p>
  </Shell>;
}

function TimeTree({ node, active, onSelect }) {
  return <div className="eq-tree-node"><button type="button" aria-pressed={active === node.id} onClick={() => onSelect(node.id)}>[{node.l},{node.r}]</button>
    {node.left && <div className="eq-tree-children"><TimeTree node={node.left} active={active} onSelect={onSelect} /><TimeTree node={node.right} active={active} onSelect={onSelect} /></div>}
  </div>;
}

function ClassFlow({ event, node, routeNode, cell, showEmpty }) {
  if (event.kind !== 'merge' && event.kind !== 'push') return null;
  const merging = event.kind === 'merge';
  const coarseId = merging ? cell.id : event.mapping[cell.id];
  const fineNode = merging ? routeNode : node;
  const coarseNode = merging ? node : routeNode;
  const coarseCell = merging ? cell : event.sourceCells[coarseId];
  const fineCells = (merging ? event.sourceCells : event.cells)
    .map((item, id) => ({ ...item, id }))
    .filter(item => event.mapping[item.id] === coarseId && (showEmpty || item.count));
  const fine = <div className="eq-flow-stack"><b>{merging ? '父层细类 · 合并前' : '父层细类 · 下传后'}</b>
    {fineCells.map(item => <div className="eq-flow-cell" key={item.id}>
      <b>{cellLabel(item.id, fineNode)}</b><span>{membersText(item.members)}</span>
      <span>和：{!merging && `${event.before[item.id].sum} → `}{item.sum}</span>
    </div>)}
  </div>;
  const coarse = <div className="eq-flow-stack"><b>子层粗类 {cellLabel(coarseId, coarseNode)}</b>
    <div className="eq-flow-cell"><span>{membersText(coarseCell.members)}</span>
      <span>和：{coarseCell.sum}</span><strong>{merging ? '标记重新置为单位操作' : `向每个细类下传：${formatTag(coarseCell.tag)}`}</strong>
    </div>
  </div>;
  return <div className="eq-flow">{merging ? fine : coarse}<span className="eq-flow-arrow">→<small>{merging ? '总和相加' : '传标记，不传总和'}</small></span>{merging ? coarse : fine}</div>;
}

export function TB5DivideVisualization() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(0);
  const [showEmpty, setShowEmpty] = useState(false);
  const example = EXAMPLES[caseIndex];
  const data = useMemo(() => prepareExample(example), [example]);
  const event = data.events[step];
  const node = data.nodes.find(item => item.id === event.nodeId);
  const visible = event.cells.map((cell, id) => ({ ...cell, id })).filter(cell => showEmpty || cell.count);
  const cell = visible.find(item => item.id === selected) || visible[0];
  const jump = value => { setStep(value); setSelected(0); };
  const routeNode = data.nodes.find(item => item.id === (event.childId || event.parentId));
  return <Shell title="演示三 · 等价类分治完整执行" subtitle="粗类算一次，修改下传到细类；先左后右，数据不回滚">
    <CasePicker index={caseIndex} onChange={index => { setCaseIndex(index); jump(0); }} />
    <p className="eq-note">{example.focus}</p>
    <div className="eq-tree"><TimeTree node={data.root} active={node.id} onSelect={id => jump(data.events.findIndex(item => item.nodeId === id && item.kind === 'enter'))} /></div>
    <p className="eq-caption">点时间结点可跳到进入该区间的时刻；当前结点用蓝色标出。所有时间下标从 0 开始。</p>
    <Stepper value={step} max={data.events.length - 1} onChange={jump} label={`执行帧 ${step + 1} / ${data.events.length}`} />
    <label className="eq-control eq-wide">跳到关键事件<select value={step} onChange={e => jump(Number(e.target.value))}>{data.events.map((item, i) => <option key={i} value={i}>{i + 1}. {item.title}</option>)}</select></label>
    <div className="eq-focus"><b>{event.title}</b><div>{event.detail}</div>
      <small>当前共有 {event.cells.filter(item => item.count).length} 个非空类；几何划分为 {node.x.length} × {node.y.length}，包含空类。</small>
    </div>
    <label className="eq-checkbox"><input type="checkbox" checked={showEmpty} onChange={e => setShowEmpty(e.target.checked)} />显示空类（空类的和为 0，不代表里面存在权值为 0 的点）</label>
    <div className="eq-class-grid">{visible.map(item => <button type="button" key={item.id} aria-pressed={cell?.id === item.id}
      onClick={() => setSelected(item.id)} className="eq-class-card">
      <b>{cellLabel(item.id, node)} · {item.count} 点</b><span>{membersText(item.members)}</span>
      <strong>{event.before ? `${event.before[item.id].sum} → ` : ''}{item.sum}</strong>
      <span>累计标记：{formatTag(item.tag)}</span>
    </button>)}</div>
    {cell && <div className="eq-detail"><b>{cellLabel(cell.id, node)} 的细节</b>
      <ClassFlow event={event} node={node} routeNode={routeNode} cell={cell} showEmpty={showEmpty} />
      <p>当前区间起点坐标：x ∈ {interval(node.x[Math.floor(cell.id / node.y.length)])}，y ∈ {interval(node.y[cell.id % node.y.length])}。</p>
      {event.kind === 'merge' && <p className="eq-note">来源：父段 [{routeNode.l},{routeNode.r}] 中的 {event.mapping.map((target, id) => target === cell.id ? cellLabel(id, routeNode) : null).filter(Boolean).join('、')}。新组的标记从“不变”开始，因为以前的修改已经体现在组内总和里。</p>}
      {event.kind === 'push' && <p className="eq-note">来自子段 [{routeNode.l},{routeNode.r}] 的 {cellLabel(event.mapping[cell.id], routeNode)} 的标记，作用于本细类自己的 {cell.count} 个点：和 {event.before[cell.id].sum} → {cell.sum}。不能把粗类总和复制给每个细类。</p>}
      <div className="eq-table-scroll"><table><thead><tr><th>点</th>{Array.from({ length: node.r - node.l + 1 }, (_, offset) => <th key={offset}>t={node.l + offset} 所在格</th>)}</tr></thead>
        <tbody>{cell.members.length ? cell.members.map(id => <tr key={id}><td>P{id}</td>{data.histories[id].slice(node.l, node.r + 1).map((signature, i) => <td key={i}>({signature[0]},{signature[1]})</td>)}</tr>) : <tr><td colSpan={node.r - node.l + 2}>此类没有成员</td></tr>}</tbody>
      </table></div>
      <small>以上轨迹由已知操作离线确定，用来解释为何同组；同组每一列完全相同，但初始权值可以不同。</small>
    </div>}
    {event.kind === 'query' && <div className="eq-focus"><b>本次返回的 9 个答案（修改前）</b><div className="eq-nine">{[0, 1, 2].flatMap(y => [0, 1, 2].map(x => <div key={`${x}${y}`}><span>({x},{y})</span><strong>{event.cells[3 * x + y].sum}</strong></div>))}</div></div>}
    {step === data.events.length - 1 && <div className="eq-focus eq-success"><b>将根结点的累计标记作用回原始点</b>
      <div className="eq-result-points">{data.finalValues.map((value, id) => <span key={id}>P{id}：{example.values[id]} → {value}</span>)}</div>
      <small>逐点模拟核对：所有查询答案、最终权值均一致。这里的可视化额外保存点编号和逐帧快照，正式算法不需要这些演示数据。</small>
    </div>}
  </Shell>;
}
