import React from 'react';
import styled from '@emotion/styled';

const ToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#2c3e50' : '#e5e7eb'};
  color: ${props => props.active ? 'white' : '#4b5563'};
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:first-of-type {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  &:last-of-type {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  &:not(:first-of-type):not(:last-of-type) {
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
  }

  &:hover {
    background: ${props => props.active ? '#2c3e50' : '#d1d5db'};
  }
`;

const Badge = styled.span`
  background-color: #3b82f6;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 9999px;
  margin-left: 6px;
  text-transform: uppercase;
  font-weight: 600;
`;

interface ViewToggleProps {
  viewMode: '2D' | '2.5D' | '3D';
  setViewMode: (mode: '2D' | '2.5D' | '3D') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <ToggleContainer>
      <ToggleButton
        active={viewMode === '2D'}
        onClick={() => setViewMode('2D')}
      >
        2D View
      </ToggleButton>
      <ToggleButton
        active={viewMode === '2.5D'}
        onClick={() => setViewMode('2.5D')}
      >
        2.5D View <Badge>Experimental</Badge>
      </ToggleButton>
      <ToggleButton
        active={viewMode === '3D'}
        onClick={() => setViewMode('3D')}
      >
        3D View <Badge>Experimental</Badge>
      </ToggleButton>
    </ToggleContainer>
  );
};

export default ViewToggle; 