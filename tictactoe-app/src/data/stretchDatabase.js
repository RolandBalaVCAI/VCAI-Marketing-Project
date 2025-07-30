export const stretchDatabase = [
  // LEGS & FEET
  {
    id: 'forward_fold',
    name: 'Standing Forward Fold',
    bodyArea: 'legs',
    muscleGroups: ['hamstrings', 'calves', 'lower_back'],
    duration: 30,
    difficulty: 'beginner',
    instructions: [
      'Stand with feet hip-width apart',
      'Slowly bend forward from your hips',
      'Let arms hang down naturally',
      'Relax your neck and shoulders',
      'Hold and breathe deeply'
    ],
    benefits: ['Improves hamstring flexibility', 'Relieves lower back tension', 'Calms the mind'],
    warnings: ['Keep slight bend in knees if needed', 'Rise slowly to avoid dizziness'],
    goals: ['touch_toes', 'better_posture', 'reduce_back_pain']
  },
  {
    id: 'quad_stretch',
    name: 'Standing Quad Stretch',
    bodyArea: 'legs',
    muscleGroups: ['quadriceps', 'hip_flexors'],
    duration: 30,
    difficulty: 'beginner',
    instructions: [
      'Stand tall, use wall for balance if needed',
      'Bend right knee, grab ankle with right hand',
      'Pull heel toward glutes',
      'Keep knees together',
      'Switch sides after 30 seconds'
    ],
    benefits: ['Improves quad flexibility', 'Helps knee health', 'Balances leg muscles'],
    warnings: ['Avoid if knee pain present', 'Keep standing knee slightly bent'],
    goals: ['athletic_performance', 'reduce_knee_pain']
  },
  {
    id: 'calf_stretch',
    name: 'Wall Calf Stretch',
    bodyArea: 'legs',
    muscleGroups: ['calves', 'achilles'],
    duration: 30,
    difficulty: 'beginner',
    instructions: [
      'Face wall, hands flat against it',
      'Step right foot back',
      'Press heel to ground',
      'Lean forward slightly',
      'Switch legs after 30 seconds'
    ],
    benefits: ['Prevents calf cramps', 'Improves ankle mobility', 'Helps with walking/running'],
    warnings: ['Start gently if tight calves'],
    goals: ['athletic_performance', 'prevent_injury']
  },
  {
    id: 'butterfly_stretch',
    name: 'Butterfly Hip Stretch',
    bodyArea: 'legs',
    muscleGroups: ['hip_flexors', 'inner_thighs', 'groin'],
    duration: 45,
    difficulty: 'beginner',
    instructions: [
      'Sit with soles of feet together',
      'Let knees fall to sides',
      'Hold feet with hands',
      'Gently press knees down with elbows',
      'Keep back straight'
    ],
    benefits: ['Opens hips', 'Improves groin flexibility', 'Helps with sitting posture'],
    warnings: ['Don\'t force knees down', 'Stop if sharp pain'],
    goals: ['better_posture', 'hip_mobility']
  },
  {
    id: 'ankle_circles',
    name: 'Ankle Mobility Circles',
    bodyArea: 'legs',
    muscleGroups: ['ankles', 'feet'],
    duration: 20,
    difficulty: 'beginner',
    instructions: [
      'Sit or stand comfortably',
      'Lift right foot slightly',
      'Draw circles with your toes',
      '10 circles clockwise',
      '10 circles counter-clockwise, then switch'
    ],
    benefits: ['Improves ankle mobility', 'Prevents ankle injuries', 'Helps balance'],
    warnings: ['Move slowly and controlled'],
    goals: ['prevent_injury', 'athletic_performance']
  },

  // ARMS & SHOULDERS
  {
    id: 'shoulder_rolls',
    name: 'Shoulder Rolls',
    bodyArea: 'shoulders',
    muscleGroups: ['shoulders', 'upper_back'],
    duration: 30,
    difficulty: 'beginner',
    instructions: [
      'Stand or sit tall',
      'Roll shoulders up, back, and down',
      'Complete 10 rolls backward',
      'Then 10 rolls forward',
      'Move slowly and smoothly'
    ],
    benefits: ['Relieves shoulder tension', 'Improves posture', 'Reduces stress'],
    warnings: ['Avoid if shoulder injury present'],
    goals: ['better_posture', 'reduce_shoulder_pain']
  },
  {
    id: 'cross_body_shoulder',
    name: 'Cross-Body Shoulder Stretch',
    bodyArea: 'shoulders',
    muscleGroups: ['shoulders', 'upper_arms'],
    duration: 30,
    difficulty: 'beginner',
    instructions: [
      'Bring right arm across chest',
      'Use left hand to pull arm closer',
      'Keep shoulder down',
      'Feel stretch in shoulder',
      'Switch arms after 30 seconds'
    ],
    benefits: ['Improves shoulder flexibility', 'Reduces tension', 'Helps with reaching'],
    warnings: ['Don\'t pull too hard'],
    goals: ['better_posture', 'reduce_shoulder_pain']
  },
  {
    id: 'tricep_stretch',
    name: 'Overhead Tricep Stretch',
    bodyArea: 'arms',
    muscleGroups: ['triceps', 'shoulders'],
    duration: 30,
    difficulty: 'beginner',
    instructions: [
      'Raise right arm overhead',
      'Bend elbow, hand behind head',
      'Use left hand to gently push elbow',
      'Feel stretch in tricep',
      'Switch arms after 30 seconds'
    ],
    benefits: ['Improves arm flexibility', 'Helps with overhead movements'],
    warnings: ['Keep movements gentle'],
    goals: ['upper_body_flexibility']
  },
  {
    id: 'wrist_circles',
    name: 'Wrist Mobility Circles',
    bodyArea: 'arms',
    muscleGroups: ['wrists', 'forearms'],
    duration: 20,
    difficulty: 'beginner',
    instructions: [
      'Extend arms in front',
      'Make fists with hands',
      'Circle wrists 10 times clockwise',
      'Then 10 times counter-clockwise',
      'Keep arms still'
    ],
    benefits: ['Prevents carpal tunnel', 'Improves wrist mobility', 'Good for desk workers'],
    warnings: ['Stop if pain occurs'],
    goals: ['prevent_injury', 'desk_worker_health']
  },
  {
    id: 'chest_doorway',
    name: 'Doorway Chest Stretch',
    bodyArea: 'chest',
    muscleGroups: ['chest', 'front_shoulders'],
    duration: 30,
    difficulty: 'beginner',
    instructions: [
      'Stand in doorway',
      'Place forearms on door frame',
      'Step forward slowly',
      'Feel stretch across chest',
      'Hold and breathe'
    ],
    benefits: ['Opens chest', 'Counters forward posture', 'Improves breathing'],
    warnings: ['Don\'t overstretch'],
    goals: ['better_posture', 'reduce_shoulder_pain']
  },

  // NECK
  {
    id: 'neck_rolls',
    name: 'Gentle Neck Rolls',
    bodyArea: 'neck',
    muscleGroups: ['neck', 'upper_traps'],
    duration: 30,
    difficulty: 'beginner',
    instructions: [
      'Sit or stand tall',
      'Slowly roll head to right',
      'Roll back, then to left',
      'Complete half circle',
      'Reverse direction'
    ],
    benefits: ['Relieves neck tension', 'Improves range of motion', 'Reduces headaches'],
    warnings: ['Move very slowly', 'Skip full back roll'],
    goals: ['reduce_neck_pain', 'better_posture']
  },
  {
    id: 'neck_side_stretch',
    name: 'Side Neck Stretch',
    bodyArea: 'neck',
    muscleGroups: ['neck', 'upper_traps'],
    duration: 30,
    difficulty: 'beginner',
    instructions: [
      'Sit tall, shoulders relaxed',
      'Tilt head to right side',
      'Bring right ear toward shoulder',
      'Use hand for gentle pressure',
      'Switch sides after 30 seconds'
    ],
    benefits: ['Stretches neck sides', 'Relieves tension', 'Helps with tech neck'],
    warnings: ['Be very gentle'],
    goals: ['reduce_neck_pain', 'desk_worker_health']
  },
  {
    id: 'chin_tucks',
    name: 'Chin Tucks',
    bodyArea: 'neck',
    muscleGroups: ['neck', 'upper_back'],
    duration: 20,
    difficulty: 'beginner',
    instructions: [
      'Sit or stand tall',
      'Pull chin straight back',
      'Like making double chin',
      'Hold for 5 seconds',
      'Repeat 5 times'
    ],
    benefits: ['Strengthens neck', 'Improves posture', 'Reduces forward head'],
    warnings: ['Don\'t tilt head up or down'],
    goals: ['better_posture', 'reduce_neck_pain']
  },

  // BACK & CORE
  {
    id: 'cat_cow',
    name: 'Cat-Cow Stretch',
    bodyArea: 'back',
    muscleGroups: ['spine', 'core', 'back'],
    duration: 45,
    difficulty: 'beginner',
    instructions: [
      'Start on hands and knees',
      'Arch back up like cat',
      'Then lower belly, lift chest',
      'Flow between positions',
      'Move with breath'
    ],
    benefits: ['Mobilizes spine', 'Relieves back tension', 'Improves flexibility'],
    warnings: ['Keep movements controlled'],
    goals: ['reduce_back_pain', 'better_posture']
  },
  {
    id: 'childs_pose',
    name: 'Child\'s Pose',
    bodyArea: 'back',
    muscleGroups: ['lower_back', 'hips', 'shoulders'],
    duration: 60,
    difficulty: 'beginner',
    instructions: [
      'Kneel on floor',
      'Sit back on heels',
      'Fold forward, arms extended',
      'Rest forehead on ground',
      'Breathe deeply'
    ],
    benefits: ['Relaxes back', 'Calms mind', 'Stretches hips'],
    warnings: ['Use pillow under knees if needed'],
    goals: ['reduce_back_pain', 'stress_relief']
  },
  {
    id: 'spinal_twist',
    name: 'Seated Spinal Twist',
    bodyArea: 'back',
    muscleGroups: ['spine', 'obliques', 'back'],
    duration: 30,
    difficulty: 'beginner',
    instructions: [
      'Sit tall, legs extended',
      'Cross right leg over left',
      'Twist torso to right',
      'Use left arm against knee',
      'Switch sides after 30 seconds'
    ],
    benefits: ['Improves spine mobility', 'Aids digestion', 'Relieves back tension'],
    warnings: ['Twist from core, not neck'],
    goals: ['reduce_back_pain', 'better_posture']
  },
  {
    id: 'cobra_stretch',
    name: 'Cobra Stretch',
    bodyArea: 'back',
    muscleGroups: ['lower_back', 'abs', 'chest'],
    duration: 30,
    difficulty: 'intermediate',
    instructions: [
      'Lie face down',
      'Place hands under shoulders',
      'Press up, straightening arms',
      'Keep hips on ground',
      'Look forward or slightly up'
    ],
    benefits: ['Strengthens back', 'Opens chest', 'Improves posture'],
    warnings: ['Don\'t force if back pain'],
    goals: ['better_posture', 'reduce_back_pain']
  },

  // FULL BODY
  {
    id: 'standing_side_stretch',
    name: 'Standing Side Stretch',
    bodyArea: 'full_body',
    muscleGroups: ['obliques', 'lats', 'shoulders'],
    duration: 30,
    difficulty: 'beginner',
    instructions: [
      'Stand tall, feet hip-width',
      'Raise right arm overhead',
      'Lean to left side',
      'Feel stretch along right side',
      'Switch sides after 30 seconds'
    ],
    benefits: ['Lengthens side body', 'Improves flexibility', 'Aids breathing'],
    warnings: ['Keep hips square'],
    goals: ['better_posture', 'full_body_flexibility']
  },
  {
    id: 'figure_four_hip',
    name: 'Figure 4 Hip Stretch',
    bodyArea: 'legs',
    muscleGroups: ['hips', 'glutes', 'lower_back'],
    duration: 45,
    difficulty: 'intermediate',
    instructions: [
      'Lie on back',
      'Cross right ankle over left knee',
      'Pull left thigh toward chest',
      'Feel stretch in right hip',
      'Switch sides after 45 seconds'
    ],
    benefits: ['Opens hips', 'Relieves sciatic pain', 'Improves hip mobility'],
    warnings: ['Keep back flat on ground'],
    goals: ['hip_mobility', 'reduce_back_pain']
  },
  {
    id: 'pigeon_pose',
    name: 'Pigeon Pose',
    bodyArea: 'legs',
    muscleGroups: ['hips', 'glutes', 'hip_flexors'],
    duration: 60,
    difficulty: 'intermediate',
    instructions: [
      'Start in downward dog',
      'Bring right knee forward',
      'Lower hips to ground',
      'Extend left leg back',
      'Hold, then switch sides'
    ],
    benefits: ['Deep hip opener', 'Releases tension', 'Improves flexibility'],
    warnings: ['Use props if needed', 'Skip if knee pain'],
    goals: ['hip_mobility', 'advanced_flexibility']
  }
]

