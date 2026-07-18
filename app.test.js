import test from 'node:test';
import assert from 'node:assert/strict';

test('scoring threshold behaves as a minimum', () => {
  const scores = [87, 83, 76, 69];
  assert.deepEqual(scores.filter((score) => score >= 76), [87, 83, 76]);
});
