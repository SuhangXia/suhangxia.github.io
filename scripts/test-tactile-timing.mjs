import assert from 'node:assert/strict';
import { test } from 'node:test';
import { timingExample, selectTimingSample } from '../src/data/tactile-timing.ts';

test('availability changes the actual chosen right tactile sample', () => {
  const s = timingExample.streams[3];
  assert.equal(selectTimingSample(s.observations, s.delay, 0, 80, 60, false), 5);
  assert.equal(selectTimingSample(s.observations, s.delay, 0, 80, 60, true), -45);
});
test('reference time and deadline remain distinct for state observations', () => {
  assert.equal(selectTimingSample([-30, 10, 50], 10, 0, 80, 60, true), 10);
});
test('closest-to-reference rule is not newest-available selection', () => {
  assert.equal(selectTimingSample([-30, 10, 50], 10, 0, 80, 60, true), 10);
});
test('no available matching observation remains missing', () => {
  assert.equal(selectTimingSample([-200, 5], 90, 0, 80, 60, true), null);
});
