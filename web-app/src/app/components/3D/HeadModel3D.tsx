import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import useEyeStore from '../../store/useEyeStore';
import type { EyeSide } from '../../store/useEyeStore';

// Create a realistic 3D head with detailed eyes - all programmatically generated
const HeadModel = () => {
  const headRef = useRef<THREE.Group>(null);
  
  // References for eye components
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftIrisRef = useRef<THREE.Mesh>(null);
  const rightIrisRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftEyelidUpperRef = useRef<THREE.Mesh>(null);
  const rightEyelidUpperRef = useRef<THREE.Mesh>(null);
  const leftEyelidLowerRef = useRef<THREE.Mesh>(null);
  const rightEyelidLowerRef = useRef<THREE.Mesh>(null);
  const leftTearFilmRef = useRef<THREE.Mesh>(null);
  const rightTearFilmRef = useRef<THREE.Mesh>(null);
  const leftEyeGroupRef = useRef<THREE.Group>(null);
  const rightEyeGroupRef = useRef<THREE.Group>(null);
  
  const {
    pupilSize,
    irisColor,
    irisTexture: irisTextureType,
    irisPatternIntensity,
    irisPosition,
    pupilPosition,
    pathologyType,
    pathologyIntensity,
    eyelidPosition,
    tearFilmVisible,
    tearFilmIntensity,
    // Eye deviation parameters
    esotropia,
    exotropia,
    hypertropia,
    hypotropia,
    // Phoria parameters
    esophoria,
    exophoria,
    hyperphoria,
    hypophoria,
    // Testing tools
    occluderPosition,
  } = useEyeStore();

  // Helper function to generate a procedural iris texture
  const generateIrisTexture = (side: EyeSide) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; // Higher resolution texture
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    // Clear canvas with iris base color
    context.fillStyle = irisColor[side];
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;
    
    // Create radial gradient for more realistic iris depth
    const gradient = context.createRadialGradient(
      centerX, centerY, radius * 0.3, // Inner circle
      centerX, centerY, radius * 0.9  // Outer circle
    );
    
    // Extract color components for gradient
    const baseColor = irisColor[side];
    const darkerColor = adjustColorBrightness(baseColor, -30);
    const lighterColor = adjustColorBrightness(baseColor, 20);
    
    gradient.addColorStop(0, lighterColor);
    gradient.addColorStop(0.7, baseColor);
    gradient.addColorStop(1, darkerColor);
    
    // Apply gradient
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
    context.fill();
    
    // Create pupil edge darkening
    const innerGradient = context.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius * 0.4
    );
    innerGradient.addColorStop(0, darkerColor);
    innerGradient.addColorStop(1, 'transparent');
    
    context.globalAlpha = 0.4;
    context.fillStyle = innerGradient;
    context.beginPath();
    context.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1.0;
    
    context.strokeStyle = 'rgba(0,0,0,0.7)';
    
    // Generate pattern based on type
    if (irisTextureType[side] === 'radial' || irisTextureType[side] === 'solid') {
      // Draw radial lines
      const lineCount = 80; // More lines for more detail
      context.lineWidth = 1;
      
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const innerRadius = radius * 0.3; // Start from pupil edge
        const outerRadius = radius * 0.9; // End at iris edge
        
        context.beginPath();
        context.moveTo(
          centerX + Math.cos(angle) * innerRadius,
          centerY + Math.sin(angle) * innerRadius
        );
        
        // Add slight curve to the lines for realism
        const midAngle = angle + (Math.random() * 0.05 - 0.025);
        const midRadius = (innerRadius + outerRadius) / 2;
        const ctrlX = centerX + Math.cos(midAngle) * midRadius;
        const ctrlY = centerY + Math.sin(midAngle) * midRadius;
        
        context.quadraticCurveTo(
          ctrlX, ctrlY,
          centerX + Math.cos(angle) * outerRadius,
          centerY + Math.sin(angle) * outerRadius
        );
        
        context.globalAlpha = 0.3 + Math.random() * 0.3;
        context.stroke();
        context.globalAlpha = 1.0;
      }
      
      // Add concentric circles
      context.globalAlpha = 0.3;
      for (let r = radius * 0.9; r > radius * 0.3; r -= radius * 0.1) {
        context.beginPath();
        context.arc(centerX, centerY, r, 0, Math.PI * 2);
        context.lineWidth = 1 + Math.random() * 1.5;
        context.stroke();
      }
      context.globalAlpha = 1.0;
    } 
    else if (irisTextureType[side] === 'starburst') {
      // Create a starburst pattern
      for (let i = 0; i < 30; i++) { // More patterns
        const angle = Math.random() * Math.PI * 2;
        const innerRadius = radius * 0.3;
        const outerRadius = radius * (0.7 + Math.random() * 0.2);
        const width = 2 + Math.random() * 5;
        
        context.beginPath();
        context.moveTo(
          centerX + Math.cos(angle) * innerRadius,
          centerY + Math.sin(angle) * innerRadius
        );
        context.lineTo(
          centerX + Math.cos(angle) * outerRadius,
          centerY + Math.sin(angle) * outerRadius
        );
        context.lineWidth = width;
        context.globalAlpha = 0.2 + Math.random() * 0.4;
        context.stroke();
      }
      context.globalAlpha = 1.0;
    }

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  };

  // Helper function to adjust color brightness
  const adjustColorBrightness = (hexColor: string, amount: number): string => {
    // Convert hex to RGB
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Adjust brightness
    const adjustedR = Math.max(0, Math.min(255, r + amount));
    const adjustedG = Math.max(0, Math.min(255, g + amount));
    const adjustedB = Math.max(0, Math.min(255, b + amount));

    // Convert back to hex
    return `#${adjustedR.toString(16).padStart(2, '0')}${
      adjustedG.toString(16).padStart(2, '0')}${
      adjustedB.toString(16).padStart(2, '0')}`;
  };

  // Update iris textures when colors or patterns change
  useEffect(() => {
    if (leftIrisRef.current && rightIrisRef.current) {
      const leftTexture = generateIrisTexture('left');
      const rightTexture = generateIrisTexture('right');
      
      if (leftIrisRef.current.material instanceof THREE.MeshStandardMaterial && leftTexture) {
        leftIrisRef.current.material.map = leftTexture;
        leftIrisRef.current.material.color = new THREE.Color(irisColor.left);
        leftIrisRef.current.material.opacity = irisPatternIntensity.left;
        leftIrisRef.current.material.transparent = true;
      }
      
      if (rightIrisRef.current.material instanceof THREE.MeshStandardMaterial && rightTexture) {
        rightIrisRef.current.material.map = rightTexture;
        rightIrisRef.current.material.color = new THREE.Color(irisColor.right);
        rightIrisRef.current.material.opacity = irisPatternIntensity.right;
        rightIrisRef.current.material.transparent = true;
      }
    }
  }, [irisColor, irisTextureType, irisPatternIntensity]);

  // Update pupil size
  useEffect(() => {
    if (leftPupilRef.current && rightPupilRef.current) {
      const leftPupilSize = pupilSize.left / 5; // Normalized pupil size
      const rightPupilSize = pupilSize.right / 5;
      
      leftPupilRef.current.scale.set(leftPupilSize, leftPupilSize, 1);
      rightPupilRef.current.scale.set(rightPupilSize, rightPupilSize, 1);
    }
  }, [pupilSize]);

  // Apply pathology effects
  useEffect(() => {
    if (leftEyeRef.current && rightEyeRef.current) {
      // Apply pathology to left eye
      if (leftEyeRef.current.material instanceof THREE.MeshStandardMaterial) {
        const pathology = pathologyType.left;
        const intensity = pathologyIntensity.left;
        
        let scleraColor = new THREE.Color(1, 1, 1); // Default white
        
        switch(pathology) {
          case 'conjunctivitis':
            scleraColor = new THREE.Color(1, 1 - intensity * 0.6, 1 - intensity * 0.6);
            break;
          case 'jaundice':
            scleraColor = new THREE.Color(1, 1, 1 - intensity * 0.7);
            break;
          case 'subconjunctival_hemorrhage':
            scleraColor = new THREE.Color(1 - intensity * 0.7, 1 - intensity * 0.8, 1 - intensity * 0.8);
            break;
          default:
            scleraColor = new THREE.Color(1, 1, 1);
        }
        
        leftEyeRef.current.material.color = scleraColor;
      }
      
      // Apply pathology to right eye
      if (rightEyeRef.current.material instanceof THREE.MeshStandardMaterial) {
        const pathology = pathologyType.right;
        const intensity = pathologyIntensity.right;
        
        let scleraColor = new THREE.Color(1, 1, 1); // Default white
        
        switch(pathology) {
          case 'conjunctivitis':
            scleraColor = new THREE.Color(1, 1 - intensity * 0.6, 1 - intensity * 0.6);
            break;
          case 'jaundice':
            scleraColor = new THREE.Color(1, 1, 1 - intensity * 0.7);
            break;
          case 'subconjunctival_hemorrhage':
            scleraColor = new THREE.Color(1 - intensity * 0.7, 1 - intensity * 0.8, 1 - intensity * 0.8);
            break;
          default:
            scleraColor = new THREE.Color(1, 1, 1);
        }
        
        rightEyeRef.current.material.color = scleraColor;
      }
      
      // Handle cataracts separately for pupils
      if (leftPupilRef.current && pathologyType.left === 'cataract') {
        const intensity = pathologyIntensity.left;
        if (leftPupilRef.current.material instanceof THREE.MeshStandardMaterial) {
          const catColor = new THREE.Color(0.2 + intensity * 0.6, 0.2 + intensity * 0.6, 0.2 + intensity * 0.6);
          leftPupilRef.current.material.color = catColor;
          leftPupilRef.current.material.roughness = 0.7 + intensity * 0.3;
        }
      } else if (leftPupilRef.current && leftPupilRef.current.material instanceof THREE.MeshStandardMaterial) {
        leftPupilRef.current.material.color = new THREE.Color(0, 0, 0);
        leftPupilRef.current.material.roughness = 0.2;
      }
      
      if (rightPupilRef.current && pathologyType.right === 'cataract') {
        const intensity = pathologyIntensity.right;
        if (rightPupilRef.current.material instanceof THREE.MeshStandardMaterial) {
          const catColor = new THREE.Color(0.2 + intensity * 0.6, 0.2 + intensity * 0.6, 0.2 + intensity * 0.6);
          rightPupilRef.current.material.color = catColor;
          rightPupilRef.current.material.roughness = 0.7 + intensity * 0.3;
        }
      } else if (rightPupilRef.current && rightPupilRef.current.material instanceof THREE.MeshStandardMaterial) {
        rightPupilRef.current.material.color = new THREE.Color(0, 0, 0);
        rightPupilRef.current.material.roughness = 0.2;
      }
    }
  }, [pathologyType, pathologyIntensity]);
  
  // Update iris and pupil positions
  useEffect(() => {
    if (leftIrisRef.current && rightIrisRef.current && leftPupilRef.current && rightPupilRef.current) {
      // Left eye
      const leftIrisPos = irisPosition.left;
      leftIrisRef.current.position.x = leftIrisPos.x * 0.15;
      leftIrisRef.current.position.y = leftIrisPos.y * 0.1;
      
      // Right eye
      const rightIrisPos = irisPosition.right;
      rightIrisRef.current.position.x = rightIrisPos.x * 0.15;
      rightIrisRef.current.position.y = rightIrisPos.y * 0.1;
      
      // Pupils
      const leftPupilPos = pupilPosition.left;
      leftPupilRef.current.position.x = leftIrisPos.x * 0.15 + (leftPupilPos.x - leftIrisPos.x) * 0.02;
      leftPupilRef.current.position.y = leftIrisPos.y * 0.1 + (leftPupilPos.y - leftIrisPos.y) * 0.02;
      
      const rightPupilPos = pupilPosition.right;
      rightPupilRef.current.position.x = rightIrisPos.x * 0.15 + (rightPupilPos.x - rightIrisPos.x) * 0.02;
      rightPupilRef.current.position.y = rightIrisPos.y * 0.1 + (rightPupilPos.y - rightIrisPos.y) * 0.02;
    }
  }, [irisPosition, pupilPosition]);
  
  // Update eyelid position
  useEffect(() => {
    if (leftEyelidUpperRef.current && rightEyelidUpperRef.current && leftEyelidLowerRef.current && rightEyelidLowerRef.current) {
      // Left eyelids
      const leftOpenAmount = eyelidPosition.left;
      leftEyelidUpperRef.current.position.y = 0.2 + (1 - leftOpenAmount) * 0.15;
      leftEyelidLowerRef.current.position.y = -0.2 - (1 - leftOpenAmount) * 0.15;
      
      // Right eyelids
      const rightOpenAmount = eyelidPosition.right;
      rightEyelidUpperRef.current.position.y = 0.2 + (1 - rightOpenAmount) * 0.15;
      rightEyelidLowerRef.current.position.y = -0.2 - (1 - rightOpenAmount) * 0.15;
    }
  }, [eyelidPosition]);

  // Update tear film visibility and intensity
  useEffect(() => {
    if (leftTearFilmRef.current && rightTearFilmRef.current) {
      // Update left tear film
      leftTearFilmRef.current.visible = tearFilmVisible.left;
      if (leftTearFilmRef.current.material instanceof THREE.MeshStandardMaterial) {
        leftTearFilmRef.current.material.opacity = 0.2 + tearFilmIntensity.left * 0.5;
      }
      
      // Update right tear film
      rightTearFilmRef.current.visible = tearFilmVisible.right;
      if (rightTearFilmRef.current.material instanceof THREE.MeshStandardMaterial) {
        rightTearFilmRef.current.material.opacity = 0.2 + tearFilmIntensity.right * 0.5;
      }
    }
  }, [tearFilmVisible, tearFilmIntensity]);

  // Apply eye deviations and phorias
  useEffect(() => {
    if (leftEyeGroupRef.current && rightEyeGroupRef.current) {
      // Reset positions first
      leftEyeGroupRef.current.position.set(-0.35, 0.3, 0.85);
      rightEyeGroupRef.current.position.set(0.35, 0.3, 0.85);
      
      // Scale factor to convert prismatic diopters to 3D space (adjust as needed)
      const deviationScale = 0.005;
      
      // Apply manifest deviations (tropias) to both eyes
      
      // Left eye horizontal deviations
      const leftXOffset = (esotropia * deviationScale) - (exotropia * deviationScale);
      leftEyeGroupRef.current.position.x += leftXOffset;
      
      // Left eye vertical deviations
      const leftYOffset = -(hypertropia * deviationScale) + (hypotropia * deviationScale);
      leftEyeGroupRef.current.position.y += leftYOffset;
      
      // Right eye horizontal deviations
      const rightXOffset = -(esotropia * deviationScale) + (exotropia * deviationScale);
      rightEyeGroupRef.current.position.x += rightXOffset;
      
      // Right eye vertical deviations
      const rightYOffset = -(hypertropia * deviationScale) + (hypotropia * deviationScale);
      rightEyeGroupRef.current.position.y += rightYOffset;
      
      // Apply latent deviations (phorias) only when the eye is covered
      
      // Left eye phorias - only apply when left eye is occluded
      if (occluderPosition === 'left') {
        const leftPhoriaX = (esophoria * deviationScale) - (exophoria * deviationScale);
        const leftPhoriaY = -(hyperphoria * deviationScale) + (hypophoria * deviationScale);
        
        leftEyeGroupRef.current.position.x += leftPhoriaX;
        leftEyeGroupRef.current.position.y += leftPhoriaY;
      }
      
      // Right eye phorias - only apply when right eye is occluded
      if (occluderPosition === 'right') {
        const rightPhoriaX = -(esophoria * deviationScale) + (exophoria * deviationScale);
        const rightPhoriaY = -(hyperphoria * deviationScale) + (hypophoria * deviationScale);
        
        rightEyeGroupRef.current.position.x += rightPhoriaX;
        rightEyeGroupRef.current.position.y += rightPhoriaY;
      }
    }
  }, [
    esotropia, exotropia, hypertropia, hypotropia,
    esophoria, exophoria, hyperphoria, hypophoria,
    occluderPosition
  ]);

  // Animation for subtle head movements
  useFrame((state) => {
    if (headRef.current) {
      // Add subtle sway/movement to the head
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }
  });

  return (
    <group ref={headRef}>
      {/* Head */}
      <mesh position={[0, 0, -0.5]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#f8d5c2" />
      </mesh>
      
      {/* Face */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#f8d5c2" />
      </mesh>
      
      {/* Eye socket - left */}
      <mesh position={[-0.35, 0.3, 0.8]}>
        <sphereGeometry args={[0.25, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#e8c5b2" side={THREE.BackSide} />
      </mesh>
      
      {/* Eye socket - right */}
      <mesh position={[0.35, 0.3, 0.8]}>
        <sphereGeometry args={[0.25, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#e8c5b2" side={THREE.BackSide} />
      </mesh>
      
      {/* Left eye */}
      <group ref={leftEyeGroupRef} position={[-0.35, 0.3, 0.85]}>
        {/* Sclera (white of eye) */}
        <mesh ref={leftEyeRef}>
          <sphereGeometry args={[0.2, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="white" roughness={0.1} metalness={0.1} />
        </mesh>
        
        {/* Iris - with slight depth effect using a ring geometry */}
        <group position={[0, 0, 0.19]}>
          <mesh ref={leftIrisRef}>
            <circleGeometry args={[0.1, 64]} />
            <meshStandardMaterial 
              color={irisColor.left}
              roughness={0.5}
              metalness={0.3}
              transparent={true}
              emissive={new THREE.Color(irisColor.left).multiplyScalar(0.2)}
            />
          </mesh>
          {/* Subtle iris 3D rim to give depth */}
          <mesh position={[0, 0, -0.001]}>
            <ringGeometry args={[0.09, 0.1, 64]} />
            <meshStandardMaterial 
              color={adjustColorBrightness(irisColor.left, -40)}
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>
        </group>
        
        {/* Pupil */}
        <mesh ref={leftPupilRef} position={[0, 0, 0.195]}>
          <circleGeometry args={[0.05 * (pupilSize.left / 3), 64]} />
          <meshStandardMaterial color="black" roughness={0.2} />
        </mesh>
        
        {/* Eye highlight */}
        <mesh position={[0.025, 0.025, 0.2]}>
          <circleGeometry args={[0.015, 16]} />
          <meshBasicMaterial color="white" transparent={true} opacity={0.85} />
        </mesh>
        
        {/* Tear film */}
        <mesh 
          ref={leftTearFilmRef}
          position={[0, 0, 0.2]}
          visible={tearFilmVisible.left}
        >
          <sphereGeometry args={[0.21, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial 
            color="#8CBED6"
            transparent={true}
            opacity={0.3}
            roughness={0}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Upper eyelid */}
        <mesh 
          ref={leftEyelidUpperRef}
          position={[0, 0.2, 0.05]}
          rotation={[Math.PI * 0.08, 0, 0]}
        >
          <boxGeometry args={[0.3, 0.2, 0.2]} />
          <meshStandardMaterial color="#f0d0c0" />
        </mesh>
        
        {/* Lower eyelid */}
        <mesh 
          ref={leftEyelidLowerRef}
          position={[0, -0.2, 0.05]}
          rotation={[-Math.PI * 0.08, 0, 0]}
        >
          <boxGeometry args={[0.3, 0.2, 0.2]} />
          <meshStandardMaterial color="#f0d0c0" />
        </mesh>
        
        {/* Occluder for left eye */}
        {occluderPosition === 'left' && (
          <mesh position={[0, 0, 0.25]} rotation={[0, 0, 0]}>
            <circleGeometry args={[0.25, 32]} />
            <meshStandardMaterial color="#333" opacity={0.8} transparent={true} />
          </mesh>
        )}
      </group>
      
      {/* Right eye */}
      <group ref={rightEyeGroupRef} position={[0.35, 0.3, 0.85]}>
        {/* Sclera (white of eye) */}
        <mesh ref={rightEyeRef}>
          <sphereGeometry args={[0.2, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="white" roughness={0.1} metalness={0.1} />
        </mesh>
        
        {/* Iris - with slight depth effect using a ring geometry */}
        <group position={[0, 0, 0.19]}>
          <mesh ref={rightIrisRef}>
            <circleGeometry args={[0.1, 64]} />
            <meshStandardMaterial 
              color={irisColor.right}
              roughness={0.5}
              metalness={0.3}
              transparent={true}
              emissive={new THREE.Color(irisColor.right).multiplyScalar(0.2)}
            />
          </mesh>
          {/* Subtle iris 3D rim to give depth */}
          <mesh position={[0, 0, -0.001]}>
            <ringGeometry args={[0.09, 0.1, 64]} />
            <meshStandardMaterial 
              color={adjustColorBrightness(irisColor.right, -40)}
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>
        </group>
        
        {/* Pupil */}
        <mesh ref={rightPupilRef} position={[0, 0, 0.195]}>
          <circleGeometry args={[0.05 * (pupilSize.right / 3), 64]} />
          <meshStandardMaterial color="black" roughness={0.2} />
        </mesh>
        
        {/* Eye highlight */}
        <mesh position={[-0.025, 0.025, 0.2]}>
          <circleGeometry args={[0.015, 16]} />
          <meshBasicMaterial color="white" transparent={true} opacity={0.85} />
        </mesh>
        
        {/* Tear film */}
        <mesh 
          ref={rightTearFilmRef}
          position={[0, 0, 0.2]}
          visible={tearFilmVisible.right}
        >
          <sphereGeometry args={[0.21, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial 
            color="#8CBED6"
            transparent={true}
            opacity={0.3}
            roughness={0}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Upper eyelid */}
        <mesh 
          ref={rightEyelidUpperRef}
          position={[0, 0.2, 0.05]}
          rotation={[Math.PI * 0.08, 0, 0]}
        >
          <boxGeometry args={[0.3, 0.2, 0.2]} />
          <meshStandardMaterial color="#f0d0c0" />
        </mesh>
        
        {/* Lower eyelid */}
        <mesh 
          ref={rightEyelidLowerRef}
          position={[0, -0.2, 0.05]}
          rotation={[-Math.PI * 0.08, 0, 0]}
        >
          <boxGeometry args={[0.3, 0.2, 0.2]} />
          <meshStandardMaterial color="#f0d0c0" />
        </mesh>
        
        {/* Occluder for right eye */}
        {occluderPosition === 'right' && (
          <mesh position={[0, 0, 0.25]} rotation={[0, 0, 0]}>
            <circleGeometry args={[0.25, 32]} />
            <meshStandardMaterial color="#333" opacity={0.8} transparent={true} />
          </mesh>
        )}
      </group>
      
      {/* Nose */}
      <mesh position={[0, 0, 1]}>
        <coneGeometry args={[0.2, 0.4, 32, 1, false]} />
        <meshStandardMaterial color="#f0d0c0" />
      </mesh>
      
      {/* Mouth */}
      <mesh position={[0, -0.3, 0.9]} rotation={[Math.PI * 0.1, 0, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#d58e84" />
      </mesh>
    </group>
  );
};

const HeadModel3D = () => {
  const [hasError, setHasError] = useState(false);
  
  // Error boundary for model
  const handleError = () => {
    setHasError(true);
    console.error("An error occurred in the 3D head rendering");
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
        <p>There was a problem loading the 3D head model. Please try switching back to 2D view.</p>
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', height: '600px', background: '#f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: [0, 0.3, 3.8], fov: 40 }} onError={handleError}>
        <ambientLight intensity={1.0} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={1.2} castShadow />
        <spotLight position={[0, 0, 8]} angle={0.2} penumbra={0.5} intensity={0.8} distance={10} />
        <HeadModel />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          target={[0, 0.3, 0]}
        />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
};

export default HeadModel3D; 