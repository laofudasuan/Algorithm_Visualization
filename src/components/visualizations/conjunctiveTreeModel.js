// Positions are 1-based throughout the lesson and the model.
export const CONJUNCTIVE_CASES = [
  { name: '交错的小块 · 2 1 3 5 4 6', p: [2, 1, 3, 5, 4, 6] },
  { name: '只能整体合并 · 2 4 1 3', p: [2, 4, 1, 3] },
  { name: '析点中还有合点 · 4 3 7 2 1 5 6', p: [4, 3, 7, 2, 1, 5, 6] },
  { name: '一直递增 · 1 2 3 4 5', p: [1, 2, 3, 4, 5] },
  { name: '一直递减 · 5 4 3 2 1', p: [5, 4, 3, 2, 1] },
];

export const nodeLabel = node => ({ leaf: '叶', up: '合 ↑', down: '合 ↓', prime: '析' })[node.type];
export const intervalKey = (l, r) => `${l}:${r}`;
export function validatePermutation(p, maxLength = Infinity) {
  return p.length >= 1 && p.length <= maxLength && new Set(p).size === p.length &&
    p.every(x => Number.isInteger(x) && x >= 1 && x <= p.length);
}
export function intervalInfo(p, l, r) {
  const values = p.slice(l - 1, r);
  const min = Math.min(...values), max = Math.max(...values);
  const missing = Array.from({ length: max - min + 1 }, (_, i) => min + i).filter(x => !values.includes(x));
  return { l, r, min, max, values, missing, gap: max - min - (r - l), good: max - min === r - l };
}
export const contains = (a, b) => a.l <= b.l && b.r <= a.r;
export const overlaps = (a, b) => Math.max(a.l, b.l) <= Math.min(a.r, b.r) && !contains(a, b) && !contains(b, a);

// Definition-based enumeration is only for the tiny interactive cases / test oracle.
export function enumerateIntervals(p) {
  const intervals = [];
  for (let l = 1; l <= p.length; l++) {
    let min = Infinity, max = -Infinity;
    for (let r = l; r <= p.length; r++) {
      min = Math.min(min, p[r - 1]); max = Math.max(max, p[r - 1]);
      if (max - min === r - l) intervals.push({ l, r, min, max });
    }
  }
  return intervals.map(a => ({ ...a, witness: intervals.find(b => overlaps(a, b)) || null }));
}

class GapTree {
  constructor(n) {
    this.n = n;
    this.min = new Float64Array(n * 4 + 8).fill(1e9);
    this.lazy = new Float64Array(n * 4 + 8);
  }
  apply(v, d) { this.min[v] += d; this.lazy[v] += d; }
  push(v) {
    if (this.lazy[v]) {
      this.apply(v * 2, this.lazy[v]); this.apply(v * 2 + 1, this.lazy[v]); this.lazy[v] = 0;
    }
  }
  add(a, b, d, v = 1, l = 1, r = this.n) {
    if (a > b || b < l || r < a) return;
    if (a <= l && r <= b) { this.apply(v, d); return; }
    this.push(v);
    const m = (l + r) >> 1;
    this.add(a, b, d, v * 2, l, m); this.add(a, b, d, v * 2 + 1, m + 1, r);
    this.min[v] = Math.min(this.min[v * 2], this.min[v * 2 + 1]);
  }
  activate(at, v = 1, l = 1, r = this.n) {
    if (l === r) { this.min[v] = 0; this.lazy[v] = 0; return; }
    this.push(v);
    const m = (l + r) >> 1;
    if (at <= m) this.activate(at, v * 2, l, m);
    else this.activate(at, v * 2 + 1, m + 1, r);
    this.min[v] = Math.min(this.min[v * 2], this.min[v * 2 + 1]);
  }
  firstZero(v = 1, l = 1, r = this.n) {
    if (l === r) return l;
    this.push(v);
    const m = (l + r) >> 1;
    return this.min[v * 2] === 0 ? this.firstZero(v * 2, l, m) : this.firstZero(v * 2 + 1, m + 1, r);
  }
}

export function computeLeftBounds(p, record = false) {
  if (!validatePermutation(p)) throw new Error('请输入 1 到 n 的排列。');
  const n = p.length, a = [0, ...p], tree = new GapTree(n);
  const maxStack = [], minStack = [], bounds = [], events = [], q = Array(n).fill(null);
  const emit = (r, kind, message, range = null, delta = 0) => {
    if (record) events.push({ r, kind, message, range, delta, q: [...q], maxStack: [...maxStack], minStack: [...minStack], left: kind === 'done' ? bounds[r - 1] : null });
  };
  const change = (r, kind, l, rr, delta, message) => {
    tree.add(l, rr, delta);
    if (record) {
      for (let i = l; i <= rr; i++) q[i - 1] += delta;
      emit(r, kind, message, [l, rr], delta);
    }
  };
  for (let r = 1; r <= n; r++) {
    emit(r, 'start', `读入 p[${r}] = ${a[r]}；先保留上一轮的 Q。`);
    if (r > 1) change(r, 'length', 1, r - 1, -1, `旧区间都变长 1：Q[1..${r - 1}] 减 1。`);
    while (maxStack.length && a[maxStack.at(-1)] < a[r]) {
      const j = maxStack.pop(), l = (maxStack.at(-1) || 0) + 1;
      change(r, 'max', l, j, a[r] - a[j], `左端点 ${l}..${j} 的最大值从 ${a[j]} 变为 ${a[r]}，Q 加 ${a[r] - a[j]}。`);
    }
    maxStack.push(r);
    while (minStack.length && a[minStack.at(-1)] > a[r]) {
      const j = minStack.pop(), l = (minStack.at(-1) || 0) + 1;
      change(r, 'min', l, j, a[j] - a[r], `左端点 ${l}..${j} 的最小值从 ${a[j]} 变为 ${a[r]}，Q 加 ${a[j] - a[r]}。`);
    }
    minStack.push(r);
    tree.activate(r); q[r - 1] = 0;
    emit(r, 'activate', `启用单点 [${r},${r}]：Q[${r}] = 0。`);
    bounds.push(tree.firstZero());
    emit(r, 'done', `本轮更新完成，最左的 0 在 L[${r}] = ${bounds[r - 1]}。`);
  }
  return { bounds, events };
}

