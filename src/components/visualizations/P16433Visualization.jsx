import React, { useMemo, useState } from 'react';

const INITIAL_N = 15;
const INITIAL_P = '0 0 3 0 5 0 0 9 0 0 11 0 0 13 0';
const INITIAL_Q = '1 6 3 2 5 8 12 9 10 15 11 14 4 13 7';

const parseNumbers = (text) => {
  if (!text) return [];
  return text
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((x) => Number(x));
};

const isStrictlyIncreasing = (arr) => {
  for (let i = 1; i < arr.length; i++) {
    if (!(arr[i - 1] < arr[i])) return false;
  }
  return true;
};

const buildDefaultQ = (n, p) => {
  const used = new Set(p.filter((x) => x !== 0));
  const rest = [];
  for (let v = 1; v <= n; v++) {
    if (!used.has(v)) rest.push(v);
  }

  let ptr = 0;
  return p.map((x) => (x === 0 ? rest[ptr++] : x));
};

const buildAscentMask = (values) => {
  const mask = new Array(Math.max(0, values.length - 1)).fill(false);
  for (let i = 0; i + 1 < values.length; i++) {
    // 只有当当前位置和下一个位置都不是0时，才判断是否为上升位置
    if (values[i] !== 0 && values[i + 1] !== 0) {
      mask[i] = values[i] < values[i + 1];
    }
  }
  return mask;
};

