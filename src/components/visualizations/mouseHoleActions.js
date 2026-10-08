import { pairCost } from './mouseHoleModel.js';

const copy = x => structuredClone(x);
const sum = (c, pairs) => pairs.reduce((v, [i, j]) => v + pairCost(c, i, j), 0);
const samePair = (a, b) => a[0] === b[0] && a[1] === b[1];
const name = id => /^[mh]\d+$/.test(id) ? `${id[0].toUpperCase()}${Number(id.slice(1)) + 1}` : id;
const phase = (kind, title, frame, extra = {}) => ({ kind, title, frame: copy(frame), duration: kind === 'travel' ? 1100 : 750, ...extra });

// Reconstruct a legal partial flow while changing pairs, rather than displaying
// a used hole twice. Coverage rewards are bookkeeping, not physical distance.
export function residualForPairs(network, pairs) {
  if (!network) return undefined;
  const net = copy(network), supplied = new Map(), drained = new Map();
  pairs.forEach(([i, j]) => { supplied.set(`m${i}`, (supplied.get(`m${i}`) ?? 0) + 1); drained.set(`h${j}`, (drained.get(`h${j}`) ?? 0) + 1); });
  for (const a of net.arcs.filter(e => e.forward)) {
    let flow = 0;
    if (a.pair) flow = pairs.some(p => samePair(p, a.pair)) ? 1 : 0;
    else if (a.u === 'S') { flow = Math.min(a.initial, supplied.get(a.v) ?? 0); supplied.set(a.v, (supplied.get(a.v) ?? 0) - flow); }
    else if (a.v === 'T') { flow = Math.min(a.initial, drained.get(a.u) ?? 0); drained.set(a.u, (drained.get(a.u) ?? 0) - flow); }
    a.cap = a.initial - flow; net.arcs[a.reverse].cap = flow;
  }
  return net;
}

function changedItems(before, after) {
  const diff = (a, b) => { const remaining = [...b]; return a.filter(x => { const k = remaining.indexOf(x); if (k < 0) return true; remaining.splice(k, 1); return false; }); };
  const names = [...new Set([...before, ...after].map(s => s.name))];
  return names.map(n => {
    const a = before.find(s => s.name === n)?.items ?? [], b = after.find(s => s.name === n)?.items ?? [];
    return { name: n, removed: diff(a, b), added: diff(b, a) };
  }).filter(s => s.removed.length || s.added.length);
}

