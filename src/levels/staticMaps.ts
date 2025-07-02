import type { BoardState } from '../types';

export interface MapData {
  board: BoardState;
  playerStart: [number, number];
  minimumMoves?: number;  // Optional: for future high score tracking
}

export const STATIC_MAPS: MapData[] = [
  // Level 1 - Simple Introduction
  {
    board: [
      ['wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'floor', 'floor', 'floor', 'wall'],
      ['wall', 'floor', 'box', 'target', 'wall'],
      ['wall', 'floor', 'player', 'floor', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall'],
    ],
    playerStart: [3, 2]
  },
  
  // Level 2 - Two Boxes
  {
    board: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'floor', 'floor', 'floor', 'floor', 'wall'],
      ['wall', 'floor', 'box', 'box', 'target', 'wall'],
      ['wall', 'floor', 'player', 'floor', 'target', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ],
    playerStart: [3, 2]
  },
  
  // Level 3 - Corner Challenge
  {
    board: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'target', 'target', 'floor', 'floor', 'wall'],
      ['wall', 'floor', 'wall', 'box', 'floor', 'wall'],
      ['wall', 'floor', 'box', 'floor', 'floor', 'wall'],
      ['wall', 'floor', 'floor', 'floor', 'player', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ],
    playerStart: [4, 4]
  },

  // Level 4 - Maze Runner
  {
    board: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'floor', 'floor', 'floor', 'wall', 'target', 'target', 'wall'],
      ['wall', 'floor', 'box', 'player', 'wall', 'floor', 'floor', 'wall'],
      ['wall', 'floor', 'box', 'floor', 'floor', 'floor', 'floor', 'wall'],
      ['wall', 'wall', 'wall', 'floor', 'wall', 'floor', 'floor', 'wall'],
      ['wall', 'floor', 'floor', 'floor', 'wall', 'floor', 'floor', 'wall'],
      ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ],
    playerStart: [2, 3]
  },

  // Level 5 - The Hook
  {
    board: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
      ['wall', 'floor', 'target', 'wall', 'floor', 'floor', 'wall'],
      ['wall', 'floor', 'box', 'floor', 'box', 'target', 'wall'],
      ['wall', 'floor', 'floor', 'player', 'wall', 'floor', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ],
    playerStart: [4, 3]
  },

  // Level 6 - The Fortress
  {
    board: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'floor', 'floor', 'player', 'floor', 'floor', 'floor', 'wall'],
      ['wall', 'floor', 'box', 'wall', 'box', 'floor', 'wall', 'wall'],
      ['wall', 'floor', 'target', 'floor', 'target', 'floor', 'wall', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ],
    playerStart: [1, 3]
  },
];