const BarRow = ({ title, n, values, fixedMask, color, fixedColor, ascentMask, getBarColor }) => {
  const maxH = 360;
  const minH = 12;
  const w = 48;
  const gap = 16;

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-700 font-medium">{title}</div>
      <div className="overflow-x-auto">
        <div className="flex items-end" style={{ gap: `${gap}px`, minWidth: `${values.length * (w + gap)}px` }}>
          {values.map((v, idx) => {
            const h = v === 0 ? minH : Math.round((v / n) * maxH) + minH;
            const isFixed = fixedMask[idx];
            const isAscent = ascentMask ? ascentMask[idx] === true : false;
            const backgroundColor = getBarColor ? getBarColor({ idx, value: v, isFixed }) : isFixed ? fixedColor : color;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className="rounded-md"
                  style={{
                    width: `${w}px`,
                    height: `${h}px`,
                    backgroundColor,
                    opacity: v === 0 ? 0.25 : 1,
                    transition: 'height 150ms ease'
                  }}
                  title={`pos=${idx + 1}, value=${v}`}
                />
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-sm text-gray-500">{idx + 1}</div>
                  {idx < values.length - 1 && isAscent ? (
                    <div className="text-sm leading-none text-emerald-600" title={`上升位置 i=${idx + 1}`}>
                      ↑
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const P16433Visualization = () => {
  const [n, setN] = useState(INITIAL_N);
  const [pText, setPText] = useState(INITIAL_P);
  const [qText, setQText] = useState(INITIAL_Q);
  const [dpI, setDpI] = useState(8);

  const parsed = useMemo(() => {
    const nn = Number(n);
    const raw = parseNumbers(pText);
    const p = Array.from({ length: nn }).map((_, i) => raw[i] ?? 0);

    const badToken = raw.some((x) => !Number.isFinite(x) || !Number.isInteger(x));
    if (badToken) return { ok: false, error: 'p 格式错误：请用空格/逗号分隔整数。' };

    const badRange = p.some((x) => x < 0 || x > nn);
    if (badRange) return { ok: false, error: `p 范围错误：每个值需在 0..${nn}。` };

    const nonZero = p.filter((x) => x !== 0);
    const set = new Set(nonZero);
    if (set.size !== nonZero.length) return { ok: false, error: 'p 非 0 值重复：不符合排列约束。' };

    if (!isStrictlyIncreasing(nonZero)) return { ok: false, error: 'p 的非 0 值不是严格递增：不满足题目保证。' };

    const fixedMask = p.map((x) => x !== 0);
    const qRaw = parseNumbers(qText);
    const q = Array.from({ length: nn }).map((_, i) => qRaw[i] ?? 0);

    const qBadToken = qRaw.some((x) => !Number.isFinite(x) || !Number.isInteger(x));
    if (qBadToken) return { ok: false, error: 'q 格式错误：请用空格/逗号分隔整数。' };

    if (qRaw.length === 0) return { ok: false, error: '请在 q 输入框中输入一个排列。' };
    if (q.some((x) => x === undefined)) return { ok: false, error: `q 长度不足：需要 ${nn} 个数。` };

    const qBadRange = q.some((x) => x < 0 || x > nn);
    if (qBadRange) return { ok: false, error: `q 范围错误：每个值需在 0..${nn}。` };

    const nonZeroQ = q.filter((x) => x !== 0);
    const qSet = new Set(nonZeroQ);
    if (qSet.size !== nonZeroQ.length) return { ok: false, error: 'q 非 0 值重复：不符合排列约束。' };

    for (let i = 0; i < nn; i++) {
      if (p[i] !== 0 && q[i] !== p[i]) {
        return { ok: false, error: `q 与 p 不匹配：位置 ${i + 1} 必须为 ${p[i]}。` };
      }
    }

    const ascentMask = buildAscentMask(q);
    return { ok: true, n: nn, p, q, fixedMask, ascentMask };
  }, [n, pText, qText]);

  const dp = useMemo(() => {
    if (!parsed.ok) return { ok: false };

    const ii = Number(dpI);
    if (!Number.isFinite(ii) || !Number.isInteger(ii)) return { ok: false, error: 'i 必须是整数。' };
    if (ii < 1 || ii > parsed.n) return { ok: false, error: `i 需要在 1..${parsed.n}。` };

    const iIndex = ii - 1;
    let jIndex = -1;
    for (let k = iIndex - 1; k >= 0; k--) {
      if (parsed.fixedMask[k]) {
        jIndex = k;
        break;
      }
    }

    return { ok: true, iIndex, jIndex };
  }, [dpI, parsed]);

  return (
    <div className="border rounded-lg bg-white p-4 space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <div className="text-sm text-gray-700 font-medium">n</div>
          <input
            className="border rounded-md px-3 py-2 w-24"
            type="number"
            min="2"
            max="30"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
          />
        </div>
        <div className="flex-1 space-y-1 min-w-[240px]">
          <div className="text-sm text-gray-700 font-medium">p（用 0 表示缺失）</div>
          <input
            className="border rounded-md px-3 py-2 w-full"
            value={pText}
            onChange={(e) => setPText(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1 min-w-[240px]">
          <div className="text-sm text-gray-700 font-medium">q（手动输入一个符合 p 的排列）</div>
          <input
            className="border rounded-md px-3 py-2 w-full"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="例如：1 2 3 4 ..."
          />
        </div>
      </div>

      {parsed.ok ? (
        <div className="space-y-4">
          <BarRow title="初始p" n={parsed.n} values={parsed.p} fixedMask={parsed.fixedMask} color="#9ca3af" fixedColor="#2563eb" />
          <BarRow
            title="q"
            n={parsed.n}
            values={parsed.q}
            fixedMask={parsed.fixedMask}
            color="#10b981"
            fixedColor="#2563eb"
            ascentMask={parsed.ascentMask}
          />

          <div className="rounded-lg bg-slate-50 p-3 space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <div className="text-sm text-gray-700 font-medium">DP 参数 i</div>
                <input
                  className="border rounded-md px-3 py-2 w-28 bg-white"
                  type="number"
                  min="1"
                  max={parsed.n}
                  value={dpI}
                  onChange={(e) => setDpI(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="px-2 py-1 rounded-md text-white" style={{ backgroundColor: '#2563eb' }}>
                  蓝：固定位置
                </div>
                <div className="px-2 py-1 rounded-md text-white" style={{ backgroundColor: '#ef4444' }}>
                  红：当前位置 i
                </div>
                <div className="px-2 py-1 rounded-md text-slate-900" style={{ backgroundColor: '#6ee7b7' }}>
                  浅绿：&lt; j
                </div>
                <div className="px-2 py-1 rounded-md text-white" style={{ backgroundColor: '#047857' }}>
                  深绿：&gt; j
                </div>
              </div>
            </div>

            {dp.ok ? (
              <BarRow
                title="DP 视角着色"
                n={parsed.n}
                values={parsed.q}
                fixedMask={parsed.fixedMask}
                color="#10b981"
                fixedColor="#2563eb"
                getBarColor={({ idx, value }) => {
                  if (idx === dp.iIndex) return '#ef4444';
                  if (parsed.fixedMask[idx]) return '#2563eb';

                  if (dp.jIndex !== -1 && idx < dp.iIndex) {
                    const jv = parsed.q[dp.jIndex];
                    if (value !== 0 && jv !== 0) {
                      if (value < jv) return '#6ee7b7';
                      if (value > jv) return '#047857';
                    }
                  }

                  return '#10b981';
                }}
              />
            ) : (
              <div className="rounded-md px-3 py-2 bg-red-50 text-red-700 border-red-200">{dp.error}</div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-md px-3 py-2 bg-red-50 text-red-700 border-red-200">{parsed.error}</div>
      )}

      <div className="text-sm text-gray-600">
        ↑ 标记表示上升位置 i（q_i &lt; q_&#123;i+1&#125;）。
      </div>
    </div>
  );
};

export default P16433Visualization;
