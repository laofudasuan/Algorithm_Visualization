import React, { useMemo, useState } from 'react';
import { CONJUNCTIVE_CASES, validatePermutation, intervalInfo, enumerateIntervals, buildConjunctiveTree,
  computeLeftBounds, flattenTree, childRanks, nodeLabel, contribution, countContinuous, minimumCover } from './conjunctiveTreeModel';
import './ConjunctiveTreeVisualization.css';

const rangeText = u => `[${u.l}, ${u.r}]`;
const valueText = u => `[${u.min}, ${u.max}]`;
function Shell({ title, children }) {
  return <section className="ct-vis" data-vis="conjunctive-tree" aria-label={title}>
    <header>{title}</header><div className="ct-body">{children}</div>
  </section>;
}
function ExamplePicker({ p, onChange }) {
  const [draft, setDraft] = useState(p.join(' '));
  const [error, setError] = useState('');
  const preset = CONJUNCTIVE_CASES.findIndex(item => item.p.join() === p.join());
  return <div className="ct-examples">
    <label>预设排列<select aria-label="预设排列" value={preset} onChange={e => {
      const next = CONJUNCTIVE_CASES[Number(e.target.value)].p;
      onChange(next); setDraft(next.join(' ')); setError('');
    }}>{preset === -1 && <option value="-1">自定义排列</option>}{CONJUNCTIVE_CASES.map((item, i) => <option value={i} key={item.name}>{item.name}</option>)}</select></label>
    <form onSubmit={e => {
      e.preventDefault();
      const next = draft.trim().split(/[\s,，]+/).map(Number);
      if (!validatePermutation(next, 10)) { setError('请输入 1 到 n 的排列，1 ≤ n ≤ 10；不能重复或缺数。'); return; }
      setError(''); onChange(next);
    }}><label>自己试一组<input aria-label="自定义排列" value={draft} onChange={e => setDraft(e.target.value)} /></label><button type="submit">应用</button></form>
    {error && <p role="alert" className="ct-error">{error}</p>}
  </div>;
}
function Strip({ p, l = 0, r = 0, second = null, read = p.length }) {
  return <div className="ct-array" aria-label="排列，下方小字是位置">
    {p.map((v, i) => <div key={i} className={`ct-cell ${i + 1 >= l && i + 1 <= r ? 'ct-selected' : ''} ${second && i + 1 >= second.l && i + 1 <= second.r ? 'ct-second' : ''} ${i >= read ? 'ct-unread' : ''}`}>
      <b>{v}</b><small>{i + 1}</small>
    </div>)}
  </div>;
}
function RangePicker({ n, l, r, onChange, label = '位置' }) {
  return <div className="ct-controls"><label>{label}左端<select aria-label={`${label}左端`} value={l} onChange={e => { const v = Number(e.target.value); onChange(v, Math.max(v, r)); }}>{Array.from({ length: n }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>
    <label>{label}右端<select aria-label={`${label}右端`} value={r} onChange={e => { const v = Number(e.target.value); onChange(Math.min(l, v), v); }}>{Array.from({ length: n }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label></div>;
}
function ValueStrip({ p, l, r }) {
  const info = intervalInfo(p, l, r);
  return <div><small>值轴：实心是选中的值，虚线框是最小值与最大值之间的缺口。</small><div className="ct-values">
    {Array.from({ length: p.length }, (_, i) => i + 1).map(v => <span key={v} className={info.values.includes(v) ? 'ct-filled' : v >= info.min && v <= info.max ? 'ct-hole' : ''}>{v}</span>)}
  </div></div>;
}
function Stepper({ events, step, onChange }) {
  return <><div className="ct-controls"><button type="button" disabled={!step} onClick={() => onChange(0)}>重置</button><button type="button" disabled={!step} onClick={() => onChange(step - 1)}>上一步</button><span>{step + 1} / {events.length}</span><button type="button" disabled={step === events.length - 1} onClick={() => onChange(step + 1)}>下一步</button><button type="button" disabled={step === events.length - 1} onClick={() => onChange(events.length - 1)}>看结果</button></div>
    <input type="range" aria-label="演示进度" min="0" max={events.length - 1} value={step} onChange={e => onChange(Number(e.target.value))} />
    <label>跳到一个动作<select className="ct-wide" aria-label="演示动作" value={step} onChange={e => onChange(Number(e.target.value))}>{events.map((event, i) => <option key={i} value={i}>{i + 1}. r={event.r} · {event.message}</option>)}</select></label></>;
}
function TreeDiagram({ roots, n, selectedId = null, currentId = null, onSelect }) {
  const nodes = [], edges = [];
  const visit = (u, depth) => {
    const point = { u, x: 22 + (u.l + u.r - 1) * 36, y: 30 + depth * 78 };
    nodes.push(point);
    for (const child of u.children) { const end = visit(child, depth + 1); edges.push([point, end]); }
    return point;
  };
  roots.forEach(u => visit(u, 0));
  const width = n * 72 + 44, height = Math.max(110, ...nodes.map(p => p.y + 44));
  return <div className="ct-tree-scroll"><svg viewBox={`0 0 ${width} ${height}`} style={{ minWidth: width, width: '100%', maxWidth: width, height: 'auto', margin: '0 auto' }} role="img" aria-label="析合树；框内上行是类型，下行是位置区间，叶子写出元素值">
    {edges.map(([a, b]) => <path key={`${a.u.id}-${b.u.id}`} d={`M${a.x},${a.y + 21} V${a.y + 37} H${b.x} V${b.y - 21}`} fill="none" stroke="#cbd5e1" strokeWidth="2" />)}
    {nodes.map(({ u, x, y }) => <g key={u.id} className={`ct-node ct-${u.type}`} role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined}
      aria-label={`${nodeLabel(u)} 位置 ${rangeText(u)} 值域 ${valueText(u)}`} onClick={() => onSelect?.(u.id)}
      onKeyDown={e => { if (onSelect && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(u.id); } }}>
      <rect x={x - 31} y={y - 23} width="62" height="46" rx="7" strokeWidth={selectedId === u.id || currentId === u.id ? 3 : 1.5} style={{ stroke: currentId === u.id ? '#d97706' : selectedId === u.id ? '#0f172a' : undefined }} />
      <text x={x} y={y - 4} textAnchor="middle" fontSize="13" fontWeight="600">{u.type === 'leaf' ? `值 ${u.min}` : nodeLabel(u)}</text>
      <text x={x} y={y + 14} textAnchor="middle" fontSize="12">{rangeText(u)}</text>
    </g>)}
  </svg></div>;
}

const INTERVAL_QUIZ = [
  { l: 4, r: 5, lesson: '倒着摆也没关系：4、5 都在。' },
  { l: 3, r: 4, lesson: '虽然递增，但 3 和 5 之间缺了 4。' },
  { l: 1, r: 3, lesson: '不必单调：1、2、3 恰好齐全。' },
  { l: 4, r: 4, lesson: '单个数也算：值域只有 5，没有缺数。' },
  { l: 2, r: 4, lesson: '位置相邻不够，值域里还缺了 2、4。' },
  { l: 2, r: 6, lesson: '即使包含 1，也不一定连续：这里缺了 2。' },
];

export function ContinuousIntervalQuiz() {
  const p = CONJUNCTIVE_CASES[0].p;
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const answered = Object.keys(answers).length;
  const score = INTERVAL_QUIZ.filter((q, i) => answers[i] === intervalInfo(p, q.l, q.r).good).length;
  return <Shell title="判断题 · 这些区间是连续段吗？">
    <p>六题共用下面的排列，下方小字是位置。点击右侧 ✓ 表示“是连续段”，✕ 表示“不是”；全部答完后统一核对。</p>
    <Strip p={p} />
    <div className="ct-quiz-grid">{INTERVAL_QUIZ.map((q, i) => {
      const info = intervalInfo(p, q.l, q.r);
      const correct = answers[i] === info.good;
      return <div className="ct-quiz-card" role="group" aria-label={`第 ${i + 1} 题`} key={i}>
        <div className="ct-quiz-row">
          <div className="ct-quiz-question"><b>第 {i + 1} 题 · 位置 {rangeText(q)}</b>
            <div className="ct-quiz-values">取出的数：{info.values.join('，')}</div>
          </div>
          <div className="ct-quiz-options">{[true, false].map(choice => <button className="ct-quiz-choice" key={String(choice)} type="button" disabled={submitted}
            aria-label={choice ? '是连续段' : '不是连续段'} title={choice ? '是连续段' : '不是连续段'} aria-pressed={answers[i] === choice}
            onClick={() => setAnswers(previous => ({ ...previous, [i]: choice }))}>
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={choice ? 'M5 12.5 9.5 17 19 7' : 'M6 6 18 18 M18 6 6 18'} />
            </svg>
          </button>)}</div>
        </div>
        {submitted && <div className={`ct-answer ${correct ? 'ct-good' : 'ct-bad'}`}>
          <b>{correct ? '答对了' : '再想一想'} · 正确答案：{info.good ? '是' : '否'}</b>
          <span>{q.lesson}</span>
          <span>最大值 − 最小值 = {info.max} − {info.min} = {info.max - info.min}；长度 − 1 = {q.r - q.l}。{info.good ? '两者相等。' : '两者不相等。'}</span>
        </div>}
      </div>;
    })}</div>
    <div className="ct-controls">
      <button type="button" disabled={submitted || answered !== INTERVAL_QUIZ.length} onClick={() => setSubmitted(true)}>提交并核对</button>
      <button type="button" disabled={!answered} onClick={() => { setAnswers({}); setSubmitted(false); }}>重新作答</button>
      <span role="status" aria-live="polite">{submitted ? `答对 ${score} / ${INTERVAL_QUIZ.length} 题。对照解析，检查自己有没有把“递增”或“包含 1”当成条件。` : `已答 ${answered} / ${INTERVAL_QUIZ.length} 题；提交前可以修改选择。`}</span>
    </div>
  </Shell>;
}

export function ConjunctiveTreeVisualization({ mode = 'strong' }) {
  const initial = mode === 'children' ? 2 : 0;
  const [p, setP] = useState(CONJUNCTIVE_CASES[initial].p);
  const [selectedId, setSelectedId] = useState(null);
  const [[l, r], setRange] = useState([1, 3]);
  const [[from, to], setChildren] = useState([1, 2]);
  const [showStrong, setShowStrong] = useState(false);
  const [showSingles, setShowSingles] = useState(false);
  const { root } = useMemo(() => buildConjunctiveTree(p), [p]);
  const nodes = useMemo(() => flattenTree(root), [root]);
  const intervals = useMemo(() => enumerateIntervals(p), [p]);
  const selected = nodes.find(u => u.id === selectedId) || root;
  const chosen = intervals.find(u => u.l === l && u.r === r);
  const ranks = childRanks(selected);
  const first = Math.min(from, selected.children.length), last = Math.min(to, selected.children.length);
  const group = selected.children.slice(first - 1, last);
  const info = group.length ? intervalInfo(p, group[0].l, group.at(-1).r) : null;
  const cover = minimumCover(root, l, r);
  const select = id => {
    setSelectedId(id); setChildren([1, 2]);
    if (mode === 'strong') { const node = nodes.find(u => u.id === id); if (node) setRange([node.l, node.r]); }
  };
  const title = mode === 'strong' ? '实验一 · 哪些连续段可以成为树结点？' : mode === 'children' ? '实验二 · 把孩子缩成块，再试着拼一拼' : '实验五 · 用一棵树回答计数与最短覆盖';
  return <Shell title={title}>
    <ExamplePicker p={p} onChange={next => { setP(next); setSelectedId(null); setRange([1, Math.min(3, next.length)]); setChildren([1, 2]); }} />
    {mode === 'strong' && <>
      <p>选一个连续段，找有没有另一段与它“相交，但互不包含”。默认案例先点 [1,3]，再点 [1,2]。</p>
      <div className="ct-controls"><label><input type="checkbox" checked={showStrong} onChange={e => setShowStrong(e.target.checked)} />标出本原段</label><label><input type="checkbox" checked={showSingles} onChange={e => setShowSingles(e.target.checked)} />列出单点段</label></div>
      <div className="ct-chips">{intervals.filter(u => showSingles || u.l !== u.r).map(u => <button type="button" key={`${u.l}:${u.r}`} aria-label={`连续段 ${rangeText(u)}`} aria-pressed={u.l === l && u.r === r}
        className={showStrong && !u.witness ? 'ct-strong' : ''} onClick={() => { setRange([u.l, u.r]); const node = nodes.find(v => v.l === u.l && v.r === u.r); setSelectedId(node?.id ?? null); }}>{rangeText(u)}</button>)}</div>
      <Strip p={p} l={l} r={r} second={chosen?.witness} />
      <div className="ct-answer" aria-live="polite"><b>蓝色：{rangeText({ l, r })}{chosen?.witness ? `；橙色反例：${rangeText(chosen.witness)}` : ''}</b>
        <span>{!chosen ? '这段本身不连续。先从上面的按钮中选一个连续段。' : chosen.witness ? '两段共享位置，却互不包含。因此蓝色段不是本原段，树上不会为它单独建点。' : '找不到部分相交的连续段：这是本原段，树上有对应结点。'}</span></div>
    </>}
    {mode === 'applications' && <>
      <p>给定位置 [l,r]，要补进哪些元素，才能成为连续段？蓝框是原询问，橙框是最短答案。</p>
      <RangePicker n={p.length} l={l} r={r} onChange={(a, b) => setRange([a, b])} />
      <Strip p={p} l={l} r={r} second={cover} />
      <div className="ct-answer" aria-live="polite"><b>最短覆盖：{rangeText(cover)}</b><span>两端所在叶子的 LCA 是 {nodeLabel(cover.node)} {rangeText(cover.node)}。</span><span>{cover.node.type === 'prime' ? '跨过析点的不同孩子，只能取整个析点。' : cover.node.type === 'leaf' ? '两个端点相同，单点就是答案。' : `只取从第 ${cover.node.children.indexOf(cover.children[0]) + 1} 到第 ${cover.node.children.indexOf(cover.children.at(-1)) + 1} 个完整孩子；不必取整个 LCA。`}</span></div>
    </>}
    {mode !== 'strong' && mode !== 'applications' && <Strip p={p} l={selected.l} r={selected.r} />}
    <TreeDiagram roots={[root]} n={p.length} selectedId={mode === 'applications' ? cover.node.id : mode === 'strong' ? nodes.find(u => u.l === l && u.r === r)?.id : selected.id} onSelect={mode === 'applications' ? undefined : select} />
    <small>框内区间是位置，不是值域。蓝色为合点，紫色为析点，灰色为叶子；窄屏可横向查看整棵树。</small>
    {mode !== 'applications' && <label>查看结点<select className="ct-wide" aria-label="查看结点" value={selected.id} onChange={e => select(Number(e.target.value))}>{nodes.map(u => <option key={u.id} value={u.id}>{nodeLabel(u)} · 位置 {rangeText(u)} · 值域 {valueText(u)}</option>)}</select></label>}
    {mode === 'strong' && <p>连续段共 {intervals.length} 个；其中本原段（树结点）{nodes.length} 个。选中结点：{nodeLabel(selected)} {rangeText(selected)}，值域 {valueText(selected)}。</p>}
    {mode === 'children' && <>
      <div className="ct-answer"><b>选中 {nodeLabel(selected)}：位置 {rangeText(selected)}，值域 {valueText(selected)}</b><span>{selected.children.length ? `儿子排列：${ranks.join(' → ')}。下面的块按原位置排列，编号按值域从小到大得到。` : '叶子没有孩子，不参与析 / 合的分类。'}</span></div>
      <div className="ct-child-blocks">{selected.children.map((child, i) => <div key={child.id} className={i + 1 >= first && i + 1 <= last ? 'ct-selected' : ''}><b>第 {i + 1} 块 · 排名 {ranks[i]}</b><span>位置 {rangeText(child)}</span><span>值域 {valueText(child)}</span></div>)}</div>
      {info && <><RangePicker n={selected.children.length} l={first} r={last} label="孩子" onChange={(a, b) => setChildren([a, b])} /><ValueStrip p={p} l={info.l} r={info.r} />
        <div className={`ct-answer ${info.good ? 'ct-good' : 'ct-bad'}`} aria-live="polite"><b>拼第 {first}..{last} 块 → 位置 {rangeText(info)}：{info.good ? '连续' : '不连续'}</b><span>极差 {info.max - info.min}，长度减一 {info.r - info.l}。{first === last ? '只选一块当然连续，不能用它区分析与合。' : group.length === selected.children.length ? '选了全部孩子：整个结点当然连续，析点也不例外。' : selected.type === 'prime' ? '这里暴露了值域缺口；析点不能只拼部分相邻孩子。' : '相邻块的值域也首尾相接，因此拼起来仍然连续。'}</span></div></>}
    </>}
    {mode === 'applications' && <><div className="ct-answer"><b>全部非空连续段：{countContinuous(root)}</b><span>逐段枚举核对：{intervals.length}。叶子各贡献 1，析点贡献 1，k 个孩子的合点贡献 k(k−1)/2。</span></div>
      <div className="ct-table-scroll"><table><thead><tr><th>结点</th><th>类型</th><th>孩子数</th><th>本层新增</th></tr></thead><tbody>{nodes.map(u => <tr key={u.id}><td>{rangeText(u)}</td><td>{nodeLabel(u)}</td><td>{u.children.length}</td><td>{contribution(u)}</td></tr>)}</tbody></table></div></>}
  </Shell>;
}

export function ConjunctiveBuildVisualization() {
  const [p, setP] = useState(CONJUNCTIVE_CASES[1].p);
  const [step, setStep] = useState(0);
  const { events } = useMemo(() => buildConjunctiveTree(p, true), [p]);
  const event = events[step];
  const collected = event.collected || [];
  const roots = [...event.forest, ...collected.slice().reverse(), ...(event.current ? [event.current] : [])];
  return <Shell title="实验三 · 一次读一个数，森林怎样变成树？">
    <ExamplePicker p={p} onChange={next => { setP(next); setStep(0); }} />
    <p>先试 2 4 1 3：为什么前 3 次都要等待？再试递增排列：为什么不建一条二叉链？</p>
    <Stepper events={events} step={step} onChange={setStep} />
    <Strip p={p} l={event.current?.l || event.r} r={event.r} read={event.r} />
    <div className="ct-answer" aria-live="polite"><b>r = {event.r}；L[r] = {event.left}</b><span>{event.message}</span></div>
    <div className="ct-chips"><b>森林栈（栈底 → 栈顶）：</b>{event.forest.length ? event.forest.map(u => <span key={u.id}>{nodeLabel(u)} {rangeText(u)}</span>) : <span>空</span>}</div>
    {event.candidate && <p className="ct-collect">虚拟收集区：位置 {rangeText(event.candidate)}，值域包围盒 {valueText(event.candidate)}。尚未连续时，不把它当成正式结点。</p>}
    <TreeDiagram roots={roots} n={p.length} currentId={event.current?.id} />
    <small>已收集但还未拼好的块也画在上方；橙框为 u。只有正式合并后，才画新的父子连边。这里的 L[r] 是最左合法左端点，不是本次合并的停止点。</small>
  </Shell>;
}

export function ConjunctiveGapVisualization() {
  const [p, setP] = useState(CONJUNCTIVE_CASES[1].p);
  const [step, setStep] = useState(0);
  const { events } = useMemo(() => computeLeftBounds(p, true), [p]);
  const event = events[step];
  return <Shell title="实验四 · 把“有没有缺口”变成找零">
    <ExamplePicker p={p} onChange={next => { setP(next); setStep(0); }} />
    <p>在 2 4 1 3 中，关注读入最后一个 3 的过程：长度、最大值、最小值分别改动了哪些左端点？</p>
    <Stepper events={events} step={step} onChange={setStep} />
    <Strip p={p} l={event.r} r={event.r} read={event.r} />
    <div className="ct-answer" aria-live="polite"><b>{event.kind === 'done' ? '本轮完成：Q 已是缺口数' : '更新中：暂存值可能为负，尚不能找零'}</b><span>{event.message}</span></div>
    <div className="ct-table-scroll"><table><thead><tr><th>左端点 l</th>{p.map((_, i) => <th key={i}>{i + 1}</th>)}</tr></thead><tbody><tr><th>暂存 Q[l]</th>{event.q.map((q, i) => <td key={i} className={event.range && i + 1 >= event.range[0] && i + 1 <= event.range[1] ? 'ct-change' : event.kind === 'done' && q === 0 ? 'ct-zero' : ''}>{q ?? '—'}</td>)}</tr>
      {event.kind === 'done' && <tr><th>直接计算核对</th>{p.map((_, i) => <td key={i}>{i + 1 <= event.r ? intervalInfo(p, i + 1, event.r).gap : '—'}</td>)}</tr>}</tbody></table></div>
    <p>橙色：这一步的区间加范围。绿色：完成本轮后等于 0 的位置。“—”是尚未启用的左端点。</p>
    <div className="ct-stack-pair"><div><b>最大值栈（值递减）</b><span>{event.maxStack.map(i => `${i}:${p[i - 1]}`).join(' → ') || '空'}</span></div><div><b>最小值栈（值递增）</b><span>{event.minStack.map(i => `${i}:${p[i - 1]}`).join(' → ') || '空'}</span></div></div>
    <small>栈项写作“位置:值”；弹出旧最值后，新位置会在该栈本轮处理结束时入栈。</small>
    {event.kind === 'done' && <div className="ct-answer ct-good"><b>L[{event.r}] = {event.left}</b><span>从左到右第一个 0。单点 [{event.r},{event.r}] 一定合法，所以至少有一个 0。</span></div>}
  </Shell>;
}
