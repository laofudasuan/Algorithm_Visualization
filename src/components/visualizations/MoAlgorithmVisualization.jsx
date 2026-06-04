import React, { useEffect, useMemo, useState } from 'react';

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

const buildMoOrder = (queries, blockSize) => {
  return [...queries]
    .map((q, idx) => ({ ...q, idx }))
    .sort((a, b) => {
      const ba = Math.floor((a.l - 1) / blockSize);
      const bb = Math.floor((b.l - 1) / blockSize);
      if (ba !== bb) return ba - bb;
      return a.r - b.r;
    });
};

const buildSteps = (ordered) => {
  if (!ordered.length) return [];

  const steps = [];
  let l = ordered[0].l;
  let r = ordered[0].r;
  let targetIndex = 0;
  steps.push({ l, r, targetIndex, settled: true });

  for (let i = 1; i < ordered.length; i++) {
    const tl = ordered[i].l;
    const tr = ordered[i].r;
    targetIndex = i;

    while (l !== tl) {
      l += l < tl ? 1 : -1;
      steps.push({ l, r, targetIndex, settled: false });
    }
    while (r !== tr) {
      r += r < tr ? 1 : -1;
      steps.push({ l, r, targetIndex, settled: false });
    }
    steps.push({ l, r, targetIndex, settled: true });
  }

  return steps;
};

const AxisLabel = ({ x, y, text, rotate }) => (
  <text
    x={x}
    y={y}
    fontSize="12"
    fill="#374151"
    textAnchor="middle"
    transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
  >
    {text}
  </text>
);

