import React, { useEffect, useMemo, useState } from 'react';
import { buildGaussSteps, formatNumber } from './gaussSteps';

const EXAMPLES = [
  { name: '唯一解', matrix: [[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]] },
  { name: '首项为零', matrix: [[0, 1, 1, 5], [1, 1, 1, 6], [2, -1, 1, 3]] },
  { name: '无解', matrix: [[1, 1, 1, 3], [2, 2, 2, 7], [1, -1, 1, 1]] },
  { name: '无穷多解', matrix: [[1, 1, 1, 3], [2, 2, 2, 6], [1, -1, 1, 1]] },
];

function Control({ label, path, ...props }) {
  return <button type="button" title={label} aria-label={label} {...props}
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>
  </button>;
}

export default function GaussVisualization() {
  const [example, setExample] = useState(0);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = useMemo(() => buildGaussSteps(EXAMPLES[example].matrix), [example]);
  const step = steps[index];
  const last = index === steps.length - 1;

  useEffect(() => {
    if (!playing) return undefined;
    if (last) { setPlaying(false); return undefined; }
    const timer = window.setTimeout(() => setIndex((value) => value + 1), 1500);
    return () => window.clearTimeout(timer);
  }, [playing, index, last]);

  const move = (value) => { setPlaying(false); setIndex(value); };

  return <div data-vis className="my-6 min-w-0 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-base font-semibold text-gray-900">高斯消元过程</div>
      <label className="flex items-center gap-2 text-sm text-gray-600">方程组
        <select aria-label="选择方程组" value={example} onChange={(e) => { setPlaying(false); setIndex(0); setExample(Number(e.target.value)); }} className="h-9 rounded-md border border-gray-200 bg-white px-2 text-gray-800">
          {EXAMPLES.map((item, i) => <option key={item.name} value={i}>{item.name}</option>)}
        </select>
      </label>
    </div>
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
      <Control label="回到开始" path="M3 11a9 9 0 1 1 2 7 M3 4v7h7" onClick={() => move(0)} disabled={index === 0 && !playing} />
      <Control label="上一步" path="m15 6-6 6 6 6" onClick={() => move(index - 1)} disabled={index === 0} />
      <Control label={playing ? '暂停' : '自动播放'} path={playing ? 'M9 5v14 M15 5v14' : 'm8 5 11 7-11 7Z'} onClick={() => setPlaying(!playing)} disabled={last} />
      <Control label="下一步" path="m9 6 6 6-6 6" onClick={() => move(index + 1)} disabled={last} />
      <span className="ml-1 text-xs tabular-nums text-gray-500">{index + 1} / {steps.length}</span>
      <input aria-label="演示进度" type="range" min="0" max={steps.length - 1} value={index} onChange={(e) => move(Number(e.target.value))} className="min-w-24 flex-1 accent-blue-600" />
    </div>
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(200px,0.8fr)]">
      <div className="min-w-0">
        <div className="mb-2 text-sm font-medium text-gray-700">增广矩阵</div>
        <div className="overflow-x-auto pb-2">
          <div role="table" aria-label="当前增广矩阵" className="grid min-w-[300px] grid-cols-[32px_repeat(4,minmax(60px,1fr))] gap-1 font-mono text-sm">
            {['', 'x1', 'x2', 'x3', '常数'].map((label, i) => <div role="columnheader" key={i} className="py-1 text-center text-xs text-gray-500">{label}</div>)}
            {step.matrix.map((row, r) => <React.Fragment key={r}>
              <div className="flex h-12 items-center text-xs text-gray-500">R{r + 1}</div>
              {row.map((v, c) => {
                const pivot = step.pivot?.[0] === r && step.pivot?.[1] === c;
                const color = pivot ? 'border-blue-500 bg-blue-100 text-blue-900 font-bold' : step.target === r ? 'border-amber-300 bg-amber-50 text-amber-900' : step.pivot?.[0] === r ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-gray-200 bg-gray-50 text-gray-800';
                return <div role="cell" key={c} title={`${r + 1} 行 ${c + 1} 列：${v}${pivot ? '，主元' : ''}`} className={`flex h-12 items-center justify-center overflow-hidden rounded border px-1 text-xs tabular-nums transition-colors ${color} ${c === 3 ? 'border-l-2 border-l-gray-400' : ''}`}>{formatNumber(v)}</div>;
              })}
            </React.Fragment>)}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-blue-400 bg-blue-100" />主元 / 主元行</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-amber-300 bg-amber-50" />被修改行</span>
        </div>
      </div>
      <div aria-live="polite" className="min-w-0 border-t border-gray-100 pt-3 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
        <div className={`text-sm font-semibold ${step.result === 'none' ? 'text-red-700' : step.result ? 'text-emerald-700' : 'text-gray-900'}`}>{step.phase}</div>
        <p className="mt-2 text-sm leading-6 text-gray-600">{step.description}</p>
        {step.calculation && <div className="mt-2 break-words font-mono text-xs leading-6 text-gray-600">{step.calculation}</div>}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-sm text-gray-800">
          {step.solution.map((v, i) => <span key={i}>x{i + 1} = {v === null ? '?' : formatNumber(v)}</span>)}
        </div>
      </div>
    </div>
  </div>;
}
