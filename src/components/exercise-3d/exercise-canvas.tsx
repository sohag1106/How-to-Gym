"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { Humanoid } from "./humanoid";

const CATEGORY_BY_PATTERN: Record<string, "arms" | "legs" | "core"> = {
  chest_press: "arms",
  chest_fly: "arms",
  shoulder_press: "arms",
  lat_pulldown: "arms",
  pull_up: "arms",
  cable_row: "arms",
  bicep_curl: "arms",
  tricep_dip: "arms",
  leg_press: "legs",
  leg_curl: "legs",
  leg_extension: "legs",
  squat: "legs",
  deadlift: "legs",
  cardio_cycle: "legs",
  cardio_run: "legs",
  mobility_stretch: "core",
};

const DEFAULT_CAMERA: [number, number, number] = [1.6, 1.3, 2.2];
const DEFAULT_TARGET: [number, number, number] = [0, 1.05, 0];

// A 3/4 angle (not a pure side view) reads hip-hinge/knee-tracking exercises
// well while keeping the bar visible instead of edge-on; front-ish angles
// read bar-path/pulling exercises best. Everything else keeps the default.
const CAMERA_BY_PATTERN: Record<string, [number, number, number]> = {
  squat: [2.0, 1.15, 1.0],
  deadlift: [2.0, 1.05, 1.0],
  leg_press: [2.2, 1.05, 0.7],
  leg_curl: [2.2, 1.05, 0.7],
  leg_extension: [2.2, 1.05, 0.7],
  lat_pulldown: [0.3, 1.3, 2.6],
  pull_up: [0.5, 1.55, 3.2],
  cable_row: [2.2, 1.15, 0.9],
  chest_fly: [0.25, 1.3, 2.5],
};

// Overhead-reaching exercises need the orbit target raised so the bar and
// hands stay in frame instead of getting cropped off the top.
const TARGET_BY_PATTERN: Record<string, [number, number, number]> = {
  pull_up: [0, 1.35, 0],
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
        <Humanoid patternKey={patternKey} highlightSide={CATEGORY_BY_PATTERN[patternKey]} />
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
