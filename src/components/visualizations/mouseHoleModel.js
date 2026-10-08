import catalog from '../../data/graphs/MouseHole-Cases.json' with { type: 'json' };

export const MOUSE_HOLE_CASES = catalog.cases;
export const GRAPH_STYLE = catalog;
const clone = value => structuredClone(value);
const tex = value => Number.isFinite(value) ? String(value) : '+\\infty';
const weight = (c, j) => c.weights?.[j] ?? 0;
const capacity = (c, j) => c.capacities?.[j] ?? 1;
export const pairCost = (c, i, j) => Math.abs(c.mice[i] - c.holes[j]) + weight(c, j);
const events = c => [
  ...c.mice.map((x, i) => ({ kind: 'mouse', x, i, id: `m${i}` })),
  ...c.holes.map((x, i) => ({ kind: 'hole', x, i, id: `h${i}` })),
].sort((a, b) => a.x - b.x || (a.kind === b.kind ? a.i - b.i : a.kind === 'hole' ? -1 : 1));
const base = (title = '先观察输入，再点击下一步') => ({ title, text: '', formula: '', pairs: [], total: 0, delta: 0, active: [], processed: [], state: [], path: [], complete: false });
const save = (frames, frame) => frames.push(clone(frame));
const pairId = ([i, j]) => `p${i}-${j}`;

export function stackTrace(c) {
  const frames = [base()], stack = [], f = base();
  for (const e of events(c)) {
    f.active = [e.id]; f.processed.push(e.id); f.delta = 0;
    if (e.kind === 'hole') {
      stack.push(e.i); f.title = `洞 H${e.i + 1} 入栈`;
      f.formula = `\\text{push}(${e.x})`;
      f.text = '从左到右扫描，栈顶是坐标最大的可用左洞。';
    } else if (!stack.length) {
      f.title = '没有可用的左洞：无解'; f.formula = 'f=+\\infty'; f.feasible = false;
      f.text = '后面的洞在右侧，不能补救这只鼠。'; f.complete = true; save(frames, f); return frames;
    } else {
      const j = stack.pop(), delta = e.x - c.holes[j];
      f.pairs.push([e.i, j]); f.delta = delta; f.total += delta;
      f.title = `鼠 M${e.i + 1} 取栈顶 H${j + 1}`;
      f.formula = `\\Delta=x_i-y_j=${e.x}-(${c.holes[j]})=${delta}`;
      f.text = '保留更左的洞，给后面坐标更大的老鼠使用。';
    }
    f.state = [{ name: '可用左洞（左边为栈底）', items: stack.map(j => `H${j + 1}: ${c.holes[j]}`) }];
    save(frames, f);
  }
  frames.at(-1).complete = true; frames.at(-1).feasible = true;
  return frames;
}

// Exact signed frontier DP. j>0: reserved holes; j<0: waiting mice.
export function signedDPTrace(c) {
  const frames = [base()], f = base(); let dp = new Map([[0, 0]]);
  frames[0].state = [{ name: 'f₀(j)', items: ['j=0: 0；其余不可达'] }];
  for (const e of events(c)) {
    const next = new Map();
    const relax = (j, v) => next.set(j, Math.min(next.get(j) ?? Infinity, v));
    for (const [j, v] of dp) {
      if (e.kind === 'mouse') relax(j - 1, v + (j - 1 >= 0 ? e.x : -e.x));
      else { relax(j, v); relax(j + 1, v + (j + 1 <= 0 ? e.x : -e.x)); }
    }
    f.title = `${e.kind === 'mouse' ? '鼠' : '洞'} ${e.x}：更新整行 DP`;
    f.formula = e.kind === 'mouse'
      ? `f_i(j)=f_{i-1}(j+1)+\\begin{cases}${e.x}&j\\ge0\\\\-(${e.x})&j<0\\end{cases}`
      : `f_i(j)=\\min\\!\\left(f_{i-1}(j),f_{i-1}(j-1)+\\begin{cases}${e.x}&j\\le0\\\\-(${e.x})&j>0\\end{cases}\\right)`;
    f.active = [e.id]; f.processed.push(e.id); f.total = next.get(0) ?? null;
    f.text = 'j≠0 时含有尚未闭合的端点贡献，不是完整方案费用。f(0) 不可达不代表整个输入无解。';
    f.state = [{ name: '当前 fᵢ(j)', items: [...next].sort((a, b) => a[0] - b[0]).map(([j, v]) => `j=${j}: ${v}`) }];
    f.dp = [...next]; save(frames, f); dp = next;
  }
  frames.at(-1).complete = true; frames.at(-1).feasible = dp.has(0);
  return frames;
}

