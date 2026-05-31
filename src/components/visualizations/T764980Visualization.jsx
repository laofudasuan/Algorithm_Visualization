import React, { useEffect, useMemo, useRef, useState } from 'react';
import GraphCanvas from '../animation/GraphCanvas.jsx';

const DEFAULT_EDGE_STYLE = { stroke: 0x999999, lineWidth: 2 };
const DELETED_EDGE_STYLE = { stroke: 0xff1744, lineWidth: 3 };

const SAMPLES = [
  {
    id: 'sample-1',
    name: '样例 1',
    n: 4,
    edges: [
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
      [3, 4]
    ]
  },
  {
    id: 'sample-2',
    name: '样例 2',
    n: 4,
    edges: [
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 4],
      [1, 3]
    ]
  },
  {
    id: 'sample-3',
    name: '样例 3',
    n: 5,
    edges: [
      [1, 3],
      [2, 3],
      [1, 4],
      [2, 4],
      [1, 5],
      [2, 5]
    ]
  },
  {
    id: 'sample-4',
    name: '样例 4',
    n: 5,
    edges: [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [1, 5],
      [2, 5],
      [1, 4]
    ]
  }
];

const normalizeEdge = (u, v) => (u < v ? [u, v] : [v, u]);

const edgeIdOf = (u, v) => {
  const [a, b] = normalizeEdge(u, v);
  return `e-${a}-${b}`;
};

const buildGraphData = (sample, width, height) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.36;
  const nodes = Array.from({ length: sample.n }).map((_, idx) => {
    const id = idx + 1;
    const angle = (2 * Math.PI * idx) / sample.n - Math.PI / 2;
    return {
      id,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      label: String(id),
      style: {
        type: 'circle',
        size: 60,
        fill: 0xffffff,
        stroke: 0x111827,
        lineWidth: 2,
        labelFill: 0x111827,
        labelFontSize: 40
      }
    };
  });

  const edges = sample.edges.map(([u, v]) => {
    const [a, b] = normalizeEdge(u, v);
    return {
      id: edgeIdOf(a, b),
      source: a,
      target: b,
      style: { ...DEFAULT_EDGE_STYLE }
    };
  });

  return {
    width,
    height,
    nodes,
    edges,
    nodesStyle: {},
    edgesStyle: {}
  };
};

const buildAdj = (n, edges, removed) => {
  const adj = Array.from({ length: n + 1 }).map(() => []);
  edges.forEach((e) => {
    if (removed.has(e.id)) return;
    adj[e.source].push({ to: e.target, edgeId: e.id });
    adj[e.target].push({ to: e.source, edgeId: e.id });
  });
  return adj;
};

const isConnected = (n, adj) => {
  const vis = new Array(n + 1).fill(false);
  const q = [1];
  vis[1] = true;
  for (let i = 0; i < q.length; i++) {
    const x = q[i];
    adj[x].forEach(({ to }) => {
      if (!vis[to]) {
        vis[to] = true;
        q.push(to);
      }
    });
  }
  for (let i = 1; i <= n; i++) {
    if (!vis[i]) return false;
  }
  return true;
};

const bfsDistances = (n, adj, start) => {
  const dist = new Array(n + 1).fill(Infinity);
  dist[start] = 0;
  const q = [start];
  for (let i = 0; i < q.length; i++) {
    const x = q[i];
    adj[x].forEach(({ to }) => {
      if (dist[to] === Infinity) {
        dist[to] = dist[x] + 1;
        q.push(to);
      }
    });
  }
  return dist;
};

const shortestPathEdgeSet = (edges, distA, distB, d) => {
  const set = new Set();
  edges.forEach((e) => {
    const a = e.source;
    const b = e.target;
    if (distA[a] + 1 + distB[b] === d || distA[b] + 1 + distB[a] === d) {
      set.add(e.id);
    }
  });
  return set;
};

const buildSubAdj = (n, edges, allowedEdgeIds) => {
  const adj = Array.from({ length: n + 1 }).map(() => []);
  edges.forEach((e) => {
    if (!allowedEdgeIds.has(e.id)) return;
    adj[e.source].push({ to: e.target, edgeId: e.id });
    adj[e.target].push({ to: e.source, edgeId: e.id });
  });
  return adj;
};

