module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/dgram [external] (dgram, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dgram", () => require("dgram"));

module.exports = mod;
}),
"[project]/app/api/drone/telemetry/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$dgram__$5b$external$5d$__$28$dgram$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/dgram [external] (dgram, cjs)");
;
;
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
let telemetrySocket = null;
let socketInitialized = false;
function initTelemetrySocket() {
    if (socketInitialized) return;
    socketInitialized = true;
    try {
        telemetrySocket = __TURBOPACK__imported__module__$5b$externals$5d2f$dgram__$5b$external$5d$__$28$dgram$2c$__cjs$29$__["default"].createSocket('udp4');
        telemetrySocket.on('message', (msg)=>{
            try {
                // Parse incoming CRTP packet
                if (msg.length >= 5) {
                    const header = msg[0];
                    const port = header >> 4 & 0x0F;
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
        telemetrySocket.on('error', (err)=>{
            console.error('Telemetry socket error:', err);
            lastTelemetry.connected = false;
        });
        // Bind to receive responses
        telemetrySocket.bind(2391);
    } catch (e) {
        console.error('Failed to initialize telemetry socket:', e);
    }
}
async function GET() {
    // Initialize socket lazily on first request
    initTelemetrySocket();
    // Check if we've received recent data (within 2 seconds)
    const isConnected = Date.now() - lastTelemetry.lastUpdate < 2000;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ...lastTelemetry,
        connected: isConnected,
        timestamp: Date.now()
    });
}
async function POST(req) {
    // Allow sending telemetry request to drone
    try {
        const body = await req.json();
        if (body.type === 'requestTelemetry') {
            // Send a log request packet to drone
            const socket = __TURBOPACK__imported__module__$5b$externals$5d2f$dgram__$5b$external$5d$__$28$dgram$2c$__cjs$29$__["default"].createSocket('udp4');
            const header = CRTP_PORT_LOG << 4 | CRTP_CHANNEL_LOG_TOC;
            const packet = Buffer.from([
                header,
                0x00
            ]); // Request TOC
            socket.send(packet, DRONE_PORT, DRONE_IP, (err)=>{
                socket.close();
                if (err) console.error('Telemetry request error:', err);
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Unknown request type'
        }, {
            status: 400
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__20bac1c9._.js.map