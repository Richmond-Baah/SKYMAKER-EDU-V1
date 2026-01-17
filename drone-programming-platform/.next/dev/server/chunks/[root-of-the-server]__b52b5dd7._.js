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
"[project]/app/api/drone/control/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$dgram__$5b$external$5d$__$28$dgram$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/dgram [external] (dgram, cjs)");
;
;
// Drone configuration
const DRONE_IP = '192.168.43.42'; // Default IP of ESP-Drone in AP mode
const DRONE_PORT = 2390;
// CRTP Constants
const CRTP_PORT_SETPOINT = 0x03;
const CRTP_CHANNEL_SETPOINT = 0x00;
// Reusing the socket across requests if possible (Next.js serverless nature might recreate it, but this is best effort)
// For a robust implementation in a real server, we might want a dedicated worker, but for this educational platform:
const socket = __TURBOPACK__imported__module__$5b$externals$5d2f$dgram__$5b$external$5d$__$28$dgram$2c$__cjs$29$__["default"].createSocket('udp4');
function floatRef(val) {
    const buf = Buffer.alloc(4);
    buf.writeFloatLE(val, 0);
    return buf;
}
function uint16Ref(val) {
    const buf = Buffer.alloc(2);
    buf.writeUInt16LE(val, 0);
    return buf;
}
async function POST(req) {
    try {
        const body = await req.json();
        const { roll, pitch, yaw, thrust, type } = body;
        let packetData;
        if (type === 'setpoint') {
            const header = CRTP_PORT_SETPOINT << 4 | CRTP_CHANNEL_SETPOINT;
            packetData = Buffer.concat([
                Buffer.from([
                    header
                ]),
                floatRef(roll),
                floatRef(pitch),
                floatRef(yaw),
                uint16Ref(thrust)
            ]);
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unknown command type'
            }, {
                status: 400
            });
        }
        // Send UDP packet
        socket.send(packetData, DRONE_PORT, DRONE_IP, (err)=>{
            if (err) {
                console.error('UDP send error:', err);
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error('Error processing control command:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal Server Error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b52b5dd7._.js.map