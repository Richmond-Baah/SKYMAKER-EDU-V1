import dgram from 'dgram';

const DRONE_PORT = 2390;
const TELEMETRY_PORT = 2391;
const TELEMETRY_INTERVAL = 100; // 10Hz

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.error(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(`Drone received packet: ${msg.toString('hex')} from ${rinfo.address}:${rinfo.port}`);

    const header = msg[0];
    const port = (header >> 4) & 0x0F;
    const channel = header & 0x03;

    if (port === 0x03) { // SETPOINT
        console.log('  Type: SETPOINT');
        if (msg.length >= 15) {
            const roll = msg.readFloatLE(1);
            const pitch = msg.readFloatLE(5);
            const yaw = msg.readFloatLE(9);
            const thrust = msg.readUInt16LE(13);
            console.log(`  Data: Roll=${roll}, Pitch=${pitch}, Yaw=${yaw}, Thrust=${thrust}`);
        }
    } else if (port === 0x05) { // LOG/TELEMETRY Request
        console.log('  Type: LOG REQUEST');
    }
});

server.on('listening', () => {
    const address = server.address();
    console.log(`Mock Drone listening on ${address.address}:${address.port}`);
});

server.bind(DRONE_PORT);

// Simulate Telemetry data sending
const telemetryClient = dgram.createSocket('udp4');
setInterval(() => {
    // Header for LOG PORT (0x05)
    const header = (0x05 << 4) | 0x00;
    const packet = Buffer.alloc(22);
    packet[0] = header;
    packet[1] = 85; // Battery 85%
    packet.writeFloatLE(1.23, 2); // Altitude
    packet.writeFloatLE(0.1, 6);  // Roll
    packet.writeFloatLE(-0.05, 10); // Pitch
    packet.writeFloatLE(45.0, 14); // Yaw
    packet.writeFloatLE(3.8, 18);  // Vbat

    telemetryClient.send(packet, TELEMETRY_PORT, '127.0.0.1', (err) => {
        if (err) console.error('Failed to send mock telemetry', err);
    });
}, TELEMETRY_INTERVAL);

console.log('Sending mock telemetry to 127.0.0.1:2391...');
