import { useRef, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { EyeSide, MovementMode } from '../store/useEyeStore';

const JoystickContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-bottom: 1rem;
`;

const ControlArea = styled.div`
  position: relative;
  width: 100%;
  height: 120px;
  background-color: #f0f0f0;
  border-radius: 8px;
  touch-action: none; /* Prevent scrolling on touch devices */
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
`;

const JoystickBase = styled.div`
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Joystick = styled.div<{ active: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#3b82f6' : '#6b7280'};
  cursor: grab;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &:active {
    cursor: grabbing;
  }
`;

const CrosshairHorizontal = styled.div`
  position: absolute;
  width: 80%;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.2);
`;

const CrosshairVertical = styled.div`
  position: absolute;
  width: 1px;
  height: 80%;
  background-color: rgba(0, 0, 0, 0.2);
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const ModeButton = styled.button<{ active: boolean }>`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background-color: ${props => props.active ? '#3b82f6' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  
  &:hover {
    background-color: ${props => props.active ? '#2563eb' : '#e5e5e5'};
  }
`;

const ResetButton = styled.button`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #dc2626;
  }
`;

interface JoystickControlProps {
  side: EyeSide;
  movementMode: MovementMode;
  onModeChange: (mode: MovementMode) => void;
  onMove: (deltaX: number, deltaY: number) => void;
  onReset: () => void;
}

const JoystickControl: React.FC<JoystickControlProps> = ({
  side,
  movementMode,
  onModeChange,
  onMove,
  onReset
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Handle mouse/touch down
  const handleStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate normalized position (-1 to 1)
    updateJoystickPosition(clientX, clientY, centerX, centerY, rect);
  };
  
  // Handle mouse/touch move
  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate normalized position (-1 to 1)
    updateJoystickPosition(clientX, clientY, centerX, centerY, rect);
  };
  
  // Update joystick position with constraints
  const updateJoystickPosition = (
    clientX: number, 
    clientY: number, 
    centerX: number, 
    centerY: number, 
    rect: DOMRect
  ) => {
    // Calculate position relative to center
    let x = (clientX - rect.left - centerX) / (rect.width / 3);
    let y = (clientY - rect.top - centerY) / (rect.height / 3);
    
    // Constrain to a circle
    const distance = Math.sqrt(x * x + y * y);
    if (distance > 1) {
      x = x / distance;
      y = y / distance;
    }
    
    // Update position
    setPosition({ x, y });
    
    // Trigger movement callback with normalized values (-1 to 1)
    onMove(x / 5, y / 5); // Doubled sensitivity for more pronounced movement
  };
  
  // Handle mouse/touch end
  const handleEnd = () => {
    setIsDragging(false);
  };
  
  // Set up event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    
    // Add global event listeners when dragging
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    }
    
    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);
  
  // Handle touch events to prevent scrolling
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };
    
    const element = containerRef.current;
    if (element) {
      element.addEventListener('touchmove', preventScroll, { passive: false });
    }
    
    return () => {
      if (element) {
        element.removeEventListener('touchmove', preventScroll);
      }
    };
  }, [isDragging]);
  
  return (
    <JoystickContainer>
      <ModeToggle>
        <ModeButton 
          active={movementMode === 'iris_and_pupil'} 
          onClick={() => onModeChange('iris_and_pupil')}
        >
          Iris &amp; Pupil
        </ModeButton>
        <ModeButton 
          active={movementMode === 'iris_only'} 
          onClick={() => onModeChange('iris_only')}
        >
          Iris Only
        </ModeButton>
        <ModeButton 
          active={movementMode === 'pupil_only'} 
          onClick={() => onModeChange('pupil_only')}
        >
          Pupil Only
        </ModeButton>
        <ResetButton onClick={onReset}>
          Reset
        </ResetButton>
      </ModeToggle>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#555' }}>Controlling: {side === 'left' ? 'Left Eye' : 'Right Eye'}</span>
        <span style={{ fontSize: '0.8rem', color: '#666' }}>
          x: {position.x.toFixed(2)}, y: {position.y.toFixed(2)}
        </span>
      </div>
      
      <ControlArea 
        ref={containerRef}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        style={{ borderColor: side === 'left' ? '#3b82f6' : '#f59e0b' }}
      >
        <CrosshairHorizontal />
        <CrosshairVertical />
        <JoystickBase>
          <Joystick 
            ref={joystickRef}
            active={isDragging}
            style={{
              transform: `translate(${position.x * 20}px, ${position.y * 20}px)`,
              backgroundColor: isDragging ? (side === 'left' ? '#3b82f6' : '#f59e0b') : '#6b7280'
            }}
          />
        </JoystickBase>
      </ControlArea>
    </JoystickContainer>
  );
};

export default JoystickControl; 