// Unit-capacity, zero-fee two-heap recurrence; sorted arrays expose the heap contents.
export function heapTrace(c) {
  const n = c.mice.length, all = [...c.mice, ...c.holes];
  const low = Math.min(0, ...all), high = Math.max(0, ...all);
  const virtualY = low - (n + 1) * (high - low + 1);
  const qHole = Array(n).fill(-virtualY), qMouse = [], frames = [base()], f = base();
  frames[0].text = `放入 ${n} 个坐标为 ${virtualY} 的虚拟洞，仅用于保证前缀可处理；不是物理输入。`;
  frames[0].state = [{ name: 'Q_H 小根堆', items: qHole.map(String) }, { name: 'Q_M 小根堆', items: [] }];
  for (const e of events(c)) {
    qHole.sort((a, b) => a - b); qMouse.sort((a, b) => a - b);
    f.active = [e.id]; f.processed.push(e.id); f.delta = 0;
    if (e.kind === 'mouse') {
      const a = qHole.shift(); f.delta = a + e.x; qMouse.push(-2 * e.x - a);
      f.title = `处理鼠 ${e.x}，生成反悔项`;
      f.formula = `\\Delta=${e.x}+(${a})=${f.delta},\\quad q_M=-2\\cdot(${e.x})-(${a})=${-2 * e.x - a}`;
    } else if (qMouse.length && qMouse[0] + e.x < 0) {
      const b = qMouse.shift(); f.delta = b + e.x; qHole.push(-b - 2 * e.x);
      f.title = `洞 ${e.x} 改善已有方案`;
      f.formula = `\\Delta=(${b})+${e.x}=${f.delta},\\quad q_H=-(${b})-2\\cdot${e.x}=${-b - 2 * e.x}`;
    } else {
      qHole.push(-e.x); f.title = `洞 ${e.x} 留给后续老鼠`;
      f.formula = `q_H=-(${e.x})=${-e.x}`;
    }
    qHole.sort((a, b) => a - b); qMouse.sort((a, b) => a - b); f.total += f.delta;
    f.text = '堆中的数是边际费用，不是物理坐标。当前基准费用可能包含虚拟洞；仅扫描结束且有解时才是原题答案。';
    f.state = [{ name: 'Q_H 小根堆', items: qHole.map(String) }, { name: 'Q_M 小根堆', items: qMouse.map(String) }];
    save(frames, f);
  }
  frames.at(-1).complete = true; frames.at(-1).feasible = c.holes.length >= n;
  return frames;
}

// Exact small witness reconstruction for the profit demo only, not its heap algorithm.
function profitWitness(c, mouseIds, holeIds) {
  let best = 0, pairs = [];
  function dfs(k, used, score, current) {
    if (k === mouseIds.length) { if (score > best) { best = score; pairs = clone(current); } return; }
    const i = mouseIds[k]; dfs(k + 1, used, score, current);
    for (const j of holeIds) if (!used.has(j) && c.holes[j] <= c.mice[i]) {
      used.add(j); current.push([i, j]);
      dfs(k + 1, used, score + c.mice[i] - c.holes[j] + weight(c, j), current);
      current.pop(); used.delete(j);
    }
  }
  dfs(0, new Set(), 0, []); return pairs;
}

