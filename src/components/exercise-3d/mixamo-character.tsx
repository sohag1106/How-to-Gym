"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { getPose } from "./poses";
import { OVERHEAD_ANCHOR, LOW_ANCHOR, PROP_KIND_BY_PATTERN, stretchBetween } from "./props";

const MODEL_URL = "/models/character.glb";
const STEEL = "#7b828c";
const STEEL_DARK = "#4b5058";
const CABLE = "#2f3237";
const PAD = "#1f2430";

/** Rotates a T-pose arm (horizontal, out to the side) down to a natural
 * hanging-at-the-side rest position. Mirrored between sides because the
 * Mixamo rig's shoulder bones have mirrored (not identical) rest orientations. */
const ARM_DOWN = Math.PI / 2;

function findBone(root: THREE.Object3D, suffix: string): THREE.Bone | undefined {
  let found: THREE.Bone | undefined;
  root.traverse((o) => {
    if (!found && (o as THREE.Bone).isBone && o.name.endsWith(suffix)) found = o as THREE.Bone;
  });
  return found;
}

function q(axis: THREE.Vector3, radians: number) {
  return new THREE.Quaternion().setFromAxisAngle(axis, radians);
}
const X = new THREE.Vector3(1, 0, 0);
const Z = new THREE.Vector3(0, 0, 1);

type Rig = {
  hips?: THREE.Bone;
  spine?: THREE.Bone;
  leftArm?: THREE.Bone;
  rightArm?: THREE.Bone;
  leftForeArm?: THREE.Bone;
  rightForeArm?: THREE.Bone;
  leftUpLeg?: THREE.Bone;
  rightUpLeg?: THREE.Bone;
  leftLeg?: THREE.Bone;
  rightLeg?: THREE.Bone;
  leftHand?: THREE.Bone;
  rightHand?: THREE.Bone;
  leftFoot?: THREE.Bone;
  rightFoot?: THREE.Bone;
  rest: Map<THREE.Bone, THREE.Quaternion>;
  hipsRestY: number;
};

function buildRig(root: THREE.Object3D): Rig {
  const bones: Record<string, THREE.Bone | undefined> = {
    hips: findBone(root, "Hips"),
    spine: findBone(root, "Spine"),
    leftArm: findBone(root, "LeftArm"),
    rightArm: findBone(root, "RightArm"),
    leftForeArm: findBone(root, "LeftForeArm"),
    rightForeArm: findBone(root, "RightForeArm"),
    leftUpLeg: findBone(root, "LeftUpLeg"),
    rightUpLeg: findBone(root, "RightUpLeg"),
    leftLeg: findBone(root, "LeftLeg"),
    rightLeg: findBone(root, "RightLeg"),
    leftHand: findBone(root, "LeftHand"),
    rightHand: findBone(root, "RightHand"),
    leftFoot: findBone(root, "LeftFoot"),
    rightFoot: findBone(root, "RightFoot"),
  };
  const rest = new Map<THREE.Bone, THREE.Quaternion>();
  for (const b of Object.values(bones)) {
    if (b) rest.set(b, b.quaternion.clone());
  }
  return { ...bones, rest, hipsRestY: bones.hips?.position.y ?? 0 };
}

