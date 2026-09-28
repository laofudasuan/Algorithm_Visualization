// Small, deterministic teaching model. Data = (sum, count), Operation = (a, b).
// Applying (a,b) to a point means v <- a*v+b; to a group: sum <- a*sum+b*count.
export const IDENTITY = { a: 1, b: 0 };
export const compose = (newer, older) => ({
  a: newer.a * older.a,
  b: newer.a * older.b + newer.b
});
export const applySum = (tag, sum, count) => {
  const result = tag.a * sum + tag.b * count;
  return result === 0 ? 0 : result;
};
export const formatTag = ({ a, b }) => {
  if (a === 1 && b === 0) return '不变';
  if (a === 0) return `赋值 ${b}`;
  if (a === 1) return `+${b}`;
  return b === 0 ? `×${a}` : `×${a} 再 +${b}`;
};
export const band = (value, cuts) => Number(value >= cuts[0]) + Number(value >= cuts[1]);
export function moveCoordinate(value, cuts, n) {
  const offsets = [0, n - cuts[1], cuts[0] - cuts[1]];
  return value + offsets[band(value, cuts)];
}

const operation = (x, y, edits) => {
  const tags = Array.from({ length: 9 }, () => ({ ...IDENTITY }));
  // Flat cell id = 3*X+Y, exactly matching o[X][Y].
  edits.forEach(([X, Y, a, b]) => { tags[3 * X + Y] = { a, b }; });
  return { x, y, tags };
};

export const EXAMPLES = [
  {
    id: 'start', name: '案例一 · 从同组到分开', n: 8,
    p: [0, 1, 2, 3, 4, 5, 6, 7], values: [1, 2, 3, 4, 5, 6, 7, 8],
    focus: '先看 P0、P1、P2：第 0 次都在 (0,0)，第 1 次 P2 单独进入 (1,1)。只看第一次时，它们可以合并。',
    operations: [
      operation([3, 6], [3, 6], [[0, 0, 2, 0], [1, 1, 1, 3], [2, 2, 1, 1]]),
      operation([2, 5], [2, 5], [[0, 0, 1, 3], [1, 1, 0, 4], [2, 2, 2, 0]])
    ]
  },
  {
    id: 'cross', name: '案例二 · 四次操作与交叉重组', n: 10,
    p: [8, 1, 6, 3, 0, 9, 4, 7, 2, 5], values: [2, 1, 4, 3, 5, 2, 6, 1, 3, 4],
    focus: '横轴、纵轴分别交换。观察左半区间结束后，保留更新过的权值，再按右半区间重新聚合。',
    operations: [
      operation([3, 7], [2, 6], [[0, 0, 1, 2], [0, 2, 2, 0], [1, 1, 1, 3], [2, 0, 0, 5]]),
      operation([2, 6], [4, 8], [[0, 0, 3, 0], [1, 1, 0, 2], [2, 2, 1, 4]]),
      operation([4, 8], [1, 5], [[0, 0, 1, 1], [1, 2, 2, 1], [2, 1, 1, 5]]),
      operation([1, 5], [3, 7], [[0, 0, 0, 7], [1, 1, 2, 0], [2, 2, 1, 3]])
    ]
  },
  {
    id: 'order', name: '案例三 · 修改顺序不能交换', n: 8,
    p: [0, 1, 2, 3, 4, 5, 6, 7], values: [1, 2, 3, 4, 5, 6, 7, 8],
    focus: 'P0、P1 始终在 (0,0)。先 ×2 再 +3 后，两点之和从 3 变成 12；先 +3 再 ×2 则是 18。',
    operations: [
      operation([2, 5], [2, 5], [[0, 0, 2, 0]]),
      operation([2, 5], [2, 5], [[0, 0, 1, 3]])
    ]
  },
  {
    id: 'reset', name: '案例四 · 赋值与空格子', n: 6,
    p: [5, 4, 3, 2, 1, 0], values: [2, 4, 6, 8, 10, 12],
    focus: '赋值是不可逆修改，空格子即使收到“赋值 7”仍为空。回溯下传标记，不需要减法或逆操作。',
    operations: [
      operation([2, 4], [2, 4], [[0, 2, 0, 7], [1, 1, 0, 0], [0, 0, 0, 7]]),
      operation([1, 3], [1, 3], [[0, 0, 1, 3], [1, 1, 2, 0], [2, 2, 0, 5]]),
      operation([2, 5], [2, 5], [[0, 0, 0, 2], [1, 1, 1, 4], [2, 0, 3, 0]])
    ]
  }
];

