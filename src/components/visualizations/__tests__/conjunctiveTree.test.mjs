import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { CONJUNCTIVE_CASES, buildConjunctiveTree, computeLeftBounds, flattenTree, childRanks, countContinuous, minimumCover, validatePermutation } from '../conjunctiveTreeModel.js';

// Independent definition oracle: sort the values of each interval, then test
// every pair for partial overlap. It does not use the gap formula or a stack.
function oracle(p) {
  const intervals = [];
  for (let l = 1; l <= p.length; l++) for (let r = l; r <= p.length; r++) {
    const values = p.slice(l - 1, r).sort((a, b) => a - b);
    if (values.every((x, i) => i === 0 || x === values[i - 1] + 1)) intervals.push({ l, r });
  }
  const strong = intervals.filter(a => !intervals.some(b =>
    (a.l < b.l && b.l <= a.r && a.r < b.r) || (b.l < a.l && a.l <= b.r && b.r < a.r)));
  return { intervals, strong };
}
const keys = list => list.map(u => `${u.l}:${u.r}`).sort();
const small = [];
function permutations(p, at = 0) {
  if (at === p.length) { small.push([...p]); return; }
  for (let j = at; j < p.length; j++) {
    [p[at], p[j]] = [p[j], p[at]]; permutations(p, at + 1); [p[at], p[j]] = [p[j], p[at]];
  }
}
for (let n = 1; n <= 8; n++) permutations(Array.from({ length: n }, (_, i) => i + 1));
let seed = 20261001;
const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
const randomCases = Array.from({ length: 300 }, () => {
  const p = Array.from({ length: 3 + random(10) }, (_, i) => i + 1);
  for (let i = p.length - 1; i > 0; i--) { const j = random(i + 1); [p[i], p[j]] = [p[j], p[i]]; }
  return p;
});

test('all 46,233 permutations through n=8 and 300 random cases match the strong-interval oracle', () => {
  for (const p of [...small, ...randomCases]) {
    const { intervals, strong } = oracle(p);
    const { root, bounds } = buildConjunctiveTree(p);
    const nodes = flattenTree(root);
    assert.deepEqual(keys(nodes), keys(strong), `strong intervals: ${p}`);
    assert.equal(countContinuous(root), intervals.length, `count: ${p}`);
    assert.ok(nodes.length <= 2 * p.length - 1);
    for (let r = 1; r <= p.length; r++) assert.equal(bounds[r - 1], Math.min(...intervals.filter(u => u.r === r).map(u => u.l)));
    for (const u of nodes) {
      if (u.type === 'leaf') { assert.equal(u.l, u.r); continue; }
      assert.equal(u.children[0].l, u.l); assert.equal(u.children.at(-1).r, u.r);
      u.children.forEach((c, i) => { if (i) assert.equal(c.l, u.children[i - 1].r + 1); });
      const rank = childRanks(u), k = rank.length;
      if (u.type === 'up') assert.deepEqual(rank, Array.from({ length: k }, (_, i) => i + 1));
      if (u.type === 'down') assert.deepEqual(rank, Array.from({ length: k }, (_, i) => k - i));
      if (u.type === 'prime') {
        assert.ok(k >= 4);
        for (let a = 0; a < k; a++) for (let b = a + 1; b < k; b++) {
          if (a === 0 && b === k - 1) continue;
          assert.ok(!intervals.some(x => x.l === u.children[a].l && x.r === u.children[b].r));
        }
      }
    }
    for (let l = 1; l <= p.length; l++) for (let r = l; r <= p.length; r++) {
      const expected = intervals.filter(u => u.l <= l && r <= u.r).sort((a, b) => (a.r - a.l) - (b.r - b.l))[0];
      const actual = minimumCover(root, l, r);
      assert.deepEqual([actual.l, actual.r], [expected.l, expected.r], `cover: ${p} [${l},${r}]`);
    }
  }
});

