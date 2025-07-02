import React, { useState, useEffect } from 'react';
import Board from './Board';
import Instructions from './Instructions';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import type { BoardState } from '../types';
import type { MapData } from '../levels';
import { MAPS } from '../levels';
import { generateDynamicMap } from '../utils/mapGenerator';
import { validateMap, type ValidationResult } from '../utils/mapValidation';

const GlobalStyle = () => (
  <Global
    styles={css`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
      body {
        background-color: #f0f2f5;
        font-family: 'Poppins', sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      }
    `}
  />
);

const GameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem; // Reduced gap for a tighter look
  padding: 2rem;
  max-width: 100%;
`;

const Title = styled.h1`
  font-size: 2.5rem; // Slightly smaller title
  color: #1a202c;
  font-weight: 600;
  margin: 0;
`;

const GameStats = styled.div`
  font-size: 1.1rem; // Slightly smaller stats
  color: #4a5568;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  background-color: #4a5568;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;

  &:hover {
    background-color: #2d3748;
  }

  &:active {
    transform: scale(0.98);
  }

  &.report {
    background-color: #e53e3e; // Red for report button
    &:hover {
      background-color: #c53030;
    }
  }
`;

const MapCompleteStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  color: #c53030;
  background: #fed7d7;
  border: 1px solid #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const Game: React.FC = () => {
  const [currentMap, setCurrentMap] = useState(0);
  const [board, setBoard] = useState<BoardState>([]);
  const [initialBoard, setInitialBoard] = useState<BoardState>([]);
  const [playerPos, setPlayerPos] = useState<[number, number]>([0, 0]);
  const [initialPlayerPos, setInitialPlayerPos] = useState<[number, number]>([0, 0]);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [moveCount, setMoveCount] = useState(0);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const mapFromURL = queryParams.get('map');
    if (mapFromURL) {
      const mapIndex = parseInt(mapFromURL, 10) - 1;
      if (!isNaN(mapIndex) && mapIndex >= 0) {
        setCurrentMap(mapIndex);
      }
    }
  }, []);

  const loadMap = (mapIndex: number) => {
    console.log(`Generating dynamic map for Level ${mapIndex + 1}...`);
    let dynamicMap: MapData;
    let validation: ValidationResult;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      dynamicMap = generateDynamicMap();
      validation = validateMap(dynamicMap.board);
      attempts++;
    } while (!validation.isValid && attempts < maxAttempts);

    let mapData: MapData;
    if (!validation.isValid) {
      console.error('Failed to generate a valid dynamic map. Loading a fallback static map.');
      setMapError('Could not generate a valid map. Loading a fallback instead.');
      mapData = MAPS[mapIndex % MAPS.length];
    } else {
      console.log(`Successfully generated a valid map for Level ${mapIndex + 1} in ${attempts} attempt(s).`);
      setMapError(null);
      mapData = dynamicMap;
    }

    const newBoard = mapData.board.map(row => [...row]);
    setBoard(newBoard);
    setInitialBoard(newBoard); // Save the initial state
    setPlayerPos(mapData.playerStart);
    setInitialPlayerPos(mapData.playerStart);
    setIsLevelComplete(false);
    setMoveCount(0);
  };

  const resetMap = () => {
    if (initialBoard.length > 0) {
      setBoard(initialBoard.map(row => [...row]));
      setPlayerPos(initialPlayerPos);
      setIsLevelComplete(false);
      setMoveCount(0);
    }
  };

  const handleNextMap = () => {
    const nextMapIndex = currentMap + 1;
    const mapsPerRun = 10;

    if (nextMapIndex < mapsPerRun) {
      setCurrentMap(nextMapIndex);
    } else {
      alert(`Congratulations! You've completed a run of ${mapsPerRun} dynamic maps!`);
      setCurrentMap(0);
    }
  };

  const handleReportUnsolvable = async () => {
    try {
      const response = await fetch('/api/report-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board: initialBoard, // Send the original board state
          playerStart: initialPlayerPos,
        }),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error.');
      }

      alert('Unsolvable map has been automatically saved! Advancing to the next level.');
    } catch (error) {
      console.error('Failed to report unsolvable map:', error);
      alert('Could not save the map automatically. Please check the console for details.');
    } finally {
      handleNextMap();
    }
  };

  const checkMapComplete = (currentBoard: BoardState): boolean => {
    // A map is complete if there are no more 'target' tiles left.
    // A 'playerOnTarget' tile still counts as an empty target, because the player must move.
    for (let r = 0; r < currentBoard.length; r++) {
      for (let c = 0; c < currentBoard[r].length; c++) {
        const tile = currentBoard[r][c];
        if (tile === 'target' || tile === 'playerOnTarget') {
          return false; // Found an empty target, so the map is not complete.
        }
      }
    }
    return true; // All targets are covered by boxes.
  };

  useEffect(() => {
    loadMap(currentMap);
  }, [currentMap]);

  useEffect(() => {
    if (!initialBoard.length) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' || (e.key === 'R' && e.ctrlKey)) {
        resetMap();
        return;
      }

      if (isLevelComplete) return;

      switch (e.key) {
        case 'ArrowUp': case 'w': movePlayer(0, -1); break;
        case 'ArrowDown': case 's': movePlayer(0, 1); break;
        case 'ArrowLeft': case 'a': movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': movePlayer(1, 0); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [board, playerPos, isLevelComplete, initialBoard]);

  const movePlayer = (dx: number, dy: number) => {
    if (isLevelComplete) return;

    const [row, col] = playerPos;
    const newRow = row + dy;
    const newCol = col + dx;

    if (newRow < 0 || newRow >= board.length || newCol < 0 || newCol >= board[0].length) {
      return;
    }

    const newBoard = board.map(r => [...r]);
    const targetCell = newBoard[newRow][newCol];

    if (targetCell === 'wall') {
      return;
    }

    if (targetCell === 'box' || targetCell === 'boxOnTarget') {
      const nextRow = newRow + dy;
      const nextCol = newCol + dx;

      if (nextRow < 0 || nextRow >= board.length || nextCol < 0 || nextCol >= board[0].length) {
        return;
      }

      const afterBoxCell = newBoard[nextRow][nextCol];
      if (afterBoxCell === 'wall' || afterBoxCell === 'box' || afterBoxCell === 'boxOnTarget') {
        return;
      }

      newBoard[nextRow][nextCol] = afterBoxCell === 'target' ? 'boxOnTarget' : 'box';
      newBoard[newRow][newCol] = targetCell === 'boxOnTarget' ? 'target' : 'floor';
    }

    newBoard[row][col] = board[row][col] === 'playerOnTarget' ? 'target' : 'floor';
    newBoard[newRow][newCol] = newBoard[newRow][newCol] === 'target' || newBoard[newRow][newCol] === 'boxOnTarget' ? 'playerOnTarget' : 'player';

    setBoard(newBoard);
    setPlayerPos([newRow, newCol]);
    setMoveCount(prev => prev + 1);

    if (checkMapComplete(newBoard)) {
      setIsLevelComplete(true);
    }
  };

  return (
    <GameWrapper>
      <GlobalStyle />
      <Title>Sokoban</Title>
      <GameStats>
        Level {currentMap + 1} | Moves: {moveCount}
      </GameStats>

      {mapError ? (
        <ErrorMessage>{mapError}</ErrorMessage>
      ) : (
        <Board board={board} isLevelComplete={isLevelComplete} />
      )}

      {isLevelComplete ? (
        <MapCompleteStyled>
          <span>Level Complete!</span>
          <Button onClick={handleNextMap}>Next Level</Button>
        </MapCompleteStyled>
      ) : (
        <Controls>
          <Button onClick={resetMap}>Restart</Button>
          <Button className="report" onClick={handleReportUnsolvable}>Report Map</Button>
        </Controls>
      )}

      <Instructions />
    </GameWrapper>
  );
};

export default Game;