export function profitTrace(c) {
  const frames = [base()], f = base(), heap = [], mice = [], holes = [];
  for (const e of events(c)) {
    f.active = [e.id]; f.processed.push(e.id); f.delta = 0;
    if (e.kind === 'hole') {
      holes.push(e.i); const a = weight(c, e.i) - e.x; heap.push(a);
      f.title = `洞 H${e.i + 1}：插入边际收益`;
      f.formula = `w_j-y_j=${weight(c, e.i)}-(${e.x})=${a}`;
    } else {
      mice.push(e.i); heap.sort((a, b) => b - a); const a = heap[0];
      if (a !== undefined && a + e.x > 0) {
        heap.shift(); heap.push(-e.x); f.delta = a + e.x;
        f.title = `鼠 M${e.i + 1}：收益增加 ${f.delta}`;
        f.formula = `\\Delta=\\max(0,${a}+${e.x})=${f.delta},\\quad \\text{push}(-${e.x})`;
      } else {
        f.title = `鼠 M${e.i + 1}：暂时不选`;
        f.formula = a === undefined ? '\\Delta=0\\quad(\\text{heap is empty})' : `\\Delta=\\max(0,${a}+${e.x})=0`;
      }
    }
    heap.sort((a, b) => b - a); f.total += f.delta;
    f.pairs = profitWitness(c, mice, holes);
    f.text = '堆为差分序列的大根堆；替换项 −x 记录把机会留给更右侧老鼠的可能。图展示当前前缀的一组最优匹配。';
    f.state = [{ name: '差分 d（从大到小）', items: heap.map(String) }]; save(frames, f);
  }
  frames.at(-1).complete = true; frames.at(-1).feasible = true; return frames;
}

// Ordered block DP: O(m n²) for the tiny demos. Capacities are never expanded.
export function capacityDPTrace(c) {
  const mi = c.mice.map((_, i) => i).sort((a, b) => c.mice[a] - c.mice[b]);
  const hj = c.holes.map((_, j) => j).sort((a, b) => c.holes[a] - c.holes[b]);
  const n = mi.length, frames = [base()], f = base();
  let dp = Array(n + 1).fill(Infinity), paths = Array.from({ length: n + 1 }, () => []); dp[0] = 0;
  for (const j of hj) {
    const next = Array(n + 1).fill(Infinity), nextPaths = Array.from({ length: n + 1 }, () => []), choices = [];
    for (let r = 0; r <= n; r++) {
      let block = 0;
      for (let k = 0; k <= Math.min(capacity(c, j), r); k++) {
        if (k) block += pairCost(c, mi[r - k], j);
        if (dp[r - k] + block < next[r]) {
          next[r] = dp[r - k] + block; choices[r] = k;
          nextPaths[r] = [...paths[r - k], ...mi.slice(r - k, r).map(i => [i, j])];
        }
      }
    }
    let r = n; while (r > 0 && !Number.isFinite(next[r])) r--;
    const k = choices[r] ?? 0, block = mi.slice(r - k, r).reduce((s, i) => s + pairCost(c, i, j), 0);
    const before = f.pairs; f.pairs = nextPaths[r]; f.delta = next[r] - f.total; f.total = next[r];
    f.title = `加入洞 H${j + 1}：容量 ${capacity(c, j)}，单位费用 ${weight(c, j)}`;
    f.formula = `F(j,${r})=F(j-1,${r - k})+${block}=${tex(dp[r - k])}+${block}=${next[r]}`;
    f.text = `当前展示前 ${r} 只鼠的最优方案；容量按数值保存，没有展开成 ${capacity(c, j)} 个洞。此模块用块 DP 核对匹配，不冒充堆的执行轨迹。`;
    f.active = [`h${j}`]; f.processed.push(`h${j}`, ...mi.slice(0, r).map(i => `m${i}`));
    f.groups = [];
    const oldHole = new Map(before), buckets = new Map();
    for (const [i, to] of f.pairs) {
      const from = oldHole.get(i);
      if (from !== undefined && from !== to && c.mice[i] <= Math.min(c.holes[from], c.holes[to])) {
        const key = `${from}-${to}`; const g = buckets.get(key) ?? { from, to, count: 0, key: -c.holes[from] - weight(c, from), unit: c.holes[to] + weight(c, to) - c.holes[from] - weight(c, from) };
        g.count++; buckets.set(key, g);
      }
    }
    f.groups = [...buckets.values()];
    f.state = [{ name: 'F(j,i)：前 i 只鼠', items: next.map((v, i) => `${i}: ${Number.isFinite(v) ? v : '不可达'}`) },
      { name: '洞的已用／容量', items: hj.filter(t => f.processed.includes(`h${t}`)).map(t => `H${t + 1}: ${f.pairs.filter(p => p[1] === t).length}/${capacity(c, t)}`) }];
    f.dp = next; save(frames, f); dp = next; paths = nextPaths;
  }
  frames.at(-1).complete = true; frames.at(-1).feasible = Number.isFinite(dp[n]);
  if (!Number.isFinite(dp[n])) { frames.at(-1).title = '容量不足：不能匹配所有老鼠'; frames.at(-1).total = null; }
  return frames;
}

