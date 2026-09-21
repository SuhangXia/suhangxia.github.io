import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { repositoryRoot } from './utils.mjs';

const metadataFile = resolve(repositoryRoot, 'src/data/videos.ts');
const blockPattern = /(\/\* COS_VIDEO_RECORDS_START \*\/\n)const cosVideoRecords: readonly VideoRecord\[\] = (\[[\s\S]*?\]);(\n\/\* COS_VIDEO_RECORDS_END \*\/)/;

export async function readVideoRecords() {
  const source = await readFile(metadataFile, 'utf8');
  const match = source.match(blockPattern);
  if (!match) throw new Error('Video metadata markers are missing from src/data/videos.ts.');
  return JSON.parse(match[2]);
}

export async function writeVideoRecords(records) {
  const source = await readFile(metadataFile, 'utf8');
  if (!blockPattern.test(source)) throw new Error('Video metadata markers are missing from src/data/videos.ts.');
  const serialized = JSON.stringify(records, null, 2);
  const next = source.replace(blockPattern, `$1const cosVideoRecords: readonly VideoRecord[] = ${serialized};$3`);
  await writeFile(metadataFile, next);
}

export async function upsertVideoRecord(record) {
  const records = await readVideoRecords();
  const nextRecords = [...records.filter((entry) => entry.id !== record.id), record];
  await writeVideoRecords(nextRecords);
}

export async function updateVideoStatus(id, status) {
  const records = await readVideoRecords();
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) throw new Error(`No managed video metadata was found for: ${id}`);
  const nextRecords = records.map((record, recordIndex) => (recordIndex === index ? { ...record, status } : record));
  await writeVideoRecords(nextRecords);
  return nextRecords[index];
}
