import { motion } from 'framer-motion';
import useEyeStore, { EyeSide, PathologyType } from '../store/useEyeStore';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

// Styled components for the face and eyes
const FaceContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e9f4f7;
  overflow: hidden;
`;

const Face = styled.div`
  position: relative;
  width: 500px;
  height: 500px;
  background-color: #e0d2c5; /* Skin tone */
  border-radius: 40% 40% 35% 35%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  z-index: 1;
`;

const EyesContainer = styled.div`
  position: relative;
  display: flex;
  width: 400px;
  justify-content: space-between;
  margin-top: -50px;
`;

const Eyebrow = styled.div<{ side: EyeSide }>`
  position: absolute;
  width: 80px;
  height: 10px;
  background-color: #5a3825;
  border-radius: 5px;
  top: -30px;
  left: ${(props: { side: EyeSide }) => props.side === 'left' ? '30px' : '290px'};
  transform: ${(props: { side: EyeSide }) => props.side === 'left' ? 'rotate(5deg)' : 'rotate(-5deg)'};
`;

const EyeWrapper = styled.div<{ side: EyeSide; size: number }>`
  position: relative;
  width: ${(props) => 140 * props.size}px;
  height: ${(props) => 90 * props.size}px;
  background-color: white;
  border-radius: 70px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
`;

// For more realistic iris with texture patterns
const getIrisBackground = (color: string, texture: string, intensity: number) => {
  switch (texture) {
    case 'radial':
      return `radial-gradient(circle, ${color} 30%, ${adjustColor(color, -20)} 70%, ${adjustColor(color, -40)} 100%)`;
    case 'starburst':
      return `
        radial-gradient(circle, ${color} 30%, transparent 0%),
        repeating-conic-gradient(
          ${adjustColor(color, -30)} 0deg, 
          ${adjustColor(color, -10)} ${2 * intensity}deg, 
          ${adjustColor(color, -30)} ${4 * intensity}deg
        )
      `;
    case 'solid':
      return color;
    default:
      return color;
  }
};

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number) => {
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (c: number) => {
      const hex = Math.max(0, Math.min(255, c)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r + amount)}${toHex(g + amount)}${toHex(b + amount)}`;
  };

  const rgb = hexToRgb(color);
  return rgbToHex(rgb.r + amount, rgb.g + amount, rgb.b + amount);
};

// Styled components for pathological conditions
const getPathologyStyles = (type: PathologyType, intensity: number) => {
  switch (type) {
    case 'conjunctivitis':
      return {
        color: `rgba(255, 0, 0, ${intensity * 0.7})`,
        background: `radial-gradient(circle, white 30%, rgba(255, 120, 120, ${intensity}) 100%)`,
        vessels: intensity * 1.5
      };
    case 'jaundice':
      return {
        color: `rgba(255, 255, 0, ${intensity * 0.3})`,
        background: `radial-gradient(circle, white 30%, rgba(255, 255, 150, ${intensity}) 100%)`,
        vessels: intensity * 0.8
      };
    case 'subconjunctival_hemorrhage':
      return {
        color: `rgba(255, 0, 0, ${intensity * 0.8})`,
        background: `radial-gradient(circle, white 30%, rgba(255, 0, 0, ${intensity * 0.8}) 100%)`,
        vessels: intensity * 2
      };
    case 'arcus':
      return {
        color: 'transparent',
        background: `radial-gradient(circle, white 30%, white 75%, rgba(220, 220, 220, ${intensity}) 85%, white 100%)`,
        vessels: intensity * 0.5
      };
    case 'cataract':
      return {
        color: 'transparent',
        background: 'white',
        vessels: intensity * 0.2,
        opacity: 1 - intensity * 0.7
      };
    case 'normal':
    default:
      return {
        color: 'transparent',
        background: 'white',
        vessels: 0.1
      };
  }
};

