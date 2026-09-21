import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const environmentFile = resolve(root, '.env.local');

export const allowedOrigins = [
  'https://suhangxia.github.io',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
];

let environmentLoaded = false;

function loadEnvironment() {
  if (environmentLoaded) return;
  if (!existsSync(environmentFile)) {
    throw new Error('Missing .env.local. Copy .env.example locally and add the COS CAM credentials.');
  }
  process.loadEnvFile(environmentFile);
  environmentLoaded = true;
}

export function getCosConfig() {
  loadEnvironment();
  const required = [
    'TENCENT_SECRET_ID',
    'TENCENT_SECRET_KEY',
    'TENCENT_COS_BUCKET',
    'TENCENT_COS_REGION',
  ];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(', ')}.`);

  return {
    Bucket: process.env.TENCENT_COS_BUCKET,
    Region: process.env.TENCENT_COS_REGION,
    SecretId: process.env.TENCENT_SECRET_ID,
    SecretKey: process.env.TENCENT_SECRET_KEY,
  };
}

export async function getCosClient() {
  const config = getCosConfig();
  let module;
  try {
    module = await import('cos-nodejs-sdk-v5');
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error('The COS SDK is not installed. Run npm install before using a video:* command that contacts COS.');
    }
    throw error;
  }
  const COS = module.default ?? module;
  return new COS({ SecretId: config.SecretId, SecretKey: config.SecretKey });
}

export function bucketOptions() {
  const { Bucket, Region } = getCosConfig();
  return { Bucket, Region };
}

export function cosCall(client, method, parameters) {
  if (typeof client[method] !== 'function') throw new Error(`COS SDK method is unavailable: ${method}.`);
  return new Promise((resolvePromise, reject) => {
    client[method](parameters, (error, data) => {
      if (error) reject(error);
      else resolvePromise(data);
    });
  });
}

export function publicUrlFor(key) {
  const { Bucket, Region } = getCosConfig();
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `https://${Bucket}.cos.${Region}.myqcloud.com/${encodedKey}`;
}

export function sanitiseCosError(error) {
  let secretId = '';
  let secretKey = '';
  try {
    const config = getCosConfig();
    secretId = config.SecretId;
    secretKey = config.SecretKey;
  } catch {
    // Configuration errors are already safe to report without loading secrets.
  }
  const rawMessage = String(error?.message ?? error?.Message ?? 'Unknown COS request failure.');
  const message = rawMessage
    .replaceAll(secretId, secretId ? '[redacted]' : '')
    .replaceAll(secretKey, secretKey ? '[redacted]' : '')
    .replace(/AKID[A-Za-z0-9_-]+/g, '[redacted]');
  const code = error?.code ?? error?.Code ?? error?.name ?? 'COS_ERROR';
  const status = error?.statusCode ?? error?.status;
  return [code, status ? `HTTP ${status}` : null, message].filter(Boolean).join(' — ');
}

export function corsRuleValues(rule, key) {
  const value = rule?.[key] ?? rule?.[`${key}s`] ?? [];
  return Array.isArray(value) ? value : [value];
}

export function corsRuleSupportsVideoPlayback(rule) {
  const origins = new Set(corsRuleValues(rule, 'AllowedOrigin'));
  const methods = new Set(corsRuleValues(rule, 'AllowedMethod').map((method) => String(method).toUpperCase()));
  return allowedOrigins.every((origin) => origins.has(origin)) && methods.has('GET') && methods.has('HEAD');
}

export const videoCorsRule = {
  AllowedOrigin: allowedOrigins,
  AllowedMethod: ['GET', 'HEAD'],
  AllowedHeader: ['Accept', 'Content-Type', 'Origin', 'Range'],
  ExposeHeader: ['Accept-Ranges', 'Content-Length', 'Content-Range', 'Content-Type', 'ETag', 'Last-Modified'],
  MaxAgeSeconds: 3600,
};
