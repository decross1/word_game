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
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ cellType }) => {
    switch (cellType) {
      case 'wall': return '#666';
      case 'floor': return '#fff';
      case 'target': return '#ffd700';
      case 'box': return '#8b4513';
      case 'boxOnTarget': return '#4CAF50';
      case 'player': return '#4169e1';
      case 'playerOnTarget': return '#4169e1';
      default: return '#fff';
    }
  }};
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
          {row.map((cell, colIndex) => (
            <Cell key={`${rowIndex}-${colIndex}`} cellType={cell} />
          ))}
        </Row>
      ))}
    </BoardContainer>
  );
};

export default Board; 