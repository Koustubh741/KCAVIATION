'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Globe() {
  const meshRef = useRef()
  const wireframeRef = useRef()

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#1a3a5e"
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <mesh ref={wireframeRef}>
        <sphereGeometry args={[2.01, 64, 64]} />
        <meshStandardMaterial
          color="#4facfe"
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
    </>
  )
}

