import React, { useState, useEffect } from 'react';

const PrisonersDilemma = () => {
  // Game state
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  const [gameStatus, setGameStatus] = useState('waiting'); // 'waiting', 'playing', 'finished'
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [opponentStrategy, setOpponentStrategy] = useState('titForTat');
  const [showExplanation, setShowExplanation] = useState(false);
  const [roundResult, setRoundResult] = useState(null);

  // Payoff matrix: [playerPoints, opponentPoints]
  const payoffMatrix = {
    'cooperate-cooperate': [3, 3], // Both cooperate - mutual benefit
    'cooperate-defect': [0, 5],    // Player cooperates, opponent defects - sucker's payoff
    'defect-cooperate': [5, 0],    // Player defects, opponent cooperates - temptation
    'defect-defect': [1, 1]        // Both defect - punishment
  };

  // AI strategies
  const strategies = {
    titForTat: {
      name: 'Tit-for-Tat',
      description: 'Cooperates first, then copies your last move',
      getChoice: (history) => {
        if (history.length === 0) return 'cooperate';
        return history[history.length - 1].playerChoice;
      }
    },
    alwaysCooperate: {
      name: 'Always Cooperate',
      description: 'Always chooses to cooperate',
      getChoice: () => 'cooperate'
    },
    alwaysDefect: {
      name: 'Always Defect',
      description: 'Always chooses to defect',
      getChoice: () => 'defect'
    },
    grudger: {
      name: 'Grudger',
      description: 'Cooperates until you defect once, then always defects',
      getChoice: (history) => {
        const hasPlayerDefected = history.some(round => round.playerChoice === 'defect');
        return hasPlayerDefected ? 'defect' : 'cooperate';
      }
    },
    random: {
      name: 'Random',
      description: 'Randomly chooses cooperate or defect',
      getChoice: () => Math.random() > 0.5 ? 'cooperate' : 'defect'
    }
  };

  // Make player choice
  const makeChoice = (choice) => {
    if (gameStatus !== 'playing') return;
    
    setPlayerChoice(choice);
    
    // Generate opponent choice based on strategy
    const oppChoice = strategies[opponentStrategy].getChoice(roundHistory);
    setOpponentChoice(oppChoice);
    
    // Calculate scores
    const key = `${choice}-${oppChoice}`;
    const [playerPoints, oppPoints] = payoffMatrix[key];
    
    setPlayerScore(prev => prev + playerPoints);
    setOpponentScore(prev => prev + oppPoints);
    
    // Store round result
    const result = {
      round: currentRound,
      playerChoice: choice,
      opponentChoice: oppChoice,
      playerPoints,
      opponentPoints,
      explanation: getResultExplanation(choice, oppChoice, playerPoints, oppPoints)
    };
    
    setRoundResult(result);
    setRoundHistory([...roundHistory, result]);
    console.log('Round result set:', result);
    console.log('Game status:', gameStatus);
    
    // Don't increment round here - wait for nextRound button click
  };

  // Get explanation for the round result
  const getResultExplanation = (playerChoice, oppChoice, playerPoints, oppPoints) => {
    const key = `${playerChoice}-${oppChoice}`;
    
    const explanations = {
      'cooperate-cooperate': 'Both cooperated! This is the ideal outcome for society - mutual cooperation leads to mutual benefit.',
      'cooperate-defect': 'You cooperated but they defected. You got the "sucker\'s payoff" - this is why pure cooperation can be risky.',
      'defect-cooperate': 'You defected while they cooperated. You got the "temptation payoff" - maximum individual gain at their expense.',
      'defect-defect': 'Both defected. This is the "Nash equilibrium" - individually rational but collectively suboptimal.'
    };
    
    return explanations[key];
  };

  // Start new game
  const startNewGame = () => {
    setPlayerScore(0);
    setOpponentScore(0);
    setCurrentRound(1);
    setGameStatus('playing');
    setPlayerChoice(null);
    setOpponentChoice(null);
    setRoundHistory([]);
    setRoundResult(null);
  };

  // Reset for next round
  const nextRound = () => {
    if (currentRound >= totalRounds) {
      setGameStatus('finished');
    } else {
      setCurrentRound(prev => prev + 1);
      setPlayerChoice(null);
      setOpponentChoice(null);
      setRoundResult(null);
    }
  };

  // Get choice emoji
  const getChoiceEmoji = (choice) => {
    return choice === 'cooperate' ? '🤝' : '⚔️';
  };

  // Get choice color
  const getChoiceColor = (choice) => {
    return choice === 'cooperate' ? '#10b981' : '#ef4444';
  };

  // Get final result message
  const getFinalResult = () => {
    if (playerScore > opponentScore) {
      return { message: 'You Won!', color: '#10b981' };
    } else if (playerScore < opponentScore) {
      return { message: 'Opponent Won!', color: '#ef4444' };
    } else {
      return { message: 'It\'s a Tie!', color: '#6b7280' };
    }
  };

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
        🎯 Prisoner's Dilemma
      </h1>
      <p style={{
        textAlign: 'center',
        color: '#6b7280',
        marginBottom: '30px',
        fontSize: '1.1rem'
      }}>
        Learn game theory through strategic decision making
      </p>

      {/* Game Setup */}
      {gameStatus === 'waiting' && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>🎮 Game Setup</h2>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Number of Rounds:
            </label>
            <select
              value={totalRounds}
              onChange={(e) => setTotalRounds(parseInt(e.target.value))}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '16px'
              }}
            >
              <option value={5}>5 Rounds</option>
              <option value={10}>10 Rounds</option>
              <option value={20}>20 Rounds</option>
              <option value={50}>50 Rounds</option>
            </select>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Opponent Strategy:
            </label>
            <select
              value={opponentStrategy}
              onChange={(e) => setOpponentStrategy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                width: '100%',
                maxWidth: '300px'
              }}
            >
              {Object.entries(strategies).map(([key, strategy]) => (
                <option key={key} value={key}>
                  {strategy.name} - {strategy.description}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={startNewGame}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Start Game
          </button>
        </div>
      )}

      {/* Game Info */}
      {gameStatus !== 'waiting' && (
        <div>
          {/* Restart Button */}
          <div style={{
            textAlign: 'right',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to restart? This will reset all scores.')) {
                  setGameStatus('waiting');
                  setPlayerScore(0);
                  setOpponentScore(0);
                  setCurrentRound(1);
                  setPlayerChoice(null);
                  setOpponentChoice(null);
                  setRoundHistory([]);
                  setRoundResult(null);
                }
              }}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🔄 Restart Game
            </button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Round</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
              {currentRound} / {totalRounds}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Your Score</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {playerScore}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Opponent Score</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
              {opponentScore}
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Opponent</h3>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#6b7280' }}>
              {strategies[opponentStrategy].name}
            </p>
          </div>
        </div>
        </div>
      )}

      {/* Choice Buttons */}
      {gameStatus === 'playing' && !roundResult && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Make Your Choice</h2>
          <p style={{ marginBottom: '30px', color: '#6b7280', fontSize: '16px' }}>
            Will you cooperate or defect this round?
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => makeChoice('cooperate')}
              style={{
                padding: '20px 30px',
                fontSize: '18px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '32px' }}>🤝</span>
              Cooperate
            </button>
            
            <button
              onClick={() => makeChoice('defect')}
              style={{
                padding: '20px 30px',
                fontSize: '18px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '32px' }}>⚔️</span>
              Defect
            </button>
          </div>
        </div>
      )}

      {/* Round Result */}
      {roundResult && gameStatus === 'playing' && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1f2937', textAlign: 'center' }}>
            Round {roundResult.round} Result
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px',
            marginBottom: '25px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>You</h3>
              <div style={{
                fontSize: '48px',
                color: getChoiceColor(roundResult.playerChoice),
                marginBottom: '10px'
              }}>
                {getChoiceEmoji(roundResult.playerChoice)}
              </div>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                {roundResult.playerChoice === 'cooperate' ? 'Cooperated' : 'Defected'}
              </p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                +{roundResult.playerPoints} points
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Opponent</h3>
              <div style={{
                fontSize: '48px',
                color: getChoiceColor(roundResult.opponentChoice),
                marginBottom: '10px'
              }}>
                {getChoiceEmoji(roundResult.opponentChoice)}
              </div>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                {roundResult.opponentChoice === 'cooperate' ? 'Cooperated' : 'Defected'}
              </p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
                +{roundResult.opponentPoints} points
              </p>
            </div>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Explanation:</h4>
            <p style={{ margin: 0, color: '#6b7280' }}>{roundResult.explanation}</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={nextRound}
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
              {currentRound >= totalRounds ? 'See Final Results' : 'Next Round'}
            </button>
          </div>
        </div>
      )}

      {/* Final Results */}
      {gameStatus === 'finished' && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Game Complete!</h2>
          
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: getFinalResult().color,
            marginBottom: '20px'
          }}>
            {getFinalResult().message}
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Your Final Score</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {playerScore}
              </p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Opponent Final Score</h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                {opponentScore}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setGameStatus('waiting');
              setPlayerScore(0);
              setOpponentScore(0);
              setCurrentRound(1);
              setPlayerChoice(null);
              setOpponentChoice(null);
              setRoundHistory([]);
              setRoundResult(null);
            }}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '10px'
            }}
          >
            🎮 New Game
          </button>
          
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showExplanation ? 'Hide' : 'Show'} Strategy Analysis
          </button>
        </div>
      )}

      {/* Strategy Analysis */}
      {showExplanation && (
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>🧠 Strategy Analysis</h2>
          
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>The Dilemma:</h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
              The Prisoner's Dilemma illustrates why rational individuals might not cooperate, 
              even when it's in their mutual interest. Each player has a dominant strategy to 
              defect, but mutual defection leads to a worse outcome than mutual cooperation.
            </p>
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>Payoff Matrix:</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              maxWidth: '400px'
            }}>
              <div></div>
              <div style={{ textAlign: 'center', fontWeight: 'bold' }}>Cooperate</div>
              <div style={{ textAlign: 'center', fontWeight: 'bold' }}>Defect</div>
              
              <div style={{ fontWeight: 'bold' }}>Cooperate</div>
              <div style={{ textAlign: 'center', backgroundColor: '#f3f4f6', padding: '10px' }}>3, 3</div>
              <div style={{ textAlign: 'center', backgroundColor: '#f3f4f6', padding: '10px' }}>0, 5</div>
              
              <div style={{ fontWeight: 'bold' }}>Defect</div>
              <div style={{ textAlign: 'center', backgroundColor: '#f3f4f6', padding: '10px' }}>5, 0</div>
              <div style={{ textAlign: 'center', backgroundColor: '#f3f4f6', padding: '10px' }}>1, 1</div>
            </div>
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>Optimal Strategies:</h3>
            <ul style={{ color: '#6b7280', lineHeight: '1.8' }}>
              <li><strong>Tit-for-Tat:</strong> Often the most successful strategy in repeated games. 
                Start cooperating, then mirror your opponent's last move.</li>
              <li><strong>Always Cooperate:</strong> Maximizes mutual benefit but vulnerable to exploitation.</li>
              <li><strong>Always Defect:</strong> Protects against exploitation but prevents cooperation.</li>
              <li><strong>Grudger:</strong> Punishes defection permanently - can deter defection but unforgiving.</li>
            </ul>
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>💡 Key Insights</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#3730a3', lineHeight: '1.8' }}>
              <li>Communication and trust-building are crucial for cooperation</li>
              <li>Reputation matters in repeated interactions</li>
              <li>Forgiving strategies often outperform purely punitive ones</li>
              <li>The "shadow of the future" encourages cooperation</li>
            </ul>
          </div>
        </div>
      )}

      {/* Payoff Matrix Reference */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '2px solid #e5e7eb'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '1.3rem' }}>📊 Scoring Reference</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#dcfce7', 
            borderRadius: '8px',
            border: '2px solid #86efac'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>🤝 + 🤝</span>
              <strong style={{ fontSize: '16px', color: '#166534' }}>Both Cooperate</strong>
            </div>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#166534' }}>
              3 points each
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#15803d' }}>
              (Mutual Reward)
            </p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fee2e2', 
            borderRadius: '8px',
            border: '2px solid #fca5a5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>⚔️ + ⚔️</span>
              <strong style={{ fontSize: '16px', color: '#991b1b' }}>Both Defect</strong>
            </div>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#991b1b' }}>
              1 point each
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#dc2626' }}>
              (Mutual Punishment)
            </p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#ddd6fe', 
            borderRadius: '8px',
            border: '2px solid #c4b5fd'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>⚔️ + 🤝</span>
              <strong style={{ fontSize: '16px', color: '#581c87' }}>You Defect, They Cooperate</strong>
            </div>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#581c87' }}>
              You get: 5 points
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6b21a8' }}>
              (Temptation Payoff)
            </p>
          </div>
          
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fef3c7', 
            borderRadius: '8px',
            border: '2px solid #fde68a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>🤝 + ⚔️</span>
              <strong style={{ fontSize: '16px', color: '#92400e' }}>You Cooperate, They Defect</strong>
            </div>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#92400e' }}>
              You get: 0 points
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#b45309' }}>
              (Sucker's Payoff)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrisonersDilemma;