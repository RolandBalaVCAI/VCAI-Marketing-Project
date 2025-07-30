import React, { useState, useEffect } from 'react';

const MontyHallGame = () => {
  // Game state
  const [gameStage, setGameStage] = useState('initial'); // 'initial', 'doorSelected', 'doorRevealed', 'finalChoice', 'result'
  const [carPosition, setCarPosition] = useState(null);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [revealedDoor, setRevealedDoor] = useState(null);
  const [finalChoice, setFinalChoice] = useState(null);
  const [didSwitch, setDidSwitch] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  
  // Statistics
  const [stats, setStats] = useState({
    totalGames: 0,
    switchWins: 0,
    switchLosses: 0,
    stayWins: 0,
    stayLosses: 0
  });
  
  const [showExplanation, setShowExplanation] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayStrategy, setAutoPlayStrategy] = useState('always-switch');
  const [simulationCount, setSimulationCount] = useState(100);

  // Initialize new game
  const startNewGame = () => {
    const carPos = Math.floor(Math.random() * 3);
    setCarPosition(carPos);
    setSelectedDoor(null);
    setRevealedDoor(null);
    setFinalChoice(null);
    setDidSwitch(false);
    setGameResult(null);
    setGameStage('initial');
  };

  // Handle initial door selection
  const selectDoor = (doorIndex) => {
    if (gameStage !== 'initial') return;
    
    setSelectedDoor(doorIndex);
    setGameStage('doorSelected');
    
    // Monty reveals a goat door (not the selected door, not the car door)
    setTimeout(() => {
      const availableToReveal = [0, 1, 2].filter(
        door => door !== doorIndex && door !== carPosition
      );
      const doorToReveal = availableToReveal[Math.floor(Math.random() * availableToReveal.length)];
      setRevealedDoor(doorToReveal);
      setGameStage('doorRevealed');
    }, 1000);
  };

  // Handle switch/stay decision
  const makeDecision = (switchDoor) => {
    if (gameStage !== 'doorRevealed') return;
    
    let final;
    if (switchDoor) {
      // Find the door that's not selected and not revealed
      final = [0, 1, 2].find(door => door !== selectedDoor && door !== revealedDoor);
      setDidSwitch(true);
    } else {
      final = selectedDoor;
      setDidSwitch(false);
    }
    
    setFinalChoice(final);
    setGameStage('finalChoice');
    
    // Reveal result after a delay
    setTimeout(() => {
      const won = final === carPosition;
      setGameResult(won);
      setGameStage('result');
      
      // Update statistics
      setStats(prev => ({
        totalGames: prev.totalGames + 1,
        switchWins: prev.switchWins + (switchDoor && won ? 1 : 0),
        switchLosses: prev.switchLosses + (switchDoor && !won ? 1 : 0),
        stayWins: prev.stayWins + (!switchDoor && won ? 1 : 0),
        stayLosses: prev.stayLosses + (!switchDoor && !won ? 1 : 0)
      }));
    }, 1500);
  };

  // Run simulation
  const runSimulation = () => {
    let switchWins = 0;
    let stayWins = 0;
    
    for (let i = 0; i < simulationCount; i++) {
      const car = Math.floor(Math.random() * 3);
      const initialChoice = Math.floor(Math.random() * 3);
      
      // Monty reveals a door
      const availableToReveal = [0, 1, 2].filter(
        door => door !== initialChoice && door !== car
      );
      const revealed = availableToReveal[Math.floor(Math.random() * availableToReveal.length)];
      
      // Switch choice
      const switchChoice = [0, 1, 2].find(
        door => door !== initialChoice && door !== revealed
      );
      
      // Count wins
      if (switchChoice === car) switchWins++;
      if (initialChoice === car) stayWins++;
    }
    
    // Update stats with simulation results
    setStats(prev => ({
      totalGames: prev.totalGames + simulationCount,
      switchWins: prev.switchWins + switchWins,
      switchLosses: prev.switchLosses + (simulationCount - switchWins),
      stayWins: prev.stayWins + stayWins,
      stayLosses: prev.stayLosses + (simulationCount - stayWins)
    }));
  };

  // Reset statistics
  const resetStats = () => {
    setStats({
      totalGames: 0,
      switchWins: 0,
      switchLosses: 0,
      stayWins: 0,
      stayLosses: 0
    });
  };

  // Get door content emoji
  const getDoorContent = (doorIndex) => {
    if (gameStage === 'initial' || gameStage === 'doorSelected') {
      return '🚪';
    }
    
    if (doorIndex === revealedDoor) {
      return '🐐';
    }
    
    if (gameStage === 'result' || (gameStage === 'finalChoice' && doorIndex === finalChoice)) {
      return doorIndex === carPosition ? '🚗' : '🐐';
    }
    
    return '🚪';
  };

  // Get door style
  const getDoorStyle = (doorIndex) => {
    const baseStyle = {
      width: '150px',
      height: '200px',
      fontSize: '60px',
      border: '3px solid #333',
      borderRadius: '10px',
      cursor: gameStage === 'initial' ? 'pointer' : 'default',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    };

    // Different states
    if (doorIndex === selectedDoor && gameStage !== 'result') {
      return { ...baseStyle, backgroundColor: '#3b82f6', color: 'white' };
    }
    
    if (doorIndex === revealedDoor) {
      return { ...baseStyle, backgroundColor: '#ef4444', color: 'white' };
    }
    
    if (gameStage === 'result') {
      if (doorIndex === finalChoice) {
        const won = doorIndex === carPosition;
        return { 
          ...baseStyle, 
          backgroundColor: won ? '#10b981' : '#ef4444', 
          color: 'white',
          border: '3px solid ' + (won ? '#059669' : '#dc2626')
        };
      }
      if (doorIndex === carPosition) {
        return { ...baseStyle, backgroundColor: '#fbbf24', color: 'white' };
      }
    }
    
    return { ...baseStyle, backgroundColor: '#e5e7eb' };
  };

  // Calculate percentages
  const calculatePercentage = (wins, total) => {
    return total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
  };

  useEffect(() => {
    startNewGame();
  }, []);

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#1f2937',
        fontSize: '2.5rem',
        marginBottom: '10px'
      }}>
        🚪 The Monty Hall Problem 🚗
      </h1>
      <p style={{
        textAlign: 'center',
        color: '#6b7280',
        marginBottom: '30px',
        fontSize: '1.1rem'
      }}>
        Experience the famous probability puzzle that confuses even mathematicians!
      </p>

      {/* Game Instructions */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        {gameStage === 'initial' && (
          <>
            <h2 style={{ color: '#1f2937', margin: '0 0 10px 0' }}>Choose a Door!</h2>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Behind one door is a car 🚗, behind the other two are goats 🐐
            </p>
          </>
        )}
        
        {gameStage === 'doorSelected' && (
          <>
            <h2 style={{ color: '#1f2937', margin: '0 0 10px 0' }}>You selected Door {selectedDoor + 1}</h2>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Let me show you what's behind one of the other doors...
            </p>
          </>
        )}
        
        {gameStage === 'doorRevealed' && (
          <>
            <h2 style={{ color: '#1f2937', margin: '0 0 10px 0' }}>Door {revealedDoor + 1} has a goat!</h2>
            <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>
              Do you want to switch to Door {[0, 1, 2].find(d => d !== selectedDoor && d !== revealedDoor) + 1} or stay with Door {selectedDoor + 1}?
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button
                onClick={() => makeDecision(false)}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Stay with Door {selectedDoor + 1}
              </button>
              <button
                onClick={() => makeDecision(true)}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Switch to Door {[0, 1, 2].find(d => d !== selectedDoor && d !== revealedDoor) + 1}
              </button>
            </div>
          </>
        )}
        
        {gameStage === 'finalChoice' && (
          <>
            <h2 style={{ color: '#1f2937', margin: '0 0 10px 0' }}>
              You {didSwitch ? 'switched' : 'stayed'} with Door {finalChoice + 1}
            </h2>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Let's see what you won...
            </p>
          </>
        )}
        
        {gameStage === 'result' && (
          <>
            <h2 style={{ 
              color: gameResult ? '#10b981' : '#ef4444', 
              margin: '0 0 10px 0',
              fontSize: '2rem'
            }}>
              {gameResult ? '🎉 You Won a Car! 🚗' : '😅 You Got a Goat! 🐐'}
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>
              You {didSwitch ? 'switched' : 'stayed'} and {gameResult ? 'won' : 'lost'}. 
              The car was behind Door {carPosition + 1}.
            </p>
            <button
              onClick={startNewGame}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Play Again
            </button>
          </>
        )}
      </div>

      {/* Doors */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {[0, 1, 2].map(doorIndex => (
          <div
            key={doorIndex}
            onClick={() => selectDoor(doorIndex)}
            style={getDoorStyle(doorIndex)}
          >
            <div>{getDoorContent(doorIndex)}</div>
            <div style={{
              position: 'absolute',
              bottom: '10px',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'inherit'
            }}>
              Door {doorIndex + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>📊 Your Statistics</h2>
          <button
            onClick={resetStats}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Reset Stats
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Total Games</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>
              {stats.totalGames}
            </p>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#dcfce7',
            borderRadius: '8px',
            textAlign: 'center',
            border: '2px solid #86efac'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#166534' }}>Switch Win Rate</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
              {calculatePercentage(stats.switchWins, stats.switchWins + stats.switchLosses)}%
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#15803d' }}>
              {stats.switchWins} wins / {stats.switchWins + stats.switchLosses} games
            </p>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#fee2e2',
            borderRadius: '8px',
            textAlign: 'center',
            border: '2px solid #fca5a5'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#991b1b' }}>Stay Win Rate</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#991b1b' }}>
              {calculatePercentage(stats.stayWins, stats.stayWins + stats.stayLosses)}%
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#dc2626' }}>
              {stats.stayWins} wins / {stats.stayWins + stats.stayLosses} games
            </p>
          </div>
        </div>
      </div>

      {/* Simulation */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>🔬 Run Simulation</h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          See the probabilities in action by running many games automatically
        </p>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={simulationCount}
            onChange={(e) => setSimulationCount(parseInt(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '16px'
            }}
          >
            <option value={100}>100 games</option>
            <option value={1000}>1,000 games</option>
            <option value={10000}>10,000 games</option>
          </select>
          
          <button
            onClick={runSimulation}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Run Simulation
          </button>
        </div>
      </div>

      {/* Explanation */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>🧠 Why Should You Switch?</h2>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {showExplanation ? 'Hide' : 'Show'} Explanation
          </button>
        </div>
        
        {showExplanation && (
          <div style={{ color: '#6b7280', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '15px' }}>
              The Monty Hall problem is a famous probability puzzle that demonstrates how our 
              intuition about probability can be wrong.
            </p>
            
            <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>The Mathematics:</h3>
            <ul style={{ marginBottom: '20px' }}>
              <li><strong>Initial choice:</strong> You have a 1/3 chance of picking the car</li>
              <li><strong>Monty reveals:</strong> He always shows a goat (he knows where the car is)</li>
              <li><strong>If you stay:</strong> Your chance remains 1/3</li>
              <li><strong>If you switch:</strong> Your chance becomes 2/3</li>
            </ul>
            
            <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>Why is switching better?</h3>
            <p style={{ marginBottom: '15px' }}>
              When you first pick a door, there's a 2/3 chance the car is behind one of the 
              other doors. When Monty reveals a goat, he's giving you information - he's 
              eliminating one wrong choice. The 2/3 probability that the car was behind one 
              of the other doors now concentrates on the single remaining door.
            </p>
            
            <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>Think of it this way:</h3>
            <ul>
              <li>If you initially picked a goat (2/3 chance), switching wins the car</li>
              <li>If you initially picked the car (1/3 chance), switching loses</li>
              <li>Therefore, switching wins 2/3 of the time!</li>
            </ul>
            
            <div style={{
              padding: '20px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              marginTop: '20px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>💡 Key Insight</h4>
              <p style={{ margin: 0, color: '#3730a3' }}>
                Monty's action of revealing a goat is not random - he knows where the car is 
                and deliberately shows you a goat. This additional information changes the 
                probabilities, making switching the optimal strategy.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MontyHallGame;