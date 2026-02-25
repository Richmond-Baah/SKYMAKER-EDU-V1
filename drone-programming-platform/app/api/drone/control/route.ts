import { NextRequest, NextResponse } from 'next/server';
import dgram from 'dgram';

// Drone configuration
const DRONE_IP = '192.168.43.42'; // Default IP of ESP-Drone in AP mode
const DRONE_PORT = 2390;

// CRTP Constants
const CRTP_PORT_SETPOINT = 0x03;
const CRTP_CHANNEL_SETPOINT = 0x00;

// Use globalThis to maintain the socket across hot-reloads
const globalControl = globalThis as unknown as {
    socket: dgram.Socket | undefined;
};

if (!globalControl.socket) {
    globalControl.socket = dgram.createSocket('udp4');
    globalControl.socket.on('error', (err) => {
        console.error('UDP Control socket error:', err);
    });
}

const socket = globalControl.socket;

function floatRef(val: number): Buffer {
    const buf = Buffer.alloc(4);
    buf.writeFloatLE(val, 0);
    return buf;
}

function uint16Ref(val: number): Buffer {
    const buf = Buffer.alloc(2);
    buf.writeUInt16LE(val, 0);
    return buf;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roll, pitch, yaw, thrust, type } = body;

        let packetData: Buffer;

        if (type === 'setpoint') {
            const header = (CRTP_PORT_SETPOINT << 4) | CRTP_CHANNEL_SETPOINT;

            packetData = Buffer.concat([
                Buffer.from([header]),
                floatRef(roll),
                floatRef(pitch),
                floatRef(yaw),
                uint16Ref(thrust)
            ]);
        } else {
            return NextResponse.json({ error: 'Unknown command type' }, { status: 400 });
        }

        // Send UDP packet
        socket.send(packetData, DRONE_PORT, DRONE_IP, (err) => {
            if (err) {
                console.error('UDP send error:', err);
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error processing control command:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
