import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere } from '@react-three/drei';
import { Leva, useControls } from 'leva';

const Scene = () => {
  const { boxColor, sphereColor } = useControls({
    boxColor: { value: '#3498db', label: 'Box Color' },
    sphereColor: { value: '#e67e22', label: 'Sphere Color' }
  });

  return (
    <>
      <Leva />
      <Canvas style={{ width: '100%', height: '100vh' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <Box position={[-2, 0, 0]}>
          <meshStandardMaterial color={boxColor} />
        </Box>
        <Sphere position={[2, 0, 0]} args={[0.7, 32, 32]}>
          <meshStandardMaterial color={sphereColor} />
        </Sphere>

        <OrbitControls />
      </Canvas>
    </>
  );
};

export default Scene;
