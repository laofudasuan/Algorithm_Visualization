import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import katex from 'katex';
import { compile } from '@mdx-js/mdx';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeKatex from 'rehype-katex';
import { MOUSE_HOLE_CASES as cases, buildMouseHoleTrace as trace, pairCost, directionalSelection, mouseHoleGraph } from '../mouseHoleModel.js';

// Independent exhaustive assignment (not the ordered DP or heap recurrence).
function brute(c, { left = false, profit = false } = {}) {
  let best = profit ? 0 : Infinity;
  const used = c.holes.map(() => 0);
  function search(i, cost) {
    if (i === c.mice.length) { best = profit ? Math.max(best, cost) : Math.min(best, cost); return; }
    if (profit) search(i + 1, cost);
    c.holes.forEach((y, j) => {
      if (used[j] >= (c.capacities?.[j] ?? 1) || (left && y > c.mice[i])) return;
      used[j]++;
      search(i + 1, cost + (profit ? c.mice[i] - y + (c.weights?.[j] ?? 0) : Math.abs(c.mice[i] - y) + (c.weights?.[j] ?? 0)));
      used[j]--;
    });
  }
  search(0, 0); return best;
}
function bruteCover(c) {
  const n = c.mice.length, m = c.holes.length; let best = Infinity;
  for (let mask = 0; mask < 2 ** (n * m); mask++) {
    const ms = new Set(), hs = new Set(); let cost = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) if (mask & (1 << (i * m + j))) {
      ms.add(i); hs.add(j); cost += Math.abs(c.mice[i] - c.holes[j]);
    }
    if (ms.size === n && hs.size === m) best = Math.min(best, cost);
  }
  return best;
}
let seed = 17143;
const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
const generate = () => ({ mice: Array.from({ length: 1 + rand(4) }, () => rand(9) - 4), holes: Array.from({ length: 1 + rand(4) }, () => rand(9) - 4) });
function checkResult(c, expected) {
  const last = trace(c).at(-1);
  assert.equal(last.feasible, Number.isFinite(expected), JSON.stringify(c));
  if (Number.isFinite(expected)) assert.equal(last.total, expected, JSON.stringify(c));
}

test('1,200 random assignments: stack, signed DP, two heaps, flow, capacity DP, reward heap', () => {
  for (let t = 0; t < 1200; t++) {
    const c = generate(), expected = brute(c);
    for (const mode of ['signedDP', 'heap', 'flow', 'capacityDP']) checkResult({ ...c, mode }, expected);
    checkResult({ ...c, mode: 'stack' }, brute(c, { left: true }));
    const weighted = { ...c, weights: c.holes.map(() => rand(9) - 4) };
    checkResult({ ...weighted, mode: 'profit' }, brute(weighted, { left: true, profit: true }));
    const capacity = { ...weighted, capacities: c.holes.map(() => rand(4)) };
    for (const mode of ['flow', 'capacityDP']) checkResult({ ...capacity, mode }, brute(capacity));
    // The unweighted directional pruning lemma, counted as multiplicities.
    const merged = new Map(); c.holes.forEach(y => merged.set(y, (merged.get(y) ?? 0) + 1 + rand(4)));
    const capOnly = { mice: c.mice, holes: [...merged.keys()], capacities: [...merged.values()] };
    const l = directionalSelection(capOnly, 1).used, r = directionalSelection(capOnly, -1).used;
    assert.equal(brute({ ...capOnly, capacities: l.map((x, j) => Math.min(capOnly.capacities[j], x + r[j])) }), brute(capOnly), JSON.stringify({ capOnly, l, r }));
  }
});

test('300 two-sided covers against independent edge-subset enumeration', () => {
  for (let t = 0; t < 300; t++) {
    const c = { mode: 'cover', mice: Array.from({ length: 1 + rand(3) }, () => rand(7) - 3), holes: Array.from({ length: 1 + rand(3) }, () => rand(7) - 3) };
    checkResult(c, bruteCover(c));
  }
});

test('heap and signed DP prefix costs; same-coordinate pruning regression', () => {
  for (let t = 0; t < 100; t++) {
    const c = generate(), lo = Math.min(0, ...c.mice, ...c.holes), hi = Math.max(0, ...c.mice, ...c.holes);
    const virtual = lo - (c.mice.length + 1) * (hi - lo + 1);
    for (const mode of ['heap', 'signedDP']) for (const f of trace({ ...c, mode }).slice(1)) {
      const prefix = { mice: c.mice.filter((_, i) => f.processed.includes(`m${i}`)), holes: c.holes.filter((_, j) => f.processed.includes(`h${j}`)) };
      if (mode === 'heap') prefix.holes.push(...Array(c.mice.length).fill(virtual));
      assert.equal(f.total ?? Infinity, brute(prefix));
    }
  }
  const tied = { mice: [-4, 4], holes: [0, 0], capacities: [1, 1] };
  const l = directionalSelection(tied, 1).used, r = directionalSelection(tied, -1).used;
  assert.equal(brute({ ...tied, capacities: l.map((v, j) => Math.min(1, v + r[j])) }), Infinity);
  assert.equal(brute({ mice: [-4, 4], holes: [0], capacities: [2] }), 8);
});