export function buildGraphActions(c, frames) {
  const initial = copy(frames[0]), actions = []; let current = initial;
  function append(label, phases, after) { actions.push({ label, phases, after: copy(after) }); current = copy(after); }
  function editPair(pair, remove, target) {
    const [i, j] = pair, u = remove ? `h${j}` : `m${i}`, v = remove ? `m${i}` : `h${j}`;
    const before = copy(current), delta = (remove ? -1 : 1) * pairCost(c, i, j);
    before.active = [u, v]; before.path = []; before.complete = false;
    const after = copy(before);
    after.pairs = remove ? after.pairs.filter(p => !samePair(p, pair)) : [...after.pairs, pair];
    after.total = sum(c, after.pairs); after.delta = delta;
    after.network = residualForPairs(target.network, after.pairs);
    if (c.mode !== 'stack') after.state = [{ name: '已落定的匹配', items: after.pairs.map(([a, b]) => `M${a + 1} → H${b + 1}`) }];
    after.formula = `C=${before.total}+(${delta})=${after.total}`;
    after.text = '增广／改配尚在进行：先解除旧占用，再接入新匹配；最后确认整组方案。';
    const title = remove ? `撤销 M${i + 1} → H${j + 1}` : `让 M${i + 1} 进入 H${j + 1}`;
    const cue = { edge: { u, v, remove }, focus: [u], delta };
    append(title, [
      phase('focus', remove ? '找到要撤销的旧匹配' : '选中这只鼠和目标洞', before, { ...cue, text: remove ? '旧匹配暂时保留。先认清退回的是哪一笔费用。' : '先看起点，再看目标；此时总费用还没有变化。' }),
      phase('travel', title, before, { ...cue, text: remove ? '沿反向移动，撤销旧匹配。' : '沿匹配边走向目标洞。', formula: `\\Delta=${remove ? '-' : '+'}(${pairCost(c, i, j)})=${delta}` }),
      phase('commit', remove ? '解除占用，退回旧费用' : '匹配落定，计入新费用', after, { focus: [v], delta, text: after.text, formula: after.formula }),
    ], after);
  }
  for (let fi = 1; fi < frames.length; fi++) {
    const target = frames[fi];
    if (target.path.length) {
      const before = { ...copy(current), active: [], path: [], network: copy(target.network), complete: false };
      const phases = [phase('focus', '从新需求出发，寻找可行的增广路', before, { focus: [target.path[0].v], text: '一段一段检查路径，暂不改变匹配与总费用。' })];
      let cost = 0;
      target.path.forEach(a => {
        cost += a.cost;
        phases.push(phase('travel', `${name(a.u)} → ${name(a.v)}${a.forward ? '' : '：反向撤销边'}`, before, {
          edge: { u: a.u, v: a.v, remove: !a.forward }, focus: [a.u],
          formula: `\\Delta_{path}=${cost - a.cost}+(${a.cost})=${cost}`,
          text: c.mode === 'cover' ? '这里累计含覆盖奖励的路径费用；真实距离会在匹配落定时单独记账。' : '这只是路径费用的试算，还不是已经支付的总费用。',
        }));
      });
      append('寻找并走过增广路', phases, before);
      continue;
    }
    if (c.mode === 'stack' && target.pairs.length > current.pairs.length) {
      const changes = changedItems(current.state, target.state), before = copy(current);
      const after = { ...copy(current), state: copy(target.state), active: copy(target.active) };
      append('从栈顶取出最近的左洞', [
        phase('take', '先取出栈顶，再执行匹配', before, { focus: target.active, changes, text: '标记栈顶洞；取出后它不再是其他老鼠的候选。' }),
        phase('commit', '栈顶已弹出', after, { focus: target.active, changes, text: '还没有支付距离费用，接下来沿边完成匹配。' }),
      ], after);
    }
    const canEdit = ['flow', 'cover', 'capacityDP', 'stack'].includes(c.mode);
    if (canEdit) {
      const removed = current.pairs.filter(p => !target.pairs.some(q => samePair(p, q)));
      const added = target.pairs.filter(p => !current.pairs.some(q => samePair(p, q)));
      // Removal first avoids a temporary double occupancy of unit-capacity holes.
      removed.forEach(p => editPair(p, true, target));
      added.forEach(p => editPair(p, false, target));
    }
    const changes = changedItems(current.state, target.state);
    const focus = target.active.filter(id => !['S', 'T'].includes(id));
    const before = { ...copy(current), active: focus, complete: false };
    const phases = [phase('focus', target.title, before, { focus, text: target.text })];
    if (changes.length && !['flow', 'cover', 'capacityDP'].includes(c.mode)) {
      phases.push(phase('take', '观察候选的取出与放入', before, { focus, changes, text: '先定位变化的元素；彩色标记指出要取出和新加入的项。' }));
      phases.push(phase('compare', '计算这次操作的增量', before, { focus, changes, formula: target.formula, text: '先算差价，再改变候选结构和累计值。' }));
    }
    phases.push(phase('commit', target.complete ? '确认最终结果' : '本轮操作完成', target, { focus, changes, formula: target.formula, text: target.text }));
    append(target.title, phases, target);
  }
  return { initial, actions };
}

