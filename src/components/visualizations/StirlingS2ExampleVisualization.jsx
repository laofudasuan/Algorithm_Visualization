import React, { useMemo, useState, useRef, useEffect } from 'react';
import GraphCanvas from '../animation/GraphCanvas.jsx';

const WIDTH = 320;
const HEIGHT = 180;

const NODE_STYLES = {
  1: { fill: 0x4caf50 },
  2: { fill: 0x2196f3 },
  3: { fill: 0xff9800 },
  4: { fill: 0x9c27b0 }
};

const BOX_COLORS = ['#4CAF50', '#2196F3'];

const PARTITIONS = [
  [[1], [2, 3, 4]],
  [[2], [1, 3, 4]],
  [[3], [1, 2, 4]],
  [[4], [1, 2, 3]],
  [[1, 2], [3, 4]],
  [[1, 3], [2, 4]],
  [[1, 4], [2, 3]]
];

const computePositions = (blocks) => {
  const innerGap = 62;
  const groupGap = 90;
  const startX = 48;
  const y = HEIGHT / 2;

  const order = [];
  blocks.forEach((block) => {
    block.forEach((v) => order.push(v));
  });

  const pos = {};
  let x = startX;
  blocks.forEach((block) => {
    block.forEach((v, idx) => {
      pos[v] = { x, y };
      x += idx === block.length - 1 ? groupGap : innerGap;
    });
  });

  return pos;
};

const buildIndicators = (blocks, pos) => {
  return blocks.map((block, idx) => {
    const xs = block.map((v) => pos[v].x);
    const ys = block.map((v) => pos[v].y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pad = 40;
    return {
      id: `box-${idx}`,
      type: 'highlight',
      position: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
      width: (maxX - minX) + pad * 2,
      height: (maxY - minY) + pad * 2,
      color: BOX_COLORS[idx % BOX_COLORS.length],
      lineWidth: 4
    };
  });
};

const buildGraphData = (blocks, index) => {
  const pos = computePositions(blocks);
  const nodes = [1, 2, 3, 4].map((id) => {
    const p = pos[id];
    const s = NODE_STYLES[id];
    return {
      id: String(id),
      x: p.x,
      y: p.y,
      label: String(id),
      style: {
        type: 'circle',
        fill: s.fill
      }
    };
  });

  return {
    width: WIDTH,
    height: HEIGHT,
    nodes,
    edges: [],
    indicators: buildIndicators(blocks, pos),
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
      lineWidth: 15
    },
    __key: index
  };
};

const StirlingS2ExampleVisualization = () => {
  const containerRef = useRef(null);
  const [cols, setCols] = useState(1);
  const dataList = useMemo(() => PARTITIONS.map((p, idx) => buildGraphData(p, idx)), []);

  useEffect(() => {
    const updateGrid = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Calculate how many items can fit based on minimum width (including padding and margin)
        const minWidth = 280; // Minimum width for each item
        const gap = 24; // gap-6 is 1.5rem = 24px with default font size
        const availableWidth = containerWidth - gap * 2; // Account for side margins
        const calculatedCols = Math.max(1, Math.floor(availableWidth / (minWidth + gap)));
        
        // Limit to maximum of 4 columns
        setCols(Math.min(calculatedCols, 4));
      }
    };

    updateGrid();
    window.addEventListener('resize', updateGrid);
    
    return () => {
      window.removeEventListener('resize', updateGrid);
    };
  }, []);

  // Dynamically determine grid classes based on number of columns
  const gridClass = `grid-cols-1 ${
    cols >= 2 ? 'sm:grid-cols-2' : ''
  } ${
    cols >= 3 ? 'lg:grid-cols-3' : ''
  } ${
    cols >= 4 ? 'xl:grid-cols-4' : ''
  }`;

  return (
    <div ref={containerRef} className="w-full">
      <div className={`grid ${gridClass} gap-6`}>
        {dataList.map((g, idx) => (
          <div key={g.__key} className="bg-white rounded-lg p-4 min-w-[280px] max-w-[350px] flex flex-col items-center mx-auto">
            <div className="text-sm text-gray-700 font-medium mb-2">方案 {idx + 1}</div>
            <GraphCanvas
              width={g.width}
              height={g.height}
              graphData={g}
              isLoading={false}
              enableDrawing={false}
              backgroundImage={null}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StirlingS2ExampleVisualization;