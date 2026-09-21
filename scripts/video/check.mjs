import {
  bucketOptions,
  corsRuleSupportsVideoPlayback,
  cosCall,
  getCosClient,
  getCosConfig,
  sanitiseCosError,
} from './cos-client.mjs';

async function main() {
  try {
    const client = await getCosClient();
    const options = bucketOptions();
    const head = await cosCall(client, 'headBucket', options);
    const bucketRegion = head?.headers?.['x-cos-bucket-region'] ?? head?.headers?.['X-Cos-Bucket-Region'];
    const listing = await cosCall(client, 'getBucket', { ...options, Prefix: 'public/', MaxKeys: 5 });

    console.log('PASS  COS authentication and bucket connectivity');
    console.log(`Bucket: ${options.Bucket}`);
    console.log(`Region: ${bucketRegion ?? options.Region}${bucketRegion && bucketRegion !== options.Region ? ` (configured: ${options.Region})` : ''}`);
    console.log(`Public-prefix sample: ${(listing.Contents ?? []).length} object(s), limited to five.`);

    try {
      const cors = await cosCall(client, 'getBucketCors', options);
      const rules = cors?.CORSRules ?? [];
      console.log(`${rules.some(corsRuleSupportsVideoPlayback) ? 'PASS' : 'FAIL'}  CORS explicit-origin playback rule`);
      if (!rules.some(corsRuleSupportsVideoPlayback)) process.exitCode = 1;
    } catch (error) {
      console.log(`FAIL  CORS could not be read: ${sanitiseCosError(error)}`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`FAIL  COS connectivity: ${sanitiseCosError(error)}`);
    process.exitCode = 1;
  }
}

await main();