export function directionalSelection(c, direction) {
  const ids = c.mice.map((_, i) => i).sort((a, b) => direction * (c.mice[a] - c.mice[b]));
  const remaining = c.holes.map((_, j) => capacity(c, j)), pairs = [];
  for (const i of ids) {
    const candidates = c.holes.map((_, j) => j).filter(j => remaining[j] > 0 && direction * (c.mice[i] - c.holes[j]) >= 0);
    candidates.sort((a, b) => pairCost(c, i, a) - pairCost(c, i, b) || a - b);
    if (candidates.length) { const j = candidates[0]; remaining[j]--; pairs.push([i, j]); }
  }
  return { pairs, used: remaining.map((v, j) => capacity(c, j) - v) };
}

function pruneTrace(c) {
  const left = directionalSelection(c, 1), right = directionalSelection(c, -1);
  const kept = left.used.map((v, j) => Math.min(capacity(c, j), v + right.used[j]));
  return [base(), ...[left, right].map((s, k) => ({ ...base(k === 0 ? '只向左：只选到便宜洞' : '只向右：仍只选到同一个便宜洞'), pairs: s.pairs, total: s.pairs.reduce((sum, [i, j]) => sum + pairCost(c, i, j), 0), formula: k === 0 ? 'L_j=\\text{left usage}' : 'R_j=\\text{right usage}', state: [{ name: '各洞使用次数', items: s.used.map((v, j) => `H${j + 1}: ${v}`) }], text: '单向扫描允许暂时匹配不到；这只是待检验的筛洞步骤。' })),
    { ...base('筛选后容量不足：这个推广不成立'), pairs: [], total: null, complete: true, feasible: false, formula: `\\sum_j\\min(b_j,L_j+R_j)=${kept.reduce((a, b) => a + b, 0)}<${c.mice.length}`, text: '原题有解；加上费用后，这种筛选却删掉了不可缺少的贵洞。', state: [{ name: '筛后容量', items: kept.map((v, j) => `H${j + 1}: ${v}`) }] }];
}

// Tiny exact residual network, separate from the optimized heap demonstrations.
export function makeNetwork(c, cover = false) {
  const n = c.mice.length, m = c.holes.length, limit = n + m;
  const nodes = ['S', ...c.mice.map((_, i) => `m${i}`), ...c.holes.map((_, j) => `h${j}`), 'T'];
  const arcs = [], add = (u, v, cap, cost, pair = null) => {
    const id = arcs.length;
    arcs.push({ id, u, v, cap, cost, initial: cap, reverse: id + 1, pair, forward: true });
    arcs.push({ id: id + 1, u: v, v: u, cap: 0, cost: -cost, initial: 0, reverse: id, pair, forward: false });
  };
  const diameter = Math.max(0, ...c.mice, ...c.holes) - Math.min(0, ...c.mice, ...c.holes);
  const penalty = (limit + 1) * (diameter + 1);
  for (let i = 0; i < n; i++) { add('S', `m${i}`, cover ? 1 : 0, cover ? -penalty : 0); if (cover) add('S', `m${i}`, limit, 0); }
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) add(`m${i}`, `h${j}`, 1, pairCost(c, i, j), [i, j]);
  for (let j = 0; j < m; j++) { add(`h${j}`, 'T', cover ? 1 : capacity(c, j), cover ? -penalty : 0); if (cover) add(`h${j}`, 'T', limit, 0); }
  return { nodes, arcs, penalty };
}

