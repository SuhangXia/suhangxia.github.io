import { spawn } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const videoWorkDir = resolve(repositoryRoot, '.video-work');

export function parseArgs(argv, booleanOptions = []) {
  const booleanSet = new Set(booleanOptions);
  const options = {};
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) {
      positionals.push(argument);
      continue;
    }

    const [rawKey, inlineValue] = argument.slice(2).split('=', 2);
    if (!rawKey) throw new Error('An option name is required after --.');

    if (booleanSet.has(rawKey)) {
      options[rawKey] = inlineValue === undefined ? true : inlineValue !== 'false';
      continue;
    }

    const value = inlineValue ?? argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`--${rawKey} requires a value.`);
    if (inlineValue === undefined) index += 1;
    options[rawKey] = value;
  }

  return { options, positionals };
}

export function cleanId(value) {
  const id = String(value ?? '').trim().toLowerCase();
  if (!/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/.test(id)) {
    throw new Error('Video ID must use lowercase letters, numbers, and single hyphens only.');
  }
  return id;
}

export function titleFromId(id) {
  return id
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function ensureVideoWorkDir() {
  await mkdir(videoWorkDir, { recursive: true });
  return videoWorkDir;
}

export async function requireFile(filePath, label = 'File') {
  const absolutePath = resolve(filePath);
  const file = await stat(absolutePath).catch(() => null);
  if (!file?.isFile()) throw new Error(`${label} does not exist or is not a regular file: ${filePath}`);
  return { absolutePath, size: file.size };
}

export async function requireMp4(filePath, label = 'Video') {
  const file = await requireFile(filePath, label);
  if (extname(file.absolutePath).toLowerCase() !== '.mp4') {
    throw new Error(`${label} must be an .mp4 file.`);
  }
  return file;
}

export async function requireVideoSource(filePath, label = 'Source video') {
  const file = await requireFile(filePath, label);
  if (!['.mp4', '.mov', '.m4v', '.webm'].includes(extname(file.absolutePath).toLowerCase())) {
    throw new Error(`${label} must be an MP4, MOV, M4V, or WebM file.`);
  }
  return file;
}

export function assertGeneratedFile(filePath) {
  const absolutePath = resolve(filePath);
  const expectedPrefix = `${videoWorkDir}/`;
  if (!absolutePath.startsWith(expectedPrefix)) {
    throw new Error(`Refusing to upload a source video. Process a copy into ${videoWorkDir} first.`);
  }
  return absolutePath;
}

export function run(command, argumentsList, { capture = false } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, argumentsList, {
      cwd: repositoryRoot,
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      shell: false,
    });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk;
    });
    child.once('error', (error) => reject(error));
    child.once('close', (code) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr });
        return;
      }
      reject(new Error(`${command} exited with code ${code ?? 'unknown'}. ${stderr.trim()}`.trim()));
    });
  });
}

export async function inspectVideo(filePath) {
  const { stdout } = await run(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration:stream=codec_name,codec_type,width,height,r_frame_rate',
      '-of',
      'json',
      filePath,
    ],
    { capture: true },
  );
  const inspection = JSON.parse(stdout);
  const video = inspection.streams?.find((stream) => stream.codec_type === 'video');
  if (!video) throw new Error('No video stream was found in this MP4.');
  const audio = inspection.streams?.find((stream) => stream.codec_type === 'audio');
  const duration = Number(inspection.format?.duration ?? 0);
  const [frameRateNumerator = '0', frameRateDenominator = '1'] = String(video.r_frame_rate ?? '0/1').split('/');
  const numerator = Number(frameRateNumerator);
  const denominator = Number(frameRateDenominator);
  return {
    audioCodec: audio?.codec_name ?? null,
    duration: Number.isFinite(duration) ? duration : null,
    frameRate: denominator > 0 ? numerator / denominator : null,
    height: video.height ?? null,
    videoCodec: video.codec_name ?? null,
    width: video.width ?? null,
  };
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex += 1;
  } while (value >= 1024 && unitIndex < units.length - 1);
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

export function roundDuration(duration) {
  return typeof duration === 'number' ? Math.round(duration * 100) / 100 : undefined;
}
