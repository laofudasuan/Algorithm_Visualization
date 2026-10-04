// Tiny exact examples for teaching; production counts must use modular arithmetic.
export const ARC148_GAP_CASES = [
  { name: '分批解锁 · 看大数怎样分配', k: 10, values: [7, 1, 9, 5, 3, 9, 7] },
  { name: '重复小数 · 一个空位最多放一个', k: 10, values: [2, 2, 8, 8, 8] },
  { name: '小数太多 · 空位不够怎么办', k: 10, values: [1, 1, 1, 9] },
  { name: '空位耗尽 · 还有大数没放', k: 10, values: [1, 1, 5, 9] },
  { name: '全是大数 · 相同元素不编号', k: 10, values: [5, 5, 6, 8] },
];

export function choose(n, r) {
  if (r < 0 || n < r) return 0;
  let result = 1;
  for (let i = 1; i <= Math.min(r, n - r); i++) result = result * (n - i + 1) / i;
  return Math.round(result);
}

export function insertionBatches(values, k) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  const big = [...counts.keys()].filter(v => 2 * v >= k).sort((a, b) => b - a);
  const small = [...counts.keys()].filter(v => 2 * v < k).sort((a, b) => a - b);
  const batches = [];
  let at = 0;
  for (const value of small) {
    while (at < big.length && big[at] >= k - value) {
      const v = big[at++];
      batches.push({ value: v, count: counts.get(v), type: 'big', forSmall: value });
    }
    batches.push({ value, count: counts.get(value), type: 'small' });
  }
  while (at < big.length) {
    const value = big[at++];
    batches.push({ value, count: counts.get(value), type: 'big', forSmall: null });
  }
  return batches;
}

// Boundary i lies before sequence[i]; ends are boundaries too.
export function openGaps(sequence, k) {
  return Array.from({ length: sequence.length + 1 }, (_, i) => i).filter(i =>
    (i === 0 || 2 * sequence[i - 1] >= k) && (i === sequence.length || 2 * sequence[i] >= k));
}

export function allocationOptions(type, count, slots) {
  const result = [];
  function visit(remaining, allocation) {
    if (allocation.length === slots) {
      if (!remaining) result.push(allocation);
      return;
    }
    const capacity = type === 'small' ? Math.min(1, remaining) : remaining;
    for (let c = 0; c <= capacity; c++) visit(remaining - c, [...allocation, c]);
  }
  visit(count, []);
  return result;
}

export function insertAllocation(sequence, gaps, allocation, value) {
  const result = [], inserted = [];
  let slot = 0;
  for (let i = 0; i <= sequence.length; i++) {
    if (gaps[slot] === i) {
      for (let c = 0; c < allocation[slot]; c++) { inserted.push(result.length); result.push(value); }
      slot++;
    }
    if (i < sequence.length) result.push(sequence[i]);
  }
  return { sequence: result, inserted };
}

export function gapWalkthrough(values, k, selections = []) {
  const batches = insertionBatches(values, k), steps = [];
  let sequence = [], total = 1;
  for (const [index, batch] of batches.entries()) {
    const gaps = openGaps(sequence, k), slots = gaps.length;
    const factor = batch.type === 'big' ? (slots ? choose(batch.count + slots - 1, slots - 1) : 0) : choose(slots, batch.count);
    const options = allocationOptions(batch.type, batch.count, slots);
    const selection = Math.min(Math.max(selections[index] || 0, 0), Math.max(0, options.length - 1));
    const allocation = options[selection] || [];
    const after = factor ? insertAllocation(sequence, gaps, allocation, batch.value) : { sequence: [...sequence], inserted: [] };
    const nextGaps = openGaps(after.sequence, k);
    steps.push({ ...batch, before: sequence, gaps, slots, factor, options, selection, allocation,
      after: after.sequence, inserted: after.inserted, nextGaps, beforeTotal: total, total: total * factor });
    sequence = after.sequence;
    total *= factor;
    if (!factor) break;
  }
  return { batches, steps, total };
}

// Independent oracle: enumerate distinct value sequences and test the condition.
export function bruteValidOrders(values, k) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  const orders = [];
  function visit(sequence) {
    if (sequence.length === values.length) { orders.push(sequence); return; }
    for (const [value, count] of counts) {
      if (!count || (sequence.length && sequence.at(-1) + value < k)) continue;
      counts.set(value, count - 1); visit([...sequence, value]); counts.set(value, count);
    }
  }
  visit([]);
  return orders;
}
