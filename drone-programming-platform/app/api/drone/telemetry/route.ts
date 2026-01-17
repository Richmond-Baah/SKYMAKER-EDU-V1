import { NextRequest, NextResponse } from 'next/server';
import dgram from 'dgram';

// Drone configuration
const DRONE_IP = '192.168.43.42';
const DRONE_PORT = 2390;

// CRTP Constants for logging/telemetry
const CRTP_PORT_LOG = 0x05;
const CRTP_CHANNEL_LOG_TOC = 0x00;

// Store last received telemetry
let lastTelemetry = {
    battery: 100,
    altitude: 0,
    roll: 0,
    pitch: 0,
    yaw: 0,
    vbat: 4.2,
    connected: false,
    lastUpdate: 0
};

// UDP socket for receiving telemetry
let telemetrySocket: dgram.Socket | null = null;
let socketInitialized = false;

function initTelemetrySocket() {
    if (socketInitialized) return;
    socketInitialized = true;

    try {
        telemetrySocket = dgram.createSocket('udp4');

        telemetrySocket.on('message', (msg: Buffer) => {
            try {
                // Parse incoming CRTP packet
                if (msg.length >= 5) {
                    const header = msg[0];
                    const port = (header >> 4) & 0x0F;

                    // Check if it's a log/telemetry packet
                    if (port === CRTP_PORT_LOG) {
                        // Parse telemetry data based on packet structure
                        if (msg.length >= 15) {
                            lastTelemetry = {
                                battery: Math.max(0, Math.min(100, msg.readUInt8(1))),
                                altitude: msg.readFloatLE(2),
                                roll: msg.readFloatLE(6),
                                pitch: msg.readFloatLE(10),
                                yaw: msg.readFloatLE(14) || lastTelemetry.yaw,
                                vbat: msg.length >= 19 ? msg.readFloatLE(15) : lastTelemetry.vbat,
                                connected: true,
                                lastUpdate: Date.now()
                            };
                        }
                    }
                }
            } catch (e) {
                console.error('Telemetry parse error:', e);
            }
        });

        telemetrySocket.on('error', (err) => {
            console.error('Telemetry socket error:', err);
            lastTelemetry.connected = false;
        });

        // Bind to receive responses
        telemetrySocket.bind(2391);
    } catch (e) {
        console.error('Failed to initialize telemetry socket:', e);
    }
}

// Do NOT initialize on import - initialize lazily on first request

export async function GET() {
    // Initialize socket lazily on first request
    initTelemetrySocket();

    // Check if we've received recent data (within 2 seconds)
    const isConnected = Date.now() - lastTelemetry.lastUpdate < 2000;

    return NextResponse.json({
        ...lastTelemetry,
        connected: isConnected,
        timestamp: Date.now()
    });
}

export async function POST(req: NextRequest) {
    // Allow sending telemetry request to drone
    try {
        const body = await req.json();

        if (body.type === 'requestTelemetry') {
            // Send a log request packet to drone
            const socket = dgram.createSocket('udp4');
            const header = (CRTP_PORT_LOG << 4) | CRTP_CHANNEL_LOG_TOC;
            const packet = Buffer.from([header, 0x00]); // Request TOC

            socket.send(packet, DRONE_PORT, DRONE_IP, (err) => {
                socket.close();
                if (err) console.error('Telemetry request error:', err);
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Unknown request type' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
