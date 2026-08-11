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
  squat: "legs",
  deadlift: "legs",
  cardio_cycle: "legs",
  cardio_run: "legs",
  mobility_stretch: "core",
};

export function ExerciseCanvas({ patternKey }: { patternKey: string }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [1.6, 1.3, 2.2], fov: 40 }}
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
        target={[0, 1.05, 0]}
      />
    </Canvas>
  );
}
