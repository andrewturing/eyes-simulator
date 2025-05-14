import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EyeSide } from '../store/useEyeStore';

interface EyeProps {
  side: EyeSide;
  position: [number, number, number];
  rotation?: [number, number, number];
  pupilSize: number;
  irisColor: string;
  lookAt?: { x: number; y: number };
  isDominant?: boolean;
  isOccluded?: boolean;
}

export function Eye({
  side,
  position,
  rotation = [0, 0, 0],
  pupilSize,
  irisColor,
  lookAt = { x: 0, y: 0 },
  isDominant = false,
  isOccluded = false,
}: EyeProps) {
  const eyeRef = useRef<THREE.Group>(null);
  const irisRef = useRef<THREE.Mesh>(null);
  const pupilRef = useRef<THREE.Mesh>(null);
  const scleraRef = useRef<THREE.Mesh>(null);

  // Calculate pupil and iris sizes
  const irisRadius = 0.5;
  const pupilRadius = (pupilSize / 10) * irisRadius; // Normalize to a 0-10 scale
  const eyeRadius = 1.0;

  // Create materials
  const irisMaterial = useRef(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(irisColor),
      roughness: 0.3,
      metalness: 0.1,
    })
  );

  const pupilMaterial = useRef(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#000000'),
      roughness: 0.2,
      metalness: 0,
    })
  );

  // Update iris color when prop changes
  useEffect(() => {
    if (irisMaterial.current) {
      irisMaterial.current.color = new THREE.Color(irisColor);
    }
  }, [irisColor]);

  // Update pupil size when prop changes
  useEffect(() => {
    if (pupilRef.current) {
      pupilRef.current.scale.set(pupilSize / 5, pupilSize / 5, 1);
    }
  }, [pupilSize]);

  // Animate eye to look at target
  useFrame(() => {
    if (!eyeRef.current || isOccluded) return;

    // Calculate rotation to look at target
    const maxRotation = 0.35; // Limit eye rotation
    
    // Apply eye deviation based on lookAt props
    const targetX = THREE.MathUtils.clamp(lookAt.x, -1, 1) * maxRotation;
    const targetY = THREE.MathUtils.clamp(lookAt.y, -1, 1) * maxRotation;
    
    // Smooth eye movement
    if (irisRef.current && pupilRef.current) {
      irisRef.current.rotation.y = THREE.MathUtils.lerp(
        irisRef.current.rotation.y,
        targetX,
        0.1
      );
      irisRef.current.rotation.x = THREE.MathUtils.lerp(
        irisRef.current.rotation.x,
        targetY,
        0.1
      );
      
      pupilRef.current.rotation.y = irisRef.current.rotation.y;
      pupilRef.current.rotation.x = irisRef.current.rotation.x;
    }
  });

  return (
    <group 
      ref={eyeRef}
      position={position}
      rotation={rotation instanceof Array ? 
        [rotation[0], rotation[1], rotation[2]] : 
        [0, 0, 0]
      }
    >
      {/* Sclera (white part of eye) */}
      <mesh ref={scleraRef} visible={!isOccluded}>
        <sphereGeometry args={[eyeRadius, 32, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.1} 
          opacity={isOccluded ? 0.3 : 1} 
          transparent={true}
        />
      </mesh>

      {/* Iris */}
      <mesh 
        ref={irisRef} 
        position={[0, 0, eyeRadius * 0.8]} 
        visible={!isOccluded}
      >
        <circleGeometry args={[irisRadius, 32]} />
        <primitive object={irisMaterial.current} />
      </mesh>

      {/* Pupil */}
      <mesh 
        ref={pupilRef} 
        position={[0, 0, eyeRadius * 0.81]} 
        visible={!isOccluded}
      >
        <circleGeometry args={[pupilRadius, 32]} />
        <primitive object={pupilMaterial.current} />
      </mesh>

      {/* Dominant eye indicator */}
      {isDominant && (
        <mesh position={[side === 'left' ? -1.2 : 1.2, 1.2, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      )}
    </group>
  );
}

export default Eye; 