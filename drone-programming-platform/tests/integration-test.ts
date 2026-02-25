/**
 * Integration Test for Drone API
 * 
 * This test should be run while the mock drone is active.
 * We'll use a simple node script to trigger the API routes if the server is running, 
 * OR we can manually verify because the API routes expect the server environment.
 * 
 * Since we can't easily start the Next.js server and run tests against it in one command here, 
 * we will provide this script for the user to run alongside their local dev server.
 */

async function testControl() {
    console.log("Testing /api/drone/control...");
    try {
        const response = await fetch('http://localhost:3000/api/drone/control', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'setpoint',
                roll: 10.5,
                pitch: -5.2,
                yaw: 180,
                thrust: 35000
            })
        });
        const data = await response.json();
        console.log("Response:", data);
        if (data.success) console.log("✅ Control API test PASSED");
        else console.log("❌ Control API test FAILED");
    } catch (e) {
        console.log("❌ Control API test FAILED (Is server running?):", (e as Error).message);
    }
}

async function testTelemetry() {
    console.log("Testing /api/drone/telemetry...");
    try {
        const response = await fetch('http://localhost:3000/api/drone/telemetry');
        const data = await response.json();
        console.log("Response:", data);
        if (data.connected !== undefined) console.log("✅ Telemetry API test PASSED");
        else console.log("❌ Telemetry API test FAILED");
    } catch (e) {
        console.log("❌ Telemetry API test FAILED (Is server running?):", (e as Error).message);
    }
}

async function runTests() {
    console.log("Starting Integration Tests...");
    await testControl();
    await testTelemetry();
    console.log("Tests Complete.");
}

runTests();
