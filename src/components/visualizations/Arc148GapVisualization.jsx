import React, { useMemo, useState } from 'react';
import { ARC148_GAP_CASES, gapWalkthrough, openGaps, bruteValidOrders } from './arc148GapModel';
import './Arc148GapVisualization.css';

function Legend({ k }) {
  return <div className="ag-legend"><span><i className="ag-big-dot" />大数：2a ≥ {k}</span><span><i className="ag-small-dot" />小数：2a &lt; {k}</span><span>柱高 = 数值</span></div>;
}

function BarSequence({ sequence, values, k, caption, showGaps = false, inserted = [], highlight = null, allocation = [], threshold = null }) {
  const max = Math.max(...values, k / 2, threshold || 0, 1);
  const width = Math.max(values.length, 5) * 64 + 96, baseline = 190, scale = 142 / max;
  const gaps = openGaps(sequence, k);
  return <figure className="ag-chart">
    <figcaption>{caption}</figcaption>
    <div className="ag-chart-scroll"><svg width={width} height="246" viewBox={'0 0 ' + width + ' 246'} role="img"
      aria-label={caption + '。从左到右：' + (sequence.join('、') || '空序列') + '。蓝柱为大数，橙柱为小数。'}>
      {[0, max / 2, max].map((v, i) => <line key={i} x1="28" x2={width - 18} y1={baseline - v * scale} y2={baseline - v * scale} className="ag-grid-line" />)}
      <line x1="28" x2={width - 18} y1={baseline - k / 2 * scale} y2={baseline - k / 2 * scale} className="ag-half-line" />
      <text x={width - 20} y={baseline - k / 2 * scale - 7} textAnchor="end" className="ag-axis-label">K/2 = {k / 2}</text>
      {threshold !== null && <>
        <line x1="28" x2={width - 18} y1={baseline - threshold * scale} y2={baseline - threshold * scale} className="ag-threshold-line" />
        <text x={width - 20} y={baseline - threshold * scale - 9} textAnchor="end" className="ag-threshold-label">邻居至少 {threshold}</text>
      </>}
      <line x1="28" x2={width - 18} y1={baseline} y2={baseline} className="ag-baseline" />
      {sequence.map((v, i) => {
        const x = 64 + i * 64, y = baseline - v * scale, fresh = inserted.includes(i);
        return <g key={i} className={'ag-bar ' + (2 * v >= k ? 'ag-bar-big' : 'ag-bar-small') + (fresh ? ' ag-bar-new' : '')} opacity={highlight && !highlight.includes(i) ? 0.25 : 1}>
          <title>{'位置 ' + (i + 1) + '：' + v + '，' + (2 * v >= k ? '大数' : '小数') + (fresh ? '，本次插入' : '')}</title>
          <rect x={x - 18} y={y} width="36" height={v * scale} rx="4" />
          {v === 0 && <line x1={x - 18} x2={x + 18} y1={baseline} y2={baseline} stroke="currentColor" strokeWidth="3" />}
          <text x={x} y={y - 10} textAnchor="middle" className="ag-bar-value">{v}</text>
          <text x={x} y={baseline + 22} textAnchor="middle" className="ag-bar-foot">{fresh ? '新' : '#' + (i + 1)}</text>
        </g>;
      })}
      {showGaps && Array.from({ length: sequence.length + 1 }, (_, i) => {
        const slot = gaps.indexOf(i), active = slot >= 0, chosen = allocation[slot] > 0;
        const x = 32 + i * 64;
        return <g key={i} className={'ag-slot ' + (active ? 'ag-slot-open' : 'ag-slot-closed') + (chosen ? ' ag-slot-chosen' : '')}>
          <title>{active ? '可用空位 ' + (slot + 1) + (chosen ? '，放入 ' + allocation[slot] + ' 个' : '') : '封闭：紧邻小数，后续不能插入'}</title>
          {active && <line x1={x} x2={x} y1={baseline - 22} y2={baseline + 12} />}
          <circle cx={x} cy={baseline + 22} r="11" />
          <text x={x} y={baseline + 26} textAnchor="middle">{active ? slot + 1 : '×'}</text>
        </g>;
      })}
      {!sequence.length && <text x="64" y="150" className="ag-empty-label">还没有放数，只有一个可用空位。</text>}
    </svg></div>
    <small className="ag-scroll-hint">窄屏可左右滑动查看完整序列。</small>
    {showGaps && <small>圆圈标出可用空位；× 表示封闭。黑色描边的柱子是本次新插入的数。</small>}
  </figure>;
}

function Frame({ title, children, k = 10 }) {
  return <section className="ag-vis" data-vis="arc148-gaps" aria-label={title}>
    <header>{title}</header><div className="ag-body"><Legend k={k} />{children}</div>
  </section>;
}

