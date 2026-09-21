import { allowedOrigins } from './cos-client.mjs';
import { readVideoRecords } from './metadata.mjs';
import { cleanId, formatBytes, parseArgs } from './utils.mjs';

function hasMethod(header, method) {
  return (header ?? '').split(',').map((item) => item.trim().toUpperCase()).includes(method);
}

async function main() {
  try {
    const { positionals } = parseArgs(process.argv.slice(2));
    if (positionals.length !== 1) throw new Error('Usage: npm run video:verify -- <video-id>.');
    const id = cleanId(positionals[0]);
    const record = (await readVideoRecords()).find((entry) => entry.id === id && entry.status === 'public');
    if (!record) throw new Error(`No public managed video was found for: ${id}`);

    const origin = allowedOrigins[0];
    const headers = { Origin: origin };
    const head = await fetch(record.src, { method: 'HEAD', headers });
    const range = await fetch(record.src, { headers: { ...headers, Range: 'bytes=0-1023' } });
    const preflight = await fetch(record.src, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Range',
      },
    });

    const contentType = head.headers.get('content-type') ?? range.headers.get('content-type');
    const contentLength = Number(head.headers.get('content-length') ?? 0);
    const allowOrigin = range.headers.get('access-control-allow-origin') ?? head.headers.get('access-control-allow-origin');
    const allowMethods = preflight.headers.get('access-control-allow-methods');
    const checks = [
      ['public unauthenticated HEAD', head.ok],
      ['public unauthenticated GET range', range.status === 206],
      ['byte-range support', (range.headers.get('accept-ranges') ?? '').toLowerCase().includes('bytes')],
      ['MP4 content type', (contentType ?? '').toLowerCase().startsWith('video/mp4')],
      ['explicit GitHub Pages CORS origin', allowOrigin === origin],
      ['GET/HEAD CORS methods', hasMethod(allowMethods, 'GET') && hasMethod(allowMethods, 'HEAD')],
      ['no cross-origin PUT CORS permission', !hasMethod(allowMethods, 'PUT')],
    ];

    console.log(`URL: ${record.src}`);
    console.log(`Size: ${contentLength > 0 ? formatBytes(contentLength) : 'not reported'}`);
    for (const [label, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`);
    if (checks.some(([, passed]) => !passed)) process.exitCode = 1;
  } catch (error) {
    console.error(`FAIL  Public playback verification: ${error.message}`);
    process.exitCode = 1;
  }
}

await main();
