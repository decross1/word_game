import type { MapData } from '../levels/staticMaps';
import type { BoardState, CellType } from '../types';

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateDynamicMap = (): MapData => {
  const width = getRandomInt(8, 12);
  const height = getRandomInt(8, 12);
  const board: BoardState = Array.from({ length: height }, () => Array(width).fill('floor'));

  // Create walls around the perimeter
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        board[y][x] = 'wall';
      }
    }
  }

  // Add some random inner walls
  const numWalls = getRandomInt(5, 15);
  for (let i = 0; i < numWalls; i++) {
    const x = getRandomInt(1, width - 2);
    const y = getRandomInt(1, height - 2);
    if (board[y][x] === 'floor') {
      board[y][x] = 'wall';
    }
  }

  const placeItem = (board: BoardState, object: CellType): [number, number] | void => {
    let placed = false;
    while (!placed) {
      const x = getRandomInt(1, width - 2);
      const y = getRandomInt(1, height - 2);
      if (board[y][x] === 'floor') {
        board[y][x] = object;
        placed = true;
        if (object === 'player') {
          return [y, x];
        }
      }
    }
  };

  const numBoxes = getRandomInt(2, 4);
  for (let i = 0; i < numBoxes; i++) {
    placeItem(board, 'box');
    placeItem(board, 'target');
  }

  const playerStart = placeItem(board, 'player') as [number, number];

  return {
    board,
    playerStart,
  };
};