const findBridges = (n, adj) => {
  const disc = new Array(n + 1).fill(0);
  const low = new Array(n + 1).fill(0);
  const bridges = new Set();
  let timer = 0;

  const dfs = (u, parentEdgeId) => {
    timer += 1;
    disc[u] = timer;
    low[u] = timer;
    adj[u].forEach(({ to, edgeId }) => {
      if (edgeId === parentEdgeId) return;
      if (!disc[to]) {
        dfs(to, edgeId);
        low[u] = Math.min(low[u], low[to]);
        if (low[to] > disc[u]) {
          bridges.add(edgeId);
        }
      } else {
        low[u] = Math.min(low[u], disc[to]);
      }
    });
  };

  for (let i = 1; i <= n; i++) {
    if (!disc[i] && adj[i].length) dfs(i, null);
  }
  return bridges;
};

const oneShortestPathEdges = (n, adj, s, t) => {
  const dist = new Array(n + 1).fill(Infinity);
  const prevNode = new Array(n + 1).fill(null);
  const prevEdge = new Array(n + 1).fill(null);
  dist[s] = 0;
  const q = [s];
  for (let i = 0; i < q.length; i++) {
    const x = q[i];
    if (x === t) break;
    adj[x].forEach(({ to, edgeId }) => {
      if (dist[to] === Infinity) {
        dist[to] = dist[x] + 1;
        prevNode[to] = x;
        prevEdge[to] = edgeId;
        q.push(to);
      }
    });
  }
  if (dist[t] === Infinity) return { dist: Infinity, edges: [] };
  const edges = [];
  let cur = t;
  while (cur !== s) {
    edges.push(prevEdge[cur]);
    cur = prevNode[cur];
  }
  edges.reverse();
  return { dist: dist[t], edges };
};

const TaskBanner = ({ text, tone }) => {
  const cls =
    tone === 'danger'
      ? 'bg-red-50 border-red-200 text-red-700'
      : tone === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-blue-50 border-blue-200 text-blue-700';
  return <div className={`border rounded-lg px-4 py-3 text-lg font-semibold ${cls}`}>{text}</div>;
};

const InfoPill = ({ label, value }) => (
  <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
    <span className="font-medium">{label}</span>
    <span className="ml-2">{value}</span>
  </div>
);

const AnalysisPanel = ({ text, tone }) => {
  const cls =
    tone === 'danger'
      ? 'bg-red-50 border-red-200 text-red-700'
      : tone === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-gray-50 border-gray-200 text-gray-700';
  return <div className={`border rounded-lg px-4 py-3 whitespace-pre-line ${cls}`}>{text}</div>;
};

