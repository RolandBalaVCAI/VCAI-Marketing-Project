import React, { useState, useEffect } from 'react';

const WitcherHangman = () => {
  const witcherWords = [
    // Characters
    { word: 'GERALT', category: 'Characters', hint: 'White Wolf, protagonist witcher', definition: 'Geralt of Rivia is a witcher, a monster hunter with supernatural abilities. Known as the White Wolf due to his distinctive white hair, he is the main protagonist of The Witcher series and is bound by destiny to Ciri.' },
    { word: 'CIRI', category: 'Characters', hint: 'Child of Surprise with Elder Blood', definition: 'Princess Cirilla Fiona Elen Riannon, known as Ciri, is the heir to Cintra and possesses Elder Blood. She has the power to travel between worlds and through time, making her incredibly powerful and sought after.' },
    { word: 'YENNEFER', category: 'Characters', hint: 'Sorceress of Vengerberg', definition: 'Yennefer of Vengerberg is a powerful sorceress and Geralt\'s main love interest. Born a hunchback, she was transformed through magic into a beautiful and formidable spellcaster. She becomes a mother figure to Ciri.' },
    { word: 'TRISS', category: 'Characters', hint: 'Sorceress with chestnut hair', definition: 'Triss Merigold is a sorceress and member of the Lodge of Sorceresses. Known for her healing abilities and chestnut hair, she has a complicated romantic history with Geralt and serves as an advisor to kings.' },
    { word: 'DANDELION', category: 'Characters', hint: 'Bard and Geralt\'s best friend', definition: 'Julian Alfred Pankratz, known as Dandelion (or Jaskier), is a famous bard, poet, and Geralt\'s closest friend. His songs and stories help spread tales of the witcher\'s adventures across the continent.' },
    { word: 'VESEMIR', category: 'Characters', hint: 'Oldest witcher of Kaer Morhen', definition: 'Vesemir is the oldest and most experienced witcher at Kaer Morhen. He serves as a father figure and mentor to younger witchers, including Geralt. He is the keeper of witcher traditions and knowledge.' },
    { word: 'LAMBERT', category: 'Characters', hint: 'Young witcher with attitude' },
    { word: 'ESKEL', category: 'Characters', hint: 'Scarred witcher, Geralt\'s brother' },
    { word: 'REGIS', category: 'Characters', hint: 'Higher vampire and barber-surgeon' },
    { word: 'CAHIR', category: 'Characters', hint: 'Nilfgaardian knight in black armor' },
    { word: 'DIJKSTRA', category: 'Characters', hint: 'Redanian spymaster' },
    { word: 'FOLTEST', category: 'Characters', hint: 'King of Temeria' },
    
    // Places
    { word: 'NOVIGRAD', category: 'Places', hint: 'Free city, largest in the Northern Kingdoms', definition: 'Novigrad is the largest city in the Northern Kingdoms and a free city-state. Known for its wealth, trade, and the Temple of Eternal Fire, it serves as a major hub for commerce and religious activity.' },
    { word: 'OXENFURT', category: 'Places', hint: 'University city on the Pontar' },
    { word: 'VIZIMA', category: 'Places', hint: 'Capital of Temeria' },
    { word: 'SKELLIGE', category: 'Places', hint: 'Archipelago of islands in the north', definition: 'The Skellige Isles are an archipelago of islands inhabited by hardy seafaring clans. Known for their warrior culture, longships, and harsh climate, the Skelligers are fierce fighters who value honor and tradition.' },
    { word: 'NILFGAARD', category: 'Places', hint: 'Southern empire ruled by emperor' },
    { word: 'REDANIA', category: 'Places', hint: 'Northern kingdom known for spies' },
    { word: 'VELEN', category: 'Places', hint: 'War-torn marshlands' },
    { word: 'KAEDWEN', category: 'Places', hint: 'Northern kingdom in the mountains' },
    { word: 'AEDIRN', category: 'Places', hint: 'Kingdom ruled by Demavend' },
    { word: 'ZERRIKANIA', category: 'Places', hint: 'Far eastern land of warriors' },
    
    // Creatures & Monsters
    { word: 'STRIGA', category: 'Monsters', hint: 'Cursed princess turned monster', definition: 'A striga is a creature born from a curse, typically involving incest or other grave sins. The most famous striga was Princess Adda, who was cursed before birth and transformed into a monster. Strigas are incredibly strong and vicious nocturnal creatures.' },
    { word: 'NEKKER', category: 'Monsters', hint: 'Small, mischievous creature' },
    { word: 'DROWNER', category: 'Monsters', hint: 'Aquatic humanoid monster' },
    { word: 'GRIFFIN', category: 'Monsters', hint: 'Winged beast, part eagle part lion', definition: 'Griffins are large, powerful creatures with the body of a lion and the head and wings of an eagle. These majestic but dangerous beasts are territorial and often nest in high places, swooping down to attack intruders.' },
    { word: 'LESHEN', category: 'Monsters', hint: 'Ancient forest guardian' },
    { word: 'WYVERN', category: 'Monsters', hint: 'Two-legged dragon' },
    { word: 'VAMPIRE', category: 'Monsters', hint: 'Blood-drinking immortal' },
    { word: 'DOPPLER', category: 'Monsters', hint: 'Shapeshifting mimic' },
    { word: 'DJINN', category: 'Monsters', hint: 'Powerful genie of air' },
    { word: 'BASILISK', category: 'Monsters', hint: 'Lizard-like draconid' },
    
    // Items & Concepts
    { word: 'MEDALLION', category: 'Items', hint: 'Witcher\'s magical amulet', definition: 'A witcher medallion is a magical amulet worn by all witchers. It vibrates when magic is near and serves as both protection and identification. Each witcher school has its own medallion design - Geralt\'s is shaped like a wolf head.' },
    { word: 'MUTAGENS', category: 'Items', hint: 'Substances that enhance abilities' },
    { word: 'GWENT', category: 'Items', hint: 'Popular card game', definition: 'Gwent is a strategic card game played throughout the Northern Kingdoms. Players build decks representing different factions and use unit cards, special abilities, and weather effects to outscore their opponents across multiple rounds.' },
    { word: 'IGNI', category: 'Magic', hint: 'Fire sign used by witchers', definition: 'Igni is one of the five witcher signs, allowing the caster to project a burst of flames. This sign is useful for combat, lighting fires, and dealing with creatures vulnerable to fire damage.' },
    { word: 'QUEN', category: 'Magic', hint: 'Protective shield sign' },
    { word: 'AARD', category: 'Magic', hint: 'Telekinetic blast sign' },
    { word: 'YRDEN', category: 'Magic', hint: 'Magic trap sign' },
    { word: 'AXII', category: 'Magic', hint: 'Mind control sign' },
    { word: 'SWALLOW', category: 'Items', hint: 'Healing potion' },
    { word: 'CAT', category: 'Items', hint: 'Night vision potion' },
    { word: 'THUNDERBOLT', category: 'Items', hint: 'Combat enhancement potion' },
    
    // Organizations & Groups
    { word: 'SCOIA', category: 'Groups', hint: 'Elven rebel commandos (first word)' },
    { word: 'LODGE', category: 'Groups', hint: 'Secret sorceress organization' },
    { word: 'SCHOOL', category: 'Groups', hint: 'Witcher training institution' },
    { word: 'WOLF', category: 'Groups', hint: 'Geralt\'s witcher school' },
    { word: 'GRIFFIN', category: 'Groups', hint: 'Witcher school of the north' },
    { word: 'CAT', category: 'Groups', hint: 'Assassin witcher school' },
    { word: 'VIPER', category: 'Groups', hint: 'Southern witcher school' },
    
    // Concepts
    { word: 'CONJUNCTION', category: 'Concepts', hint: 'Event that brought monsters to the world' },
    { word: 'PROPHECY', category: 'Concepts', hint: 'Ithlinne\'s prediction about Ciri' },
    { word: 'DESTINY', category: 'Concepts', hint: 'Force that binds Geralt and Ciri', definition: 'Destiny is a powerful force in The Witcher world that binds certain individuals together through fate. Geralt and Ciri are connected by destiny through the Law of Surprise, making their meeting inevitable despite their attempts to avoid it.' },
    { word: 'SURPRISE', category: 'Concepts', hint: 'Law of _____, claiming unknown child', definition: 'The Law of Surprise is an ancient custom where someone who saves another\'s life can claim something unexpected that the saved person finds at home - often an unborn child. This law bound Geralt to Ciri before her birth.' },
    { word: 'TRIAL', category: 'Concepts', hint: 'Deadly witcher training process' },
    { word: 'MUTATION', category: 'Concepts', hint: 'Process that creates witchers' }
  ];

  const [currentWord, setCurrentWord] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [usedWords, setUsedWords] = useState({});

  const maxWrongGuesses = 6;

  useEffect(() => {
    startNewGame();
  }, []);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only accept A-Z letters
      const key = event.key.toUpperCase();
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        // Only process if game is active
        if (gameStatus === 'playing') {
          guessLetter(key);
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameStatus, guessedLetters, currentWord]); // Dependencies to ensure fresh state

  const getAvailableCategories = () => {
    const categories = ['All', ...new Set(witcherWords.map(word => word.category))];
    return categories;
  };

  const getFilteredWords = () => {
    if (selectedCategory === 'All') {
      return witcherWords;
    }
    return witcherWords.filter(word => word.category === selectedCategory);
  };

  const getAvailableWords = (category) => {
    const filteredWords = category === 'All' ? witcherWords : witcherWords.filter(word => word.category === category);
    const categoryUsedWords = usedWords[category] || [];
    const availableWords = filteredWords.filter(word => !categoryUsedWords.includes(word.word));
    
    // If all words have been used, reset and return all words
    if (availableWords.length === 0) {
      setUsedWords(prev => ({ ...prev, [category]: [] }));
      return filteredWords;
    }
    
    return availableWords;
  };

  const markWordAsUsed = (word, category) => {
    setUsedWords(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), word]
    }));
  };

  const startNewGame = () => {
    const availableWords = getAvailableWords(selectedCategory);
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(randomWord);
    markWordAsUsed(randomWord.word, selectedCategory);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus('playing');
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Start new game with new category
    const availableWords = getAvailableWords(category);
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(randomWord);
    markWordAsUsed(randomWord.word, category);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus('playing');
  };

  const guessLetter = (letter) => {
    if (guessedLetters.includes(letter) || gameStatus !== 'playing') return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus('lost');
      }
    } else {
      // Check if word is complete
      const wordLetters = currentWord.word.split('');
      const isComplete = wordLetters.every(letter => newGuessedLetters.includes(letter));
      if (isComplete) {
        setGameStatus('won');
      }
    }
  };

  const getDisplayWord = () => {
    if (!currentWord) return '';
    return currentWord.word
      .split('')
      .map(letter => guessedLetters.includes(letter) ? letter : '_')
      .join(' ');
  };

  const getHangmanDrawing = () => {
    const drawings = [
      '', // 0 wrong
      '  |\n  |\n  |\n  |', // 1 wrong
      '  +---+\n  |   |\n      |\n      |\n      |', // 2 wrong
      '  +---+\n  |   |\n  O   |\n      |\n      |', // 3 wrong
      '  +---+\n  |   |\n  O   |\n  |   |\n      |', // 4 wrong
      '  +---+\n  |   |\n  O   |\n /|   |\n      |', // 5 wrong
      '  +---+\n  |   |\n  O   |\n /|\\  |\n /    |' // 6 wrong (game over)
    ];
    return drawings[wrongGuesses] || drawings[0];
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const getGameStatusMessage = () => {
    if (gameStatus === 'won') {
      return `🎉 Victory! You saved the day, witcher!`;
    }
    if (gameStatus === 'lost') {
      return `💀 Defeated! The word was "${currentWord?.word}". Try again!`;
    }
    return `Wrong guesses: ${wrongGuesses}/${maxWrongGuesses}`;
  };

  const getStatusColor = () => {
    if (gameStatus === 'won') return '#10b981';
    if (gameStatus === 'lost') return '#ef4444';
    return wrongGuesses >= 4 ? '#f59e0b' : '#6b7280';
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Georgia, serif',
      backgroundColor: '#1a1a1a',
      color: '#f5f5f5',
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#ffd700',
        fontSize: '3rem',
        marginBottom: '10px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        fontWeight: 'bold'
      }}>
        ⚔️ The Witcher Hangman ⚔️
      </h1>
      <p style={{
        textAlign: 'center',
        color: '#cccccc',
        marginBottom: '40px',
        fontSize: '1.2rem',
        fontStyle: 'italic'
      }}>
        "Evil is evil. Guess the word, or face the consequences."
      </p>

      {/* Category Selection */}
      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '30px',
        borderRadius: '12px',
        border: '2px solid #444',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        marginBottom: '30px'
      }}>
        <h3 style={{
          color: '#ffd700',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Choose Your Quest Category
        </h3>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center'
        }}>
          {getAvailableCategories().map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '2px solid #666',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedCategory === category ? '#ffd700' : '#4a4a4a',
                color: selectedCategory === category ? '#1a1a1a' : '#ffd700',
                transition: 'all 0.2s'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Hangman Drawing */}
      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '30px',
        borderRadius: '12px',
        border: '2px solid #444',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        marginBottom: '30px'
      }}>
        <h3 style={{
          color: '#ffd700',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Gallows
        </h3>
        <pre style={{
          fontSize: '18px',
          color: '#ff6b6b',
          textAlign: 'center',
          fontFamily: 'monospace',
          lineHeight: '1.2',
          margin: 0,
          minHeight: '120px'
        }}>
          {getHangmanDrawing()}
        </pre>
      </div>

      {/* Game Info */}
      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '30px',
        borderRadius: '12px',
        border: '2px solid #444',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        marginBottom: '30px'
      }}>
        {currentWord && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#ffd700', margin: '0 0 10px 0' }}>
                Category: {currentWord.category}
              </h3>
              <p style={{
                marginTop: '10px',
                color: '#cccccc',
                fontStyle: 'italic',
                fontSize: '16px',
                backgroundColor: '#3a3a3a',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #555',
                margin: '10px 0'
              }}>
                💡 {currentWord.hint}
              </p>
            </div>

            <div style={{
              fontSize: '2rem',
              letterSpacing: '8px',
              textAlign: 'center',
              fontFamily: 'monospace',
              color: '#ffffff',
              backgroundColor: '#333',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #555'
            }}>
              {getDisplayWord()}
            </div>

            <div style={{
              textAlign: 'center',
              fontSize: '16px',
              color: getStatusColor(),
              fontWeight: 'bold'
            }}>
              {getGameStatusMessage()}
            </div>

            {/* Definition Display - Show after game ends */}
            {(gameStatus === 'won' || gameStatus === 'lost') && (
              <div style={{
                marginTop: '25px',
                padding: '20px',
                backgroundColor: '#333',
                borderRadius: '8px',
                border: '2px solid #ffd700',
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
              }}>
                <h4 style={{
                  color: '#ffd700',
                  margin: '0 0 10px 0',
                  fontSize: '18px',
                  textAlign: 'center'
                }}>
                  📖 About "{currentWord.word}"
                </h4>
                <p style={{
                  color: '#e5e5e5',
                  lineHeight: '1.6',
                  margin: 0,
                  fontSize: '14px',
                  textAlign: 'left'
                }}>
                  {currentWord.definition || `${currentWord.word} is from the ${currentWord.category} category. ${currentWord.hint}`}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Alphabet */}
      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '30px',
        borderRadius: '12px',
        border: '2px solid #444',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        marginBottom: '30px'
      }}>
        <h3 style={{
          color: '#ffd700',
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          Choose a Letter
        </h3>
        <p style={{
          color: '#cccccc',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '20px',
          fontStyle: 'italic'
        }}>
          Click buttons below or use your keyboard (A-Z)
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '10px',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          {alphabet.map(letter => {
            const isGuessed = guessedLetters.includes(letter);
            const isCorrect = isGuessed && currentWord?.word.includes(letter);
            const isWrong = isGuessed && !currentWord?.word.includes(letter);
            
            return (
              <button
                key={letter}
                onClick={() => guessLetter(letter)}
                disabled={isGuessed || gameStatus !== 'playing'}
                style={{
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: '2px solid #666',
                  borderRadius: '8px',
                  cursor: isGuessed || gameStatus !== 'playing' ? 'not-allowed' : 'pointer',
                  backgroundColor: isCorrect ? '#10b981' : isWrong ? '#ef4444' : '#4a4a4a',
                  color: isGuessed ? '#ffffff' : '#ffd700',
                  opacity: isGuessed ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* New Game Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={startNewGame}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: '#ffd700',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          🎲 New Quest
        </button>
      </div>

      {/* Game Stats */}
      {currentWord && (
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          color: '#999',
          fontSize: '14px'
        }}>
          <p>Letters guessed: {guessedLetters.length} | Word length: {currentWord.word.length}</p>
          <p>
            Category progress: {(usedWords[selectedCategory] || []).length} / {getFilteredWords().length} words completed
            {(usedWords[selectedCategory] || []).length === getFilteredWords().length && 
              <span style={{ color: '#ffd700', fontWeight: 'bold' }}> ✨ Category Complete! ✨</span>
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default WitcherHangman;