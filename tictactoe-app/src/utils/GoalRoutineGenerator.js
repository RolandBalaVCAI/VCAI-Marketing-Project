import { stretchDatabase, goalTemplates, getStretchesByGoal } from '../data/stretchDatabase'

export class GoalRoutineGenerator {
  constructor(userProfile) {
    this.userProfile = userProfile
    this.maxDuration = 15 * 60 // 15 minutes in seconds
  }

  generateDailyRoutine(dayOfWeek, weekNumber = 1) {
    const schedule = this.getWeeklySchedule()
    const todayFocus = schedule[dayOfWeek]
    
    if (todayFocus.isRest) {
      return null
    }

    let routine = []
    let totalDuration = 0

    // Always start with warm-up
    const warmupStretches = this.getWarmupStretches()
    warmupStretches.forEach(stretch => {
      if (totalDuration + stretch.duration <= this.maxDuration) {
        routine.push(stretch)
        totalDuration += stretch.duration
      }
    })

    // Add goal-specific stretches
    if (this.userProfile.primaryGoal) {
      const goalStretches = this.getGoalSpecificStretches(todayFocus.focus)
      goalStretches.forEach(stretch => {
        if (totalDuration + stretch.duration <= this.maxDuration - 60) { // Leave room for cool-down
          routine.push(stretch)
          totalDuration += stretch.duration
        }
      })
    }

    // Add problem area stretches
    if (this.userProfile.problemAreas && this.userProfile.problemAreas.length > 0) {
      const problemStretches = this.getProblemAreaStretches(todayFocus.focus)
      problemStretches.forEach(stretch => {
        if (totalDuration + stretch.duration <= this.maxDuration - 60) {
          routine.push(stretch)
          totalDuration += stretch.duration
        }
      })
    }

    // Add cool-down
    const cooldownStretches = this.getCooldownStretches()
    cooldownStretches.forEach(stretch => {
      if (totalDuration + stretch.duration <= this.maxDuration) {
        routine.push(stretch)
        totalDuration += stretch.duration
      }
    })

    // Adjust difficulty based on experience
    routine = this.adjustForExperience(routine)

    // Ensure we don't exceed 15 minutes
    routine = this.trimToTimeLimit(routine)

    return routine
  }

  getWeeklySchedule() {
    const schedules = {
      beginner: [
        { day: 'Monday', focus: 'lower_body', isRest: false },
        { day: 'Tuesday', focus: 'upper_body', isRest: false },
        { day: 'Wednesday', focus: 'full_body', isRest: false },
        { day: 'Thursday', focus: 'rest', isRest: true },
        { day: 'Friday', focus: 'core_back', isRest: false },
        { day: 'Saturday', focus: 'goal_intensive', isRest: false },
        { day: 'Sunday', focus: 'gentle_recovery', isRest: false }
      ],
      intermediate: [
        { day: 'Monday', focus: 'lower_body', isRest: false },
        { day: 'Tuesday', focus: 'upper_body', isRest: false },
        { day: 'Wednesday', focus: 'goal_intensive', isRest: false },
        { day: 'Thursday', focus: 'core_back', isRest: false },
        { day: 'Friday', focus: 'full_body', isRest: false },
        { day: 'Saturday', focus: 'goal_intensive', isRest: false },
        { day: 'Sunday', focus: 'rest', isRest: true }
      ],
      advanced: [
        { day: 'Monday', focus: 'goal_intensive', isRest: false },
        { day: 'Tuesday', focus: 'lower_body', isRest: false },
        { day: 'Wednesday', focus: 'upper_body', isRest: false },
        { day: 'Thursday', focus: 'goal_intensive', isRest: false },
        { day: 'Friday', focus: 'full_body', isRest: false },
        { day: 'Saturday', focus: 'goal_intensive', isRest: false },
        { day: 'Sunday', focus: 'active_recovery', isRest: false }
      ]
    }

    return schedules[this.userProfile.experienceLevel] || schedules.beginner
  }

  getWarmupStretches() {
    const warmups = [
      stretchDatabase.find(s => s.id === 'neck_rolls'),
      stretchDatabase.find(s => s.id === 'shoulder_rolls'),
      stretchDatabase.find(s => s.id === 'ankle_circles')
    ].filter(Boolean)

    return this.shuffleArray(warmups).slice(0, 2)
  }

  getCooldownStretches() {
    const cooldowns = [
      stretchDatabase.find(s => s.id === 'childs_pose'),
      stretchDatabase.find(s => s.id === 'forward_fold'),
      stretchDatabase.find(s => s.id === 'standing_side_stretch')
    ].filter(Boolean)

    return this.shuffleArray(cooldowns).slice(0, 2)
  }

