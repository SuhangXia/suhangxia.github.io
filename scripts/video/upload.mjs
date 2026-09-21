import { createReadStream } from 'node:fs';
import { existsSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import {
  bucketOptions,
  cosCall,
  getCosClient,
  publicUrlFor,
  sanitiseCosError,
} from './cos-client.mjs';
import { readVideoRecords, upsertVideoRecord } from './metadata.mjs';
import {
  assertGeneratedFile,
  cleanId,
  formatBytes,
  inspectVideo,
  parseArgs,
  requireMp4,
  roundDuration,
  titleFromId,
  videoWorkDir,
} from './utils.mjs';

function idFromPath(filePath) {
  return basename(filePath, extname(filePath))
    .replace(/\.web$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function videoKey(id, kind) {
  if (!['hero', 'previews', 'demos'].includes(kind)) {
    throw new Error('--kind must be one of: hero, previews, demos.');
  }
  return `public/videos/${kind}/${id}.mp4`;
}

async function keyCanBeWritten(client, key, managedKeys, replace) {
  try {
    await cosCall(client, 'headObject', { ...bucketOptions(), Key: key });
  } catch (error) {
    const code = String(error?.code ?? error?.Code ?? '');
    const status = Number(error?.statusCode ?? error?.status ?? 0);
    if (code === 'NoSuchKey' || code === 'NoSuchObject' || status === 404) return;
    throw error;
  }

  if (!managedKeys.has(key)) {
    throw new Error(`Refusing to overwrite an object not recorded by these scripts: ${key}`);
  }
  if (!replace) {
    throw new Error(`Object already exists: ${key}. Add --replace only after verifying it is the intended managed media.`);
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

async function main() {
  try {
    const { options, positionals } = parseArgs(process.argv.slice(2), ['replace', 'featured']);
    const input = positionals[0];
    if (!input || positionals.length > 1) {
      throw new Error('Usage: npm run video:upload -- <processed.mp4> --id video-id [--project slug] [--poster file.webp] [--preview file.mp4] [--preview-key-suffix suffix] [--featured].');
    }

    const inputPath = assertGeneratedFile(input);
    const video = await requireMp4(inputPath, 'Processed video');
    const id = cleanId(options.id ?? idFromPath(video.absolutePath));
    const kind = options.kind ?? 'demos';
    const key = videoKey(id, kind);
    const posterCandidate = options.poster ?? join(videoWorkDir, `${id}.poster.webp`);
    const posterPath = existsSync(posterCandidate) ? assertGeneratedFile(posterCandidate) : null;
    const previewPath = options.preview ? assertGeneratedFile(options.preview) : null;

    if (posterPath && extname(posterPath).toLowerCase() !== '.webp') {
      throw new Error('Poster must be a .webp file generated in .video-work/.');
    }
    if (previewPath) await requireMp4(previewPath, 'Preview video');

    const inspection = await inspectVideo(video.absolutePath);
    const records = await readVideoRecords();
    const existing = records.find((record) => record.id === id);
    const previewKeySuffix = options['preview-key-suffix'] ? cleanId(options['preview-key-suffix']) : null;
    const derivedMediaId = previewKeySuffix ? `${id}-${previewKeySuffix}` : id;
    const managedKeys = new Set(
      records.flatMap((record) => [record.objectKey, record.previewKey, record.posterKey]).filter(Boolean),
    );
    const posterKey = posterPath ? `public/posters/${derivedMediaId}.webp` : undefined;
    const previewKey = previewPath ? `public/videos/previews/${derivedMediaId}.mp4` : undefined;
    const client = await getCosClient();

    await keyCanBeWritten(client, key, managedKeys, options.replace);
    if (posterKey) await keyCanBeWritten(client, posterKey, managedKeys, options.replace);
    if (previewKey) await keyCanBeWritten(client, previewKey, managedKeys, options.replace);

    await uploadPublicObject(client, key, video.absolutePath, 'video/mp4');
    if (posterKey && posterPath) await uploadPublicObject(client, posterKey, posterPath, 'image/webp');
    if (previewKey && previewPath) await uploadPublicObject(client, previewKey, previewPath, 'video/mp4');

    const record = {
      id,
      title: options.title ?? existing?.title ?? titleFromId(id),
      ...(options.project ? { project: options.project } : existing?.project ? { project: existing.project } : {}),
      ...(options.description ? { description: options.description } : existing?.description ? { description: existing.description } : {}),
      src: publicUrlFor(key),
      ...(previewKey ? { previewSrc: publicUrlFor(previewKey) } : {}),
      ...(posterKey ? { poster: publicUrlFor(posterKey) } : {}),
      ...(roundDuration(inspection.duration) ? { duration: roundDuration(inspection.duration) } : {}),
      ...(options.featured || existing?.featured ? { featured: true } : {}),
      status: 'public',
      objectKey: key,
      ...(previewKey ? { previewKey } : {}),
      ...(posterKey ? { posterKey } : {}),
    };
    await upsertVideoRecord(record);

    console.log(`PASS  Uploaded one processed public-read video object (${formatBytes(video.size)}).`);
    console.log(`Key: ${key}`);
    console.log(`URL: ${record.src}`);
    if (record.poster) console.log(`Poster: ${record.poster}`);
    if (record.previewSrc) console.log(`Preview: ${record.previewSrc}`);
    console.log('Metadata: src/data/videos.ts');
  } catch (error) {
    console.error(`FAIL  Video upload: ${sanitiseCosError(error)}`);
    process.exitCode = 1;
  }
}

await main();
