"use client"

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function DroneModel(props: any) {
    const group = useRef<THREE.Group>(null!)
    const rotors = useRef<THREE.Group[]>([])

    // Animation for rotation and slight hovering
    useFrame((state) => {
        const t = state.clock.getElapsedTime()

        // Main body rotation
        group.current.rotation.y = t * 0.2

        // Rotor spinning
        rotors.current.forEach((rotor, i) => {
            if (rotor) {
                // Fast spin for props
                rotor.rotation.y += 0.8
            }
        })
    })

    const frameColor = "#f0f0f0" // Clean white look like the sketch
    const frameRoughness = 0.5

    return (
        <group ref={group} {...props} dispose={null}>
            {/* ─── CENTRAL CHASSIS (Per Sketch) ─────────────────── */}
            {/* Top Plate */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[1.8, 0.08, 2.5]} />
                <meshStandardMaterial color={frameColor} roughness={frameRoughness} />
            </mesh>

            {/* Bottom Plate */}
            <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[1.8, 0.08, 2.5]} />
                <meshStandardMaterial color={frameColor} roughness={frameRoughness} />
            </mesh>

            {/* Slats/Grill Structure in the middle */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((z, i) => (
                <mesh key={`slat-${i}`} position={[0, 0, z]}>
                    <boxGeometry args={[1.6, 0.4, 0.08]} />
                    <meshStandardMaterial color={frameColor} roughness={frameRoughness} />
                </mesh>
            ))}

            {/* Side Walls of Chassis */}
            <mesh position={[0.85, 0, 0]}>
                <boxGeometry args={[0.1, 0.48, 2.5]} />
                <meshStandardMaterial color={frameColor} roughness={frameRoughness} />
            </mesh>
            <mesh position={[-0.85, 0, 0]}>
                <boxGeometry args={[0.1, 0.48, 2.5]} />
                <meshStandardMaterial color={frameColor} roughness={frameRoughness} />
            </mesh>

            {/* ─── ARMS (Per Sketch) ───────────────────────────── */}
            {[
                { pos: [1.4, 0, 1.3], rot: [0, -Math.PI / 6, 0] },  // Front Right
                { pos: [-1.4, 0, 1.3], rot: [0, Math.PI / 6, 0] },  // Front Left
                { pos: [1.4, 0, -1.3], rot: [0, Math.PI / 6, 0] }, // Back Right
                { pos: [-1.4, 0, -1.3], rot: [0, -Math.PI / 6, 0] }, // Back Left
            ].map((arm, i) => (
                <group key={`arm-set-${i}`} position={arm.pos as any} rotation={arm.rot as any}>
                    {/* Arm Extension Beam */}
                    <mesh position={[-0.6, 0, 0]}>
                        <boxGeometry args={[1.2, 0.15, 0.2]} />
                        <meshStandardMaterial color={frameColor} roughness={frameRoughness} />
                    </mesh>

                    {/* Motor Pod (Cylinder) */}
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.3, 0.3, 1.2, 32]} />
                        <meshStandardMaterial color={frameColor} roughness={frameRoughness} />
                    </mesh>

                    {/* Inner Joint Detail */}
                    <mesh position={[-1.2, 0, 0]}>
                        <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
                        <meshStandardMaterial color={frameColor} roughness={frameRoughness} />
                    </mesh>

                    {/* ─── ROTOK & PROPELLERS ─────────────────────── */}
                    {/* We add props so it looks like a drone */}
                    <group
                        ref={(el) => { if (el) rotors.current[i] = el; }}
                        position={[0, 0.65, 0]}
                    >
                        {/* Hub */}
                        <mesh>
                            <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
                            <meshStandardMaterial color="#333" />
                        </mesh>
                        {/* Propeller Blades */}
                        <mesh rotation={[0, 0, 0.1]}>
                            <boxGeometry args={[1.5, 0.02, 0.15]} />
                            <meshStandardMaterial color="#111" transparent opacity={0.8} />
                        </mesh>
                        <mesh rotation={[0, Math.PI / 2, -0.1]}>
                            <boxGeometry args={[1.5, 0.02, 0.15]} />
                            <meshStandardMaterial color="#111" transparent opacity={0.8} />
                        </mesh>
                    </group>
                </group>
            ))}

            {/* Subtle electronics core visible inside slats */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.6, 0.2, 1.5]} />
                <meshStandardMaterial color="#222" metalness={0.8} />
            </mesh>
        </group>
    )
}
