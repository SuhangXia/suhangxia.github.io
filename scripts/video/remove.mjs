import { bucketOptions, cosCall, getCosClient, sanitiseCosError } from './cos-client.mjs';
import { readVideoRecords, updateVideoStatus } from './metadata.mjs';
import { cleanId, parseArgs } from './utils.mjs';

function keysForRecord(record) {
  const keys = [record.objectKey, record.previewKey, record.posterKey].filter(Boolean);
  if (keys.length === 0 || keys.some((key) => !key.startsWith('public/'))) {
    throw new Error('Managed metadata contains an invalid object key; refusing deletion.');
  }
  return [...new Set(keys)];
}

async function main() {
  try {
    const { options, positionals } = parseArgs(process.argv.slice(2));
    if (positionals.length !== 1) throw new Error('Usage: npm run video:remove -- <video-id> --confirm <video-id>.');
    const id = cleanId(positionals[0]);
    const records = await readVideoRecords();
    const record = records.find((entry) => entry.id === id);
    if (!record) throw new Error(`No managed video metadata was found for: ${id}`);
    const keys = keysForRecord(record);

    console.log(`Deletion target for ${id}:`);
    keys.forEach((key) => console.log(`- ${key}`));
    if (options.confirm !== id) {
      throw new Error(`No COS request was made. Re-run with --confirm ${id} to permanently delete only these objects.`);
    }

    const client = await getCosClient();
    for (const key of keys) {
      await cosCall(client, 'deleteObject', { ...bucketOptions(), Key: key });
    }
    await updateVideoStatus(id, 'archived');
    console.log(`PASS  Permanently deleted ${keys.length} known generated object(s); metadata is now archived.`);
  } catch (error) {
    console.error(`FAIL  Remove video: ${sanitiseCosError(error)}`);
    process.exitCode = 1;
  }
}

await main();
