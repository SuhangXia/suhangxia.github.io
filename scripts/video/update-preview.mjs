import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import {
  allowedOrigins,
  bucketOptions,
  cosCall,
  getCosClient,
  publicUrlFor,
  sanitiseCosError,
} from './cos-client.mjs';
import { readVideoRecords, upsertVideoRecord } from './metadata.mjs';
import {
  cleanId,
  ensureVideoWorkDir,
  inspectVideo,
  parseArgs,
  requireFile,
  requireMp4,
  requireVideoSource,
  run,
} from './utils.mjs';

function previewWindow(duration, requestedStart) {
  const start = Number(requestedStart ?? 0);
  if (!Number.isFinite(start) || start < 0) throw new Error('--preview-start must be a non-negative number of seconds.');
  if (!duration || duration <= 0) return { duration: 10, start };
  if (start >= duration) throw new Error('--preview-start must be earlier than the source video duration.');
  return { duration: Math.min(10, Math.max(1, Math.floor(duration - start))), start };
}

async function objectExists(client, key) {
  try {
    await cosCall(client, 'headObject', { ...bucketOptions(), Key: key });
    return true;
  } catch (error) {
    const code = String(error?.code ?? error?.Code ?? '');
    const status = Number(error?.statusCode ?? error?.status ?? 0);
    if (code === 'NoSuchKey' || code === 'NoSuchObject' || status === 404) return false;
    throw error;
  }
}

async function uploadPublicObject(client, key, filePath, contentType) {
  await cosCall(client, 'putObject', {
    ...bucketOptions(),
    Key: key,
    Body: createReadStream(filePath),
    ACL: 'public-read',
    ContentType: contentType,
    CacheControl: 'public, max-age=604800',
  });
}

function hasMethod(header, method) {
  return (header ?? '').split(',').map((item) => item.trim().toUpperCase()).includes(method);
}

