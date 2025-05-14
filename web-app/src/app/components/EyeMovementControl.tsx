import styled from '@emotion/styled';
import useEyeStore, { EyeSide, MovementMode } from '../store/useEyeStore';
import JoystickControl from './JoystickControl';

const ControlGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const GroupTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  justify-content: space-between;
`;

const Label = styled.label`
  font-size: 0.875rem;
  margin-right: 1rem;
  color: #555;
  flex: 1;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

// Position indicator with a visual representation of how close to the limit the eye is
const PositionIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
`;

const AxisLabel = styled.div`
  width: 30px;
  text-align: right;
  margin-right: 5px;
`;

const ProgressBar = styled.div<{ value: number; color: string }>`
  height: 8px;
  width: ${props => Math.abs(props.value) * 100}%;
  background-color: ${props => props.color};
  border-radius: 4px;
  margin: 0 2px;
  transition: width 0.2s ease;
`;

const ProgressContainer = styled.div<{ direction: 'left' | 'right' }>`
  width: 100px;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: ${props => props.direction === 'left' ? 'flex-end' : 'flex-start'};
`;

const ValueDisplay = styled.div`
  width: 80px;
  text-align: left;
  margin-left: 5px;
`;

const EyeMovementControl = () => {
  const { 
    movementMode, 
    setMovementMode,
    moveEyeComponents,
    irisPosition,
    pupilPosition,
    setIrisPosition,
    setPupilPosition
  } = useEyeStore();

  // The maximum allowed value for iris/pupil position
  const MAX_POSITION = 0.8;
  
  const handleMove = (side: EyeSide, deltaX: number, deltaY: number) => {
    moveEyeComponents(side, { x: deltaX, y: deltaY });
  };

  const handleReset = (side: EyeSide) => {
    setIrisPosition(side, { x: 0, y: 0 });
    setPupilPosition(side, { x: 0, y: 0 });
  };

  const handleModeChange = (mode: MovementMode) => {
    setMovementMode(mode);
  };

  // Calculate position percentage for progress bars
  const getPositionPercentage = (value: number) => {
    return value / MAX_POSITION;
  };

  return (
    <ControlGroup>
      <GroupTitle>Eye Movement Controls</GroupTitle>
      
      <ControlRow>
        <Label>Movement Mode</Label>
        <ButtonGroup>
          <Button
            onClick={() => handleModeChange('iris_and_pupil')}
            style={{ 
              backgroundColor: movementMode === 'iris_and_pupil' ? '#3b82f6' : '#6b7280',
              flex: '1'
            }}
          >
            Iris & Pupil
          </Button>
          <Button
            onClick={() => handleModeChange('iris_only')}
            style={{ 
              backgroundColor: movementMode === 'iris_only' ? '#3b82f6' : '#6b7280',
              flex: '1'
            }}
          >
            Iris Only
          </Button>
          <Button
            onClick={() => handleModeChange('pupil_only')}
            style={{ 
              backgroundColor: movementMode === 'pupil_only' ? '#3b82f6' : '#6b7280',
              flex: '1'
            }}
          >
            Pupil Only
          </Button>
        </ButtonGroup>
      </ControlRow>
      
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#555' }}>Left Eye</h4>
        
        {/* Position indicators with visual feedback */}
        <PositionIndicator>
          <AxisLabel>X:</AxisLabel>
          <ProgressContainer direction="left">
            {irisPosition.left.x < 0 && (
              <ProgressBar 
                value={getPositionPercentage(Math.abs(irisPosition.left.x))} 
                color="#3b82f6" 
              />
            )}
          </ProgressContainer>
          <ProgressContainer direction="right">
            {irisPosition.left.x > 0 && (
              <ProgressBar 
                value={getPositionPercentage(irisPosition.left.x)} 
                color="#3b82f6" 
              />
            )}
          </ProgressContainer>
          <ValueDisplay>{irisPosition.left.x.toFixed(2)}</ValueDisplay>
        </PositionIndicator>
        
        <PositionIndicator>
          <AxisLabel>Y:</AxisLabel>
          <ProgressContainer direction="left">
            {irisPosition.left.y < 0 && (
              <ProgressBar 
                value={getPositionPercentage(Math.abs(irisPosition.left.y))}  
                color="#10b981" 
              />
            )}
          </ProgressContainer>
          <ProgressContainer direction="right">
            {irisPosition.left.y > 0 && (
              <ProgressBar 
                value={getPositionPercentage(irisPosition.left.y)} 
                color="#10b981" 
              />
            )}
          </ProgressContainer>
          <ValueDisplay>{irisPosition.left.y.toFixed(2)}</ValueDisplay>
        </PositionIndicator>

        <JoystickControl 
          side="left"
          movementMode={movementMode}
          onModeChange={handleModeChange}
          onMove={(dx, dy) => handleMove('left', dx, dy)}
          onReset={() => handleReset('left')}
        />
        
        <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
          Iris Position: x: {irisPosition.left.x.toFixed(2)}, y: {irisPosition.left.y.toFixed(2)}
          {movementMode !== 'iris_only' && (
            <span> | Pupil Offset: x: {(pupilPosition.left.x - irisPosition.left.x).toFixed(2)}, y: {(pupilPosition.left.y - irisPosition.left.y).toFixed(2)}</span>
          )}
        </div>
      </div>
      
      <div>
        <h4 style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#555' }}>Right Eye</h4>
        
        {/* Position indicators with visual feedback */}
        <PositionIndicator>
          <AxisLabel>X:</AxisLabel>
          <ProgressContainer direction="left">
            {irisPosition.right.x < 0 && (
              <ProgressBar 
                value={getPositionPercentage(Math.abs(irisPosition.right.x))} 
                color="#f59e0b" 
              />
            )}
          </ProgressContainer>
          <ProgressContainer direction="right">
            {irisPosition.right.x > 0 && (
              <ProgressBar 
                value={getPositionPercentage(irisPosition.right.x)} 
                color="#f59e0b" 
              />
            )}
          </ProgressContainer>
          <ValueDisplay>{irisPosition.right.x.toFixed(2)}</ValueDisplay>
        </PositionIndicator>
        
        <PositionIndicator>
          <AxisLabel>Y:</AxisLabel>
          <ProgressContainer direction="left">
            {irisPosition.right.y < 0 && (
              <ProgressBar 
                value={getPositionPercentage(Math.abs(irisPosition.right.y))}  
                color="#10b981" 
              />
            )}
          </ProgressContainer>
          <ProgressContainer direction="right">
            {irisPosition.right.y > 0 && (
              <ProgressBar 
                value={getPositionPercentage(irisPosition.right.y)} 
                color="#10b981" 
              />
            )}
          </ProgressContainer>
          <ValueDisplay>{irisPosition.right.y.toFixed(2)}</ValueDisplay>
        </PositionIndicator>
        
        <JoystickControl 
          side="right"
          movementMode={movementMode}
          onModeChange={handleModeChange}
          onMove={(dx, dy) => handleMove('right', dx, dy)}
          onReset={() => handleReset('right')}
        />
        
        <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
          Iris Position: x: {irisPosition.right.x.toFixed(2)}, y: {irisPosition.right.y.toFixed(2)}
          {movementMode !== 'iris_only' && (
            <span> | Pupil Offset: x: {(pupilPosition.right.x - irisPosition.right.x).toFixed(2)}, y: {(pupilPosition.right.y - irisPosition.right.y).toFixed(2)}</span>
          )}
        </div>
      </div>
      
      <Button 
        onClick={() => {
          handleReset('left');
          handleReset('right');
        }}
        style={{
          backgroundColor: '#ef4444',
          margin: '1rem 0 0.5rem'
        }}
      >
        Reset Both Eyes
      </Button>
    </ControlGroup>
  );
};

export default EyeMovementControl; 