export function leafAxis(n, cuts) {
  const [a, b] = cuts;
  return [
    { lo: 0, hi: a, shift: 0 },
    { lo: a, hi: b, shift: n - b },
    { lo: b, hi: n, shift: a - b }
  ];
}

// Intersect left OUTPUT intervals with right INPUT intervals in the middle space.
// Keep every history boundary even if adjacent pieces have equal final shifts.
export function composeAxis(left, right) {
  const outputOrder = left.map((piece, index) => ({ ...piece, index }))
    .sort((a, b) => a.lo + a.shift - b.lo - b.shift);
  const pieces = [];
  let i = 0;
  let j = 0;
  while (i < outputOrder.length && j < right.length) {
    const L = outputOrder[i];
    const R = right[j];
    const lo = Math.max(L.lo + L.shift, R.lo);
    const hi = Math.min(L.hi + L.shift, R.hi);
    if (lo < hi) pieces.push({ lo: lo - L.shift, hi: hi - L.shift,
      shift: L.shift + R.shift, left: L.index, right: j, middleLo: lo, middleHi: hi });
    if (L.hi + L.shift <= R.hi) i += 1;
    if (R.hi <= L.hi + L.shift) j += 1;
  }
  return pieces.sort((a, b) => a.lo - b.lo);
}

export function buildGeometry(example) {
  const nodes = [];
  function build(l, r, depth) {
    const node = { id: `${l}-${r}`, l, r, depth };
    nodes.push(node);
    if (l === r) {
      node.x = leafAxis(example.n, example.operations[l].x);
      node.y = leafAxis(example.n, example.operations[l].y);
    } else {
      const mid = Math.floor((l + r) / 2);
      node.left = build(l, mid, depth + 1);
      node.right = build(mid + 1, r, depth + 1);
      node.x = composeAxis(node.left.x, node.right.x);
      node.y = composeAxis(node.left.y, node.right.y);
    }
    return node;
  }
  const root = build(0, example.operations.length - 1, 0);
  return { root, nodes };
}

export function simulatePoints(example) {
  let points = example.p.map((y, id) => ({ id, x: id, y, value: example.values[id] }));
  const turns = [];
  const histories = points.map(() => []);
  for (const op of example.operations) {
    const before = points.map(point => ({ ...point }));
    const answers = Array(9).fill(0);
    const counts = Array(9).fill(0);
    const updated = points.map(point => {
      const X = band(point.x, op.x);
      const Y = band(point.y, op.y);
      const cell = 3 * X + Y;
      histories[point.id].push(`${X}${Y}`);
      answers[cell] += point.value;
      counts[cell] += 1;
      return { ...point, value: applySum(op.tags[cell], point.value, 1) };
    });
    points = updated.map(point => ({ ...point,
      x: moveCoordinate(point.x, op.x, example.n),
      y: moveCoordinate(point.y, op.y, example.n) }));
    turns.push({ before, updated, after: points.map(point => ({ ...point })), answers, counts });
  }
  return { turns, histories, final: points };
}

const findPiece = (pieces, value) => pieces.findIndex(piece => piece.lo <= value && value < piece.hi);
const emptyCells = node => Array.from({ length: node.x.length * node.y.length }, () => ({
  sum: 0, count: 0, tag: { ...IDENTITY }, members: []
}));
const snapshot = cells => cells.map(cell => ({ ...cell, tag: { ...cell.tag }, members: [...cell.members] }));

