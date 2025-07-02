import React from 'react';
import styled from '@emotion/styled';

export type CellType = 'wall' | 'floor' | 'player' | 'box' | 'target' | 'boxOnTarget' | 'playerOnTarget';

export type BoardState = CellType[][];

interface BoardProps {
  board: BoardState;
  isLevelComplete: boolean;
}

interface CellProps {
  cellType: CellType;
}

const Cell = styled.div<CellProps>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ cellType }) => {
    switch (cellType) {
      case 'wall': return '#A0AEC0'; // Cool gray for walls
      case 'floor': return '#F7FAFC'; // Off-white for floors
      case 'target': return '#F6E05E'; // Softer yellow for targets
      default: return '#F7FAFC';
    }
  }};
  transition: transform 0.1s ease-in-out, background-color 0.2s ease-in-out;

  // Inner element for character/box styling
  & > div {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    transition: transform 0.2s ease, background-color 0.2s ease;
  }
`;

const PlayerCell = styled.div`
  background-color: #4299E1; // Vibrant blue for player
`;

const BoxCell = styled.div`
  background-color: #ED8936; // Warm orange for boxes
`;

const BoxOnTargetCell = styled.div`
  background-color: #48BB78; // Green for success
  transform: scale(1.1); // "Pop" effect
`;

const Row = styled.div`
  display: flex;
`;

const BoardContainer = styled.div`
  display: inline-block;
  background: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
`;

const Board: React.FC<BoardProps> = ({ board }) => {
  return (
    <BoardContainer>
      {board.map((row, rowIndex) => (
        <Row key={rowIndex}>
          {row.map((cellType, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`} cellType={cellType}>
              {cellType === 'player' && <PlayerCell />}
              {cellType === 'playerOnTarget' && <PlayerCell />}
              {cellType === 'box' && <BoxCell />}
              {cellType === 'boxOnTarget' && <BoxOnTargetCell />}
            </Cell>
          ))}
        </Row>
      ))}
    </BoardContainer>
  );
};

export default Board;