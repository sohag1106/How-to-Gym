export type Pose = {
  spineX: number;
  hipsY: number;
  leftShoulderX: number;
  leftShoulderZ: number;
  rightShoulderX: number;
  rightShoulderZ: number;
  leftElbow: number;
  rightElbow: number;
  leftHipX: number;
  rightHipX: number;
  leftKnee: number;
  rightKnee: number;
};

const NEUTRAL: Pose = {
  spineX: 0,
  hipsY: 0,
  leftShoulderX: 0,
  leftShoulderZ: 0.15,
  rightShoulderX: 0,
  rightShoulderZ: -0.15,
  leftElbow: 0.1,
  rightElbow: 0.1,
  leftHipX: 0,
  rightHipX: 0,
  leftKnee: 0.1,
  rightKnee: 0.1,
};

const osc = (t: number, freq = 1, phase = 0) => Math.sin((t * freq + phase) * Math.PI * 2);
/** 0..1 ping-pong, eases both ends */
const pp = (t: number, freq = 1, phase = 0) => (osc(t, freq, phase) + 1) / 2;

type PoseFn = (t: number) => Pose;

const POSES: Record<string, PoseFn> = {
  chest_press: (t) => {
    const k = pp(t);
    return { ...NEUTRAL, leftShoulderX: -1.1 * k, rightShoulderX: -1.1 * k, leftShoulderZ: 0.9, rightShoulderZ: -0.9, leftElbow: 1.6 - 1.5 * k, rightElbow: 1.6 - 1.5 * k };
  },
  chest_fly: (t) => {
    const k = pp(t);
    return { ...NEUTRAL, leftShoulderZ: 0.2 + 1.1 * k, rightShoulderZ: -0.2 - 1.1 * k, leftShoulderX: -0.3, rightShoulderX: -0.3, leftElbow: 0.4, rightElbow: 0.4 };
  },
  shoulder_press: (t) => {
    const k = pp(t);
    return { ...NEUTRAL, leftShoulderX: -1.9 * k, rightShoulderX: -1.9 * k, leftShoulderZ: 0.5, rightShoulderZ: -0.5, leftElbow: 1.7 - 1.6 * k, rightElbow: 1.7 - 1.6 * k };
  },
  lat_pulldown: (t) => {
    const k = pp(t);
    return { ...NEUTRAL, spineX: -0.1, leftShoulderX: -1.6 + 1.2 * k, rightShoulderX: -1.6 + 1.2 * k, leftShoulderZ: 0.6, rightShoulderZ: -0.6, leftElbow: 0.3 + 1.1 * k, rightElbow: 0.3 + 1.1 * k };
  },
  pull_up: (t) => {
    const k = pp(t, 0.8);
    return { ...NEUTRAL, hipsY: 0.35 * k, leftShoulderX: -1.7, rightShoulderX: -1.7, leftShoulderZ: 0.7, rightShoulderZ: -0.7, leftElbow: 0.2 + 1.3 * k, rightElbow: 0.2 + 1.3 * k };
  },
  cable_row: (t) => {
    const k = pp(t);
    return { ...NEUTRAL, spineX: 0.35, leftShoulderX: -0.4 - 0.3 * k, rightShoulderX: -0.4 - 0.3 * k, leftShoulderZ: 0.25, rightShoulderZ: -0.25, leftElbow: 1.5 - 1.2 * k, rightElbow: 1.5 - 1.2 * k, leftKnee: 0.5, rightKnee: 0.5 };
  },
  bicep_curl: (t) => {
    const k = pp(t);
    return { ...NEUTRAL, leftShoulderX: -0.15, rightShoulderX: -0.15, leftShoulderZ: 0.2, rightShoulderZ: -0.2, leftElbow: 0.2 + 1.9 * k, rightElbow: 0.2 + 1.9 * k };
  },
  tricep_dip: (t) => {
    const k = pp(t, 0.9);
    return { ...NEUTRAL, hipsY: -0.25 * k, spineX: 0.1, leftShoulderX: -0.3, rightShoulderX: -0.3, leftShoulderZ: 0.35, rightShoulderZ: -0.35, leftElbow: 0.2 + 1.4 * k, rightElbow: 0.2 + 1.4 * k };
  },
  leg_press: (t) => {
    const k = pp(t, 0.7);
    return { ...NEUTRAL, spineX: 0.15, leftHipX: 1.3 * k, rightHipX: 1.3 * k, leftKnee: 1.5 * k, rightKnee: 1.5 * k, leftShoulderZ: 0.15, rightShoulderZ: -0.15, leftElbow: 0.3, rightElbow: 0.3 };
  },
  leg_curl: (t) => {
    const k = pp(t);
    return { ...NEUTRAL, spineX: 0.5, leftKnee: 1.7 * k, rightKnee: 1.7 * k, leftShoulderX: -0.4, rightShoulderX: -0.4 };
  },
  leg_extension: (t) => {
    const k = pp(t);
    return { ...NEUTRAL, leftHipX: 1.3, rightHipX: 1.3, leftKnee: 1.5 - 1.4 * k, rightKnee: 1.5 - 1.4 * k, leftShoulderX: -0.2, rightShoulderX: -0.2, leftShoulderZ: 0.1, rightShoulderZ: -0.1, leftElbow: 0.3, rightElbow: 0.3 };
  },
  squat: (t) => {
    const k = pp(t, 0.6);
    return { ...NEUTRAL, spineX: 0.25 * k, hipsY: -0.4 * k, leftHipX: 1.1 * k, rightHipX: 1.1 * k, leftKnee: 1.3 * k, rightKnee: 1.3 * k, leftShoulderX: -1.5, rightShoulderX: -1.5, leftShoulderZ: 0.35, rightShoulderZ: -0.35, leftElbow: 1.55, rightElbow: 1.55 };
  },
  deadlift: (t) => {
    const k = pp(t, 0.55);
    return { ...NEUTRAL, spineX: 0.95 * k, hipsY: -0.12 * k, leftHipX: 0.55 * k, rightHipX: 0.55 * k, leftKnee: 0.35 * k, rightKnee: 0.35 * k, leftShoulderX: -0.1, rightShoulderX: -0.1, leftShoulderZ: 0.05, rightShoulderZ: -0.05, leftElbow: 0.08, rightElbow: 0.08 };
  },
  cardio_cycle: (t) => {
    const kL = pp(t, 1.6);
    const kR = pp(t, 1.6, 0.5);
    return { ...NEUTRAL, spineX: 0.45, leftHipX: 1.2 * kL, rightHipX: 1.2 * kR, leftKnee: 1.6 * kL, rightKnee: 1.6 * kR, leftShoulderX: -0.7, rightShoulderX: -0.7, leftShoulderZ: 0.3, rightShoulderZ: -0.3, leftElbow: 1.2, rightElbow: 1.2 };
  },
  cardio_run: (t) => {
    const kL = pp(t, 2.2);
    const kR = pp(t, 2.2, 0.5);
    return {
      ...NEUTRAL,
      hipsY: 0.12 * Math.abs(osc(t, 4.4)),
      leftHipX: 0.9 * (kL - 0.5),
      rightHipX: 0.9 * (kR - 0.5),
      leftKnee: 1.4 * kL,
      rightKnee: 1.4 * kR,
      leftShoulderX: 0.8 * (kR - 0.5),
      rightShoulderX: 0.8 * (kL - 0.5),
      leftShoulderZ: 0.15,
      rightShoulderZ: -0.15,
      leftElbow: 1.3,
      rightElbow: 1.3,
    };
  },
  mobility_stretch: (t) => {
    const k = pp(t, 0.4);
    return { ...NEUTRAL, spineX: -0.3 * k, leftShoulderX: -1.9 * k, rightShoulderX: -1.9 * k, leftShoulderZ: 0.5, rightShoulderZ: -0.5, leftElbow: 0.15, rightElbow: 0.15 };
  },
};

export function getPose(patternKey: string, t: number): Pose {
  const fn = POSES[patternKey];
  return fn ? fn(((t % 1) + 1) % 1) : NEUTRAL;
}