const Iris = styled(motion.div)<{ 
  color: string; 
  texture: string;
  patternIntensity: number;
  isOccluded: boolean;
  size: number;
  pathologyType: PathologyType;
  pathologyIntensity: number;
}>`
  position: absolute;
  width: ${(props) => 60 * (props.size || 1)}px;
  height: ${(props) => 60 * (props.size || 1)}px;
  border-radius: 50%;
  background: ${props => getIrisBackground(props.color, props.texture, props.patternIntensity)};
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);
  opacity: ${(props) => props.isOccluded ? 0.5 : 1};
  z-index: 3;
  
  // Apply opacity for cataract
  ${props => props.pathologyType === 'cataract' && `
    opacity: ${1 - props.pathologyIntensity * 0.7};
  `}
  
  &::before {
    content: '';
    position: absolute;
    width: 90%;
    height: 90%;
    border-radius: 50%;
    background: transparent;
    box-shadow: inset 0 0 10px ${props => adjustColor(props.color, 20)};
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 15%;
    height: 15%;
    border-radius: 50%;
    background: white;
    opacity: 0.2;
    top: 25%;
    left: 65%;
  }
`;

const Pupil = styled(motion.div)<{ 
  size: number; 
  isOccluded: boolean;
  pathologyType: PathologyType;
  pathologyIntensity: number;
}>`
  width: ${(props) => props.size * 4}px;
  height: ${(props) => props.size * 4}px;
  background-color: #000;
  border-radius: 50%;
  opacity: ${(props) => props.isOccluded ? 0.5 : 1};
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  z-index: 4;
  
  // Apply opacity for cataract
  ${props => props.pathologyType === 'cataract' && `
    opacity: ${1 - props.pathologyIntensity * 0.9};
  `}
  
  &::after {
    content: '';
    position: absolute;
    width: 30%;
    height: 30%;
    border-radius: 50%;
    background: white;
    opacity: 0.15;
    top: 20%;
    left: 20%;
  }
`;

// Eyelids for more realism
const Eyelid = styled.div<{ 
  position: number; // 0 = closed, 1 = fully open
  curvature: number; // 0-1 controls curvature
  side: EyeSide;
  isTop: boolean;
  eyeSize: number;
}>`
  position: absolute;
  width: ${(props) => 140 * props.eyeSize}px;
  height: ${(props) => 90 * props.eyeSize}px;
  background-color: #e0d2c5;
  border-radius: ${(props) => 
    props.isTop 
      ? `${70 * (1 - props.curvature)}px ${70 * (1 - props.curvature)}px 0 0` 
      : `0 0 ${70 * (1 - props.curvature)}px ${70 * (1 - props.curvature)}px`
  };
  z-index: 5;
  transform: ${(props) => {
    // Calculate eyelid position - different for top and bottom lids
    const openAmount = props.position;
    if (props.isTop) {
      // Top eyelid: When position is 1 (fully open), move it completely out of the way
      return `translateY(${-100 * props.eyeSize * openAmount}px)`;
    } else {
      // Bottom eyelid: When position is 1 (fully open), move it completely out of the way
      return `translateY(${100 * props.eyeSize * openAmount}px)`;
    }
  }};
  box-shadow: ${(props) => props.isTop ? 'inset 0 -3px 5px rgba(0,0,0,0.1)' : 'inset 0 3px 5px rgba(0,0,0,0.1)'};
  transition: transform 0.3s ease;
`;

const Sclera = styled.div<{ 
  eyeSize: number;
  pathologyType: PathologyType;
  pathologyIntensity: number;
}>`
  position: absolute;
  width: ${(props) => 140 * props.eyeSize}px;
  height: ${(props) => 90 * props.eyeSize}px;
  background: ${props => {
    const styles = getPathologyStyles(props.pathologyType, props.pathologyIntensity);
    return styles.background || 'radial-gradient(circle, white 60%, #f8f8f8 100%)';
  }};
  border-radius: 70px;
  overflow: hidden;
  z-index: 1;
`;

