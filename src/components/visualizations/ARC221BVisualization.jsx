import React, { useMemo, useState } from 'react';
import GraphCanvas from '../animation/GraphCanvas.jsx';

const formatSet = (indices) => (indices.length ? `{${indices.join(',')}}` : '{}');

const maskToIndices = (mask, n) => {
  const indices = [];
  for (let i = 0; i < n; i++) {
    if (((mask >> i) & 1) === 1) indices.push(i + 1);
  }
  return indices;
};

const enumerateReachableStates = (n) => {
  const start = new Array(n).fill(0);
  const startKey = start.join(',');
  const parent = new Map();
  parent.set(startKey, { prev: null, action: null });

  const q = [start];
  let head = 0;

  while (head < q.length) {
    const cur = q[head++];
    for (let mask = 1; mask < 1 << n; mask++) {
      const next = cur.slice();
      for (let i = 0; i < n; i++) {
        if (((mask >> i) & 1) === 1) next[i] = mask;
      }
      const key = next.join(',');
      if (parent.has(key)) continue;
      parent.set(key, { prev: cur.join(','), action: mask });
      q.push(next);
    }
  }

  const states = [];
  for (const key of parent.keys()) {
    const arr = key.split(',').map((x) => Number(x));
    const ops = [];
    let curKey = key;
    while (true) {
      const info = parent.get(curKey);
      if (!info || info.prev === null) break;
      ops.push(info.action);
      curKey = info.prev;
    }
    ops.reverse();
    states.push({ key, a: arr, ops });
  }

  states.sort((s1, s2) => {
    for (let i = 0; i < n; i++) {
      if (s1.a[i] !== s2.a[i]) return s1.a[i] - s2.a[i];
    }
    return s1.key.localeCompare(s2.key);
  });

  return states;
};

const buildDagFromOps = (n, ops, finalA) => {
  const surviveSet = new Set(finalA.filter((x) => x !== 0));
  const lastCover = new Array(n).fill(0);
  const edgeSet = new Set();

  for (const mask of ops) {
    for (let i = 0; i < n; i++) {
      if (((mask >> i) & 1) !== 1) continue;
      const prev = lastCover[i];
      if (prev !== 0 && prev !== mask && surviveSet.has(prev) && surviveSet.has(mask)) {
        edgeSet.add(`${prev}__${mask}`);
      }
      lastCover[i] = mask;
    }
  }

  const nodes = Array.from(surviveSet).sort((a, b) => a - b).map((mask) => ({
    id: String(mask),
    label: formatSet(maskToIndices(mask, n)),
    x: 0,
    y: 0,
    style: {
      fill: 0x2563eb,
      labelFill: 0xffffff,
      labelFontSize: 18,
      size: 56
    }
  }));

  const edges = Array.from(edgeSet).map((key, i) => {
    const [source, target] = key.split('__');
    return { id: `e${i + 1}`, source, target };
  });

  return { nodes, edges };
};

const layoutDag = (nodes, edges) => {
  const ids = nodes.map((n) => n.id);
  const adj = new Map(ids.map((id) => [id, []]));
  const indeg = new Map(ids.map((id) => [id, 0]));

  for (const e of edges) {
    if (!adj.has(e.source) || !adj.has(e.target)) continue;
    adj.get(e.source).push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  }

  const level = new Map(ids.map((id) => [id, 0]));
  const q = [];
  for (const id of ids) {
    if ((indeg.get(id) ?? 0) === 0) q.push(id);
  }

  let head = 0;
  while (head < q.length) {
    const u = q[head++];
    for (const v of adj.get(u) ?? []) {
      level.set(v, Math.max(level.get(v) ?? 0, (level.get(u) ?? 0) + 1));
      indeg.set(v, (indeg.get(v) ?? 0) - 1);
      if ((indeg.get(v) ?? 0) === 0) q.push(v);
    }
  }

  const maxLevel = Math.max(0, ...Array.from(level.values()));
  const buckets = Array.from({ length: maxLevel + 1 }).map(() => []);
  for (const n of nodes) {
    buckets[level.get(n.id) ?? 0].push(n.id);
  }

  const maxBucket = Math.max(1, ...buckets.map((b) => b.length));
  const width = Math.max(720, 220 + (maxLevel + 1) * 240);
  const height = Math.max(360, 220 + maxBucket * 180);

  const positions = new Map();
  for (let lv = 0; lv < buckets.length; lv++) {
    const bucket = buckets[lv];
    const x = 110 + lv * 240;
    const startY = 140;
    for (let i = 0; i < bucket.length; i++) {
      const y = startY + i * 180;
      positions.set(bucket[i], { x, y });
    }
  }

  return { width, height, positions };
};

const ARC221BVisualization = () => {
  const [n, setN] = useState(2);

  const nn = useMemo(() => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 2;
    return Math.max(1, Math.min(6, Math.floor(x)));
  }, [n]);

  const allStates = useMemo(() => enumerateReachableStates(nn), [nn]);
  const [selectedKey, setSelectedKey] = useState(() => '0,0');

  const active = useMemo(() => {
    const found = allStates.find((s) => s.key === selectedKey) ?? allStates[0];
    return found ?? { key: '0', a: new Array(nn).fill(0), ops: [] };
  }, [allStates, selectedKey, nn]);

  const dag = useMemo(() => buildDagFromOps(nn, active.ops, active.a), [nn, active]);
  const graphData = useMemo(() => {
    const { nodes, edges } = dag;
    const { width, height, positions } = layoutDag(nodes, edges);
    for (const node of nodes) {
      const pos = positions.get(node.id);
      if (pos) {
        node.x = pos.x;
        node.y = pos.y;
      }
    }

    return {
      width,
      height,
      nodes,
      edges,
      nodesStyle: {
        type: 'circle',
        stroke: 0x0f172a,
        lineWidth: 2
      },
      edgesStyle: {
        stroke: 0xffffff,
        lineWidth: 10,
        color: 0x0f172a,
        directional: true
      }
    };
  }, [dag]);

  return (
    <div className="border rounded-lg bg-white p-4 space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          N=
          <select
            className="border rounded-md px-3 py-1 w-15"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        一共有{allStates.length}种最终序列：
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
          {allStates.map((s) => (
            <div
              key={s.key}
              className={`p-1 rounded-md border cursor-pointer transition-colors ${
                active.key === s.key
                  ? 'bg-blue-100 border-blue-500 shadow-inner'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedKey(s.key)}
            >
              <div className="text-sm font-medium">({s.a.join(', ')})</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-700 font-medium">操作序列</div>
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {active.ops.length ? (
              active.ops.map((mask, idx) => (
                <div key={`${mask}-${idx}`} className="px-3 py-2 rounded-md border bg-white text-sm text-gray-700">
                  <div className="font-medium">{formatSet(maskToIndices(mask, nn))}</div>
                  <div className="text-xs text-gray-500">x = {mask}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">（空）</div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-700 font-medium">最终序列 A</div>
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {active.a.map((v, i) => (
              <div key={i} className="px-3 py-2 rounded-md border bg-slate-50">
                <div className="text-xs text-gray-500">A{i + 1}</div>
                <div className="text-sm text-gray-900 font-medium">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-700 font-medium">对应的 DAG（仅保留最终还存在的集合点）</div>
        <GraphCanvas
          key={`${nn}-${active.key}-${dag.edges.length}`}
          width={graphData.width}
          height={graphData.height}
          graphData={graphData}
          isLoading={false}
          enableDrawing={false}
          backgroundImage={null}
        />
      </div>
    </div>
  );
};

export default ARC221BVisualization;