export function shortestResidual(network) {
  const d = new Map(network.nodes.map(v => [v, Infinity])), parent = new Map(); d.set('S', 0);
  for (let pass = 1; pass < network.nodes.length; pass++) {
    let changed = false;
    // Previous mice remain mandatory when a new mouse arrives: do not cancel a
    // source constraint and return to S. An augmenting path ends at T.
    for (const a of network.arcs) if (a.cap > 0 && a.v !== 'S' && a.u !== 'T' && d.get(a.u) + a.cost < d.get(a.v)) {
      d.set(a.v, d.get(a.u) + a.cost); parent.set(a.v, a.id); changed = true;
    }
    if (!changed) break;
  }
  if (!Number.isFinite(d.get('T'))) return null;
  const path = []; let v = 'T';
  while (v !== 'S') { const a = network.arcs[parent.get(v)]; if (!a || path.length > network.nodes.length) throw new Error('Invalid residual path'); path.unshift(a.id); v = a.u; }
  return { path, cost: d.get('T') };
}

function flowTrace(c, cover = false) {
  const net = makeNetwork(c, cover), frames = [base()], f = base();
  frames[0].network = clone(net); frames[0].networkView = true;
  frames[0].text = cover ? `首个单位各奖励 B=${net.penalty}；额外单位无奖励。先覆盖两侧所有点，再比较真实距离。` : '每次加入一只鼠，沿当前残量网络找费用最小的增广路。';
  const arrival = c.mice.map((_, i) => i).sort((a, b) => c.mice[a] - c.mice[b]);
  let rounds = 0;
  while (rounds < (cover ? c.mice.length + c.holes.length : c.mice.length)) {
    if (!cover) {
      const i = arrival[rounds], sourceArc = net.arcs.find(a => a.forward && a.u === 'S' && a.v === `m${i}`);
      sourceArc.cap = 1; sourceArc.initial = 1;
      f.processed.push(`m${i}`);
    }
    const found = shortestResidual(net);
    if (!found || (cover && found.cost >= 0)) break;
    f.title = `第 ${rounds + 1} 次：找到增广路`;
    f.active = found.path.flatMap(id => [net.arcs[id].u, net.arcs[id].v]);
    f.path = found.path.map(id => clone(net.arcs[id])); f.network = clone(net); f.networkView = true;
    f.comparison = null;
    if (!cover && f.path.some(a => a.pair && !a.forward)) {
      const i = arrival[rounds], choices = c.holes.map((_, j) => j).filter(j => f.pairs.filter(p => p[1] === j).length < capacity(c, j));
      const locked = choices.length ? f.total + Math.min(...choices.map(j => pairCost(c, i, j))) : Infinity;
      if (Number.isFinite(locked)) f.comparison = { locked, revised: f.total + found.cost };
    }
    f.formula = `\\Delta_{${cover ? 'B' : 'cost'}}=${f.path.map(a => `(${a.cost})`).join('+')}=${found.cost}`;
    f.text = '紫色箭头是本次路径；负费用反向边表示撤销已付过的费用，不是一条新的负距离道路。';
    f.delta = null; save(frames, f);
    for (const id of found.path) { net.arcs[id].cap--; net.arcs[net.arcs[id].reverse].cap++; }
    const oldTotal = f.total;
    f.pairs = net.arcs.filter(a => a.forward && a.pair && a.cap === 0).map(a => a.pair);
    f.total = f.pairs.reduce((sum, [i, j]) => sum + pairCost(c, i, j), 0); f.delta = f.total - oldTotal;
    f.title = '执行增广：同步更新匹配与反向容量'; f.network = clone(net); f.path = [];
    f.formula = `C_{new}=C_{old}+\\Delta=${oldTotal}+(${f.delta})=${f.total}`;
    f.text = cover ? '这里只累计真实距离；奖励用于保证覆盖，不混进答案。' : '流量增加 1；反向边只撤销旧匹配，不会把一只鼠分配给两个洞。';
    f.state = [{ name: '当前匹配', items: f.pairs.map(([i, j]) => `M${i + 1} → H${j + 1}: ${pairCost(c, i, j)}`) }]; save(frames, f); rounds++;
  }
  const coveredM = new Set(f.pairs.map(p => p[0])), coveredH = new Set(f.pairs.map(p => p[1]));
  const last = frames.at(-1); last.complete = true;
  last.feasible = coveredM.size === c.mice.length && (!cover || coveredH.size === c.holes.length);
  if (!last.feasible) { last.title = '没有可用增广路：原问题无解'; last.text = '不能用当前部分匹配费用冒充所有老鼠的答案。'; }
  return frames;
}

