import type { BoardState } from '../components/Board';

export interface LevelData {
  board: BoardState;
  playerStart: [number, number];
  minimumMoves?: number;  // Optional: for future high score tracking
}

export const LEVELS: LevelData[] = [
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
];

// Helper functions for level management
export const isLevelUnlocked = (levelIndex: number, highestUnlockedLevel: number): boolean => {
  return levelIndex <= highestUnlockedLevel;
};

export const getNextLevel = (currentLevel: number): number | null => {
  return currentLevel + 1 < LEVELS.length ? currentLevel + 1 : null;
}; 