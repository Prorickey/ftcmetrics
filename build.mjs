import { spawn } from 'child_process';
import packageJson from './package.json' with { type: 'json' };

const version = packageJson.version;
const dockerImage = packageJson.dockerImage;
const shouldPush = process.argv.includes('--push');

console.log('Building Docker image...');
const dockerBuildChild = spawn('docker', [
  'build',
  '-t',
  `${dockerImage}:${version}`,
  '.',
]);

dockerBuildChild.stdout.pipe(process.stdout);
dockerBuildChild.stderr.pipe(process.stderr);

dockerBuildChild.on('exit', (code) => {
  if (code !== 0) {
    console.error('Docker build failed!');
    process.exit(code);
  }

  console.log('Docker image built successfully!');

  if (!shouldPush) {
    console.log('Skipping push (use --push flag to push to registry)');
    process.exit(0);
  }

  console.log('Pushing Docker image...');

  const dockerPushChild = spawn('docker', [
    'push',
    `${dockerImage}:${version}`,
  ]);

  dockerPushChild.stdout.pipe(process.stdout);
  dockerPushChild.stderr.pipe(process.stderr);

  dockerPushChild.on('exit', (code) => {
    if (code === 0) {
      console.log('Docker image pushed successfully!');
    } else {
      console.error('Docker push failed!');
      process.exit(code);
    }
  });
});