import { useState, useEffect } from 'react'
import StretchGoalsOnboarding from './components/StretchGoalsOnboarding'
import DailyStretchSession from './components/DailyStretchSession'
import StretchScheduler from './components/StretchScheduler'
import { generateRoutineForUser } from './utils/GoalRoutineGenerator'
import { goalTemplates } from './data/stretchDatabase'

const StretchGoals = () => {
  const [currentView, setCurrentView] = useState('home')
  const [userProfile, setUserProfile] = useState(null)
  const [todaySession, setTodaySession] = useState(null)
  const [weeklySchedule, setWeeklySchedule] = useState(null)
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    const savedProfile = localStorage.getItem('stretchGoalsProfile')
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    } else {
      setCurrentView('onboarding')
    }
  }, [])

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('stretchGoalsProfile', JSON.stringify(userProfile))
    }
  }, [userProfile])

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#333',
    position: 'relative',
    overflow: 'hidden'
  }

  const headerStyle = {
    background: 'linear-gradient(135deg, #00acc1 0%, #00838f 100%)',
    color: 'white',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  }

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
    textAlign: 'center',
    letterSpacing: '0.5px'
  }

  const subtitleStyle = {
    fontSize: '14px',
    textAlign: 'center',
    margin: '5px 0 0 0',
    opacity: 0.9
  }

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '15px 10px',
    background: 'white',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: '80px',
    zIndex: 99
  }

  const navButtonStyle = (isActive) => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: '20px',
    background: isActive ? '#00acc1' : 'transparent',
    color: isActive ? 'white' : '#00838f',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none'
  })

  const contentStyle = {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    minHeight: 'calc(100vh - 200px)'
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s ease',
    cursor: 'pointer'
  }

  const progressRingStyle = {
    width: '120px',
    height: '120px',
    margin: '0 auto 20px'
  }

  const buttonStyle = {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    marginTop: '15px',
    boxShadow: '0 4px 15px rgba(255,107,107,0.3)',
    transition: 'transform 0.2s ease'
  }

  const getTodaysFocus = () => {
    const focuses = [
      { day: 'Monday', area: 'Lower Body', icon: '🦵' },
      { day: 'Tuesday', area: 'Upper Body', icon: '💪' },
      { day: 'Wednesday', area: 'Full Body Flow', icon: '🧘' },
      { day: 'Thursday', area: 'Rest & Reflect', icon: '🧘‍♀️' },
      { day: 'Friday', area: 'Core & Posture', icon: '🏃' },
      { day: 'Saturday', area: 'Goal Intensive', icon: '🎯' },
      { day: 'Sunday', area: 'Active Recovery', icon: '🌿' }
    ]
    const dayIndex = new Date().getDay()
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1
    return focuses[adjustedIndex]
  }

  const todayFocus = getTodaysFocus()

  const renderHome = () => (
    <div>
      <div style={cardStyle} onClick={() => setCurrentView('session')}>
        <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#00838f' }}>
          Today's Focus: {todayFocus.area} {todayFocus.icon}
        </h2>
        <div style={progressRingStyle}>
          <svg width="120" height="120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#00acc1"
              strokeWidth="10"
              strokeDasharray={`${Math.PI * 100} ${Math.PI * 100}`}
              strokeDashoffset={Math.PI * 100 * 0.75}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <text
              x="60"
              y="65"
              textAnchor="middle"
              fontSize="24"
              fill="#00838f"
              fontWeight="bold"
            >
              25%
            </text>
          </svg>
        </div>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '10px' }}>
          3 of 4 sessions completed this week
        </p>
        <button style={buttonStyle} onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
          Start Today's Session
        </button>
      </div>

      <div style={cardStyle}>
        <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#00838f' }}>
          Your Primary Goal 🎯
        </h3>
        <div style={{ 
          background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '10px'
        }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#ff6b6b' }}>
            {userProfile && goalTemplates[userProfile.primaryGoal] ? 
              goalTemplates[userProfile.primaryGoal].name : 
              'Touch Your Toes in 30 Days'}
          </h4>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Day 7 of 30 - Keep it up!</p>
        </div>
        <div style={{ background: '#f5f5f5', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
          <div style={{
            width: '23%',
            height: '100%',
            background: 'linear-gradient(90deg, #ff6b6b 0%, #ff5252 100%)',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={{ ...cardStyle, marginBottom: 0 }} onClick={() => setCurrentView('schedule')}>
          <h4 style={{ margin: '0 0 10px 0', color: '#00838f' }}>📅 Weekly Schedule</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>View & adjust your routine</p>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0 }} onClick={() => setCurrentView('progress')}>
          <h4 style={{ margin: '0 0 10px 0', color: '#00838f' }}>📊 Progress</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Track your improvements</p>
        </div>
      </div>
    </div>
  )

  const handleOnboardingComplete = (profile) => {
    setUserProfile(profile)
    setCurrentView('home')
  }

  const renderOnboarding = () => (
    <StretchGoalsOnboarding onComplete={handleOnboardingComplete} />
  )

  const renderSession = () => {
    if (!todaySession) {
      const dayOfWeek = new Date().getDay()
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const routine = generateRoutineForUser(userProfile, adjustedDay)
      
      if (!routine) {
        return (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#00838f' }}>
              Rest Day 🧘‍♀️
            </h2>
            <p style={{ color: '#666' }}>
              Today is a rest day. Your body needs time to recover!
            </p>
          </div>
        )
      }
      
      setTodaySession(routine)
      return <div>Loading routine...</div>
    }

    return (
      <DailyStretchSession 
        routine={todaySession}
        userProfile={userProfile}
        onComplete={(sessionData) => {
          setCurrentView('home')
          setTodaySession(null)
        }}
      />
    )
  }

  const renderSchedule = () => (
    <StretchScheduler 
      userProfile={userProfile}
      onSessionSelect={() => setCurrentView('session')}
    />
  )

  const renderProgress = () => (
    <div style={cardStyle}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#00838f' }}>
        Your Progress 📊
      </h2>
      <p style={{ color: '#666' }}>Track your flexibility improvements</p>
    </div>
  )

  const renderContent = () => {
    switch (currentView) {
      case 'onboarding':
        return renderOnboarding()
      case 'session':
        return renderSession()
      case 'schedule':
        return renderSchedule()
      case 'progress':
        return renderProgress()
      default:
        return renderHome()
    }
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Stretch Goals</h1>
        <p style={subtitleStyle}>Your Daily Flexibility Companion</p>
      </header>
      
      {userProfile && (
        <nav style={navStyle}>
          <button 
            style={navButtonStyle(currentView === 'home')} 
            onClick={() => setCurrentView('home')}
          >
            Home
          </button>
          <button 
            style={navButtonStyle(currentView === 'session')} 
            onClick={() => setCurrentView('session')}
          >
            Today
          </button>
          <button 
            style={navButtonStyle(currentView === 'schedule')} 
            onClick={() => setCurrentView('schedule')}
          >
            Schedule
          </button>
          <button 
            style={navButtonStyle(currentView === 'progress')} 
            onClick={() => setCurrentView('progress')}
          >
            Progress
          </button>
        </nav>
      )}
      
      <main style={contentStyle}>
        {renderContent()}
      </main>
    </div>
  )
}

export default StretchGoals