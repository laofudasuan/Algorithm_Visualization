import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import { MOUSE_HOLE_CASES, buildMouseHoleTrace, pairCost } from '../mouseHoleModel.js';
import { buildMouseHoleDPTable } from '../mouseHoleDPTable.js';
import { buildGraphActions, buildDPActions, playerInitial, reducePlayer } from '../mouseHoleActions.js';

test('graph actions preserve final snapshots and legal intermediate occupancy / residual flow', () => {
  for (const c of MOUSE_HOLE_CASES) {
    const frames = buildMouseHoleTrace(c), saved = structuredClone(frames), { initial, actions } = buildGraphActions(c, frames);
    assert.deepEqual(initial, frames[0]); assert.deepEqual(actions.at(-1).after, frames.at(-1));
    for (const a of actions) for (const p of a.phases) {
      if (p.formula) katex.renderToString(p.formula, { throwOnError: true });
      const f = p.frame;
      if (['stack', 'flow', 'cover', 'capacityDP'].includes(c.mode) && f.total !== null) {
        assert.equal(f.total, f.pairs.reduce((v, [i, j]) => v + pairCost(c, i, j), 0), `${c.id}: ${p.title}`);
        if (c.mode !== 'cover') {
          for (let i = 0; i < c.mice.length; i++) assert.ok(f.pairs.filter(q => q[0] === i).length <= 1);
          for (let j = 0; j < c.holes.length; j++) assert.ok(f.pairs.filter(q => q[1] === j).length <= (c.capacities?.[j] ?? 1));
        }
      }
      if (f.network) {
        const balance = new Map();
        for (const e of f.network.arcs.filter(e => e.forward)) {
          assert.ok(e.cap >= 0 && e.cap <= e.initial);
          const flow = e.initial - e.cap;
          assert.equal(f.network.arcs[e.reverse].cap, flow);
          balance.set(e.u, (balance.get(e.u) ?? 0) - flow);
          balance.set(e.v, (balance.get(e.v) ?? 0) + flow);
        }
        for (const [v, amount] of balance) if (v !== 'S' && v !== 'T') assert.equal(amount, 0, `${c.id}: ${p.title}: ${v}`);
      }
    }
    assert.deepEqual(frames, saved);
  }
});

test('regret visibly refunds before reconnecting; travel never charges money early', () => {
  const c = MOUSE_HOLE_CASES.find(c => c.id === 'regret'), t = buildGraphActions(c, buildMouseHoleTrace(c));
  const removed = t.actions.findIndex(a => a.label.startsWith('撤销'));
  assert.ok(removed > 0);
  assert.ok(t.actions.slice(removed + 1).some(a => a.label.startsWith('让')));
  const phases = t.actions[removed].phases;
  assert.equal(phases[0].frame.total, phases[1].frame.total);
  assert.equal(phases[2].frame.total, phases[1].frame.total + phases[2].delta);
  assert.ok(phases[1].formula.includes('\\Delta'));
  assert.equal(t.actions.at(-1).after.total, 5);
  assert.equal(t.initial.comparison, undefined);
});

test('DP candidates move before comparing and committing; no future candidates or values leak', () => {
  const outcomes = new Set();
  for (const c of [...MOUSE_HOLE_CASES, { mode: 'capacityDP', mice: [0, 0], holes: [0, 0], capacities: [2, 2] }]) {
    const frames = buildMouseHoleTrace(c), table = buildMouseHoleDPTable(c, frames);
    if (!table) continue;
    const t = buildDPActions(table, frames); let prior = t.initial;
    assert.ok(prior.values.slice(1).every(r => r.every(v => v === null)));
    for (const a of t.actions) {
      if (a.phases[0].edge) {
        const [focus, travel, compare, commit] = a.phases;
        assert.deepEqual(focus.frame.values, prior.values);
        assert.deepEqual(travel.frame.values, prior.values);
        assert.deepEqual(compare.frame.values, prior.values);
        assert.equal(travel.frame.seen.length, prior.seen.length + 1);
        const { row, to, candidate } = focus.edge, k = table.columns.indexOf(to);
        assert.equal(commit.frame.values[row][k], Math.min(prior.values[row][k] ?? Infinity, candidate));
        outcomes.add(commit.outcome);
      }
      for (const p of a.phases) if (p.formula) katex.renderToString(p.formula, { throwOnError: true });
      prior = a.after;
    }
    assert.deepEqual(prior.values, table.rows.map(r => r.values));
    assert.equal(prior.seen.length, table.edges.length);
  }
  assert.deepEqual([...outcomes].sort(), ['accept', 'reject', 'tie']);
});

test('one clock: single step stops, continuous play advances, pause/back/reset cancel motion', () => {
  const tick = s => reducePlayer(s, { type: 'tick', delta: 1, phases: 3, length: 2 });
  let s = reducePlayer(playerInitial, { type: 'next', length: 2 });
  s = tick(tick(tick(s))); assert.equal(s.index, 1); assert.equal(s.phase, -1);
  s = reducePlayer(playerInitial, { type: 'play', length: 2 });
  s = tick(tick(tick(s))); assert.equal(s.index, 1); assert.equal(s.phase, 0);
  s = reducePlayer(s, { type: 'pause' }); assert.deepEqual(tick(s), s);
  const singleResume = reducePlayer(s, { type: 'next', length: 2 });
  assert.equal(singleResume.paused, false); assert.equal(singleResume.auto, false);
  const back = reducePlayer(s, { type: 'back' }); assert.equal(back.index, 1); assert.equal(back.phase, -1);
  assert.deepEqual(reducePlayer(back, { type: 'back' }), playerInitial);
  s = reducePlayer(s, { type: 'play', length: 2 });
  s = tick(tick(tick(s))); assert.equal(s.index, 2); assert.equal(s.phase, -1); assert.equal(s.auto, false);
  assert.deepEqual(reducePlayer(s, { type: 'reset' }), playerInitial);
});
