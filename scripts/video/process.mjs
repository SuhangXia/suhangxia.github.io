import { basename, extname, join } from 'node:path';
import {
  cleanId,
  ensureVideoWorkDir,
  formatBytes,
  inspectVideo,
  parseArgs,
  requireMp4,
  requireVideoSource,
  run,
  titleFromId,
} from './utils.mjs';

function idFromPath(filePath) {
  return basename(filePath, extname(filePath))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function previewWindow(duration, requestedStart) {
  const start = Number(requestedStart ?? 0);
  if (!Number.isFinite(start) || start < 0) throw new Error('--preview-start must be a non-negative number of seconds.');
  if (!duration || duration <= 0) return { duration: 10, start };
  if (start >= duration) throw new Error('--preview-start must be earlier than the source video duration.');
  return {
    duration: Math.min(10, Math.max(1, Math.floor(duration - start))),
    start,
  };
}

async function main() {
  try {
    const { options, positionals } = parseArgs(process.argv.slice(2), ['preview']);
    const input = positionals[0];
    if (!input || positionals.length > 1) {
      throw new Error('Usage: npm run video:process -- <source.mp4> [--id video-id] [--preview] [--preview-start seconds].');
    }

    const source = await requireVideoSource(input, 'Source video');
    const id = cleanId(options.id ?? idFromPath(source.absolutePath));
    const inspection = await inspectVideo(source.absolutePath);
    const workDir = await ensureVideoWorkDir();
    const output = join(workDir, `${id}.web.mp4`);
    const poster = join(workDir, `${id}.poster.webp`);
    const preview = options.preview ? previewWindow(inspection.duration, options['preview-start']) : null;
    const posterTimestamp = Math.min(
      Math.max((preview?.start ?? 0) + 1, 0),
      Math.max((inspection.duration ?? 1) - 0.05, 0),
    );
    const videoFilter = `scale=w=min(1920\\,iw):h=min(1080\\,ih):force_original_aspect_ratio=decrease${(inspection.frameRate ?? 0) > 30 ? ',fps=30' : ''}`;

    await run('ffmpeg', [
      '-y',
      '-hide_banner',
      '-loglevel', 'error',
      '-i', source.absolutePath,
      '-map', '0:v:0',
      '-map', '0:a?',
      '-vf', videoFilter,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '25',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '96k',
      '-movflags', '+faststart',
      output,
    ]);

    await run('ffmpeg', [
      '-y',
      '-hide_banner',
      '-loglevel', 'error',
      '-ss', String(posterTimestamp),
      '-i', source.absolutePath,
      '-frames:v', '1',
      '-vf', videoFilter,
      '-c:v', 'libwebp',
      '-q:v', '78',
      poster,
    ]);

    let previewPath;
    if (preview) {
      previewPath = join(workDir, `${id}.preview.mp4`);
      await run('ffmpeg', [
        '-y',
        '-hide_banner',
        '-loglevel', 'error',
        '-ss', String(preview.start),
        '-i', source.absolutePath,
        '-t', String(preview.duration),
        '-map', '0:v:0',
        '-an',
        '-vf', videoFilter,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '28',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        previewPath,
      ]);
    }

    const processed = await requireMp4(output, 'Processed video');
    console.log(`PASS  Processed ${titleFromId(id)} without modifying the source file.`);
    console.log(`Input:  ${formatBytes(source.size)} · ${inspection.width ?? '?'}×${inspection.height ?? '?'} · ${inspection.duration?.toFixed(2) ?? '?'} s`);
    console.log(`Video:  ${processed.absolutePath} · ${formatBytes(processed.size)}`);
    console.log(`Poster: ${poster}`);
    if (previewPath) console.log(`Preview: ${previewPath} · ${preview.start.toFixed(2)}–${(preview.start + preview.duration).toFixed(2)} s`);
  } catch (error) {
    console.error(`FAIL  Video processing: ${error.message}`);
    process.exitCode = 1;
  }
}

await main();