  getGoalSpecificStretches(focus) {
    const goalStretches = getStretchesByGoal(this.userProfile.primaryGoal)
    
    // Filter by today's focus area
    let focusedStretches = goalStretches
    
    switch (focus) {
      case 'lower_body':
        focusedStretches = goalStretches.filter(s => 
          s.bodyArea === 'legs' || s.muscleGroups.some(mg => 
            ['hamstrings', 'quads', 'calves', 'hips', 'glutes'].includes(mg)
          )
        )
        break
      case 'upper_body':
        focusedStretches = goalStretches.filter(s => 
          s.bodyArea === 'arms' || s.bodyArea === 'shoulders' || s.bodyArea === 'chest' ||
          s.muscleGroups.some(mg => ['shoulders', 'arms', 'chest', 'upper_back'].includes(mg))
        )
        break
      case 'core_back':
        focusedStretches = goalStretches.filter(s => 
          s.bodyArea === 'back' || s.muscleGroups.some(mg => 
            ['core', 'back', 'lower_back', 'spine'].includes(mg)
          )
        )
        break
      case 'goal_intensive':
        // Use all goal-specific stretches
        break
      case 'full_body':
      case 'gentle_recovery':
      case 'active_recovery':
        // Mix of everything, but gentler
        focusedStretches = this.shuffleArray(goalStretches)
        break
    }

    return this.shuffleArray(focusedStretches).slice(0, 5)
  }

  getProblemAreaStretches(focus) {
    if (!this.userProfile.problemAreas || this.userProfile.problemAreas.includes('none')) {
      return []
    }

    const problemStretches = stretchDatabase.filter(stretch => {
      return this.userProfile.problemAreas.some(area => {
        if (area === 'neck' && stretch.bodyArea === 'neck') return true
        if (area === 'upper_back' && stretch.muscleGroups.includes('upper_back')) return true
        if (area === 'lower_back' && stretch.muscleGroups.includes('lower_back')) return true
        if (area === 'hips' && stretch.muscleGroups.includes('hips')) return true
        if (area === 'hamstrings' && stretch.muscleGroups.includes('hamstrings')) return true
        if (area === 'ankles' && stretch.muscleGroups.includes('ankles')) return true
        if (area === 'wrists' && stretch.muscleGroups.includes('wrists')) return true
        return false
      })
    })

    return this.shuffleArray(problemStretches).slice(0, 3)
  }

  adjustForExperience(routine) {
    const age = parseInt(this.userProfile.age)
    
    // Adjust based on age
    if (age > 60) {
      routine = routine.map(stretch => {
        // Increase duration slightly for gentler progression
        return {
          ...stretch,
          duration: Math.min(stretch.duration * 1.2, 60),
          modifiedForAge: true
        }
      })
    }

    // Filter by difficulty
    if (this.userProfile.experienceLevel === 'beginner') {
      routine = routine.filter(s => s.difficulty !== 'advanced')
    } else if (this.userProfile.experienceLevel === 'intermediate') {
      // Include all difficulties
    }

    return routine
  }

  trimToTimeLimit(routine) {
    let totalDuration = 0
    const trimmedRoutine = []

    for (const stretch of routine) {
      if (totalDuration + stretch.duration <= this.maxDuration) {
        trimmedRoutine.push(stretch)
        totalDuration += stretch.duration
      }
    }

    return trimmedRoutine
  }

  shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  rescheduleRoutine(missedDays) {
    // If user missed days, we need to adjust the schedule
    const schedule = this.getWeeklySchedule()
    const today = new Date().getDay()
    const adjustedSchedule = [...schedule]

    // Redistribute missed focus areas across remaining days
    missedDays.forEach(missedDay => {
      const missedFocus = schedule[missedDay].focus
      if (!schedule[missedDay].isRest) {
        // Find next available day to add this focus
        for (let i = today; i < 7; i++) {
          if (!adjustedSchedule[i].isRest) {
            // Combine focuses for that day
            adjustedSchedule[i].combinedFocus = true
            adjustedSchedule[i].additionalFocus = missedFocus
            break
          }
        }
      }
    })

    return adjustedSchedule
  }
}

export const generateRoutineForUser = (userProfile, dayOfWeek) => {
  const generator = new GoalRoutineGenerator(userProfile)
  return generator.generateDailyRoutine(dayOfWeek)
}