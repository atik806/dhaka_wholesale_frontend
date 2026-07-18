"use client";

import { Suspense, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";

interface SceneContainerProps {
  children: React.ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
}

export function SceneContainer({
  children,
  className = "",
  cameraPosition = [0, 0, 6],
  cameraFov = 45,
}: SceneContainerProps) {
  const [key, setKey] = useState(0);

  const handleCreated = useCallback((state: { gl: { domElement: HTMLElement } }) => {
    const canvas = state.gl.domElement;
    const onContextLost = (e: Event) => {
      e.preventDefault();
    };
    const onContextRestored = () => {
      setKey((k) => k + 1);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, []);

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        key={key}
        camera={{ position: cameraPosition, fov: cameraFov }}
        dpr={[0.75, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        onCreated={handleCreated}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-3, 1, -4]} intensity={0.8} color="#5eead4" />
          <directionalLight position={[0, -5, 3]} intensity={0.25} color="#0d9488" />
          <pointLight position={[2.5, 0.5, 2]} intensity={0.4} color="#1a4a8a" />
          {children}
          <AdaptiveDpr />
          <AdaptiveEvents />
        </Suspense>
      </Canvas>
    </div>
  );
}
