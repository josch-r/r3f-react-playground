import { useGLTF } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

export const JoschHead = (props: any) => {
  return (
    <group {...props} dispose={null} position={[0.002, 0.039, -0.004]}
      rotation={[0.795, 0.119, -0.355]}
      scale={0.013}>
        <Suspense fallback={<Model url='/models/josch2k.glb' />}>
          <Model url="/models/josch50k3.glb" />
        </Suspense>
    </group>
  );
};

function Model({ url }: { url: string }) {
  const { nodes, materials } = useGLTF(url);

  return (
    <mesh
      geometry={(nodes.josch3 as THREE.Mesh).geometry} material={materials['Marble.001']}
    />
  );

}

useGLTF.preload('/models/josch50k3.glb');
useGLTF.preload('/models/josch2k.glb');

