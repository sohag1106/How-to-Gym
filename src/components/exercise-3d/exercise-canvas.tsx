"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { MixamoCharacter } from "./mixamo-character";

const DEFAULT_CAMERA: [number, number, number] = [1.5, 1.2, 2.1];
const DEFAULT_TARGET: [number, number, number] = [0, 0.95, 0];

// A 3/4 angle (not a pure side view) reads hip-hinge/knee-tracking exercises
// well while keeping the bar visible instead of edge-on; front-ish angles
// read bar-path/pulling exercises best. Everything else keeps the default.
const CAMERA_BY_PATTERN: Record<string, [number, number, number]> = {
  squat: [1.9, 1.05, 0.95],
  deadlift: [1.9, 0.95, 0.95],
  leg_press: [2.1, 0.95, 0.65],
  leg_curl: [2.1, 0.95, 0.65],
  leg_extension: [2.1, 0.95, 0.65],
  lat_pulldown: [0.3, 1.2, 2.5],
  pull_up: [0.5, 1.45, 3.1],
  cable_row: [2.1, 1.05, 0.85],
  chest_fly: [0.25, 1.2, 2.4],
};

// Overhead-reaching exercises need the orbit target raised so the bar and
// hands stay in frame instead of getting cropped off the top.
const TARGET_BY_PATTERN: Record<string, [number, number, number]> = {
  pull_up: [0, 1.25, 0],
};

export function ExerciseCanvas({ patternKey }: { patternKey: string }) {
  const cameraPosition = CAMERA_BY_PATTERN[patternKey] ?? DEFAULT_CAMERA;
  const target = TARGET_BY_PATTERN[patternKey] ?? DEFAULT_TARGET;

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: cameraPosition, fov: 40 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#00000000"]} />
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[2, 4, 2]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight position={[-2, 2, -1]} intensity={0.4} />

      <Suspense fallback={null}>
        <MixamoCharacter patternKey={patternKey} />
        <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={3} blur={2.2} far={2} />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate
        autoRotateSpeed={1.4}
        target={target}
      />
    </Canvas>
  );
}
