import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { createNoise3D } from "simplex-noise";
import { useControls, Leva } from "leva";
import { OrbitControls, Box } from "@react-three/drei";
import * as THREE from "three";

const noise3D = createNoise3D();

// Single agent with TubeGeometry and 3 lights
const DreiTubeAgentWithLights = ({ noiseZRange }: { noiseZRange: number }) => {
  const tubeRef = useRef<THREE.Mesh>(null);
  const lightsRef = useRef<THREE.PointLight[]>([]);
  const [vector, setVector] = useState(
    new THREE.Vector3(
      Math.random() * 10 - 5, // Adjusted for smaller boundaries
      Math.random() * 5 - 2.5,
      Math.random() * 10 - 5
    )
  );
  const [path, setPath] = useState<THREE.Vector3[]>([vector.clone()]);
  const noiseZ = useRef(Math.random() * noiseZRange);
  const stepSize = 0.02; // Slower movement for smoother paths
  const bounds = { x: 4, y: 4, z: 2}; // Reduced boundaries

  useFrame(() => {
    // Compute new vector using noise
    const noiseFactor = 0.02;
    const angle =
      noise3D(vector.x * noiseFactor, vector.y * noiseFactor, noiseZ.current) *
      Math.PI *
      2;
  
    const newVector = vector.clone();
    newVector.x += Math.cos(angle) * stepSize;
    newVector.y += Math.sin(angle) * stepSize;
    newVector.z += Math.sin(angle) * stepSize * 0.5;
  
    // Constrain agents to stay within bounds
    if (newVector.x < -bounds.x) newVector.x = -bounds.x;
    if (newVector.x > bounds.x) newVector.x = bounds.x;
    if (newVector.y < -bounds.y) newVector.y = -bounds.y;
    if (newVector.y > bounds.y) newVector.y = bounds.y;
    if (newVector.z > 1) newVector.z = 1;     // Maximum z
    if (newVector.z < -1.5) newVector.z = -1.5; // Minimum z
  
    // Update path for smooth motion
    setPath((prevPath) => {
      const updatedPath = [...prevPath, newVector.clone()];
      if (updatedPath.length > 100) updatedPath.shift(); // Limit path length
      return updatedPath;
    });
  
    setVector(newVector);
    noiseZ.current += 0.002; // Move noise for continuous change
  
    // Update TubeGeometry
    if (tubeRef.current) {
      const curve = new THREE.CatmullRomCurve3(path.length > 1 ? path : [newVector, newVector]);
      tubeRef.current.geometry = new THREE.TubeGeometry(curve, 128, 0.1, 8, false);
    }
  
    // Update lights positions along the path
    if (lightsRef.current.length === 3) {
      const positions = [
        path[Math.floor(path.length / 3)] || newVector, // First light
        path[Math.floor((path.length * 2) / 3)] || newVector, // Second light
        path[path.length - 1] || newVector, // Third light
      ];
      positions.forEach((pos, i) => {
        if (lightsRef.current[i]) {
          lightsRef.current[i].position.set(pos.x, pos.y, pos.z);
        }
      });
    }
  });
  

  return (
    <group>
      {/* TubeGeometry */}
      <mesh ref={tubeRef}>
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={1} color="#ffffff" />
      </mesh>

      {/* 3 Lights */}
      {[0, 1, 2].map((_, i) => (
        <pointLight
          ref={(el) => (lightsRef.current[i] = el!)}
          key={i}
          color="#ffffff"
          intensity={0.5} // Reduced intensity for smoother lighting
          distance={5}
          decay={2}
        />
      ))}
    </group>
  );
};

// Scene containing multiple agents
const AgentsScene = ({ numAgents }: { numAgents: number }) => {
  const noiseZRange = 0.02;
  return (
    <>
      {Array.from({ length: numAgents }).map((_, i) => (
        <DreiTubeAgentWithLights key={i} noiseZRange={noiseZRange} />
      ))}
    </>
  );
};

// Main scene with controls
const Scene = () => {
  const { agentCount } = useControls({
    agentCount: { value: 10, label: "Number of Agents" }, // Reduced for better performance
  });

  return (
    <>
      <Leva />
      <Canvas
        style={{ height: "100vh", background: "black" }}
        camera={{ position: [0, 0, 30], fov: 60 }}
      >
        <OrbitControls />
        <ambientLight intensity={0.2} />
        <AgentsScene numAgents={agentCount} />
        <Box args={[5, 6, 3]} position={[0, 0, -3]}>
          <meshStandardMaterial color="#D3D3D3" />
        </Box>
      </Canvas>
    </>
  );
};

export default Scene;
