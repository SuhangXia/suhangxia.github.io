import { mkdir, writeFile } from 'node:fs/promises';

// Native vector artwork for the website, not a rasterized screenshot or a new renderer.
// Header numbers have their own lane. Text never shares space with connector paths.
const output = new URL('../src/assets/media/tactile-umi/', import.meta.url);
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const stages = [
  { title: ['Calibrate', '空间与时间标定'], subtitle: ['Geometry & sensor clocks', '安装几何与传感器时钟'], nodes: [
    { id: 'mounts', y: 126, h: 100, title: ['Mounts & camera calibration', '安装与相机标定'], lines: [['Rigid mounts · independent intrinsics', '固定安装 · 独立相机内参'], ['FR3 wrist-camera hand–eye calibration', 'FR3 腕部相机手眼标定']] },
    { id: 'quest', y: 258, h: 100, title: ['Quest–camera hand–eye', 'Quest–相机手眼标定'], lines: [['TCP geometry · transform direction', 'TCP 几何 · 变换方向'], ['Multi-pose calibration & consistency', '多姿态标定与一致性检查']] },
    { id: 'timing', y: 390, h: 100, title: ['Gripper & stream timing', '夹爪与跨流时间标定'], lines: [['ArUco width LUT · Quest/RGB offset', 'ArUco 宽度查找表 · Quest/RGB 偏移'], ['Tactile-camera latency calibration', '触觉相机延迟标定']] },
    { id: 'calibration', y: 522, h: 90, kind: 'artifact', title: ['Calibration configuration', '标定配置'], lines: [['Views · transforms · widths · offsets', '视角 · 变换 · 宽度 · 时间偏移']] },
  ] },
  { title: ['Collect & curate', '数据采集与审查'], subtitle: ['Native records → training dataset', '原始记录 → 训练数据'], nodes: [
    { id: 'record', y: 126, h: 100, title: ['Multimodal recording', '多模态采集'], lines: [['Wrist RGB · left/right tactile', '腕部 RGB · 左右触觉'], ['Quest motion · gripper state', 'Quest 位姿 · 夹爪状态']] },
    { id: 'raw', y: 258, h: 90, kind: 'artifact', title: ['Raw H5', '原始 H5'], lines: [['Separate streams & host timestamps', '独立数据流与主机时间戳']] },
    { id: 'align', y: 380, h: 100, title: ['Align & derive poses', '时间对齐与位姿派生'], lines: [['Apply measured latency offsets', '应用实测延迟偏移'], ['Camera-relative pose / action records', '相机相对位姿 / 动作记录']] },
    { id: 'audit', y: 512, h: 100, title: ['Audit & select', '数据审查与筛选'], lines: [['CLI: integrity · timing · jumps', 'CLI：完整性 · 时间 · 跳变检查'], ['Web: timeline review · manual decisions', '网页：时间线复核 · 人工筛选']] },
    { id: 'zarr', y: 644, h: 90, kind: 'artifact', title: ['Clean Zarr', '清洗后 Zarr'], lines: [['7D actions · six-record tactile histories', '7D 动作 · 六帧触觉历史记录']] },
  ] },
  { title: ['Learn & execute', '模型学习与执行'], subtitle: ['Two-stage UniForce → robot policy', '两阶段 UniForce → 机器人策略'], nodes: [
    { id: 'pretrain', y: 126, h: 100, title: ['Simulation pretraining', '仿真预训练'], lines: [['Taichi loading-only indentation data', 'Taichi 仅压入阶段仿真数据'], ['UniForce tactile representation', 'UniForce 触觉表征']] },
    { id: 'adapt', y: 258, h: 100, title: ['Real-sensor adaptation', '真实传感器适配'], lines: [['Paired real tactile press recordings', '配对真实触觉按压记录'], ['Six-frame causal windows', '六帧因果时间窗口']] },
    { id: 'frozen', y: 390, h: 90, kind: 'frozen', title: ['Frozen UniForce', '冻结 UniForce'], lines: [['Encoder fixed during policy training', '策略训练期间不更新编码器']] },
    { id: 'policy', y: 512, h: 100, title: ['Tactile-conditioned DP', '触觉条件扩散策略'], lines: [['RGB + state + learned tactile adapter', 'RGB + 状态 + 可学习触觉 adapter'], ['Eight camera-relative 7D actions', '八步相机相对 7D 动作']] },
    { id: 'robot', y: 644, h: 90, title: ['Franka FR3 execution', 'Franka FR3 执行'], lines: [['TCP bridge · Robotiq gripper', 'TCP 通信桥 · Robotiq 夹爪'], ['Polymetis impedance control', 'Polymetis 阻抗控制']] },
  ] },
];