export function MixamoCharacter({ patternKey }: { patternKey: string; highlightSide?: string }) {
  const { scene } = useGLTF(MODEL_URL);
  const instance = useMemo(() => {
    const clone = cloneSkeleton(scene) as THREE.Group;
    // The source FBX carried a baked "mixamo.com" animation clip, so the
    // glTF export's default node rotations reflect that clip's frame 0
    // rather than the true bind pose — reset every SkinnedMesh's skeleton
    // to its bind pose (derived from inverse bind matrices) before we
    // capture rest quaternions, or large-angle poses (squat, leg press)
    // come out wildly wrong.
    clone.traverse((o) => {
      const mesh = o as THREE.SkinnedMesh;
      if (mesh.isSkinnedMesh) mesh.skeleton.pose();
      // The source FBX used non-PBR Phong shading; its glTF export omitted
      // metallic/roughness factors, which glTF defaults to fully metallic —
      // with no environment map that renders as a near-black silhouette.
      // Flatten to a matte, non-metallic look appropriate for skin/clothing.
      const mat = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | undefined;
      for (const m of Array.isArray(mat) ? mat : mat ? [mat] : []) {
        if ("metalness" in m) {
          m.metalness = 0;
          m.roughness = 0.75;
        }
      }
    });
    return clone;
  }, [scene]);
  const rig = useMemo(() => buildRig(instance), [instance]);

  const barMesh = useRef<THREE.Mesh>(null);
  const cableMesh = useRef<THREE.Mesh>(null);
  const plateMesh = useRef<THREE.Mesh>(null);
  const anklePadLeft = useRef<THREE.Group>(null);
  const anklePadRight = useRef<THREE.Group>(null);

  const propKind = PROP_KIND_BY_PATTERN[patternKey] ?? "none";

  // Attach ankle pads directly as bone children once (static local offset).
  useEffect(() => {
    if (propKind !== "anklePad") return;
    const addPad = (foot: THREE.Bone | undefined, ref: RefObject<THREE.Group | null>) => {
      if (!foot || !ref.current) return;
      foot.add(ref.current);
      ref.current.position.set(0, 0.05, 0.08);
    };
    addPad(rig.leftFoot, anklePadLeft);
    addPad(rig.rightFoot, anklePadRight);
    const left = anklePadLeft.current;
    const right = anklePadRight.current;
    return () => {
      if (left?.parent) left.parent.remove(left);
      if (right?.parent) right.parent.remove(right);
    };
  }, [propKind, rig]);

  // Mutating bone transforms directly inside useFrame is the standard R3F
  // animation pattern (avoids React reconciliation at 60fps) — the linter's
  // generic immutability rule doesn't know `rig` just holds Object3D refs.
  /* eslint-disable react-hooks/immutability */
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.35;
    const pose = getPose(patternKey, t);
    const r = rig.rest;

    if (rig.hips) rig.hips.position.y = rig.hipsRestY + pose.hipsY * 0.09;
    if (rig.spine) {
      const rest = r.get(rig.spine)!;
      rig.spine.quaternion.copy(rest).multiply(q(X, pose.spineX));
    }
    if (rig.leftArm) {
      const rest = r.get(rig.leftArm)!;
      rig.leftArm.quaternion
        .copy(rest)
        .multiply(q(X, ARM_DOWN - pose.leftShoulderZ))
        .multiply(q(Z, -pose.leftShoulderX));
    }
    if (rig.rightArm) {
      const rest = r.get(rig.rightArm)!;
      rig.rightArm.quaternion
        .copy(rest)
        .multiply(q(X, ARM_DOWN - pose.rightShoulderZ))
        .multiply(q(Z, pose.rightShoulderX));
    }
    if (rig.leftForeArm) {
      const rest = r.get(rig.leftForeArm)!;
      rig.leftForeArm.quaternion.copy(rest).multiply(q(X, pose.leftElbow));
    }
    if (rig.rightForeArm) {
      const rest = r.get(rig.rightForeArm)!;
      rig.rightForeArm.quaternion.copy(rest).multiply(q(X, pose.rightElbow));
    }
    if (rig.leftUpLeg) {
      const rest = r.get(rig.leftUpLeg)!;
      rig.leftUpLeg.quaternion.copy(rest).multiply(q(X, pose.leftHipX));
    }
    if (rig.rightUpLeg) {
      const rest = r.get(rig.rightUpLeg)!;
      rig.rightUpLeg.quaternion.copy(rest).multiply(q(X, pose.rightHipX));
    }
    if (rig.leftLeg) {
      const rest = r.get(rig.leftLeg)!;
      // Knee flexion folds the shin backward, opposite sense from hip
      // flexion (which brings the thigh forward) — negate here so the two
      // compose into a natural bent-knee crouch instead of a forward kick.
      rig.leftLeg.quaternion.copy(rest).multiply(q(X, -pose.leftKnee));
    }
    if (rig.rightLeg) {
      const rest = r.get(rig.rightLeg)!;
      rig.rightLeg.quaternion.copy(rest).multiply(q(X, -pose.rightKnee));
    }

    // Tracked equipment props.
    if (propKind === "handBar" || propKind === "cableOverhead" || propKind === "cableLow") {
      if (rig.leftHand && rig.rightHand && barMesh.current) {
        const a = new THREE.Vector3();
        const b = new THREE.Vector3();
        rig.leftHand.getWorldPosition(a);
        rig.rightHand.getWorldPosition(b);
        stretchBetween(barMesh.current, a, b);
        if (cableMesh.current) {
          const mid = a.clone().add(b).multiplyScalar(0.5);
          const anchor = propKind === "cableOverhead" ? OVERHEAD_ANCHOR : LOW_ANCHOR;
          stretchBetween(cableMesh.current, mid, anchor);
        }
      }
    } else if (propKind === "footPlatform") {
      if (rig.leftFoot && rig.rightFoot && plateMesh.current) {
        const a = new THREE.Vector3();
        const b = new THREE.Vector3();
        rig.leftFoot.getWorldPosition(a);
        rig.rightFoot.getWorldPosition(b);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        plateMesh.current.position.set(mid.x, mid.y + 0.2, mid.z + 0.35);
      }
    }
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <group>
      <primitive object={instance} />
      <group ref={anklePadLeft}>{propKind === "anklePad" && <PadMesh />}</group>
      <group ref={anklePadRight}>{propKind === "anklePad" && <PadMesh />}</group>
      <PropMeshRefs barRef={barMesh} cableRef={cableMesh} plateRef={plateMesh} patternKey={patternKey} />
    </group>
  );
}

