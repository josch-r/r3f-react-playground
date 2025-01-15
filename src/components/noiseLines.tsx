import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { createNoise3D } from "simplex-noise";
import { useControls } from "leva";
import * as THREE from "three";

const noise3D = createNoise3D();

const AGENT_COUNT = 10000;
const MAX_HISTORY = 50;
const MAX_LINE_LENGTH = 1; // Maximum distance between two points before breaking the line

const AgentsScene = React.memo(() => {
  const positionsRef = useRef<Float32Array>(new Float32Array(AGENT_COUNT * 3));
  const historiesRef = useRef<Float32Array>(new Float32Array(AGENT_COUNT * MAX_HISTORY * 3));
  const historyLengthsRef = useRef<Uint8Array>(new Uint8Array(AGENT_COUNT)); // Track actual history length for each agent
  const noiseZRef = useRef<Float32Array>(new Float32Array(AGENT_COUNT));

  const { stepSize, noiseIncrement, noiseZRange, lineOpacity } = useControls("Noise Lines", {
    stepSize: { value: 0.01, min: 0.01, max: 0.3 },
    noiseIncrement: { value: 0.002, min: 0.0001, max: 0.1 },
    noiseZRange: { value: 0.001, min: 0.0001, max: 0.1 },
    lineOpacity: { value: 0.2, min: 0, max: 1 }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(AGENT_COUNT * MAX_HISTORY * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: lineOpacity,
    });
  }, [lineOpacity]);

  const resetAgent = (index: number, boundX: number, boundY: number) => {
    positionsRef.current[index * 3] = (Math.random() * 2 - 1) * boundX * 0.8;
    positionsRef.current[index * 3 + 1] = (Math.random() * 2 - 1) * boundY * 0.8;
    positionsRef.current[index * 3 + 2] = (Math.random() * 2 - 1) * 0.2 - 10;
    historyLengthsRef.current[index] = 0; // Reset history length
  };

  useEffect(() => {
    const boundX = 10;
    const boundY = 5;

    for (let i = 0; i < AGENT_COUNT; i++) {
      resetAgent(i, boundX, boundY);
      noiseZRef.current[i] = Math.random() * noiseZRange;
    }
  }, [noiseZRange]);

  useFrame(() => {
    const positions = geometry.attributes.position.array as Float32Array;
    const boundX = 25;
    const boundY = 15;
    const noiseFactor = 0.02;

    for (let i = 0; i < AGENT_COUNT; i++) {
      const x = positionsRef.current[i * 3];
      const y = positionsRef.current[i * 3 + 1];
      const z = positionsRef.current[i * 3 + 2];

      const angle = noise3D(x * noiseFactor, y * noiseFactor, noiseZRef.current[i]) * Math.PI * 2;

      const newX = x + Math.cos(angle) * stepSize;
      const newY = y + Math.sin(angle) * stepSize;
      const newZ = z + (Math.random() - 0.5) * stepSize * 0.1;

      // Check if the agent needs to be reset
      if (Math.abs(newX) > boundX || Math.abs(newY) > boundY) {
        resetAgent(i, boundX, boundY);
        continue;
      }

      // Update position
      positionsRef.current[i * 3] = newX;
      positionsRef.current[i * 3 + 1] = newY;
      positionsRef.current[i * 3 + 2] = newZ;

      // Calculate distance to last history point
      let addToHistory = true;
      if (historyLengthsRef.current[i] > 0) {
        const lastIndex = i * MAX_HISTORY * 3 + (historyLengthsRef.current[i] - 1) * 3;
        const dx = newX - historiesRef.current[lastIndex];
        const dy = newY - historiesRef.current[lastIndex + 1];
        const dz = newZ - historiesRef.current[lastIndex + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance > MAX_LINE_LENGTH) {
          resetAgent(i, boundX, boundY);
          continue;
        }
      }

      if (addToHistory) {
        // Shift history if we've reached maximum length
        if (historyLengthsRef.current[i] >= MAX_HISTORY) {
          for (let j = 0; j < MAX_HISTORY - 1; j++) {
            const currentIndex = i * MAX_HISTORY * 3 + j * 3;
            const nextIndex = currentIndex + 3;
            historiesRef.current[currentIndex] = historiesRef.current[nextIndex];
            historiesRef.current[currentIndex + 1] = historiesRef.current[nextIndex + 1];
            historiesRef.current[currentIndex + 2] = historiesRef.current[nextIndex + 2];
          }
          historyLengthsRef.current[i] = MAX_HISTORY - 1;
        }

        // Add new position to history
        const historyIndex = i * MAX_HISTORY * 3 + historyLengthsRef.current[i] * 3;
        historiesRef.current[historyIndex] = newX;
        historiesRef.current[historyIndex + 1] = newY;
        historiesRef.current[historyIndex + 2] = newZ;
        historyLengthsRef.current[i]++;
      }

      noiseZRef.current[i] += noiseIncrement;

      // Update render positions
      const historyLength = historyLengthsRef.current[i];
      for (let j = 0; j < historyLength; j++) {
        const sourceIndex = i * MAX_HISTORY * 3 + j * 3;
        const targetIndex = i * MAX_HISTORY * 3 + j * 3;
        positions[targetIndex] = historiesRef.current[sourceIndex];
        positions[targetIndex + 1] = historiesRef.current[sourceIndex + 1];
        positions[targetIndex + 2] = historiesRef.current[sourceIndex + 2];
      }

      // Clear remaining positions if any
      for (let j = historyLength; j < MAX_HISTORY; j++) {
        const targetIndex = i * MAX_HISTORY * 3 + j * 3;
        positions[targetIndex] = newX;
        positions[targetIndex + 1] = newY;
        positions[targetIndex + 2] = newZ;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments geometry={geometry} material={material} />
  );
});

const NoiseLines = () => {
  return <AgentsScene />;
};

export default NoiseLines;

