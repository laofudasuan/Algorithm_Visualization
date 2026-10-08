import test from 'node:test';
import assert from 'node:assert/strict';
import { MOUSE_HOLE_CASES, buildMouseHoleTrace, mouseHoleGraph, pairCost } from '../mouseHoleModel.js';
import { buildGraphActions } from '../mouseHoleActions.js';
import { graphVisual, interpolateVisual, mouseHoleTravelRoute, travelGeometry } from '../mouseHoleMotion.js';

test('every number-line sweep follows connected real arcs, with the correct cost and reverse direction', () => {
  let roads = 0, reversed = 0, zero = 0;
  const cases = [...MOUSE_HOLE_CASES, { id: 'negative-coordinates', mode: 'flow', mice: [-5, 0], holes: [-6, -1] }];
  for (const c of cases.filter(c => ['flow', 'capacityDP', 'prune'].includes(c.mode))) {
    for (const action of buildGraphActions(c, buildMouseHoleTrace(c)).actions) for (const cue of action.phases.filter(p => p.kind === 'travel')) {
      const graph = mouseHoleGraph(c, cue.frame, 'line'), route = mouseHoleTravelRoute(c, graph, cue, 'line');
      assert.ok(route.length > 0, `${c.id}: ${cue.title}`);
      assert.equal(route[0].source, cue.edge.u); assert.equal(route.at(-1).target, cue.edge.v);
      route.slice(1).forEach((e, i) => assert.equal(route[i].target, e.source));
      const pair = /^[mh]/.test(cue.edge.u) && /^[mh]/.test(cue.edge.v);
      if (pair) {
        const reverse = cue.edge.u.startsWith('h');
        const i = Number((reverse ? cue.edge.v : cue.edge.u).slice(1)), j = Number((reverse ? cue.edge.u : cue.edge.v).slice(1));
        assert.equal(route.reduce((s, e) => s + e.cost, 0), (reverse ? -1 : 1) * pairCost(c, i, j) || 0);
        route.forEach(e => assert.equal(e.reverse, reverse));
        if (reverse) reversed++;
        if (c.mice[i] === c.holes[j]) { zero++; assert.equal(route.length, 2); }
      }
      roads += route.filter(e => /east|west/.test(e.id)).length;
      const start = graph.nodes.find(n => n.id === cue.edge.u), end = graph.nodes.find(n => n.id === cue.edge.v);
      assert.deepEqual(travelGeometry(graph, route, 0).point, { x: start.x, y: start.y });
      const final = travelGeometry(graph, route, 1);
      assert.ok(Math.abs(final.point.x - end.x) < 1e-8 && Math.abs(final.point.y - end.y) < 1e-8);
      assert.ok(final.paths.every(p => Math.abs(p.fraction - 1) < 1e-8));
      for (const t of [.1, .4, .7]) {
        const g = travelGeometry(graph, route, t);
        assert.ok(Number.isFinite(g.point.x) && Number.isFinite(g.point.y));
        assert.ok(g.paths.every(p => p.fraction >= 0 && p.fraction <= 1));
      }
    }
  }
  assert.ok(roads > 0 && reversed > 0 && zero > 0);
});

test('node colors, edge widths and arrow sizes have real intermediate states without changing model data', () => {
  const c = MOUSE_HOLE_CASES.find(c => c.id === 'regret');
  const actions = buildGraphActions(c, buildMouseHoleTrace(c)).actions;
  const action = actions.find(a => a.label.startsWith('撤销'));
  const before = graphVisual(mouseHoleGraph(c, action.phases[0].frame, 'line'));
  const after = graphVisual(mouseHoleGraph(c, action.after, 'line'));
  const saved = structuredClone([before, after]), mid = interpolateVisual(before, after, .5);
  let animated = 0;
  before.edges.forEach((e, i) => {
    if (e.style.lineWidth === after.edges[i].style.lineWidth) return;
    animated++;
    assert.equal(mid.edges[i].style.lineWidth, (e.style.lineWidth + after.edges[i].style.lineWidth) / 2);
    assert.equal(mid.edges[i].style.arrowSize, (e.style.arrowSize + after.edges[i].style.arrowSize) / 2);
  });
  assert.ok(animated > 0);
  assert.equal(interpolateVisual('#000000', '#ffffff', .5), '#808080');
  assert.deepEqual(interpolateVisual(before, after, 0), before);
  assert.deepEqual(interpolateVisual(before, after, 1), after);
  assert.deepEqual([before, after], saved);
  // A rewind starts at the visible midpoint, not the previous target.
  const back = interpolateVisual(mid, before, .5);
  assert.deepEqual(interpolateVisual(mid, before, 0), mid);
  assert.notDeepEqual(back, before);
});

test('curved-edge sweeps use the same cubic control points as GraphCanvas', () => {
  const graph = { nodes: [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 100, y: 0 }] };
  const g = travelGeometry(graph, [{ id: 'ab', source: 'a', target: 'b', style: { curvature: .2 } }], .5);
  assert.equal(g.paths[0].d, 'M0,0 C50,20 50,20 100,0');
  assert.ok(Math.abs(g.point.x - 50) < 1e-8); assert.ok(Math.abs(g.point.y - 15) < 1e-8);
});