function Classification() {
  const { values, k } = ARC148_GAP_CASES[0];
  const [selected, setSelected] = useState(null);
  const pairs = [[7, 9], [1, 3], [1, 7], [1, 9]];
  const [a, b] = pairs[selected ?? 0];
  const highlight = selected === null ? null : [values.indexOf(a), values.indexOf(b)];
  return <Frame title="① 两根柱子，能不能相邻？">
    <p>这是原序列的 7 根柱子。点下面的数对，设想重排后把它们放在一起。</p>
    <div className="ag-controls">{pairs.map((pair, i) => <button type="button" key={i} aria-pressed={selected === i} onClick={() => setSelected(selected === i ? null : i)}>{pair.join(' 与 ')}</button>)}</div>
    <BarSequence sequence={values} values={values} k={k} highlight={highlight} caption="原序列：7，1，9，5，3，9，7" />
    {selected === null ? <div className="ag-insight"><b>先看分界线：5 也属于大数。</b><span>再选一组柱子，检查它们的和是否达到 10。</span></div> : <div className="ag-insight" role="status"><b>{a} + {b} = {a + b} {a + b >= k ? '≥' : '<'} {k} · {a + b >= k ? '可以相邻' : '不能相邻'}</b>
      <span>{selected === 0 ? '两根蓝柱都不低于 K/2，所以任意两个大数都能相邻。' : selected === 1 ? '两根橙柱都低于 K/2，所以任意两个小数都不能相邻。' : selected === 2 ? '一大一小不一定可行：7 对于 1 来说还不够大。' : '1 的邻居至少为 9；刚好等于 K，也合法。'}</span>
    </div>}
  </Frame>;
}

function OrderLesson() {
  const { values, k } = ARC148_GAP_CASES[0];
  const [a, setA] = useState(1);
  const highlight = values.flatMap((v, i) => v === a || v >= k - a ? [i] : []);
  return <Frame title="② 谁最挑邻居，就先安排谁">
    <div className="ag-controls">{[1, 3].map(v => <button key={v} type="button" aria-pressed={a === v} onClick={() => setA(v)}>先看小数 {v}</button>)}</div>
    <BarSequence sequence={values} values={values} k={k} threshold={k - a} highlight={highlight} caption={'小数 ' + a + '：只允许邻居 ≥ ' + (k - a)} />
    <div className="ag-insight"><b>{a === 1 ? '先放两个 9，再插入 1。' : '1 已安排好；再放两个 7，才轮到 3。'}</b>
      <span>{a === 1 ? '5、7 对 1 都太小，它们稍后放入时，不能再贴着 1。' : '9 已经在序列里，不重复放入。新加入的 7 可以挨着 3，却不能贴着先前的 1。'}</span>
    </div>
    <div className="ag-order" aria-label="放入顺序">9 × 2 <span>→</span> 1 <span>→</span> 7 × 2 <span>→</span> 3 <span>→</span> 5</div>
  </Frame>;
}

function optionLabel(allocation, type) {
  return type === 'small' ? '选空位 ' + allocation.flatMap((c, i) => c ? [i + 1] : []).join('、')
    : allocation.map((c, i) => '空位' + (i + 1) + '放' + c + '个').join('；');
}

function InsertionView({ current, values, k, onChoice, defaultAfter = false }) {
  const [after, setAfter] = useState(defaultAfter);
  return <>
    <div className="ag-stage-toolbar">
      <div className="ag-segment"><button type="button" aria-pressed={!after} onClick={() => setAfter(false)}>放之前</button><button type="button" aria-pressed={after} disabled={!current.factor} onClick={() => setAfter(true)}>放之后</button></div>
      <span className="ag-count">空位 <b>{current.slots}</b>{current.factor > 0 && <> → <b>{current.nextGaps.length}</b></>}</span>
    </div>
    <BarSequence sequence={after && current.factor ? current.after : current.before} values={values} k={k} showGaps
      inserted={after ? current.inserted : []} allocation={after ? [] : current.allocation}
      caption={after && current.factor ? '插入 ' + current.count + ' 个 ' + current.value + ' 后' : '准备插入 ' + current.count + ' 个 ' + current.value + '：深色圆圈是选中的空位'} />
    {current.factor > 0 && <label className="ag-choice">试一种放法<select aria-label="选择一种放法" value={current.selection} onChange={e => { onChoice(Number(e.target.value)); setAfter(true); }}>
      {current.options.map((allocation, i) => <option key={i} value={i}>{optionLabel(allocation, current.type)}</option>)}
    </select></label>}
    <div className={'ag-insight' + (!current.factor ? ' ag-warning' : '')} role="status">
      <b>{!current.factor ? '这一批放不下：0 种。' : current.type === 'big'
        ? 's = ' + current.slots + ' + ' + current.count + ' = ' + current.nextGaps.length + '；本批有 ' + current.factor + ' 种放法。'
        : 's = ' + current.slots + ' − ' + current.count + ' = ' + current.nextGaps.length + '；本批有 ' + current.factor + ' 种放法。'}</b>
      <span>{!current.factor ? current.slots === 0 ? '可用空位已耗尽，但还有数没放，答案为 0。' : '小数比空位多，又不能在一个空位里挤两个，所以无解。'
        : current.type === 'big' ? '一个空位装 c 根蓝柱，会变成 c + 1 个可用空位，净增 c 个。'
          : '一个空位装一根橙柱后，两侧都封闭；不是新增两个空位，而是净减一个。'}</span>
    </div>
  </>;
}

