"use client"

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Float } from '@react-three/drei'
import { DroneModel } from './DroneModel'

export function ThreeDView() {
    return (
        <div className="w-full h-full min-h-[400px] lg:min-h-[600px] cursor-grab active:cursor-grabbing">
            <Canvas shadows camera={{ position: [0, 2, 4], fov: 40 }}>
                <ambientLight intensity={0.4} />
                <spotLight position={[10, 15, 10]} angle={0.2} penumbra={1} intensity={1.2} castShadow />
                <pointLight position={[-10, -5, -10]} intensity={0.3} />

                <Suspense fallback={null}>
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <DroneModel scale={1.5} />
                    </Float>

                    <ContactShadows
                        position={[0, -1.5, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2}
                        far={4.5}
                    />

                    <Environment preset="city" />
                </Suspense>

                <OrbitControls
                    enableZoom={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
        </div>
    )
}
