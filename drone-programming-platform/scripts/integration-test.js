const http = require('http');

async function httpRequest(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: opts.method || 'GET', headers: opts.headers || {} }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

async function testControl() {
  console.log('Testing /api/drone/control...');
  try {
    const resp = await httpRequest('http://localhost:3000/api/drone/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'setpoint', roll: 10.5, pitch: -5.2, yaw: 180, thrust: 35000 })
    });
    console.log('Response:', resp.status, resp.body);
    if (resp.status === 200) console.log('✅ Control API test PASSED');
    else console.log('❌ Control API test FAILED');
  } catch (e) {
    console.log('❌ Control API test FAILED (Is server running?):', e.message);
  }
}

async function testTelemetry() {
  console.log('Testing /api/drone/telemetry...');
  try {
    const resp = await httpRequest('http://localhost:3000/api/drone/telemetry');
    console.log('Response:', resp.status, resp.body);
    if (resp.status === 200) console.log('✅ Telemetry API test PASSED');
    else console.log('❌ Telemetry API test FAILED');
  } catch (e) {
    console.log('❌ Telemetry API test FAILED (Is server running?):', e.message);
  }
}

async function run() {
  console.log('Starting Integration Tests...');
  await testControl();
  await testTelemetry();
  console.log('Integration Tests Complete.');
}

run();
