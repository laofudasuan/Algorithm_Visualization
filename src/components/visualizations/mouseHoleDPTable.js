import { buildMouseHoleTrace, pairCost } from './mouseHoleModel.js';

export const DP_TRANSITIONS = {
  skip: { label: '跳过当前洞', color: '#0284c7', dash: '5 4' },
  close: { label: '完成一次匹配', color: '#8b5cf6' },
  open: { label: '预留端点，等待匹配', color: '#ea8a13' },
  batch: { label: '同一洞接收多只鼠', color: '#059669' },
};

// The entire DAG is calculated up front, but the view only reveals rows <= step.
// Edge weights are derived independently from the recurrence, not from value differences.
export function buildMouseHoleDPTable(c, frames = buildMouseHoleTrace(c)) {
  const signed = c.mode === 'signedDP';
  if (!signed && c.mode !== 'capacityDP') return null;
  const columns = signed
    ? Array.from({ length: c.mice.length + c.holes.length + 1 }, (_, i) => i - c.mice.length)
    : Array.from({ length: c.mice.length + 1 }, (_, i) => i);
  const events = signed ? [
    ...c.mice.map((x, i) => ({ x, i, kind: 'mouse' })),
    ...c.holes.map((x, i) => ({ x, i, kind: 'hole' })),
  ].sort((a, b) => a.x - b.x || (a.kind === b.kind ? a.i - b.i : a.kind === 'hole' ? -1 : 1))
    : c.holes.map((x, i) => ({ x, i, kind: 'hole' })).sort((a, b) => a.x - b.x || a.i - b.i);
  const mice = c.mice.map((_, i) => i).sort((a, b) => c.mice[a] - c.mice[b]);
  const rows = [{ label: '初始', values: columns.map(j => j === 0 ? 0 : Infinity) }, ...events.map((event, index) => {
    const values = signed ? new Map(frames[index + 1].dp) : new Map(frames[index + 1].dp.map((v, i) => [i, v]));
    return { label: `${event.kind === 'mouse' ? '鼠 M' : '洞 H'}${event.i + 1} @ ${event.x}`, event,
      note: signed ? '' : `容量 ${c.capacities?.[event.i] ?? 1} · 费用 ${c.weights?.[event.i] ?? 0}`,
      values: columns.map(j => values.get(j) ?? Infinity) };
  })];
  const edges = [];
  const add = (row, from, to, delta, type, count = 1) => {
    const source = rows[row - 1].values[columns.indexOf(from)];
    if (!Number.isFinite(source) || !columns.includes(to)) return;
    edges.push({ id: `${row}:${from}:${to}`, row, from, to, delta, type, count, candidate: source + delta,
      winner: source + delta === rows[row].values[columns.indexOf(to)] });
  };
  events.forEach((event, index) => {
    const row = index + 1;
    if (signed) {
      for (const from of columns) {
        if (event.kind === 'hole') {
          add(row, from, from, 0, 'skip', 0);
          add(row, from, from + 1, from < 0 ? event.x : -event.x, from < 0 ? 'close' : 'open');
        } else add(row, from, from - 1, from > 0 ? event.x : -event.x, from > 0 ? 'close' : 'open');
      }
    } else {
      for (const to of columns) {
        let delta = 0;
        for (let k = 0; k <= Math.min(to, c.capacities?.[event.i] ?? 1); k++) {
          if (k) delta += pairCost(c, mice[to - k], event.i);
          add(row, to - k, to, delta, k === 0 ? 'skip' : k === 1 ? 'close' : 'batch', k);
        }
      }
    }
  });
  return { columns, rows, edges, symbol: signed ? 'f' : 'F', rowVariable: signed ? 'i' : 'j', columnVariable: signed ? 'j' : 'i', target: signed ? 0 : c.mice.length };
}
