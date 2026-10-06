import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PixiGraphRenderer } from '../../animation/PixiGraphRenderer.js';
import { GIFT_GRAPH_COLORS, GIFT_GRAPH_EXAMPLES, giftGraphData, giftScore, optimalGiftColorings } from '../giftGraphExamples.js';

test('changing an edge during its entrance animation preserves the new color', t => {
  let now = 0;
  const frames = [];
  const originalFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = callback => frames.push(callback);
  t.after(() => {
    if (originalFrame === undefined) delete globalThis.requestAnimationFrame;
    else globalThis.requestAnimationFrame = originalFrame;
  });
  t.mock.method(Date, 'now', () => now);
  const edge = {
    startX: 20, startY: 20, endX: 100, endY: 100,
    style: { stroke: GIFT_GRAPH_COLORS.coachA, lineWidth: 15, directional: false },
    clear() {}, moveTo() {}, lineTo() {},
    stroke({ color }) { this.lastColor = color; },
  };
  const renderer = Object.assign(Object.create(PixiGraphRenderer.prototype), {
    app: { stage: {}, renderer: { render() {} } },
    edgeObjects: new Map([['e1', edge]]), edgeLabelObjects: new Map(),
    defaultEdgeStyle: {}, globalEdgesStyle: {},
  });
  renderer.animateEdgeAppearance('e1', 1000);
  now = 100;
  frames.shift()();
  renderer.updateEdgeStyle('e1', { ...edge.style, stroke: GIFT_GRAPH_COLORS.coachB });
  assert.equal(edge.lastColor, GIFT_GRAPH_COLORS.coachB);
  now = 1000;
  frames.shift()();
  assert.equal(edge.lastColor, GIFT_GRAPH_COLORS.coachB);
  assert.equal(edge.style.stroke, GIFT_GRAPH_COLORS.coachB);
});

test('JSON graphs share reference styles while retaining lesson layout and interaction colors', () => {
  const reference = JSON.parse(readFileSync(new URL('../../../data/graphs/ExampleGraph-500-300.json', import.meta.url), 'utf8'));
  for (const example of GIFT_GRAPH_EXAMPLES) {
    const original = JSON.stringify(example.graph);
    assert.deepEqual(example.graph.nodesStyle, { ...reference.nodesStyle, fill: GIFT_GRAPH_COLORS.reached, stroke: '#334155' });
    assert.equal(example.graph.edgesStyle.lineWidth, reference.edgesStyle.lineWidth);
    assert.equal(example.graph.width, 540);
    assert.equal(example.graph.height, 300);
    for (const mask of [0, optimalGiftColorings(example).masks[0]]) {
      const data = giftGraphData(example, mask);
      assert.deepEqual(data.nodesStyle, { ...reference.nodesStyle, fill: GIFT_GRAPH_COLORS.reached, stroke: '#334155' });
      const { vertices } = giftScore(example, mask);
      data.nodes.forEach((node, i) => {
        assert.equal(node.style.stroke, '#334155', 'node outline must not depend on score');
        assert.equal(node.style.fill, vertices[i].score < vertices[i].upper ? GIFT_GRAPH_COLORS.deficit : GIFT_GRAPH_COLORS.reached);
        assert.equal(node.style.type, reference.nodesStyle.type);
        assert.equal(node.style.size, reference.nodesStyle.size);
        assert.ok(node.x >= node.style.size / 2 && node.x <= data.width - node.style.size / 2);
        assert.ok(node.y >= node.style.size / 2 && node.y <= data.height - node.style.size / 2);
      });
      data.edges.forEach((edge, i) => {
        assert.equal(edge.style.lineWidth, reference.edgesStyle.lineWidth);
        assert.equal(edge.style.stroke, (mask >> i) & 1 ? GIFT_GRAPH_COLORS.coachB : GIFT_GRAPH_COLORS.coachA);
        assert.equal(edge.label, undefined, 'edges should not have labels');
        assert.equal(edge.style.directional, false);
      });
    }
    assert.equal(JSON.stringify(example.graph), original, 'color switching must not mutate JSON data');
  }
  const parallels = giftGraphData(GIFT_GRAPH_EXAMPLES[7], 1).edges;
  assert.equal(parallels[0].style.curvature, -parallels[1].style.curvature);
  assert.equal(giftGraphData(GIFT_GRAPH_EXAMPLES[6], 0).edges[0].style.selfLoopRadius, 40);
});

test('all eight examples have the stated optima under independent coach-assignment enumeration', () => {
  for (const example of GIFT_GRAPH_EXAMPLES) {
    const optimum = optimalGiftColorings(example);
    const totals = [];
    for (let mask = 0; mask < 2 ** example.edges.length; mask++) {
      const visits = [new Set(), new Set()];
      example.edges.forEach(([a, b], i) => { visits[(mask >> i) & 1].add(a); visits[(mask >> i) & 1].add(b); });
      const total = visits[0].size + visits[1].size;
      totals.push(total);
      const actual = giftScore(example, mask);
      assert.equal(actual.score, total, example.name);
      assert.ok(actual.score <= actual.upper);
    }
    assert.equal(Math.max(...totals), example.expected, example.name);
    assert.equal(optimum.best, example.expected);
    assert.deepEqual(optimum.masks, totals.flatMap((v, i) => v === example.expected ? [i] : []));
  }
});

test('team incidence counts loops once and keeps parallel teams distinct', () => {
  const single = giftScore(GIFT_GRAPH_EXAMPLES[0], 0);
  assert.equal(single.upper, 2);
  assert.equal(2 * single.vertices.length - single.score, 2, '2|V| is too loose for the claimed gap');
  const loop = giftScore(GIFT_GRAPH_EXAMPLES[6], 0);
  assert.deepEqual(loop.vertices, [{ id: 'A', teams: 1, upper: 1, score: 1 }]);
  assert.equal(giftScore(GIFT_GRAPH_EXAMPLES[7], 1).score, 4);
  assert.equal(giftScore({ nodes: [{ id: 'A' }], edges: [] }, 0).upper, 0);
  assert.equal(giftScore({ nodes: [{ id: 'A' }], edges: [['A', 'A'], ['A', 'A']] }, 1).score, 2);
});
