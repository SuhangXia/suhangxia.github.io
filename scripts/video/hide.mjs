import { updateVideoStatus } from './metadata.mjs';
import { cleanId, parseArgs } from './utils.mjs';

try {
  const { positionals } = parseArgs(process.argv.slice(2));
  if (positionals.length !== 1) throw new Error('Usage: npm run video:hide -- <video-id>.');
  const record = await updateVideoStatus(cleanId(positionals[0]), 'hidden');
  console.log(`PASS  ${record.id} is hidden from production pages. COS objects were not changed.`);
} catch (error) {
  console.error(`FAIL  Hide video: ${error.message}`);
  process.exitCode = 1;
}