test('residual capacities, reverse signs, conservation and each augmentation delta', () => {
  const inputs = [...cases.filter(c => ['flow', 'cover'].includes(c.mode)), ...Array.from({ length: 100 }, () => ({ ...generate(), mode: 'flow' }))];
  for (const c of inputs) {
    const frames = trace(c);
    for (let t = 0; t < frames.length; t++) {
      const f = frames[t], arcs = f.network.arcs;
      const balance = new Map(f.network.nodes.map(v => [v, 0]));
      for (const a of arcs) {
        const r = arcs[a.reverse];
        assert.ok(a.cap >= 0);
        assert.equal(a.u, r.v); assert.equal(a.v, r.u); assert.ok(a.cost === -r.cost);
        assert.equal(a.cap + r.cap, a.initial + r.initial);
        if (a.forward) { const flow = a.initial - a.cap; balance.set(a.u, balance.get(a.u) - flow); balance.set(a.v, balance.get(a.v) + flow); }
      }
      for (const [v, b] of balance) if (!['S', 'T'].includes(v)) assert.equal(b, 0);
      assert.equal(f.total, f.pairs.reduce((sum, [i, j]) => sum + pairCost(c, i, j), 0));
      if (!f.path.length) continue;
      assert.equal(f.path[0].u, 'S'); assert.equal(f.path.at(-1).v, 'T');
      f.path.forEach((a, i) => { assert.ok(a.cap >= 1); if (i) assert.equal(f.path[i - 1].v, a.u); });
      const after = frames[t + 1];
      for (const a of arcs) {
        const delta = f.path.some(p => p.id === a.id) ? -1 : f.path.some(p => p.reverse === a.id) ? 1 : 0;
        assert.equal(after.network.arcs[a.id].cap, a.cap + delta);
      }
      const objective = fr => fr.total - (c.mode === 'cover' ? f.network.penalty * (new Set(fr.pairs.map(p => p[0])).size + new Set(fr.pairs.map(p => p[1])).size) : 0);
      assert.equal(objective(after) - objective(f), f.path.reduce((sum, a) => sum + a.cost, 0));
      assert.equal(after.delta, after.total - f.total);
    }
  }
});

test('prefix reward witnesses and ordered DP rows match exhaustive optimization', () => {
  for (const c of cases.filter(c => ['profit', 'capacityDP'].includes(c.mode))) {
    for (const f of trace(c).slice(1)) {
      if (c.mode === 'profit') {
        const prefix = { mice: c.mice.filter((_, i) => f.processed.includes(`m${i}`)), holes: [], weights: [] };
        c.holes.forEach((y, j) => { if (f.processed.includes(`h${j}`)) { prefix.holes.push(y); prefix.weights.push(c.weights?.[j] ?? 0); } });
        assert.equal(f.total, brute(prefix, { left: true, profit: true }));
        assert.equal(f.total, f.pairs.reduce((s, [i, j]) => s + c.mice[i] - c.holes[j] + (c.weights?.[j] ?? 0), 0));
      } else {
        const ids = c.holes.map((_, j) => j).filter(j => f.processed.includes(`h${j}`));
        f.dp.forEach((cost, i) => assert.equal(cost, brute({ mice: [...c.mice].sort((a, b) => a - b).slice(0, i), holes: ids.map(j => c.holes[j]), weights: ids.map(j => c.weights?.[j] ?? 0), capacities: ids.map(j => c.capacities?.[j] ?? 1) })));
      }
    }
  }
});