const T764980Visualization = () => {
  const width = 960;
  const height = 520;

  const [sampleId, setSampleId] = useState(SAMPLES[0].id);
  const [e1, setE1] = useState('');
  const [e2, setE2] = useState('');
  const [taskText, setTaskText] = useState('请在控制台选择您想删除的第一条边 e1。');
  const [analysisText, setAnalysisText] = useState('进入页面后，先选择 e1，系统会展示删边后的最短路网络与必经边提示。');
  const [analysisTone, setAnalysisTone] = useState('neutral');
  const [dangerEdges, setDangerEdges] = useState(new Set());

  const graphCanvasRef = useRef(null);
  const pulseIntervalsRef = useRef([]);

  const sample = useMemo(() => SAMPLES.find((s) => s.id === sampleId) ?? SAMPLES[0], [sampleId]);
  const graphData = useMemo(() => buildGraphData(sample, width, height), [sample, width, height]);

  const edgesForSelect = useMemo(() => {
    return [...graphData.edges]
      .map((e) => ({ id: e.id, label: `${e.source}-${e.target}`, source: e.source, target: e.target }))
      .sort((a, b) => (a.source - b.source) || (a.target - b.target));
  }, [graphData.edges]);

  const edgeById = useMemo(() => {
    const map = new Map();
    graphData.edges.forEach((ed) => map.set(ed.id, ed));
    return map;
  }, [graphData.edges]);

  const resetPulses = () => {
    pulseIntervalsRef.current.forEach((t) => clearInterval(t));
    pulseIntervalsRef.current = [];
  };

  const clearIndicators = () => {
    if (graphCanvasRef.current?.dispatchOperation) {
      graphCanvasRef.current.dispatchOperation('clearIndicators');
    }
  };

  const applyDefaultEdges = () => {
    if (!graphCanvasRef.current?.dispatchOperation) return;
    graphData.edges.forEach((ed) => {
      graphCanvasRef.current.dispatchOperation('updateEdge', { id: ed.id, style: { ...DEFAULT_EDGE_STYLE } });
    });
  };

  const markDeletedEdge = (edgeId) => {
    if (!graphCanvasRef.current?.dispatchOperation) return;
    const ed = edgeById.get(edgeId);
    if (!ed) return;

    graphCanvasRef.current.dispatchOperation('updateEdge', { id: edgeId, style: { ...DELETED_EDGE_STYLE } });

    const pulseId = `deleted-${edgeId}`;
    graphCanvasRef.current.dispatchOperation('addIndicator', {
      id: pulseId,
      type: 'edge-pulse',
      source: ed.source,
      target: ed.target,
      color: '#ff1744',
      duration: 1400
    });
    const interval = setInterval(() => {
      graphCanvasRef.current?.dispatchOperation?.('addIndicator', {
        id: pulseId,
        type: 'edge-pulse',
        source: ed.source,
        target: ed.target,
        color: '#ff1744',
        duration: 1400
      });
    }, 1450);
    pulseIntervalsRef.current.push(interval);
  };

  const highlightEdgeSet = (edgeIds, color, lineWidth) => {
    if (!graphCanvasRef.current?.dispatchOperation) return;
    edgeIds.forEach((edgeId) => {
      const ed = edgeById.get(edgeId);
      if (!ed) return;
      graphCanvasRef.current.dispatchOperation('addIndicator', {
        id: `hl-${color}-${edgeId}`,
        type: 'edge-highlight',
        source: ed.source,
        target: ed.target,
        color,
        lineWidth
      });
    });
  };

  const pulseDangerEdges = (edgeIds) => {
    if (!graphCanvasRef.current?.dispatchOperation) return;
    edgeIds.forEach((edgeId) => {
      const ed = edgeById.get(edgeId);
      if (!ed) return;
      const pulseId = `danger-${edgeId}`;
      graphCanvasRef.current.dispatchOperation('addIndicator', {
        id: pulseId,
        type: 'edge-pulse',
        source: ed.source,
        target: ed.target,
        color: '#ffb300',
        duration: 900
      });
      const interval = setInterval(() => {
        graphCanvasRef.current?.dispatchOperation?.('addIndicator', {
          id: pulseId,
          type: 'edge-pulse',
          source: ed.source,
          target: ed.target,
          color: '#ffb300',
          duration: 900
        });
      }, 950);
      pulseIntervalsRef.current.push(interval);
    });
  };

  const resetAll = () => {
    resetPulses();
    clearIndicators();
    applyDefaultEdges();
    setE1('');
    setE2('');
    setDangerEdges(new Set());
    setTaskText('请在控制台选择您想删除的第一条边 e1。');
    setAnalysisTone('neutral');
    setAnalysisText('进入页面后，先选择 e1，系统会展示删边后的最短路网络与必经边提示。');
  };

  useEffect(() => {
    resetAll();
  }, [sampleId]);

  useEffect(() => {
    if (!graphCanvasRef.current?.dispatchOperation) return;
    resetPulses();
    clearIndicators();
    applyDefaultEdges();
    setDangerEdges(new Set());
    setE2('');

    if (!e1) {
      setTaskText('请在控制台选择您想删除的第一条边 e1。');
      setAnalysisTone('neutral');
      setAnalysisText('请选择一条边作为 e1。系统会先判断删去它后图是否仍然连通。');
      return;
    }

    markDeletedEdge(e1);

    const removed = new Set([e1]);
    const adj = buildAdj(sample.n, graphData.edges, removed);
    const stillConnected = isConnected(sample.n, adj);

    const ed = edgeById.get(e1);
    const u = ed?.source;
    const v = ed?.target;

    if (!stillConnected) {
      setTaskText('当前 e1 会断开整张图，请重新选择 e1。');
      setAnalysisTone('danger');
      setAnalysisText(`这是一条全局割边！删掉 e1 = ${u}-${v} 后图不连通，方案不合法。`);
      return;
    }

    const distU = bfsDistances(sample.n, adj, u);
    const distV = bfsDistances(sample.n, adj, v);
    const d = distU[v];
    const shortestEdges = shortestPathEdgeSet(graphData.edges.filter((x) => !removed.has(x.id)), distU, distV, d);
    highlightEdgeSet(shortestEdges, '#1e88e5', 7);

    const subAdj = buildSubAdj(sample.n, graphData.edges, shortestEdges);
    const bridges = findBridges(sample.n, subAdj);
    setDangerEdges(bridges);

    if (bridges.size) {
      highlightEdgeSet(bridges, '#ffb300', 9);
      pulseDangerEdges(bridges);
    }

    setTaskText('请选择第二条需要删除的边 e2。');
    setAnalysisTone('neutral');
    if (bridges.size) {
      setAnalysisText(
        `已删除 e1。\n蓝色边：在删掉 e1 后，e1 两端点之间“所有最短路”构成的最短路网络。\n橙色闪烁边：这张最短路网络里的必经边（割边）。如果把它选为 e2，e1 的两端点很可能被迫绕行更远的路。`
      );
    } else {
      setAnalysisText(
        `已删除 e1。\n蓝色边：在删掉 e1 后，e1 两端点之间“所有最短路”构成的最短路网络。\n这张网络里没有必经边（不存在橙色提示），选 e2 的自由度更高。`
      );
    }
  }, [e1]);

  useEffect(() => {
    if (!graphCanvasRef.current?.dispatchOperation) return;
    if (!e1) return;
    if (!e2) return;

    resetPulses();
    clearIndicators();
    applyDefaultEdges();

    markDeletedEdge(e1);
    markDeletedEdge(e2);

    const removed = new Set([e1, e2]);
    const adj = buildAdj(sample.n, graphData.edges, removed);
    const stillConnected = isConnected(sample.n, adj);

    const ed1 = edgeById.get(e1);
    const ed2 = edgeById.get(e2);
    const u1 = ed1?.source;
    const v1 = ed1?.target;
    const u2 = ed2?.source;
    const v2 = ed2?.target;

    if (!stillConnected) {
      setTaskText('图不连通，方案被否决。');
      setAnalysisTone('danger');
      setAnalysisText(`图不连通！删掉 e1=${u1}-${v1} 和 e2=${u2}-${v2} 后，整张图被切成多个连通块，这是一组 2-边割。`);
      return;
    }

    const p1 = oneShortestPathEdges(sample.n, adj, u1, v1);
    const p2 = oneShortestPathEdges(sample.n, adj, u2, v2);

    highlightEdgeSet(new Set(p1.edges), '#10b981', 8);
    highlightEdgeSet(new Set(p2.edges), '#a855f7', 8);

    const total = p1.dist + p2.dist;
    setTaskText('已完成两条边选择，查看分析结论。');
    if (dangerEdges.has(e2)) {
      setAnalysisTone('danger');
      setAnalysisText(
        `非最优解！\n你选择的 e2 是 e1 最短路网络里的必经边，这会迫使 e1 的两端点绕行更远。\n最终：dist(${u1},${v1})=${p1.dist}（绿色路径），dist(${u2},${v2})=${p2.dist}（紫色路径），总和=${total}。`
      );
    } else {
      setAnalysisTone('success');
      setAnalysisText(
        `绝佳选择！\n当前选择没有命中 e1 最短路网络里的必经边，两个端点对更可能互不干扰。\n最终：dist(${u1},${v1})=${p1.dist}（绿色路径），dist(${u2},${v2})=${p2.dist}（紫色路径），总和=${total}。`
      );
    }
  }, [e2]);

  const canChooseE2 = Boolean(e1) && analysisTone !== 'danger';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <InfoPill label="节点" value={sample.n} />
          <InfoPill label="边" value={sample.edges.length} />
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600">样例</span>
            <select
              className="border rounded-md px-3 py-1 text-sm bg-white"
              value={sampleId}
              onChange={(e) => setSampleId(e.target.value)}
            >
              {SAMPLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <TaskBanner text={taskText} tone={analysisTone === 'danger' ? 'danger' : analysisTone === 'success' ? 'success' : 'neutral'} />
      </div>

      <div className="border rounded-lg p-4 bg-white space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-700">e1 选择器</div>
            <select
              className="w-full border rounded-md px-3 py-2 bg-white"
              value={e1}
              onChange={(e) => setE1(e.target.value)}
            >
              <option value="">请选择一条边</option>
              {edgesForSelect.map((ed) => (
                <option key={ed.id} value={ed.id}>
                  {ed.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-700">e2 选择器</div>
            <select
              className="w-full border rounded-md px-3 py-2 bg-white disabled:bg-gray-100"
              value={e2}
              onChange={(e) => setE2(e.target.value)}
              disabled={!canChooseE2}
            >
              <option value="">请选择一条边</option>
              {edgesForSelect
                .filter((ed) => ed.id !== e1)
                .map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.label}
                  </option>
                ))}
            </select>
          </div>

          <button
            className="border rounded-md px-4 py-2 bg-gray-900 text-white hover:bg-gray-800"
            onClick={resetAll}
            type="button"
          >
            重置
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-3 bg-white">
        <GraphCanvas
          key={sampleId}
          ref={graphCanvasRef}
          width={width}
          height={height}
          graphData={graphData}
          isLoading={false}
          enableDrawing={false}
          backgroundImage={null}
          onInit={() => {
            resetAll();
          }}
        />
      </div>

      <AnalysisPanel text={analysisText} tone={analysisTone} />
    </div>
  );
};

export default T764980Visualization;