export function childMapping(parent, child, side) {
  return parent.x.flatMap(x => parent.y.map(y => x[side] * child.y.length + y[side]));
}

// Actual aggregate recursion: queries are computed from class sums, never from the oracle.
export function solveByClasses(example, geometry = buildGeometry(example)) {
  const events = [];
  const answers = [];
  const rootCells = emptyCells(geometry.root);
  example.p.forEach((y, id) => {
    const cellId = findPiece(geometry.root.x, id) * geometry.root.y.length + findPiece(geometry.root.y, y);
    const cell = rootCells[cellId];
    cell.sum += example.values[id];
    cell.count += 1;
    cell.members.push(id);
  });
  function emit(node, cells, kind, title, detail, extra = {}) {
    events.push({ nodeId: node.id, kind, title, detail, cells: snapshot(cells), ...extra });
  }
  function solve(node, cells) {
    emit(node, cells, 'enter', `进入 [${node.l},${node.r}]`,
      '每一组在当前操作区间内始终同行；组内保存权值之和与尚未下传的修改。');
    if (node.l === node.r) {
      answers[node.l] = cells.map(cell => cell.sum);
      emit(node, cells, 'query', `查询第 ${node.l} 次操作`,
        '先记录九个格子的和。此时还没有执行本次修改，空格子的答案为 0。');
      cells.forEach((cell, index) => {
        const tag = example.operations[node.l].tags[index];
        cell.sum = applySum(tag, cell.sum, cell.count);
        cell.tag = compose(tag, cell.tag);
      });
      emit(node, cells, 'apply', `修改第 ${node.l} 次操作`,
        '对每个格子的总和应用一次修改，并记录标记。坐标移动已经编码在轴映射中。');
      return;
    }
    for (const side of ['left', 'right']) {
      const child = node[side];
      const mapping = childMapping(node, child, side);
      const childCells = emptyCells(child);
      cells.forEach((cell, index) => {
        const target = childCells[mapping[index]];
        target.sum += cell.sum;
        target.count += cell.count;
        target.members.push(...cell.members);
      });
      emit(child, childCells, 'merge', `合并到${side === 'left' ? '左' : '右'}区间 [${child.l},${child.r}]`,
        side === 'left' ? '只考虑前半段操作，区分条件减少。若干父层细类可以合成同一粗类。'
          : '使用左半段修改后的和，并按左半段移动后的坐标映射，重新聚合到右区间。',
        { parentId: node.id, mapping, side, sourceCells: snapshot(cells) });
      solve(child, childCells);
      const before = snapshot(cells);
      cells.forEach((cell, index) => {
        const tag = childCells[mapping[index]].tag;
        cell.sum = applySum(tag, cell.sum, cell.count);
        cell.tag = compose(tag, cell.tag);
      });
      emit(node, cells, 'push', `从${side === 'left' ? '左' : '右'}区间返回，向细类下传`,
        '按各细类原有的和、元素个数应用同一个标记。恢复分组结构，但保留已经发生的修改。',
        { before, childId: child.id, mapping, side, sourceCells: snapshot(childCells) });
    }
    emit(node, cells, 'exit', `完成 [${node.l},${node.r}]`,
      '累计标记 = 右半段标记 ∘ 左半段标记；交还父层时继续向下传递。');
  }
  solve(geometry.root, rootCells);
  const finalValues = Array(example.n);
  rootCells.forEach(cell => cell.members.forEach(id => {
    finalValues[id] = applySum(cell.tag, example.values[id], 1);
  }));
  return { events, answers, finalValues, rootCells };
}

export function prepareExample(example) {
  const geometry = buildGeometry(example);
  return { ...geometry, ...solveByClasses(example, geometry), ...simulatePoints(example) };
}
