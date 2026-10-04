import test from 'node:test';
import assert from 'node:assert/strict';
import { ARC148_GAP_CASES, gapWalkthrough, bruteValidOrders, insertionBatches, openGaps, allocationOptions, insertAllocation } from '../arc148GapModel.js';

test('all small multisets and thresholds match independent distinct-order enumeration', () => {
  let checked = 0;
  function multisets(values, n, start) {
    if (values.length === n) {
      for (let k = 0; k <= 10; k++) {
        const { total, steps } = gapWalkthrough(values, k);
        assert.equal(total, bruteValidOrders(values, k).length, `${values}; K=${k}`);
        for (const step of steps) {
          assert.equal(step.factor, step.options.length);
          if (step.factor) {
            assert.equal(step.nextGaps.length, step.slots + (step.type === 'big' ? step.count : -step.count));
            assert.ok(step.after.every((v, i) => !i || v + step.after[i - 1] >= k));
          }
        }
        checked++;
      }
      return;
    }
    for (let value = start; value <= 4; value++) multisets([...values, value], n, value);
  }
  for (let n = 2; n <= 7; n++) multisets([], n, 0);
  assert.equal(checked, 8646);
});

test('every branch of every teaching case yields each legal sequence exactly once', () => {
  for (const { values, k } of ARC148_GAP_CASES) {
    let states = [[]];
    for (const batch of insertionBatches(values, k)) {
      const next = [];
      let expectedOptions = null;
      for (const state of states) {
        const gaps = openGaps(state, k);
        const options = allocationOptions(batch.type, batch.count, gaps.length);
        expectedOptions ??= options.length;
        assert.equal(options.length, expectedOptions, 'factor must not depend on the earlier choices');
        for (const allocation of options) {
          const after = insertAllocation(state, gaps, allocation, batch.value);
          assert.ok(after.sequence.every((v, i) => !i || v + after.sequence[i - 1] >= k));
          assert.equal(after.inserted.length, batch.count);
          next.push(after.sequence);
        }
      }
      states = next;
    }
    const actual = states.map(s => s.join(',')).sort();
    assert.equal(new Set(actual).size, actual.length, 'equal values must not create duplicate paths');
    assert.deepEqual(actual, bruteValidOrders(values, k).map(s => s.join(',')).sort());
    assert.equal(gapWalkthrough(values, k).total, states.length);
    // Alternate every selectable allocation, including choices leading to zero slots.
    const choices = [];
    for (let i = 0; i < insertionBatches(values, k).length; i++) {
      const step = gapWalkthrough(values, k, choices).steps[i];
      if (!step) break;
      choices[i] = Math.max(0, step.options.length - 1);
    }
    assert.equal(gapWalkthrough(values, k, choices).total, states.length);
  }
});
