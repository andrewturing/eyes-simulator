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
  transition: transform 0.05s ease-out, background-color 0.2s ease;
  
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

const MoveGrid = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(9, 1fr);
  opacity: 0.1;
  pointer-events: none;
`;

const GridCell = styled.div`
  border: 0.5px dashed #666;
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
  const [joystickVisualPos, setJoystickVisualPos] = useState({ x: 0, y: 0 });
  const [lastMovement, setLastMovement] = useState({ x: 0, y: 0 });
  const [sensitivity, setSensitivity] = useState(1);
  
  // For smooth movement
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  
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
    
    // Set visual position immediately for responsive feel
    setJoystickVisualPos({ x, y });
    
    // Movement is applied with a smaller factor for finer control
    // This makes the movement more precise
    const moveFactorX = x / 10 * sensitivity; 
    const moveFactorY = y / 10 * sensitivity;
    
    setLastMovement({ x: moveFactorX, y: moveFactorY });
  };
  
  // Animation loop for smooth movement
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      if (isDragging) {
        // Apply movement with smoothing
        onMove(lastMovement.x, lastMovement.y);
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };
  
  // Start/stop animation loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isDragging, lastMovement]);
  
  // Handle mouse/touch end
  const handleEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    setJoystickVisualPos({ x: 0, y: 0 });
    setLastMovement({ x: 0, y: 0 });
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#555' }}>
          <span>Controlling: {side === 'left' ? 'Left Eye' : 'Right Eye'}</span>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.25rem' }}>
            <span style={{ marginRight: '0.5rem' }}>Sensitivity:</span>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={sensitivity} 
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              style={{ width: '80px' }}
            />
            <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>{sensitivity.toFixed(1)}x</span>
          </div>
        </div>
        <ResetButton onClick={onReset}>
          Reset
        </ResetButton>
      </div>
      
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
      </ModeToggle>
      
      <ControlArea 
        ref={containerRef}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
      >
        <CrosshairHorizontal />
        <CrosshairVertical />
        <MoveGrid>
          {Array.from({ length: 81 }).map((_, i) => (
            <GridCell key={i} />
          ))}
        </MoveGrid>
        <JoystickBase>
          <Joystick 
            ref={joystickRef}
            active={isDragging}
            style={{
              transform: `translate(${joystickVisualPos.x * 20}px, ${joystickVisualPos.y * 20}px)`,
            }}
          />
        </JoystickBase>
      </ControlArea>
      
      <div style={{ 
        fontSize: '0.7rem', 
        color: '#666', 
        textAlign: 'center', 
        marginTop: '0.25rem' 
      }}>
        {isDragging 
          ? `Moving ${movementMode.replace('_', ' ')} at (${position.x.toFixed(2)}, ${position.y.toFixed(2)})`
          : 'Click/touch and drag to move eye position'
        }
      </div>
    </JoystickContainer>
  );
};

export default JoystickControl; 