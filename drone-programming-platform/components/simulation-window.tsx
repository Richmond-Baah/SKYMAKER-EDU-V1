"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import { useRef, useEffect } from "react"
import type { Mesh } from "three"
import * as THREE from "three"

// Drone Model Component
function Drone({ position, rotation, isFlying }: { position: [number, number, number], rotation: [number, number, number], isFlying: boolean }) {
    return (
        <group position={position} rotation={rotation}>
            {/* Body */}
            <mesh>
                <boxGeometry args={[0.2, 0.05, 0.1]} />
                <meshStandardMaterial color="#333" />
            </mesh>

            {/* Arms */}
            <mesh rotation={[0, Math.PI / 4, 0]}>
                <boxGeometry args={[0.4, 0.02, 0.02]} />
                <meshStandardMaterial color="#666" />
            </mesh>
            <mesh rotation={[0, -Math.PI / 4, 0]}>
                <boxGeometry args={[0.4, 0.02, 0.02]} />
                <meshStandardMaterial color="#666" />
            </mesh>

            {/* Propellers */}
            <Propeller position={[0.14, 0.02, 0.14]} color="cyan" isSpinning={isFlying} />
            <Propeller position={[-0.14, 0.02, 0.14]} color="cyan" isSpinning={isFlying} />
            <Propeller position={[0.14, 0.02, -0.14]} color="red" isSpinning={isFlying} />
            <Propeller position={[-0.14, 0.02, -0.14]} color="red" isSpinning={isFlying} />
        </group>
    )
}

function Propeller({ position, color, isSpinning }: { position: [number, number, number], color: string, isSpinning: boolean }) {
    const ref = useRef<Mesh>(null)

    useFrame((state, delta) => {
        if (ref.current && isSpinning) {
            ref.current.rotation.y += delta * 20
        }
    })

    return (
        <mesh ref={ref} position={position}>
            <cylinderGeometry args={[0.08, 0.08, 0.01, 8]} />
            <meshStandardMaterial color={color} opacity={isSpinning ? 0.6 : 0.3} transparent />
        </mesh>
    )
}

// Camera Controller - follows drone but allows manual zoom/orbit
function CameraController({ target }: { target: [number, number, number] }) {
    const { camera } = useThree()
    const controlsRef = useRef<any>(null)

    useFrame(() => {
        if (controlsRef.current) {
            const dronePos = new THREE.Vector3(target[0], target[1], target[2])

            // 1. Move the OrbitControls target to look at the drone
            const currentTarget = controlsRef.current.target as THREE.Vector3

            // Calculate the delta (how much the target moved)
            const delta = new THREE.Vector3().copy(dronePos).sub(currentTarget)

            // Apply a fraction of that delta to the camera position to "chase"
            // We use a small lerp factor for smooth following but we MUST move the camera
            camera.position.add(delta)

            // Update the target to be the drone
            controlsRef.current.target.copy(dronePos)

            controlsRef.current.update()
        }
    })

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.1}
            minDistance={1}
            maxDistance={30}
        />
    )
}

interface SimulationWindowProps {
    position: { x: number, y: number, z: number }
    yaw: number
}

export default function SimulationWindow({ position, yaw }: SimulationWindowProps) {
    const dronePos: [number, number, number] = [position.x, position.y, position.z]

    return (
        <div className="w-full h-full bg-slate-950 rounded-lg overflow-hidden border border-border relative">
            <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                {/* Environment */}
                <Grid infiniteGrid sectionSize={1} fadeDistance={25} sectionColor="#4f4f4f" cellColor="#2f2f2f" />
                <axesHelper args={[2]} />

                {/* Drone */}
                <Drone
                    position={dronePos}
                    rotation={[0, yaw * (Math.PI / 180), 0]}
                    isFlying={position.y > 0.05}
                />

                {/* Camera that follows drone */}
                <CameraController target={dronePos} />
            </Canvas>

            <div className="absolute top-4 right-4 bg-black/50 text-white p-2 text-xs rounded font-mono pointer-events-none">
                <div>X: {position.x.toFixed(2)}m</div>
                <div>Y: {position.y.toFixed(2)}m (Alt)</div>
                <div>Z: {position.z.toFixed(2)}m</div>
                <div>Yaw: {yaw.toFixed(1)}°</div>
            </div>
        </div>
    )
}

