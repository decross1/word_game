import React, { useState, useEffect } from 'react';
import Board from './Board';
import Instructions from './Instructions';
import styled from '@emotion/styled';
import type { BoardState, CellType } from './Board';

const StatsPanel = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LevelComplete = styled.div`
  background: #4CAF50;
  color: white;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.5s ease-in;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const StatItem = styled.div`
  display: inline-block;
  margin: 0 15px;
  font-size: 18px;
  color: #555;

  span {
    font-weight: bold;
    color: #333;
  }
`;

const LEVEL_1: BoardState = [
  ['wall', 'wall', 'wall', 'wall', 'wall'],
  ['wall', 'floor', 'floor', 'floor', 'wall'],
  ['wall', 'floor', 'box', 'target', 'wall'],
  ['wall', 'floor', 'player', 'floor', 'wall'],
  ['wall', 'wall', 'wall', 'wall', 'wall'],
];

const Game: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(LEVEL_1);
  const [playerPosition, setPlayerPosition] = useState<[number, number]>([3, 2]);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [pushCount, setPushCount] = useState(0);

  const checkLevelComplete = (newBoard: BoardState) => {
    // Check if there are any boxes not on targets
    for (let row of newBoard) {
      for (let cell of row) {
        if (cell === 'box') {
          return false; // Found a box not on a target
        }
      }
    }
    return true; // All boxes are on targets
  };

  const movePlayer = (dx: number, dy: number) => {
    if (isLevelComplete) return; // Prevent movement after level completion

    const [row, col] = playerPosition;
    const newRow = row + dy;
    const newCol = col + dx;

    // Check if the new position is within bounds
    if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board[0].length) {
      return;
    }

    // Check if the new position is a wall
    if (board[newRow][newCol] === 'wall') {
      return;
    }

    // Handle box pushing
    if (board[newRow][newCol] === 'box' || board[newRow][newCol] === 'boxOnTarget') {
      const nextRow = newRow + dy;
      const nextCol = newCol + dx;

      // Check if box can be pushed
      if (nextRow < 0 || nextRow >= board.length || nextCol < 0 || nextCol >= board[0].length) {
        return;
      }

      if (board[nextRow][nextCol] === 'wall' || 
          board[nextRow][nextCol] === 'box' || 
          board[nextRow][nextCol] === 'boxOnTarget') {
        return;
      }

      // Move the box
      const newBoard = [...board.map(row => [...row])];
      newBoard[nextRow][nextCol] = board[nextRow][nextCol] === 'target' ? 'boxOnTarget' : 'box';
      newBoard[newRow][newCol] = board[newRow][newCol] === 'boxOnTarget' ? 'target' : 'floor';
      newBoard[row][col] = board[row][col] === 'player' ? 'floor' : 'target';
      newBoard[newRow][newCol] = 'player';
      
      setBoard(newBoard);
      setPlayerPosition([newRow, newCol]);
      setMoveCount(prev => prev + 1);
      setPushCount(prev => prev + 1);
      
      // Check if level is complete after the move
      const levelComplete = checkLevelComplete(newBoard);
      if (levelComplete) {
        setIsLevelComplete(true);
      }
      return;
    }

    // Move player
    const newBoard = [...board.map(row => [...row])];
    newBoard[row][col] = board[row][col] === 'player' ? 'floor' : 'target';
    newBoard[newRow][newCol] = 'player';
    
    setBoard(newBoard);
    setPlayerPosition([newRow, newCol]);
    setMoveCount(prev => prev + 1);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [board, playerPosition, isLevelComplete]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Sokoban Game</h1>
      
      <StatsPanel>
        {isLevelComplete ? (
          <LevelComplete>
            Level Complete! 🎉
          </LevelComplete>
        ) : null}
        
        <StatItem>
          Moves: <span>{moveCount}</span>
        </StatItem>
        <StatItem>
          Pushes: <span>{pushCount}</span>
        </StatItem>
      </StatsPanel>

      <Board board={board} isLevelComplete={isLevelComplete} />
      <Instructions />
    </div>
  );
};

export default Game; 