"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  count?: number;
  color?: string;
  size?: number;
  opacity?: number;
}

// Module-level: Three.js objects are meant to be mutated per frame.
// Using module scope avoids React immutability lint rules for typed arrays.
const PARTICLE_COUNT = 300;

const _pos = new Float32Array(PARTICLE_COUNT * 3);
const _vel = new Float32Array(PARTICLE_COUNT * 3);
const _geo = new THREE.BufferGeometry();

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const i3 = i * 3;
  _pos[i3] = (Math.random() - 0.5) * 20;
  _pos[i3 + 1] = (Math.random() - 0.5) * 20;
  _pos[i3 + 2] = (Math.random() - 0.5) * 10 - 5;
  _vel[i3] = (Math.random() - 0.5) * 0.005;
  _vel[i3 + 1] = (Math.random() - 0.5) * 0.005;
  _vel[i3 + 2] = (Math.random() - 0.5) * 0.005;
}
_geo.setAttribute("position", new THREE.Float32BufferAttribute(_pos, 3));

export function ParticleField({
  count = 300,
  color = "#0b2c5f",
  size = 0.015,
  opacity = 0.2,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame(() => {
    if (pointsRef.current) {
      const c = Math.min(count, PARTICLE_COUNT);
      for (let i = 0; i < c; i++) {
        const i3 = i * 3;
        _pos[i3] += _vel[i3];
        _pos[i3 + 1] += _vel[i3 + 1];
        _pos[i3 + 2] += _vel[i3 + 2];
        if (Math.abs(_pos[i3]) > 10) _vel[i3] *= -1;
        if (Math.abs(_pos[i3 + 1]) > 10) _vel[i3 + 1] *= -1;
        if (Math.abs(_pos[i3 + 2]) > 5) _vel[i3 + 2] *= -1;
      }
      _geo.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} geometry={_geo}>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
