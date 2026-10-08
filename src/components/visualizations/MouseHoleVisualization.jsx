import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { createPortal } from 'react-dom';
import katex from 'katex';
import { MOUSE_HOLE_CASES, buildMouseHoleTrace, mouseHoleGraph } from './mouseHoleModel.js';
import { buildGraphActions, buildDPActions, playerInitial, reducePlayer } from './mouseHoleActions.js';
import MouseHoleMotionGraph from './MouseHoleMotionGraph.jsx';
import MouseHoleDPMatrix, { dpDisplay } from './MouseHoleDPMatrix.jsx';
import { buildMouseHoleDPTable, DP_TRANSITIONS } from './mouseHoleDPTable.js';
import './MouseHoleVisualization.css';

function Formula({ value }) {
  const html = useMemo(() => katex.renderToString(value, { displayMode: true, throwOnError: true, trust: false }), [value]);
  return <div className="mh-formula" dangerouslySetInnerHTML={{ __html: html }} />;
}

function StateRack({ states, cue, progress }) {
  return <div className="mh-states">{states.map(s => {
    const change = cue?.changes?.find(d => d.name === s.name), committing = cue?.kind === 'commit';
    const counts = new Map();
    return <div className="mh-state" key={s.name}><strong>{s.name}</strong><div>{s.items.length ? s.items.map(item => {
      const count = (counts.get(item) ?? 0) + 1; counts.set(item, count);
      const added = committing && change?.added.includes(item), removed = !committing && change?.removed.includes(item);
      return <span key={`${item}-${count}`} className={removed ? 'mh-taking' : added ? 'mh-entering' : ''} style={added ? { transform: `translateY(${(1 - progress) * -18}px)`, opacity: .3 + .7 * progress } : undefined}>{removed ? '↑ ' : added ? '+ ' : ''}{item}</span>;
    }) : <span>空</span>}</div>
      {!committing && change?.added.length > 0 && <small className="mh-pending">待放入：{change.added.join('，')}</small>}
    </div>;
  })}</div>;
}

