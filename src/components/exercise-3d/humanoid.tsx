"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getPose } from "./poses";

const SKIN = "#e3a172";
const SUIT = "#2b2733";
const ACCENT = "#e8873b";

function Limb({
  length,
  radius,
  color,
}: {
  length: number;
  radius: number;
  color: string;
}) {
  return (
    <mesh position={[0, -length / 2, 0]} castShadow>
      <capsuleGeometry args={[radius, length - radius * 2, 4, 8]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  );
}

export function Humanoid({
  patternKey,
  speed = 0.35,
  highlightSide,
}: {
  patternKey: string;
  speed?: number;
  highlightSide?: "arms" | "legs" | "core";
}) {
  const hips = useRef<THREE.Group>(null);
  const spine = useRef<THREE.Group>(null);
  const lShoulder = useRef<THREE.Group>(null);
  const rShoulder = useRef<THREE.Group>(null);
  const lElbow = useRef<THREE.Group>(null);
  const rElbow = useRef<THREE.Group>(null);
  const lHip = useRef<THREE.Group>(null);
  const rHip = useRef<THREE.Group>(null);
  const lKnee = useRef<THREE.Group>(null);
  const rKnee = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    const pose = getPose(patternKey, t);

    if (hips.current) hips.current.position.y = 1.05 + pose.hipsY * 0.5;
    if (spine.current) spine.current.rotation.x = pose.spineX;
    if (lShoulder.current) {
      lShoulder.current.rotation.x = pose.leftShoulderX;
      lShoulder.current.rotation.z = pose.leftShoulderZ;
    }
    if (rShoulder.current) {
      rShoulder.current.rotation.x = pose.rightShoulderX;
      rShoulder.current.rotation.z = -pose.rightShoulderZ;
    }
    if (lElbow.current) lElbow.current.rotation.x = -pose.leftElbow;
    if (rElbow.current) rElbow.current.rotation.x = -pose.rightElbow;
    if (lHip.current) lHip.current.rotation.x = pose.leftHipX;
    if (rHip.current) rHip.current.rotation.x = pose.rightHipX;
    if (lKnee.current) lKnee.current.rotation.x = pose.leftKnee;
    if (rKnee.current) rKnee.current.rotation.x = pose.rightKnee;
  });

  const armColor = highlightSide === "arms" ? ACCENT : SUIT;
  const legColor = highlightSide === "legs" ? ACCENT : SUIT;

  return (
    <group position={[0, 0, 0]}>
      <group ref={hips} position={[0, 1.05, 0]}>
        {/* torso */}
        <group ref={spine}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[0.46, 0.62, 0.26]} />
            <meshStandardMaterial color={highlightSide === "core" ? ACCENT : SUIT} roughness={0.6} />
          </mesh>
          {/* head */}
          <mesh position={[0, 0.78, 0]} castShadow>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>

          {/* left arm */}
          <group ref={lShoulder} position={[-0.29, 0.58, 0]}>
            <Limb length={0.34} radius={0.075} color={armColor} />
            <group ref={lElbow} position={[0, -0.34, 0]}>
              <Limb length={0.32} radius={0.065} color={SKIN} />
            </group>
          </group>

          {/* right arm */}
          <group ref={rShoulder} position={[0.29, 0.58, 0]}>
            <Limb length={0.34} radius={0.075} color={armColor} />
            <group ref={rElbow} position={[0, -0.34, 0]}>
              <Limb length={0.32} radius={0.065} color={SKIN} />
            </group>
          </group>
        </group>

        {/* left leg */}
        <group ref={lHip} position={[-0.13, 0, 0]}>
          <Limb length={0.46} radius={0.095} color={legColor} />
          <group ref={lKnee} position={[0, -0.46, 0]}>
            <Limb length={0.44} radius={0.08} color={legColor} />
          </group>
        </group>

        {/* right leg */}
        <group ref={rHip} position={[0.13, 0, 0]}>
          <Limb length={0.46} radius={0.095} color={legColor} />
          <group ref={rKnee} position={[0, -0.46, 0]}>
            <Limb length={0.44} radius={0.08} color={legColor} />
          </group>
        </group>
      </group>
    </group>
  );
}
