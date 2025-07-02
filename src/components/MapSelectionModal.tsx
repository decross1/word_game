import React from 'react';
import styled from '@emotion/styled';
import { MAPS } from '../levels';

interface MapSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMap: number;
  highestUnlockedMap: number;
  onSelectMap: (mapIndex: number) => void;
}

const MenuOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MenuContainer = styled.div<{ isOpen: boolean }>`
  position: relative;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  overflow-y: auto;
  transform: ${props => props.isOpen ? 'scale(1)' : 'scale(0.9)'};
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: all 0.3s ease;
`;

const MenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 5px;
  
  &:hover {
    color: #333;
  }
`;

const MapGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
`;

const MapButton = styled.button<{ isUnlocked: boolean; isActive: boolean }>`
  width: 100%;
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  background: ${props => 
    props.isActive 
      ? '#4CAF50' 
      : props.isUnlocked 
        ? '#f8f9fa' 
        : '#f0f0f0'};
  color: ${props => 
    props.isActive 
      ? 'white' 
      : props.isUnlocked 
        ? '#333' 
        : '#999'};
  cursor: ${props => props.isUnlocked ? 'pointer' : 'not-allowed'};
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: ${props => 
      props.isUnlocked && !props.isActive 
        ? '#e9ecef' 
        : props.isActive 
          ? '#45a049' 
          : '#f0f0f0'};
    transform: ${props => props.isUnlocked ? 'translateY(-2px)' : 'none'};
  }
`;

const MapInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const MapNumber = styled.span`
  font-size: 1.2em;
  font-weight: 500;
`;

const MapStatus = styled.span<{ isComplete: boolean }>`
  font-size: 24px;
  color: ${props => props.isComplete ? '#4CAF50' : '#ddd'};
`;

const MapSelectionModal: React.FC<MapSelectionModalProps> = ({
  isOpen,
  onClose,
  currentMap,
  highestUnlockedMap,
  onSelectMap,
}) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <MenuOverlay isOpen={isOpen} onClick={onClose}>
      <MenuContainer isOpen={isOpen} onClick={e => e.stopPropagation()}>
        <MenuHeader>
          <h2 style={{ margin: 0 }}>Select Map</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </MenuHeader>
        <MapGrid>
          {MAPS.map((_, index) => (
            <MapButton
              key={index}
              isUnlocked={index <= highestUnlockedMap}
              isActive={index === currentMap}
              onClick={() => {
                if (index <= highestUnlockedMap) {
                  onSelectMap(index);
                  onClose();
                }
              }}
            >
              <MapInfo>
                <MapNumber>Map {index + 1}</MapNumber>
                {index <= highestUnlockedMap && index !== currentMap && (
                  <span style={{ color: '#666', fontSize: '0.9em' }}>
                    {index < highestUnlockedMap ? 'Completed' : 'Current'}
                  </span>
                )}
              </MapInfo>
              <MapStatus isComplete={index < highestUnlockedMap}>
                {index < highestUnlockedMap ? '✓' : '○'}
              </MapStatus>
            </MapButton>
          ))}
        </MapGrid>
      </MenuContainer>
    </MenuOverlay>
  );
};

export default MapSelectionModal;