export default function MouseHoleVisualization({ group = 'matching' }) {
  const cases = useMemo(() => MOUSE_HOLE_CASES.filter(c => c.group === group), [group]);
  const [index, setIndex] = useState(0), [view, setView] = useState('matching'), [physical, setPhysical] = useState(false);
  const [player, dispatch] = useReducer(reducePlayer, playerInitial), [speed, setSpeed] = useState(1);
  const [inspected, setInspected] = useState(null), [expanded, setExpanded] = useState(false);
  const current = cases[index] ?? cases[0];
  const frames = useMemo(() => current ? buildMouseHoleTrace(current) : [], [current]);
  const table = useMemo(() => current ? buildMouseHoleDPTable(current, frames) : null, [current, frames]);
  const matrix = Boolean(table && !physical);
  const timeline = useMemo(() => !current ? null : matrix ? buildDPActions(table, frames) : buildGraphActions(current, frames), [current, frames, table, matrix]);
  const action = timeline?.actions[player.index];
  const cue = player.phase >= 0 ? action?.phases[player.phase] : timeline?.actions[player.index - 1]?.phases.at(-1);
  const state = player.phase >= 0 ? cue.frame : timeline?.actions[player.index - 1]?.after ?? timeline?.initial;
  const frame = matrix ? frames[state?.logical ?? 0] : state;
  const graph = useMemo(() => current && frame ? mouseHoleGraph(current, frame, view) : null, [current, frame, view]);
  const running = player.phase >= 0 && !player.paused, progress = player.phase >= 0 ? player.progress : 1;
  useEffect(() => {
    if (!running) return;
    let raf, last = null;
    const tick = now => {
      if (last !== null) dispatch({ type: 'tick', delta: Math.min(now - last, 80) * speed / action.phases[player.phase].duration, phases: action.phases.length, length: timeline.actions.length });
      last = now; raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, player.index, player.phase, speed, action, timeline]);
  useEffect(() => {
    if (!expanded) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = e => { if (e.key === 'Escape') setExpanded(false); };
    document.addEventListener('keydown', close);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', close); };
  }, [expanded]);
  if (!current) return null;
  const send = type => { setInspected(null); dispatch({ type, length: timeline.actions.length }); };
  const reset = () => send('reset');
  const switchCase = i => { setIndex(i); setView('matching'); setPhysical(false); reset(); };
  const switchMode = value => { setPhysical(value); setView('matching'); reset(); };
  const finished = player.index === timeline.actions.length && player.phase < 0;
  const cell = inspected ?? cue?.cell;
  const incoming = matrix && cell ? table.edges.filter(e => e.row === cell.row && e.to === cell.col && state.seen.includes(e.id)) : [];
  const value = matrix && cell ? state.values[cell.row][table.columns.indexOf(cell.col)] : null;
  const content = <section className={`mh-vis mh-player${expanded ? ' mh-expanded' : ''}`} data-vis="mouse-hole" aria-label={`老鼠进洞演示：${group}`}>
    <header><span>{matrix ? '让一个候选值，走完一次 DP 转移' : '看见选择发生，也看见如何反悔'}</span><button className="mh-expand-icon" type="button" aria-label={expanded ? '缩小演示' : '放大演示'} title={expanded ? '缩小演示（Esc）' : '放大演示'} aria-expanded={expanded} onClick={() => setExpanded(v => !v)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={expanded ? 'M3 9h6V3m12 12h-6v6M3 3l6 6m12 12-6-6' : 'M8 3H3v5m13 13h5v-5M3 3l7 7m11 11-7-7'} /></svg></button></header>
    <div className="mh-body">
      <div className="mh-tabs">{cases.map((c, i) => <button type="button" key={c.id} aria-pressed={i === index} onClick={() => switchCase(i)}>{c.title}</button>)}</div>
      <div className="mh-inputs"><span>鼠：{current.mice.map((x, i) => `M${i + 1}=${x}`).join('，')}</span><span>洞：{current.holes.map((x, i) => `H${i + 1}=${x}`).join('，')}</span>{current.capacities && <span>容量：{current.capacities.join('，')}</span>}{current.weights && <span>{group === 'profit' ? '收益参数' : '单位附加费'}：{current.weights.join('，')}</span>}</div>
      <div className="mh-toolbar">
        <div className="mh-controls">
          <button type="button" disabled={!player.index && player.phase < 0} onClick={() => send('back')}>← 上一步</button>
          <button type="button" className="mh-next" disabled={finished} onClick={() => send(running ? 'pause' : 'play')}>{running ? '暂停' : player.paused ? '继续播放' : '播放'}</button>
          <button type="button" disabled={running || finished} onClick={() => send('next')}>下一步 →</button>
          <button type="button" onClick={reset}>重置</button>
          <label>速度 <select aria-label="动画速度" value={speed} onChange={e => setSpeed(Number(e.target.value))}>{[.5, 1, 2, 4].map(v => <option key={v} value={v}>{v}×</option>)}</select></label>
        </div>
        <small>动作 {player.index + (player.phase >= 0 ? 1 : 0)} / {timeline.actions.length}{finished ? ' · 已完成' : player.paused ? ' · 已暂停' : ''}</small>
      </div>
      <div className="mh-phase-track">{(action?.phases ?? timeline.actions.at(-1)?.phases ?? []).map((p, i) => <span key={i} className={player.phase === i ? 'current' : i < player.phase ? 'done' : ''}><i>{i + 1}</i>{({ focus: '定位', travel: '移动', take: '取放', compare: '比较', commit: '落定', settle: '收束' })[p.kind]}</span>)}</div>
      <div className="mh-stage">
        <div className="mh-stage-main">
          <div className="mh-tabs mh-view">
            {table && <><button type="button" aria-pressed={matrix} onClick={() => switchMode(false)}>DP 转移</button>{current.mode === 'capacityDP' && <button type="button" aria-pressed={!matrix} onClick={() => switchMode(true)}>匹配过程</button>}</>}
            {!matrix && <><button type="button" aria-pressed={view === 'matching'} onClick={() => setView('matching')}>匹配图</button>{frame.network && <button type="button" aria-pressed={view === 'network'} onClick={() => setView('network')}>残量网络</button>}{['flow', 'capacityDP', 'prune'].includes(current.mode) && <button type="button" aria-pressed={view === 'line'} onClick={() => setView('line')}>数轴网络</button>}</>}
          </div>
          {matrix ? <MouseHoleDPMatrix key={current.id} table={table} state={state} cue={cue} progress={progress} running={running} paused={player.paused} speed={speed} inspected={inspected} onInspect={setInspected} /> : <>
            <MouseHoleMotionGraph key={`${current.id}-${view}`} graph={graph} cue={cue} progress={progress} example={current} view={view} paused={player.paused} speed={speed} />
            <div className="mh-legend"><span><i className="mh-mouse" />鼠</span><span><i className="mh-hole" />洞</span><span>紫色 → 接入／试走</span><span>粉色 − 撤销</span></div>
            <small>{current.mode === 'tree' ? '输入为顶点编号，边上为长度。' : '输入为真实坐标；同坐标节点轻微错开。'}{view === 'line' ? '光点沿接入边和相邻坐标道路移动；粉色路径表示撤销原流量。' : '黄圈跟随当前处理对象。'}</small>
            <StateRack states={frame.state} cue={cue} progress={progress} />
          </>}
        </div>
        <aside className="mh-stage-aside">
          <div className="mh-step" role="status" aria-live="polite"><small>{inspected ? '暂停核对' : finished ? '演示结束' : player.index || player.phase >= 0 ? '正在发生' : '准备观察'}</small><strong>{inspected ? `${table.symbol}(${cell.row},${cell.col}) = ${dpDisplay(value)}` : cue?.title ?? '先看输入，点击播放或下一步'}</strong><p>{inspected ? '这里只列出已经演示过的来源，不提前揭示后续转移。' : cue?.text ?? (frame.text || '播放会连续演示；下一步只走完一个动作。随时可以暂停、回退或重置。')}</p></div>
          {!inspected && cue?.formula && <Formula value={cue.formula} />}
          {matrix ? <>
            {cell && <div className="mh-totals">目标 {table.symbol}({cell.row},{cell.col})<b>{dpDisplay(value)}</b><small>{state.settled.includes(`${cell.row}:${cell.col}`) ? '全部来源已比较' : '尚在比较，数值未最终确认'}</small></div>}
            {cue?.edge && !inspected && <div className={`mh-verdict ${cue.outcome ?? ''}`}><span>{DP_TRANSITIONS[cue.edge.type].label}{table.symbol === 'F' ? ` · k=${cue.edge.count}` : ''}</span><strong>候选 {cue.edge.candidate}</strong><small>{cue.outcome === 'accept' ? '✓ 更小，采纳' : cue.outcome === 'tie' ? '= 并列最优' : cue.outcome === 'reject' ? '× 更大，保留原值' : '先传递候选，再决定是否更新'}</small></div>}
            {inspected && <ul className="mh-incoming">{incoming.map(e => <li key={e.id} style={{ borderColor: DP_TRANSITIONS[e.type].color }}>{table.symbol}({e.row - 1},{e.from}) + ({e.delta}) = {e.candidate}{e.candidate === value ? ' ✓ 当前最小' : ''}</li>)}</ul>}
            {finished && <div className="mh-group">答案格：{table.symbol}({table.rows.length - 1},{table.target}) = {dpDisplay(state.values.at(-1)[table.columns.indexOf(table.target)])}</div>}
          </> : <>
            <div className="mh-totals"><small>{group === 'profit' ? '已确认收益' : group === 'heap' ? '基准费用（含虚拟项）' : '已落定费用'}</small><b key={frame.total}>{frame.total === null ? '不可达' : frame.total}</b>{cue?.delta !== undefined && <small>本次落定增量：{cue.delta > 0 ? '+' : ''}{cue.delta}</small>}</div>
            {frame.comparison && <div className="mh-group">锁定旧匹配：{frame.comparison.locked}<br />允许反悔：{frame.comparison.revised}</div>}
            {frame.groups?.map(g => <div className="mh-group" key={`${g.from}-${g.to}`}><strong>H{g.from + 1} → H{g.to + 1}</strong><p>{g.count} 个等权项合并计算</p><Formula value={`${g.count}\\times(${g.unit})=${g.count * g.unit}`} /></div>)}
            {finished && <small>{frame.feasible === false ? '不能完成原题要求：无解。' : '本案例已走完，可回退核对每次改动。'}</small>}
          </>}
        </aside>
      </div>
      {!matrix && (frame.network || graph.facts) && <details><summary>核对当前残量边与费用</summary><div className="mh-table"><table><thead><tr><th>方向</th><th>容量</th><th>费用</th></tr></thead><tbody>{(view === 'line' ? graph.facts : frame.network?.arcs.filter(a => a.cap > 0) ?? []).map(a => <tr key={a.id}><td>{a.direction ?? `${a.u} → ${a.v}`}</td><td>{a.cap}</td><td>{a.cost}</td></tr>)}</tbody></table></div></details>}
      {table && current.mode === 'capacityDP' && <small>“DP 转移”和“匹配过程”是两条独立演示路线，切换时从输入重新开始。</small>}
    </div>
  </section>;
  return expanded ? createPortal(content, document.body) : content;
}
