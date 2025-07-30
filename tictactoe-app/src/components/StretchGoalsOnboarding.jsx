import { useState } from 'react'
import { goalTemplates } from '../data/stretchDatabase'

const StretchGoalsOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    weight: '',
    primaryGoal: '',
    secondaryGoals: [],
    experienceLevel: 'beginner',
    notificationTime: '08:00',
    problemAreas: []
  })

  const containerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px'
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
    marginBottom: '20px'
  }

  const progressBarStyle = {
    height: '6px',
    background: '#e0e0e0',
    borderRadius: '3px',
    marginBottom: '30px',
    overflow: 'hidden'
  }

  const progressFillStyle = {
    height: '100%',
    background: 'linear-gradient(90deg, #00acc1 0%, #00838f 100%)',
    width: `${(currentStep / 5) * 100}%`,
    transition: 'width 0.3s ease'
  }

  const headingStyle = {
    fontSize: '24px',
    color: '#00838f',
    marginBottom: '20px',
    textAlign: 'center'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    marginBottom: '15px',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500'
  }

  const buttonStyle = {
    background: 'linear-gradient(135deg, #00acc1 0%, #00838f 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'transform 0.2s ease'
  }

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'white',
    color: '#00838f',
    border: '2px solid #00acc1'
  }

  const goalCardStyle = {
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid transparent',
    cursor: 'pointer',
    marginBottom: '15px',
    transition: 'all 0.3s ease',
    background: '#f8f9fa'
  }

  const selectedGoalStyle = {
    ...goalCardStyle,
    border: '2px solid #00acc1',
    background: 'linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%)'
  }

  const problemAreaStyle = {
    display: 'inline-block',
    padding: '8px 16px',
    margin: '5px',
    borderRadius: '20px',
    background: '#f0f0f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px'
  }

  const selectedProblemStyle = {
    ...problemAreaStyle,
    background: '#00acc1',
    color: 'white'
  }

  const renderStep1 = () => (
    <div>
      <h2 style={headingStyle}>Welcome! Let's get to know you 👋</h2>
      <label style={labelStyle}>What's your name?</label>
      <input
        type="text"
        style={inputStyle}
        placeholder="Enter your name"
        value={profile.name}
        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
      />
      
      <label style={labelStyle}>Age</label>
      <input
        type="number"
        style={inputStyle}
        placeholder="Your age"
        value={profile.age}
        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
      />
      
      <label style={labelStyle}>Weight (optional - helps personalize intensity)</label>
      <input
        type="number"
        style={inputStyle}
        placeholder="Weight in lbs"
        value={profile.weight}
        onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
      />
      
      <label style={labelStyle}>Experience Level</label>
      <select
        style={inputStyle}
        value={profile.experienceLevel}
        onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
      >
        <option value="beginner">Beginner - New to stretching</option>
        <option value="intermediate">Intermediate - Some experience</option>
        <option value="advanced">Advanced - Regular practice</option>
      </select>
    </div>
  )

  const renderStep2 = () => (
    <div>
      <h2 style={headingStyle}>What's your primary flexibility goal? 🎯</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Choose the goal that matters most to you
      </p>
      {Object.values(goalTemplates).map(goal => (
        <div
          key={goal.id}
          style={profile.primaryGoal === goal.id ? selectedGoalStyle : goalCardStyle}
          onClick={() => setProfile({ ...profile, primaryGoal: goal.id })}
        >
          <h3 style={{ margin: '0 0 5px 0', color: '#00838f' }}>{goal.name}</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{goal.description}</p>
        </div>
      ))}
    </div>
  )

  const renderStep3 = () => {
    const problemAreas = [
      { id: 'neck', label: 'Neck & Shoulders', emoji: '😣' },
      { id: 'upper_back', label: 'Upper Back', emoji: '🪑' },
      { id: 'lower_back', label: 'Lower Back', emoji: '🤕' },
      { id: 'hips', label: 'Hips', emoji: '🚶' },
      { id: 'hamstrings', label: 'Hamstrings', emoji: '🦵' },
      { id: 'ankles', label: 'Ankles', emoji: '🦶' },
      { id: 'wrists', label: 'Wrists', emoji: '💻' },
      { id: 'none', label: 'No specific issues', emoji: '😊' }
    ]

    const toggleProblemArea = (areaId) => {
      if (areaId === 'none') {
        setProfile({ ...profile, problemAreas: ['none'] })
      } else {
        const areas = profile.problemAreas.filter(a => a !== 'none')
        if (areas.includes(areaId)) {
          setProfile({ ...profile, problemAreas: areas.filter(a => a !== areaId) })
        } else {
          setProfile({ ...profile, problemAreas: [...areas, areaId] })
        }
      }
    }

    return (
      <div>
        <h2 style={headingStyle}>Any problem areas? 🤔</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Select areas where you feel tight or experience discomfort
        </p>
        <div style={{ textAlign: 'center' }}>
          {problemAreas.map(area => (
            <span
              key={area.id}
              style={profile.problemAreas.includes(area.id) ? selectedProblemStyle : problemAreaStyle}
              onClick={() => toggleProblemArea(area.id)}
            >
              {area.emoji} {area.label}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const renderStep4 = () => (
    <div>
      <h2 style={headingStyle}>When should we remind you? ⏰</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Pick the best time for your daily 15-minute stretch session
      </p>
      
      <label style={labelStyle}>Preferred stretch time</label>
      <input
        type="time"
        style={inputStyle}
        value={profile.notificationTime}
        onChange={(e) => setProfile({ ...profile, notificationTime: e.target.value })}
      />
      
      <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#00838f' }}>💡 Pro Tips:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '14px' }}>
          <li>Morning stretches help wake up your body</li>
          <li>Lunch breaks are great for posture relief</li>
          <li>Evening stretches help you unwind</li>
        </ul>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div>
      <h2 style={headingStyle}>You're all set! 🎉</h2>
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#00838f' }}>Your Stretch Goals Profile:</h3>
        <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Name:</strong> {profile.name}</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Age:</strong> {profile.age}</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Experience:</strong> {profile.experienceLevel}</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Primary Goal:</strong> {goalTemplates[profile.primaryGoal]?.name}
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Daily Reminder:</strong> {profile.notificationTime}
        </p>
      </div>
      <p style={{ textAlign: 'center', color: '#666' }}>
        Ready to start your flexibility journey? Your first session is waiting!
      </p>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      default: return renderStep1()
    }
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(profile)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return profile.name && profile.age
      case 2: return profile.primaryGoal
      case 3: return profile.problemAreas.length > 0
      case 4: return profile.notificationTime
      case 5: return true
      default: return false
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={progressBarStyle}>
          <div style={progressFillStyle} />
        </div>
        
        {renderCurrentStep()}
        
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          {currentStep > 1 && (
            <button
              style={secondaryButtonStyle}
              onClick={handleBack}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              Back
            </button>
          )}
          <button
            style={{ ...buttonStyle, opacity: isStepValid() ? 1 : 0.6 }}
            onClick={handleNext}
            disabled={!isStepValid()}
            onMouseEnter={(e) => isStepValid() && (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {currentStep === 5 ? 'Start Stretching!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StretchGoalsOnboarding