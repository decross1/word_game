import type { BoardState, CellType } from '../types';

// --- Helper functions adapted for our project ---

const cloneBoard = (board: BoardState): BoardState => {
  return board.map(row => [...row]);
};

const findChar = (board: BoardState, char: CellType): [number, number][] => {
  const positions: [number, number][] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === char) {
        positions.push([r, c]);
      }
    }
  }
  return positions;
};

const checkGameWon = (board: BoardState): boolean => {
  // The game is won if there are no 'box' tiles left (they are all 'boxOnTarget')
  return findChar(board, 'box').length === 0;
};

const move = (board: BoardState, dr: number, dc: number, modifyInPlace: boolean): BoardState | false => {
  const newBoard = modifyInPlace ? board : cloneBoard(board);
  const playerPos = findPlayer(newBoard);
  if (!playerPos) return false;

  const [r, c] = playerPos;
  const [nr, nc] = [r + dr, c + dc];

  if (nr < 0 || nr >= newBoard.length || nc < 0 || nc >= newBoard[0].length) return false;

  const destination = newBoard[nr][nc];

  if (destination === 'wall') return false;

  if (destination === 'box' || destination === 'boxOnTarget') {
    const [br, bc] = [nr + dr, nc + dc];
    if (br < 0 || br >= newBoard.length || bc < 0 || bc >= newBoard[0].length) return false;

    const boxDestination = newBoard[br][bc];
    if (boxDestination === 'wall' || boxDestination === 'box' || boxDestination === 'boxOnTarget') return false;

    newBoard[br][bc] = boxDestination === 'target' ? 'boxOnTarget' : 'box';
    newBoard[nr][nc] = destination === 'boxOnTarget' ? 'playerOnTarget' : 'player';
  } else {
    newBoard[nr][nc] = destination === 'target' ? 'playerOnTarget' : 'player';
  }

  newBoard[r][c] = board[r][c] === 'playerOnTarget' ? 'target' : 'floor';

  return newBoard;
};

const findPlayer = (board: BoardState): [number, number] | null => {
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
            if (board[r][c] === 'player' || board[r][c] === 'playerOnTarget') {
                return [r, c];
            }
        }
    }
    return null;
};

// --- Solver from healeycodes/sokoban, adapted for our project ---

type Path = string | boolean;
type Steps = number;
type BoxesOnGoals = number;
type BoxesToGoalsManhattanDistance = number;

const MAX_SOLVER_STEPS = 20000; // Safety break to prevent infinite loops

export function solve(board: BoardState): [Path, Steps] {
  let steps = 1;
  const seen = new Set<string>();
  const dirs: [number, number, string][] = [
    [-1, 0, 'u'], // Up
    [1, 0, 'd'],  // Down
    [0, -1, 'l'], // Left
    [0, 1, 'r'],  // Right
  ];

  const queue: [BoardState, string][] = [[cloneBoard(board), '']];

  while (queue.length > 0) {
    const next = queue.shift();
    if (next === undefined) break;
    
    const [current, path] = next;

    const snapshot = JSON.stringify(current);
    if (seen.has(snapshot)) {
      continue;
    }
    seen.add(snapshot);

    if (checkGameWon(current)) {
      return [path, steps];
    }

    if (steps > MAX_SOLVER_STEPS) {
        return [false, -1]; // Exceeded max steps, assume unsolvable
    }

    const moves: [BoardState, string, BoxesOnGoals, BoxesToGoalsManhattanDistance][] = [];

    for (let i = 0; i < dirs.length; i++) {
      steps++;
      const [dr, dc, moveChar] = dirs[i];
      
      const attempt = move(current, dr, dc, false);
      if (attempt !== false) {
        const newPath = path + moveChar;
        const boxes = findChar(attempt, 'box');
        const goals = [...findChar(attempt, 'target'), ...findChar(attempt, 'playerOnTarget')];
        let distanceTotal = 0;
        for (let j = 0; j < boxes.length; j++) {
            if (goals[j]) { // Ensure there's a matching goal
                distanceTotal += Math.abs(boxes[j][0] - goals[j][0]) + Math.abs(boxes[j][1] - goals[j][1]);
            }
        }

        moves.push([
          attempt,
          newPath,
          findChar(attempt, 'boxOnTarget').length,
          distanceTotal,
        ]);
      }
    }

    moves.sort((a, b) => {
      const boxesOnGoals = (b[2] - a[2]) * 1000;
      const boxToGoalDistanceTotal = a[3] - b[3];
      return boxesOnGoals + boxToGoalDistanceTotal;
    });

    const futureWork: [BoardState, string][] = moves.map((move) => [move[0], move[1]]);
    queue.push(...futureWork);
  }

  return [false, -1];
}