function treeTrace(c) {
  const frames = [base('自建的四点树例子：观察子树候选如何合并')], adj = new Map(c.tree.nodes.map(v => [v.id, []]));
  for (const [u, v, w] of c.tree.edges) { adj.get(u).push([v, w]); adj.get(v).push([u, w]); }
  const f = base(); f.treeView = true; frames[0].treeView = true;
  function visit(u, parent) {
    const ms = c.mice.flatMap((v, i) => v === u ? [{ i, d: 0 }] : []), hs = c.holes.flatMap((v, j) => v === u ? [{ j, d: 0 }] : []);
    for (const [v, w] of adj.get(u)) if (v !== parent) {
      const sub = visit(v, u); ms.push(...sub.ms.map(a => ({ ...a, d: a.d + w }))); hs.push(...sub.hs.map(a => ({ ...a, d: a.d + w })));
    }
    f.active = [`v${u}`]; f.processed.push(`v${u}`); f.title = `在顶点 ${u} 合并子树候选`;
    f.formula = '\\operatorname{key}_{parent}=\\operatorname{key}_{child}+\\ell';
    f.text = '列表仅表示候选到当前根的距离，不是“在每个子树随便就近配对”的完整算法。';
    f.state = [{ name: `鼠候选（到 ${u} 的距离）`, items: ms.map(a => `M${a.i + 1}: ${a.d}`).sort() }, { name: `洞候选（到 ${u} 的距离）`, items: hs.map(a => `H${a.j + 1}: ${a.d}`).sort() }]; save(frames, f); return { ms, hs };
  }
  visit(c.tree.root, null);
  // Balanced tree example: cut balance uniquely determines necessary transport.
  let answer = 0; const cuts = [];
  function balance(u, p) { let b = c.mice.filter(v => v === u).length - c.holes.filter(v => v === u).length;
    for (const [v, w] of adj.get(u)) if (v !== p) { const s = balance(v, u); cuts.push({ u, v, flow: s, w }); answer += Math.abs(s) * w; b += s; } return b; }
  const b = balance(c.tree.root, null);
  f.title = '这个供需相等的例子：按割统计费用'; f.formula = `C=\\sum_e |s_e|\\ell_e=${cuts.map(a => `${Math.abs(a.flow)}\\cdot${a.w}`).join('+')}=${answer}`;
  f.total = answer; f.cuts = cuts; f.complete = true; f.feasible = b === 0;
  f.text = '本例每个鼠、洞恰好使用一次，边两侧的供需差确定净流量；有多余洞时不能直接套这个公式。'; save(frames, f); return frames;
}

export function buildMouseHoleTrace(c) {
  switch (c.mode) {
    case 'stack': return stackTrace(c);
    case 'signedDP': return signedDPTrace(c);
    case 'heap': return heapTrace(c);
    case 'profit': return profitTrace(c);
    case 'capacityDP': return capacityDPTrace(c);
    case 'cover': return flowTrace(c, true);
    case 'prune': return pruneTrace(c);
    case 'tree': return treeTrace(c);
    default: return flowTrace(c);
  }
}

