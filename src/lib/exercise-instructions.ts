/**
 * Exercise-specific step-by-step instructions, keyed by exact exercise
 * name. Movement patterns (chest_press, cable_row, ...) are shared across
 * many unrelated exercises for scheduling/animation purposes, so falling
 * back to pattern-level instructions produced wrong, sometimes misleading
 * text — e.g. "EZ-Bar Skull Crusher" showing tricep-dip instructions.
 * This is the accurate, per-exercise source; `defaultsForPattern`'s
 * instructions remain only as a fallback for exercises not listed here
 * (custom gym-owner-added equipment).
 */
export const EXERCISE_INSTRUCTIONS: Record<string, string[]> = {
  // --- Chest ---
  "Machine Chest Fly": [
    "Sit tall with your back against the pad, handles at chest height.",
    "With a slight bend in your elbows, bring the handles together in front of your chest.",
    "Slowly return to the start, feeling a stretch across your chest.",
  ],
  "Single-Arm Machine Chest Fly": [
    "Sit tall, working one arm at a time so you can focus on a full, even squeeze.",
    "With a slight bend in your elbow, bring the handle across your body toward your other shoulder.",
    "Slowly return to the start, then complete all reps before switching arms.",
  ],
  "Cable Chest Fly": [
    "Set both pulleys to chest height, one handle in each hand, step forward for tension.",
    "With a slight bend in your elbows, sweep your hands together in front of your chest.",
    "Return with control until you feel a stretch, without letting your shoulders roll forward.",
  ],
  "Cable Crossover": [
    "Set both pulleys above shoulder height, step forward into a slight lean.",
    "With a slight bend in your elbows, pull your hands down and together in front of your hips.",
    "Return with control to the start, keeping your chest up throughout.",
  ],
  "Dumbbell Bench Press": [
    "Lie back on the bench, a dumbbell in each hand at chest level, feet flat on the floor.",
    "Press both dumbbells up until your arms are extended, without locking your elbows.",
    "Lower slowly until you feel a stretch across your chest, then press back up.",
  ],
  "Incline Dumbbell Press": [
    "Set the bench to a 30-45° incline, a dumbbell in each hand at shoulder level.",
    "Press both dumbbells up and slightly together until your arms are extended.",
    "Lower slowly back to shoulder level, keeping your elbows under your wrists.",
  ],
  "Decline Dumbbell Press": [
    "Set the bench to a slight decline, feet secured, a dumbbell in each hand at chest level.",
    "Press both dumbbells up until your arms are extended, without locking your elbows.",
    "Lower slowly back to chest level, keeping the motion controlled.",
  ],
  "Dumbbell Fly": [
    "Lie back on the bench, dumbbells pressed up above your chest, palms facing in.",
    "With a slight bend in your elbows, lower the dumbbells out to your sides until you feel a stretch.",
    "Bring the dumbbells back together above your chest in a hugging motion.",
  ],
  "Smith Machine Bench Press": [
    "Lie back on the bench under the bar, unrack it and hold it above your chest.",
    "Lower the bar with control until it lightly touches your chest.",
    "Press the bar back up until your arms are extended, without locking your elbows.",
  ],
  "Smith Machine Incline Press": [
    "Set the bench to a 30-45° incline under the bar, unrack it above your upper chest.",
    "Lower the bar with control until it lightly touches your upper chest.",
    "Press the bar back up until your arms are extended.",
  ],
  "Barbell Bench Press": [
    "Lie back on the bench, grip the bar slightly wider than shoulder-width, unrack it.",
    "Lower the bar with control until it lightly touches your mid-chest.",
    "Press the bar back up until your arms are extended, without locking your elbows.",
  ],
  "Barbell Incline Bench Press": [
    "Set the bench to a 30-45° incline, grip the bar slightly wider than shoulder-width, unrack it.",
    "Lower the bar with control until it touches your upper chest.",
    "Press the bar back up until your arms are extended.",
  ],
  "Chest Dip": [
    "Grip the bars with arms extended, lean your torso forward, body supported above them.",
    "Lower yourself with a forward lean until you feel a stretch across your chest.",
    "Press back up until your arms are extended, keeping the forward lean throughout.",
  ],

  // --- Shoulders ---
  "Dumbbell Shoulder Press": [
    "Sit or stand tall, a dumbbell in each hand at shoulder height, palms facing forward.",
    "Press both dumbbells straight overhead until your arms are extended.",
    "Lower with control back to shoulder height, without arching your back.",
  ],
  "Seated Dumbbell Shoulder Press": [
    "Sit with your back supported, a dumbbell in each hand at shoulder height.",
    "Press both dumbbells straight overhead until your arms are extended.",
    "Lower with control back to shoulder height, keeping your core braced.",
  ],
  "Dumbbell Lateral Raise": [
    "Stand tall, a dumbbell in each hand at your sides, a slight bend in your elbows.",
    "Raise both arms out to the sides until they're roughly shoulder height.",
    "Lower slowly back to your sides — resist the urge to swing the weight up.",
  ],
  "Dumbbell Front Raise": [
    "Stand tall, a dumbbell in each hand in front of your thighs.",
    "Raise one or both arms straight in front of you to shoulder height.",
    "Lower slowly back down with control, keeping your torso still.",
  ],
  "Dumbbell Shrug": [
    "Stand tall, a dumbbell in each hand at your sides, arms straight.",
    "Shrug your shoulders straight up toward your ears, without rolling them.",
    "Lower slowly back down, feeling a stretch at the bottom.",
  ],
  "Barbell Shrug": [
    "Stand tall holding the bar in front of your thighs with an overhand grip.",
    "Shrug your shoulders straight up toward your ears, without rolling them.",
    "Lower slowly back down, feeling a stretch at the bottom.",
  ],
  "Smith Machine Shoulder Press": [
    "Sit under the bar with your back supported, grip it just outside shoulder-width, unrack it.",
    "Press the bar straight up until your arms are extended.",
    "Lower with control back to shoulder height.",
  ],
  "Machine Shoulder Press": [
    "Sit down and adjust the seat so the handles line up with your shoulders.",
    "Press the handles straight up until your arms are extended, without locking your elbows.",
    "Lower with control back to the starting position.",
  ],
  "Single-Arm Machine Shoulder Press": [
    "Sit down and adjust the seat so one handle lines up with your shoulder.",
    "Press that handle straight up until your arm is extended, keeping your torso square.",
    "Lower with control, complete all reps, then switch arms.",
  ],
  "Barbell Overhead Press": [
    "Stand tall, grip the bar just outside shoulder-width, resting on your front shoulders.",
    "Press the bar straight overhead until your arms are extended, without arching your back.",
    "Lower with control back to your shoulders.",
  ],
  "Cable Face Pull": [
    "Set the pulley to upper-chest height with a rope attachment, step back for tension.",
    "Pull the rope toward your face, splitting your hands apart and squeezing your shoulder blades together.",
    "Return with control, keeping your elbows high throughout.",
  ],
  "Cable Lateral Raise": [
    "Stand side-on to a low pulley, handle in the hand farthest from the machine.",
    "Raise your arm out to the side until it's roughly shoulder height.",
    "Lower slowly with control, then repeat before switching sides.",
  ],
  "Reverse Fly (Rear Delts)": [
    "Sit facing into the machine, chest against the pad, handles in front of you.",
    "With a slight bend in your elbows, pull the handles out and back, squeezing your shoulder blades together.",
    "Return with control to the start.",
  ],
  "EZ-Bar Upright Row": [
    "Stand tall holding the bar with a shoulder-width overhand grip, in front of your thighs.",
    "Pull the bar straight up toward your chin, leading with your elbows.",
    "Lower with control back to the starting position.",
  ],

  // --- Back ---
  "Dumbbell Row": [
    "Hinge at the hips with a flat back, dumbbell hanging in one hand, other hand braced on a bench.",
    "Pull the dumbbell up toward your hip, driving your elbow back.",
    "Lower with control, then complete all reps before switching sides.",
  ],
  "Single-Arm Dumbbell Row": [
    "Place one knee and hand on the bench for support, dumbbell hanging in the other hand.",
    "Pull the dumbbell up toward your hip, driving your elbow back and keeping your back flat.",
    "Lower with control, then complete all reps before switching sides.",
  ],
  "Smith Machine Bent-Over Row": [
    "Hinge forward at the hips with a flat back, grip the bar just outside shoulder-width.",
    "Pull the bar up toward your lower ribs, driving your elbows back.",
    "Lower with control back to a full stretch.",
  ],
  "Barbell Bent-Over Row": [
    "Hinge forward at the hips with a flat back, grip the bar just outside shoulder-width.",
    "Pull the bar up toward your lower ribs, driving your elbows back and squeezing your shoulder blades.",
    "Lower with control back to a full stretch.",
  ],
  "Cable Row": [
    "Sit with knees slightly bent, grip the handle(s) with arms extended.",
    "Pull the handle toward your torso, squeezing your shoulder blades together.",
    "Extend your arms back out with control, letting your torso follow slightly forward.",
  ],
  "Wide-Grip Lat Pulldown (Bar)": [
    "Grip the bar wider than shoulder-width, sit with thighs secured.",
    "Pull the bar down to your upper chest, driving your elbows down and back.",
    "Slowly let the bar rise back up until your arms are extended.",
  ],
  "Wide-Grip Lat Pulldown": [
    "Grip the bar wider than shoulder-width, sit with thighs secured.",
    "Pull the bar down to your upper chest, driving your elbows down and back.",
    "Slowly let the bar rise back up until your arms are extended.",
  ],
  "Close-Grip Lat Pulldown (V-Bar)": [
    "Grip the V-bar attachment with palms facing each other, sit with thighs secured.",
    "Pull the handle down to your upper chest, driving your elbows down close to your body.",
    "Slowly let the handle rise back up until your arms are extended.",
  ],
  "Close-Grip Lat Pulldown": [
    "Grip the close attachment with palms facing each other, sit with thighs secured.",
    "Pull the handle down to your upper chest, driving your elbows down close to your body.",
    "Slowly let the handle rise back up until your arms are extended.",
  ],
  "Reverse-Grip Lat Pulldown": [
    "Grip the bar shoulder-width with palms facing you (underhand), sit with thighs secured.",
    "Pull the bar down to your upper chest, driving your elbows down and back.",
    "Slowly let the bar rise back up until your arms are extended.",
  ],
  "Single-Arm Lat Pulldown": [
    "Attach a single handle, sit side-on or centered with thighs secured.",
    "Pull the handle down toward your hip on one side, driving your elbow down and back.",
    "Slowly let it rise back up, complete all reps, then switch sides.",
  ],
  "Straight-Arm Pulldown": [
    "Grip a straight bar or rope with arms extended overhead, slight forward lean.",
    "Keeping your arms straight, pull the bar down in an arc until it reaches your thighs.",
    "Let it rise back up with control, without bending your elbows.",
  ],
  "Cable Straight-Arm Pulldown": [
    "Grip a straight bar attached to a high pulley, arms extended, slight forward lean.",
    "Keeping your arms straight, pull the bar down in an arc until it reaches your thighs.",
    "Let it rise back up with control, without bending your elbows.",
  ],
  "Pull-Up (Wide Grip)": [
    "Grip the bar wider than shoulder-width, hang with arms extended.",
    "Pull yourself up until your chin clears the bar.",
    "Lower back down with control until arms are fully extended.",
  ],
  "Pull-Up": [
    "Grip the bar shoulder-width or slightly wider, hang with arms extended.",
    "Pull yourself up until your chin clears the bar.",
    "Lower back down with control until arms are fully extended.",
  ],
  "Neutral-Grip Pull-Up": [
    "Grip the parallel handles (palms facing each other), hang with arms extended.",
    "Pull yourself up until your chin clears the bar.",
    "Lower back down with control until arms are fully extended.",
  ],
  "Chin-Up (Underhand)": [
    "Grip the bar shoulder-width with palms facing you, hang with arms extended.",
    "Pull yourself up until your chin clears the bar, leading with your chest.",
    "Lower back down with control until arms are fully extended.",
  ],
  "Chin-Up": [
    "Grip the bar shoulder-width with palms facing you, hang with arms extended.",
    "Pull yourself up until your chin clears the bar, leading with your chest.",
    "Lower back down with control until arms are fully extended.",
  ],

  // --- Arms: biceps ---
  "Dumbbell Bicep Curl": [
    "Stand tall, a dumbbell in each hand at your sides, elbows close to your body.",
    "Curl both dumbbells up toward your shoulders, keeping your elbows still.",
    "Lower slowly back to the start.",
  ],
  "Dumbbell Hammer Curl": [
    "Stand tall, a dumbbell in each hand with palms facing your body (neutral grip).",
    "Curl both dumbbells up toward your shoulders, keeping your palms facing in throughout.",
    "Lower slowly back to the start.",
  ],
  "Barbell Bicep Curl": [
    "Stand tall, grip the bar shoulder-width with palms facing up, elbows close to your body.",
    "Curl the bar up toward your shoulders, keeping your elbows still.",
    "Lower slowly back to the start.",
  ],
  "EZ-Bar Bicep Curl": [
    "Stand tall, grip the EZ-bar on the angled grips, elbows close to your body.",
    "Curl the bar up toward your shoulders, keeping your elbows still.",
    "Lower slowly back to the start.",
  ],
  "EZ-Bar Reverse Curl": [
    "Stand tall, grip the EZ-bar with palms facing down (overhand), elbows close to your body.",
    "Curl the bar up toward your shoulders, keeping your wrists firm and elbows still.",
    "Lower slowly back to the start.",
  ],
  "Cable Bicep Curl": [
    "Stand facing a low pulley, grip the handle with palm facing up, elbow close to your body.",
    "Curl the handle up toward your shoulder, keeping your elbow still.",
    "Lower slowly back to the start with control.",
  ],
  "Barbell Preacher Curl": [
    "Sit at the preacher bench, backs of your upper arms flat on the pad, grip the bar underhand.",
    "Curl the bar up toward your shoulders, keeping your upper arms pinned to the pad.",
    "Lower slowly until your arms are almost fully extended.",
  ],
  "Dumbbell Preacher Curl": [
    "Sit at the preacher bench, back of your upper arm flat on the pad, dumbbell in hand.",
    "Curl the dumbbell up toward your shoulder, keeping your upper arm pinned to the pad.",
    "Lower slowly, complete all reps, then switch arms.",
  ],
  "EZ-Bar Preacher Curl": [
    "Sit at the preacher bench, backs of your upper arms flat on the pad, grip the EZ-bar on the angled grips.",
    "Curl the bar up toward your shoulders, keeping your upper arms pinned to the pad.",
    "Lower slowly until your arms are almost fully extended.",
  ],
  "Preacher Curl": [
    "Sit at the preacher bench, backs of your upper arms flat on the pad, grip the bar underhand.",
    "Curl the bar up toward your shoulders, keeping your upper arms pinned to the pad.",
    "Lower slowly until your arms are almost fully extended.",
  ],

  // --- Arms: triceps ---
  "Tricep Dip": [
    "Grip the bars with arms extended, body supported above them, torso upright.",
    "Lower yourself by bending your elbows until your shoulders dip below your elbows.",
    "Press back up until your arms are extended.",
  ],
  "Dumbbell Tricep Extension": [
    "Sit or stand tall, hold one dumbbell overhead with both hands, arms extended.",
    "Lower the dumbbell behind your head by bending your elbows, keeping them pointed up.",
    "Press back up to full extension.",
  ],
  "Dumbbell Tricep Kickback": [
    "Hinge forward at the hips, upper arm parallel to the floor, elbow bent at 90°.",
    "Extend your forearm straight back until your arm is fully straight.",
    "Return with control, complete all reps, then switch arms.",
  ],
  "Cable Tricep Pushdown (Rope)": [
    "Grip the rope attachment on a high pulley, elbows tucked at your sides.",
    "Push the rope down until your arms are fully extended, splitting the ends apart at the bottom.",
    "Let it rise back up with control, keeping your elbows still.",
  ],
  "Cable Tricep Pushdown": [
    "Grip the attachment on a high pulley, elbows tucked at your sides.",
    "Push down until your arms are fully extended.",
    "Let it rise back up with control, keeping your elbows still.",
  ],
  "Cable Overhead Tricep Extension (Rope)": [
    "Face away from a low pulley, rope overhead, elbows pointed forward.",
    "Extend your arms until they're straight overhead, keeping your elbows still.",
    "Lower back down with control, feeling a stretch in your triceps.",
  ],
  "EZ-Bar Skull Crusher": [
    "Lie back on a bench, grip the EZ-bar with arms extended straight above your chest.",
    "Bend your elbows to lower the bar toward your forehead, keeping your upper arms still.",
    "Extend your arms back up, without flaring your elbows out.",
  ],

  // --- Legs ---
  "Barbell Back Squat": [
    "Rest the bar across your upper back, feet shoulder-width apart.",
    "Bend your knees and hips to lower down until your thighs are about parallel to the floor.",
    "Drive through your heels to stand back up, keeping your chest up.",
  ],
  "Barbell Front Squat": [
    "Rest the bar across your front shoulders, elbows up, feet shoulder-width apart.",
    "Bend your knees and hips to lower down, keeping your torso as upright as possible.",
    "Drive through your heels to stand back up.",
  ],
  "Smith Machine Squat": [
    "Position the bar across your upper back, feet slightly forward of the bar.",
    "Bend your knees and hips to lower down until your thighs are about parallel to the floor.",
    "Drive through your heels to stand back up.",
  ],
  "Pin Squat": [
    "Set the safety pins at your bottom squat depth, bar across your upper back.",
    "Squat down under control until the bar settles on the pins, pausing fully.",
    "Drive through your heels to stand back up from a dead stop, without bouncing.",
  ],
  "Goblet Squat": [
    "Hold a dumbbell vertically against your chest, feet shoulder-width apart.",
    "Bend your knees and hips to lower into a squat, keeping your chest up and elbows inside your knees.",
    "Drive through your heels to stand back up.",
  ],
  "Bulgarian Split Squat": [
    "Stand a couple of feet in front of a bench, rest one foot behind you on it.",
    "Bend your front knee to lower straight down until your back knee nearly touches the floor.",
    "Drive through your front heel to stand back up, complete all reps, then switch legs.",
  ],
  "Dumbbell Walking Lunge": [
    "Stand tall holding a dumbbell in each hand at your sides.",
    "Step forward into a lunge, bending both knees until your back knee nearly touches the floor.",
    "Drive through your front heel to step through into the next lunge, alternating legs.",
  ],
  "Dumbbell Step-Up": [
    "Stand facing a bench or box, a dumbbell in each hand, one foot planted on top.",
    "Drive through that foot to step up until you're standing tall on the platform.",
    "Step back down with control, complete all reps, then switch legs.",
  ],
  "Step-Ups": [
    "Stand facing a bench or box, one foot planted on top.",
    "Drive through that foot to step up until you're standing tall on the platform.",
    "Step back down with control, complete all reps, then switch legs.",
  ],
  "Smith Machine Lunge": [
    "Position the bar across your upper back, one foot forward and one back.",
    "Bend both knees to lower straight down until your back knee nearly touches the floor.",
    "Drive through your front heel to stand back up, complete all reps, then switch legs.",
  ],
  "Smith Machine Calf Raise": [
    "Position the bar across your upper back, balls of your feet on a raised platform.",
    "Rise up onto your toes as high as you can, squeezing your calves.",
    "Lower back down until you feel a stretch in your calves.",
  ],
  "Barbell Deadlift": [
    "Stand with feet hip-width apart, bar close to your shins, back flat.",
    "Push your hips back and grip the bar, chest up.",
    "Drive through your heels, keeping the bar close, to stand tall — then hinge back down with control.",
  ],
  "Barbell Romanian Deadlift": [
    "Stand tall holding the bar at hip height, feet hip-width apart.",
    "Push your hips straight back, lowering the bar down your thighs with a slight knee bend.",
    "Drive your hips forward to stand back up, feeling your hamstrings work.",
  ],
  "Dumbbell Romanian Deadlift": [
    "Stand tall holding a dumbbell in each hand in front of your thighs.",
    "Push your hips straight back, lowering the dumbbells down your legs with a slight knee bend.",
    "Drive your hips forward to stand back up, feeling your hamstrings work.",
  ],
  "Smith Machine Romanian Deadlift": [
    "Stand tall holding the bar at hip height, feet hip-width apart.",
    "Push your hips straight back, lowering the bar down your thighs with a slight knee bend.",
    "Drive your hips forward to stand back up, feeling your hamstrings work.",
  ],
  "Barbell Hip Thrust": [
    "Sit on the floor with your upper back against a bench, bar over your hips, knees bent.",
    "Drive through your heels to raise your hips up until your body forms a straight line.",
    "Squeeze your glutes at the top, then lower with control.",
  ],
  "Rack Pull (Partial Deadlift)": [
    "Set the bar on pins just below knee height, stand with feet hip-width apart.",
    "Grip the bar, chest up, and drive through your heels to stand fully tall.",
    "Lower the bar back to the pins with control — a shorter range than a full deadlift.",
  ],
  "Leg Press": [
    "Sit with feet shoulder-width apart on the platform.",
    "Lower the platform until your knees reach about 90 degrees.",
    "Press through your heels to extend your legs, without locking your knees.",
  ],
  "Single-Leg Press": [
    "Sit with one foot centered on the platform, other foot resting to the side.",
    "Lower the platform until your knee reaches about 90 degrees.",
    "Press through your heel to extend your leg, complete all reps, then switch legs.",
  ],
  "Calf Press (on Leg Press)": [
    "Sit on the leg press, balls of your feet on the bottom edge of the platform, legs extended.",
    "Press through the balls of your feet to point your toes away, squeezing your calves.",
    "Let your heels drop back toward you until you feel a stretch.",
  ],
  "Leg Extension": [
    "Sit with the pad resting on top of your ankles, back against the seat.",
    "Extend your legs until straight, squeezing your quads at the top.",
    "Lower back down with control, without letting the weight stack slam.",
  ],
  "Seated Leg Curl": [
    "Sit with the pad against the back of your lower legs, legs extended.",
    "Curl your heels down and back underneath the seat, squeezing your hamstrings.",
    "Return with control until your legs are extended again.",
  ],
  "Lying Leg Curl": [
    "Lie face down, pad against the back of your ankles, legs extended.",
    "Curl your heels up toward your glutes, squeezing your hamstrings.",
    "Lower back down with control until your legs are extended again.",
  ],
  "Cable Glute Kickback": [
    "Attach an ankle cuff to a low pulley, face the machine, hands on the frame for support.",
    "Kick one leg straight back and up, squeezing your glute at the top.",
    "Return with control, complete all reps, then switch legs.",
  ],

  // --- Core ---
  "Hanging Knee Raise": [
    "Hang from the bar with arms extended, legs straight down.",
    "Raise your knees up toward your chest, curling your pelvis slightly.",
    "Lower back down with control, without swinging.",
  ],
  "Hanging Leg Raise": [
    "Hang from the bar with arms extended, legs straight down.",
    "Keeping your legs straight, raise them up until they're roughly parallel to the floor.",
    "Lower back down with control, without swinging.",
  ],
  "Captain's Chair Knee Raise": [
    "Support yourself on the forearm pads, back against the pad, legs hanging.",
    "Raise your knees up toward your chest, curling your pelvis slightly.",
    "Lower back down with control, without swinging.",
  ],
  "Cable Woodchopper": [
    "Set the pulley high, stand side-on, both hands on the handle.",
    "Rotate your torso to pull the handle diagonally down and across your body.",
    "Return with control to the start, then complete all reps before switching sides.",
  ],
  "Cable Pallof Press": [
    "Stand side-on to a pulley set at chest height, handle held at your chest with both hands.",
    "Press the handle straight out in front of you, resisting the pull rotating your torso.",
    "Bring it back to your chest with control, then complete all reps before switching sides.",
  ],

  // --- Cardio & guided ---
  "Steady-State Cycling": [
    "Adjust the seat so your knee has a slight bend at full extension.",
    "Pedal at a steady pace you can hold for the full time.",
  ],
  "Cycling Intervals (HIIT)": [
    "Adjust the seat so your knee has a slight bend at full extension.",
    "Alternate short bursts of hard pedaling with easier recovery pedaling.",
  ],
  "Steady-State Jog": [
    "Start at a comfortable walking pace to warm up.",
    "Build to a steady jog you can sustain for the full time.",
  ],
  "Incline Walk": [
    "Set the treadmill to a moderate incline.",
    "Walk at a brisk, sustainable pace, using the incline instead of speed for intensity.",
  ],
  "Sprint Intervals": [
    "Warm up with a few minutes of easy jogging.",
    "Alternate short, all-out sprints with longer walking or light-jog recoveries.",
  ],
  "Guided Mobility & Stretch": [
    "Follow along with the mirror's guided stretch routine at an easy, controlled pace.",
    "Breathe steadily and don't push into pain.",
  ],
  "Guided Cardio Class": [
    "Follow along with the mirror's guided cardio class at your own pace.",
    "Keep moving for the full duration, easing off if you need to catch your breath.",
  ],
  "Guided Strength Circuit": [
    "Follow along with the mirror's guided bodyweight circuit.",
    "Move through each exercise with controlled form rather than rushing the reps.",
  ],
};
