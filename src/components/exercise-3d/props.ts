import * as THREE from "three";

export type PropKind =
  | "handBar"
  | "handles"
  | "cableOverhead"
  | "cableLow"
  | "fixedOverheadBar"
  | "fixedParallelBars"
  | "shoulderBar"
  | "anklePad"
  | "footPlatform"
  | "none";

export const PROP_KIND_BY_PATTERN: Record<string, PropKind> = {
  chest_press: "handBar",
  chest_fly: "handles",
  shoulder_press: "handBar",
  lat_pulldown: "cableOverhead",
  pull_up: "fixedOverheadBar",
  cable_row: "cableLow",
  bicep_curl: "handBar",
  tricep_dip: "fixedParallelBars",
  leg_press: "footPlatform",
  leg_curl: "anklePad",
  leg_extension: "anklePad",
  squat: "shoulderBar",
  deadlift: "handBar",
  cardio_cycle: "none",
  cardio_run: "none",
  mobility_stretch: "none",
};

export const OVERHEAD_ANCHOR = new THREE.Vector3(0, 2.55, -0.1);
export const LOW_ANCHOR = new THREE.Vector3(0, 0.22, 1.05);

/** Points a unit-height cylinder/box from `a` to `b`, scaling and rotating it to span the gap. */
export function stretchBetween(mesh: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mesh.position.copy(mid);
  const dir = b.clone().sub(a);
  const length = Math.max(dir.length(), 0.001);
  mesh.scale.set(1, length, 1);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
}
