import React, { useState, useEffect } from 'react';

const BlackjackTrainer = () => {
  // Card suits and values
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  // Hi-Lo counting values
  const hiLoValues = {
    'A': -1, 'K': -1, 'Q': -1, 'J': -1, '10': -1,
    '9': 0, '8': 0, '7': 0,
    '6': 1, '5': 1, '4': 1, '3': 1, '2': 1
  };

  // Game state
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStatus, setGameStatus] = useState('waiting'); // 'waiting', 'playing', 'playerWon', 'dealerWon', 'push'
  const [runningCount, setRunningCount] = useState(0);
  const [cardsDealt, setCardsDealt] = useState(0);
  const [showCountingHelp, setShowCountingHelp] = useState(true);
  const [showRunningCount, setShowRunningCount] = useState(false);
  const [playerMoney, setPlayerMoney] = useState(1000);
  const [currentBet, setCurrentBet] = useState(10);
  const [deckPenetration, setDeckPenetration] = useState(0);
  const [practiceMode, setPracticeMode] = useState(true);
  const [userCount, setUserCount] = useState('');
  const [countAccuracy, setCountAccuracy] = useState({ correct: 0, total: 0 });
  const [numberOfDecks, setNumberOfDecks] = useState(6); // Default to 6 decks like most casinos
  const [totalCards, setTotalCards] = useState(52 * 6);

  // Initialize deck(s)
  const initializeDeck = () => {
    const newDeck = [];
    // Create multiple decks based on numberOfDecks
    for (let deckNum = 0; deckNum < numberOfDecks; deckNum++) {
      for (let suit of suits) {
        for (let value of values) {
          newDeck.push({ suit, value, id: `${value}-${suit}-${deckNum}` });
        }
      }
    }
    // Shuffle all cards together
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    setTotalCards(52 * numberOfDecks);
    return newDeck;
  };

  useEffect(() => {
    setDeck(initializeDeck());
  }, []);

  // Calculate hand value
  const calculateHandValue = (hand) => {
    let value = 0;
    let aces = 0;
    
    for (let card of hand) {
      if (card.value === 'A') {
        aces++;
        value += 11;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }
    
    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    
    return value;
  };

  // Deal a card and update count
  const dealCard = (fromDeck, updateCount = true) => {
    if (fromDeck.length === 0) {
      // Auto-restart with new deck when empty
      const newDeck = initializeDeck();
      setDeck(newDeck);
      setRunningCount(0);
      setCardsDealt(0);
      setDeckPenetration(0);
      
      // Deal from the new deck
      const card = newDeck[0];
      const updatedDeck = newDeck.slice(1);
      
      if (updateCount) {
        setRunningCount(prev => prev + hiLoValues[card.value]);
        setCardsDealt(prev => prev + 1);
        setDeckPenetration((52 - updatedDeck.length) / 52 * 100);
      }
      
      setDeck(updatedDeck);
      return card;
    }
    
    const card = fromDeck[0];
    const newDeck = fromDeck.slice(1);
    
    if (updateCount) {
      setRunningCount(prev => prev + hiLoValues[card.value]);
      setCardsDealt(prev => prev + 1);
      setDeckPenetration((totalCards - newDeck.length) / totalCards * 100);
    }
    
    setDeck(newDeck);
    return card;
  };

  // Start new hand
  const startNewHand = () => {
    let currentDeck = [...deck];
    
    // Check if we need a new deck (less than 4 cards needed for initial deal)
    if (currentDeck.length < 4) {
      currentDeck = initializeDeck();
      setDeck(currentDeck);
      setRunningCount(0);
      setCardsDealt(0);
      setDeckPenetration(0);
    }

    const newPlayerHand = [];
    const newDealerHand = [];

    // Deal initial cards using the dealCard function
    const card1 = dealCard(currentDeck);
    currentDeck = currentDeck.slice(1);
    newPlayerHand.push(card1);

    const card2 = dealCard(currentDeck);
    currentDeck = currentDeck.slice(1);
    newDealerHand.push(card2);

    const card3 = dealCard(currentDeck);
    currentDeck = currentDeck.slice(1);
    newPlayerHand.push(card3);

    const card4 = dealCard(currentDeck);
    newDealerHand.push(card4);

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setGameStatus('playing');
  };

  // Player actions
  const hit = () => {
    if (gameStatus !== 'playing') return;
    
    const newCard = dealCard(deck);
    if (!newCard) return;
    
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    
    if (calculateHandValue(newHand) > 21) {
      setGameStatus('dealerWon');
      setPlayerMoney(prev => prev - currentBet);
    }
  };

  const stand = () => {
    if (gameStatus !== 'playing') return;
    
    let newDealerHand = [...dealerHand];
    
    // Dealer hits on soft 17
    while (calculateHandValue(newDealerHand) < 17) {
      const newCard = dealCard(deck);
      if (!newCard) break;
      newDealerHand.push(newCard);
    }
    
    setDealerHand(newDealerHand);
    
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(newDealerHand);
    
    if (dealerValue > 21 || playerValue > dealerValue) {
      setGameStatus('playerWon');
      setPlayerMoney(prev => prev + currentBet);
    } else if (playerValue < dealerValue) {
      setGameStatus('dealerWon');
      setPlayerMoney(prev => prev - currentBet);
    } else {
      setGameStatus('push');
    }
  };

  // Calculate true count
  const getTrueCount = () => {
    const cardsRemaining = totalCards - cardsDealt;
    const decksRemaining = cardsRemaining / 52;
    return decksRemaining > 0 ? Math.round(runningCount / decksRemaining) : 0;
  };

  // Get betting recommendation based on true count
  const getBettingRecommendation = () => {
    const trueCount = getTrueCount();
    if (trueCount >= 4) return 'High Bet (4-8 units)';
    if (trueCount >= 2) return 'Medium Bet (2-4 units)';
    if (trueCount >= 1) return 'Small Bet (1-2 units)';
    return 'Minimum Bet';
  };

  // Check user's count accuracy
  const checkCount = () => {
    const userCountNum = parseInt(userCount);
    const correct = userCountNum === runningCount;
    setCountAccuracy(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
    setUserCount('');
    
    return correct;
  };

  // Get card color for display
  const getCardColor = (suit) => {
    return ['♥', '♦'].includes(suit) ? '#dc2626' : '#1f2937';
  };

  // Get counting value color
  const getCountValueColor = (value) => {
    const countValue = hiLoValues[value];
    if (countValue === 1) return '#10b981'; // Green for +1
    if (countValue === -1) return '#ef4444'; // Red for -1
    return '#6b7280'; // Gray for 0
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '"Playfair Display", serif',
      background: 'radial-gradient(ellipse at center, #0d4a3b 0%, #041d1a 50%, #000000 100%)',
      color: '#f1f5f9',
      minHeight: '100vh',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#ffd700',
        fontSize: '3rem',
        marginBottom: '10px',
        textShadow: '3px 3px 6px rgba(0,0,0,0.7), 0 0 20px rgba(255,215,0,0.3)',
        fontWeight: 'bold',
        letterSpacing: '2px'
      }}>
        ♠️ VEGAS BLACKJACK ♦️
      </h1>
      <h2 style={{
        textAlign: 'center',
        color: '#ff6b6b',
        fontSize: '1.5rem',
        marginBottom: '5px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        fontStyle: 'italic'
      }}>
        Card Counting Academy
      </h2>
      <p style={{
        textAlign: 'center',
        color: '#e5e7eb',
        marginBottom: '30px',
        fontSize: '1.1rem',
        fontStyle: 'italic'
      }}>
        Master the Hi-Lo system like a professional
      </p>

      {/* Deck Selector */}
      <div style={{
        background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
        padding: '25px',
        borderRadius: '15px',
        border: '2px solid #ffd700',
        marginBottom: '30px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}>
        <h3 style={{ color: '#ffd700', margin: '0 0 15px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.7)', fontSize: '1.3rem' }}>🎰 Game Settings 🎰</h3>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '10px', color: '#94a3b8' }}>Number of Decks:</label>
            <select
              value={numberOfDecks}
              onChange={(e) => {
                const newDeckCount = parseInt(e.target.value);
                setNumberOfDecks(newDeckCount);
                setTotalCards(52 * newDeckCount);
                // Reset game with new deck count
                const newDeck = initializeDeck();
                setDeck(newDeck);
                setRunningCount(0);
                setCardsDealt(0);
                setDeckPenetration(0);
                setPlayerHand([]);
                setDealerHand([]);
                setGameStatus('waiting');
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '2px solid #ffd700',
                background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                color: '#ffd700',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
            >
              <option value="1">1 Deck</option>
              <option value="2">2 Decks</option>
              <option value="4">4 Decks</option>
              <option value="6">6 Decks (Casino Standard)</option>
              <option value="8">8 Decks</option>
            </select>
          </div>
          <div style={{ color: '#e5e7eb', fontWeight: 'bold' }}>
            <strong style={{ color: '#ffd700' }}>Total Cards: </strong>{totalCards}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Count Information */}
        <div style={{
          background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
          padding: '25px',
          borderRadius: '15px',
          border: '2px solid #ff6b6b',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#ff6b6b', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.7)', fontSize: '1.2rem' }}>🎲 Card Count</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={showRunningCount}
                onChange={(e) => setShowRunningCount(e.target.checked)}
                style={{ transform: 'scale(1.1)' }}
              />
              Show Running Count
            </label>
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {showRunningCount && (
              <div>
                <strong>Running Count: </strong>
                <span style={{ 
                  color: runningCount > 0 ? '#10b981' : runningCount < 0 ? '#ef4444' : '#94a3b8',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  {runningCount > 0 ? '+' : ''}{runningCount}
                </span>
              </div>
            )}
            <div>
              <strong>True Count: </strong>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbbf24' }}>
                {getTrueCount()}
              </span>
            </div>
            <div>
              <strong>Cards Dealt: </strong>{cardsDealt}/{totalCards}
            </div>
            <div>
              <strong>Deck Penetration: </strong>{deckPenetration.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Practice Mode */}
        <div style={{
          background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
          padding: '25px',
          borderRadius: '15px',
          border: '2px solid #10b981',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ color: '#10b981', margin: '0 0 15px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.7)', fontSize: '1.2rem' }}>🎯 Practice Mode</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={practiceMode}
                onChange={(e) => setPracticeMode(e.target.checked)}
              />
              Enable Count Practice
            </label>
            {practiceMode && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={userCount}
                  onChange={(e) => setUserCount(e.target.value)}
                  placeholder="Your count"
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #334155',
                    backgroundColor: '#334155',
                    color: '#f1f5f9',
                    width: '100px'
                  }}
                />
                <button
                  onClick={checkCount}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Check
                </button>
              </div>
            )}
            <div>
              <strong>Accuracy: </strong>
              {countAccuracy.total > 0 ? 
                `${Math.round(countAccuracy.correct / countAccuracy.total * 100)}% (${countAccuracy.correct}/${countAccuracy.total})` : 
                'No attempts yet'
              }
            </div>
          </div>
        </div>

        {/* Strategy Advice */}
        <div style={{
          background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
          padding: '25px',
          borderRadius: '15px',
          border: '2px solid #8b5cf6',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ color: '#8b5cf6', margin: '0 0 15px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.7)', fontSize: '1.2rem' }}>💰 Strategy</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div>
              <strong>Betting: </strong>
              <span style={{ color: getTrueCount() >= 2 ? '#10b981' : '#94a3b8' }}>
                {getBettingRecommendation()}
              </span>
            </div>
            <div>
              <strong>Current Bet: </strong>${currentBet}
            </div>
            <div>
              <strong>Bankroll: </strong>${playerMoney}
            </div>
          </div>
        </div>
      </div>

      {/* Hi-Lo Counting Reference */}
      {showCountingHelp && (
        <div style={{
          background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
          padding: '25px',
          borderRadius: '15px',
          border: '2px solid #06b6d4',
          marginBottom: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#06b6d4', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.7)', fontSize: '1.2rem' }}>📊 Hi-Lo Counting System</h3>
            <button
              onClick={() => setShowCountingHelp(false)}
              style={{
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div>
              <strong style={{ color: '#10b981' }}>+1 (Low Cards): </strong>
              <span>2, 3, 4, 5, 6</span>
            </div>
            <div>
              <strong style={{ color: '#6b7280' }}>0 (Neutral): </strong>
              <span>7, 8, 9</span>
            </div>
            <div>
              <strong style={{ color: '#ef4444' }}>-1 (High Cards): </strong>
              <span>10, J, Q, K, A</span>
            </div>
          </div>
        </div>
      )}

      {/* Game Area */}
      <div style={{
        background: 'linear-gradient(145deg, #0f2027, #203a43, #2c5364)',
        padding: '35px',
        borderRadius: '20px',
        border: '3px solid #ffd700',
        marginBottom: '30px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,255,255,0.1)',
        position: 'relative'
      }}>
        {/* Dealer Hand */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#ff6b6b', marginBottom: '15px', textShadow: '2px 2px 4px rgba(0,0,0,0.7)', fontSize: '1.3rem' }}>
            🎴 Dealer Hand {dealerHand.length > 0 && `(${calculateHandValue(dealerHand)})`}
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {dealerHand.map((card, index) => (
              <div key={index} style={{
                width: '72px',
                height: '100px',
                background: '#ffffff',
                border: '1px solid #000000',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                padding: '4px',
                position: 'relative',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                fontFamily: 'Arial, sans-serif'
              }}>
                {/* Top left corner */}
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  lineHeight: '0.8'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: getCardColor(card.suit)
                  }}>
                    {card.value}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: getCardColor(card.suit),
                    marginTop: '1px'
                  }}>
                    {card.suit}
                  </div>
                </div>
                
                {/* Center suit symbol */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '36px',
                  color: getCardColor(card.suit)
                }}>
                  {card.suit}
                </div>
                
                {/* Bottom right corner (rotated) */}
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  lineHeight: '0.8',
                  transform: 'rotate(180deg)'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: getCardColor(card.suit)
                  }}>
                    {card.value}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: getCardColor(card.suit),
                    marginTop: '1px'
                  }}>
                    {card.suit}
                  </div>
                </div>
                {showCountingHelp && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: getCountValueColor(card.value),
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {hiLoValues[card.value] > 0 ? '+' : ''}{hiLoValues[card.value]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Player Hand */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#10b981', marginBottom: '15px', textShadow: '2px 2px 4px rgba(0,0,0,0.7)', fontSize: '1.3rem' }}>
            🃏 Your Hand {playerHand.length > 0 && `(${calculateHandValue(playerHand)})`}
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {playerHand.map((card, index) => (
              <div key={index} style={{
                width: '72px',
                height: '100px',
                background: '#ffffff',
                border: '1px solid #000000',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                padding: '4px',
                position: 'relative',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                fontFamily: 'Arial, sans-serif'
              }}>
                {/* Top left corner */}
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  lineHeight: '0.8'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: getCardColor(card.suit)
                  }}>
                    {card.value}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: getCardColor(card.suit),
                    marginTop: '1px'
                  }}>
                    {card.suit}
                  </div>
                </div>
                
                {/* Center suit symbol */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '36px',
                  color: getCardColor(card.suit)
                }}>
                  {card.suit}
                </div>
                
                {/* Bottom right corner (rotated) */}
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  lineHeight: '0.8',
                  transform: 'rotate(180deg)'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: getCardColor(card.suit)
                  }}>
                    {card.value}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: getCardColor(card.suit),
                    marginTop: '1px'
                  }}>
                    {card.suit}
                  </div>
                </div>
                {showCountingHelp && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: getCountValueColor(card.value),
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {hiLoValues[card.value] > 0 ? '+' : ''}{hiLoValues[card.value]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Game Status */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {gameStatus === 'waiting' && (
            <p style={{ color: '#94a3b8', fontSize: '18px' }}>Click "Deal Hand" to start playing</p>
          )}
          {gameStatus === 'playerWon' && (
            <p style={{ color: '#10b981', fontSize: '20px', fontWeight: 'bold' }}>You Won! +${currentBet}</p>
          )}
          {gameStatus === 'dealerWon' && (
            <p style={{ color: '#ef4444', fontSize: '20px', fontWeight: 'bold' }}>Dealer Won! -${currentBet}</p>
          )}
          {gameStatus === 'push' && (
            <p style={{ color: '#fbbf24', fontSize: '20px', fontWeight: 'bold' }}>Push! (Tie)</p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {gameStatus === 'waiting' && (
            <button
              onClick={startNewHand}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                background: 'linear-gradient(145deg, #10b981, #059669)',
                color: 'white',
                border: '3px solid #ffd700',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              }}
            >
              🎰 Deal Hand
            </button>
          )}
          
          {gameStatus === 'playing' && (
            <>
              <button
                onClick={hit}
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  background: 'linear-gradient(145deg, #3b82f6, #2563eb)',
                  color: 'white',
                  border: '3px solid #ffd700',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s'
                }}
              >
                🎯 Hit
              </button>
              <button
                onClick={stand}
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  background: 'linear-gradient(145deg, #dc2626, #b91c1c)',
                  color: 'white',
                  border: '3px solid #ffd700',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s'
                }}
              >
                ✋ Stand
              </button>
            </>
          )}

          {gameStatus !== 'playing' && gameStatus !== 'waiting' && (
            <button
              onClick={() => setGameStatus('waiting')}
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
              New Hand
            </button>
          )}

          <button
            onClick={() => {
              setDeck(initializeDeck());
              setRunningCount(0);
              setCardsDealt(0);
              setDeckPenetration(0);
              setPlayerHand([]);
              setDealerHand([]);
              setGameStatus('waiting');
            }}
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
            New Deck
          </button>
        </div>
      </div>

      {/* Learning Tips */}
      <div style={{
        background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
        padding: '25px',
        borderRadius: '15px',
        border: '2px solid #f59e0b',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}>
        <h3 style={{ color: '#f59e0b', marginBottom: '15px', textShadow: '2px 2px 4px rgba(0,0,0,0.7)', fontSize: '1.2rem' }}>💡 Card Counting Academy</h3>
        <ul style={{ color: '#94a3b8', lineHeight: '1.8' }}>
          <li><strong>Running Count:</strong> The raw count of all cards seen so far (+1 for low cards, -1 for high cards, 0 for neutral)</li>
          <li><strong>True Count:</strong> Running count divided by estimated decks remaining - this normalizes the count across different deck sizes</li>
          <li><strong>Start Simple:</strong> Focus on accurately keeping the running count before worrying about betting strategy</li>
          <li><strong>Practice Daily:</strong> Consistent practice is key to developing counting speed and accuracy</li>
          <li><strong>True Count Matters:</strong> Convert running count to true count by dividing by estimated decks remaining</li>
          <li><strong>Bankroll Management:</strong> Increase bets when true count is +2 or higher, decrease when negative</li>
          <li><strong>Stay Discrete:</strong> In real casinos, avoid obvious counting behaviors or betting patterns</li>
          <li><strong>Basic Strategy First:</strong> Master basic blackjack strategy before adding counting complexity</li>
        </ul>
      </div>
    </div>
  );
};

export default BlackjackTrainer;