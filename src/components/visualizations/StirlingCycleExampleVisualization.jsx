import React, { useMemo, useState } from 'react';
import GraphCanvas from '../animation/GraphCanvas.jsx';

const WIDTH = 600;
const HEIGHT = 500;

const NODE_POS = {
  1: { x: WIDTH / 2, y: 120 },
  2: { x: WIDTH - 140, y: HEIGHT / 2 },
  3: { x: WIDTH / 2, y: HEIGHT - 120 },
  4: { x: 140, y: HEIGHT / 2 }
};
const EXAMPLES = [
  { id: 'ex-1', cycles: [[1, 2], [3, 4]] },
  { id: 'ex-2', cycles: [[1, 3], [2, 4]] },
  { id: 'ex-3', cycles: [[1, 4], [2, 3]] },
  { id: 'ex-4', cycles: [[1, 2, 3], [4]] },
  { id: 'ex-5', cycles: [[1, 3, 2], [4]] },
  { id: 'ex-6', cycles: [[1, 2, 4], [3]] },
  { id: 'ex-7', cycles: [[1, 4, 2], [3]] },
  { id: 'ex-8', cycles: [[1, 3, 4], [2]] },
  { id: 'ex-9', cycles: [[1, 4, 3], [2]] },
  { id: 'ex-10', cycles: [[2, 3, 4], [1]] },
  { id: 'ex-11', cycles: [[2, 4, 3], [1]] }
];

const formatCycles = (cycles) =>
  cycles
    .map((c) => `(${c.join(' ')})`)
    .join('');

const buildGraphData = (example) => {
  const nodes = [1, 2, 3, 4].map((id) => {
    const p = NODE_POS[id];
    return {
      id: String(id),
      x: p.x,
      y: p.y,
      label: String(id),
      style: {
        "type" : "planet1",
        size: 60
      }
    };
  });

  let edgeSeq = 0;
  const edges = [];
  example.cycles
    .filter((c) => c.length === 1)
    .forEach((cycle) => {
      const x = cycle[0];
      edgeSeq += 1;
      edges.push({
        id: `edge-${edgeSeq}`,
        source: String(x),
        target: String(x),
        style: {
          stroke: 0xffffff,
          color: 0x2196F3,
          lineWidth: 20,
          selfLoopRadius: 28,
          selfLoopOffset: 56,
          selfLoopAngle: -Math.PI / 2
        }
      });
    });
  example.cycles
    .filter((c) => c.length >= 2)
    .forEach((cycle) => {
      const isTwoCycle = cycle.length === 2;
      for (let i = 0; i < cycle.length; i++) {
        const a = cycle[i];
        const b = cycle[(i + 1) % cycle.length];
        edgeSeq += 1;
        edges.push({
          id: `edge-${edgeSeq}`,
          source: String(a),
          target: String(b),
          style: {
            stroke: 0xffffff,
            color: 0x2196F3,
            lineWidth: 20,
            curvature: isTwoCycle ? 0.2 : 0
          }
        });
      }
    });

  return {
    width: WIDTH,
    height: HEIGHT,
    nodes,
    edges,
    nodesStyle: {
      size: 50,
      type: 'circle',
      stroke: 0x000000,
      lineWidth: 2,
      labelFill: 0x000000,
      labelFontSize: 20
    },
    edgesStyle: {
      stroke: 0xffffff,
      lineWidth: 15,
      color: 0x2196F3,
      directional: true
    }
  };
};

const StirlingCycleExampleVisualization = () => {
  const [selectedId, setSelectedId] = useState(EXAMPLES[0].id);

  const selected = useMemo(() => EXAMPLES.find((e) => e.id === selectedId) ?? EXAMPLES[0], [selectedId]);
  const graphData = useMemo(() => buildGraphData(selected), [selected]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        一共有以下11种方案：
        {EXAMPLES.map((e, idx) => {
          const active = e.id === selectedId;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setSelectedId(e.id)}
              className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              title={formatCycles(e.cycles)}
            >
              {idx + 1}
            </button>
          );
        })}
        
      </div>

        当前划分方案：{formatCycles(selected.cycles)}
        <GraphCanvas
          key={selectedId}
          width={WIDTH}
          height={HEIGHT}
          graphData={graphData}
          isLoading={false}
          enableDrawing={false}
          backgroundImage={null}
        />
    </div>
  );
};

export default StirlingCycleExampleVisualization;
