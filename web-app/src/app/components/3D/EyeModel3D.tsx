import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';
import useEyeStore from '../../store/useEyeStore';
import type { EyeSide } from '../../store/useEyeStore';

// Eye component that will be instanced for both left and right eyes
const Eye = ({ side, position = [0, 0, 0] }: { side: EyeSide; position?: [number, number, number] }) => {
  const {
    pupilSize,
    irisColor,
    irisTexture: irisTextureType,
    irisPatternIntensity,
    eyeSize,
    irisPosition,
    pupilPosition,
    pathologyType,
    pathologyIntensity,
    tearFilmVisible,
    tearFilmIntensity,
    eyelidPosition,
  } = useEyeStore();

  // References for animations
  const eyeRef = useRef<THREE.Group>(null);
  const irisRef = useRef<THREE.Mesh>(null);
  const pupilRef = useRef<THREE.Mesh>(null);
  const scleraRef = useRef<THREE.Mesh>(null);
  const tearFilmRef = useRef<THREE.Mesh>(null);
  const upperEyelidRef = useRef<THREE.Mesh>(null);
  const lowerEyelidRef = useRef<THREE.Mesh>(null);

  // Scale factors
  const currentEyeSize = eyeSize[side];
  const eyeBaseRadius = 1.0 * currentEyeSize;
  const irisBaseRadius = 0.4 * currentEyeSize;
  const currentPupilSize = pupilSize[side];
  const pupilBaseRadius = (0.2 * currentPupilSize / 5) * currentEyeSize;

  // Handle eyelid animation
  useEffect(() => {
    if (upperEyelidRef.current && lowerEyelidRef.current) {
      const openAmount = eyelidPosition[side];
      
      // Position eyelids
      upperEyelidRef.current.position.y = 0.5 + (1 - openAmount) * 0.5;
      lowerEyelidRef.current.position.y = -0.5 - (1 - openAmount) * 0.5;
    }
  }, [eyelidPosition, side]);

  // Handle iris and pupil movement
  useEffect(() => {
    if (irisRef.current && pupilRef.current) {
      // Apply iris position
      const irisPos = irisPosition[side];
      irisRef.current.position.x = irisPos.x * 0.5;
      irisRef.current.position.y = irisPos.y * 0.5;
      
      // Apply pupil position
      const pupilPos = pupilPosition[side];
      pupilRef.current.position.x = irisPos.x * 0.5 + (pupilPos.x - irisPos.x) * 0.2;
      pupilRef.current.position.y = irisPos.y * 0.5 + (pupilPos.y - irisPos.y) * 0.2;
    }
  }, [irisPosition, pupilPosition, side]);

  // Apply pathology effects
  useEffect(() => {
    if (scleraRef.current) {
      const pathology = pathologyType[side];
      const intensity = pathologyIntensity[side];
      
      // Default sclera color is white
      let scleraColor = new THREE.Color(1, 1, 1);
      
      switch(pathology) {
        case 'conjunctivitis':
          // Reddish sclera for conjunctivitis
          scleraColor = new THREE.Color(1, 1 - intensity * 0.6, 1 - intensity * 0.6);
          break;
        case 'jaundice':
          // Yellowish sclera for jaundice
          scleraColor = new THREE.Color(1, 1, 1 - intensity * 0.7);
          break;
        case 'subconjunctival_hemorrhage':
          // Reddish patches for hemorrhage
          scleraColor = new THREE.Color(1 - intensity * 0.7, 1 - intensity * 0.8, 1 - intensity * 0.8);
          break;
        case 'arcus':
          // Arcus senilis is hard to show with just a color
          // Would need custom shader or texture
          scleraColor = new THREE.Color(1, 1, 1);
          break;
        case 'cataract':
          // Cataracts affect the lens/pupil, not the sclera
          // We'll handle this in the pupil material
          scleraColor = new THREE.Color(1, 1, 1);
          break;
        default:
          scleraColor = new THREE.Color(1, 1, 1);
      }
      
      if (scleraRef.current.material instanceof THREE.MeshStandardMaterial) {
        scleraRef.current.material.color = scleraColor;
      }
    }
    
    // Apply cataract effect to pupil if needed
    if (pupilRef.current && pathologyType[side] === 'cataract') {
      const intensity = pathologyIntensity[side];
      if (pupilRef.current.material instanceof THREE.MeshStandardMaterial) {
        // Make pupil more gray/cloudy for cataracts
        const catColor = new THREE.Color(0.2 + intensity * 0.6, 0.2 + intensity * 0.6, 0.2 + intensity * 0.6);
        pupilRef.current.material.color = catColor;
        pupilRef.current.material.roughness = 0.7 + intensity * 0.3;
      }
    } else if (pupilRef.current) {
      // Reset to black pupil
      if (pupilRef.current.material instanceof THREE.MeshStandardMaterial) {
        pupilRef.current.material.color = new THREE.Color(0, 0, 0);
        pupilRef.current.material.roughness = 0.2;
      }
    }
  }, [pathologyType, pathologyIntensity, side]);

  // Handle tear film visibility
  useEffect(() => {
    if (tearFilmRef.current) {
      tearFilmRef.current.visible = tearFilmVisible[side];
      
      if (tearFilmRef.current.material instanceof THREE.MeshStandardMaterial) {
        tearFilmRef.current.material.opacity = 0.2 + tearFilmIntensity[side] * 0.5;
      }
    }
  }, [tearFilmVisible, tearFilmIntensity, side]);

  // Animation for subtle movements and blinking
  useFrame((state) => {
    if (eyeRef.current) {
      // Add subtle sway/movement to the eye
      eyeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      eyeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
    }
  });

  // Generate a procedural texture for the iris instead of loading external images
  const generateIrisTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    // Clear canvas
    context.fillStyle = irisColor[side];
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw radial lines for texture
    context.strokeStyle = 'rgba(0,0,0,0.6)';
    context.lineWidth = 1;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;
    
    // Generate pattern based on type
    if (irisTextureType[side] === 'radial' || irisTextureType[side] === 'solid') {
      // Draw radial lines
      const lineCount = 60;
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        context.beginPath();
        context.moveTo(centerX, centerY);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        context.lineTo(x, y);
        context.stroke();
      }
      
      // Add concentric circles
      for (let r = radius; r > 10; r -= 15) {
        context.beginPath();
        context.arc(centerX, centerY, r, 0, Math.PI * 2);
        context.stroke();
      }
    } 
    else if (irisTextureType[side] === 'starburst') {
      // Create a starburst pattern with more random elements
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = 30 + Math.random() * (radius - 30);
        const width = 5 + Math.random() * 15;
        
        context.beginPath();
        context.moveTo(centerX, centerY);
        const x = centerX + Math.cos(angle) * length;
        const y = centerY + Math.sin(angle) * length;
        context.lineTo(x, y);
        context.lineWidth = width;
        context.stroke();
      }
    }

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  };

  // Create a texture for the iris
  const irisTexture = generateIrisTexture();

  return (
    <group ref={eyeRef} position={position} rotation={[0, side === 'left' ? 0.3 : -0.3, 0]}>
      {/* Sclera (white part of eye) */}
      <mesh ref={scleraRef} scale={[1.1 * eyeBaseRadius, 1 * eyeBaseRadius, 1 * eyeBaseRadius]}>
        <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial 
          color="white" 
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Iris */}
      <mesh 
        ref={irisRef} 
        position={[0, 0, eyeBaseRadius * 0.87]} 
        rotation={[0, 0, 0]}
      >
        <circleGeometry args={[irisBaseRadius, 32]} />
        <meshStandardMaterial 
          color={irisColor[side]}
          roughness={0.5}
          metalness={0.2}
          map={irisTexture}
          transparent
          opacity={irisPatternIntensity[side]}
        />
      </mesh>

      {/* Pupil */}
      <mesh 
        ref={pupilRef}
        position={[0, 0, eyeBaseRadius * 0.88]} 
      >
        <circleGeometry args={[pupilBaseRadius, 32]} />
        <meshStandardMaterial color="black" roughness={0.2} metalness={0.2} />
      </mesh>

      {/* Tear film (transparent layer on top) */}
      <mesh 
        ref={tearFilmRef}
        position={[0, 0, eyeBaseRadius * 0.9]}
        visible={tearFilmVisible[side]}
      >
        <sphereGeometry args={[eyeBaseRadius * 1.05, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial 
          color="#8CBED6"
          transparent
          opacity={0.3}
          roughness={0}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Upper eyelid */}
      <mesh 
        ref={upperEyelidRef}
        position={[0, 0.5, 0]}
        rotation={[Math.PI * 0.1, 0, 0]}
      >
        <boxGeometry args={[2.5 * eyeBaseRadius, 1 * eyeBaseRadius, 2 * eyeBaseRadius]} />
        <meshStandardMaterial color="#FFD3B5" roughness={0.6} />
      </mesh>

      {/* Lower eyelid */}
      <mesh 
        ref={lowerEyelidRef}
        position={[0, -0.5, 0]}
        rotation={[-Math.PI * 0.1, 0, 0]}
      >
        <boxGeometry args={[2.5 * eyeBaseRadius, 1 * eyeBaseRadius, 2 * eyeBaseRadius]} />
        <meshStandardMaterial color="#FFD3B5" roughness={0.6} />
      </mesh>
    </group>
  );
};

// Main component for 3D eye visualization
const EyeModel3D = () => {
  const [hasError, setHasError] = useState(false);
  
  // Error boundary for Canvas
  const handleError = () => {
    setHasError(true);
    console.error("An error occurred in the 3D rendering");
  };
  
  if (hasError) {
    return (
      <div style={{ 
        width: '100%', 
        height: '600px', 
        background: '#f0f0f0', 
        borderRadius: '8px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h3>3D View Unavailable</h3>
        <p>There was a problem loading the 3D model. Please try switching back to 2D view.</p>
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', height: '600px', background: '#f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }} onError={handleError}>
        <ambientLight intensity={0.8} />
        <spotLight position={[5, 5, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />
        <Center>
          <Eye side="left" position={[-1.5, 0, 0]} />
          <Eye side="right" position={[1.5, 0, 0]} />
        </Center>
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={20}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
};

export default EyeModel3D; 