"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getPose } from "./poses";
import { OVERHEAD_ANCHOR, LOW_ANCHOR, PROP_KIND_BY_PATTERN, stretchBetween } from "./props";

const SKIN = "#e3a172";
const SUIT = "#2b2733";
const ACCENT = "#e8873b";
const STEEL = "#7b828c";
const STEEL_DARK = "#4b5058";
const CABLE = "#2f3237";
const PAD = "#1f2430";

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
  const lHand = useRef<THREE.Group>(null);
  const rHand = useRef<THREE.Group>(null);
  const lFoot = useRef<THREE.Group>(null);
  const rFoot = useRef<THREE.Group>(null);

  const barMesh = useRef<THREE.Mesh>(null);
  const cableMesh = useRef<THREE.Mesh>(null);
  const plateMesh = useRef<THREE.Mesh>(null);

  const propKind = PROP_KIND_BY_PATTERN[patternKey] ?? "none";

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

    // Position equipment props that need to track a moving joint each frame.
    if (propKind === "handBar" || propKind === "cableOverhead" || propKind === "cableLow") {
      if (lHand.current && rHand.current && barMesh.current) {
        const a = new THREE.Vector3();
        const b = new THREE.Vector3();
        lHand.current.getWorldPosition(a);
        rHand.current.getWorldPosition(b);
        stretchBetween(barMesh.current, a, b);

        if (cableMesh.current) {
          const mid = a.clone().add(b).multiplyScalar(0.5);
          const anchor = propKind === "cableOverhead" ? OVERHEAD_ANCHOR : LOW_ANCHOR;
          stretchBetween(cableMesh.current, mid, anchor);
        }
      }
    } else if (propKind === "footPlatform") {
      if (lFoot.current && rFoot.current && plateMesh.current) {
        const a = new THREE.Vector3();
        const b = new THREE.Vector3();
        lFoot.current.getWorldPosition(a);
        rFoot.current.getWorldPosition(b);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        plateMesh.current.position.copy(mid);
      }
    }
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

          {propKind === "shoulderBar" && (
            <mesh position={[0, 0.66, -0.16]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.035, 0.035, 1.1, 12]} />
              <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.6} />
            </mesh>
          )}

          {/* left arm */}
          <group ref={lShoulder} position={[-0.29, 0.58, 0]}>
            <Limb length={0.34} radius={0.075} color={armColor} />
            <group ref={lElbow} position={[0, -0.34, 0]}>
              <Limb length={0.32} radius={0.065} color={SKIN} />
              <group ref={lHand} position={[0, -0.32, 0]}>
                {propKind === "handles" && (
                  <mesh castShadow>
                    <sphereGeometry args={[0.05, 12, 12]} />
                    <meshStandardMaterial color={STEEL_DARK} roughness={0.4} metalness={0.5} />
                  </mesh>
                )}
              </group>
            </group>
          </group>

          {/* right arm */}
          <group ref={rShoulder} position={[0.29, 0.58, 0]}>
            <Limb length={0.34} radius={0.075} color={armColor} />
            <group ref={rElbow} position={[0, -0.34, 0]}>
              <Limb length={0.32} radius={0.065} color={SKIN} />
              <group ref={rHand} position={[0, -0.32, 0]}>
                {propKind === "handles" && (
                  <mesh castShadow>
                    <sphereGeometry args={[0.05, 12, 12]} />
                    <meshStandardMaterial color={STEEL_DARK} roughness={0.4} metalness={0.5} />
                  </mesh>
                )}
              </group>
            </group>
          </group>
        </group>

        {/* left leg */}
        <group ref={lHip} position={[-0.13, 0, 0]}>
          <Limb length={0.46} radius={0.095} color={legColor} />
          <group ref={lKnee} position={[0, -0.46, 0]}>
            <Limb length={0.44} radius={0.08} color={legColor} />
            <group ref={lFoot} position={[0, -0.44, 0.08]}>
              {propKind === "anklePad" && (
                <mesh castShadow>
                  <boxGeometry args={[0.16, 0.06, 0.06]} />
                  <meshStandardMaterial color={PAD} roughness={0.7} />
                </mesh>
              )}
            </group>
          </group>
        </group>

        {/* right leg */}
        <group ref={rHip} position={[0.13, 0, 0]}>
          <Limb length={0.46} radius={0.095} color={legColor} />
          <group ref={rKnee} position={[0, -0.46, 0]}>
            <Limb length={0.44} radius={0.08} color={legColor} />
            <group ref={rFoot} position={[0, -0.44, 0.08]}>
              {propKind === "anklePad" && (
                <mesh castShadow>
                  <boxGeometry args={[0.16, 0.06, 0.06]} />
                  <meshStandardMaterial color={PAD} roughness={0.7} />
                </mesh>
              )}
            </group>
          </group>
        </group>
      </group>

      {/* dynamically-tracked props */}
      {(propKind === "handBar" || propKind === "cableOverhead" || propKind === "cableLow") && (
        <mesh ref={barMesh} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 1, 10]} />
          <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.6} />
        </mesh>
      )}
      {(propKind === "cableOverhead" || propKind === "cableLow") && (
        <mesh ref={cableMesh}>
          <cylinderGeometry args={[0.008, 0.008, 1, 6]} />
          <meshStandardMaterial color={CABLE} roughness={0.8} />
        </mesh>
      )}
      {propKind === "footPlatform" && (
        <mesh ref={plateMesh} position={[0, 0.25, 0.55]} rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.04, 0.4]} />
          <meshStandardMaterial color={STEEL_DARK} roughness={0.5} metalness={0.4} />
        </mesh>
      )}

      {/* static props that don't move with the body */}
      {propKind === "fixedOverheadBar" && (
        <mesh position={[0, 2.05, 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 10]} />
          <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.6} />
        </mesh>
      )}
      {propKind === "fixedParallelBars" && (
        <>
          <mesh position={[-0.3, 1.5, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.55, 10]} />
            <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.6} />
          </mesh>
          <mesh position={[0.3, 1.5, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.55, 10]} />
            <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.6} />
          </mesh>
        </>
      )}
    </group>
  );
}
