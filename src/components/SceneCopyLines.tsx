import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { createNoise3D } from "simplex-noise";
import { useControls, Leva } from "leva";
import * as THREE from "three";
import { Box, OrbitControls } from "@react-three/drei";

const noise3D = createNoise3D();

// single agent (line)
const Agent = ({ noiseZRange }: { noiseZRange: number }) => {
  const opacityRef = useRef(Math.random() * 0.5 + 0.5);
  const ref = useRef();
  const [vector, setVector] = useState(new THREE.Vector3(Math.random() * 20 - 10, Math.random() * 10 - 5, Math.random() * 20 - 10));
  const [path, setPath] = useState([vector.clone()]);
  const stepSize = 0.05; // Reduzierte Schrittgröße für langsame Bewegung
  const noiseZ = useRef(Math.random() * noiseZRange);

  useFrame(() => {
    // Smooth Opacity Update
    opacityRef.current += (Math.random() * 0.02 - 0.01);
    opacityRef.current = Math.min(Math.max(opacityRef.current, 0.1), .6); // Clamp between 0.3 and 1
    // Berechnung des Winkels mithilfe von 3D Noise
    const noiseFactor = 0.02;
    const angle =
      noise3D(vector.x * noiseFactor, vector.y * noiseFactor, noiseZ.current) * Math.PI * 2;

    // Bewegung des Vektors basierend auf dem Winkel
    const newVector = vector.clone();
    newVector.x += Math.cos(angle) * stepSize;
    newVector.y += Math.sin(angle) * stepSize;
    newVector.z += Math.sin(angle) * stepSize * 0.5; // Bewegung in Z für dreidimensionale Wirkung

    // Bildschirmgrenzen (sicherstellen, dass Agenten im Raum bleiben)
    const boundX = window.innerWidth / 50;
    const boundY = window.innerHeight / 50;
    const boundZ = 20;
    if (newVector.x < -boundX || newVector.x > boundX || newVector.y < -boundY || newVector.y > boundY || newVector.z < -boundZ || newVector.z > boundZ) {
      // Wenn der Agent den Raum verlässt, setzen wir ihn zurück, um Fragmente zu vermeiden
      newVector.set(Math.random() * boundX * 2 - boundX, Math.random() * boundY * 2 - boundY, Math.random() * boundZ * 2 - boundZ);
      setPath([newVector.clone()]);
    } else {
      // Aktualisierung des Pfades für geschwungene Bewegung
      setPath((prevPath) => {
        const updatedPath = [...prevPath, newVector.clone()];
        if (updatedPath.length > 50) updatedPath.shift(); // Halte den Pfad auf einer bestimmten Länge
        return updatedPath;
      });
    }

    // Linien im Raum zeichnen (geschwungene Bewegung)
    if (ref.current) {
      const positions = new Float32Array(path.flatMap((point) => [point.x, point.y, point.z]));
      ref.current.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      ref.current.geometry.attributes.position.needsUpdate = true;
    }

    // Aktualisierung des aktuellen Vektors
    setVector(newVector);

    // Noise-Z verschieben für kontinuierliche Änderung
    noiseZ.current += 0.002; // Langsamerer Noise-Fortschritt
  });

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineDashedMaterial color={"#ffffff"} transparent opacity={opacityRef.current} linewidth={4} />
    </line>
  );
};

const AgentsScene = ({ numAgents }: { numAgents: number }) => {
  const agentCount = numAgents; // Anzahl der Agenten für organischere Bewegung
  const noiseZRange = 0.2;

  return (
    <>
      {Array.from({ length: agentCount }).map((_, i) => (
        <Agent key={i} noiseZRange={noiseZRange} />
      ))}
    </>
  );
};

const Scene = () => {
  const { agentCount } = useControls({
    agentCount: { value: 100, label: 'agentCount' }
  });

  return (
    <>
      <Leva />
      <Canvas onCreated={({ gl }) => gl.setSize(window.innerWidth, window.innerHeight)}
        style={{ height: "100vh", background: "black" }}
        camera={{ position: [0, 0, 30], fov: 60 }}
      >
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <AgentsScene numAgents={agentCount}/>
        <Box args={[5, 6, 3]} position={[0, 0, 0]} >
          <meshStandardMaterial color={"#D3D3D3"} />
          </Box>
      </Canvas>
    </>
  );
};

export default Scene;





