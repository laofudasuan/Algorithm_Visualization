import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { HULL_CASES, HULL_DEFINITION, cross, hullTrace, monotoneHull, pointLocation, polygonArea } from '../convexHullModel.js';

const key = p => `${p.x},${p.y}`;
const vertexSet = points => points.map(key).sort();
const named = points => points.map(([x, y], i) => ({ x, y, id: String(i) }));
const bigCross = (a, b, c) => (BigInt(b.x) - BigInt(a.x)) * (BigInt(c.y) - BigInt(a.y)) - (BigInt(b.y) - BigInt(a.y)) * (BigInt(c.x) - BigInt(a.x));
const bigDist = (a, b) => (BigInt(a.x) - BigInt(b.x)) ** 2n + (BigInt(a.y) - BigInt(b.y)) ** 2n;

// Independent Jarvis oracle: no sorting scan, no stack, exact BigInt predicates.
function oracle(points) {
  const unique = [...new Map(points.map(p => [key(p), p])).values()];
  if (unique.length <= 1) return unique;
  const start = unique.reduce((a, b) => a.x < b.x || (a.x === b.x && a.y < b.y) ? a : b);
  const hull = [];
  let current = start;
  do {
    hull.push(current);
    let next = unique.find(p => p !== current);
    for (const p of unique) {
      const turn = bigCross(current, next, p);
      if (turn < 0n || (turn === 0n && bigDist(current, p) > bigDist(current, next))) next = p;
    }
    current = next;
    assert.ok(hull.length <= unique.length);
  } while (current !== start);
  return hull;
}

const cases = [[], [{ x: 2, y: 3, id: 'A' }], HULL_DEFINITION.points, ...HULL_CASES.map(c => c.points), named([[2, 3], [2, 3]]), named([[4, 1], [-2, 7]])];
const grid = Array.from({ length: 9 }, (_, i) => [i % 3, Math.floor(i / 3)]);
for (let mask = 0; mask < 512; mask++) cases.push(named(grid.filter((_, i) => mask & (1 << i))));
let seed = 20260928;
const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
for (let t = 0; t < 300; t++) cases.push(named(Array.from({ length: 1 + random(25) }, () => [random(17) - 8, random(17) - 8])));

test('both scans match exact Jarvis on 512 grid subsets, 300 random cases and degeneracies', () => {
  for (const points of cases) {
    const original = JSON.stringify(points);
    const expected = vertexSet(oracle(points));
    assert.deepEqual(vertexSet(monotoneHull(points)), expected);
    for (const method of ['graham', 'andrew']) {
      const trace = hullTrace(points, method);
      assert.deepEqual(vertexSet(trace.hull), expected);
      if (trace.hull.length >= 3) {
        trace.hull.forEach((p, i) => {
          const q = trace.hull[(i + 1) % trace.hull.length];
          assert.ok(points.every(r => cross(p, q, r) >= 0));
          assert.ok(cross(p, q, trace.hull[(i + 2) % trace.hull.length]) > 0);
        });
      }
      trace.events.forEach((event, i) => {
        if (event.triple) assert.equal(event.value, cross(...event.triple));
        if (event.kind === 'pop') {
          assert.ok(event.value <= 0);
          assert.equal(trace.events[i - 1].kind, 'check');
          assert.equal(trace.events[i - 1].stack.length - 1, event.stack.length);
        }
      });
    }
    assert.equal(JSON.stringify(points), original);
  }
});

test('definition distinguishes an extreme point, a boundary point and an interior point', () => {
  const points = HULL_DEFINITION.points;
  const hull = monotoneHull(points);
  assert.equal(polygonArea(hull), 26);
  assert.deepEqual(hull.map(p => p.id), ['J', 'A', 'E', 'F', 'G', 'I']);
  hull.forEach((p, i) => {
    const q = hull[(i + 1) % hull.length];
    assert.notEqual(p.x, q.x, 'no vertical hull edges');
    assert.notEqual(p.y, q.y, 'no horizontal hull edges');
  });
  assert.equal(pointLocation(points[0], hull), '凸包顶点');
  assert.equal(pointLocation(points[7], hull), '边界上的非顶点');
  assert.equal(pointLocation(points[1], hull), '内部');
  assert.equal(pointLocation(points[2], hull), '内部');
  assert.equal(pointLocation(points[3], hull), '内部');
  const onEdge = points.map(p => p.id === 'B' ? { ...p, x: 5 } : p);
  assert.equal(pointLocation(onEdge[1], monotoneHull(onEdge)), '边界上的非顶点');
  assert.deepEqual(vertexSet(monotoneHull(onEdge)), vertexSet(hull));
  const moved = points.map(p => p.id === 'B' ? { ...p, x: 6 } : p);
  assert.equal(pointLocation(moved[1], monotoneHull(moved)), '凸包顶点');
  assert.equal(polygonArea(monotoneHull(moved)), 28);
  assert.equal(pointLocation({ x: 2, y: 0 }, named([[0, 0], [1, 0]])), '外部');
});

