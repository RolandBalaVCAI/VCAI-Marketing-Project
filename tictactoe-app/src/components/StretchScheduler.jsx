import { useState, useEffect } from 'react'
import { GoalRoutineGenerator } from '../utils/GoalRoutineGenerator'

const StretchScheduler = ({ userProfile, onSessionSelect }) => {
  const [weeklySchedule, setWeeklySchedule] = useState([])
  const [completedDays, setCompletedDays] = useState([])
  const [missedDays, setMissedDays] = useState([])

  useEffect(() => {
    if (userProfile) {
      const generator = new GoalRoutineGenerator(userProfile)
      const schedule = generator.getWeeklySchedule()
      setWeeklySchedule(schedule)
      
      // Load completion status from localStorage
      const sessions = JSON.parse(localStorage.getItem('stretchGoalsSessions') || '[]')
      const today = new Date()
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      
      const completed = []
      const missed = []
      
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(weekStart)
        checkDate.setDate(weekStart.getDate() + i)
        const dateStr = checkDate.toDateString()
        
        if (sessions.some(s => new Date(s.date).toDateString() === dateStr)) {
          completed.push(i)
        } else if (checkDate < today && !schedule[i]?.isRest) {
          missed.push(i)
        }
      }
      
      setCompletedDays(completed)
      setMissedDays(missed)
    }
  }, [userProfile])

  const handleReschedule = (missedDayIndex) => {
    const generator = new GoalRoutineGenerator(userProfile)
    const newSchedule = generator.rescheduleRoutine([missedDayIndex])
    setWeeklySchedule(newSchedule)
    setMissedDays(missedDays.filter(d => d !== missedDayIndex))
  }

  const getDayStatus = (dayIndex) => {
    const today = new Date().getDay()
    const adjustedToday = today === 0 ? 6 : today - 1
    
    if (completedDays.includes(dayIndex)) return 'completed'
    if (missedDays.includes(dayIndex)) return 'missed'
    if (dayIndex === adjustedToday) return 'today'
    if (dayIndex > adjustedToday) return 'upcoming'
    return 'past'
  }

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  }

  const weekGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  }

  const dayCardStyle = (status) => ({
    background: status === 'completed' ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' :
               status === 'missed' ? 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)' :
               status === 'today' ? 'linear-gradient(135deg, #00acc1 0%, #00838f 100%)' :
               'white',
    color: ['completed', 'missed', 'today'].includes(status) ? 'white' : '#333',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
    cursor: status === 'today' ? 'pointer' : 'default',
    transition: 'transform 0.2s ease',
    border: status === 'upcoming' ? '2px solid #e0e0e0' : 'none'
  })

  const dayNameStyle = {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '5px'
  }

  const focusStyle = {
    fontSize: '14px',
    marginBottom: '10px',
    opacity: 0.9
  }

  const statusIconStyle = {
    fontSize: '24px',
    marginBottom: '5px'
  }

  const rescheduleButtonStyle = {
    background: 'white',
    color: '#ff6b6b',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px'
  }

  const legendStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  }

  const legendItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#666'
  }

  const legendDotStyle = (color) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: color
  })

  const statsStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
    marginBottom: '20px'
  }

  const getStatusIcon = (status, isRest) => {
    if (isRest && status !== 'completed') return '😴'
    switch (status) {
      case 'completed': return '✅'
      case 'missed': return '❌'
      case 'today': return '👉'
      case 'upcoming': return '📅'
      default: return '⏰'
    }
  }

  const getCompletionRate = () => {
    const totalDays = weeklySchedule.filter(day => !day.isRest).length
    return totalDays > 0 ? Math.round((completedDays.length / totalDays) * 100) : 0
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#00838f', textAlign: 'center' }}>
        Your Weekly Schedule 📅
      </h2>

      <div style={statsStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <h3 style={{ margin: '0', color: '#4caf50', fontSize: '32px' }}>{completedDays.length}</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Completed</p>
          </div>
          <div>
            <h3 style={{ margin: '0', color: '#00838f', fontSize: '32px' }}>{getCompletionRate()}%</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>This Week</p>
          </div>
          <div>
            <h3 style={{ margin: '0', color: '#ff6b6b', fontSize: '32px' }}>{missedDays.length}</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Missed</p>
          </div>
        </div>
      </div>

      <div style={legendStyle}>
        <div style={legendItemStyle}>
          <div style={legendDotStyle('#4caf50')} />
          <span>Completed</span>
        </div>
        <div style={legendItemStyle}>
          <div style={legendDotStyle('#00acc1')} />
          <span>Today</span>
        </div>
        <div style={legendItemStyle}>
          <div style={legendDotStyle('#ff6b6b')} />
          <span>Missed</span>
        </div>
        <div style={legendItemStyle}>
          <div style={legendDotStyle('#e0e0e0')} />
          <span>Upcoming</span>
        </div>
      </div>

      <div style={weekGridStyle}>
        {weeklySchedule.map((day, index) => {
          const status = getDayStatus(index)
          return (
            <div
              key={index}
              style={dayCardStyle(status)}
              onClick={() => status === 'today' && !day.isRest && onSessionSelect && onSessionSelect()}
              onMouseEnter={(e) => status === 'today' && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={statusIconStyle}>
                {getStatusIcon(status, day.isRest)}
              </div>
              <h3 style={dayNameStyle}>{day.day}</h3>
              <p style={focusStyle}>
                {day.isRest ? 'Rest Day' : 
                 day.focus.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </p>
              {status === 'missed' && !day.isRest && (
                <button
                  style={rescheduleButtonStyle}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReschedule(index)
                  }}
                >
                  Reschedule
                </button>
              )}
              {status === 'today' && !day.isRest && (
                <p style={{ fontSize: '12px', margin: '10px 0 0 0', fontWeight: '600' }}>
                  Start Session →
                </p>
              )}
            </div>
          )
        })}
      </div>

      {missedDays.length > 0 && (
        <div style={{
          background: '#fff3e0',
          borderRadius: '10px',
          padding: '15px',
          border: '1px solid #ffb74d',
          marginTop: '20px'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#f57c00' }}>
            💡 <strong>Tip:</strong> Click "Reschedule" on missed days to redistribute those stretches throughout your remaining week!
          </p>
        </div>
      )}
    </div>
  )
}

export default StretchScheduler