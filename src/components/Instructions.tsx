import React, { useState } from 'react';
import styled from '@emotion/styled';
import type { CellType } from './Board';

interface InstructionsContainerProps {
  isCollapsed: boolean;
}

const InstructionsContainer = styled.div<InstructionsContainerProps>`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  transition: all 0.3s ease;
  transform: translateX(${props => props.isCollapsed ? 'calc(-100% + 40px)' : '0'});
  
  @media (max-width: 768px) {
    max-width: 250px;
    font-size: 0.9em;
    padding: 10px;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: -30px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 0 8px 8px 0;
  padding: 8px;
  cursor: pointer;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
`;

const ContentContainer = styled.div<InstructionsContainerProps>`
  opacity: ${props => props.isCollapsed ? 0 : 1};
  visibility: ${props => props.isCollapsed ? 'hidden' : 'visible'};
  transition: opacity 0.2s ease;
  transition-delay: ${props => props.isCollapsed ? '0s' : '0.2s'};
`;

const Legend = styled.div`
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
  color: #333;

  @media (max-width: 768px) {
    grid-template-columns: 25px 1fr;
    gap: 6px;
  }
`;

const LegendItem = styled.div<{ cellType: CellType }>`
  width: 25px;
  height: 25px;
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

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
  }
`;

const Instructions: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <InstructionsContainer isCollapsed={isCollapsed}>
      <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? '►' : '◄'}
      </ToggleButton>
      
      <ContentContainer isCollapsed={isCollapsed}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1em', color: '#222' }}>How to Play</h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '0.9em', color: '#333' }}>
          Push boxes onto targets to win!
        </p>
        <Legend>
          <LegendItem cellType="player" />
          <span>Player (WASD/Arrows)</span>
          
          <LegendItem cellType="box" />
          <span>Box</span>
          
          <LegendItem cellType="target" />
          <span>Target</span>
          
          <LegendItem cellType="boxOnTarget" />
          <span>Box on target</span>
          
          <LegendItem cellType="wall" />
          <span>Wall</span>
        </Legend>
        
        <div style={{ marginTop: '12px', fontSize: '0.85em', color: '#555' }}>
          <p style={{ margin: '4px 0' }}>Tip: You can't pull boxes!</p>
        </div>
      </ContentContainer>
    </InstructionsContainer>
  );
};

export default Instructions; 