import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Trail, OrbitControls, Box } from "@react-three/drei";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";
import { JoschHead } from './Josch50kHead';
import { JoschHead3 } from './Josch50k3.js'

const noise3D = createNoise3D();

const Agent = ({ radius }: { radius: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Randomized agent properties
  const angleOffset = Math.random() * Math.PI * 3; // Initial angle offset
  const distanceOffset = Math.random() * 4 - 3; // Variation in radius
  const speed = Math.random() * 1.5 + 0.4; // Randomized angular speed (different speeds)
  const noiseOffset = Math.random() * 100; // Noise variation

  // Frame counter to control noise progression
  const frameCount = useRef(0);

  useFrame(() => {
    frameCount.current += 0.01;

    // Circular motion
    const angle = angleOffset + frameCount.current * speed;
    const x = (radius + distanceOffset) * Math.cos(angle);
    const z = (radius + distanceOffset) * Math.sin(angle);

    // Noise-based y variation
    const y = noise3D(frameCount.current + noiseOffset, 0, 0) * 0.5;

    // Update position
    const position = new THREE.Vector3(x, y, z);
    if (ref.current) ref.current.position.copy(position);
    if (lightRef.current) lightRef.current.position.copy(position);
  });

  return (
    <>
      {/* Agent mesh */}
      {/* <mesh ref={ref} renderOrder={1}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="white" opacity={0.5} transparent emissive={true} emissiveIntensity={12} />
      </mesh> */}

      {/* Trail */}
      <Trail
        width={0.5} // Adjust trail width
        color={"#5A5A5A"}
        length={5} // Extended trail length to match circular motion
        attenuation={(t) => t * t * 8} // Keep uniform thickness
        target={ref}
      />

      {/* PointLight */}
      <pointLight
        ref={lightRef}
        color="white"
        intensity={1}
        distance={9}
        decay={2}
      />
    </>

  );
};

const Scene = () => {
  const radius = 5; // Radius of circular motion

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      style={{ height: "100vh", background: "black" }}
    >
      {/* Controls */}
      <OrbitControls />

      {/* Central Box */}
      <JoschHead />
      {/* <JoschHead3 /> */}
      {/* <Box args={[2, 2, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="gray" />
      </Box> */}

      {/* Agents */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Agent key={i} radius={radius} />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.3} />
    </Canvas>
  );
};

export default Scene;
