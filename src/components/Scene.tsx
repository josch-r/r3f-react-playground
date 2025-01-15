import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";
import { JoschHead } from './Josch50kHead';
import NoiseLines from "./noiseLines";
import { Leva } from "leva";
import { Perf } from 'r3f-perf'

const noise3D = createNoise3D();

const Agent = ({ radius }: { radius: number }) => {
  const ref = useRef<THREE.Mesh>(new THREE.Mesh());
  const lightRef = useRef<THREE.PointLight>(null);

  const angleOffset = Math.random() * Math.PI * 3;
  const distanceOffset = Math.random() * 4 - 3;
  const speed = Math.random() * 0.75 + 0.2;
  const noiseOffset = Math.random() * 100;

  const frameCount = useRef(0);

  useFrame(() => {
    frameCount.current += 0.01;

    const angle = angleOffset + frameCount.current * speed;
    const x = (radius + distanceOffset) * Math.cos(angle);
    const z = (radius + distanceOffset) * Math.sin(angle);

    const y = noise3D(frameCount.current + noiseOffset, 0, 0) * 0.5;

    const position = new THREE.Vector3(x, y, z);
    if (ref.current) ref.current.position.copy(position);
    if (lightRef.current) lightRef.current.position.copy(position);
  });

  return (
    <pointLight
      ref={lightRef}
      color="white"
      intensity={1}
      distance={9}
      decay={2}
    />
  );
};

const Scene = () => {
  const radius = 5;

  return (
    <>
      <Leva />
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ height: "100vh", background: "black" }}
      >
        <Perf position="bottom-left" />
        <OrbitControls enableZoom={false} />

        <JoschHead />

        {Array.from({ length: 30 }).map((_, i) => (
          <Agent key={i} radius={radius} />
        ))}

        <NoiseLines />
        <Environment preset="night" background={false} environmentIntensity={.8}/>
        {/* <ambientLight intensity={0.3} /> */}
      </Canvas>
    </>
  );
};

export default Scene;