const BloodVessels = styled.div<{ 
  intensity: number;
  pathologyType: PathologyType;
  pathologyIntensity: number;
}>`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: ${(props) => {
    const styles = getPathologyStyles(props.pathologyType, props.pathologyIntensity);
    return styles.vessels || props.intensity * 0.2;
  }};
  background-image: 
    linear-gradient(90deg, transparent 99%, rgba(255, 0, 0, 0.1) 100%),
    linear-gradient(60deg, transparent 99%, rgba(255, 0, 0, 0.1) 100%),
    linear-gradient(120deg, transparent 99%, rgba(255, 0, 0, 0.1) 100%),
    linear-gradient(160deg, transparent 99%, rgba(255, 0, 0, 0.1) 100%);
  background-size: 30px 30px;
  z-index: 2;
`;

// Tear film component
const TearFilm = styled.div<{ 
  visible: boolean;
  intensity: number;
  eyeSize: number;
}>`
  position: absolute;
  width: ${(props) => 140 * props.eyeSize}px;
  height: ${(props) => 90 * props.eyeSize}px;
  border-radius: 70px;
  background: linear-gradient(
    to bottom,
    rgba(200, 230, 255, ${props => props.intensity * 0.3}) 0%,
    rgba(200, 230, 255, ${props => props.intensity * 0.1}) 50%,
    rgba(200, 230, 255, ${props => props.intensity * 0.5}) 100%
  );
  opacity: ${props => props.visible ? 1 : 0};
  box-shadow: 0 0 5px rgba(200, 230, 255, ${props => props.intensity * 0.5});
  z-index: 9;
  pointer-events: none;
`;

// Tear drop at the corner of eye
const TearDrop = styled.div<{
  visible: boolean;
  intensity: number;
  side: EyeSide;
}>`
  position: absolute;
  width: 8px;
  height: 12px;
  background: radial-gradient(
    ellipse at top,
    rgba(200, 230, 255, 0.8) 0%,
    rgba(200, 230, 255, 0.9) 100%
  );
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  transform: rotate(${props => props.side === 'left' ? '45deg' : '-45deg'});
  left: ${props => props.side === 'left' ? '-5px' : 'auto'};
  right: ${props => props.side === 'left' ? 'auto' : '-5px'};
  bottom: -5px;
  opacity: ${props => props.visible && props.intensity > 0.7 ? props.intensity - 0.7 : 0};
  z-index: 9;
  filter: drop-shadow(0 0 1px rgba(200, 230, 255, 0.8));
`;

const Occluder = styled.div<{ side: EyeSide }>`
  position: absolute;
  width: 140px;
  height: 140px;
  background-color: #333;
  border-radius: 5px;
  opacity: 0.8;
  z-index: 10;
`;

const DominantIndicator = styled.div`
  position: absolute;
  width: 15px;
  height: 15px;
  background-color: red;
  border-radius: 50%;
  top: -15px;
  left: 60px;
`;

const TargetStick = styled.div<{ visible: boolean }>`
  position: absolute;
  width: 10px;
  height: 600px;
  background-color: white;
  border-radius: 5px;
  border: 1px solid #f05658;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  display: ${(props: { visible: boolean }) => props.visible ? 'block' : 'none'};
  
  &::before {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid #f05658;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 15px;
    height: 2px;
    background-color: #f05658;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
  }
`;

const Prism = styled.div<{ visible: boolean; axis: number }>`
  position: absolute;
  width: 150px;
  height: 150px;
  background-color: rgba(173, 216, 230, 0.5);
  transform: rotate(${(props: { axis: number }) => props.axis}deg);
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  z-index: 15;
  display: ${(props: { visible: boolean }) => props.visible ? 'block' : 'none'};
`;