const joins = (a, b) => Math.max(a.max, b.max) - Math.min(a.min, b.min) === b.r - a.l;
const cloneNode = node => ({ ...node, children: node.children.map(cloneNode) });
export function buildConjunctiveTree(p, record = false) {
  const { bounds } = computeLeftBounds(p);
  const stack = [], events = [];
  let nextId = 0, u = null;
  const leaf = r => ({ id: nextId++, l: r, r, min: p[r - 1], max: p[r - 1], type: 'leaf', children: [] });
  const make = (children, type) => {
    let min = Infinity, max = -Infinity;
    for (const child of children) { min = Math.min(min, child.min); max = Math.max(max, child.max); }
    return { id: nextId++, l: children[0].l, r: children.at(-1).r, min, max, type, children };
  };
  const emit = (r, kind, message, extra = {}) => {
    if (record) events.push({ r, kind, message, left: bounds[r - 1], forest: stack.map(cloneNode), current: u ? cloneNode(u) : null, ...extra });
  };
  for (let r = 1; r <= p.length; r++) {
    u = leaf(r);
    emit(r, 'leaf', `新建叶子 [${r},${r}]，值为 ${p[r - 1]}。橙色框是当前待合并子树 u。`);
    while (stack.length && bounds[r - 1] < u.l) {
      const top = stack.at(-1);
      emit(r, 'check', `L[${r}] = ${bounds[r - 1]} < u.l = ${u.l}，左边仍有块可以合入。先检查栈顶 [${top.l},${top.r}]。`);
      if ((top.type === 'up' && top.max + 1 === u.min) || (top.type === 'down' && u.max + 1 === top.min)) {
        stack.pop(); top.children.push(u); top.r = u.r;
        top.min = Math.min(top.min, u.min); top.max = Math.max(top.max, u.max); u = top;
        emit(r, 'append', `方向相同、值域首尾相接：把 u 追加为原合点的最后一个孩子，不多套一层。`);
      } else if (joins(top, u)) {
        stack.pop(); u = make([top, u], top.min < u.min ? 'up' : 'down');
        emit(r, 'merge', `两块拼起来就是连续段：新建${u.type === 'up' ? '递增' : '递减'}合点 [${u.l},${u.r}]。`);
      } else {
        let min = u.min, max = u.max, l = u.l;
        const children = [u];
        do {
          const v = stack.pop(); children.push(v); l = v.l;
          min = Math.min(min, v.min); max = Math.max(max, v.max);
          emit(r, 'collect', `收进左侧块 [${v.l},${v.r}]：极差 ${max - min}，长度减一 ${r - l}。${max - min === r - l ? '第一次相等，停止收集。' : '还有缺口，继续向左收集。'}`, { collected: children.slice(1).map(cloneNode), candidate: { l, r, min, max } });
        } while (max - min !== r - l);
        u = make(children.reverse(), 'prime');
        emit(r, 'prime', `最短的可合并后缀需要 ${u.children.length} 块：新建析点 [${u.l},${u.r}]，孩子恢复为从左到右的顺序。`);
      }
    }
    stack.push(u); u = null;
    emit(r, 'push', `当前子树入栈。已读前缀的值未必连续，所以此时允许有多棵树。`);
  }
  if (stack.length !== 1) throw new Error('完整排列应得到一棵树。');
  emit(p.length, 'done', '完整排列读完，栈中只剩一棵析合树。');
  return { root: stack[0], events, bounds };
}

export function flattenTree(root) {
  const result = [], work = [root];
  while (work.length) {
    const u = work.pop(); result.push(u);
    for (let i = u.children.length - 1; i >= 0; i--) work.push(u.children[i]);
  }
  return result;
}
export function childRanks(node) {
  const sorted = [...node.children].sort((a, b) => a.min - b.min);
  return node.children.map(c => sorted.indexOf(c) + 1);
}
export const contribution = node => node.type === 'leaf' || node.type === 'prime' ? 1 : node.children.length * (node.children.length - 1) / 2;
export const countContinuous = root => flattenTree(root).reduce((sum, u) => sum + contribution(u), 0);
export function minimumCover(root, l, r) {
  let u = root;
  while (true) {
    const child = u.children.find(c => c.l <= l && r <= c.r);
    if (!child) break;
    u = child;
  }
  if (u.type === 'leaf' || u.type === 'prime') return { l: u.l, r: u.r, node: u, children: u.children };
  const children = u.children.filter(c => c.r >= l && c.l <= r);
  return { l: children[0].l, r: children.at(-1).r, node: u, children };
}
