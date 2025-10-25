/**
 * ParticleRing Component
 * 3D animated particle ring background using React Three Fiber
 */

'use client';

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { pointsInner, pointsOuter } from "./particleUtils";

/**
 * Main ParticleRing component - renders the 3D canvas background
 */
const ParticleRing: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{
          position: [10, -7.5, -5],
        }}
        style={{ 
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        className="bg-transparent"
      >
        {/* Disable user interaction for background */}
        <OrbitControls 
          maxDistance={20} 
          minDistance={10} 
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
        
        {/* Lighting */}
        <directionalLight intensity={0.5} />
        <pointLight position={[-30, 0, -30]} intensity={1.0} />
        <pointLight position={[30, 0, 30]} intensity={0.5} />
        <ambientLight intensity={0.2} />
        
        {/* Particle circles */}
        <PointCircle />
      </Canvas>
    </div>
  );
};

/**
 * PointCircle component - handles rotation and rendering of particles
 */
const PointCircle: React.FC = () => {
  const ref = useRef<any>(null);

  // Animate rotation on each frame
  useFrame(({ clock }) => {
    if (ref.current?.rotation) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={ref}>
      {/* Render inner particle ring */}
      {pointsInner.map((point) => (
        <Point key={point.idx} position={point.position} color={point.color} />
      ))}
      
      {/* Render outer particle ring */}
      {pointsOuter.map((point) => (
        <Point key={point.idx} position={point.position} color={point.color} />
      ))}
    </group>
  );
};

/**
 * Point component - individual particle sphere
 */
interface PointProps {
  position: [number, number, number];
  color: string;
}

const Point: React.FC<PointProps> = ({ position, color }) => {
  return (
    <Sphere position={position} args={[0.1, 10, 10]}>
      <meshStandardMaterial
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.5}
        color={color}
      />
    </Sphere>
  );
};

export default ParticleRing;

