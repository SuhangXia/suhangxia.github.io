import { readVideoRecords } from './metadata.mjs';
import { parseArgs, run } from './utils.mjs';

const sourceDirectory = '/home/suhang/datasets2/video';

const preparedDemos = [
  {
    source: `${sourceDirectory}/clouthumi_datacollectvideo.MOV`,
    id: 'clothumi-data-collection',
    project: 'clothumi',
    title: 'ClothUMI portable data collection',
    description: 'Portable UMI collection with the hand-held gripper, wrist camera, tactile sensing, and the task workspace in view.',
    featured: true,
    previewStart: '0',
  },
  {
    source: `${sourceDirectory}/clouthumi_inferencedemo.mp4`,
    id: 'clothumi-uniforce-dp-inference',
    project: 'clothumi',
    title: 'ClothUMI UniForce + Diffusion Policy inference',
    description: 'Franka FR3 rollouts for the UniForce-conditioned Diffusion Policy comparison, with vision-only and π0.5 reference conditions retained in the recording.',
    featured: false,
    previewStart: '0',
  },
  {
    source: `${sourceDirectory}/frabric_omni_demo.mp4`,
    id: 'fabric-omni-demo',
    project: 'touch-until-certain',
    title: 'VTLA for Cloth Sorting — qualitative robot integration',
    description: 'A qualitative record of force-aligned fabric sensing and the guarded scripted robot workflow; it is not a robot success-rate or learned-policy evaluation.',
    featured: false,
    previewStart: '0',
  },
  {
    source: `${sourceDirectory}/RoboCup_demo.mp4`,
    id: 'robocup-ur5e-object-sorting',
    project: 'robocup-ur5e',
    title: 'RoboCup UR5e autonomous object sorting',
    description: 'A ROS-based UR5e YCB object-sorting workflow joining perception, grasp estimation, planning, and execution in the RoboCup environment.',
    featured: true,
    previewStart: '200',
    previewVariant: 'midpoint',
  },
];

function formatCommand(command, argumentsList) {
  return [command, ...argumentsList].map((part) => JSON.stringify(part)).join(' ');
}

function expectedObjectKeys(demo) {
  const derivedMediaId = demo.previewVariant ? `${demo.id}-${demo.previewVariant}` : demo.id;
  return {
    objectKey: `public/videos/demos/${demo.id}.mp4`,
    previewKey: `public/videos/previews/${derivedMediaId}.mp4`,
    posterKey: `public/posters/${derivedMediaId}.webp`,
  };
}

function isPublishedDemo(record, demo) {
  if (!record || record.status !== 'public') return false;
  const expected = expectedObjectKeys(demo);
  return Object.entries(expected).every(([key, value]) => record[key] === value);
}

function hasPublishedFullDemo(record, demo) {
  return Boolean(
    record
      && record.status === 'public'
      && record.objectKey === `public/videos/demos/${demo.id}.mp4`,
  );
}

function previewUpdateCommands(demo) {
  return [
    ['node', [
      'scripts/video/update-preview.mjs',
      demo.source,
      '--id', demo.id,
      '--preview-start', demo.previewStart,
      '--variant', demo.previewVariant,
      '--confirm',
    ]],
    ['node', ['scripts/video/verify.mjs', demo.id]],
  ];
}

function commandsForDemo(demo) {
  const processCommand = [
    'scripts/video/process.mjs',
    demo.source,
    '--id',
    demo.id,
    '--preview',
    '--preview-start',
    demo.previewStart,
  ];
  const uploadCommand = [
    'scripts/video/upload.mjs',
    `.video-work/${demo.id}.web.mp4`,
    '--id',
    demo.id,
    '--project',
    demo.project,
    '--title',
    demo.title,
    '--description',
    demo.description,
    '--preview',
    `.video-work/${demo.id}.preview.mp4`,
    ...(demo.previewVariant ? ['--preview-key-suffix', demo.previewVariant] : []),
    ...(demo.featured ? ['--featured'] : []),
  ];
  return [
    ['node', processCommand],
    ['node', uploadCommand],
    ['node', ['scripts/video/verify.mjs', demo.id]],
  ];
}

async function main() {
  const { options, positionals } = parseArgs(process.argv.slice(2), ['confirm']);
  if (positionals.length > 0) throw new Error('video:publish:prepared accepts --confirm only.');

  const records = await readVideoRecords();
  const releaseSteps = preparedDemos.map((demo) => {
    const record = records.find((entry) => entry.id === demo.id);
    if (isPublishedDemo(record, demo)) {
      return {
        demo,
        alreadyPublished: true,
        commands: [['node', ['scripts/video/verify.mjs', demo.id]]],
      };
    }
    if (demo.previewVariant && hasPublishedFullDemo(record, demo)) {
      return {
        demo,
        derivedUpdateOnly: true,
        commands: previewUpdateCommands(demo),
      };
    }
    return { demo, alreadyPublished: false, commands: commandsForDemo(demo) };
  });

  if (!options.confirm) {
    console.log('Dry run: no files were processed and no COS request was made.');
    releaseSteps.forEach(({ demo, alreadyPublished, derivedUpdateOnly, commands }) => {
      if (alreadyPublished) console.log(`SKIP  ${demo.id} is already public with its managed media keys; verify only.`);
      if (derivedUpdateOnly) console.log(`DERIVE  ${demo.id} keeps its public full demo and updates only the reviewed preview/poster variant.`);
      commands.forEach(([command, argumentsList]) => console.log(formatCommand(command, argumentsList)));
    });
    console.log('Re-run with --confirm to safely resume: published media is verified, and unpublished media is processed, uploaded, verified, then built.');
    return;
  }

  for (const { demo, alreadyPublished, derivedUpdateOnly, commands } of releaseSteps) {
    if (alreadyPublished) console.log(`\nSKIP  ${demo.id} is already published; verifying public delivery without overwriting it.`);
    if (derivedUpdateOnly) console.log(`\nDERIVE  ${demo.id} already has a public full demo; publishing only its reviewed preview/poster variant.`);
    for (const [command, argumentsList] of commands) {
      console.log(`\n→ ${formatCommand(command, argumentsList)}`);
      await run(command, argumentsList);
    }
  }
  console.log(`\n→ ${formatCommand('npm', ['run', 'build'])}`);
  await run('npm', ['run', 'build']);
  console.log('\nPASS  Published, verified, and built the prepared research demos.');
}

try {
  await main();
} catch (error) {
  console.error(`FAIL  Prepared demo publish: ${error.message}`);
  process.exitCode = 1;
}
