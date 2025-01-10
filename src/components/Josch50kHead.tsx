import { useGLTF } from '@react-three/drei';

export const JoschHead = (props: any) => {
  const { nodes, materials } = useGLTF('/models/josch50k3.glb');

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.josch3.geometry} material={materials['Marble.001']}
        position={[0.002, 0.039, -0.004]}
        rotation={[0.795, 0.119, -0.355]}
        scale={0.013}
      >
        {/* <meshPhysicalMaterial
          roughness={1}
          metalness={.6}
          displacementScale={.1}
        /> */}
      </mesh>
    </group>
  );
};

useGLTF.preload('/models/josch50k3.glb');
