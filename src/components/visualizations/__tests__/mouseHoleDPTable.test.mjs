import test from 'node:test';
import assert from 'node:assert/strict';
import { MOUSE_HOLE_CASES, buildMouseHoleTrace } from '../mouseHoleModel.js';
import { buildMouseHoleDPTable, DP_TRANSITIONS } from '../mouseHoleDPTable.js';

function check(c) {
  const frames = buildMouseHoleTrace(c), table = buildMouseHoleDPTable(c, frames);
  assert.equal(table.rows.length, frames.length);
  assert.equal(new Set(table.edges.map(e => e.id)).size, table.edges.length);
  for (let row = 1; row < table.rows.length; row++) for (const col of table.columns) {
    const incoming = table.edges.filter(e => e.row === row && e.to === col);
    const expected = table.rows[row].values[table.columns.indexOf(col)];
    assert.equal(Math.min(...incoming.map(e => e.candidate)), expected);
    for (const e of incoming) {
      assert.ok(DP_TRANSITIONS[e.type]);
      assert.equal(e.candidate, table.rows[row - 1].values[table.columns.indexOf(e.from)] + e.delta);
      assert.equal(e.winner, e.candidate === expected);
      if (e.type === 'skip') { assert.equal(e.from, e.to); assert.equal(e.delta, 0); }
      if (c.mode === 'capacityDP') {
        assert.equal(e.count, e.to - e.from);
        assert.ok(e.count <= (c.capacities?.[table.rows[row].event.i] ?? 1));
      } else assert.equal(Math.abs(e.to - e.from), e.type === 'skip' ? 0 : 1);
    }
  }
  return table;
}

test('every matrix entry is exactly the minimum of its incoming transition candidates', () => {
  for (const c of MOUSE_HOLE_CASES.filter(c => ['signedDP', 'capacityDP'].includes(c.mode))) check(c);
  let seed = 7723;
  const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  for (let t = 0; t < 200; t++) {
    const c = { mice: Array.from({ length: 1 + rand(4) }, () => rand(11) - 5), holes: Array.from({ length: 1 + rand(4) }, () => rand(11) - 5) };
    check({ ...c, mode: 'signedDP' });
    check({ ...c, mode: 'capacityDP', capacities: c.holes.map(() => rand(4)), weights: c.holes.map(() => rand(7) - 3) });
  }
});

test('equal-best incoming edges are all retained; capacity 10^9 does not expand the matrix', () => {
  const table = check({ mode: 'capacityDP', mice: [0], holes: [0, 0] });
  const ties = table.edges.filter(e => e.row === 2 && e.to === 1 && e.winner);
  assert.equal(ties.length, 2);
  const huge = check(MOUSE_HOLE_CASES.find(c => c.id === 'large-capacity'));
  assert.equal(huge.rows.length, 3); assert.equal(huge.columns.length, 4);
  assert.ok(huge.edges.length <= 20);
});

test('negative frontier, zero-weight edges and all-right prefix remain distinct states', () => {
  const c = MOUSE_HOLE_CASES.find(c => c.id === 'negative-dp'), t = check(c);
  assert.equal(t.rows[1].values[t.columns.indexOf(0)], Infinity);
  assert.equal(t.rows[1].values[t.columns.indexOf(-1)], -1);
  assert.equal(t.rows.at(-1).values[t.columns.indexOf(0)], 8);
  const zero = check({ mode: 'signedDP', mice: [0], holes: [0] });
  assert.ok(zero.edges.some(e => e.type === 'open' && e.delta === 0));
  assert.ok(zero.edges.some(e => e.type === 'close' && e.delta === 0));
});