async function verifyPublicPreview(previewUrl, posterUrl) {
  const origin = allowedOrigins[0];
  const headers = { Origin: origin };
  const [head, range, posterHead, preflight] = await Promise.all([
    fetch(previewUrl, { method: 'HEAD', headers }),
    fetch(previewUrl, { headers: { ...headers, Range: 'bytes=0-1023' } }),
    fetch(posterUrl, { method: 'HEAD', headers }),
    fetch(previewUrl, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Range',
      },
    }),
  ]);
  const allowOrigin = range.headers.get('access-control-allow-origin') ?? head.headers.get('access-control-allow-origin');
  const allowMethods = preflight.headers.get('access-control-allow-methods');
  const checks = [
    ['preview public HEAD', head.ok],
    ['preview byte range', range.status === 206],
    ['preview MP4 content type', (head.headers.get('content-type') ?? '').toLowerCase().startsWith('video/mp4')],
    ['poster public WebP', posterHead.ok && (posterHead.headers.get('content-type') ?? '').toLowerCase().startsWith('image/webp')],
    ['explicit playback CORS origin', allowOrigin === origin],
    ['GET/HEAD CORS methods', hasMethod(allowMethods, 'GET') && hasMethod(allowMethods, 'HEAD')],
    ['no cross-origin PUT', !hasMethod(allowMethods, 'PUT')],
  ];
  checks.forEach(([label, passed]) => console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`));
  if (checks.some(([, passed]) => !passed)) throw new Error('One or more public preview delivery checks failed.');
}

async function main() {
  try {
    const { options, positionals } = parseArgs(process.argv.slice(2), ['confirm']);
    const input = positionals[0];
    if (!input || positionals.length > 1 || !options.id) {
      throw new Error('Usage: npm run video:preview:update -- <source.mp4> --id managed-video-id --preview-start seconds [--variant name] [--confirm].');
    }

    const id = cleanId(options.id);
    const variant = cleanId(options.variant ?? 'midpoint');
    const derivedMediaId = `${id}-${variant}`;
    const previewKey = `public/videos/previews/${derivedMediaId}.mp4`;
    const posterKey = `public/posters/${derivedMediaId}.webp`;
    const records = await readVideoRecords();
    const record = records.find((entry) => entry.id === id && entry.status === 'public');
    if (!record) throw new Error(`No public managed video was found for: ${id}`);
    if (!record.objectKey?.startsWith('public/videos/')) throw new Error('The full video is not a recognised managed COS object.');

    if (!options.confirm) {
      console.log('Dry run: no media was processed and no COS request was made.');
      console.log(`Video: ${id}`);
      console.log(`Window: ${options['preview-start'] ?? 0}s for up to 10s`);
      console.log(`Preview key: ${previewKey}`);
      console.log(`Poster key: ${posterKey}`);
      console.log('Re-run with --confirm to generate and publish only these derived objects.');
      return;
    }

    const source = await requireVideoSource(input, 'Source video');
    const sourceInspection = await inspectVideo(source.absolutePath);
    const preview = previewWindow(sourceInspection.duration, options['preview-start']);
    const workDir = await ensureVideoWorkDir();
    const previewPath = join(workDir, `${derivedMediaId}.preview.mp4`);
    const posterPath = join(workDir, `${derivedMediaId}.poster.webp`);
    const posterTimestamp = Math.min(preview.start + 1, Math.max((sourceInspection.duration ?? preview.start + 1.05) - 0.05, 0));
    const videoFilter = `scale=w=min(1920\\,iw):h=min(1080\\,ih):force_original_aspect_ratio=decrease${(sourceInspection.frameRate ?? 0) > 30 ? ',fps=30' : ''}`;

    await run('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error', '-ss', String(preview.start), '-i', source.absolutePath,
      '-t', String(preview.duration), '-map', '0:v:0', '-an', '-vf', videoFilter,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', previewPath,
    ]);
    await run('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error', '-ss', String(posterTimestamp), '-i', source.absolutePath,
      '-frames:v', '1', '-vf', videoFilter, '-c:v', 'libwebp', '-q:v', '78', posterPath,
    ]);

    const generatedPreview = await requireMp4(previewPath, 'Generated preview');
    await requireFile(posterPath, 'Generated poster');
    const inspection = await inspectVideo(generatedPreview.absolutePath);
    const outputChecks = [
      ['H.264 preview', inspection.videoCodec === 'h264'],
      ['muted preview', inspection.audioCodec === null],
      ['maximum 1920×1080', (inspection.width ?? Infinity) <= 1920 && (inspection.height ?? Infinity) <= 1080],
      ['maximum 30 fps', (inspection.frameRate ?? Infinity) <= 30],
      ['expected preview duration', Math.abs((inspection.duration ?? 0) - preview.duration) < 0.2],
    ];
    outputChecks.forEach(([label, passed]) => console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`));
    if (outputChecks.some(([, passed]) => !passed)) throw new Error('Generated preview failed local media inspection.');

    const client = await getCosClient();
    const [previewExists, posterExists] = await Promise.all([
      objectExists(client, previewKey),
      objectExists(client, posterKey),
    ]);
    const recordAlreadyUsesVariant = record.previewKey === previewKey && record.posterKey === posterKey;
    if ((previewExists || posterExists) && !recordAlreadyUsesVariant) {
      throw new Error('A derived object already exists but is not owned by this managed video record; refusing to overwrite it.');
    }

    if (!previewExists) await uploadPublicObject(client, previewKey, previewPath, 'video/mp4');
    if (!posterExists) await uploadPublicObject(client, posterKey, posterPath, 'image/webp');

    const previewSrc = publicUrlFor(previewKey);
    const poster = publicUrlFor(posterKey);
    await upsertVideoRecord({ ...record, previewSrc, poster, previewKey, posterKey });
    await verifyPublicPreview(previewSrc, poster);
    console.log(`PASS  Published ${preview.start.toFixed(2)}–${(preview.start + preview.duration).toFixed(2)} s without replacing the full demo.`);
    console.log(`Preview: ${previewSrc}`);
    console.log(`Poster: ${poster}`);
  } catch (error) {
    console.error(`FAIL  Preview update: ${sanitiseCosError(error)}`);
    process.exitCode = 1;
  }
}

await main();
