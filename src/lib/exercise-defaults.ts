type Defaults = {
  sets: number;
  reps: number;
  restSeconds: number;
  instructions: string[];
  /** Cardio/mobility patterns are time-based, not set/rep-based. */
  fixedMinutes?: number;
};

const DEFAULTS: Record<string, Defaults> = {
  chest_press: {
    sets: 3,
    reps: 10,
    restSeconds: 75,
    instructions: [
      "Sit or lie back with feet flat on the floor.",
      "Press the handles forward/up until arms are extended, without locking your elbows.",
      "Lower slowly until you feel a stretch across your chest, then press back up.",
    ],
  },
  chest_fly: {
    sets: 3,
    reps: 12,
    restSeconds: 60,
    instructions: [
      "Sit tall with your back against the pad.",
      "With a slight bend in your elbows, bring the handles together in front of your chest.",
      "Slowly return to the start, feeling a stretch across your chest.",
    ],
  },
  shoulder_press: {
    sets: 3,
    reps: 10,
    restSeconds: 75,
    instructions: [
      "Sit with your back supported, grip the handles at shoulder height.",
      "Press straight overhead until arms are extended, without arching your back.",
      "Lower with control back to shoulder height.",
    ],
  },
  lat_pulldown: {
    sets: 3,
    reps: 10,
    restSeconds: 60,
    instructions: [
      "Grip the bar wider than shoulder-width, sit with thighs secured.",
      "Pull the bar down to your upper chest, driving your elbows down and back.",
      "Slowly let the bar rise back up until your arms are extended.",
    ],
  },
  pull_up: {
    sets: 3,
    reps: 8,
    restSeconds: 90,
    instructions: [
      "Grip the bar slightly wider than shoulder-width, hang with arms extended.",
      "Pull yourself up until your chin clears the bar.",
      "Lower back down with control until arms are fully extended.",
    ],
  },
  cable_row: {
    sets: 3,
    reps: 10,
    restSeconds: 60,
    instructions: [
      "Sit with knees slightly bent, grip the handle(s) with arms extended.",
      "Pull the handle toward your torso, squeezing your shoulder blades together.",
      "Extend your arms back out with control.",
    ],
  },
  bicep_curl: {
    sets: 3,
    reps: 12,
    restSeconds: 45,
    instructions: [
      "Stand or sit tall, elbows close to your sides.",
      "Curl the weight up toward your shoulders, keeping elbows still.",
      "Lower slowly back to the start.",
    ],
  },
  tricep_dip: {
    sets: 3,
    reps: 10,
    restSeconds: 75,
    instructions: [
      "Grip the bars with arms extended, body supported above them.",
      "Lower yourself by bending your elbows until your shoulders dip below your elbows.",
      "Press back up until your arms are extended.",
    ],
  },
  leg_press: {
    sets: 4,
    reps: 10,
    restSeconds: 90,
    instructions: [
      "Sit with feet shoulder-width apart on the platform.",
      "Lower the platform until your knees reach about 90 degrees.",
      "Press through your heels to extend your legs, without locking your knees.",
    ],
  },
  leg_curl: {
    sets: 3,
    reps: 12,
    restSeconds: 60,
    instructions: [
      "Lie face down (or sit, depending on the machine), pads against your ankles.",
      "Curl your heels toward your glutes, squeezing your hamstrings.",
      "Lower back down with control.",
    ],
  },
  squat: {
    sets: 4,
    reps: 8,
    restSeconds: 120,
    instructions: [
      "Stand with feet shoulder-width apart, bar/weight braced securely.",
      "Bend your knees and hips to lower down, keeping your chest up.",
      "Drive through your heels to stand back up.",
    ],
  },
  cardio_cycle: {
    sets: 1,
    reps: 1,
    restSeconds: 0,
    fixedMinutes: 12,
    instructions: [
      "Adjust the seat so your knee has a slight bend at full extension.",
      "Pedal at a steady pace you can hold for the full time.",
    ],
  },
  cardio_run: {
    sets: 1,
    reps: 1,
    restSeconds: 0,
    fixedMinutes: 12,
    instructions: [
      "Start at a comfortable walking pace to warm up.",
      "Build to a steady jog or run you can sustain for the full time.",
    ],
  },
  mobility_stretch: {
    sets: 1,
    reps: 1,
    restSeconds: 0,
    fixedMinutes: 6,
    instructions: [
      "Follow along at an easy, controlled pace.",
      "Breathe steadily and don't push into pain.",
    ],
  },
};

const FALLBACK: Defaults = {
  sets: 3,
  reps: 10,
  restSeconds: 60,
  instructions: ["Perform with slow, controlled form.", "Keep your core braced throughout."],
};

export function defaultsForPattern(key: string): Defaults {
  return DEFAULTS[key] ?? FALLBACK;
}