const IconButton = ({ title, onClick, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="w-9 h-9 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center"
  >
    {children}
  </button>
);

const MoAlgorithmVisualization = () => {
  const n = 9;
  const queries = useMemo(
    () => [
      { l: 1, r: 5 },
      { l: 2, r: 4 },
      { l: 3, r: 8 },
      { l: 5, r: 6 },
      { l: 6, r: 7 },
      { l: 7, r: 9 },
    ],
    []
  );

  const blockSize = Math.max(1, Math.floor(Math.sqrt(n)));
  const order = useMemo(() => buildMoOrder(queries, blockSize), [queries, blockSize]);
  const steps = useMemo(() => buildSteps(order), [order]);

  const [isPlaying, setIsPlaying] = useState(false);
  const speed = 300;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setStepIndex((i) => {
        if (i >= steps.length - 1) return i;
        return i + 1;
      });
    }, speed);
    return () => clearInterval(t);
  }, [isPlaying, speed, steps.length]);

  useEffect(() => {
    if (stepIndex >= steps.length - 1) setIsPlaying(false);
  }, [stepIndex, steps.length]);

  const current = steps[stepIndex] || steps[0];
  const currentQuery = order[current?.targetIndex ?? 0] || order[0];
  const currentBlock = Math.floor(((current?.l ?? 1) - 1) / blockSize);

  const width = 620;
  const height = 520;
  const padLeft = 56;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 52;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const xScale = (v) => padLeft + ((v - 1) / (n - 1)) * plotW;
  const yScale = (v) => padTop + (1 - (v - 1) / (n - 1)) * plotH;

  const blocks = useMemo(() => {
    const cnt = Math.ceil(n / blockSize);
    return Array.from({ length: cnt }).map((_, b) => {
      const x0 = b * blockSize + 1;
      const x1 = Math.min(n, (b + 1) * blockSize);
      return { b, x0, x1 };
    });
  }, [n, blockSize]);

  const pathPoints = steps
    .slice(0, stepIndex + 1)
    .map((p) => `${xScale(p.l)},${yScale(p.r)}`)
    .join(' ');

  const reset = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const toggle = () => {
    if (stepIndex >= steps.length - 1) {
      setStepIndex(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((v) => !v);
  };

  const jumpTo = (idx) => {
    setIsPlaying(false);
    setStepIndex(clamp(idx, 0, steps.length - 1));
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-white p-3 flex justify-center relative">
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <IconButton title={isPlaying ? '暂停' : '播放'} onClick={toggle}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </IconButton>
          <IconButton title="重置" onClick={reset}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 15.364-6.364" />
              <path d="M18 3v4h-4" />
              <path d="M21 12a9 9 0 0 1-15.364 6.364" />
              <path d="M6 21v-4h4" />
            </svg>
          </IconButton>
        </div>

        <svg width={width} height={height} style={{ display: 'block' }}>
          <rect x="0" y="0" width={width} height={height} fill="#ffffff" />

          {blocks.map((b) => {
            const rx0 = xScale(b.x0);
            const rx1 = xScale(b.x1);
            const isCur = b.b === currentBlock;
            return (
              <rect
                key={b.b}
                x={rx0 - plotW / (n - 1) / 2}
                y={padTop}
                width={(rx1 - rx0) + plotW / (n - 1)}
                height={plotH}
                fill={isCur ? '#fff7ed' : (b.b % 2 === 0 ? '#f9fafb' : '#ffffff')}
                opacity={isCur ? 1 : 0.8}
              />
            );
          })}

          {Array.from({ length: n }).map((_, i) => {
            const v = i + 1;
            const x = xScale(v);
            const y = yScale(v);
            return (
              <g key={`grid-${v}`}>
                <line x1={x} y1={padTop} x2={x} y2={padTop + plotH} stroke="#e5e7eb" strokeWidth="1" />
                <line x1={padLeft} y1={y} x2={padLeft + plotW} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                <text x={x} y={padTop + plotH + 18} fontSize="12" fill="#374151" textAnchor="middle">
                  {v}
                </text>
                <text x={padLeft - 14} y={y + 4} fontSize="12" fill="#374151" textAnchor="end">
                  {v}
                </text>
              </g>
            );
          })}

          <line x1={padLeft} y1={padTop + plotH} x2={padLeft + plotW} y2={padTop + plotH} stroke="#111827" strokeWidth="2" />
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#111827" strokeWidth="2" />

          <AxisLabel x={padLeft + plotW / 2} y={height - 18} text="l（左端点）" />
          <AxisLabel x={18} y={padTop + plotH / 2} text="r（右端点）" rotate={-90} />

          <polyline points={pathPoints} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />

          {order.map((q, idx) => {
            const cx = xScale(q.l);
            const cy = yScale(q.r);
            const isTarget = idx === current?.targetIndex;
            return (
              <g key={`q-${q.idx}`}>
                <circle cx={cx} cy={cy} r={isTarget ? 9 : 7} fill={isTarget ? '#111827' : '#9ca3af'} opacity={isTarget ? 1 : 0.85} />
                <text x={cx} y={cy + 4} fontSize="10" fill="#ffffff" textAnchor="middle">
                  {idx + 1}
                </text>
              </g>
            );
          })}

          <circle cx={xScale(current.l)} cy={yScale(current.r)} r="8" fill="#ef4444" />
          <text x={xScale(current.l)} y={yScale(current.r) - 12} fontSize="12" fill="#ef4444" textAnchor="middle">
            ({current.l},{current.r})
          </text>
        </svg>
      </div>

      <div className="text-sm text-gray-700">
        当前目标：[{currentQuery.l},{currentQuery.r}]（Mo序第 {current?.targetIndex + 1} 个）
      </div>

      <div className="flex flex-wrap gap-2 items-center text-sm text-gray-700">
        <span className="text-gray-500">Mo 排序结果：</span>
        {order.map((q, idx) => (
          <button
            key={`ord-${q.idx}`}
            type="button"
            onClick={() => {
              const firstStep = steps.findIndex((s) => s.settled && s.targetIndex === idx);
              if (firstStep >= 0) jumpTo(firstStep);
            }}
            className={`px-2 py-1 rounded-md border ${
              idx === current?.targetIndex ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            title={`[${q.l},${q.r}]`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoAlgorithmVisualization;