export const goalTemplates = {
  touch_toes: {
    id: 'touch_toes',
    name: 'Touch Your Toes in 30 Days',
    description: 'Improve hamstring and back flexibility to touch your toes',
    focusAreas: ['hamstrings', 'lower_back', 'calves'],
    keyStretches: ['forward_fold', 'pike_stretch', 'seated_forward_bend'],
    milestones: [
      { day: 7, target: 'Reach mid-shin comfortably' },
      { day: 14, target: 'Touch ankles with fingertips' },
      { day: 21, target: 'Graze toes with fingertips' },
      { day: 30, target: 'Touch toes with full palm on floor' }
    ]
  },
  better_posture: {
    id: 'better_posture',
    name: 'Perfect Posture in 21 Days',
    description: 'Improve spinal alignment and reduce slouching',
    focusAreas: ['chest', 'shoulders', 'upper_back', 'neck'],
    keyStretches: ['chest_doorway', 'cat_cow', 'shoulder_rolls', 'chin_tucks'],
    milestones: [
      { day: 7, target: 'Increased awareness of posture' },
      { day: 14, target: 'Less shoulder/neck tension' },
      { day: 21, target: 'Natural upright posture maintained' }
    ]
  },
  reduce_back_pain: {
    id: 'reduce_back_pain',
    name: 'Back Pain Relief Program',
    description: 'Gentle stretches to reduce back pain and improve mobility',
    focusAreas: ['lower_back', 'hips', 'core', 'hamstrings'],
    keyStretches: ['cat_cow', 'childs_pose', 'figure_four_hip', 'forward_fold'],
    milestones: [
      { day: 7, target: 'Reduced morning stiffness' },
      { day: 14, target: 'Improved range of motion' },
      { day: 21, target: 'Significant pain reduction' },
      { day: 30, target: 'Pain-free daily activities' }
    ]
  },
  hip_mobility: {
    id: 'hip_mobility',
    name: 'Hip Opening Journey',
    description: 'Increase hip flexibility and range of motion',
    focusAreas: ['hips', 'hip_flexors', 'glutes', 'groin'],
    keyStretches: ['butterfly_stretch', 'pigeon_pose', 'figure_four_hip'],
    milestones: [
      { day: 14, target: 'Deeper butterfly stretch' },
      { day: 30, target: 'Comfortable pigeon pose' },
      { day: 45, target: 'Full lotus position' }
    ]
  },
  athletic_performance: {
    id: 'athletic_performance',
    name: 'Athletic Flexibility Program',
    description: 'Improve performance and prevent injuries',
    focusAreas: ['full_body'],
    keyStretches: ['quad_stretch', 'calf_stretch', 'shoulder_rolls', 'spinal_twist'],
    milestones: [
      { day: 14, target: 'Increased range of motion' },
      { day: 30, target: 'Better recovery time' },
      { day: 45, target: 'Enhanced performance metrics' }
    ]
  }
}

export const getStretchesByBodyArea = (area) => {
  return stretchDatabase.filter(stretch => stretch.bodyArea === area)
}

export const getStretchesByGoal = (goalId) => {
  return stretchDatabase.filter(stretch => 
    stretch.goals && stretch.goals.includes(goalId)
  )
}

export const getStretchesByDifficulty = (difficulty) => {
  return stretchDatabase.filter(stretch => stretch.difficulty === difficulty)
}

export const getBeginnerRoutine = () => {
  return stretchDatabase.filter(stretch => stretch.difficulty === 'beginner')
}