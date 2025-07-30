import { useState, useEffect, useRef } from 'react'

const DailyStretchSession = ({ routine, userProfile, onComplete }) => {
  const [currentStretchIndex, setCurrentStretchIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0)
  const [getReadyCountdown, setGetReadyCountdown] = useState(0)
  const [sessionStarted, setSessionStarted] = useState(false)
  const intervalRef = useRef(null)

  const currentStretch = routine[currentStretchIndex]
  const totalStretches = routine.length
  const progress = ((currentStretchIndex + 1) / totalStretches) * 100

  useEffect(() => {
    if (currentStretch) {
      setTimeRemaining(currentStretch.duration)
      setIsPlaying(false)
      setGetReadyCountdown(3) // 3 second get ready countdown
    }
  }, [currentStretch])

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            playSound('ding')  // Play ding sound when stretch ends
            if (currentStretchIndex < totalStretches - 1) {
              setCurrentStretchIndex(i => i + 1)
              return routine[currentStretchIndex + 1].duration
            } else {
              handleSessionComplete()
              return 0
            }
          }
          return prev - 1
        })
        setTotalTimeElapsed(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isPlaying, timeRemaining, currentStretchIndex, totalStretches])

  const handleNextStretch = () => {
    if (currentStretchIndex < totalStretches - 1) {
      setCurrentStretchIndex(prev => prev + 1)
      setIsPlaying(false)
      playSound('next')
    } else {
      handleSessionComplete()
    }
  }

  const handlePreviousStretch = () => {
    if (currentStretchIndex > 0) {
      setCurrentStretchIndex(prev => prev - 1)
      setIsPlaying(false)
    }
  }

  const handleSessionComplete = () => {
    setSessionComplete(true)
    setIsPlaying(false)
    playSound('complete')
    
    const sessionData = {
      date: new Date().toISOString(),
      duration: totalTimeElapsed,
      stretchesCompleted: totalStretches,
      routine: routine.map(s => s.id)
    }
    
    const sessions = JSON.parse(localStorage.getItem('stretchGoalsSessions') || '[]')
    sessions.push(sessionData)
    localStorage.setItem('stretchGoalsSessions', JSON.stringify(sessions))
    
    setTimeout(() => {
      onComplete(sessionData)
    }, 3000)
  }

  const playSound = (type) => {
    // Create a ding sound using Web Audio API
    if (type === 'ding' || type === 'next') {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // Create a pleasant ding sound
        oscillator.frequency.value = 800 // Hz - nice high pitched ding
        oscillator.type = 'sine'
        
        // Envelope for the ding
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
        
        // Also add a harmonic for richness
        const oscillator2 = audioContext.createOscillator()
        const gainNode2 = audioContext.createGain()
        
        oscillator2.connect(gainNode2)
        gainNode2.connect(audioContext.destination)
        
        oscillator2.frequency.value = 1200 // Hz - harmonic
        oscillator2.type = 'sine'
        
        gainNode2.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode2.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01)
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator2.start(audioContext.currentTime)
        oscillator2.stop(audioContext.currentTime + 0.3)
      } catch (e) {
        console.log('Audio not supported')
      }
    }
    
    // Keep vibration as fallback
    if (type === 'complete') {
      // Create a success/completion sound - ascending chime
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const notes = [523.25, 659.25, 783.99] // C5, E5, G5 - major chord
        
        notes.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.value = freq
          oscillator.type = 'sine'
          
          const startTime = audioContext.currentTime + (index * 0.15)
          gainNode.gain.setValueAtTime(0, startTime)
          gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02)
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6)
          
          oscillator.start(startTime)
          oscillator.stop(startTime + 0.6)
        })
      } catch (e) {
        console.log('Audio not supported')
      }
    }
    
    // Keep vibration as fallback
    if ('vibrate' in navigator) {
      if (type === 'next' || type === 'ding') navigator.vibrate(100)
      else if (type === 'complete') navigator.vibrate([100, 50, 100])
    }
  }

  // Add countdown beeps for last 3 seconds
  useEffect(() => {
    if (isPlaying && timeRemaining <= 3 && timeRemaining > 0) {
      // Create a softer tick sound for countdown
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // Lower frequency tick sound
        oscillator.frequency.value = 400
        oscillator.type = 'sine'
        
        // Very short tick
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.05)
      } catch (e) {
        console.log('Audio not supported')
      }
    }
  }, [timeRemaining, isPlaying])

  // Handle get ready countdown
  useEffect(() => {
    if (getReadyCountdown > 0 && !isPlaying) {
      const countdownTimer = setTimeout(() => {
        if (getReadyCountdown === 1) {
          setGetReadyCountdown(0)
          setIsPlaying(true)
        } else {
          setGetReadyCountdown(getReadyCountdown - 1)
        }
      }, 1000)
      return () => clearTimeout(countdownTimer)
    }
  }, [getReadyCountdown, isPlaying])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const containerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  }

  const headerStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 3px 15px rgba(0,0,0,0.08)'
  }

  const progressBarStyle = {
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '4px',
    marginBottom: '15px',
    overflow: 'hidden'
  }

  const progressFillStyle = {
    height: '100%',
    background: 'linear-gradient(90deg, #00acc1 0%, #00838f 100%)',
    width: `${progress}%`,
    transition: 'width 0.5s ease'
  }

  const mainCardStyle = {
    flex: 1,
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column'
  }

  const timerStyle = {
    fontSize: '72px',
    fontWeight: '700',
    textAlign: 'center',
    color: timeRemaining <= 5 ? '#ff6b6b' : timeRemaining <= 10 ? '#ff9800' : '#00838f',
    margin: '20px 0',
    fontFamily: 'monospace',
    transition: 'color 0.3s ease',
    animation: timeRemaining <= 5 ? 'pulse 1s infinite' : 'none'
  }

  const stretchNameStyle = {
    fontSize: '28px',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: '10px'
  }

  const muscleGroupStyle = {
    textAlign: 'center',
    color: '#666',
    fontSize: '16px',
    marginBottom: '20px'
  }

  const instructionStyle = {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px'
  }

  const instructionItemStyle = {
    margin: '8px 0',
    paddingLeft: '20px',
    position: 'relative',
    fontSize: '14px',
    color: '#555'
  }

  const controlsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: 'auto'
  }

  const buttonStyle = {
    padding: '15px 30px',
    borderRadius: '30px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  }

  const playButtonStyle = {
    ...buttonStyle,
    background: isPlaying ? '#ff6b6b' : 'linear-gradient(135deg, #00acc1 0%, #00838f 100%)',
    color: 'white',
    paddingLeft: '40px',
    paddingRight: '40px'
  }

  const navigationButtonStyle = {
    ...buttonStyle,
    background: 'white',
    border: '2px solid #00acc1',
    color: '#00838f'
  }

  const sessionControlStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    display: 'flex',
    gap: '10px'
  }

  const sessionButtonStyle = {
    padding: '10px 20px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  }

  const stopSessionStyle = {
    ...sessionButtonStyle,
    background: '#ff6b6b',
    color: 'white'
  }

  const pauseSessionStyle = {
    ...sessionButtonStyle,
    background: '#ff9800',
    color: 'white'
  }

  const completeScreenStyle = {
    textAlign: 'center',
    padding: '40px'
  }

  if (sessionComplete) {
    return (
      <div style={containerStyle}>
        <div style={mainCardStyle}>
          <div style={completeScreenStyle}>
            <div style={{ fontSize: '72px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ fontSize: '32px', color: '#00838f', marginBottom: '10px' }}>
              Session Complete!
            </h2>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
              Great job, {userProfile.name}!
            </p>
            <div style={{ 
              background: '#f8f9fa', 
              borderRadius: '10px', 
              padding: '20px',
              margin: '20px 0'
            }}>
              <p style={{ margin: '5px 0', fontSize: '16px' }}>
                ⏱️ Total time: {formatTime(totalTimeElapsed)}
              </p>
              <p style={{ margin: '5px 0', fontSize: '16px' }}>
                ✅ Stretches completed: {totalStretches}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentStretch) {
    return <div>Loading routine...</div>
  }

  // Welcome screen when session hasn't started
  if (!sessionStarted && !sessionComplete) {
    return (
      <div style={containerStyle}>
        <div style={mainCardStyle}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2 style={{ fontSize: '32px', color: '#00838f', marginBottom: '20px' }}>
              Ready to Stretch? 🧘‍♀️
            </h2>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
              Today's session: {totalStretches} stretches, approximately 15 minutes
            </p>
            <div style={{ 
              background: '#f8f9fa', 
              borderRadius: '10px', 
              padding: '20px',
              marginBottom: '30px',
              textAlign: 'left',
              maxWidth: '400px',
              margin: '0 auto 30px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#00838f' }}>Session Overview:</h3>
              {routine.slice(0, 5).map((stretch, index) => (
                <p key={index} style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  {index + 1}. {stretch.name} ({stretch.duration}s)
                </p>
              ))}
              {routine.length > 5 && (
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#999' }}>
                  ...and {routine.length - 5} more stretches
                </p>
              )}
            </div>
            <button
              style={{
                ...playButtonStyle,
                width: 'auto',
                padding: '20px 60px',
                fontSize: '20px'
              }}
              onClick={() => {
                setSessionStarted(true)
                setGetReadyCountdown(3)
              }}
            >
              🚀 Start Session
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.05); }
            100% { transform: translate(-50%, -50%) scale(1); }
          }
        `}
      </style>
      <div style={containerStyle}>
      {/* Session Control Buttons */}
      {sessionStarted && (
        <div style={sessionControlStyle}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>⏱️ {formatTime(totalTimeElapsed)}</span>
            <span style={{ opacity: 0.7 }}>|</span>
            <span>{currentStretchIndex + 1}/{totalStretches}</span>
          </div>
          <button
            style={pauseSessionStyle}
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false)
              } else {
                setSessionStarted(true)
                setIsPlaying(true)
              }
            }}
          >
            {isPlaying ? '⏸️ Pause Session' : '▶️ Resume Session'}
          </button>
          <button
            style={stopSessionStyle}
            onClick={() => {
              if (window.confirm('Are you sure you want to end this session?')) {
                setIsPlaying(false)
                setSessionStarted(false)
                onComplete({
                  date: new Date().toISOString(),
                  duration: totalTimeElapsed,
                  stretchesCompleted: currentStretchIndex,
                  routine: routine.slice(0, currentStretchIndex).map(s => s.id)
                })
              }
            }}
          >
            ⏹️ End Session
          </button>
        </div>
      )}
      
      <div style={headerStyle}>
        <div style={progressBarStyle}>
          <div style={progressFillStyle} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            Stretch {currentStretchIndex + 1} of {totalStretches}
          </span>
          <span style={{ color: '#666', fontSize: '14px' }}>
            Total: {formatTime(totalTimeElapsed)}
          </span>
        </div>
      </div>

      <div style={mainCardStyle}>
        <h2 style={stretchNameStyle}>{currentStretch.name}</h2>
        <p style={muscleGroupStyle}>
          {currentStretch.muscleGroups.join(' • ')}
        </p>

        {getReadyCountdown > 0 && !isPlaying && (
          <div style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#ff9800',
            textAlign: 'center',
            margin: '40px 0',
            animation: 'pulse 0.5s ease-in-out'
          }}>
            Get Ready: {getReadyCountdown}
          </div>
        )}

        {getReadyCountdown === 0 && (
          <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={timeRemaining <= 5 ? '#ff6b6b' : timeRemaining <= 10 ? '#ff9800' : '#00838f'}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - (currentStretch.duration - timeRemaining) / currentStretch.duration)}`}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{ 
              ...timerStyle, 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              margin: 0
            }}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        )}

        <div style={instructionStyle}>
          <h3 style={{ margin: '0 0 15px 0', color: '#00838f', fontSize: '18px' }}>
            Instructions:
          </h3>
          {currentStretch.instructions.map((instruction, index) => (
            <div key={index} style={instructionItemStyle}>
              <span style={{ 
                position: 'absolute', 
                left: 0, 
                color: '#00acc1',
                fontWeight: 'bold'
              }}>
                {index + 1}.
              </span>
              {instruction}
            </div>
          ))}
        </div>

        {currentStretch.warnings && currentStretch.warnings.length > 0 && (
          <div style={{ 
            background: '#fff3e0', 
            borderRadius: '10px', 
            padding: '15px',
            marginBottom: '20px',
            border: '1px solid #ffb74d'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#f57c00' }}>
              ⚠️ {currentStretch.warnings.join(' • ')}
            </p>
          </div>
        )}

        <div style={controlsStyle}>
          <button
            style={{ 
              ...navigationButtonStyle,
              opacity: currentStretchIndex === 0 ? 0.5 : 1
            }}
            onClick={handlePreviousStretch}
            disabled={currentStretchIndex === 0}
          >
            Previous
          </button>
          
          <button
            style={playButtonStyle}
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false)
              } else if (getReadyCountdown === 0) {
                setSessionStarted(true)
                setGetReadyCountdown(3)
              }
            }}
            disabled={getReadyCountdown > 0}
          >
            {isPlaying ? 'Pause' : getReadyCountdown > 0 ? 'Get Ready...' : 'Start'}
          </button>
          
          <button
            style={navigationButtonStyle}
            onClick={handleNextStretch}
          >
            {currentStretchIndex === totalStretches - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
    </>
  )
}

export default DailyStretchSession