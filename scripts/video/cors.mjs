import {
  bucketOptions,
  corsRuleValues,
  corsRuleSupportsVideoPlayback,
  cosCall,
  getCosClient,
  sanitiseCosError,
  videoCorsRule,
} from './cos-client.mjs';

function hasWildcardOrigin(rule) {
  return corsRuleValues(rule, 'AllowedOrigin').includes('*');
}

async function readExistingRules(client, options) {
  try {
    const response = await cosCall(client, 'getBucketCors', options);
    return response?.CORSRules ?? [];
  } catch (error) {
    const code = String(error?.code ?? error?.Code ?? '');
    if (code === 'NoSuchCORSConfiguration' || code === 'NoSuchCORS') return [];
    throw error;
  }
}

async function main() {
  try {
    const client = await getCosClient();
    const options = bucketOptions();
    const existingRules = await readExistingRules(client, options);

    if (existingRules.some(corsRuleSupportsVideoPlayback)) {
      console.log('PASS  Existing CORS configuration already supports the explicit website origins.');
      return;
    }
    if (existingRules.some(hasWildcardOrigin)) {
      throw new Error('Existing CORS uses wildcard origins. Refusing to merge or preserve a broader rule automatically; review it in COS first.');
    }

    await cosCall(client, 'putBucketCors', {
      ...options,
      CORSRules: [...existingRules, videoCorsRule],
    });
    const verifiedRules = await readExistingRules(client, options);
    if (!verifiedRules.some(corsRuleSupportsVideoPlayback)) {
      throw new Error('COS accepted the CORS update but the expected explicit-origin rule was not returned.');
    }
    console.log('PASS  Added a GET/HEAD CORS rule for GitHub Pages and local Astro development.');
  } catch (error) {
    console.error(`FAIL  CORS update: ${sanitiseCosError(error)}`);
    process.exitCode = 1;
  }
}

await main();