const Eye = ({ side }: { side: EyeSide }) => {
  const {
    pupilSize,
    irisColor,
    irisTexture,
    irisPatternIntensity,
    eyeSize,
    eyePosition,
    irisPosition,
    pupilPosition,
    eyelidPosition,
    eyelidCurvature,
    enableBlinking,
    blinkFrequency,
    tearFilmVisible,
    tearFilmIntensity,
    pathologyType,
    pathologyIntensity,
    dominantEye,
    occluderPosition,
    activeTool,
    // Deviation parameters
    esotropia,
    exotropia,
    hypertropia,
    hypotropia,
    esophoria,
    exophoria,
    hyperphoria,
    hypophoria,
  } = useEyeStore();
  
  // Customize blinking function to use blinkFrequency
  const useBlinkingWithFrequency = (enableBlinking: boolean, frequency: number) => {
    const [isBlinking, setIsBlinking] = useState(false);
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
      setIsClient(true);
      
      if (enableBlinking) {
        // Convert frequency (blinks per minute) to interval in ms
        const intervalMs = 60000 / frequency;
        // Add some randomness around the average interval
        const getRandomInterval = () => Math.max(1000, intervalMs + (Math.random() * 2000 - 1000));
        
        let nextInterval = getRandomInterval();
        const blinkInterval = setInterval(() => {
          setIsBlinking(true);
          setTimeout(() => {
            setIsBlinking(false);
            
            // Schedule next blink with a new random interval
            clearInterval(blinkInterval);
            setTimeout(() => {
              nextInterval = getRandomInterval();
            }, nextInterval);
            
          }, 200); // Blink duration
        }, nextInterval);
        
        return () => clearInterval(blinkInterval);
      }
      
      setIsBlinking(false);
      return () => {};
    }, [enableBlinking, frequency]);
    
    return isClient ? isBlinking : false;
  };
  
  const isBlinking = useBlinkingWithFrequency(enableBlinking, blinkFrequency);
  
  // Calculate eye position with deviations
  const calculateEyePosition = () => {
    const baseX = eyePosition[side].x;
    const baseY = eyePosition[side].y;
    
    // Apply horizontal deviations
    let xOffset = 0;
    if (side === 'left') {
      xOffset += esotropia * 0.5; // Inward deviation for left eye
      xOffset -= exotropia * 0.5; // Outward deviation for left eye
      
      // Apply phoria when occluded
      if (occluderPosition === 'left') {
        xOffset += esophoria * 0.5;
        xOffset -= exophoria * 0.5;
      }
    } else { // right eye
      xOffset -= esotropia * 0.5; // Inward deviation for right eye
      xOffset += exotropia * 0.5; // Outward deviation for right eye
      
      // Apply phoria when occluded
      if (occluderPosition === 'right') {
        xOffset -= esophoria * 0.5;
        xOffset += exophoria * 0.5;
      }
    }
    
    // Apply vertical deviations
    let yOffset = 0;
    if (side === 'left') {
      yOffset -= hypertropia * 0.5; // Upward deviation for left eye
      yOffset += hypotropia * 0.5; // Downward deviation for left eye
      
      // Apply phoria when occluded
      if (occluderPosition === 'left') {
        yOffset -= hyperphoria * 0.5;
        yOffset += hypophoria * 0.5;
      }
    } else { // right eye
      yOffset -= hypertropia * 0.5; // Upward deviation for right eye
      yOffset += hypotropia * 0.5; // Downward deviation for right eye
      
      // Apply phoria when occluded
      if (occluderPosition === 'right') {
        yOffset -= hyperphoria * 0.5;
        yOffset += hypophoria * 0.5;
      }
    }
    
    // The maxMovement defines the range of motion
    const maxMovement = 20;
    
    // Calculate final position with constraints
    const finalX = Math.max(-maxMovement, Math.min(maxMovement, (baseX + xOffset) * maxMovement));
    const finalY = Math.max(-maxMovement, Math.min(maxMovement, (baseY + yOffset) * maxMovement));
    
    return { x: finalX, y: finalY };
  };
  
  // Get calculated positions for overall eye
  const { x: xPosition, y: yPosition } = calculateEyePosition();
  
  // Get iris and pupil positions relative to eye
  const irisX = irisPosition[side].x * 40; // Scale for visible movement (increased from 30)
  const irisY = irisPosition[side].y * 40; // Scale for visible movement (increased from 30)
  
  // Calculate pupil position relative to iris
  const pupilOffsetX = (pupilPosition[side].x - irisPosition[side].x) * 15; // Smaller scale for pupil
  const pupilOffsetY = (pupilPosition[side].y - irisPosition[side].y) * 15;
  
  const isOccluded = occluderPosition === side;
  const isDominant = dominantEye === side;
  
  // Adjust eyelid position for blinking
  const currentEyelidPosition = isBlinking ? 0.01 : eyelidPosition[side];

  return (
    <EyeWrapper side={side} size={eyeSize[side]}>
      <Eyebrow side={side} />
      
      <Sclera 
        eyeSize={eyeSize[side]} 
        pathologyType={pathologyType[side]}
        pathologyIntensity={pathologyIntensity[side]}
      >
        <BloodVessels 
          intensity={0.5} 
          pathologyType={pathologyType[side]}
          pathologyIntensity={pathologyIntensity[side]}
        />
      </Sclera>
      
      <Iris 
        color={irisColor[side]} 
        texture={irisTexture[side]}
        patternIntensity={irisPatternIntensity[side]}
        isOccluded={isOccluded}
        size={eyeSize[side]}
        pathologyType={pathologyType[side]}
        pathologyIntensity={pathologyIntensity[side]}
        animate={{ 
          x: xPosition + irisX, 
          y: yPosition + irisY 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Pupil 
          size={pupilSize[side]} 
          isOccluded={isOccluded}
          pathologyType={pathologyType[side]}
          pathologyIntensity={pathologyIntensity[side]}
          style={{
            transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)`
          }}
        />
      </Iris>
      
      {/* Tear film layer on top of eye */}
      <TearFilm 
        visible={tearFilmVisible[side]}
        intensity={tearFilmIntensity[side]}
        eyeSize={eyeSize[side]}
      />
      
      {/* Tear drop in corner of eye */}
      <TearDrop 
        visible={tearFilmVisible[side]}
        intensity={tearFilmIntensity[side]}
        side={side}
      />
      
      {/* Top eyelid */}
      <Eyelid 
        position={currentEyelidPosition}
        curvature={eyelidCurvature[side]}
        side={side}
        isTop={true}
        eyeSize={eyeSize[side]}
      />
      
      {/* Bottom eyelid */}
      <Eyelid 
        position={currentEyelidPosition}
        curvature={eyelidCurvature[side]}
        side={side}
        isTop={false}
        eyeSize={eyeSize[side]}
      />
      
      {isDominant && <DominantIndicator />}
      {isOccluded && activeTool === 'occluder' && <Occluder side={side} />}
    </EyeWrapper>
  );
};

const FaceModel = () => {
  const { activeTool, prismAxis } = useEyeStore();
  const [isMounted, setIsMounted] = useState(false);
  
  // Check if component is mounted on client
  useEffect(() => {
    setIsMounted(true);
    console.log("FaceModel mounted");
  }, []);

  return (
    <FaceContainer>
      {/* Add debug message */}
      {!isMounted && <div style={{ position: 'absolute', top: 10, left: 10, color: 'red' }}>Loading eyes...</div>}
      
      <Face>
        <EyesContainer>
          <Eye side="left" />
          <Eye side="right" />
        </EyesContainer>
      </Face>
      
      <TargetStick visible={activeTool === 'target'} />
      <Prism visible={activeTool === 'prism'} axis={prismAxis} />
    </FaceContainer>
  );
};

export default FaceModel; 