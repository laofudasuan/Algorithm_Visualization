import React, { useMemo, useState } from 'react';

const TABLE_EXAMPLES = [
  {
    id: 'even-only',
    name: '案例 A：大段数只有偶数可行',
    input: '- - + + - - - + - - - + - - - -',
    note: '从 k=6 开始，g6=g8=1，而 g7=0；最大可行段数 j=8。'
  },
  {
    id: 'both-parities',
    name: '案例 B：大段数奇偶都可行',
    input: '- - + - + - + - + - - -',
    note: 'g4 到 g8 连续为 1；特别地，g2=g3=0，说明小 k 区域并不单调。'
  },
  {
    id: 'all-feasible',
    name: '案例 C：每个段数都可行',
    input: '+ - + - + - + - + -',
    note: '正负交替时，每个负数都能与相邻的正数配合，g1 到 g10 全为 1。'
  }
];

const CONSTRUCTION_EXAMPLES = [
  {
    id: 'middle-coupon',
    name: '中间消块：+--+',
    input: '- - + - - + - - - + - - -'
  },
  {
    id: 'left-coupon',
    name: '边界消块：-+',
    input: '- + - - - + - - + - - -'
  },
  {
    id: 'split-negative',
    name: '拆分负段以达到最大 j',
    input: '+ + + + + - - - - - - -'
  },
  {
    id: 'impossible',
    name: '无消块位置：不可行',
    input: '- - - + - - - + - - - + - - - -'
  }
];

const parseSequence = (text, limit = 32) => {
  const raw = String(text ?? '').trim();
  if (!raw) return { ok: false, error: '请输入由 +、-（或 1、-1）组成的序列。' };

  const compact = raw.replace(/[\s,，]+/g, '');
  let values = [];
  if (/^[+-]+$/.test(compact)) {
    values = [...compact].map((token) => (token === '+' ? 1 : -1));
  } else {
    const tokens = raw.split(/[\s,，]+/).filter(Boolean);
    for (const token of tokens) {
      if (token === '+' || token === '+1' || token === '1') values.push(1);
      else if (token === '-' || token === '-1') values.push(-1);
      else return { ok: false, error: `无法识别“${token}”；请只输入 +、-、1、-1。` };
    }
  }

  if (values.length > limit) {
    return { ok: false, error: `为了让打表保持流畅，这里最多输入 ${limit} 个元素。` };
  }
  return { ok: true, values };
};

const solveAllK = (values) => {
  const n = values.length;
  const negInf = -1e9;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + values[i];

  const dp = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(negInf));
  const parent = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(-1));
  dp[0][0] = 0;

  for (let right = 1; right <= n; right++) {
    for (let parts = 1; parts <= right; parts++) {
      for (let left = parts - 1; left < right; left++) {
        if (dp[left][parts - 1] === negInf) continue;
        const gain = prefix[right] - prefix[left] >= 0 ? 1 : 0;
        const candidate = dp[left][parts - 1] + gain;
        if (candidate > dp[right][parts]) {
          dp[right][parts] = candidate;
          parent[right][parts] = left;
        }
      }
    }
  }

  const rows = [];
  for (let k = 1; k <= n; k++) {
    const segments = [];
    let right = n;
    let parts = k;
    while (parts > 0) {
      const left = parent[right][parts];
      const sum = prefix[right] - prefix[left];
      segments.push({
        from: left,
        to: right,
        values: values.slice(left, right),
        sum,
        good: sum >= 0
      });
      right = left;
      parts -= 1;
    }
    segments.reverse();
    const need = Math.ceil(k / 2);
    rows.push({ k, bestGood: dp[n][k], need, feasible: dp[n][k] >= need, segments });
  }
  return rows;
};

const SequenceCells = ({ values }) => (
  <div className="flex flex-wrap gap-1.5" aria-label={`序列：${values.join(', ')}`}>
    {values.map((value, index) => (
      <div
        key={`${index}-${value}`}
        className={`relative flex h-10 w-10 items-center justify-center rounded-md border font-mono font-semibold ${
          value === 1
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
            : 'border-rose-300 bg-rose-50 text-rose-700'
        }`}
      >
        {value > 0 ? '+1' : '-1'}
        <span className="absolute -bottom-5 text-[10px] font-normal text-gray-400">{index + 1}</span>
      </div>
    ))}
  </div>
);