export function mouseHoleGraph(c, f, view = 'matching') {
  if (view === 'line') return lineNetworkGraph(c, f);
  const { layout, nodesStyle, edgesStyle } = catalog;
  const nodeStyle = (id, kind) => ({ ...nodesStyle, type: kind === 'hole' ? 'square' : 'circle', fill: f.active.includes(id) ? '#fde047' : kind === 'hole' ? '#c4b5fd' : '#86efac' });
  if (c.mode === 'tree') return { width: layout.width, height: layout.height, nodesStyle, edgesStyle,
    nodes: c.tree.nodes.map(v => ({ ...v, id: `v${v.id}`, label: `${v.id}${c.mice.includes(v.id) ? ' 鼠' : ''}${c.holes.includes(v.id) ? ' 洞' : ''}`, style: nodeStyle(`v${v.id}`, c.holes.includes(v.id) ? 'hole' : 'mouse') })),
    edges: c.tree.edges.map(([u, v, w], i) => ({ id: `t${i}`, source: `v${u}`, target: `v${v}`, label: `${w}`, style: { ...edgesStyle, stroke: f.cuts?.some(a => a.u === u && a.v === v && a.flow !== 0) ? '#8b5cf6' : '#0ea5e9' } })) };
  const all = [...c.mice, ...c.holes], low = Math.min(...all), high = Math.max(...all);
  const x = value => layout.margin + (high === low ? 0.5 : (value - low) / (high - low)) * (layout.width - 2 * layout.margin);
  const spread = (a, i) => (a.slice(0, i).filter(v => v === a[i]).length - (a.filter(v => v === a[i]).length - 1) / 2) * 58;
  let nodes = [...c.mice.map((v, i) => ({ id: `m${i}`, label: `M${i + 1}`, x: x(v) + spread(c.mice, i), y: layout.mouseY, style: nodeStyle(`m${i}`, 'mouse') })),
    ...c.holes.map((v, j) => ({ id: `h${j}`, label: `H${j + 1}`, x: x(v) + spread(c.holes, j), y: layout.holeY, style: nodeStyle(`h${j}`, 'hole') }))];
  // Stable edge identities avoid a delete-animation racing with backward/forward navigation.
  let edges = c.mice.flatMap((_, i) => c.holes.flatMap((__, j) => {
    const p = [i, j], matched = f.pairs.some(([a, b]) => a === i && b === j);
    return [{ id: pairId(p), source: `m${i}`, target: `h${j}`, style: { ...edgesStyle, lineWidth: matched ? 5 : 0 } },
      ...[true, false].map(forward => {
        const active = f.path.some(a => a.pair?.[0] === i && a.pair?.[1] === j && a.forward === forward);
        return { id: `path-${i}-${j}-${forward}`, source: forward ? `m${i}` : `h${j}`, target: forward ? `h${j}` : `m${i}`,
          style: { ...edgesStyle, lineWidth: active ? 5 : 0, directional: active, stroke: '#8b5cf6', curvature: 0.14 } };
      })];
  }));
  if (view === 'network' && f.network) {
    // Bipartite residual view: separate original opposite arcs instead of using ↔.
    nodes = [...c.mice.map((_, i) => ({ id: `m${i}`, label: `M${i + 1}`, x: 190, y: 55 + i * 220 / Math.max(1, c.mice.length - 1), style: nodeStyle(`m${i}`, 'mouse') })),
      ...c.holes.map((_, j) => ({ id: `h${j}`, label: `H${j + 1}`, x: 510, y: 55 + j * 220 / Math.max(1, c.holes.length - 1), style: nodeStyle(`h${j}`, 'hole') })),
      ...['S', 'T'].map((id, i) => ({ id, label: id, x: i ? 660 : 40, y: 165, style: { ...nodesStyle, fill: '#e0f2fe' } }))];
    edges = f.network.arcs.map(a => ({ id: `a${a.id}`, source: a.u, target: a.v,
      style: { ...edgesStyle, directional: a.cap > 0, lineWidth: a.cap <= 0 ? 0 : f.path.some(p => p.id === a.id) ? 6 : 2, stroke: f.path.some(p => p.id === a.id) ? '#8b5cf6' : a.forward ? '#7dd3fc' : '#fb7185', curvature: a.forward ? 0.07 : 0.14 } }));
  }
  return { width: layout.width, height: layout.height, nodesStyle, edgesStyle, nodes, edges };
}

