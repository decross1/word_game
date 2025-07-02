import type { BoardState } from '../components/Board';
import { solve } from './solver';

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export const parseMap = (text: string): BoardState | null => {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return null;

  return lines.map(line =>
    line.split('').map(char => {
      switch (char) {
        case '#': return 'wall';
        case ' ': return 'floor';
        case '@': return 'player';
        case '$': return 'box';
        case '.': return 'target';
        case '*': return 'boxOnTarget';
        default: return 'floor';
      }
    })
  );
};

const isWall = (board: BoardState, row: number, col: number): boolean => {
  if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
    return true; // Treat out-of-bounds as a wall
  }
  return board[row][col] === 'wall';
};

const isWallOrBox = (board: BoardState, row: number, col: number): boolean => {
  if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
    return true; // Out of bounds is like a wall
  }
  const cell = board[row][col];
  return cell === 'wall' || cell === 'box' || cell === 'boxOnTarget';
};

const findAllReachableTiles = (board: BoardState, startPos: [number, number]): Set<string> => {
  const queue: [number, number][] = [startPos];
  const visited = new Set<string>([`${startPos[0]},${startPos[1]}`]);
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      const key = `${newRow},${newCol}`;

      if (!visited.has(key) && !isWallOrBox(board, newRow, newCol)) {
        visited.add(key);
        queue.push([newRow, newCol]);
      }
    }
  }
  return visited;
};

const findPlayer = (board: BoardState): [number, number] | null => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 'player' || board[row][col] === 'playerOnTarget') {
        return [row, col];
      }
    }
  }
  return null;
};

// New deadlock detection for more complex traps
const hasAdvancedDeadlocks = (board: BoardState): boolean => {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === 'box') {
        const isWallUp = isWall(board, r - 1, c);
        const isWallDown = isWall(board, r + 1, c);
        const isWallLeft = isWall(board, r, c - 1);
        const isWallRight = isWall(board, r, c + 1);

        // Check for box trapped between two parallel walls (in a corridor)
        if (isWallUp && isWallDown) {
          // Check if there's a target in this vertical corridor
          let targetInCorridor = false;
          for (let i = 0; i < board.length; i++) {
            if (isWall(board, i, c-1) && isWall(board, i, c+1) && (board[i][c] === 'target' || board[i][c] === 'boxOnTarget')) {
              targetInCorridor = true;
              break;
            }
          }
          if (!targetInCorridor) return true; // Deadlock: Trapped in vertical corridor with no goal
        }

        if (isWallLeft && isWallRight) {
          // Check if there's a target in this horizontal corridor
          let targetInCorridor = false;
          for (let i = 0; i < board[r].length; i++) {
            if (isWall(board, r-1, i) && isWall(board, r+1, i) && (board[r][i] === 'target' || board[r][i] === 'boxOnTarget')) {
              targetInCorridor = true;
              break;
            }
          }
          if (!targetInCorridor) return true; // Deadlock: Trapped in horizontal corridor with no goal
        }

        // Check for adjacent box deadlocks
        // Horizontal pair (e.g., $$) pinned against a top or bottom wall
        if (c < board[r].length - 1 && board[r][c+1] === 'box') {
            if (isWallUp && isWall(board, r - 1, c + 1)) return true;
            if (isWallDown && isWall(board, r + 1, c + 1)) return true;
        }
        // Vertical pair pinned against a left or right wall
        if (r < board.length - 1 && board[r+1][c] === 'box') {
            if (isWallLeft && isWall(board, r + 1, c - 1)) return true;
            if (isWallRight && isWall(board, r + 1, c + 1)) return true;
        }

        // Check for 2x2 box cluster deadlock
        if (r < board.length - 1 && c < board[r].length - 1) {
            const isBoxRight = board[r][c+1] === 'box';
            const isBoxDown = board[r+1][c] === 'box';
            const isBoxDownRight = board[r+1][c+1] === 'box';
            if (isBoxRight && isBoxDown && isBoxDownRight) {
                // If any of the 4 squares are targets, it might be solvable
                if (board[r][c] !== 'target' && board[r][c+1] !== 'target' && 
                    board[r+1][c] !== 'target' && board[r+1][c+1] !== 'target') {
                    return true;
                }
            }
        }
      }
    }
  }
  return false;
};

export const validateMap = (board: BoardState): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!board || board.length === 0 || board[0].length === 0) {
    errors.push({ type: 'error', message: 'Map is empty' });
    return { isValid: false, errors, warnings };
  }

  let playerCount = 0, boxCount = 0, targetCount = 0;

  for (const row of board) {
    for (const cell of row) {
      if (cell === 'player' || cell === 'playerOnTarget') playerCount++;
      if (cell === 'box' || cell === 'boxOnTarget') boxCount++;
      if (cell === 'target' || cell === 'boxOnTarget' || cell === 'playerOnTarget') targetCount++;
    }
  }

  if (playerCount === 0) errors.push({ type: 'error', message: 'No player found' });
  if (playerCount > 1) errors.push({ type: 'error', message: 'Multiple players found' });
  if (boxCount === 0) errors.push({ type: 'error', message: 'No boxes found' });
  if (targetCount === 0) errors.push({ type: 'error', message: 'No targets found' });
  if (boxCount !== targetCount) errors.push({ type: 'error', message: 'Box count does not match target count' });

  const playerPos = findPlayer(board);
  if (playerPos) {
    const reachableTiles = findAllReachableTiles(board, playerPos);

    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        // Check for boxes that are completely inaccessible
        if (board[r][c] === 'box' || board[r][c] === 'boxOnTarget') {
          const canAccess = reachableTiles.has(`${r - 1},${c}`) || reachableTiles.has(`${r + 1},${c}`) ||
                            reachableTiles.has(`${r},${c - 1}`) || reachableTiles.has(`${r},${c + 1}`);
          if (!canAccess) {
            errors.push({ type: 'error', message: `Box at (${r}, ${c}) is unreachable` });
          }
        }

        // Check for boxes in a corner trap (that isn't a target)
        if (board[r][c] === 'box') {
          const isTrapped = (isWall(board, r - 1, c) && isWall(board, r, c - 1)) || // Top-left
                            (isWall(board, r - 1, c) && isWall(board, r, c + 1)) || // Top-right
                            (isWall(board, r + 1, c) && isWall(board, r, c - 1)) || // Bottom-left
                            (isWall(board, r + 1, c) && isWall(board, r, c + 1));   // Bottom-right
          if (isTrapped) {
            errors.push({ type: 'error', message: `Box at (${r}, ${c}) is in a corner trap` });
          }
        }
      }
    }
  } else {
    if (playerCount > 0) errors.push({ type: 'error', message: 'Player position could not be determined despite player count > 0' });
  }

  // Check for advanced deadlocks
  if (hasAdvancedDeadlocks(board)) {
    errors.push({ type: 'error', message: 'Map contains an advanced deadlock (e.g., box in a corridor with no target)' });
  }

  // Final check: use the micro-solver to confirm solvability
  // We only run this if no other errors are found, as it's the most expensive check.
  if (errors.length === 0) {
    const [solution] = solve(board);
    if (solution === false) {
      errors.push({ type: 'error', message: 'Map is unsolvable according to the micro-solver.' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
