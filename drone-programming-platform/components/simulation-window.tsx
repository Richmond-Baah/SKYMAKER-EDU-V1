"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Grid, Float, ContactShadows, Environment } from "@react-three/drei"
import { useRef, Suspense } from "react"
import type { Mesh } from "three"
import * as THREE from "three"
import { useTheme } from "next-themes"

// Drone Model Component
function Drone({ position, rotation, isFlying }: { position: [number, number, number], rotation: [number, number, number], isFlying: boolean }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current && isFlying) {
            // Subtle tilt when flying
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.05;
        }
    });

    return (
        <group position={position} rotation={rotation} ref={groupRef}>
            <Float speed={isFlying ? 3 : 0} rotationIntensity={0.2} floatIntensity={isFlying ? 0.5 : 0}>
                {/* Body - Sleek carbon fiber look */}
                <mesh castShadow>
                    <boxGeometry args={[0.25, 0.06, 0.12]} />
                    <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                </mesh>

                {/* Center Core Glow */}
                <mesh position={[0, 0, 0.061]}>
                    <planeGeometry args={[0.08, 0.02]} />
                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5} transparent opacity={0.8} />
                </mesh>

                {/* Arms - Detailed look */}
                {[Math.PI / 4, -Math.PI / 4, 3 * Math.PI / 4, -3 * Math.PI / 4].map((angle, i) => (
                    <group key={i} rotation={[0, angle, 0]}>
                        <mesh position={[0.2, 0, 0]} castShadow>
                            <boxGeometry args={[0.3, 0.02, 0.03]} />
                            <meshStandardMaterial color="#222" roughness={0.3} metalness={0.7} />
                        </mesh>
                        <Propeller position={[0.3, 0.02, 0]} color={i < 2 ? "#3b82f6" : "#ef4444"} isSpinning={isFlying} />
                    </group>
                ))}
            </Float>
        </group>
    )
}

function Propeller({ position, color, isSpinning }: { position: [number, number, number], color: string, isSpinning: boolean }) {
    const ref = useRef<Mesh>(null)

    useFrame((state, delta) => {
        if (ref.current && isSpinning) {
            ref.current.rotation.y += delta * 40
        }
    })

    return (
        <group position={position}>
            <mesh ref={ref}>
                <cylinderGeometry args={[0.12, 0.12, 0.005, 16]} />
                <meshStandardMaterial color={color} opacity={isSpinning ? 0.4 : 0.2} transparent side={THREE.DoubleSide} />
            </mesh>
            {/* Prop hub */}
            <mesh position={[0, 0.01, 0]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial color="#000" />
            </mesh>
        </group>
    )
}

// Camera Controller
function CameraController({ target }: { target: [number, number, number] }) {
    const { camera } = useThree()
    const controlsRef = useRef<any>(null)

    useFrame(() => {
        if (controlsRef.current) {
            const dronePos = new THREE.Vector3(target[0], target[1], target[2])
            const currentTarget = controlsRef.current.target.clone()
            const delta = dronePos.clone().sub(currentTarget)

            // Smoothly move camera with the drone
            camera.position.add(delta.multiplyScalar(0.1))
            controlsRef.current.target.copy(dronePos)
            controlsRef.current.update()
        }
    })

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.05}
            minDistance={1.5}
            maxDistance={20}
        />
    )
}

interface SimulationWindowProps {
    position: { x: number, y: number, z: number }
    yaw: number
}

export default function SimulationWindow({ position, yaw }: SimulationWindowProps) {
    const dronePos: [number, number, number] = [position.x, position.y, position.z]
    const { resolvedTheme } = useTheme()

    // Theme-dependent colors
    const isDark = resolvedTheme === "dark"
    const bgColor = isDark ? "#050507" : "#f0f9ff" // Dark space vs Light sky blue
    const gridSectionColor = isDark ? "#3b82f6" : "#bae6fd"
    const gridCellColor = isDark ? "#1e293b" : "#e0f2fe"
    const ambientIntensity = isDark ? 1.5 : 2.5

    return (
        <div className={`w-full h-full relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-[#050507]" : "bg-sky-50"}`}>
            <Canvas shadows camera={{ position: [3, 3, 3], fov: 45 }} dpr={[1, 2]}>
                <color attach="background" args={[bgColor]} />

                <Suspense fallback={<mesh><boxGeometry args={[0.5, 0.5, 0.5]} /><meshStandardMaterial color="blue" wireframe /></mesh>}>
                    <Environment preset={isDark ? "night" : "city"} />

                    <ambientLight intensity={ambientIntensity} />
                    <spotLight
                        position={[10, 15, 10]}
                        angle={0.25}
                        penumbra={1}
                        intensity={4}
                        castShadow
                        shadow-mapSize={[1024, 1024]}
                    />
                    <pointLight position={[-10, 5, -10]} intensity={2} color="#3b82f6" />

                    {/* Grid & Environment */}
                    <Grid
                        infiniteGrid
                        sectionSize={1}
                        cellSize={0.1}
                        fadeDistance={25}
                        sectionColor={gridSectionColor}
                        cellColor={gridCellColor}
                        sectionThickness={1.5}
                    />

                    {/* Landing Pad */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                        <circleGeometry args={[0.5, 32]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
                        <ringGeometry args={[0.45, 0.5, 32]} />
                        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} />
                    </mesh>

                    <ContactShadows
                        position={[0, 0, 0]}
                        opacity={0.8}
                        scale={5}
                        blur={2}
                        far={2}
                    />

                    {/* Drone */}
                    <Drone
                        position={[position.x, position.y + 0.03, position.z]} // Tiny liftoff to see it better
                        rotation={[0, -yaw * (Math.PI / 180), 0]}
                        isFlying={position.y > 0.05}
                    />

                    {/* Camera */}
                    <CameraController target={dronePos} />
                </Suspense>
            </Canvas>
        </div>
    )
}