export function buildDPActions(table, frames) {
  const initial = { values: table.rows.map((r, i) => i === 0 ? [...r.values] : r.values.map(() => null)), seen: [], settled: table.columns.map(col => `0:${col}`), logical: 0 };
  let state = copy(initial); const actions = [];
  for (let row = 1; row < table.rows.length; row++) {
    for (const col of table.columns) {
      const k = table.columns.indexOf(col), incoming = table.edges.filter(e => e.row === row && e.to === col);
      if (!incoming.length) {
        const before = copy(state); state.values[row][k] = Infinity; state.settled.push(`${row}:${col}`);
        actions.push({ label: `检查 ${table.symbol}(${row},${col})`, phases: [
          phase('focus', '这个格子有可达的来源吗？', before, { cell: { row, col }, text: '检查上一行；没有可达状态能够合法转移到这里。' }),
          phase('commit', '标记为不可达', state, { cell: { row, col }, text: '写入 +∞，再考虑下一格。', formula: `${table.symbol}_{${row}}(${col})=+\\infty` }),
        ], after: copy(state) });
        continue;
      }
      incoming.forEach((edge, ei) => {
        const before = copy(state), prior = state.values[row][k] ?? Infinity;
        const source = state.values[row - 1][table.columns.indexOf(edge.from)];
        const outcome = edge.candidate < prior ? 'accept' : edge.candidate === prior ? 'tie' : 'reject';
        const carrying = copy(state); carrying.seen.push(edge.id);
        state = copy(carrying); state.values[row][k] = Math.min(prior, edge.candidate);
        if (ei === incoming.length - 1) state.settled.push(`${row}:${col}`);
        const expr = `${source}+(${edge.delta})=${edge.candidate}`;
        actions.push({ label: `${table.symbol}(${row - 1},${edge.from}) → ${table.symbol}(${row},${col})`, phases: [
          phase('focus', '选中来源格', before, { edge, cell: { row, col }, text: `从 ${table.symbol}(${row - 1},${edge.from}) 取出 ${source}；目标格当前最优为 ${Number.isFinite(prior) ? prior : '+∞'}。` }),
          phase('travel', '沿转移边送入候选值', carrying, { edge, cell: { row, col }, formula: expr, text: `加上这条边的增量 ${edge.delta}，把候选值 ${edge.candidate} 送到目标格。` }),
          phase('compare', '与目标格当前最优值比较', carrying, { edge, cell: { row, col }, outcome, prior, formula: `${edge.candidate}${outcome === 'accept' ? '<' : outcome === 'tie' ? '=' : '>'}${Number.isFinite(prior) ? prior : '+\\infty'}`, text: outcome === 'accept' ? '候选值更小，可以改写目标格。' : outcome === 'tie' ? '同样最优，保留这条来源；数值不用改变。' : '候选值更大，拒绝这次更新；原值保持不变。' }),
          phase('commit', outcome === 'accept' ? '采纳：更新目标格' : outcome === 'tie' ? '并列：保留两条来源' : '拒绝：目标格不变', state, { edge, cell: { row, col }, outcome, formula: `${table.symbol}_{${row}}(${col})=${state.values[row][k]}`, text: ei === incoming.length - 1 ? '这个格子的所有合法来源都比较完了。' : '这一格还有其他来源，继续比较。' }),
        ], after: copy(state) });
      });
    }
    state.logical = row;
    actions.push({ label: `第 ${row} 行完成`, phases: [phase('settle', '这一行计算完成', state, { text: '只在所有候选都处理后确认这一行。接下来把它作为新一行的来源。', formula: frames[row].formula })], after: copy(state) });
  }
  return { initial, actions };
}

export const playerInitial = { index: 0, phase: -1, progress: 0, auto: false, paused: false };
export function reducePlayer(state, event) {
  switch (event.type) {
    case 'reset': return { ...playerInitial };
    case 'back': return { ...playerInitial, index: Math.max(0, state.index - (state.phase < 0 ? 1 : 0)) };
    case 'next': return state.phase >= 0 ? state.paused ? { ...state, auto: false, paused: false } : state : state.index >= event.length ? state : { ...state, phase: 0, progress: 0, auto: false, paused: false };
    case 'play': return state.phase >= 0 ? { ...state, auto: true, paused: !state.paused } : state.index >= event.length ? state : { ...state, phase: 0, progress: 0, auto: true, paused: false };
    case 'pause': return { ...state, paused: true, auto: false };
    case 'tick': {
      if (state.phase < 0 || state.paused) return state;
      const progress = state.progress + event.delta;
      if (progress < 1) return { ...state, progress };
      if (state.phase + 1 < event.phases) return { ...state, phase: state.phase + 1, progress: 0 };
      const index = state.index + 1;
      return { ...state, index, phase: state.auto && index < event.length ? 0 : -1, progress: 0, auto: state.auto && index < event.length, paused: false };
    }
    default: return state;
  }
}