test('loose and concave outlines enclose the scatter throughout the slider range', () => {
  // Ray casting also works for the non-convex counterexample.
  const contains = (polygon, p) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [ax, ay] = polygon[j];
      const [bx, by] = polygon[i];
      if (Math.abs((bx - ax) * (p.y - ay) - (by - ay) * (p.x - ax)) < 1e-9 &&
          p.x >= Math.min(ax, bx) && p.x <= Math.max(ax, bx) &&
          p.y >= Math.min(ay, by) && p.y <= Math.max(ay, by)) return true;
      if ((ay > p.y) !== (by > p.y) && p.x < ax + (p.y - ay) * (bx - ax) / (by - ay)) inside = !inside;
    }
    return inside;
  };
  const { outlines, points, witnesses } = HULL_DEFINITION;
  const outer = named(outlines.loose);
  outer.forEach((p, i) => assert.ok(cross(p, outer[(i + 1) % outer.length], outer[(i + 2) % outer.length]) > 0));
  for (let x = -1; x <= 7; x += 0.5) {
    const moved = points.map(p => p.id === 'B' ? { ...p, x } : p);
    for (const polygon of Object.values(outlines)) {
      assert.ok(moved.every(p => contains(polygon, p)), `all points enclosed at B.x=${x}`);
    }
    assert.equal(pointLocation(moved.find(p => p.id === 'H'), monotoneHull(moved)), '边界上的非顶点');
  }
  assert.ok(witnesses.every(p => contains(outlines.concave, p)));
  assert.equal(contains(outlines.concave, { x: (witnesses[0].x + witnesses[1].x) / 2, y: witnesses[0].y }), false);
});

test('the actual three C++ blocks in the lesson compile and match the independent oracle', () => {
  const page = fs.readFileSync(new URL('../../../data/courseware/pages/Geometry/Convex-Hull.mdx', import.meta.url), 'utf8');
  const code = [...page.matchAll(/```cpp[^\r\n]*\r?\n([\s\S]*?)```/g)].map(match => match[1]);
  assert.equal(code.length, 3);
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-hull-check-'));
  const executable = path.join(temp, process.platform === 'win32' ? 'hull-test.exe' : 'hull-test');
  const driver = `\n#include <iostream>\nint main(){int t;std::cin>>t;while(t--){int n;std::cin>>n;vector<Point> p(n);for(auto &a:p) std::cin>>a.x>>a.y;for(int mode=0;mode<2;mode++){auto h=mode?andrew(p):graham(p);std::cout<<h.size();for(auto a:h)std::cout<<' '<<a.x<<' '<<a.y;std::cout<<'\\n';}}}\n`;
  try {
    const compiled = spawnSync('g++', ['-x', 'c++', '-std=c++17', '-O2', '-Wall', '-Wextra', '-Wconversion', '-Wshadow', '-o', executable, '-'], { input: code.join('\n') + driver, encoding: 'utf8' });
    assert.equal(compiled.status, 0, compiled.error?.message || compiled.stderr);
    assert.equal(compiled.stderr, '', 'C++ should compile without warnings');
    const large = named([[-1e9, -1e9], [1e9, -1e9], [1e9, 1e9], [-1e9, 1e9], [0, 0], [1e9, 0]]);
    const inputCases = [...cases, large];
    const input = `${inputCases.length}\n` + inputCases.map(p => `${p.length}\n${p.map(q => `${q.x} ${q.y}`).join('\n')}`).join('\n');
    const run = spawnSync(executable, [], { input, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    const lines = run.stdout.trim().split(/\r?\n/);
    assert.equal(lines.length, inputCases.length * 2);
    inputCases.forEach((points, i) => {
      for (let method = 0; method < 2; method++) {
        const [count, ...coordinates] = lines[2 * i + method].trim().split(/\s+/).map(Number);
        assert.equal(coordinates.length, count * 2);
        const result = Array.from({ length: count }, (_, j) => ({ x: coordinates[2 * j], y: coordinates[2 * j + 1] }));
        assert.deepEqual(vertexSet(result), vertexSet(oracle(points)));
        if (result.length >= 3) result.forEach((p, j) => assert.ok(points.every(r => bigCross(p, result[(j + 1) % result.length], r) >= 0n)));
      }
    });
  } finally {
    // Only remove the uniquely-created compiler output, never a workspace path.
    if (path.dirname(executable) === temp && temp.startsWith(path.join(os.tmpdir(), 'codex-hull-check-'))) {
      if (fs.existsSync(executable)) fs.unlinkSync(executable);
      fs.rmdirSync(temp);
    }
  }
});