test('teaching snapshots preserve old states and show exact range updates', () => {
  const kinds = new Set();
  for (const { p } of CONJUNCTIVE_CASES) {
    const copy = [...p];
    const { events, root } = buildConjunctiveTree(p, true);
    events.forEach(e => {
      kinds.add(e.kind);
      const pieces = [...e.forest, ...(e.collected || []).slice().reverse(), ...(e.current ? [e.current] : [])];
      assert.equal(pieces[0].l, 1); assert.equal(pieces.at(-1).r, e.r);
      pieces.forEach((u, i) => { if (i) assert.equal(pieces[i - 1].r + 1, u.l); });
    });
    assert.equal(events[0].current.type, 'leaf');
    assert.equal(events[0].current.children.length, 0);
    assert.notEqual(events.at(-1).forest[0], root);
    const gaps = computeLeftBounds(p, true).events;
    for (let i = 0; i < gaps.length; i++) {
      const e = gaps[i];
      if (e.range) for (let j = 0; j < p.length; j++) {
        const d = j + 1 >= e.range[0] && j + 1 <= e.range[1] ? e.delta : 0;
        assert.equal(e.q[j], gaps[i - 1].q[j] === null ? null : gaps[i - 1].q[j] + d);
      }
      if (e.kind === 'done') for (let l = 1; l <= e.r; l++) {
        const values = p.slice(l - 1, e.r).sort((a, b) => a - b);
        const missing = Array.from({ length: values.at(-1) - values[0] + 1 }, (_, j) => values[0] + j).filter(x => !values.includes(x));
        assert.equal(e.q[l - 1], missing.length);
      }
    }
    assert.deepEqual(p, copy);
  }
  for (const kind of ['append', 'merge', 'collect', 'prime', 'push']) assert.ok(kinds.has(kind));
  assert.equal(validatePermutation([1, 1]), false);
  assert.equal(validatePermutation([1, 3]), false);
  assert.equal(validatePermutation([1]), true);
});

test('100,000 monotone elements use a flat tree and a 64-bit-sized count', () => {
  const n = 100000;
  for (const p of [Array.from({ length: n }, (_, i) => i + 1), Array.from({ length: n }, (_, i) => n - i)]) {
    const { root } = buildConjunctiveTree(p);
    assert.equal(root.children.length, n);
    assert.equal(flattenTree(root).length, n + 1);
    assert.equal(countContinuous(root), n * (n + 1) / 2);
  }
});

test('the actual C++ lesson compiles strictly and its node intervals, types, L and counts match', () => {
  const page = fs.readFileSync(new URL('../../../data/courseware/pages/Sequence/Conjunctive_Tree.mdx', import.meta.url), 'utf8');
  const [match] = [...page.matchAll(/```cpp[^\r\n]*\r?\n([\s\S]*?)```/g)];
  assert.ok(match);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-conjunctive-check-'));
  const exe = path.join(dir, process.platform === 'win32' ? 'check.exe' : 'check');
  const driver = `\n#undef main\nint main(){int tests;cin>>tests;while(tests--){int n;cin>>n;vector<int> p(n+1);for(int i=1;i<=n;i++)cin>>p[i];DivideCombineTree t(move(p));cout<<t.count()<<' '<<t.node.size();for(int i=1;i<=n;i++)cout<<' '<<t.leftmost[i];for(auto &u:t.node)cout<<' '<<u.l<<' '<<u.r<<' '<<u.kind;cout<<'\\n';}return 0;}\n`;
  try {
    const compiled = spawnSync('g++', ['-x', 'c++', '-std=c++17', '-O2', '-Wall', '-Wextra', '-Wconversion', '-Wshadow', '-pedantic', '-o', exe, '-'], {
      input: '#define main lesson_main\n' + match[1] + driver, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
    });
    assert.equal(compiled.status, 0, compiled.stderr || compiled.error?.message);
    assert.equal(compiled.stderr, '');
    const cases = [...small.filter(p => p.length <= 7), ...randomCases,
      Array.from({ length: 100000 }, (_, i) => i + 1), Array.from({ length: 100000 }, (_, i) => 100000 - i)];
    const input = `${cases.length}\n` + cases.map(p => `${p.length}\n${p.join(' ')}`).join('\n');
    const run = spawnSync(exe, [], { input, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    assert.equal(run.status, 0, run.stderr);
    const lines = run.stdout.trim().split(/\r?\n/);
    assert.equal(lines.length, cases.length);
    cases.forEach((p, i) => {
      const [count, size, ...rest] = lines[i].split(' ').map(Number);
      const { root, bounds } = buildConjunctiveTree(p);
      assert.equal(count, countContinuous(root));
      assert.deepEqual(rest.slice(0, p.length), bounds);
      const triples = rest.slice(p.length);
      assert.equal(triples.length, size * 3);
      const actual = Array.from({ length: size }, (_, j) => triples.slice(j * 3, j * 3 + 3).join(':')).sort();
      const expected = flattenTree(root).map(u => `${u.l}:${u.r}:${({ leaf: 0, up: 1, down: -1, prime: 2 })[u.type]}`).sort();
      assert.deepEqual(actual, expected, p.join(' '));
    });
  } finally {
    if (path.dirname(exe) === dir && dir.startsWith(path.join(os.tmpdir(), 'codex-conjunctive-check-'))) {
      if (fs.existsSync(exe)) fs.unlinkSync(exe);
      fs.rmdirSync(dir);
    }
  }
});
