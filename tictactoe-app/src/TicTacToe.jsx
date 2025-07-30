import React, { useState } from 'react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (board[i] || winner) return;
    
    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    
    const newWinner = calculateWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const renderSquare = (i) => {
    return (
      <button 
        className="square" 
        onClick={() => handleClick(i)}
        style={{
          width: '80px',
          height: '80px',
          fontSize: '36px',
          fontWeight: 'bold',
          border: '2px solid #333',
          backgroundColor: '#fff',
          color: '#000',
          cursor: 'pointer',
          outline: 'none',
          borderRadius: '0',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {board[i]}
      </button>
    );
  };

  const status = winner 
    ? `Winner: ${winner}` 
    : board.every(square => square !== null) 
    ? 'Draw!' 
    : `Next player: ${isXNext ? 'X' : 'O'}`;

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1>Tic-Tac-Toe</h1>
      <div style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
        {status}
      </div>
      <div style={{ display: 'inline-block' }}>
        <div style={{ display: 'flex' }}>
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div style={{ display: 'flex' }}>
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div style={{ display: 'flex' }}>
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={resetGame}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default TicTacToe;