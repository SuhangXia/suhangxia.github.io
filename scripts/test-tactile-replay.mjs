import assert from 'node:assert/strict';
import test from 'node:test';
import { graphicsCapabilities, backendOrder, startWithBackends } from '../public/media/tactile-umi/replay.mjs';

test('WebGPU throwing does not discard working WebGL', async () => {
  const environment = { document: { createElement: () => ({ getContext: () => ({ getExtension: () => null }) }) },
    navigator: { gpu: { requestAdapter: async () => { throw Error('driver unavailable'); } } } };
  assert.deepEqual(await graphicsCapabilities(environment), { webgl: true, webgpu: false });
});

test('WebGL throwing does not prevent working WebGPU', async () => {
  const environment = { document: { createElement: () => ({ getContext: () => { throw Error('GL disabled'); } }) },
    navigator: { gpu: { requestAdapter: async () => ({}) } } };
  assert.deepEqual(await graphicsCapabilities(environment), { webgl: false, webgpu: true });
});

test('only available backends are attempted, explicit supported preference first', () => {
  assert.deepEqual(backendOrder({ webgl: true, webgpu: false }, 'webgpu'), ['webgl']);
  assert.deepEqual(backendOrder({ webgl: true, webgpu: true }, 'webgl'), ['webgl', 'webgpu']);
  assert.deepEqual(backendOrder({ webgl: false, webgpu: false }), []);
});

test('failed backend is disposed before a fresh instance/canvas is started', async () => {
  const operations = []; let instances = 0;
  class MockViewer {
    constructor() { this.instance = ++instances; }
    async start(recording, host, options) {
      operations.push(`start ${this.instance} ${options.render_backend}`);
      assert.equal(recording, '/original.rrd');
      if (options.render_backend === 'webgpu') throw Error('surface error');
    }
    stop() { operations.push(`stop ${this.instance}`); }
  }
  const result = await startWithBackends({ WebViewer: MockViewer,
    host: { replaceChildren() { operations.push('clear'); } },
    recording: '/original.rrd', backends: ['webgpu', 'webgl'] });
  assert.equal(result.backend, 'webgl');
  assert.deepEqual(operations, ['clear', 'start 1 webgpu', 'stop 1', 'clear', 'start 2 webgl']);
});

test('all failures leave no broken duplicate viewer in the host', async () => {
  let cleared = 0;
  class MockViewer { async start() { throw Error('no surface'); } stop() {} }
  await assert.rejects(startWithBackends({ WebViewer: MockViewer, host: { replaceChildren() { cleared++; } },
    recording: '/original.rrd', backends: ['webgl'] }), /no surface/);
  assert.equal(cleared, 2);
});