test('22 supplied examples: expected totals, graph snapshots, formulas, immutable reversible state', () => {
  const totals = { left: 2, regret: 5, 'left-choice': 4, ties: 1, right: 8, 'signed-dp': 5, 'negative-dp': 8, heap: 5, 'heap-right': 8, profit: 7, 'profit-skip': 0, capacity: 4, 'large-capacity': 4, cover: 4, 'cover-equal': 0, fee: 2, tree: 5, batch: 15, 'repeat-batch': -42 };
  const initialCatalog = JSON.stringify(cases);
  assert.deepEqual(trace(cases.find(c => c.id === 'regret')).at(-1).comparison, { locked: 7, revised: 5 });
  for (const c of cases) {
    const frames = trace(c), saved = structuredClone(frames);
    if (Object.hasOwn(totals, c.id)) assert.equal(frames.at(-1).total, totals[c.id]);
    assert.deepEqual(frames[0].pairs, []); assert.equal(frames[0].complete, false);
    for (const f of [...frames, ...frames.toReversed(), frames[0]]) {
      if (f.formula) katex.renderToString(f.formula, { throwOnError: true });
      for (const view of ['matching', ...(f.network ? ['network'] : []), ...(['flow', 'capacityDP', 'prune'].includes(c.mode) ? ['line'] : [])]) {
        const graph = mouseHoleGraph(c, f, view), ids = new Set(graph.nodes.map(n => n.id));
        assert.equal(ids.size, graph.nodes.length);
        assert.equal(new Set(graph.edges.map(e => e.id)).size, graph.edges.length);
        graph.nodes.forEach(n => { assert.ok(n.x >= 19 && n.x <= graph.width - 19); assert.ok(n.y >= 19 && n.y <= graph.height - 19); });
        graph.edges.forEach(e => { assert.ok(ids.has(e.source) && ids.has(e.target)); if (view === 'line') assert.ok(e.cap >= 0); });
        if (view === 'line') {
          const networkCost = graph.edges.filter(e => e.reverse).reduce((s, e) => s - e.cap * e.cost, 0);
          assert.equal(networkCost, f.pairs.reduce((s, [i, j]) => s + pairCost(c, i, j), 0));
        }
      }
    }
    assert.deepEqual(frames, saved); assert.deepEqual(trace(c), saved);
  }
  assert.equal(JSON.stringify(cases), initialCatalog);
});

test('courseware compiles with strict math; all 13 problems and TikZ replacement cases present', async () => {
  const file = 'src/data/courseware/pages/Greedy/Greedy-Retrospective.mdx';
  const mdx = fs.readFileSync(file, 'utf8');
  const prefix = mdx.split('## 老鼠进洞模型')[0].replace(/import MouseHoleVisualization[^\n]*\n/, '').replace(/\r?\n/g, '\r\n');
  assert.equal(crypto.createHash('sha256').update(prefix).digest('hex'), '198058446f1feedfb6bf4b79cd97b68bb5ee900d7dbb17a401ce849a8f3b3132');
  const result = await compile(mdx, { remarkPlugins: [remarkFrontmatter, remarkGfm, remarkMath], rehypePlugins: [[rehypeKatex, { throwOnError: true, strict: 'error' }]] });
  assert.deepEqual(result.messages, []);
  for (let i = 1; i <= 13; i++) assert.match(mdx, new RegExp(`##### Problem ${i}：`));
  for (const id of ['regret', 'left-choice', 'prune-fail', 'repeat-batch']) {
    const c = cases.find(c => c.id === id);
    assert.ok(mouseHoleGraph(c, trace(c)[0], 'line').facts.length > 0);
  }
});

test('optional migration-source audit: original TeX and five source TikZ diagrams', { skip: !fs.existsSync('src/data/courseware/pages/Greedy/slide.tex') && 'Original slide.tex is no longer present in the workspace' }, () => {
  const tex = fs.readFileSync('src/data/courseware/pages/Greedy/slide.tex');
  assert.equal(crypto.createHash('sha256').update(tex).digest('hex'), 'bbf32fe7364b8dab74b0202a3f99c32949741e859eda3f628a752d30644d2f66');
  assert.equal(tex.toString().slice(tex.toString().indexOf('\\begin{frame}{Problem 1}')).match(/\\begin\{tikzpicture\}/g).length, 5);
});

test('opt-in directional arrows survive style updates, with legacy defaults untouched', async () => {
  const { PixiGraphRenderer } = await import('../../animation/PixiGraphRenderer.js');
  const edge = { startX: 20, startY: 20, endX: 100, endY: 100, clear() {}, moveTo() {}, lineTo() {}, stroke() {} };
  const calls = [];
  const renderer = { app: { stage: {}, renderer: { render() {} } }, edgeObjects: new Map([['edge', edge]]), edgeLabelObjects: new Map(), defaultEdgeStyle: {}, globalEdgesStyle: {}, drawArrow: (...args) => calls.push(args) };
  PixiGraphRenderer.prototype.updateEdgeStyle.call(renderer, 'edge', { directional: true, lineWidth: 3 });
  assert.equal(calls.length, 0);
  PixiGraphRenderer.prototype.updateEdgeStyle.call(renderer, 'edge', { directional: true, lineWidth: 3, arrowSize: 10 });
  assert.equal(calls.length, 1); assert.deepEqual(calls[0][1], { x: 20, y: 20 });
  assert.deepEqual(calls[0][2], { x: 100, y: 100 });
  PixiGraphRenderer.prototype.updateEdgeStyle.call(renderer, 'edge', { directional: false, lineWidth: 0, arrowSize: 10 });
  assert.equal(calls.length, 1);
});