function PadMesh() {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.16, 0.06, 0.06]} />
      <meshStandardMaterial color={PAD} roughness={0.7} />
    </mesh>
  );
}

function PropMeshRefs({
  barRef,
  cableRef,
  plateRef,
  patternKey,
}: {
  barRef: RefObject<THREE.Mesh | null>;
  cableRef: RefObject<THREE.Mesh | null>;
  plateRef: RefObject<THREE.Mesh | null>;
  patternKey: string;
}) {
  const propKind = PROP_KIND_BY_PATTERN[patternKey] ?? "none";
  return (
    <>
      {(propKind === "handBar" || propKind === "cableOverhead" || propKind === "cableLow") && (
        <mesh ref={barRef} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 1, 10]} />
          <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.6} />
        </mesh>
      )}
      {(propKind === "cableOverhead" || propKind === "cableLow") && (
        <mesh ref={cableRef}>
          <cylinderGeometry args={[0.008, 0.008, 1, 6]} />
          <meshStandardMaterial color={CABLE} roughness={0.8} />
        </mesh>
      )}
      {propKind === "footPlatform" && (
        <mesh ref={plateRef} rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 0.04, 0.4]} />
          <meshStandardMaterial color={STEEL_DARK} roughness={0.5} metalness={0.4} />
        </mesh>
      )}
      {propKind === "fixedOverheadBar" && (
        <mesh position={[0, 1.98, 0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 10]} />
          <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.6} />
        </mesh>
      )}
      {propKind === "fixedParallelBars" && (
        <>
          <mesh position={[-0.28, 1.05, 0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.5, 10]} />
            <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.6} />
          </mesh>
          <mesh position={[0.28, 1.05, 0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.5, 10]} />
            <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.6} />
          </mesh>
        </>
      )}
    </>
  );
}

useGLTF.preload(MODEL_URL);
