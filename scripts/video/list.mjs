import { bucketOptions, cosCall, getCosClient, sanitiseCosError } from './cos-client.mjs';
import { formatBytes, parseArgs } from './utils.mjs';

function boundedLimit(value) {
  if (value === undefined) return 100;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    throw new Error('--limit must be an integer between 1 and 100.');
  }
  return parsed;
}

async function main() {
  try {
    const { options, positionals } = parseArgs(process.argv.slice(2));
    if (positionals.length > 0) throw new Error('video:list accepts options only.');
    const client = await getCosClient();
    const result = await cosCall(client, 'getBucket', {
      ...bucketOptions(),
      Prefix: 'public/',
      MaxKeys: boundedLimit(options.limit),
    });
    const objects = result.Contents ?? [];
    if (objects.length === 0) {
      console.log('No website media objects found under public/.');
      return;
    }

    for (const object of objects) {
      console.log(`${object.Key}\t${formatBytes(Number(object.Size ?? 0))}\t${object.LastModified ?? 'unknown date'}`);
    }
    if (result.IsTruncated === 'true' || result.IsTruncated === true) console.log('Output truncated; rerun with --limit up to 100.');
  } catch (error) {
    console.error(`FAIL  COS list: ${sanitiseCosError(error)}`);
    process.exitCode = 1;
  }
}

await main();