// Equivalent number-line network for the five source TikZ diagrams.
// Each physical direction has its own positive-cost arc AND its own residual reverse.
export function lineNetworkGraph(c, f) {
  const { lineLayout: l, nodesStyle, edgesStyle } = catalog;
  const zs = [...new Set([...c.mice, ...c.holes])].sort((a, b) => a - b);
  const px = z => l.margin + zs.indexOf(z) * (l.width - 2 * l.margin) / Math.max(1, zs.length - 1);
  const zid = z => `z${zs.indexOf(z)}`;
  const ns = (fill, type = 'circle') => ({ ...nodesStyle, size: 38, fill, type, labelFontSize: 13 });
  const offset = (xs, i) => 45 * (xs.slice(0, i).filter(x => x === xs[i]).length - (xs.filter(x => x === xs[i]).length - 1) / 2);
  const nodes = [
    { id: 'S', label: 'S', x: l.width / 2, y: l.sourceY, style: ns('#e0f2fe') },
    { id: 'T', label: 'T', x: l.width / 2, y: l.sinkY, style: ns('#e0f2fe') },
    ...zs.map(z => ({ id: zid(z), label: String(z), x: px(z), y: l.axisY, style: ns('#fef9c3') })),
    ...c.mice.map((z, i) => ({ id: `m${i}`, label: `M${i + 1}`, x: px(z) + offset(c.mice, i), y: l.mouseY, style: ns(f.active.includes(`m${i}`) ? '#fde047' : '#86efac') })),
    ...c.holes.map((z, j) => ({ id: `h${j}`, label: `H${j + 1}`, x: px(z) + offset(c.holes, j), y: l.holeY, style: ns(f.active.includes(`h${j}`) ? '#fde047' : '#c4b5fd', 'square') })),
  ];
  const edges = [], facts = [], labels = new Map(nodes.map(n => [n.id, n.label]));
  function arc(id, u, v, cap, cost, flow, curve = 0.08) {
    for (const reverse of [false, true]) {
      const a = { id: `${id}-${reverse}`, source: reverse ? v : u, target: reverse ? u : v,
        cap: reverse ? flow : cap - flow, cost: reverse ? -cost : cost, reverse };
      edges.push({ ...a, style: { ...edgesStyle, lineWidth: a.cap > 0 ? 2.5 : 0, directional: a.cap > 0, stroke: reverse ? '#fb7185' : '#0ea5e9', curvature: reverse ? curve * 2.2 : curve } });
      if (a.cap > 0) facts.push({ ...a, direction: `${labels.get(a.source)} → ${labels.get(a.target)}` });
    }
  }
  c.mice.forEach((z, i) => {
    const used = f.pairs.filter(p => p[0] === i).length;
    arc(`sm${i}`, 'S', `m${i}`, 1, 0, used);
    arc(`mz${i}`, `m${i}`, zid(z), 1, 0, used);
  });
  c.holes.forEach((z, j) => {
    const used = f.pairs.filter(p => p[1] === j).length;
    arc(`zh${j}`, zid(z), `h${j}`, capacity(c, j), weight(c, j), used);
    arc(`ht${j}`, `h${j}`, 'T', capacity(c, j), 0, used);
  });
  for (let k = 1; k < zs.length; k++) {
    const left = zs[k - 1], right = zs[k];
    const east = f.pairs.filter(([i, j]) => c.mice[i] <= left && c.holes[j] >= right).length;
    const west = f.pairs.filter(([i, j]) => c.holes[j] <= left && c.mice[i] >= right).length;
    arc(`east${k}`, zid(left), zid(right), c.mice.length, right - left, east, 0.2);
    arc(`west${k}`, zid(right), zid(left), c.mice.length, right - left, west, 0.2);
  }
  return { width: l.width, height: l.height, nodesStyle, edgesStyle, nodes, edges, facts };
}