function diagram(locale, mobile) {
  const pick = (pair) => pair[locale === 'zh' ? 1 : 0];
  const width = mobile ? 440 : 1440;
  const height = mobile ? 2280 : 824;
  const body = [];
  const nodes = new Map();
  const compactLabels = {
    'Rigid mounts · independent intrinsics': 'Rigid mounts · camera intrinsics',
    'FR3 wrist-camera hand–eye calibration': 'FR3 wrist camera: hand–eye',
    'Camera-relative pose / action records': 'Camera-relative poses / actions',
    'Separate streams & host timestamps': 'Streams & host timestamps',
    'Web: timeline review · manual decisions': 'Web: replay & manual review',
    '7D actions · six-record tactile histories': '7D actions · six-record tactile history',
    'RGB + state + learned tactile adapter': 'RGB + state + tactile adapter',
    'ArUco 宽度查找表 · Quest/RGB 偏移': '夹爪宽度 LUT · Quest/RGB 偏移',
  };
  const text = (x, y, value, cls = 'body', extra = '') => `<text x="${x}" y="${y}" class="${cls}" ${extra}>${escape(value)}</text>`;
  function node(n, x, y, w) {
    nodes.set(n.id, { x, y, w, h: n.h });
    const fill = n.kind === 'artifact' ? '#f1f3ee' : n.kind === 'frozen' ? '#e8eee6' : '#fff';
    const detailSize = mobile ? 20 : 17;
    body.push(`<g data-node="${n.id}"><rect x="${x}" y="${y}" width="${w}" height="${n.h}" rx="3" fill="${fill}" stroke="#d1d8ce"/>`);
    if (n.kind) body.push(`<path d="M${x+1} ${y+12}V${y+n.h-12}" stroke="#476b5a" stroke-width="3"/>`);
    body.push(text(x+20, y+31, pick(n.title), 'node-title'));
    n.lines.forEach((line, j) => {
      const value = pick(line);
      body.push(text(x+20, y+57+j*23, mobile ? compactLabels[value] ?? value : value, 'body', `style="font-size:${detailSize}px"`));
    });
    body.push('</g>');
  }
  const phaseStarts = mobile ? [24, 712, 1510] : [34, 34, 34];
  stages.forEach((stage, index) => {
    const x = mobile ? 28 : 36 + index * 472;
    const w = mobile ? 384 : 424;
    const top = phaseStarts[index];
    body.push(`<g data-stage="${index+1}">`);
    body.push(text(x, top+25, `0${index+1}`, 'number'));
    body.push(text(x+48, top+25, pick(stage.title), 'stage-title'));
    body.push(text(x, top+57, pick(stage.subtitle), 'subtitle'));
    body.push(`<path d="M${x} ${top+76}H${x+w}" stroke="#bfc8bb"/>`);
    stage.nodes.forEach((n) => node(n, x, mobile ? top+n.y-20 : n.y, w));
    body.push('</g>');
  });
  // Connectors are painted beneath boxes and remain inside dedicated gutters.
  const connectors = [];
  const path = (d, dashed = false) => connectors.push(`<path d="${d}" fill="none" stroke="${dashed ? '#8d9688' : '#476b5a'}" stroke-width="1.6" ${dashed ? 'stroke-dasharray="5 5"' : ''} marker-end="url(#arrow)"/>`);
  stages.forEach((stage) => stage.nodes.slice(1).forEach((n, i) => {
    const from = nodes.get(stage.nodes[i].id), to = nodes.get(n.id);
    path(`M${from.x+from.w/2} ${from.y+from.h+5}V${to.y-7}`);
  }));
  if (!mobile) {
    const config = nodes.get('calibration'), record = nodes.get('record');
    path(`M${config.x+config.w} ${config.y+config.h/2}H484V${record.y+record.h/2}H${record.x-5}`, true);
    body.push(text(472, 370, pick(['calibration config', '标定配置']), 'connector-label', 'text-anchor="middle" transform="rotate(-90 472 370)"'));
    const zarr = nodes.get('zarr'), policy = nodes.get('policy');
    path(`M${zarr.x+zarr.w} ${zarr.y+zarr.h/2}H956V${policy.y+policy.h/2}H${policy.x-5}`, true);
    body.push(text(944, 635, pick(['policy data', '策略数据']), 'connector-label', 'text-anchor="middle" transform="rotate(-90 944 635)"'));
    body.push(`<path d="M36 770H1404" stroke="#d1d8ce"/>`);
    body.push(text(36, 800, pick(['Solid: workflow    ·    Dashed: cross-stage configuration / data', '实线：流程    ·    虚线：跨阶段配置 / 数据依赖']), 'footer'));
    body.push(text(1404, 800, pick(['Raw recordings remain unchanged.', '原始采集数据保持不变。']), 'footer', 'text-anchor="end"'));
  } else {
    // Side gutters carry dependencies past stage headers, never across text.
    const config = nodes.get('calibration'), record = nodes.get('record');
    path(`M${config.x} ${config.y+config.h/2}H12V${record.y+record.h/2}H${record.x-5}`, true);
    body.push(text(32, 660, pick(['Calibration config → collection & alignment', '标定配置 → 采集与时间对齐']), 'mobile-link'));
    const zarr = nodes.get('zarr'), policy = nodes.get('policy');
    path(`M${zarr.x} ${zarr.y+zarr.h/2}H12V${policy.y+policy.h/2}H${policy.x-5}`, true);
    body.push(text(32, 1472, pick(['Clean Zarr → Diffusion Policy training', '清洗后 Zarr → 扩散策略训练']), 'mobile-link'));
    body.push(text(28, 2258, pick(['Raw recordings remain unchanged.', '原始采集数据保持不变。']), 'footer'));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
<title id="title">${escape(pick(['Tactile UMI: calibration, dataset curation and policy deployment', 'Tactile UMI：标定、数据整理与策略部署']))}</title>
<desc id="description">${escape(pick(['Three stages connect calibrated acquisition, raw H5, alignment and audit, clean Zarr, simulation-pretrained and real-adapted UniForce, frozen tactile encoding, Diffusion Policy and Franka FR3 execution.', '三阶段连接标定后的采集、原始 H5、对齐与审查、清洗后 Zarr、仿真预训练和真实适配的 UniForce、冻结触觉编码、扩散策略与 Franka FR3 执行。']))}</desc>
<defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="#476b5a"/></marker></defs>
<style>text{font-family:Inter,Arial,"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:#26332d}.stage-title{font-size:26px;font-weight:600}.number{font-size:20px;font-weight:600;fill:#a5543c}.subtitle{font-size:18px;fill:#6b7367}.node-title{font-size:21px;font-weight:600}.body{fill:#677161}.connector-label{font-size:14px;fill:#737c6d}.footer{font-size:16px;fill:#6b7367}.mobile-link{font-size:17px;fill:#476b5a}</style>
<rect width="100%" height="100%" fill="#fff"/>
${connectors.join('\n')}
${body.join('\n')}
</svg>\n`;
}

await mkdir(output, { recursive: true });
for (const locale of ['en', 'zh']) for (const mobile of [false, true]) {
  const name = `workflow${locale === 'zh' ? '-zh' : ''}${mobile ? '-mobile' : ''}.svg`;
  await writeFile(new URL(name, output), diagram(locale, mobile));
  console.log(`Generated ${name}`);
}
