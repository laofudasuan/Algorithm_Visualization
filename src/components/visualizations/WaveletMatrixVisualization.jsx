import React, { useMemo, useState } from 'react';

const MAX_BITS = 4;
const ARRAY_LENGTH = 10;
const HIGHLIGHT_COLORS = {
  0: {
    wrap: 'bg-red-50 border-red-300 text-red-800',
    bit: 'bg-red-100 text-red-700',
    badge: 'bg-red-100 text-red-700 border-red-200',
  },
  1: {
    wrap: 'bg-blue-50 border-blue-300 text-blue-800',
    bit: 'bg-blue-100 text-blue-700',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
  },
};

const INITIAL_ARRAY = [9, 2, 14, 7, 3, 12, 5, 10, 1, 6];

const toBinaryString = (value) => value.toString(2).padStart(MAX_BITS, '0');

const splitByBit = (array, bit) => {
  const zeros = [];
  const ones = [];

  array.forEach((value) => {
    if (((value >> bit) & 1) === 0) {
      zeros.push(value);
    } else {
      ones.push(value);
    }
  });

  return { zeros, ones, next: [...zeros, ...ones] };
};

const buildRows = (array, completedLevels) => {
  const rows = [{ label: '初始序列', values: array, sourceBit: null }];
  let current = array;

  for (let level = 0; level < completedLevels; level += 1) {
    const bit = MAX_BITS - 1 - level;
    const { next } = splitByBit(current, bit);
    rows.push({
      label: `处理第 ${bit} 位后`,
      values: next,
      sourceBit: bit,
    });
    current = next;
  }

  return rows;
};

const makeRandomArray = () =>
  Array.from({ length: ARRAY_LENGTH }, () => Math.floor(Math.random() * 2 ** MAX_BITS));

const IconButton = ({ title, onClick, disabled, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className="w-9 h-9 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45 flex items-center justify-center transition-colors"
  >
    {children}
  </button>
);

const ValueCell = ({ value, activeBit, muted }) => {
  const binary = toBinaryString(value);
  const bitValue = activeBit === null ? null : (value >> activeBit) & 1;
  const color = bitValue === null ? null : HIGHLIGHT_COLORS[bitValue];
  const activeIndex = activeBit === null ? -1 : MAX_BITS - 1 - activeBit;

  return (
    <div
      className={`w-[58px] h-[58px] shrink-0 rounded-md border flex flex-col items-center justify-center font-mono shadow-sm transition-colors ${
        color ? color.wrap : muted ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      <div className="text-lg leading-5 font-bold">{value}</div>
      <div className="mt-1 text-[11px] leading-4 tracking-normal text-gray-500">
        {binary.split('').map((char, idx) => (
          <span
            key={`${value}-${idx}-${char}`}
            className={idx === activeIndex ? `rounded px-0.5 font-bold ${color?.bit || 'bg-gray-100'}` : ''}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

const WaveletMatrixVisualization = () => {
  const [baseArray, setBaseArray] = useState(INITIAL_ARRAY);
  const [completedLevels, setCompletedLevels] = useState(0);

  const rows = useMemo(() => buildRows(baseArray, completedLevels), [baseArray, completedLevels]);
  const currentBit = MAX_BITS - 1 - completedLevels;
  const isFinished = completedLevels >= MAX_BITS;
  const currentArray = rows[rows.length - 1].values;
  const currentSplit = isFinished ? null : splitByBit(currentArray, currentBit);
  const previousActiveBit = completedLevels === 0 ? null : MAX_BITS - completedLevels;

  const generate = () => {
    setBaseArray(makeRandomArray());
    setCompletedLevels(0);
  };

  const reset = () => {
    setBaseArray(INITIAL_ARRAY);
    setCompletedLevels(0);
  };

  const nextLevel = () => {
    if (!isFinished) {
      setCompletedLevels((level) => level + 1);
    }
  };

  return (
    <div data-vis className="my-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-base font-semibold text-gray-900">小波矩阵构建过程</div>
          <div className="mt-1 text-sm text-gray-600">
            从高位到低位稳定分流：当前位为 0 的数放在左侧，当前位为 1 的数放在右侧。
          </div>
        </div>

        <div className="flex items-center gap-2">
          <IconButton title="随机生成序列" onClick={generate}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5" />
              <path d="M4 20 21 3" />
              <path d="M21 16v5h-5" />
              <path d="M15 15l6 6" />
              <path d="M4 4l5 5" />
            </svg>
          </IconButton>
          <IconButton title="下一层" onClick={nextLevel} disabled={isFinished}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </IconButton>
          <IconButton title="重置示例" onClick={reset}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 15.4-6.4" />
              <path d="M18 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15.4 6.4" />
              <path d="M6 21v-5h5" />
            </svg>
          </IconButton>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="overflow-x-auto rounded-lg border border-gray-100 bg-gray-50 p-3">
          <div className="min-w-[760px] space-y-3">
            {rows.map((row, rowIndex) => {
              const activeBit = rowIndex === rows.length - 1 ? (isFinished ? null : currentBit) : row.sourceBit;
              return (
                <div key={`${row.label}-${rowIndex}`} className="flex items-center gap-3 rounded-lg bg-white p-3">
                  <div className="w-28 shrink-0 text-sm font-semibold text-gray-700">{row.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {row.values.map((value, idx) => (
                      <ValueCell
                        key={`${rowIndex}-${idx}-${value}`}
                        value={value}
                        activeBit={activeBit}
                        muted={rowIndex !== rows.length - 1 && activeBit !== previousActiveBit}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
          <div className="font-semibold text-gray-900">当前状态</div>
          {isFinished ? (
            <div className="mt-2 leading-6">
              所有二进制位都已处理完。底层序列已经按位稳定整理完成，实际小波矩阵只需要保存每层的 0/1 状态和前缀计数。
            </div>
          ) : (
            <>
              <div className="mt-2 leading-6">
                正在观察第 <span className="font-mono font-bold text-gray-900">{currentBit}</span> 位，权值为{' '}
                <span className="font-mono font-bold text-gray-900">{2 ** currentBit}</span>。
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${HIGHLIGHT_COLORS[0].badge}`}>
                  0 队列：{currentSplit.zeros.length}
                </span>
                <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${HIGHLIGHT_COLORS[1].badge}`}>
                  1 队列：{currentSplit.ones.length}
                </span>
              </div>
              <div className="mt-3 rounded-md bg-white p-2 font-mono text-xs text-gray-600">
                {currentArray.map((value) => toBinaryString(value)).join('  ')}
              </div>
            </>
          )}

          <div className="mt-4 border-t border-gray-200 pt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">处理进度</div>
            <div className="mt-2 grid grid-cols-4 gap-1">
              {Array.from({ length: MAX_BITS }).map((_, idx) => {
                const bit = MAX_BITS - 1 - idx;
                const done = idx < completedLevels;
                const active = idx === completedLevels;
                return (
                  <div
                    key={bit}
                    className={`rounded-md border px-2 py-1 text-center text-xs font-mono ${
                      done
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : active
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-500'
                    }`}
                  >
                    bit {bit}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveletMatrixVisualization;
