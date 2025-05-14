import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import useEyeStore from '../store/useEyeStore';
import Eye from './Eye';

export function EyePairCanvas() {
  const {
    pupilSize,
    irisColor,
    eyePosition,
    dominantEye,
    occluderPosition,
    esotropia,
    exotropia,
    hypertropia,
    hypotropia,
    esophoria,
    exophoria,
    hyperphoria,
    hypophoria,
    currentTest,
    activeTool,
  } = useEyeStore();

  // Calculate the effective eye position including all deviations
  const calculateEyePositions = () => {
    const leftDeviation = { x: 0, y: 0 };
    const rightDeviation = { x: 0, y: 0 };

    // Apply manifest deviations (tropias) to both eyes all the time
    if (esotropia > 0) {
      if (dominantEye === 'right') {
        leftDeviation.x -= esotropia / 20; // Inward
      } else {
        rightDeviation.x += esotropia / 20; // Inward
      }
    }

    if (exotropia > 0) {
      if (dominantEye === 'right') {
        leftDeviation.x += exotropia / 20; // Outward
      } else {
        rightDeviation.x -= exotropia / 20; // Outward
      }
    }

    if (hypertropia > 0) {
      if (dominantEye === 'right') {
        leftDeviation.y += hypertropia / 20; // Upward
      } else {
        rightDeviation.y += hypertropia / 20; // Upward
      }
    }

    if (hypotropia > 0) {
      if (dominantEye === 'right') {
        leftDeviation.y -= hypotropia / 20; // Downward
      } else {
        rightDeviation.y -= hypotropia / 20; // Downward
      }
    }

    // Apply latent deviations (phorias) only when the eye is covered
    // or during alternate cover test
    if (currentTest === 'alternate-cover' || currentTest === 'alternate-cover-prism') {
      // Apply phorias to the covered eye
      if (occluderPosition === 'left') {
        if (esophoria > 0) leftDeviation.x -= esophoria / 20;
        if (exophoria > 0) leftDeviation.x += exophoria / 20;
        if (hyperphoria > 0) leftDeviation.y += hyperphoria / 20;
        if (hypophoria > 0) leftDeviation.y -= hypophoria / 20;
      } else if (occluderPosition === 'right') {
        if (esophoria > 0) rightDeviation.x += esophoria / 20;
        if (exophoria > 0) rightDeviation.x -= exophoria / 20;
        if (hyperphoria > 0) rightDeviation.y += hyperphoria / 20;
        if (hypophoria > 0) rightDeviation.y -= hypophoria / 20;
      }
    }

    return {
      left: {
        x: eyePosition.left.x + leftDeviation.x,
        y: eyePosition.left.y + leftDeviation.y,
      },
      right: {
        x: eyePosition.right.x + rightDeviation.x,
        y: eyePosition.right.y + rightDeviation.y,
      },
    };
  };

  const effectivePositions = calculateEyePositions();
  
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['#f0f0f0']} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 10, 10]} intensity={0.5} />
        
        <group position={[0, 0, 0]}>
          {/* Face Background */}
          <mesh position={[0, 0, -1]} rotation={[0, 0, 0]}>
            <planeGeometry args={[7, 5]} />
            <meshStandardMaterial color="#e0d2c5" />
          </mesh>
          
          {/* Left Eye */}
          <Eye
            side="left"
            position={[-1.75, 0, 0]}
            pupilSize={pupilSize.left}
            irisColor={irisColor.left}
            lookAt={effectivePositions.left}
            isDominant={dominantEye === 'left'}
            isOccluded={occluderPosition === 'left'}
          />
          
          {/* Right Eye */}
          <Eye
            side="right"
            position={[1.75, 0, 0]}
            pupilSize={pupilSize.right}
            irisColor={irisColor.right}
            lookAt={effectivePositions.right}
            isDominant={dominantEye === 'right'}
            isOccluded={occluderPosition === 'right'}
          />

          {/* Add occluder if active */}
          {activeTool === 'occluder' && occluderPosition && (
            <mesh
              position={[
                occluderPosition === 'left' ? -1.75 : 1.75,
                0,
                1.5
              ]}
            >
              <planeGeometry args={[2, 2]} />
              <meshStandardMaterial 
                color="#333333" 
                opacity={0.8} 
                transparent={true} 
              />
            </mesh>
          )}
        </group>
        
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

export default EyePairCanvas; 