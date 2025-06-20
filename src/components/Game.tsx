import React, { useState, useEffect } from 'react';
import Board from './Board';
import Instructions from './Instructions';
import LevelSelectionModal from './LevelSelectionModal';
import styled from '@emotion/styled';
import type { BoardState } from './Board';
import type { LevelData } from '../levels';
import { LEVELS, getNextLevel } from '../levels';

const GameContainer = styled.div`
  text-align: center;
  padding: 20px;
  position: relative;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const ResetButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
  
  &:hover {
    transform: rotate(180deg);
    background: #f5f5f5;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

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

const Button = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin: 0 10px;
  transition: background-color 0.2s;

  &:hover {
    background: #45a049;
  }

  &.reset {
    background: #f44336;
    
    &:hover {
      background: #e53935;
    }
  }
`;

const ButtonGroup = styled.div`
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 10px;
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

const ProgressBar = styled.div`
  width: 300px;
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  margin: 20px auto;
  overflow: hidden;
`;

const Progress = styled.div<{ width: number }>`
  width: ${props => props.width}%;
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
`;

const LevelIndicator = styled.div`
  font-size: 1.2em;
  color: #666;
  margin: 10px 0;
  
  span {
    color: #4CAF50;
    font-weight: bold;
  }
`;

const MenuButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
  margin-right: 10px;
  
  &:hover {
    background: #f5f5f5;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Game: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [board, setBoard] = useState<BoardState>(LEVELS[currentLevel].board);
  const [playerPosition, setPlayerPosition] = useState<[number, number]>(LEVELS[currentLevel].playerStart);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [pushCount, setPushCount] = useState(0);
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const resetLevel = () => {
    const level = LEVELS[currentLevel];
    setBoard(level.board);
    setPlayerPosition(level.playerStart);
    setIsLevelComplete(false);
    setMoveCount(0);
    setPushCount(0);
  };

  const progressToNextLevel = () => {
    const nextLevel = getNextLevel(currentLevel);
    if (nextLevel !== null) {
      setCurrentLevel(nextLevel);
      setHighestUnlockedLevel(prev => Math.max(prev, nextLevel));
      const level = LEVELS[nextLevel];
      setBoard(level.board);
      setPlayerPosition(level.playerStart);
      setIsLevelComplete(false);
      setMoveCount(0);
      setPushCount(0);
    }
  };

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
    if (isLevelComplete) return;

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

    // Create new board state
    const newBoard = [...board.map(row => [...row])];

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

      // Set the next position (where the box will be pushed)
      newBoard[nextRow][nextCol] = board[nextRow][nextCol] === 'target' ? 'boxOnTarget' : 'box';
      
      // Restore the current position (where the player was)
      newBoard[row][col] = board[row][col] === 'playerOnTarget' ? 'target' : 'floor';
      
      // Move player to the box's position
      newBoard[newRow][newCol] = board[newRow][newCol] === 'boxOnTarget' ? 'playerOnTarget' : 'player';
      
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

    // Regular player movement (no box pushing)
    // Restore the current position (where the player was)
    newBoard[row][col] = board[row][col] === 'playerOnTarget' ? 'target' : 'floor';
    
    // Move player to new position, preserving target state
    newBoard[newRow][newCol] = board[newRow][newCol] === 'target' ? 'playerOnTarget' : 'player';
    
    setBoard(newBoard);
    setPlayerPosition([newRow, newCol]);
    setMoveCount(prev => prev + 1);
  };

  const selectLevel = (levelIndex: number) => {
    setCurrentLevel(levelIndex);
    const level = LEVELS[levelIndex];
    setBoard(level.board);
    setPlayerPosition(level.playerStart);
    setIsLevelComplete(false);
    setMoveCount(0);
    setPushCount(0);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' && e.ctrlKey) {
        resetLevel();
        return;
      }

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

  const progressPercentage = ((currentLevel + (isLevelComplete ? 1 : 0)) / LEVELS.length) * 100;

  return (
    <GameContainer>
      <TitleSection>
        <h1>Sokoban Game</h1>
        {!isLevelComplete && (
          <>
            <MenuButton 
              onClick={() => setIsMenuOpen(true)} 
              title="Select Level"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" 
                  fill="black"
                />
              </svg>
            </MenuButton>
            <ResetButton onClick={resetLevel} title="Reset Level (Ctrl+R)">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4 12C4 7.58172 7.58172 4 12 4C14.5171 4 16.7796 5.1017 18.3203 6.88446L16 9H22V3L19.4081 5.59191C17.5119 3.51137 14.8768 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12H20C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z"
                  fill="black"
                />
              </svg>
            </ResetButton>
          </>
        )}
      </TitleSection>

      <LevelSelectionModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentLevel={currentLevel}
        highestUnlockedLevel={highestUnlockedLevel}
        onSelectLevel={selectLevel}
      />

      <LevelIndicator>
        Level <span>{currentLevel + 1}</span> of {LEVELS.length}
      </LevelIndicator>
      
      <ProgressBar>
        <Progress width={progressPercentage} />
      </ProgressBar>
      
      <StatsPanel>
        {isLevelComplete ? (
          <>
            <LevelComplete>
              Level {currentLevel + 1} Complete! 🎉
            </LevelComplete>
            <ButtonGroup>
              {getNextLevel(currentLevel) !== null ? (
                <Button onClick={progressToNextLevel}>
                  Next Level
                </Button>
              ) : (
                <Button onClick={() => {
                  setCurrentLevel(0);
                  resetLevel();
                }}>
                  Play Again
                </Button>
              )}
            </ButtonGroup>
          </>
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
    </GameContainer>
  );
};

export default Game; 