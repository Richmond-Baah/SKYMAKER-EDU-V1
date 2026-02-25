const { spawn } = require('child_process');
const path = require('path');

function startMock() {
  return spawn(process.execPath, [path.join(__dirname, 'mock-drone.js')], { stdio: ['ignore', 'inherit', 'inherit'] });
}

function runIntegration() {
  return new Promise((resolve, reject) => {
    const t = spawn(process.execPath, [path.join(__dirname, 'integration-test.js')], { stdio: ['ignore', 'pipe', 'pipe'] });
    t.stdout.on('data', (c) => process.stdout.write(c));
    t.stderr.on('data', (c) => process.stderr.write(c));
    t.on('close', (code) => resolve(code));
    t.on('error', reject);
  });
}

(async () => {
  console.log('Starting mock drone...');
  const mock = startMock();

  // Give it a moment to start
  await new Promise((r) => setTimeout(r, 500));

  console.log('Running integration tests...');
  const code = await runIntegration();

  console.log('Integration test exit code:', code);
  console.log('Stopping mock drone...');
  try { mock.kill(); } catch (e) {}
  process.exit(code === 0 ? 0 : 1);
})();
