import test from 'node:test';
import assert from 'node:assert/strict';
import { EXAMPLES, buildGeometry, childMapping, compose, prepareExample } from '../equivalenceDivideModel.js';

// Independent oracle: move coordinates by physically permuting arrays, not by offsets.
function direct(example) {
  const points = example.p.map((y, x) => ({ x, y, value: example.values[x] }));
  const answers = [];
  for (const op of example.operations) {
    const sums = Array(9).fill(0);
    const permutation = cuts => {
      const order = Array.from({ length: example.n }, (_, i) => i);
      const moved = [...order.slice(0, cuts[0]), ...order.slice(cuts[1]), ...order.slice(cuts[0], cuts[1])];
      return order.map(old => moved.indexOf(old));
    };
    const xMap = permutation(op.x);
    const yMap = permutation(op.y);
    for (const point of points) {
      const x = point.x < op.x[0] ? 0 : point.x < op.x[1] ? 1 : 2;
      const y = point.y < op.y[0] ? 0 : point.y < op.y[1] ? 1 : 2;
      const tag = op.tags[x * 3 + y];
      sums[x * 3 + y] += point.value;
      point.value = tag.a * point.value + tag.b;
      if (point.value === 0) point.value = 0;
      point.x = xMap[point.x];
      point.y = yMap[point.y];
    }
    answers.push(sums);
  }
  return { answers, points };
}

function verify(example) {
  const data = prepareExample(example);
  const oracle = direct(example);
  assert.deepEqual(data.answers, oracle.answers);
  assert.deepEqual(data.finalValues, oracle.points.map(point => point.value));
  assert.deepEqual(data.final.map(({ x, y, value }) => ({ x, y, value })), oracle.points);
  for (const axis of ['x', 'y']) {
    const root = data.root[axis];
    oracle.points.forEach((point, id) => {
      const input = axis === 'x' ? id : example.p[id];
      const piece = root.find(item => item.lo <= input && input < item.hi);
      assert.equal(input + piece.shift, point[axis]);
    });
    for (const node of data.nodes) {
      const pieces = node[axis];
      assert.ok(pieces.length <= 2 * (node.r - node.l + 1) + 1);
      assert.equal(pieces[0].lo, 0);
      assert.equal(pieces.at(-1).hi, example.n);
      const outputs = [];
      pieces.forEach((piece, i) => {
        if (i) assert.equal(pieces[i - 1].hi, piece.lo);
        assert.ok(piece.hi > piece.lo);
        for (let x = piece.lo; x < piece.hi; x++) {
          outputs.push(x + piece.shift);
          if (node.left) {
            const L = node.left[axis][piece.left];
            const R = node.right[axis][piece.right];
            assert.ok(L.lo <= x && x < L.hi);
            assert.ok(R.lo <= x + L.shift && x + L.shift < R.hi);
            assert.equal(piece.shift, L.shift + R.shift);
          }
        }
      });
      assert.deepEqual(outputs.sort((a, b) => a - b), Array.from({ length: example.n }, (_, i) => i));
    }
  }
  for (const event of data.events) {
    const node = data.nodes.find(item => item.id === event.nodeId);
    assert.equal(event.cells.reduce((sum, cell) => sum + cell.count, 0), example.n);
    for (const cell of event.cells) {
      assert.equal(cell.count, cell.members.length);
      const histories = cell.members.map(id => data.histories[id].slice(node.l, node.r + 1).join('/'));
      assert.ok(histories.every(history => history === histories[0]));
      if (!cell.count) assert.equal(cell.sum, 0);
    }
    if (node.left) {
      for (const side of ['left', 'right']) {
        assert.equal(childMapping(node, node[side], side).length, event.cells.length);
      }
    }
  }
}

test('four teaching cases match an independent point simulator', () => EXAMPLES.forEach(verify));
test('noncommutative tags and irreversible assignment', () => {
  assert.deepEqual(compose({ a: 1, b: 3 }, { a: 2, b: 0 }), { a: 2, b: 3 });
  assert.deepEqual(compose({ a: 2, b: 0 }, { a: 1, b: 3 }), { a: 2, b: 6 });
  const ordered = prepareExample(EXAMPLES[2]);
  assert.deepEqual(ordered.finalValues.slice(0, 2), [5, 7]);
  const assigned = prepareExample(EXAMPLES[3]);
  assert.equal(assigned.turns[0].updated[0].value, 7);
  assert.equal(assigned.answers[0][0], 0);
});
test('returning to the same position must not erase history boundaries', () => {
  const example = { n: 6, operations: [
    { x: [2, 4], y: [2, 4] }, { x: [2, 4], y: [2, 4] }
  ] };
  const geometry = buildGeometry(example);
  assert.equal(geometry.root.x.length, 3);
  assert.ok(geometry.root.x.every(piece => piece.shift === 0));
});
test('block boundaries preserve both coordinates and updated values', () => {
  for (const example of EXAMPLES) {
    const oracle = direct(example);
    for (let size = 1; size <= example.operations.length; size++) {
      let points = example.p.map((y, x) => ({ x, y, value: example.values[x] }));
      const answers = [];
      for (let start = 0; start < example.operations.length; start += size) {
        const byX = [...points].sort((a, b) => a.x - b.x);
        const block = prepareExample({ n: example.n, p: byX.map(point => point.y),
          values: byX.map(point => point.value), operations: example.operations.slice(start, start + size) });
        answers.push(...block.answers);
        points = byX.map((point, i) => {
          const X = block.root.x.find(part => part.lo <= point.x && point.x < part.hi);
          const Y = block.root.y.find(part => part.lo <= point.y && point.y < part.hi);
          return { x: point.x + X.shift, y: point.y + Y.shift, value: block.finalValues[i] };
        });
      }
      assert.deepEqual(answers, oracle.answers);
      assert.deepEqual(points.sort((a, b) => a.x - b.x), [...oracle.points].sort((a, b) => a.x - b.x));
    }
  }
});
test('300 seeded random cases, including one operation, odd intervals and negative values', () => {
  let seed = 7723;
  const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  for (let c = 0; c < 300; c++) {
    const n = 3 + rand(16);
    const p = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = rand(i + 1); [p[i], p[j]] = [p[j], p[i]]; }
    const cuts = () => { const a = 1 + rand(n - 2); return [a, a + 1 + rand(n - a - 1)]; };
    verify({ n, p, values: p.map(() => rand(15) - 7), operations: Array.from({ length: 1 + rand(9) }, () => ({
      x: cuts(), y: cuts(), tags: Array.from({ length: 9 }, () => ({ a: rand(4) - 1, b: rand(9) - 4 }))
    })) });
  }
});
