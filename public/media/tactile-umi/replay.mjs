// Integration only: original Rerun SDK, original .rrd, no replacement renderer.
export async function graphicsCapabilities(environment = globalThis) {
  let webgl = false;
  let webgpu = false;
  try {
    const gl = environment.document.createElement('canvas').getContext('webgl2');
    webgl = Boolean(gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch { /* GL failure must not prevent the independent WebGPU probe. */ }
  let gpuTimeout;
  try {
    webgpu = Boolean(await Promise.race([
      environment.navigator.gpu?.requestAdapter(),
      new Promise((resolve) => { gpuTimeout = setTimeout(() => resolve(null), 4000); }),
    ]));
  } catch { /* Exposed WebGPU can still be disabled by the graphics driver. */ }
  finally { clearTimeout(gpuTimeout); }
  return { webgl, webgpu };
}

export function backendOrder(capabilities, preferred) {
  const supported = ['webgpu', 'webgl'].filter((name) => capabilities[name]);
  return supported.includes(preferred)
    ? [preferred, ...supported.filter((name) => name !== preferred)] : supported;
}

export async function startWithBackends({ WebViewer, host, recording, backends, onAttempt = () => {} }) {
  const errors = [];
  for (const backend of backends) {
    // Never reuse a canvas that already acquired a different GPU context.
    host.replaceChildren();
    const viewer = new WebViewer();
    onAttempt(backend, viewer);
    try {
      await viewer.start(recording, host, {
        width: '100%', height: '100%', theme: 'dark', render_backend: backend,
        hide_welcome_screen: true,
      });
      return { viewer, backend };
    } catch (error) {
      errors.push(`${backend}: ${String(error)}`);
      try { viewer.stop(); } catch { /* Partial initialization may not stop. */ }
    }
  }
  host.replaceChildren();
  throw new Error(errors.join('\n') || 'No supported graphics backend.');
}

async function mount() {
  const status = document.getElementById('status');
  const host = document.getElementById('viewer');
  const params = new URLSearchParams(location.search);
  const zh = params.get('lang') === 'zh';
  document.documentElement.lang = zh ? 'zh-CN' : 'en';
  const t = (en, chinese) => zh ? chinese : en;
  const diagnostics = { state: 'checking', backend: null, recordingId: null, version: '0.31.4' };
  // No private paths: diagnostics support reproducible browser acceptance checks.
  window.tactileReplay = diagnostics;
  const setStatus = (stage, message) => {
    diagnostics.state = stage;
    status.dataset.stage = stage;
    status.textContent = message;
    status.hidden = false;
  };
  const retryLink = (label, backend) => {
    const link = document.createElement('a');
    const target = new URL(location.href);
    if (backend) target.searchParams.set('backend', backend);
    else target.searchParams.delete('backend');
    target.searchParams.set('retry', String(Date.now()));
    link.href = target.href;
    link.textContent = label;
    return link;
  };
  function failure(error, graphicsMissing = false) {
    diagnostics.state = graphicsMissing ? 'graphics-unavailable' : 'failed';
    host.hidden = true;
    status.hidden = false;
    status.dataset.stage = 'failed';
    const heading = document.createElement('h1');
    heading.textContent = t('Interactive replay could not start', '交互式轨迹暂时无法启动');
    const explanation = document.createElement('p');
    explanation.textContent = graphicsMissing
      ? t('This browser cannot create either a WebGL2 or WebGPU context. The competition website uses the same graphics APIs. Enable graphics acceleration, fully restart the browser, then retry. A webpage cannot enable a disabled browser GPU backend.', '此浏览器无法创建 WebGL2 或 WebGPU 上下文，比赛网站同样需要图形后端。请启用浏览器图形加速，完全退出并重新启动浏览器后重试。网页无法自行开启被禁用的图形后端。')
      : t('The original Rerun viewer could not finish loading. Retry or open the replay in a separate tab. The viewer and recording are served with this website, without a third-party module CDN.', '原版 Rerun 播放器未能完成加载。请重试或在独立标签页打开。播放器和轨迹随本站提供，无需第三方模块 CDN。');
    const navigation = document.createElement('nav');
    navigation.append(retryLink(t('Retry interactive replay', '重试交互回放')));
    if (graphicsMissing) {
      const help = document.createElement('a');
      help.href = 'https://rerun.io/docs/getting-started/troubleshooting';
      help.target = '_blank'; help.rel = 'noreferrer';
      help.textContent = t('Rerun graphics troubleshooting ↗', 'Rerun 图形故障说明 ↗');
      navigation.append(help);
    } else {
      for (const backend of ['webgl', 'webgpu']) navigation.append(retryLink(`Try ${backend === 'webgl' ? 'WebGL2' : 'WebGPU'}`, backend));
    }
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = t('Technical details', '技术详情');
    const pre = document.createElement('pre'); pre.textContent = String(error);
    details.append(summary, pre);
    status.replaceChildren(heading, explanation, navigation, details);
    console.error('Tactile UMI replay:', error);
  }

  let activeViewer;
  let recordingTimer;
  try {
    const capabilities = await graphicsCapabilities();
    diagnostics.capabilities = capabilities;
    const order = backendOrder(capabilities, params.get('backend'));
    if (!order.length) { failure('WebGL2: unavailable; WebGPU: unavailable.', true); return; }
    setStatus('runtime', t('Loading original Rerun viewer…', '正在加载原版 Rerun 播放器…'));
    const { WebViewer } = await import('/vendor/rerun/0.31.4/index.js');
    const recording = new URL('./audit-episode-000001.rrd', location.href).href;
    const result = await startWithBackends({ WebViewer, host, recording, backends: order,
      onAttempt(backend) { diagnostics.backend = backend; },
    });
    activeViewer = result.viewer;
    host.hidden = false;
    setStatus('recording', t('Loading one recorded trajectory…', '正在加载单条轨迹…'));
    const markLoaded = () => {
      const id = activeViewer.get_active_recording_id();
      if (!id) return;
      const timeline = 'time';
      const range = activeViewer.get_time_range(id, timeline);
      if (!range || range.max <= range.min) return;
      activeViewer.set_active_timeline(id, timeline);
      clearInterval(recordingTimer);
      diagnostics.state = 'ready'; diagnostics.recordingId = id;
      status.hidden = true;
      // Streaming can extend the range after the first usable frames arrive.
      Object.defineProperties(diagnostics, {
        timeline: { enumerable: true, get: () => activeViewer.get_active_timeline(id) },
        timeRange: { enumerable: true, get: () => activeViewer.get_time_range(id, timeline) },
        currentTime: { enumerable: true, get: () => activeViewer.get_current_time(id, timeline) },
      });
    };
    recordingTimer = setInterval(markLoaded, 250);
    setTimeout(() => {
      if (diagnostics.state === 'recording') {
        activeViewer.stop(); clearInterval(recordingTimer);
        failure('The recording did not become available within 60 seconds.');
      }
    }, 60000);
    window.addEventListener('pagehide', () => { clearInterval(recordingTimer); activeViewer?.stop(); }, { once: true });
  } catch (error) { clearInterval(recordingTimer); failure(error); }
}

if (typeof document !== 'undefined' && document.getElementById('viewer')) mount();
