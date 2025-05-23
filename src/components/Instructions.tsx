import React from 'react';
import styled from '@emotion/styled';
import type { CellType } from './Board';

const InstructionsContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 300px;
`;

const Legend = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 10px;
  align-items: center;
  margin-top: 15px;
`;

const LegendItem = styled.div<{ cellType: CellType }>`
  width: 30px;
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: ${({ cellType }) => {
    switch (cellType) {
      case 'wall': return '#666';
      case 'floor': return '#fff';
      case 'target': return '#ffd700';
      case 'box': return '#8b4513';
      case 'boxOnTarget': return '#daa520';
      case 'player': return '#4169e1';
      default: return '#fff';
    }
  }};
`;

const Instructions: React.FC = () => {
  return (
    <InstructionsContainer>
      <h3 style={{ margin: '0 0 10px 0' }}>How to Play Sokoban</h3>
      <p style={{ margin: '0 0 15px 0' }}>
        Push all boxes onto the target spots to complete the level.
      </p>
      <Legend>
        <LegendItem cellType="player" />
        <span>Player (Move with WASD or Arrow keys)</span>
        
        <LegendItem cellType="box" />
        <span>Box (Push these to targets)</span>
        
        <LegendItem cellType="target" />
        <span>Target (Place boxes here)</span>
        
        <LegendItem cellType="boxOnTarget" />
        <span>Box on target (Goal achieved!)</span>
        
        <LegendItem cellType="wall" />
        <span>Wall (Can't move through)</span>
      </Legend>
      
      <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
        <p style={{ margin: '5px 0' }}>Tips:</p>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>You can't pull boxes</li>
          <li>Plan your moves carefully</li>
          <li>Some positions may block boxes forever!</li>
        </ul>
      </div>
    </InstructionsContainer>
  );
};

export default Instructions; 