function LocalInsertion({ type }) {
  const caseIndex = type === 'big' ? 0 : 1, index = type === 'big' ? 2 : 1;
  const { values, k } = ARC148_GAP_CASES[caseIndex];
  const [choice, setChoice] = useState(0);
  const selections = []; selections[index] = choice;
  const current = gapWalkthrough(values, k, selections).steps[index];
  return <Frame title={type === 'big' ? '③ 两个 7，怎样分进两个空位？' : '④ 两个 2，能挤在同一个空位吗？'}>
    <p>{type === 'big' ? '已经放好 9、9、1，剩两个可用空位。试试把两个 7 分成 0+2、1+1、2+0。'
      : '这里换成 2、2、8、8、8：三个 8 形成四个空位。选择两个不同空位，再点“放之后”。'}</p>
    <InsertionView current={current} values={values} k={k} onChoice={setChoice} />
  </Frame>;
}

function Walkthrough() {
  const [caseIndex, setCaseIndex] = useState(0), [step, setStep] = useState(0), [selections, setSelections] = useState([]);
  const { values, k } = ARC148_GAP_CASES[caseIndex];
  const { steps, batches, total } = useMemo(() => gapWalkthrough(values, k, selections), [values, k, selections]);
  const oracle = useMemo(() => bruteValidOrders(values, k), [values, k]);
  const current = step ? steps[step - 1] : null, finished = step === steps.length;
  const reset = () => { setStep(0); setSelections([]); };
  return <Frame title="⑤ 串起来：每一批的方案数怎样相乘？" k={k}>
    <label className="ag-choice">选择案例<select aria-label="插空案例" value={caseIndex} onChange={e => { setCaseIndex(Number(e.target.value)); reset(); }}>
      {ARC148_GAP_CASES.map((item, i) => <option key={item.name} value={i}>{item.name}</option>)}
    </select></label>
    <p>原序列：{values.join('，')}。从空序列开始，按下面的顺序逐批放入。</p>
    <div className="ag-controls"><button type="button" onClick={reset} disabled={!step}>重置</button><button type="button" disabled={!step} onClick={() => setStep(step - 1)}>上一步</button><span>{step} / {steps.length}</span><button type="button" disabled={finished} onClick={() => setStep(step + 1)}>下一步</button><button type="button" disabled={finished} onClick={() => setStep(steps.length)}>看结果</button></div>
    <div className="ag-timeline" aria-label="按值分批放入的顺序">{batches.map((batch, i) => <button type="button" key={i} disabled={i >= steps.length} aria-pressed={step === i + 1} onClick={() => setStep(i + 1)}>{batch.type === 'big' ? '大' : '小'} {batch.value} × {batch.count}</button>)}</div>
    {!current ? <><BarSequence sequence={[]} values={values} k={k} showGaps caption="起点：s = 1，累计方案数 = 1" /><p>先猜最终答案，再逐步检查；也可以切换到“空位耗尽”的案例。</p></> : <>
      <p className="ag-current"><b>本批：{current.type === 'big' ? '大数' : '小数'} {current.value} × {current.count}。</b> {current.type === 'small' ? '它的邻居至少为 ' + (k - current.value) + '，够大的数已经全部放入。'
        : current.forSmall === null ? '小数已放完，继续处理剩余大数。' : '为小数 ' + current.forSmall + ' 准备邻居：先放入尚未处理的 ' + current.value + '。'}</p>
      <InsertionView key={caseIndex + '-' + step} current={current} values={values} k={k} defaultAfter={finished && current.factor > 0} onChoice={value => setSelections(previous => {
        const next = previous.slice(0, step - 1); next[step - 1] = value; return next;
      })} />
      <div className="ag-product">累计：{current.beforeTotal} × {current.factor} = <b>{current.total}</b><small>图上只是一条构造路径；计数包含这一批的所有放法。</small></div>
    </>}
    {finished && <div className="ag-result"><b>最终答案：{total}</b><span>独立枚举不同重排：{oracle.length}，与插空计数一致。</span>
      {total > 0 && <small>最终序列相邻和：{current.after.slice(1).map((v, i) => current.after[i] + v).join('、')}，都 ≥ {k}。</small>}
      <small>小案例显示精确计数；原题需要对 998244353 取模。</small>
    </div>}
  </Frame>;
}

export default function Arc148GapVisualization({ mode = 'walkthrough' }) {
  if (mode === 'classify') return <Classification />;
  if (mode === 'order') return <OrderLesson />;
  if (mode === 'big' || mode === 'small') return <LocalInsertion type={mode} />;
  return <Walkthrough />;
}