const PartitionStrip = ({ segments, compact = false }) => (
  <div className="flex flex-wrap items-stretch gap-2">
    {segments.map((segment, index) => (
      <div
        key={`${segment.from}-${segment.to}-${index}`}
        className={`min-w-[76px] rounded-lg border px-2.5 py-2 ${
          segment.good
            ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
            : 'border-rose-300 bg-rose-50 text-rose-800'
        }`}
      >
        <div className="flex flex-wrap justify-center gap-1 font-mono font-semibold">
          {segment.values.map((value, valueIndex) => (
            <span key={valueIndex}>{value > 0 ? '+' : '−'}</span>
          ))}
        </div>
        {!compact && (
          <div className="mt-1 text-center text-xs">
            和={segment.sum} · {segment.good ? '好段' : '坏段'}
          </div>
        )}
      </div>
    ))}
  </div>
);

export const P17143TableVisualization = () => {
  const [exampleId, setExampleId] = useState(TABLE_EXAMPLES[0].id);
  const [input, setInput] = useState(TABLE_EXAMPLES[0].input);
  const [selectedK, setSelectedK] = useState(6);

  const activeExample = TABLE_EXAMPLES.find((example) => example.id === exampleId) ?? TABLE_EXAMPLES[0];
  const parsed = useMemo(() => parseSequence(input), [input]);
  const rows = useMemo(() => (parsed.ok ? solveAllK(parsed.values) : []), [parsed]);
  const safeK = rows.length ? Math.min(Math.max(1, selectedK), rows.length) : 1;
  const selected = rows[safeK - 1];
  const maxFeasible = rows.reduce((answer, row) => (row.feasible ? row.k : answer), 0);

  const chooseExample = (id) => {
    const example = TABLE_EXAMPLES.find((item) => item.id === id) ?? TABLE_EXAMPLES[0];
    setExampleId(example.id);
    setInput(example.input);
    setSelectedK(Math.min(6, example.input.split(/\s+/).length));
  };

  return (
    <div className="my-5 space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="block text-sm font-medium text-gray-700">预置案例</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
            value={exampleId}
            onChange={(event) => chooseExample(event.target.value)}
          >
            {TABLE_EXAMPLES.map((example) => (
              <option key={example.id} value={example.id}>
                {example.name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[260px] flex-1 space-y-1">
          <span className="block text-sm font-medium text-gray-700">自己输入 + / - 序列</span>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setExampleId('custom');
            }}
            aria-label="自定义正负一序列"
          />
        </label>
      </div>

      {!parsed.ok ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">
          {parsed.error}
        </div>
      ) : (
        <>
          <div className="pb-5">
            <SequenceCells values={parsed.values} />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-gray-800">点击一个 k，查看 DP 找到的最优划分</span>
              <span className="text-sm text-gray-500">最大可行 j = {maxFeasible || '不存在'}</span>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="g 下标表">
              {rows.map((row) => (
                <button
                  key={row.k}
                  type="button"
                  onClick={() => setSelectedK(row.k)}
                  className={`min-w-[48px] rounded-lg border px-2 py-1.5 text-sm transition ${
                    row.k === safeK ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                  } ${
                    row.feasible
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                  aria-pressed={row.k === safeK}
                >
                  <span className="block text-xs">k={row.k}</span>
                  <span className="font-mono font-semibold">g={row.feasible ? 1 : 0}</span>
                </button>
              ))}
            </div>
          </div>

          {selected && (
            <div className="space-y-3 rounded-lg bg-slate-50 p-4" aria-live="polite">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                <span>
                  DP 最多造出 <b>{selected.bestGood}</b> 个好段
                </span>
                <span>
                  需要 <b>⌈{selected.k}/2⌉={selected.need}</b> 个
                </span>
                <span className={selected.feasible ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>
                  因此 g{selected.k}={selected.feasible ? 1 : 0}
                </span>
              </div>
              <PartitionStrip segments={selected.segments} />
            </div>
          )}

          <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {exampleId === 'custom' ? '观察绿色格子的分布：重点比较 k≤5 与 k≥6 的差别。' : activeExample.note}
          </div>
        </>
      )}
    </div>
  );
};

const makeSegment = (values, from, to, label) => {
  const slice = values.slice(from, to);
  const sum = slice.reduce((total, value) => total + value, 0);
  return { from, to, values: slice, sum, good: sum >= 0, label };
};

const buildBaseSegments = (values) => {
  const segments = [];
  let index = 0;
  while (index < values.length) {
    if (values[index] === 1) {
      segments.push(makeSegment(values, index, index + 1, '正数单点'));
      index += 1;
    } else {
      let right = index + 1;
      while (right < values.length && values[right] === -1) right += 1;
      segments.push(makeSegment(values, index, right, '负数块'));
      index = right;
    }
  }
  return segments;
};

const findCoupon = (values) => {
  const ones = [];
  values.forEach((value, index) => {
    if (value === 1) ones.push(index);
  });
  const p = ones.length;
  if (p === 0) return { ones, gaps: [values.length], coupon: null };

  const gaps = [ones[0]];
  for (let i = 1; i < p; i++) gaps.push(ones[i] - ones[i - 1] - 1);
  gaps.push(values.length - 1 - ones[p - 1]);
  const badBlocks = gaps.filter((length) => length > 0).length;
  if (badBlocks <= p) return { ones, gaps, coupon: { type: 'none' } };

  if (gaps[0] === 1) return { ones, gaps, coupon: { type: 'prefix', at: ones[0] } };
  if (gaps[p] === 1) return { ones, gaps, coupon: { type: 'suffix', at: ones[p - 1] } };
  for (let gapIndex = 1; gapIndex < p; gapIndex++) {
    if (gaps[gapIndex] <= 2) {
      return {
        ones,
        gaps,
        coupon: {
          type: 'middle',
          leftOne: ones[gapIndex - 1],
          rightOne: ones[gapIndex],
          length: gaps[gapIndex]
        }
      };
    }
  }
  return { ones, gaps, coupon: null };
};

const buildSkeleton = (values, coupon) => {
  if (!coupon) return [];
  const specials = new Map();

  if (coupon.type === 'prefix') {
    specials.set(0, [makeSegment(values, 0, coupon.at + 1, '前缀 -+ 合并')]);
  } else if (coupon.type === 'suffix') {
    specials.set(coupon.at, [makeSegment(values, coupon.at, values.length, '后缀 +- 合并')]);
  } else if (coupon.type === 'middle') {
    const { leftOne, rightOne, length } = coupon;
    if (length === 1) {
      specials.set(leftOne, [
        makeSegment(values, leftOne, leftOne + 2, '中间 +−'),
        makeSegment(values, rightOne, rightOne + 1, '右侧 +')
      ]);
    } else {
      specials.set(leftOne, [
        makeSegment(values, leftOne, leftOne + 2, '中间 +−'),
        makeSegment(values, leftOne + 2, rightOne + 1, '中间 −+')
      ]);
    }
  }

  const segments = [];
  let index = 0;
  while (index < values.length) {
    if (specials.has(index)) {
      const specialSegments = specials.get(index);
      segments.push(...specialSegments);
      index = specialSegments[specialSegments.length - 1].to;
    } else if (values[index] === 1) {
      segments.push(makeSegment(values, index, index + 1, '正数单点'));
      index += 1;
    } else {
      let right = index + 1;
      while (right < values.length && values[right] === -1 && !specials.has(right)) right += 1;
      segments.push(makeSegment(values, index, right, '剩余负数块'));
      index = right;
    }
  }
  return segments;
};

const splitBadSegments = (segments, targetBad) => {
  let currentBad = segments.filter((segment) => !segment.good).length;
  let extra = Math.max(0, targetBad - currentBad);
  const answer = [];

  for (const segment of segments) {
    if (segment.good || extra === 0 || segment.values.length === 1) {
      answer.push(segment);
      continue;
    }
    const pieces = Math.min(segment.values.length, extra + 1);
    for (let piece = 0; piece < pieces - 1; piece++) {
      answer.push(makeSegment(segment.values, piece, piece + 1, '拆出的坏段'));
    }
    const tail = makeSegment(segment.values, pieces - 1, segment.values.length, '剩余坏段');
    answer.push(tail);
    extra -= pieces - 1;
    currentBad += pieces - 1;
  }
  return answer;
};

const describeCoupon = (coupon) => {
  if (!coupon) return '所有负数块都夹在远离边界的 +1 之间，而且块长至少为 3，没有办法消掉多出来的坏段。';
  if (coupon.type === 'none') return '坏段数已经不超过好段数，不需要使用消块模板。';
  if (coupon.type === 'prefix') return '把开头的 −1 与第一个 +1 合成 [−,+]，前缀坏段消失。';
  if (coupon.type === 'suffix') return '把最后一个 +1 与结尾的 −1 合成 [+,−]，后缀坏段消失。';
  return coupon.length === 1
    ? '把中间的 +−+ 切成 [+,−] | [+]，原来的中间坏段消失。'
    : '把中间的 +−−+ 切成 [+,−] | [−,+]，两段的和都为 0。';
};

const countKinds = (segments) => ({
  good: segments.filter((segment) => segment.good).length,
  bad: segments.filter((segment) => !segment.good).length
});

export const P17143ConstructionVisualization = () => {
  const [exampleId, setExampleId] = useState(CONSTRUCTION_EXAMPLES[0].id);
  const [stage, setStage] = useState(0);
  const example = CONSTRUCTION_EXAMPLES.find((item) => item.id === exampleId) ?? CONSTRUCTION_EXAMPLES[0];
  const parsed = useMemo(() => parseSequence(example.input), [example.input]);

  const construction = useMemo(() => {
    if (!parsed.ok) return null;
    const values = parsed.values;
    const base = buildBaseSegments(values);
    const couponInfo = findCoupon(values);
    const p = couponInfo.ones.length;
    const minus = values.length - p;
    const baseCount = countKinds(base);
    const valid = Boolean(couponInfo.coupon);
    if (!valid) {
      return { values, base, p, minus, baseCount, valid, coupon: null, skeleton: [], final: [] };
    }
    const skeleton = buildSkeleton(values, couponInfo.coupon);
    const targetBad = Math.min(p, minus);
    const final = splitBadSegments(skeleton, targetBad);
    return {
      values,
      base,
      p,
      minus,
      baseCount,
      valid,
      coupon: couponInfo.coupon,
      skeleton,
      final,
      maxK: final.length
    };
  }, [parsed]);

  if (!construction) return null;

  const stages = construction.valid
    ? [
        {
          title: '① 先分成正数单点与负数块',
          text: `得到 ${construction.baseCount.good} 个好段、${construction.baseCount.bad} 个坏段。`,
          segments: construction.base
        },
        {
          title: '② 必要时使用一个“消块模板”',
          text: describeCoupon(construction.coupon),
          segments: construction.skeleton
        },
        {
          title: '③ 把长负段继续拆开',
          text: `在好段数不少于坏段数的前提下继续拆分，最终得到最大可行段数 j=${construction.maxK}。`,
          segments: construction.final
        }
      ]
    : [
        {
          title: '① 先分成正数单点与负数块',
          text: `得到 ${construction.baseCount.good} 个好段、${construction.baseCount.bad} 个坏段。`,
          segments: construction.base
        },
        {
          title: '② 寻找“消块模板”失败',
          text: describeCoupon(null),
          segments: construction.base
        }
      ];

  const safeStage = Math.min(stage, stages.length - 1);
  const current = stages[safeStage];
  const counts = countKinds(current.segments);

  return (
    <div className="my-5 space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="space-y-1">
          <span className="block text-sm font-medium text-gray-700">构造案例</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
            value={exampleId}
            onChange={(event) => {
              setExampleId(event.target.value);
              setStage(0);
            }}
          >
            {CONSTRUCTION_EXAMPLES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          {stages.map((item, index) => (
            <button
              key={item.title}
              type="button"
              className={`rounded-md border px-3 py-2 text-sm ${
                index === safeStage
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setStage(index)}
              aria-pressed={index === safeStage}
            >
              第 {index + 1} 步
            </button>
          ))}
        </div>
      </div>

      <div className="pb-5">
        <SequenceCells values={construction.values} />
      </div>

      <div className="space-y-3 rounded-lg bg-slate-50 p-4" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-gray-900">{current.title}</div>
            <div className="mt-1 text-sm text-gray-600">{current.text}</div>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              counts.good >= counts.bad ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            好段 {counts.good} / 坏段 {counts.bad}
          </div>
        </div>
        <PartitionStrip segments={current.segments} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          disabled={safeStage === 0}
          onClick={() => setStage((value) => Math.max(0, value - 1))}
        >
          上一步
        </button>
        <div className="text-center text-sm text-gray-500">
          绿色是和 ≥ 0 的好段；红色是和 &lt; 0 的坏段。
        </div>
        <button
          type="button"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          disabled={safeStage === stages.length - 1}
          onClick={() => setStage((value) => Math.min(stages.length - 1, value + 1))}
        >
          下一步
        </button>
      </div>
    </div>
  );
};

